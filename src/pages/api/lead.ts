import type { APIRoute } from 'astro';

// Endpoint server-side (nao prerender)
export const prerender = false;

const CHECKOUT_BASE = 'https://pay.hotmart.com/Q105995061A';

/**
 * MVP mode: nao gravamos em Sheets/CRM externos.
 * Os leads sao apenas logados no painel Vercel (Logs do projeto).
 * Lucas consulta diariamente em vercel.com -> projeto -> Logs e copia
 * para a planilha de leads conforme necessario.
 *
 * Quando a validacao do MVP fechar, plugar Sheets/Make/Zapier definindo
 * SHEETS_WEBHOOK_URL no env do Vercel - o codigo abaixo ja considera isso.
 */
async function gravarSheetsOpcional(payload: Record<string, unknown>) {
  const webhookUrl = import.meta.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return; // MVP: sem integracao
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[LEAD] falha ao gravar Sheets externo:', err);
  }
}

function montarCheckoutUrl(payload: Record<string, string>): string {
  const url = new URL(CHECKOUT_BASE);
  if (payload.email) url.searchParams.set('email', payload.email);
  if (payload.nome) url.searchParams.set('name', payload.nome);
  if (payload.telefone) url.searchParams.set('phone', payload.telefone.replace(/\D/g, ''));
  // sck = tracking source da Hotmart, util pra correlacionar quem comprou com qual lead
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
  } catch {
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

  const timestamp = new Date().toISOString();

  // Log estruturado para consulta no painel Vercel.
  // Filtre por "[LEAD]" em vercel.com -> projeto -> Logs.
  console.log('[LEAD]', JSON.stringify({
    timestamp,
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone,
    locadora: payload.locadora,
    cidade: payload.cidade,
    estado: payload.estado,
    cargo: payload.cargo,
    frota: payload.frota,
    origem: payload.origem,
  }));

  // Best-effort: grava em Sheets se configurado (opcional, hoje desligado)
  await gravarSheetsOpcional({ ...payload, timestamp, status: 'lead_capturado' });

  const checkoutUrl = montarCheckoutUrl(payload);

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

export const GET: APIRoute = () => new Response('Method not allowed', { status: 405 });
