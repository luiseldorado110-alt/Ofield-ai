(() => {
  function makePanel() {
    let panel = document.getElementById('conceptPlanPanel');
    if (panel) return panel;
    const section = document.getElementById('herramientas');
    if (!section) return null;
    panel = document.createElement('div');
    panel.id = 'conceptPlanPanel';
    panel.className = 'budget-panel hidden';
    panel.innerHTML = `<div class="budget-top"><div><div class="section-tag">ARQUITECTURA / PLANO 2D</div><h3>Generador de plano arquitectónico conceptual</h3><p>Plano orientativo con proporción, muros, puertas, ventanas, mobiliario y cotas.</p></div><button id="closeConceptPlan" class="secondary" type="button">Cerrar</button></div><div class="form-grid"><div><label>Frente (m)</label><input id="planL" type="number" min="1" step="0.1" value="8"></div><div><label>Fondo (m)</label><input id="planW" type="number" min="1" step="0.1" value="20"></div></div><div class="form-grid"><div><label>Niveles</label><select id="planLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">3 plantas</option></select></div><div><label>Recámaras</label><input id="planRooms" type="number" min="1" max="8" value="3"></div></div><div class="form-grid"><div><label>Baños</label><input id="planBaths" type="number" min="1" max="6" value="2"></div><div><label>Autos</label><input id="planCars" type="number" min="0" max="4" value="2"></div></div><label>Necesidades adicionales</label><textarea id="planNeeds" rows="3" placeholder="Ej. lavandería, estudio, terraza, jardín..."></textarea><button id="generateConceptPlan" class="primary full" type="button">Generar plano arquitectónico ✦</button><p id="conceptPlanMessage" class="message"></p><div id="conceptPlanResult"></div>`;
    section.appendChild(panel);
    return panel;
  }

  function openPanel() {
    const panel = makePanel();
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function draw() {
    const L = Number(document.getElementById('planL').value) || 0;
    const W = Number(document.getElementById('planW').value) || 0;
    const levels = Number(document.getElementById('planLevels').value) || 1;
    const rooms = Number(document.getElementById('planRooms').value) || 1;
    const baths = Number(document.getElementById('planBaths').value) || 1;
    const cars = Number(document.getElementById('planCars').value) || 0;
    const needs = document.getElementById('planNeeds').value.trim();
    const msg = document.getElementById('conceptPlanMessage');
    const out = document.getElementById('conceptPlanResult');
    if (!L || !W) { msg.textContent = 'Ingresa frente y fondo del terreno.'; return; }
    msg.textContent = '✦ Generando plano...';
    const scale = 32, pad = 70, fw = L * scale, fh = W * scale, tw = fw + pad * 2, th = fh + pad * 2;
    const room = (x,y,w,h,n) => `<g><rect class="cad-room" x="${x}" y="${y}" width="${w}" height="${h}"/><text x="${x+w/2}" y="${y+h/2}">${n}</text></g>`;
    const floor = level => { let s = `<svg class="cad-svg" viewBox="0 0 ${tw} ${th}"><text class="cad-title" x="${pad}" y="28">PLANTA ${level} · ${L.toFixed(2)} × ${W.toFixed(2)} m</text><rect class="cad-wall" x="${pad}" y="${pad}" width="${fw}" height="${fh}"/><line class="cad-dim" x1="${pad}" y1="${pad-25}" x2="${pad+fw}" y2="${pad-25}"/><text class="cad-dimtext" x="${pad+fw/2}" y="${pad-32}">${L.toFixed(2)} m</text><line class="cad-dim" x1="${pad-25}" y1="${pad}" x2="${pad-25}" y2="${pad+fh}"/><text class="cad-dimtext" transform="translate(${pad-38},${pad+fh/2}) rotate(-90)">${W.toFixed(2)} m</text>`;
      if(level === 1){ const front = 4*scale, mid = pad+front, half = (fh-front)/2, left=fw*.62, right=fw-left; s += room(pad+4,pad+4,fw-8,front-8,'COCHERA'); s += room(pad+4,mid+4,left*.5-8,half*.5-8,'SALA'); s += room(pad+left*.5,mid+4,left*.5-8,half*.5-8,'COMEDOR'); s += room(pad+left,mid+4,right-8,half*.5-8,'COCINA'); s += room(pad+4,mid+half*.5,left*.5-8,half*.5-8,'BAÑO'); s += room(pad+left*.5,mid+half*.5,left*.5-8,half*.5-8,'ESCALERA'); s += room(pad+left,mid+half*.5,right-8,half*.5-8,'PATIO'); if(cars>0) s += `<text class="cad-sub" x="${pad+fw/2}" y="${pad+front/2}">${cars} auto(s)</text>`; }
      else { const top=4*scale, cellW=fw/2, cellH=(fh-top)/2; s += room(pad+4,pad+4,fw*.48-8,top-8,'ESTAR'); s += room(pad+fw*.48,pad+4,fw*.52-8,top-8,'BAÑO'); for(let i=0;i<rooms;i++){ const x=pad+(i%2)*cellW, y=pad+top+Math.floor(i/2)*cellH; s += room(x+4,y+4,cellW-8,cellH-8,'RECÁMARA '+(i+1)); s += `<rect class="cad-furniture" x="${x+cellW/2-25}" y="${y+25}" width="50" height="70"/>`; } s += room(pad+4,pad+top+2*cellH,fw*.48-8,20,'BAÑO / SERVICIO'); s += room(pad+fw*.48,pad+top+2*cellH,fw*.52-8,20,needs?'ESPACIO FLEXIBLE':'TERRAZA'); }
      s += `<text class="cad-note" x="${pad}" y="${th-15}">Plano conceptual · no usar para construir sin revisión profesional</text></svg>`; return s; };
    let drawings=''; for(let i=1;i<=levels;i++) drawings += `<div class="cad-floor">${floor(i)}</div>`;
    out.innerHTML = `<div class="result-box"><h3>Plano arquitectónico conceptual · ${L} × ${W} m</h3><p><strong>Terreno:</strong> ${(L*W).toFixed(2)} m² · <strong>Niveles:</strong> ${levels} · <strong>Recámaras:</strong> ${rooms} · <strong>Baños:</strong> ${baths} · <strong>Autos:</strong> ${cars}</p><div class="cad-plan">${drawings}</div><p class="message">⚠️ Es un plano conceptual. Las medidas, estructura, instalaciones y normativa deben ser verificadas por un profesional.</p><button id="printConceptPlan" class="primary" type="button">▣ Imprimir / Guardar PDF</button></div>`;
    document.getElementById('printConceptPlan').onclick = () => window.print();
    msg.textContent = '✓ Plano generado.';
  }

  document.addEventListener('click', e => {
    const open = e.target.closest('#openConceptPlan');
    if (open) { e.preventDefault(); openPanel(); return; }
    if (e.target.closest('#closeConceptPlan')) { e.preventDefault(); const p=document.getElementById('conceptPlanPanel'); if(p) p.classList.add('hidden'); return; }
    if (e.target.closest('#generateConceptPlan')) { e.preventDefault(); draw(); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', makePanel); else makePanel();
})();