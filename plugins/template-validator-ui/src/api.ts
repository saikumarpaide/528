const BACKEND_BASE_URL = '/api/template-validator';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer guest',
};

export async function getValidations() {
  const res = await fetch(`${BACKEND_BASE_URL}/validations`, { headers: defaultHeaders });
  if (!res.ok) throw new Error('Failed to fetch validations');
  return await res.json();
}

export async function validateTemplate({ yamlContent, entityRef }: { yamlContent?: string; entityRef?: string }) {
  const res = await fetch(`${BACKEND_BASE_URL}/validate`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ yamlContent, entityRef }),
  });
  if (!res.ok) throw new Error('Validation failed');
  return await res.json();
} 