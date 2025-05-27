import { TemplateValidationResult } from './types';

export async function sendValidationWebhook(result: TemplateValidationResult): Promise<'sent' | 'failed'> {
  try {
    const response = await fetch('https://webhook.site/b27c05a3-6a6d-4765-bcee-fc234c1bc1ac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    if (response.ok) {
      return 'sent';
    } else {
      return 'failed';
    }
  } catch (e) {
    return 'failed';
  }
} 