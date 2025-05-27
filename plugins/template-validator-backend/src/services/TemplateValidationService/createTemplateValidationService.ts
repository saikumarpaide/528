import { LoggerService } from '@backstage/backend-plugin-api';
import { TemplateValidationService, TemplateValidationResult, TemplateValidationInput } from './types';
import { sendValidationWebhook } from './webhookSender';
import yaml from 'yaml';

export async function createTemplateValidationService({
  logger,
  broadcastValidation,
}: {
  logger: LoggerService;
  broadcastValidation?: (result: TemplateValidationResult) => void;
}): Promise<TemplateValidationService> {
  logger.info('Initializing TemplateValidationService');

  // In-memory store for validation results
  const validationResults: TemplateValidationResult[] = [];

  return {
    async validateTemplate(input: TemplateValidationInput) {
      // Declare all required variables
      let entityRef = '';
      let tags: string[] = [];
      let description = '';
      let owner = '';
      let errors: string[] = [];
      let passed = false;

      try {
        let entity: any;
        if (input.yamlContent) {
          entity = yaml.parse(input.yamlContent);
        } else if (input.entityRef) {
          // entity = await catalog.getEntityByRef(input.entityRef);
          entityRef = input.entityRef;
        }

        // Extract fields if entity is available
        if (entity) {
          entityRef = `${entity.kind.toLowerCase()}:${entity.metadata.namespace || 'default'}/${entity.metadata.name}`;
          tags = entity.metadata?.tags || [];
          description = entity.metadata?.description || '';
          owner = entity.spec?.owner || '';
        }

        // Validation logic
        if (!description) errors.push('Missing description');
        if (!owner) errors.push('Missing owner');
        if (!tags.length) errors.push('Missing tags');
        // ... add more checks as needed

        passed = errors.length === 0;
      } catch (e) {
        errors.push('YAML parsing or entity fetch failed: ' + (e as Error).message);
        passed = false;
      }

      const result: TemplateValidationResult = {
        entityRef,
        passed,
        errors,
        tags,
        description,
        owner,
        webhookStatus: 'not_sent',
      };

      validationResults.push(result);

      // Send webhook
      try {
        result.webhookStatus = await sendValidationWebhook(result);
      } catch (e) {
        result.webhookStatus = 'failed';
        logger.error('Webhook sending failed: ' + (e as Error).message);
      }

      // Broadcast to WebSocket clients if available
      if (broadcastValidation) {
        broadcastValidation(result);
      }

      return result;
    },
    async getValidations() {
      return validationResults;
    },
  };
}