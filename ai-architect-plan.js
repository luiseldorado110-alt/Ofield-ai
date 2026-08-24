(() => {
  'use strict';
  const API_URL = 'https://ofield-ai-api.luiseldorado110.workers.dev/';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const state = { brief: '', idea: '', size: '', budget: '', type: 'Arquitectura' };

  function style() {
    if ($('ofield-ai-plan-style')) return;
    const s = document.createElement('style');
    s.id = 'ofield-ai-plan-style';
    s.textContent = `
      #aiPlanPanel.ofield-ai-plan{background:#151515;color:#eee}
      .ofield-ai-plan .aip-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
      .ofield-ai-plan .aip-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .ofield-ai-plan label{display:block;margin:10px 0 6px;font-size:13px;font-weight:700;color:#ddd}
      .ofield-ai-plan input,.ofield-ai-plan select,.ofield-ai-plan textarea{width:100%;box-sizing:border-box;background:#202020;color:#eee;border:1px solid #444;border-radius:9px;padding:11px}
      .ofield-ai-plan input:focus,.ofield-ai-plan select:focus,.ofield-ai-plan textarea:focus{outline:2px solid #caa74a;border-color:#caa74a}
      .ofield-ai-plan .aip-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
      .ofield-ai-plan .aip-wrap{margin-top:18px;background:#383838;border:1px solid #555;border-radius:12px;padding:18px;overflow:auto}
      .ofield-ai-plan .aip-sheet{background:#fff;color:#111;width:1120px;margin:auto;padding:18px;font-family:Arial,Helvetica,sans-serif}
      .aip-title{font-size:20px;font-weight:800;text-anchor:middle}.aip-sub{font-size:10px;fill:#555;text-anchor:middle}.aip-label{font-size:10px;font-weight:700;text-anchor:middle;dominant-baseline:middle}.aip-small{font-size:8px;fill:#555;text-anchor:middle}.aip-wall{fill:#fff;stroke:#111;stroke-width:10}.aip-room{fill:#fff;stroke:#111;stroke-width:4}.aip-door{fill:none;stroke:#111;stroke-width:1.4}.aip-win{stroke:#1d79a6;stroke-width:5}.aip-furn{fill:#fafafa;stroke:#666;stroke-width:1}.aip-garden{fill:#e8f3df;stroke:#6a8f42;stroke-width:1.3;stroke-dasharray:4 3}.aip-plant{fill:none;stroke:#6a8f42;stroke-width:2}.aip-dim{fill:none;stroke:#333;stroke-width:1}.aip-dimt{font-size:9px;font-weight:700;text-anchor:middle}.aip-note{font-size:9px;fill:#555}
      .aip-ok{color:#b9e4a2}.aip-err{color:#ffb3b3}
      @media(max-width:700px){.ofield-ai-plan .aip-grid{grid-template-columns:1fr}.ofield-ai-plan .aip-sheet{width:980px}}
      @media print{body *{visibility:hidden!important}#aiPlanPanel,#aiPlanPanel *{visibility:visible!important}#aiPlanPanel{position:absolute!important;left:0!important;top:0!important;width:100%!important;background:#fff!important}.ofield-ai-plan .aip-wrap{background:#fff!important;border:0!important;padding:0!important;overflow:visible!important}.ofield-ai-plan .aip-sheet{width:100%!important}}
    `;
    document.head.appendChild(s);
  }

  function panel() {
    style();
    let p = $('aiPlanPanel');
    if (p && p.dataset.ready === '1') return p;
    if (!p) {
      const sec = $('herramientas');
      if (!sec) return null;
      p = document.createElement('section');
      p.id = 'aiPlanPanel';
      sec.appendChild(p);
    }
    p.className = 'budget-panel ofield-ai-plan';
    p.dataset.ready = '1';
    p.innerHTML = `
      <div class="aip-head"><div><div class="section-tag">ARQUITECTURA / PLANO CON IA</div><h3>Diseñador arquitectónico asistido por IA</h3><p>La IA primero propone la distribución y después Ofield AI la dibuja como plano conceptual.</p></div><button id="aipClose" class="secondary" type="button">Cerrar</button></div>
      <div class="aip-grid">
        <div><label for="aipL">Frente del terreno (m)</label><input id="aipL" type="number" min="3" step="0.1" value="8"></div>
        <div><label for="aipW">Fondo del terreno (m)</label><input id="aipW" type="number" min="5" step="0.1" value="20"></div>
        <div><label for="aipLevels">Niveles</label><select id="aipLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">2 plantas + roof garden</option></select></div>
        <div><label for="aipRooms">Recámaras</label><input id="aipRooms" type="number" min="1" max="8" value="3"></div>
        <div><label for="aipBaths">Baños</label><input id="aipBaths" type="number" min="1" max="6" value="2"></div>
        <div><label for="aipCars">Autos</label><input id="aipCars" type="number" min="0" max="4" value="2"></div>
      </div>
      <label for="aipNeeds">Necesidades</label><textarea id="aipNeeds" rows="3" placeholder="Cocina abierta, patio, lavandería, estudio, terraza, jardín..."></textarea>
      <div class="aip-tools"><button id="aipGenerate" class="primary" type="button">Diseñar plano con IA ✦</button><button id="aipPrint" class="secondary" type="button">▣ Guardar PDF</button></div>
      <p id="aipStatus" class="message"></p><div id="aipResult"></div>`;
    $('aipClose').onclick = () => p.classList.add('hidden');
    $('aipGenerate').onclick = generate;
    $('aipPrint').onclick = () => window.print();
    return p;
  }

  function open() {
    const p = panel();
    if (!p) return;
    p.classList.remove('hidden');
    $('aipL').value = extractNumber(state.size, 8);
    $('aipW').value = extractSecondNumber(state.size, 20);
    $('aipNeeds').value = state.idea || '';
    p.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function extractNumber(s, fallback) { const m = String(s || '').match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : fallback; }
  function extractSecondNumber(s, fallback) { const m = String(s || '').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i); return m ? Number(m[2]) : fallback; }

  function prompt() {
    const L = Number($('aipL').value), W = Number($('aipW').value), levels = Number($('aipLevels').value), rooms = Number($('aipRooms').value), baths = Number($('aipBaths').value), cars = Number($('aipCars').value), needs = $('aipNeeds').value.trim();
    return `Actúa como arquitecto profesional especializado en vivienda. Diseña un PLANO CONCEPTUAL residencial antes de dibujarlo.\n\nDATOS:\nTerreno: ${L} x ${W} m\nNiveles: ${levels}\nRecámaras: ${rooms}\nBaños: ${baths}\nAutos: ${cars}\nNecesidades: ${needs || 'No especificadas'}\n\n${state.brief ? 'PROPUESTA ARQUITECTÓNICA PREVIA:\n'+state.brief : ''}\n\nREGLAS:\n- Diseña primero la zonificación y circulación.\n- Separa acceso, zona social, zona privada y servicios.\n- Usa pasillos lógicos y evita atravesar recámaras para llegar a otras áreas.\n- Considera iluminación natural, ventilación, privacidad y relación con patios/jardines.\n- Todas las habitaciones deben caber físicamente dentro del terreno.\n- Respeta la proporción del terreno y deja circulaciones razonables.\n- Para cada espacio indica nivel, x, y, ancho, fondo y conexión. Las coordenadas son metros desde la esquina frontal izquierda del lote.\n- Devuelve SOLO JSON válido, sin markdown, con esta estructura exacta:\n{\"project\":{\"front\":${L},\"depth\":${W},\"levels\":${levels}},\"floors\":[{\"level\":1,\"spaces\":[{\"name\":\"Sala\",\"type\":\"social\",\"x\":0,\"y\":0,\"w\":1,\"d\":1,\"doors\":[],\"windows\":[]}]}],\"notes\":[\"...\"]}\n- Usa nombres en español.\n- Mantén las dimensiones con al menos 0.9 m de ancho para pasillos principales y evita solapes importantes.\n- Si algo no cabe, corrige la distribución antes de responder.`;
  }

  function render(plan) {
    const L = Number(plan.project.front), W = Number(plan.project.depth), scale = 20, ox = 190, oy = 110, pw = L * scale, ph = W * scale;
    const vw = 1100, vh = Math.max(760, 180 + ph + 80);
    const sheets = (plan.floors || []).map(f => {
      let s = `<svg viewBox="0 0 ${vw} ${vh}" aria-label="Plano IA planta ${f.level}"><rect width="${vw}" height="${vh}" fill="#fff"/><text class="aip-title" x="550" y="30">OFIELD AI · PLANTA ${f.level}</text><text class="aip-sub" x="550" y="49">${L.toFixed(2)} × ${W.toFixed(2)} m · DISTRIBUCIÓN GENERADA POR IA</text>`;
      s += `<rect class="aip-wall" x="${ox}" y="${oy}" width="${pw}" height="${ph}"/>`;
      for(let m=0;m<=L;m+=1){const x=ox+m*scale;s+=`<line class="aip-dim" x1="${x}" y1="${oy-18}" x2="${x}" y2="${oy-5}"/>`}
      s += `<line class="aip-dim" x1="${ox}" y1="${oy-18}" x2="${ox+pw}" y2="${oy-18}"/><text class="aip-dimt" x="${ox+pw/2}" y="${oy-28}">${L.toFixed(2)} m</text>`;
      s += `<line class="aip-dim" x1="${ox-18}" y1="${oy}" x2="${ox-18}" y2="${oy+ph}"/><text class="aip-dimt" transform="translate(${ox-30},${oy+ph/2}) rotate(-90)">${W.toFixed(2)} m</text>`;
      s += `<text class="aip-label" x="940" y="74">N</text><line class="aip-dim" x1="940" y1="90" x2="940" y2="54"/><path d="M940 49 L933 63 L947 63 Z" fill="#111"/>`;
      for(const sp of (f.spaces || [])){
        const x=ox+Number(sp.x)*scale, y=oy+Number(sp.y)*scale, w=Math.max(18,Number(sp.w)*scale), d=Math.max(18,Number(sp.d)*scale);
        s += `<rect class="aip-room" x="${x}" y="${y}" width="${w}" height="${d}"/>`;
        s += `<text class="aip-label" x="${x+w/2}" y="${y+d/2-3}">${esc(sp.name || 'Espacio')}</text>`;
        if(sp.type==='garden'||sp.type==='patio') s += `<circle class="aip-plant" cx="${x+w*.18}" cy="${y+d*.2}" r="10"/><circle class="aip-plant" cx="${x+w*.82}" cy="${y+d*.75}" r="10"/>`;
        if(sp.type==='bedroom') s += `<rect class="aip-furn" x="${x+w*.36}" y="${y+d*.4}" width="${Math.min(64,w*.3)}" height="${Math.min(40,d*.2)}"/>`;
        if(sp.type==='living') s += `<rect class="aip-furn" x="${x+w*.30}" y="${y+d*.46}" width="${Math.min(80,w*.35)}" height="22" rx="4"/>`;
        if(sp.type==='dining') s += `<rect class="aip-furn" x="${x+w*.35}" y="${y+d*.44}" width="${Math.min(70,w*.3)}" height="28" rx="4"/>`;
        if(sp.type==='car') s += `<rect class="aip-furn" x="${x+w*.3}" y="${y+d*.2}" width="${Math.min(48,w*.35)}" height="${Math.min(82,d*.6)}" rx="8"/>`;
        if(Array.isArray(sp.windows)) for(const win of sp.windows){const side=win.side||'top'; if(side==='top') s+=`<line class="aip-win" x1="${x+w*.25}" y1="${y}" x2="${x+w*.75}" y2="${y}"/>`;if(side==='bottom') s+=`<line class="aip-win" x1="${x+w*.25}" y1="${y+d}" x2="${x+w*.75}" y2="${y+d}"/>`;if(side==='left') s+=`<line class="aip-win" x1="${x}" y1="${y+d*.25}" x2="${x}" y2="${y+d*.75}"/>`;if(side==='right') s+=`<line class="aip-win" x1="${x+w}" y1="${y+d*.25}" x2="${x+w}" y2="${y+d*.75}"/>`;}
      }
      s += `<text class="aip-note" x="190" y="${vh-24}">Plano conceptual generado a partir de una propuesta arquitectónica de IA · No ejecutivo.</text></svg>`;
      return `<div class="aip-sheet">${s}</div>`;
    }).join('');
    return `<div class="aip-wrap">${sheets}</div><div style="margin-top:10px" class="aip-note">${(plan.notes||[]).map(esc).join(' · ')}</div>`;
  }

  async function generate() {
    const btn = $('aipGenerate'), status = $('aipStatus'), out = $('aipResult');
    btn.disabled = true; status.className='message'; status.textContent='✦ La IA está resolviendo la distribución antes de dibujar...'; out.innerHTML='';
    try {
      const r = await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:prompt()})});
      const d = await r.json(); if(!r.ok||!d.result) throw new Error('Sin respuesta de IA');
      let raw = String(d.result).trim().replace(/^```json/i,'').replace(/^```/,'').replace(/```$/,'').trim();
      const start=raw.indexOf('{'), end=raw.lastIndexOf('}'); if(start>=0&&end>=start) raw=raw.slice(start,end+1);
      const plan=JSON.parse(raw); out.innerHTML=render(plan); status.className='message aip-ok'; status.textContent='✓ Plano conceptual generado por IA.';
      localStorage.setItem('ofieldLastAIPlan',JSON.stringify(plan));
    } catch(e) { console.error('[Ofield AI plan]',e); status.className='message aip-err'; status.textContent='No se pudo generar el plano con IA. La respuesta no tuvo el formato esperado.'; }
    finally { btn.disabled=false; }
  }

  function bind() {
    window.__ofieldOpenAIPlan = open;
    document.addEventListener('click', e => {
      const b=e.target.closest('#openConceptPlan'); if(!b) return; e.preventDefault(); e.stopImmediatePropagation(); open();
    }, true);
  }

  window.__ofieldSetArchitectBrief = data => { state.brief=data?.brief||'';state.idea=data?.idea||'';state.size=data?.size||'';state.budget=data?.budget||'';state.type=data?.type||'Arquitectura'; };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true}); else bind();
  panel();
})();