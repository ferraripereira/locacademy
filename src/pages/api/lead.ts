import type { APIRoute } from 'astro';

// Endpoint server-side (nao prerender)
export const prerender = false;

const CHECKOUT_BASE = 'https://pay.hotmart.com/Q105995061A';

/**
 * MVP mode: leads vao apenas para o painel Vercel (Logs do projeto).
 * Lucas consulta em vercel.com -> projeto -> Logs filtrando por [LEAD]
 * e copia para a planilha conforme necessario.
 *
 * Formulario segue o padrao ODuo (mesmo schema usado nos outros forms da empresa).
 */
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
    console.error('[LEAD] falha ao gravar Sheets externo:', err);
  }
}

function montarCheckoutUrl(payload: Record<string, string>): string {
  const url = new URL(CHECKOUT_BASE);
  if (payload.email) url.searchParams.set('email', payload.email);
  if (payload.nome) url.searchParams.set('name', payload.nome);
  if (payload.telefone) url.searchParams.set('phone', payload.telefone.replace(/\D/g, ''));
  url.searchParams.set('sck', `loc-${Date.now()}-${(payload.email || '').split('@')[0]}`);
  return url.toString();
}

// Campos obrigatorios do padrao ODuo
const CAMPOS_OBRIGATORIOS = [
  'nome',
  'email',
  'telefone',
  'nome_da_empresa',
  'cargo',
  'estado',
  'cenario',
  'segmento_de_locacao',
  'faturamento_mensal',
];

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

  const missing = CAMPOS_OBRIGATORIOS.filter((field) => !(payload[field] || '').trim());
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
    // Campos do padrao ODuo
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone,
    nome_da_empresa: payload.nome_da_empresa,
    cargo: payload.cargo,
    estado: payload.estado,
    cenario: payload.cenario,
    segmento_de_locacao: payload.segmento_de_locacao,
    faturamento_mensal: payload.faturamento_mensal,
    // Tracking
    variant: payload.variant || '',
    utm_source: payload.utm_source || '',
    utm_medium: payload.utm_medium || '',
    utm_campaign: payload.utm_campaign || '',
    utm_term: payload.utm_term || '',
    utm_content: payload.utm_content || '',
    gclid: payload.gclid || '',
    fbclid: payload.fbclid || '',
    referrer: payload.referrer || '',
    page_url: payload.page_url || '',
  }));

  // Best-effort: grava em Sheets se configurado (hoje desligado)
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
