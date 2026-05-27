import type { APIRoute } from 'astro';

// Endpoint server-side, recebe webhooks da Hotmart
export const prerender = false;

// Eventos que indicam compra confirmada/concluida na Hotmart
const PAID_EVENTS = new Set([
  'PURCHASE_COMPLETE',
  'PURCHASE_APPROVED',
  'PURCHASE_BILLET_PRINTED', // boleto impresso (pre-pagamento)
]);

// Eventos de reembolso / chargeback / cancelamento
const REFUND_EVENTS = new Set([
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_CANCELED',
  'PURCHASE_EXPIRED',
]);

async function atualizarSheets(payload: Record<string, unknown>) {
  const webhookUrl = import.meta.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[hotmart-webhook] SHEETS_WEBHOOK_URL nao configurado');
    return { ok: false };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, status: response.status };
  } catch (err) {
    console.error('[hotmart-webhook] erro ao atualizar Sheets:', err);
    return { ok: false };
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Verifica HOTTOK no header (token compartilhado da Hotmart pra autenticar webhook)
  // Lucas vai configurar o mesmo token no painel Hotmart e em HOTMART_HOTTOK env var
  const expectedToken = import.meta.env.HOTMART_HOTTOK;
  const receivedToken = request.headers.get('x-hotmart-hottok');
  if (expectedToken && receivedToken !== expectedToken) {
    console.warn('[hotmart-webhook] hottok invalido');
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

  // Logging basico para Vercel logs
  console.log(`[hotmart-webhook] evento=${event} email=${buyer.email} status=${purchase.status}`);

  if (!event) {
    return new Response('Missing event', { status: 400 });
  }

  const sheetsPayload = {
    event,
    email: buyer.email || '',
    nome: buyer.name || '',
    telefone: buyer.checkout_phone || '',
    transaction_id: purchase.transaction || '',
    valor: purchase.price?.value || 0,
    sck: data?.subscription?.subscriber?.code || purchase?.tracking?.source || '',
    timestamp: new Date().toISOString(),
    status: PAID_EVENTS.has(event)
      ? 'pago'
      : REFUND_EVENTS.has(event)
        ? 'reembolsado_ou_cancelado'
        : `outro:${event}`,
  };

  await atualizarSheets(sheetsPayload);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = () => new Response('Method not allowed', { status: 405 });
