(() => {
  const addStyles = () => {
    if (document.getElementById('ofield-cad-pro-styles')) return;
    const s = document.createElement('style'); s.id='ofield-cad-pro-styles';
    s.textContent = `
      #conceptPlanPanel .cad-plan{background:#e9ecef;padding:22px;border:1px solid #c9cdd2;border-radius:14px;overflow:auto}
      #conceptPlanPanel .cad-floor{background:#fff;margin:0 auto 24px;max-width:1100px;box-shadow:0 8px 24px rgba(0,0,0,.14);border:1px solid #b7bbc0}
      #conceptPlanPanel .cad-svg{display:block;width:100%;height:auto;min-width:760px;font-family:Arial,Helvetica,sans-serif}
      #conceptPlanPanel .cad-wall{stroke:#111;stroke-width:7;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-room{fill:#fff;stroke:#333;stroke-width:2;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-room-light{fill:#f7f7f7;stroke:#333;stroke-width:2;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-label{font-size:15px;font-weight:700;letter-spacing:.7px;text-anchor:middle;dominant-baseline:middle;fill:#111}
      #conceptPlanPanel .cad-sub{font-size:11px;text-anchor:middle;fill:#444}
      #conceptPlanPanel .cad-title{font-size:19px;font-weight:700;letter-spacing:1.2px;fill:#111}
      #conceptPlanPanel .cad-dim{stroke:#333;stroke-width:1.2;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-dimtext{font-size:12px;font-weight:600;text-anchor:middle;fill:#222}
      #conceptPlanPanel .cad-window{stroke:#1476b8;stroke-width:6;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-door{stroke:#111;stroke-width:1.5;fill:none;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-furniture{stroke:#555;stroke-width:1.2;fill:#fafafa;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-note{font-size:10px;fill:#555}
      #conceptPlanPanel .cad-grid{stroke:#ddd;stroke-width:1;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-axis{font-size:10px;font-weight:700;fill:#555;text-anchor:middle}
      #conceptPlanPanel .cad-north{font-size:13px;font-weight:700;fill:#111;text-anchor:middle}
      #conceptPlanPanel .cad-titleblock{fill:#fff;stroke:#222;stroke-width:1.5;vector-effect:non-scaling-stroke}
      #conceptPlanPanel .cad-tbtext{font-size:10px;fill:#222}
      @media print{body *{visibility:hidden!important}#conceptPlanPanel,#conceptPlanPanel *{visibility:visible!important}#conceptPlanPanel{position:absolute!important;left:0!important;top:0!important;width:100%!important;background:#fff!important}.cad-floor{box-shadow:none!important;page-break-after:always!important}.cad-plan{background:#fff!important;padding:0!important;border:0!important;overflow:visible!important}.cad-svg{min-width:0!important;width:100%!important}}
    `; document.head.appendChild(s);
  };
  function makePanel(){
    let panel=document.getElementById('conceptPlanPanel'); if(panel)return panel;
    const section=document.getElementById('herramientas'); if(!section)return null;
    panel=document.createElement('div'); panel.id='conceptPlanPanel'; panel.className='budget-panel hidden';
    panel.innerHTML=`<div class="budget-top"><div><div class="section-tag">ARQUITECTURA / PLANO 2D</div><h3>Generador de plano arquitectónico profesional</h3><p>Representación conceptual con proporción, muros, puertas, ventanas, mobiliario, ejes, cotas y cuadro de datos.</p></div><button id="closeConceptPlan" class="secondary" type="button">Cerrar</button></div>
      <div class="form-grid"><div><label>Frente (m)</label><input id="planL" type="number" min="1" step="0.1" value="8"></div><div><label>Fondo (m)</label><input id="planW" type="number" min="1" step="0.1" value="20"></div></div>
      <div class="form-grid"><div><label>Niveles</label><select id="planLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">3 plantas</option></select></div><div><label>Recámaras</label><input id="planRooms" type="number" min="1" max="8" value="3"></div></div>
      <div class="form-grid"><div><label>Baños</label><input id="planBaths" type="number" min="1" max="6" value="2"></div><div><label>Autos</label><input id="planCars" type="number" min="0" max="4" value="2"></div></div>
      <label>Necesidades adicionales</label><textarea id="planNeeds" rows="3" placeholder="Ej. lavandería, estudio, terraza, jardín, cuarto de servicio..."></textarea>
      <button id="generateConceptPlan" class="primary full" type="button">Generar plano profesional ✦</button><p id="conceptPlanMessage" class="message"></p><div id="conceptPlanResult"></div>`;
    section.appendChild(panel); addStyles(); return panel;
  }
  function openPanel(){const p=makePanel();if(!p)return;p.classList.remove('hidden');p.scrollIntoView({behavior:'smooth',block:'center'});}
  window.openConceptPlanPanel=openPanel;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const room=(x,y,w,h,n)=>`<g><rect class="cad-room" x="${x}" y="${y}" width="${w}" height="${h}"/><text class="cad-label" x="${x+w/2}" y="${y+h/2}">${esc(n)}</text></g>`;
  const furniture=(x,y,w,h,type)=>{if(type==='bed')return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><line x1="${x}" y1="${y+h*.24}" x2="${x+w}" y2="${y+h*.24}"/><rect x="${x+5}" y="${y+5}" width="${w/2-8}" height="${h*.16}" rx="2"/><rect x="${x+w/2+3}" y="${y+5}" width="${w/2-8}" height="${h*.16}" rx="2"/></g>`;if(type==='sofa')return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/><line x1="${x+8}" y1="${y+h*.25}" x2="${x+w-8}" y2="${y+h*.25}"/></g>`;if(type==='table')return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><circle cx="${x-10}" cy="${y+h/2}" r="7"/><circle cx="${x+w+10}" cy="${y+h/2}" r="7"/></g>`;if(type==='car')return `<g class="cad-furniture"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><rect x="${x+w*.18}" y="${y+h*.18}" width="${w*.64}" height="${h*.42}" rx="7"/><circle cx="${x+w*.2}" cy="${y+h*.82}" r="7"/><circle cx="${x+w*.8}" cy="${y+h*.82}" r="7"/></g>`;return '';};
  const door=(x,y,w,vertical=false)=>vertical?`<g class="cad-door"><line x1="${x}" y1="${y}" x2="${x}" y2="${y+w}"/><path d="M ${x} ${y} A ${w} ${w} 0 0 1 ${x+w} ${y+w}"/></g>`:`<g class="cad-door"><line x1="${x}" y1="${y}" x2="${x+w}" y2="${y}"/><path d="M ${x} ${y} A ${w} ${w} 0 0 1 ${x+w} ${y-w}"/></g>`;
  const win=(x,y,w,vertical=false)=>vertical?`<line class="cad-window" x1="${x}" y1="${y}" x2="${x}" y2="${y+w}"/>`:`<line class="cad-window" x1="${x}" y1="${y}" x2="${x+w}" y2="${y}"/>`;
  function draw(){
    const L=Number(document.getElementById('planL').value)||0,W=Number(document.getElementById('planW').value)||0,levels=Number(document.getElementById('planLevels').value)||1,rooms=Math.max(1,Number(document.getElementById('planRooms').value)||1),baths=Math.max(1,Number(document.getElementById('planBaths').value)||1),cars=Math.max(0,Number(document.getElementById('planCars').value)||0),needs=document.getElementById('planNeeds').value.trim();
    const msg=document.getElementById('conceptPlanMessage'),out=document.getElementById('conceptPlanResult');if(!L||!W){msg.textContent='Ingresa frente y fondo del terreno.';return;}msg.textContent='✦ Preparando presentación arquitectónica...';
    const scale=Math.min(38,900/L,1000/W),pad=110,fw=L*scale,fh=W*scale,tw=fw+pad*2+250,th=fh+pad*2+100;
    const floor=level=>{
      let s=`<svg class="cad-svg" viewBox="0 0 ${tw} ${th}" role="img" aria-label="Plano arquitectónico conceptual planta ${level}"><rect width="${tw}" height="${th}" fill="#fff"/><text class="cad-title" x="${pad}" y="34">OFIELD AI · PLANO ARQUITECTÓNICO CONCEPTUAL</text><text class="cad-sub" x="${pad}" y="52">PLANTA ${level} · ${L.toFixed(2)} × ${W.toFixed(2)} m · ESCALA GRÁFICA</text>`;
      s+=`<rect class="cad-wall" x="${pad}" y="${pad}" width="${fw}" height="${fh}" fill="#fff"/>`;
      // Ejes
      const cols=4; for(let i=0;i<=cols;i++){const x=pad+(fw*i/cols);s+=`<line class="cad-grid" x1="${x}" y1="${pad-18}" x2="${x}" y2="${pad}"/><text class="cad-axis" x="${x}" y="${pad-25}">${i+1}</text>`;}
      const rows=Math.max(4,Math.ceil(W/4)); for(let i=0;i<=rows;i++){const y=pad+(fh*i/rows);s+=`<line class="cad-grid" x1="${pad-18}" y1="${y}" x2="${pad}" y2="${y}"/><text class="cad-axis" x="${pad-28}" y="${y+3}">${String.fromCharCode(65+i)}</text>`;}
      // Cotas principales
      s+=`<line class="cad-dim" x1="${pad}" y1="${pad-45}" x2="${pad+fw}" y2="${pad-45}"/><line class="cad-dim" x1="${pad}" y1="${pad-52}" x2="${pad}" y2="${pad-38}"/><line class="cad-dim" x1="${pad+fw}" y1="${pad-52}" x2="${pad+fw}" y2="${pad-38}"/><text class="cad-dimtext" x="${pad+fw/2}" y="${pad-56}">${L.toFixed(2)} m</text>`;
      s+=`<line class="cad-dim" x1="${pad-45}" y1="${pad}" x2="${pad-45}" y2="${pad+fh}"/><line class="cad-dim" x1="${pad-52}" y1="${pad}" x2="${pad-38}" y2="${pad}"/><line class="cad-dim" x1="${pad-52}" y1="${pad+fh}" x2="${pad-38}" y2="${pad+fh}"/><text class="cad-dimtext" transform="translate(${pad-65},${pad+fh/2}) rotate(-90)">${W.toFixed(2)} m</text>`;
      if(level===1){
        const front=Math.min(4.8*scale,fh*.25),y1=pad+front,left=fw*.62,right=fw-left,mid=y1+(fh-front)*.5;
        s+=room(pad+3,pad+3,fw-6,front-6,'COCHERA');
        s+=room(pad+3,y1+3,left*.5-6,(mid-y1)-6,'SALA');s+=room(pad+left*.5,y1+3,left*.5-6,(mid-y1)-6,'COMEDOR');s+=room(pad+left,y1+3,right-6,(mid-y1)-6,'COCINA');
        s+=room(pad+3,mid+3,left*.5-6,fh-(mid-pad)-6,'BAÑO');s+=room(pad+left*.5,mid+3,left*.5-6,fh-(mid-pad)-6,'ESCALERA');s+=room(pad+left,mid+3,right-6,fh-(mid-pad)-6,'PATIO');
        s+=door(pad+fw*.5,pad+front,32);s+=door(pad+left*.5,y1+40,28);s+=door(pad+left*.5,mid,28);s+=win(pad+25,pad+front,fw*.28);s+=win(pad+left+20,pad+front+25,right*.65);s+=win(pad+25,pad+fh-25,left*.25);s+=win(pad+fw-25,y1+25,70,true);
        s+=furniture(pad+35,y1+35,80,35,'sofa');s+=furniture(pad+left*.55,y1+35,65,45,'table');if(cars>0){for(let c=0;c<Math.min(cars,2);c++)s+=furniture(pad+40+c*fw*.43,pad+35,75,145,'car');}
      } else {
        const top=Math.min(3.8*scale,fh*.2),y0=pad+top,cellW=fw/2,cellH=(fh-top)/Math.max(2,Math.ceil(rooms/2)+1);
        s+=room(pad+3,pad+3,fw*.5-6,top-6,'ESTAR / DISTRIBUIDOR');s+=room(pad+fw*.5,pad+3,fw*.5-6,top-6,'BAÑO');
        for(let i=0;i<rooms;i++){const x=pad+(i%2)*cellW,y=y0+Math.floor(i/2)*cellH;s+=room(x+3,y+3,cellW-6,cellH-6,'RECÁMARA '+(i+1));s+=furniture(x+cellW*.38,y+cellH*.38,70,42,'bed');s+=win(x+cellW*.2,y+3,cellW*.25);}
        const lastY=y0+Math.ceil(rooms/2)*cellH;s+=room(pad+3,lastY+3,fw*.5-6,Math.max(30,fh-(lastY-pad)-6),needs?'ESPACIO FLEXIBLE':'TERRAZA');s+=room(pad+fw*.5,lastY+3,fw*.5-6,Math.max(30,fh-(lastY-pad)-6),'BAÑO / SERVICIO');s+=door(pad+fw*.5,pad+top,30);s+=win(pad+fw-25,pad+top+20,80,true);
      }
      // Norte + escala gráfica + cuadro de datos
      const nx=pad+fw+90,ny=pad+40;s+=`<g><text class="cad-north" x="${nx}" y="${ny}">N</text><path d="M ${nx} ${ny+45} L ${nx-10} ${ny+20} L ${nx} ${ny+25} L ${nx+10} ${ny+20} Z" fill="#111"/></g>`;
      const bar=100;s+=`<line class="cad-dim" x1="${nx-45}" y1="${ny+90}" x2="${nx+55}" y2="${ny+90}"/><line class="cad-dim" x1="${nx-45}" y1="${ny+84}" x2="${nx-45}" y2="${ny+96}"/><line class="cad-dim" x1="${nx+5}" y1="${ny+84}" x2="${nx+5}" y2="${ny+96}"/><line class="cad-dim" x1="${nx+55}" y1="${ny+84}" x2="${nx+55}" y2="${ny+96}"/><text class="cad-tbtext" x="${nx+5}" y="${ny+108}" text-anchor="middle">ESCALA GRÁFICA</text>`;
      const bx=tw-225,by=th-145;s+=`<rect class="cad-titleblock" x="${bx}" y="${by}" width="190" height="120"/><text class="cad-tbtext" x="${bx+10}" y="${by+18}" font-weight="700">OFIELD AI</text><text class="cad-tbtext" x="${bx+10}" y="${by+35}">PLANO CONCEPTUAL</text><text class="cad-tbtext" x="${bx+10}" y="${by+52}">PLANTA ${level}</text><text class="cad-tbtext" x="${bx+10}" y="${by+69}">TERRENO: ${L.toFixed(2)} × ${W.toFixed(2)} m</text><text class="cad-tbtext" x="${bx+10}" y="${by+86}">ÁREA: ${(L*W).toFixed(2)} m²</text><text class="cad-tbtext" x="${bx+10}" y="${by+103}">CONCEPTUAL · NO EJECUTIVO</text>`;
      s+=`<text class="cad-note" x="${pad}" y="${th-18}">Muros, cotas y distribución son orientativos. Verificar estructura, instalaciones, reglamento y medidas en proyecto ejecutivo.</text></svg>`;return s;
    };
    let drawings='';for(let i=1;i<=levels;i++)drawings+=`<div class="cad-floor">${floor(i)}</div>`;
    out.innerHTML=`<div class="result-box"><h3>Plano arquitectónico conceptual · ${L} × ${W} m</h3><p><strong>Terreno:</strong> ${(L*W).toFixed(2)} m² · <strong>Niveles:</strong> ${levels} · <strong>Recámaras:</strong> ${rooms} · <strong>Baños:</strong> ${baths} · <strong>Autos:</strong> ${cars}</p><div class="cad-plan">${drawings}</div><p class="message">⚠️ Presentación arquitectónica conceptual. No sustituye un proyecto ejecutivo firmado.</p><button id="printConceptPlan" class="primary" type="button">▣ Imprimir / Guardar PDF</button></div>`;
    document.getElementById('printConceptPlan').onclick=()=>window.print();msg.textContent='✓ Plano profesional generado.';
  }
  window.generateConceptPlan=draw;
  document.addEventListener('click',e=>{const o=e.target.closest('#openConceptPlan');if(o){e.preventDefault();openPanel();return;}if(e.target.closest('#closeConceptPlan')){e.preventDefault();const p=document.getElementById('conceptPlanPanel');if(p)p.classList.add('hidden');return;}if(e.target.closest('#generateConceptPlan')){e.preventDefault();draw();}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makePanel);else makePanel();
})();