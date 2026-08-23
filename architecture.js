(() => {
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function room(x,y,w,h,label,sub='') { return `<g class="cad-room"><rect x="${x}" y="${y}" width="${w}" height="${h}"/><text x="${x+w/2}" y="${y+h/2-3}">${esc(label)}</text>${sub?`<text class="cad-sub" x="${x+w/2}" y="${y+h/2+9}">${esc(sub)}</text>`:''}</g>`; }
  function door(x,y,w,vertical=false) { return `<g class="cad-door"><path d="M ${x} ${y} ${vertical?'v '+w:'h '+w}"/><path d="M ${x} ${y} Q ${vertical?x+w:x+w} ${vertical?y+w:y+w} ${vertical?x+w:x+w} ${vertical?y+w:y+w}"/></g>`; }
  function window(x,y,w,vertical=false) { return `<g class="cad-window"><line x1="${x}" y1="${y}" x2="${vertical?x:x+w}" y2="${vertical?y+w:y}"/><line x1="${x+2}" y1="${y}" x2="${vertical?x:x+w-2}" y2="${vertical?y+w:y}"/></g>`; }
  function furniture(x,y,type){
    if(type==='sofa') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="70" height="24" rx="3"/><line x1="${x+8}" y1="${y+7}" x2="${x+62}" y2="${y+7}"/></g>`;
    if(type==='table') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="52" height="34" rx="8"/><circle cx="${x-7}" cy="${y+17}" r="5"/><circle cx="${x+59}" cy="${y+17}" r="5"/></g>`;
    if(type==='bed') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="62" height="88"/><line x1="${x}" y1="${y+20}" x2="${x+62}" y2="${y+20}"/><rect x="${x+6}" y="${y+5}" width="22" height="12"/><rect x="${x+34}" y="${y+5}" width="22" height="12"/></g>`;
    if(type==='car') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="42" height="78" rx="12"/><rect x="${x+7}" y="${y+14}" width="28" height="22" rx="5"/><rect x="${x+7}" y="${y+43}" width="28" height="20" rx="5"/><circle cx="${x-2}" cy="${y+14}" r="5"/><circle cx="${x+44}" cy="${y+14}" r="5"/><circle cx="${x-2}" cy="${y+64}" r="5"/><circle cx="${x+44}" cy="${y+64}" r="5"/></g>`;
    return '';
  }

  function svgFloor(level,L,W,rooms,cars,needs){
    const S=40, pad=80, fw=Math.max(260,L*S), fh=Math.max(420,W*S), totalW=fw+pad*2, totalH=fh+pad*2;
    let body='';
    // Base and grid
    body += `<rect class="cad-wall" x="${pad}" y="${pad}" width="${fw}" height="${fh}"/>`;
    for(let i=1;i<Math.floor(L);i++) body += `<line class="cad-grid" x1="${pad+i*S}" y1="${pad}" x2="${pad+i*S}" y2="${pad+fh}"/>`;
    // Dimensions
    body += `<line class="cad-dim" x1="${pad}" y1="${pad-28}" x2="${pad+fw}" y2="${pad-28}"/><text class="cad-dimtext" x="${pad+fw/2}" y="${pad-36}">${L.toFixed(2)} m</text>`;
    body += `<line class="cad-dim" x1="${pad-28}" y1="${pad}" x2="${pad-28}" y2="${pad+fh}"/><text class="cad-dimtext" transform="translate(${pad-40},${pad+fh/2}) rotate(-90)">${W.toFixed(2)} m</text>`;
    body += `<text class="cad-title" x="${pad}" y="30">PLANTA ${level} · ${L.toFixed(2)} × ${W.toFixed(2)} m</text>`;

    const front=5*S, back=fh-5*S;
    if(level===1){
      body += room(pad+4,pad+4,fw-8,front-8,'COCHERA',`${cars} auto(s)`);
      if(cars>0){ body+=furniture(pad+fw*.28,pad+35,'car'); if(cars>1) body+=furniture(pad+fw*.58,pad+35,'car'); }
      const y=pad+front, h=fh-front-5*S;
      const socialW=fw*.62, kitchenW=fw-socialW;
      body += room(pad+4,y+4,socialW*.52-8,h*.48-8,'SALA');
      body += room(pad+socialW*.52,y+4,socialW*.48-8,h*.48-8,'COMEDOR');
      body += room(pad+socialW,y+4,kitchenW-8,h*.48-8,'COCINA','barra');
      body += room(pad+4,y+h*.48,socialW*.52-8,h*.52-8,'BAÑO');
      body += room(pad+socialW*.52,y+h*.48,socialW*.48-8,h*.52-8,'ESCALERA');
      body += room(pad+socialW,y+h*.48,kitchenW-8,h*.52-8,'PATIO / SERVICIO');
      body += furniture(pad+45,y+55,'sofa'); body += furniture(pad+socialW*.52+25,y+55,'table');
      body += door(pad+fw*.50,pad+front,35); window(pad+30,pad+front+10,70);
      body += `<path class="cad-doorline" d="M ${pad+fw*.50} ${pad+front} q 35 0 35 35"/>`;
      body += window(pad+fw*.18,pad+front+h*.48,45,true); body += window(pad+fw*.82,pad+front+h*.48,45,true);
    } else {
      const top=4*S, h1=(fh-top-4*S)/2;
      const rW=fw/2;
      for(let i=0;i<rooms;i++){
        const row=Math.floor(i/2), col=i%2, x=pad+col*rW, y=pad+top+row*h1;
        body += room(x+4,y+4,rW-8,h1-8,`RECÁMARA ${i+1}`);
        body += furniture(x+rW/2-31,y+30,'bed');
        window(x+rW/2-25,y+4,50);
      }
      body += room(pad+4,pad+4,fw*.48-8,top-8,'ESTAR FAMILIAR');
      body += room(pad+fw*.48,pad+4,fw*.52-8,top-8,'BAÑO');
      body += room(pad+4,pad+top+2*h1,fw*.48-8,fh-top-2*h1-8,'BAÑO / SERVICIO');
      body += room(pad+fw*.48,pad+top+2*h1,fw*.52-8,fh-top-2*h1-8,needs?'ESPACIO FLEXIBLE':'TERRAZA / CIRCULACIÓN',needs);
      body += window(pad+fw*.2,pad+top,55); window(pad+fw*.7,pad+top,55);
    }
    body += `<text class="cad-note" x="${pad}" y="${totalH-18}">Esquema conceptual · proporción del terreno respetada · no usar para construir sin revisión profesional</text>`;
    return `<svg class="cad-svg" viewBox="0 0 ${totalW} ${totalH}" role="img" aria-label="Plano conceptual planta ${level}">${body}</svg>`;
  }

  function generate(){
    const L=Number($('planL')?.value)||0,W=Number($('planW')?.value)||0,levels=Number($('planLevels')?.value)||2,rooms=Number($('planRooms')?.value)||3,baths=Number($('planBaths')?.value)||2,cars=Number($('planCars')?.value)||0,needs=($('planNeeds')?.value||'').trim();
    const msg=$('conceptPlanMessage'),out=$('conceptPlanResult');
    if(!L||!W){msg.textContent='Ingresa frente y fondo del terreno.';return;}
    msg.textContent='✦ Dibujando plano arquitectónico conceptual...';
    let drawings=''; for(let i=1;i<=levels;i++) drawings += `<div class="cad-floor">${svgFloor(i,L,W,rooms,cars,needs)}</div>`;
    out.innerHTML=`<div class="result-box"><h3>Plano arquitectónico conceptual · ${L} × ${W} m</h3><p><strong>Terreno:</strong> ${(L*W).toFixed(2)} m² · <strong>Niveles:</strong> ${levels} · <strong>Recámaras:</strong> ${rooms} · <strong>Baños:</strong> ${baths} · <strong>Autos:</strong> ${cars}</p><div class="cad-plan">${drawings}</div><div class="cad-legend"><span>▣ Muros</span><span>⌁ Puertas</span><span>═ Ventanas</span><span>⊙ Mobiliario</span><span>↔ Cotas</span></div><p class="message">⚠️ Es un plano conceptual: las dimensiones, estructura, instalaciones, orientación, retiros, accesibilidad y normativa deben ser revisadas por un arquitecto/ingeniero antes de construir.</p><button id="printConceptPlan" class="primary" type="button">▣ Imprimir / Guardar PDF</button></div>`;
    $('printConceptPlan').onclick=()=>window.print(); msg.textContent='✓ Plano arquitectónico conceptual generado.';
  }

  function init(){
    const tools=document.querySelector('.tools .grid'),section=$('#herramientas'); if(!tools||!section)return;
    let button=$('openConceptPlan');
    if(!button){const card=document.createElement('article');card.innerHTML='<div class="tool-icon">📐</div><h3>Plano arquitectónico</h3><p>Genera un croquis 2D con muros, cotas, puertas, ventanas y mobiliario.</p><button id="openConceptPlan" class="secondary" type="button">Generar plano</button><span>Disponible</span>';tools.appendChild(card);button=card.querySelector('#openConceptPlan');}
    let panel=$('conceptPlanPanel');
    if(!panel){panel=document.createElement('div');panel.id='conceptPlanPanel';panel.className='budget-panel hidden';panel.innerHTML=`<div class="budget-top"><div><div class="section-tag">ARQUITECTURA / PLANO 2D</div><h3>Generador de plano arquitectónico conceptual</h3><p>El dibujo respeta la proporción del terreno y muestra muros, puertas, ventanas, cotas y mobiliario.</p></div><button id="closeConceptPlan" class="secondary" type="button">Cerrar</button></div><div class="form-grid"><div><label for="planL">Frente (m)</label><input id="planL" type="number" min="1" step="0.1" value="8"></div><div><label for="planW">Fondo (m)</label><input id="planW" type="number" min="1" step="0.1" value="20"></div></div><div class="form-grid"><div><label for="planLevels">Niveles</label><select id="planLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">3 plantas</option></select></div><div><label for="planRooms">Recámaras</label><input id="planRooms" type="number" min="1" max="8" value="3"></div></div><div class="form-grid"><div><label for="planBaths">Baños</label><input id="planBaths" type="number" min="1" max="6" value="2"></div><div><label for="planCars">Autos</label><input id="planCars" type="number" min="0" max="4" value="2"></div></div><label for="planNeeds">Necesidades adicionales</label><textarea id="planNeeds" rows="4" placeholder="Ej. lavandería, estudio, terraza, jardín..."></textarea><button id="generateConceptPlan" class="primary full" type="button">Generar plano arquitectónico ✦</button><p id="conceptPlanMessage" class="message"></p><div id="conceptPlanResult"></div>`;section.appendChild(panel);}
    if(!button.dataset.bound){button.dataset.bound='1';button.addEventListener('click',()=>{panel.classList.remove('hidden');panel.scrollIntoView({behavior:'smooth',block:'center'});});$('closeConceptPlan').addEventListener('click',()=>panel.classList.add('hidden'));$('generateConceptPlan').addEventListener('click',generate);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();