export interface TemplateValidationInput {
  entityRef?: string;
  yamlContent?: string;
}

export interface TemplateValidationResult {
  entityRef: string;
  passed: boolean;
  errors: string[];
  tags: string[];
  description: string;
  owner: string;
  webhookStatus: 'sent' | 'failed' | 'not_sent';
}

export interface TemplateValidationService {
  validateTemplate(input: TemplateValidationInput): Promise<TemplateValidationResult>;
  getValidations(): Promise<TemplateValidationResult[]>;
} 