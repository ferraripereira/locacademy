import type { APIRoute } from 'astro';

export const prerender = false;

const PAID_EVENTS = new Set(['PURCHASE_COMPLETE', 'PURCHASE_APPROVED']);
const REFUND_EVENTS = new Set([
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_CANCELED',
  'PURCHASE_EXPIRED',
]);

async function gravarSheetsOpcional(payload: Record<string, unknown>) {
  const webhookUrl = import.meta.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[HOTMART] falha ao atualizar Sheets:', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Valida HOTTOK se configurado (token compartilhado da Hotmart)
  const expectedToken = import.meta.env.HOTMART_HOTTOK;
  const receivedToken = request.headers.get('x-hotmart-hottok');
  if (expectedToken && receivedToken !== expectedToken) {
    console.warn('[HOTMART] hottok invalido');
    return new Response('Unauthorized', { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body?.event as string | undefined;
  const data = body?.data || {};
  const buyer = data?.buyer || {};
  const purchase = data?.purchase || {};

  if (!event) {
    return new Response('Missing event', { status: 400 });
  }

  const status = PAID_EVENTS.has(event)
    ? 'PAGO'
    : REFUND_EVENTS.has(event)
      ? 'REEMBOLSADO_OU_CANCELADO'
      : `OUTRO:${event}`;

  // Log estruturado para consulta no painel Vercel.
  // Filtre por "[PURCHASE]" em vercel.com -> projeto -> Logs.
  console.log('[PURCHASE]', JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    status,
    email: buyer.email || '',
    nome: buyer.name || '',
    telefone: buyer.checkout_phone || '',
    transaction_id: purchase.transaction || '',
    valor: purchase.price?.value || 0,
    sck: data?.subscription?.subscriber?.code || purchase?.tracking?.source || '',
  }));

  await gravarSheetsOpcional({
    event,
    status,
    email: buyer.email,
    nome: buyer.name,
    transaction_id: purchase.transaction,
    valor: purchase.price?.value,
    timestamp: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = () => new Response('Method not allowed', { status: 405 });
