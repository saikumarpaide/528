import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import fetch from 'node-fetch';

export const catalogValidationWatcherPlugin = createBackendPlugin({
  pluginId: 'catalog-validation-watcher',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        events: eventsServiceRef,
      },
      async init({ logger, auth, events }) {
        // Subscribe to catalog events for new or updated entities
        events.subscribe({
          id: 'catalog-validation-watcher',
          topics: ['catalog.entity.created'],
          async onEvent(event: any) {
            const entity = event?.payload?.entity;
            // if (!entity || entity.kind.toLowerCase() !== 'template') {
            //   return; // Only process templates
            // }
            const ref = `${entity.kind.toLowerCase()}:${entity.metadata.namespace || 'default'}/${entity.metadata.name}`;
            try {
              const credentials = await auth.getOwnServiceCredentials();
              const token = (credentials as any).token;
              // Trigger validation via the template-validator-backend API
              const validateResponse = await fetch('http://localhost:7007/api/template-validator/validate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ entityRef: ref }),
              });
              if (validateResponse.ok) {
                logger.info(`Validated template entity: ${ref}`);
              } else {
                logger.error(`Failed to validate entity: ${ref}, status: ${validateResponse.status}`);
              }
            } catch (e) {
              logger.error(`Validation watcher error for entity ${ref}: ${e}`);
            }
          },
        });
        logger.info('Catalog validation watcher initialized and listening for catalog.entity.created events');
      },
    });
  },
});