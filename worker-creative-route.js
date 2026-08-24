/*
  Ofield AI — multimedia Worker route template
  Add this logic to the existing Cloudflare Worker that already serves
  https://ofield-ai-api.luiseldorado110.workers.dev/

  Required Cloudflare secret:
    REPLICATE_API_TOKEN

  The browser calls POST / with:
    { mode:"creative", kind:"image|drawing|song|music|comic", prompt, style, format, context }

  Replicate's API creates predictions asynchronously; this route uses
  Prefer: wait=60 for fast models and returns the output URL when ready.
  See: https://replicate.com/docs/topics/predictions/create
*/

const CREATIVE_MODELS = {
  // Keep these configurable with Worker vars if you prefer.
  image: 'black-forest-labs/flux-schnell',
  drawing: 'black-forest-labs/flux-schnell',
  music: 'meta/musicgen',
  song: 'meta/musicgen',
  comic: 'black-forest-labs/flux-schnell'
};

function creativeInput(kind, prompt, style, format) {
  const base = [prompt, style && `Style: ${style}`, format && `Format: ${format}`]
    .filter(Boolean).join('\n');
  if (kind === 'image' || kind === 'drawing' || kind === 'comic') {
    return { prompt: base };
  }
  if (kind === 'music' || kind === 'song') {
    return { prompt: base };
  }
  return { prompt: base };
}

export async function handleCreativeRequest(request, env) {
  if (!env.REPLICATE_API_TOKEN) {
    return new Response(JSON.stringify({
      error: 'REPLICATE_API_TOKEN no está configurado en el Worker.'
    }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await request.json();
  const kind = String(body.kind || 'image');
  const prompt = String(body.prompt || '').trim();
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Falta prompt.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const model = env[`CREATIVE_MODEL_${kind.toUpperCase()}`] || CREATIVE_MODELS[kind] || CREATIVE_MODELS.image;
  const input = creativeInput(kind, prompt, body.style, body.format);

  const r = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=60'
    },
    body: JSON.stringify({ input })
  });

  const prediction = await r.json();
  if (!r.ok) {
    return new Response(JSON.stringify({ error: prediction.detail || prediction.error || 'Replicate rechazó la solicitud.' }), {
      status: r.status, headers: { 'Content-Type': 'application/json' }
    });
  }

  const output = prediction.output;
  const url = Array.isArray(output) ? output[0] : output;
  const payload = {
    id: prediction.id,
    status: prediction.status,
    imageUrl: kind === 'image' || kind === 'drawing' || kind === 'comic' ? url : undefined,
    audioUrl: kind === 'song' || kind === 'music' ? url : undefined,
    output
  };

  return new Response(JSON.stringify(payload), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
}

/*
  Integration example inside the existing Worker fetch handler:

  if (request.method === 'POST') {
    const body = await request.clone().json();
    if (body?.mode === 'creative') {
      return handleCreativeRequest(request, env);
    }
  }
*/
