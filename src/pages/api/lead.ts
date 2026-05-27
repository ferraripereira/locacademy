import type { APIRoute } from 'astro';

// Endpoint server-side (nao prerender)
export const prerender = false;

const CHECKOUT_BASE = 'https://pay.hotmart.com/Q105995061A';

// Envia lead para Google Sheets via Apps Script Web App.
// SHEETS_WEBHOOK_URL precisa estar definido em env vars (Vercel + .env.local).
async function gravarSheets(payload: Record<string, string>) {
  const webhookUrl = import.meta.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[lead] SHEETS_WEBHOOK_URL nao configurado - lead nao foi salvo');
    return { ok: false, reason: 'no-webhook-configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        status: 'lead_capturado',
      }),
    });
    return { ok: response.ok, status: response.status };
  } catch (err) {
    console.error('[lead] erro ao gravar Sheets:', err);
    return { ok: false, reason: 'fetch-error' };
  }
}

function montarCheckoutUrl(payload: Record<string, string>): string {
  // Hotmart aceita query params para pre-preencher nome e email no checkout
  const url = new URL(CHECKOUT_BASE);
  if (payload.email) url.searchParams.set('email', payload.email);
  if (payload.nome) url.searchParams.set('name', payload.nome);
  if (payload.telefone) url.searchParams.set('phone', payload.telefone.replace(/\D/g, ''));
  // sck = source tracking; usamos para correlacionar webhook depois
  url.searchParams.set('sck', `loc-${Date.now()}-${(payload.email || '').split('@')[0]}`);
  return url.toString();
}

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, string> = {};

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Payload invalido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Validacao minima dos campos obrigatorios
  const required = ['nome', 'email', 'telefone', 'locadora', 'cidade', 'estado', 'cargo', 'frota'];
  const missing = required.filter((field) => !payload[field]?.trim());
  if (missing.length) {
    return new Response(
      JSON.stringify({ error: 'Campos obrigatorios ausentes', missing }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Grava no Sheets (best effort - se falhar, segue o jogo e manda o lead pro checkout)
  await gravarSheets(payload);

  const checkoutUrl = montarCheckoutUrl(payload);

  // Se for fetch (JSON), retorna URL pra o client redirecionar.
  // Se for POST form tradicional, faz redirect direto.
  const acceptsJson = request.headers.get('accept')?.includes('application/json');
  if (acceptsJson) {
    return new Response(
      JSON.stringify({ ok: true, checkoutUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(null, {
    status: 303,
    headers: { Location: checkoutUrl },
  });
};

// Bloqueia metodos diferentes de POST
export const GET: APIRoute = () => new Response('Method not allowed', { status: 405 });
