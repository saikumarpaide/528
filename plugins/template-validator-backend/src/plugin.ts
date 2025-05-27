import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createTemplateValidationService } from './services/TemplateValidationService';
import { WebSocketServer } from 'ws';
import http from 'http';

export const templateValidatorPlugin = createBackendPlugin({
  pluginId: 'template-validator',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, httpRouter }) {
        // Use a dedicated HTTP server for WebSocket if coreServices.http is not available
        const server = http.createServer();
        const wss = new WebSocketServer({ server });

        // Broadcast new validation results to all connected clients
        const broadcastValidation = (result: any) => {
          wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({ type: 'validation', data: result }));
            }
          });
        };

        const validationService = await createTemplateValidationService({
          logger,
          broadcastValidation,
        });

        httpRouter.use(
          await createRouter({
            validationService,
          }),
        );

        wss.on('connection', (ws) => {
          logger.info('WebSocket client connected');
          ws.on('close', () => {
            logger.info('WebSocket client disconnected');
          });
        });

        server.listen(7008, () => {
          logger.info('WebSocket server listening on port 7008');
        });

        logger.info('Template Validator Plugin initialized with WebSocket support');
      },
    });
  },
});