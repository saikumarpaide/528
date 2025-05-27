import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { TemplateValidationService } from './services/TemplateValidationService/types';

export async function createRouter({
  validationService,
}: {
  validationService: TemplateValidationService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // Health check endpoint
  router.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Schema for validation input
  const validationSchema = z.object({
    entityRef: z.string().optional(),
    yamlContent: z.string().optional(),
  });

  // POST /validate: Validate a template
  router.post('/validate', async (req, res) => {
    const parsed = validationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }
    const result = await validationService.validateTemplate(parsed.data);
    res.status(200).json(result);
  });

  // GET /validations: List all recent validation results
  router.get('/validations', async (_req, res) => {
    const results = await validationService.getValidations();
    res.status(200).json(results);
  });

  return router;
}
