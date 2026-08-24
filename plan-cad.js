(() => {
  const STYLE_ID = 'ofield-plan-cad-style-v2';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = `
      #conceptPlanPanel.plan-cad-v2{background:#f3f4f6}
      #conceptPlanPanel .cad-v2-wrap{background:#e7e8ea;border:1px solid #c9c9c9;border-radius:12px;padding:18px;overflow:auto}
      #conceptPlanPanel .cad-v2-sheets{display:flex;gap:18px;align-items:flex-start;min-width:max-content}
      #conceptPlanPanel .cad-v2-sheet{background:#fff;border:1px solid #b9b9b9;box-shadow:0 5px 18px rgba(0,0,0,.12);padding:10px}
      #conceptPlanPanel .cad-v2-svg{display:block;width:440px;height:auto;background:#fff;font-family:Arial,Helvetica,sans-serif}
      #conceptPlanPanel .cad-v2-title{font-size:15px;font-weight:700;fill:#111;text-anchor:middle}
      #conceptPlanPanel .cad-v2-label{font-size:12px;font-weight:700;fill:#111;text-anchor:middle;dominant-baseline:middle}
      #conceptPlanPanel .cad-v2-small{font-size:8px;fill:#333;text-anchor:middle}
      #conceptPlanPanel .cad-v2-dim{stroke:#333;stroke-width:1;fill:none}
      #conceptPlanPanel .cad-v2-dimtext{font-size:9px;font-weight:700;fill:#222;text-anchor:middle}
      #conceptPlanPanel .cad-v2-wall{stroke:#111;stroke-width:7;fill:#fff;stroke-linejoin:miter}
      #conceptPlanPanel .cad-v2-inner{stroke:#222;stroke-width:4;fill:none}
      #conceptPlanPanel .cad-v2-thin{stroke:#555;stroke-width:1.3;fill:none}
      #conceptPlanPanel .cad-v2-door{stroke:#111;stroke-width:1.2;fill:none}
      #conceptPlanPanel .cad-v2-window{stroke:#1d5f86;stroke-width:4;fill:none}
      #conceptPlanPanel .cad-v2-furn{stroke:#555;stroke-width:1.1;fill:#f9f9f9}
      #conceptPlanPanel .cad-v2-car{stroke:#555;stroke-width:1.2;fill:#f4f4f4}
      #conceptPlanPanel .cad-v2-axis{font-size:8px;font-weight:700;fill:#555;text-anchor:middle}
      #conceptPlanPanel .cad-v2-note{font-size:8px;fill:#444}
      #conceptPlanPanel .cad-v2-north{font-size:11px;font-weight:700;fill:#111;text-anchor:middle}
      #conceptPlanPanel .cad-v2-legend{font-size:8px;fill:#333}
      #conceptPlanPanel .cad-v2-card{background:#fff;border:1px solid #ccc;padding:12px;margin-top:14px}
      @media(max-width:900px){#conceptPlanPanel .cad-v2-svg{width:360px}}
      @media print{body *{visibility:hidden!important}#conceptPlanPanel,#conceptPlanPanel *{visibility:visible!important}#conceptPlanPanel{position:absolute!important;left:0!important;top:0!important;width:100%!important;background:#fff!important}.cad-v2-wrap{background:#fff!important;border:0!important;padding:0!important;overflow:visible!important}.cad-v2-sheets{gap:6px!important}.cad-v2-sheet{box-shadow:none!important;page-break-inside:avoid!important}.cad-v2-svg{width:31vw!important;max-width:none!important}}
    `;
    document.head.appendChild(s);
  }

  function ensurePanel(){
    let panel=document.getElementById('conceptPlanPanel');
    if(panel){styles();return panel;}
    const section=document.getElementById('herramientas'); if(!section)return null;
    panel=document.createElement('div'); panel.id='conceptPlanPanel'; panel.className='budget-panel hidden plan-cad-v2';
    panel.innerHTML=`<div class="budget-top"><div><div class="section-tag">ARQUITECTURA / PLANO 2D</div><h3>Generador de plano arquitectónico</h3><p>Diseño conceptual tipo plano: muros, puertas, ventanas, muebles, cotas, ejes y distribución por planta.</p></div><button id="closePlanCadV2" class="secondary" type="button">Cerrar</button></div>
      <div class="form-grid"><div><label for="cadL">Frente del terreno (m)</label><input id="cadL" type="number" min="3" step="0.1" value="8"></div><div><label for="cadW">Fondo del terreno (m)</label><input id="cadW" type="number" min="5" step="0.1" value="20"></div></div>
      <div class="form-grid"><div><label for="cadLevels">Niveles</label><select id="cadLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">2 plantas + roof garden</option></select></div><div><label for="cadRooms">Recámaras</label><input id="cadRooms" type="number" min="1" max="6" value="3"></div></div>
      <div class="form-grid"><div><label for="cadBaths">Baños</label><input id="cadBaths" type="number" min="1" max="5" value="2"></div><div><label for="cadCars">Autos</label><input id="cadCars" type="number" min="0" max="3" value="2"></div></div>
      <label for="cadNeeds">Necesidades</label><textarea id="cadNeeds" rows="3" placeholder="Ej. cocina abierta, patio, lavandería, estudio, terraza..."></textarea>
      <button id="generateCadV2" class="primary full" type="button">Generar plano ✦</button><p id="cadV2Msg" class="message"></p><div id="cadV2Result"></div>`;
    section.appendChild(panel); styles();
    document.getElementById('closePlanCadV2').onclick=()=>panel.classList.add('hidden');
    document.getElementById('generateCadV2').onclick=generate;
    return panel;
  }

  function line(x1,y1,x2,y2,c='cad-v2-thin'){return `<line class="${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;}
  function rect(x,y,w,h,c='cad-v2-furn',r=0){return `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" ${r?`rx="${r}"`:''}/>`;}
  function txt(x,y,t,c='cad-v2-label'){return `<text class="${c}" x="${x}" y="${y}">${esc(t)}</text>`;}
  function room(x,y,w,h,name,sub='') { return `<g>${rect(x,y,w,h,'cad-v2-thin')} ${txt(x+w/2,y+h/2-3,name)}${sub?txt(x+w/2,y+h/2+10,sub,'cad-v2-small'):''}</g>`; }
  function bed(x,y,w,h){return `${rect(x,y,w,h,'cad-v2-furn',3)}${line(x,y+h*.25,x+w,y+h*.25)}${rect(x+5,y+4,w*.42,h*.16,'cad-v2-furn',2)}${rect(x+w*.53,y+4,w*.42,h*.16,'cad-v2-furn',2)}`;}
  function sofa(x,y,w,h){return `${rect(x,y,w,h,'cad-v2-furn',4)}${line(x+7,y+h*.3,x+w-7,y+h*.3)}`;}
  function table(x,y,w,h){return `${rect(x,y,w,h,'cad-v2-furn',4)}${[x-9,x+w+9].map(cx=>`<circle class="cad-v2-furn" cx="${cx}" cy="${y+h/2}" r="6"/>`).join('')}`;}
  function car(x,y,w,h){return `${rect(x,y,w,h,'cad-v2-car',12)}${rect(x+w*.18,y+h*.18,w*.64,h*.38,'cad-v2-furn',7)}<circle class="cad-v2-furn" cx="${x+w*.2}" cy="${y+h*.84}" r="6"/><circle class="cad-v2-furn" cx="${x+w*.8}" cy="${y+h*.84}" r="6"/>`;}
  function doorH(x,y,w){return `${line(x,y,x+w,y,'cad-v2-door')}<path class="cad-v2-door" d="M ${x} ${y} A ${w} ${w} 0 0 1 ${x+w} ${y-w}"/>`;}
  function doorV(x,y,w){return `${line(x,y,x,y+w,'cad-v2-door')}<path class="cad-v2-door" d="M ${x} ${y} A ${w} ${w} 0 0 0 ${x+w} ${y+w}"/>`;}
  function windowH(x,y,w){return line(x,y,x+w,y,'cad-v2-window');}
  function windowV(x,y,h){return line(x,y,x,y+h,'cad-v2-window');}

  function dimensions(L,W,x0,y0,fw,fh){
    let s='';
    s+=line(x0,y0-28,x0+fw,y0-28,'cad-v2-dim');s+=line(x0,y0-34,x0,y0-22,'cad-v2-dim');s+=line(x0+fw,y0-34,x0+fw,y0-22,'cad-v2-dim');s+=txt(x0+fw/2,y0-35,L.toFixed(2)+' m','cad-v2-dimtext');
    s+=line(x0-28,y0,x0-28,y0+fh,'cad-v2-dim');s+=line(x0-34,y0,x0-22,y0,'cad-v2-dim');s+=line(x0-34,y0+fh,x0-22,y0+fh,'cad-v2-dim');s+=`<text class="cad-v2-dimtext" transform="translate(${x0-40},${y0+fh/2}) rotate(-90)">${W.toFixed(2)} m</text>`;
    return s;
  }

  function sheet(level,L,W,rooms,baths,cars,needs,roof=false){
    const VBW=620,VBH=800,x0=105,y0=145,fw=360,fh=Math.max(500,Math.min(590,W/L*fw));
    let s=`<svg class="cad-v2-svg" viewBox="0 0 ${VBW} ${VBH}"><rect x="0" y="0" width="620" height="800" fill="#fff"/>`;
    s+=txt(310,30,roof?'PLANTA ROOF GARDEN':`PLANTA ${level}`,'cad-v2-title');
    s+=txt(310,49,`${L.toFixed(2)} × ${W.toFixed(2)} m`,'cad-v2-small');
    // axis bubbles
    for(let i=0;i<=4;i++){const x=x0+fw*i/4;s+=txt(x,y0-63,String(i+1),'cad-v2-axis');s+=`<circle cx="${x}" cy="${y0-77}" r="9" fill="#fff" stroke="#555"/><text class="cad-v2-axis" x="${x}" y="${y0-74}">${i+1}</text>`;}
    for(let i=0;i<=5;i++){const y=y0+fh*i/5;s+=`<circle cx="${x0-62}" cy="${y}" r="9" fill="#fff" stroke="#555"/><text class="cad-v2-axis" x="${x0-62}" y="${y+3}">${String.fromCharCode(65+i)}</text>`;}
    s+=dimensions(L,W,x0,y0,fw,fh);
    s+=`<rect class="cad-v2-wall" x="${x0}" y="${y0}" width="${fw}" height="${fh}"/>`;
    const addRooms=()=>{
      if(level===1){
        const front=120, socialY=y0+front, mid=y0+330, left=220;
        s+=room(x0+5,y0+5,fw-10,front-10,'COCHERA',`${cars} auto(s)`);
        if(cars){const gap=fw/(Math.min(cars,2)+1);for(let i=0;i<Math.min(cars,2);i++)s+=car(x0+gap*(i+0.55)-28,y0+22,56,88);}
        s+=room(x0+5,socialY+5,left-10,mid-socialY-10,'SALA');s+=sofa(x0+25,socialY+35,75,34);s+=room(x0+left+5,socialY+5,120,mid-socialY-10,'COMEDOR');s+=table(x0+left+32,socialY+45,58,30);s+=room(x0+left+125,socialY+5,fw-left-130,mid-socialY-10,'COCINA','abierta');
        s+=room(x0+5,mid+5,110,fh-(mid-y0)-10,'BAÑO');s+=room(x0+115,mid+5,105,fh-(mid-y0)-10,'ESCALERA');s+=room(x0+225,mid+5,fw-230,fh-(mid-y0)-10,'PATIO / SERVICIO');
        s+=doorH(x0+fw*.5,socialY,30);s+=doorH(x0+left,socialY+45,26);s+=doorH(x0+115,mid+25,26);s+=windowH(x0+20,y0+front,80);s+=windowV(x0+fw, socialY+35,70);s+=windowH(x0+245,y0+fh,70);
      } else if(roof){
        s+=room(x0+5,y0+5,fw-10,fh*.26-10,'TERRAZA / ROOF GARDEN');s+=room(x0+5,y0+fh*.26+5,fw*.55-10,fh*.34-10,'ÁREA SOCIAL');s+=room(x0+fw*.55+5,y0+fh*.26+5,fw*.45-10,fh*.34-10,'PÉRGOLA');s+=room(x0+5,y0+fh*.60+5,fw*.45-10,fh*.40-10,'CUARTO DE SERVICIO');s+=room(x0+fw*.45+5,y0+fh*.60+5,fw*.55-10,fh*.40-10,'VACÍO / ESCALERA');
        s+=table(x0+45,y0+fh*.35,70,35);s+=doorH(x0+fw*.45,y0+fh*.60,28);s+=windowH(x0+30,y0+fh,90);s+=windowV(x0+fw,y0+80,80);
      } else {
        const top=75,y1=y0+top,cols=2,rowH=(fh-top)/Math.max(2,Math.ceil(rooms/2));
        s+=room(x0+5,y0+5,fw*.55-10,top-10,'ESTAR / DISTRIBUIDOR');s+=room(x0+fw*.55+5,y0+5,fw*.45-10,top-10,'BAÑO');
        for(let i=0;i<rooms;i++){const col=i%2,row=Math.floor(i/2),x=x0+col*fw/2,y=y1+row*rowH;s+=room(x+5,y+5,fw/2-10,rowH-10,'RECÁMARA '+(i+1));s+=bed(x+fw*.25-25,y+rowH*.42,60,38);s+=windowH(x+22,y+rowH-3,55);s+=doorH(x,y+rowH*.52,24);}
        const yb=y1+Math.ceil(rooms/2)*rowH;s+=room(x0+5,yb+5,fw*.5-10,Math.max(55,fh-(yb-y0)-10),'BAÑO');s+=room(x0+fw*.5+5,yb+5,fw*.5-10,Math.max(55,fh-(yb-y0)-10),needs?'ESTUDIO / FLEXIBLE':'TERRAZA');s+=doorH(x0+fw*.55,y1,25);s+=windowV(x0+fw,y1+30,70);
      }
    };
    addRooms();
    // north, graphic scale, title block
    s+=`<g><text class="cad-v2-north" x="${x0+fw+95}" y="${y0+25}">N</text><path d="M ${x0+fw+95} ${y0+35} l -7 16 h 14 z" fill="#111"/></g>`;
    s+=line(x0+fw+45,y0+fh-45,x0+fw+145,y0+fh-45,'cad-v2-dim');s+=line(x0+fw+45,y0+fh-50,x0+fw+45,y0+fh-40,'cad-v2-dim');s+=line(x0+fw+95,y0+fh-50,x0+fw+95,y0+fh-40,'cad-v2-dim');s+=line(x0+fw+145,y0+fh-50,x0+fw+145,y0+fh-40,'cad-v2-dim');s+=txt(x0+fw+95,y0+fh-57,'0   2.5   5 m','cad-v2-small');
    s+=`<rect x="${x0+fw+38}" y="${y0+fh-130}" width="160" height="62" fill="#fff" stroke="#222"/>`;s+=txt(x0+fw+118,y0+fh-110,'OFIELD AI','cad-v2-note');s+=txt(x0+fw+118,y0+fh-96,'PLANO CONCEPTUAL','cad-v2-note');s+=txt(x0+fw+118,y0+fh-82,roof?'ROOF GARDEN':`PLANTA ${level}`,'cad-v2-note');
    s+=`</svg>`; return s;
  }

  function generate(){
    const L=Number(document.getElementById('cadL').value)||0,W=Number(document.getElementById('cadW').value)||0,mode=Number(document.getElementById('cadLevels').value)||2,rooms=Math.max(1,Number(document.getElementById('cadRooms').value)||1),baths=Math.max(1,Number(document.getElementById('cadBaths').value)||1),cars=Math.max(0,Number(document.getElementById('cadCars').value)||0),needs=document.getElementById('cadNeeds').value.trim();
    const msg=document.getElementById('cadV2Msg'),out=document.getElementById('cadV2Result'); if(!L||!W){msg.textContent='Ingresa las medidas del terreno.';return;}
    msg.textContent='✦ Dibujando plano arquitectónico...';
    const sheets=[sheet(1,L,W,rooms,baths,cars,needs,false),sheet(2,L,W,rooms,baths,cars,needs,false)]; if(mode===3)sheets.push(sheet(3,L,W,rooms,baths,cars,needs,true));
    out.innerHTML=`<div class="cad-v2-card"><h3>Plano arquitectónico conceptual · ${L.toFixed(2)} × ${W.toFixed(2)} m</h3><p><strong>Terreno:</strong> ${(L*W).toFixed(2)} m² · <strong>Recámaras:</strong> ${rooms} · <strong>Baños:</strong> ${baths} · <strong>Autos:</strong> ${cars}</p><div class="cad-v2-wrap"><div class="cad-v2-sheets">${sheets.map((v,i)=>`<div class="cad-v2-sheet">${v}</div>`).join('')}</div></div><p class="message">⚠️ Es un plano conceptual. Las medidas, estructura, instalaciones, orientación, retiros y normativa deben verificarse antes de construir.</p><button id="printCadV2" class="primary" type="button">▣ Imprimir / Guardar PDF</button></div>`;
    document.getElementById('printCadV2').onclick=()=>window.print(); msg.textContent='✓ Plano generado.';
  }

  function expose(){
    styles();
    window.openConceptPlanPanel=()=>{const p=ensurePanel();if(p){p.classList.remove('hidden');p.scrollIntoView({behavior:'smooth',block:'center'});}};
    const old=document.getElementById('openConceptPlan'); if(old){old.onclick=e=>{e.preventDefault();window.openConceptPlanPanel();};}
    ensurePanel();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',expose);else expose();
})();