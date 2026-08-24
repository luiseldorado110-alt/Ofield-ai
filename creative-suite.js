(() => {
  'use strict';

  const API_URL = 'https://ofield-ai-api.luiseldorado110.workers.dev/';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function addStyles(){
    if ($('ofieldCreativeStyle')) return;
    const s = document.createElement('style');
    s.id = 'ofieldCreativeStyle';
    s.textContent = `
      #creativeSuite{margin-top:28px;background:#151515;border:1px solid #333;border-radius:16px;padding:20px;color:#eee}
      #creativeSuite .cs-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap}
      #creativeSuite .cs-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}
      #creativeSuite .cs-tab{background:#202020;color:#eee;border:1px solid #3b3b3b;border-radius:999px;padding:9px 13px;cursor:pointer}
      #creativeSuite .cs-tab.active{border-color:#caa74a;box-shadow:0 0 0 1px #caa74a inset}
      #creativeSuite .cs-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      #creativeSuite .cs-card{background:#202020;border:1px solid #383838;border-radius:12px;padding:14px}
      #creativeSuite label{display:block;margin:10px 0 6px;font-weight:700;font-size:13px}
      #creativeSuite input,#creativeSuite textarea,#creativeSuite select{width:100%;box-sizing:border-box;background:#171717;color:#eee;border:1px solid #444;border-radius:9px;padding:11px}
      #creativeSuite .cs-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      #creativeSuite .cs-output{margin-top:14px;background:#f7f7f7;color:#111;border-radius:10px;padding:16px;min-height:120px}
      #creativeSuite .cs-media img{max-width:100%;height:auto;border-radius:10px;display:block}
      #creativeSuite audio{width:100%}
      #creativeSuite .cs-status{min-height:22px}
      @media(max-width:700px){#creativeSuite .cs-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function context(){
    return {
      type: $('type')?.value || 'Otro proyecto',
      idea: $('idea')?.value.trim() || '',
      size: $('size')?.value.trim() || '',
      budget: $('budget')?.value.trim() || '',
      proposal: $('resultBox')?.innerText || ''
    };
  }

  function ensure(){
    addStyles();
    let p = $('creativeSuite');
    if (p) return p;
    const host = $('resultado') || $('herramientas');
    if (!host) return null;
    p = document.createElement('section');
    p.id = 'creativeSuite';
    p.classList.add('hidden');
    p.innerHTML = `
      <div class="cs-head">
        <div><div class="section-tag">OFIELD CREATIVE STUDIO</div><h3>Imágenes, dibujos, canciones, música y cómics</h3><p>Una sola interfaz creativa para producir contenido a partir de tu idea.</p></div>
        <button id="closeCreative" class="secondary" type="button">Cerrar</button>
      </div>
      <div class="cs-tabs">
        <button class="cs-tab active" data-kind="image" type="button">🖼️ Imagen</button>
        <button class="cs-tab" data-kind="drawing" type="button">✏️ Dibujo</button>
        <button class="cs-tab" data-kind="song" type="button">🎤 Canción</button>
        <button class="cs-tab" data-kind="music" type="button">🎵 Música</button>
        <button class="cs-tab" data-kind="comic" type="button">📚 Cómic</button>
      </div>
      <div class="cs-grid">
        <div class="cs-card">
          <label for="creativePrompt">Qué quieres crear</label>
          <textarea id="creativePrompt" rows="7" placeholder="Ej. Un personaje de superhéroe con electricidad azul, estilo cómic cinematográfico..."></textarea>
          <div class="form-grid">
            <div><label for="creativeStyle">Estilo</label><input id="creativeStyle" placeholder="Ej. cinematográfico, anime, realista"></div>
            <div><label for="creativeFormat">Formato</label><input id="creativeFormat" placeholder="Ej. portada vertical, MP3, página de cómic"></div>
          </div>
          <div class="cs-actions">
            <button id="runCreative" class="primary" type="button">✦ Generar</button>
            <button id="loadCreativeContext" class="secondary" type="button">Usar proyecto actual</button>
          </div>
          <p id="creativeStatus" class="message cs-status"></p>
        </div>
        <div class="cs-card">
          <h4>Resultado</h4>
          <div id="creativeOutput" class="cs-output"><p>Tu resultado aparecerá aquí.</p></div>
        </div>
      </div>`;
    host.appendChild(p);

    $('closeCreative').onclick = () => p.classList.add('hidden');
    $('loadCreativeContext').onclick = () => {
      const c = context();
      $('creativePrompt').value = `Proyecto: ${c.idea || 'sin descripción'}\nTamaño: ${c.size || 'no especificado'}\nPresupuesto: ${c.budget || 'no especificado'}\n\nPropuesta:\n${c.proposal.slice(0,8000)}`;
      $('creativeStatus').textContent = '✓ Contexto cargado.';
    };
    p.querySelectorAll('.cs-tab').forEach(tab => tab.addEventListener('click', () => {
      p.querySelectorAll('.cs-tab').forEach(x => x.classList.remove('active'));
      tab.classList.add('active');
      $('creativeStatus').textContent = `Modo ${tab.textContent.trim()} seleccionado.`;
    }));
    $('runCreative').onclick = generate;
    return p;
  }

  function getKind(){ return document.querySelector('#creativeSuite .cs-tab.active')?.dataset.kind || 'image'; }

  function showResult(kind, data){
    const out = $('creativeOutput');
    if (!out) return;
    if (data?.imageUrl) {
      out.innerHTML = `<div class="cs-media"><img src="${esc(data.imageUrl)}" alt="Resultado generado por Ofield AI"><p><a href="${esc(data.imageUrl)}" target="_blank" rel="noopener">Abrir imagen</a></p></div>`;
      return;
    }
    if (data?.audioUrl) {
      out.innerHTML = `<div class="cs-media"><audio controls src="${esc(data.audioUrl)}"></audio><p><a href="${esc(data.audioUrl)}" target="_blank" rel="noopener">Abrir audio</a></p></div>`;
      return;
    }
    if (data?.text) {
      out.innerHTML = `<pre style="white-space:pre-wrap;font:inherit;margin:0">${esc(data.text)}</pre>`;
      return;
    }
    out.innerHTML = `<pre style="white-space:pre-wrap;font:inherit;margin:0">${esc(JSON.stringify(data || {}, null, 2))}</pre>`;
  }

  async function generate(){
    const p = ensure();
    if (!p) return;
    const kind = getKind();
    const prompt = $('creativePrompt')?.value.trim() || '';
    const style = $('creativeStyle')?.value.trim() || '';
    const format = $('creativeFormat')?.value.trim() || '';
    const c = context();
    if (!prompt) { $('creativeStatus').textContent = 'Escribe qué quieres crear.'; return; }
    const button = $('runCreative'); button.disabled = true;
    $('creativeStatus').textContent = '✦ Ofield Creative Studio está generando...';
    $('creativeOutput').innerHTML = '<p>Procesando…</p>';
    try {
      const body = {
        kind,
        prompt,
        style,
        format,
        context: c,
        // The Worker should route these to a multimedia model provider.
      };
      const r = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ mode:'creative', ...body }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'El Worker no tiene habilitada la generación multimedia.');
      showResult(kind, d);
      $('creativeStatus').textContent = '✓ Generación completada.';
    } catch (e) {
      console.error('[Ofield Creative Studio]', e);
      $('creativeStatus').textContent = e.message || 'No se pudo generar el contenido.';
      $('creativeOutput').innerHTML = `<p><strong>Configuración pendiente:</strong> el sitio ya tiene la interfaz creativa, pero el Worker debe aceptar <code>mode:"creative"</code> y conectarse a un proveedor multimedia.</p>`;
    } finally { button.disabled = false; }
  }

  function mountOpenButton(){
    const result = $('resultado');
    if (!result) return;
    ensure();
    const actions = result.querySelector('.result-head .hero-actions');
    if (actions && !$('openCreativeSuite')) {
      const b = document.createElement('button');
      b.id = 'openCreativeSuite'; b.className = 'secondary'; b.type = 'button';
      b.textContent = '🎨 Creative Studio';
      b.onclick = () => { const p=ensure(); p.classList.remove('hidden'); p.scrollIntoView({behavior:'smooth',block:'center'}); };
      actions.appendChild(b);
    }
  }

  function addToolCard(){
    const grid = document.querySelector('#herramientas .grid');
    if (!grid || $('creativeToolCard')) return;
    const article = document.createElement('article');
    article.id='creativeToolCard';
    article.innerHTML = '<div class="tool-icon">🎨</div><h3>Creative Studio</h3><p>Genera imágenes, dibujos, canciones, música y cómics.</p><button id="openCreativeTool" class="secondary" type="button">Abrir Creative Studio</button><span>Disponible</span>';
    grid.appendChild(article);
    $('openCreativeTool').onclick=()=>{const p=ensure();p.classList.remove('hidden');p.scrollIntoView({behavior:'smooth',block:'center'});};
  }

  function start(){
    addToolCard();
    mountOpenButton();
    const obs = new MutationObserver(() => { addToolCard(); mountOpenButton(); });
    obs.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
