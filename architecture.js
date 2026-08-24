(() => {
  function makePanel() {
    let panel = document.getElementById('conceptPlanPanel');
    if (panel) return panel;
    const section = document.getElementById('herramientas');
    if (!section) return null;
    panel = document.createElement('div');
    panel.id = 'conceptPlanPanel';
    panel.className = 'budget-panel hidden';
    panel.innerHTML = `<div class="budget-top"><div><div class="section-tag">ARQUITECTURA / PLANO 2D</div><h3>Generador de plano arquitectónico conceptual</h3><p>Distribución proporcional con muros, puertas, ventanas, muebles y cotas.</p></div><button id="closeConceptPlan" class="secondary" type="button">Cerrar</button></div><div class="form-grid"><div><label>Frente (m)</label><input id="planL" type="number" min="1" step="0.1" value="8"></div><div><label>Fondo (m)</label><input id="planW" type="number" min="1" step="0.1" value="20"></div></div><div class="form-grid"><div><label>Niveles</label><select id="planLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">3 plantas</option></select></div><div><label>Recámaras</label><input id="planRooms" type="number" min="1" max="8" value="3"></div></div><div class="form-grid"><div><label>Baños</label><input id="planBaths" type="number" min="1" max="6" value="2"></div><div><label>Autos</label><input id="planCars" type="number" min="0" max="4" value="2"></div></div><label>Necesidades adicionales</label><textarea id="planNeeds" rows="3" placeholder="Ej. lavandería, estudio, terraza, jardín..."></textarea><button id="generateConceptPlan" class="primary full" type="button">Generar plano arquitectónico ✦</button><p id="conceptPlanMessage" class="message"></p><div id="conceptPlanResult"></div>`;
    section.appendChild(panel);
    return panel;
  }
  function openPanel(){ const p=makePanel(); if(!p)return; p.classList.remove('hidden'); p.scrollIntoView({behavior:'smooth',block:'center'}); }
  window.openConceptPlanPanel=openPanel;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function furniture(x,y,w,h,type){
    if(type==='bed') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><line x1="${x}" y1="${y+h*.22}" x2="${x+w}" y2="${y+h*.22}"/><rect x="${x+5}" y="${y+5}" width="${w/2-8}" height="${h*.16}" rx="2"/><rect x="${x+w/2+3}" y="${y+5}" width="${w/2-8}" height="${h*.16}" rx="2"/></g>`;
    if(type==='sofa') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/><line x1="${x+8}" y1="${y+h*.25}" x2="${x+w-8}" y2="${y+h*.25}"/></g>`;
    if(type==='table') return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><circle cx="${x-10}" cy="${y+h/2}" r="7"/><circle cx="${x+w+10}" cy="${y+h/2}" r="7"/></g>`;
    return '';
  }
  function door(x,y,w,vertical=false){
    if(vertical) return `<g class="cad-door"><line x1="${x}" y1="${y}" x2="${x}" y2="${y+w}"/><path d="M ${x} ${y} A ${w} ${w} 0 0 1 ${x+w} ${y+w}" fill="none"/></g>`;
    return `<g class="cad-door"><line x1="${x}" y1="${y}" x2="${x+w}" y2="${y}"/><path d="M ${x} ${y} A ${w} ${w} 0 0 1 ${x+w} ${y-w}" fill="none"/></g>`;
  }
  function windowLine(x,y,w,vertical=false){ return vertical ? `<line class="cad-window" x1="${x}" y1="${y}" x2="${x}" y2="${y+w}"/>` : `<line class="cad-window" x1="${x}" y1="${y}" x2="${x+w}" y2="${y}"/>`; }
  function draw(){
    const L=Number(document.getElementById('planL').value)||0, W=Number(document.getElementById('planW').value)||0;
    const levels=Number(document.getElementById('planLevels').value)||1, rooms=Number(document.getElementById('planRooms').value)||1, baths=Number(document.getElementById('planBaths').value)||1, cars=Number(document.getElementById('planCars').value)||0, needs=document.getElementById('planNeeds').value.trim();
    const msg=document.getElementById('conceptPlanMessage'), out=document.getElementById('conceptPlanResult');
    if(!L||!W){msg.textContent='Ingresa frente y fondo del terreno.';return;}
    msg.textContent='✦ Generando plano...';
    const scale=Math.min(42,900/L,1050/W), pad=90, fw=L*scale, fh=W*scale, tw=fw+pad*2, th=fh+pad*2;
    const room=(x,y,w,h,n)=>`<g><rect class="cad-room" x="${x}" y="${y}" width="${w}" height="${h}"/><text class="cad-label" x="${x+w/2}" y="${y+h/2}">${esc(n)}</text></g>`;
    const floor=level=>{
      let s=`<svg class="cad-svg" viewBox="0 0 ${tw} ${th}" role="img" aria-label="Plano conceptual planta ${level}"><rect x="0" y="0" width="${tw}" height="${th}" fill="#fff"/><text class="cad-title" x="${pad}" y="30">PLANTA ${level} · ${L.toFixed(2)} × ${W.toFixed(2)} m</text>`;
      s+=`<rect class="cad-wall" x="${pad}" y="${pad}" width="${fw}" height="${fh}" fill="none"/>`;
      s+=`<line class="cad-dim" x1="${pad}" y1="${pad-32}" x2="${pad+fw}" y2="${pad-32}"/><line class="cad-dim" x1="${pad}" y1="${pad-38}" x2="${pad}" y2="${pad-26}"/><line class="cad-dim" x1="${pad+fw}" y1="${pad-38}" x2="${pad+fw}" y2="${pad-26}"/><text class="cad-dimtext" x="${pad+fw/2}" y="${pad-42}">${L.toFixed(2)} m</text>`;
      s+=`<line class="cad-dim" x1="${pad-32}" y1="${pad}" x2="${pad-32}" y2="${pad+fh}"/><line class="cad-dim" x1="${pad-38}" y1="${pad}" x2="${pad-26}" y2="${pad}"/><line class="cad-dim" x1="${pad-38}" y1="${pad+fh}" x2="${pad-26}" y2="${pad+fh}"/><text class="cad-dimtext" transform="translate(${pad-50},${pad+fh/2}) rotate(-90)">${W.toFixed(2)} m</text>`;
      if(level===1){
        const front=Math.min(4.8*scale,fh*.25), y1=pad+front, left=fw*.62, right=fw-left, mid=y1+(fh-front)*.5;
        s+=room(pad+3,pad+3,fw-6,front-6,'COCHERA');
        s+=room(pad+3,y1+3,left*.5-6,(mid-y1)-6,'SALA'); s+=room(pad+left*.5,y1+3,left*.5-6,(mid-y1)-6,'COMEDOR'); s+=room(pad+left,y1+3,right-6,(mid-y1)-6,'COCINA');
        s+=room(pad+3,mid+3,left*.5-6,fh-(mid-pad)-6,'BAÑO'); s+=room(pad+left*.5,mid+3,left*.5-6,fh-(mid-pad)-6,'ESCALERA'); s+=room(pad+left,mid+3,right-6,fh-(mid-pad)-6,'PATIO');
        s+=door(pad+fw*.5,pad+front,32); s+=door(pad+left*.5,y1+40,28); s+=door(pad+left*.5,mid,28); s+=windowLine(pad+25,pad+front,fw*.28); s+=windowLine(pad+left+20,pad+front+25,right*.65); s+=windowLine(pad+25,pad+fh-25,left*.25); s+=windowLine(pad+fw-25,y1+25,70,true);
        s+=furniture(pad+35,y1+35,80,35,'sofa'); s+=furniture(pad+left*.55,y1+35,65,45,'table');
        if(cars>0)s+=`<text class="cad-sub" x="${pad+fw/2}" y="${pad+front/2}">${cars} auto(s)</text>`;
      } else {
        const top=Math.min(3.8*scale,fh*.2), y0=pad+top, cellW=fw/2, cellH=(fh-top)/Math.max(2,Math.ceil(rooms/2)+1);
        s+=room(pad+3,pad+3,fw*.5-6,top-6,'ESTAR'); s+=room(pad+fw*.5,pad+3,fw*.5-6,top-6,'BAÑO');
        for(let i=0;i<rooms;i++){const x=pad+(i%2)*cellW,y=y0+Math.floor(i/2)*cellH;s+=room(x+3,y+3,cellW-6,cellH-6,'RECÁMARA '+(i+1));s+=furniture(x+cellW*.38,y+cellH*.38,70,42,'bed');s+=windowLine(x+cellW*.2,y+3,cellW*.25);}
        const lastY=y0+Math.ceil(rooms/2)*cellH; s+=room(pad+3,lastY+3,fw*.5-6,fh-(lastY-pad)-6,needs?'ESPACIO FLEXIBLE':'TERRAZA');s+=room(pad+fw*.5,lastY+3,fw*.5-6,fh-(lastY-pad)-6,'BAÑO / SERVICIO');s+=door(pad+fw*.5,pad+top,30);s+=windowLine(pad+fw-25,pad+top+20,80,true);
      }
      s+=`<text class="cad-note" x="${pad}" y="${th-16}">Plano conceptual · revisar medidas, estructura, instalaciones y normativa con profesional</text></svg>`; return s;
    };
    let drawings='';for(let i=1;i<=levels;i++)drawings+=`<div class="cad-floor">${floor(i)}</div>`;
    out.innerHTML=`<div class="result-box"><h3>Plano arquitectónico conceptual · ${L} × ${W} m</h3><p><strong>Terreno:</strong> ${(L*W).toFixed(2)} m² · <strong>Niveles:</strong> ${levels} · <strong>Recámaras:</strong> ${rooms} · <strong>Baños:</strong> ${baths} · <strong>Autos:</strong> ${cars}</p><div class="cad-plan">${drawings}</div><p class="message">⚠️ Es un plano conceptual; no sustituye un proyecto ejecutivo.</p><button id="printConceptPlan" class="primary" type="button">▣ Imprimir / Guardar PDF</button></div>`;
    document.getElementById('printConceptPlan').onclick=()=>window.print(); msg.textContent='✓ Plano generado.';
  }
  window.generateConceptPlan=draw;
  document.addEventListener('click',e=>{const o=e.target.closest('#openConceptPlan');if(o){e.preventDefault();openPanel();return;}if(e.target.closest('#closeConceptPlan')){e.preventDefault();const p=document.getElementById('conceptPlanPanel');if(p)p.classList.add('hidden');return;}if(e.target.closest('#generateConceptPlan')){e.preventDefault();draw();}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makePanel);else makePanel();
})();