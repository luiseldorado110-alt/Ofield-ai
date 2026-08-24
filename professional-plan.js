(() => {
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const $=id=>document.getElementById(id);
const STYLE='ofield-plan-reference-v3';
function addCss(){if($(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
#conceptPlanPanel.ofield-prof-v3{background:#151515;color:#eee}
.ofield-prof-v3 .prof-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
.ofield-prof-v3 .prof-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ofield-prof-v3 label{display:block;margin:10px 0 6px;font-size:13px;font-weight:700;color:#ddd}
.ofield-prof-v3 input,.ofield-prof-v3 select,.ofield-prof-v3 textarea{width:100%;box-sizing:border-box;background:#202020;color:#eee;border:1px solid #444;border-radius:9px;padding:11px}
.ofield-prof-v3 input:focus,.ofield-prof-v3 select:focus,.ofield-prof-v3 textarea:focus{outline:2px solid #caa74a;border-color:#caa74a}
.ofield-prof-v3 .prof-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ofield-prof-v3 .sheet-wrap{margin-top:18px;background:#3a3a3a;border:1px solid #555;border-radius:12px;padding:18px;overflow:auto}
.ofield-prof-v3 .sheet{background:#fff;color:#111;width:1080px;margin:auto;padding:24px;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}
.ofield-prof-v3 .plan-title{font-size:20px;font-weight:800;text-anchor:middle;fill:#111}.ofield-prof-v3 .plan-sub{font-size:10px;text-anchor:middle;fill:#555}.ofield-prof-v3 .lbl{font-size:11px;font-weight:700;text-anchor:middle;dominant-baseline:middle;fill:#111}.ofield-prof-v3 .sub{font-size:8px;text-anchor:middle;fill:#555}.ofield-prof-v3 .wall{fill:#fff;stroke:#111;stroke-width:10;stroke-linejoin:miter}.ofield-prof-v3 .iwall{fill:#fff;stroke:#111;stroke-width:5}.ofield-prof-v3 .thin{fill:none;stroke:#777;stroke-width:1.2}.ofield-prof-v3 .door{fill:none;stroke:#111;stroke-width:1.5}.ofield-prof-v3 .win{stroke:#1c79a6;stroke-width:5}.ofield-prof-v3 .furn{fill:#fafafa;stroke:#666;stroke-width:1.1}.ofield-prof-v3 .fixture{fill:#f4f4f4;stroke:#555;stroke-width:1}.ofield-prof-v3 .garden{fill:#e8f3df;stroke:#6a8f42;stroke-width:1.5;stroke-dasharray:4 3}.ofield-prof-v3 .plant{fill:none;stroke:#6a8f42;stroke-width:2}.ofield-prof-v3 .water{fill:#dceef8;stroke:#6ca8c8;stroke-width:1}.ofield-prof-v3 .plot{fill:none;stroke:#aaa;stroke-width:1;stroke-dasharray:5 4}.ofield-prof-v3 .dim{fill:none;stroke:#333;stroke-width:1}.ofield-prof-v3 .dimt{font-size:10px;font-weight:700;text-anchor:middle;fill:#222}.ofield-prof-v3 .axis{font-size:9px;font-weight:700;text-anchor:middle;fill:#555}.ofield-prof-v3 .note{font-size:9px;fill:#555}.ofield-prof-v3 .tb{border:2px solid #111;margin-top:10px;display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr}.ofield-prof-v3 .tb div{border-right:1px solid #111;padding:7px;font-size:10px}.ofield-prof-v3 .tb div:last-child{border-right:0}.ofield-prof-v3 .areas{margin-top:12px;border-collapse:collapse;width:100%;font-size:11px}.ofield-prof-v3 .areas th,.ofield-prof-v3 .areas td{border:1px solid #999;padding:6px}.ofield-prof-v3 .areas th{background:#eee}.ofield-prof-v3 .disclaimer{color:#aaa;font-size:12px;margin-top:10px}.ofield-prof-v3 .hidden{display:none!important}
@media(max-width:700px){.ofield-prof-v3 .prof-grid{grid-template-columns:1fr}.ofield-prof-v3 .sheet{width:960px}}
@media print{body *{visibility:hidden!important}#conceptPlanPanel,#conceptPlanPanel *{visibility:visible!important}#conceptPlanPanel{position:absolute!important;left:0!important;top:0!important;width:100%!important;background:#fff!important}.ofield-prof-v3 .sheet-wrap{background:#fff!important;border:0!important;padding:0!important;overflow:visible!important}.ofield-prof-v3 .sheet{box-shadow:none!important;width:100%!important}.ofield-prof-v3 .disclaimer{color:#444}}
`;document.head.appendChild(s)}
function panel(){addCss();let p=$('conceptPlanPanel');if(!p){const sec=$('herramientas');if(!sec)return null;p=document.createElement('section');p.id='conceptPlanPanel';p.className='budget-panel hidden ofield-prof-v3';sec.appendChild(p)}p.innerHTML=`<div class="prof-head"><div><div class="section-tag">ARQUITECTURA / PLANO CONCEPTUAL</div><h3>Generador de plano arquitectónico</h3><p>Distribución tipo vivienda: jardines, acceso, vestíbulo, pasillos, zonas sociales, servicios y recámaras.</p></div><button id="profCloseV3" class="secondary" type="button">Cerrar</button></div><div class="prof-grid"><div><label>Frente del terreno (m)</label><input id="profL" type="number" min="3" step="0.1" value="8"></div><div><label>Fondo del terreno (m)</label><input id="profW" type="number" min="5" step="0.1" value="20"></div><div><label>Niveles</label><select id="profLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">2 plantas + roof garden</option></select></div><div><label>Recámaras</label><input id="profRooms" type="number" min="1" max="6" value="3"></div><div><label>Baños</label><input id="profBaths" type="number" min="1" max="5" value="2"></div><div><label>Autos</label><input id="profCars" type="number" min="0" max="3" value="2"></div></div><label>Necesidades especiales</label><textarea id="profNeeds" rows="3" placeholder="Cocina abierta, patio, lavandería, estudio, terraza, jardín..."></textarea><div class="prof-tools"><button id="profGenerateV3" class="primary" type="button">Generar plano ✦</button><button id="profPrintV3" class="secondary" type="button">▣ Guardar PDF</button><button id="profSaveV3" class="secondary" type="button">＋ Guardar plano</button></div><p id="profMsgV3" class="message"></p><div id="profResultV3"></div>`;$('#profCloseV3').onclick=()=>p.classList.add('hidden');$('#profGenerateV3').onclick=generate;$('#profPrintV3').onclick=()=>window.print();$('#profSaveV3').onclick=save;return p}
function open(){const p=panel();if(p){p.classList.remove('hidden');p.scrollIntoView({behavior:'smooth',block:'center'})}}
function line(x1,y1,x2,y2,c='thin'){return `<line class="${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`}
function rect(x,y,w,h,c='furn',r=0){return `<rect class="${c}" x="${x}" y="${y}" width="${Math.max(1,w)}" height="${Math.max(1,h)}" ${r?`rx="${r}"`:''}/>`}
function text(x,y,t,c='lbl'){return `<text class="${c}" x="${x}" y="${y}">${esc(t)}</text>`}
function room(x,y,w,h,n,sub=''){return `${rect(x,y,w,h,'iwall')} ${text(x+w/2,y+h/2-3,n)}${sub?text(x+w/2,y+h/2+10,sub,'sub'):''}`}
function doorV(x,y,r=26){return `${line(x,y,x,y+r,'door')}<path class="door" d="M ${x} ${y} A ${r} ${r} 0 0 1 ${x+r} ${y+r}"/>`}
function doorH(x,y,r=26){return `${line(x,y,x+r,y,'door')}<path class="door" d="M ${x} ${y} A ${r} ${r} 0 0 1 ${x+r} ${y-r}"/>`}
function winH(x,y,w=70){return line(x,y,x+w,y,'win')}
function winV(x,y,h=70){return line(x,y,x,y+h,'win')}
function bed(x,y,w=64,h=40){return `${rect(x,y,w,h,'furn',2)}${line(x,y+12,x+w,y+12)}${rect(x+5,y+4,w*.34,8,'furn',2)}${rect(x+w*.58,y+4,w*.34,8,'furn',2)}`}
function sofa(x,y,w=78,h=34){return `${rect(x,y,w,h,'furn',4)}${line(x+6,y+11,x+w-6,y+11)}`}
function dining(x,y,w=58,h=30){return `${rect(x,y,w,h,'furn',4)}<circle class="furn" cx="${x-9}" cy="${y+h/2}" r="5"/><circle class="furn" cx="${x+w+9}" cy="${y+h/2}" r="5"/>`}
function kitchen(x,y,w=95){return `${rect(x,y,w,24,'furn',2)}${line(x+20,y,x+20,y+24)}${line(x+48,y,x+48,y+24)}${line(x+76,y,x+76,y+24)}`}
function wc(x,y){return `${rect(x,y,16,24,'fixture',4)}${rect(x+4,y-6,8,7,'fixture',3)}${line(x+2,y+20,x+14,y+20)}`}
function shower(x,y){return `<circle class="fixture" cx="${x+12}" cy="${y+12}" r="10"/>`}
function car(x,y,w=48,h=82){return `${rect(x,y,w,h,'furn',10)}${rect(x+8,y+13,w-16,30,'furn',6)}<circle class="furn" cx="${x+10}" cy="${y+h-14}" r="5"/><circle class="furn" cx="${x+w-10}" cy="${y+h-14}" r="5"/>`}
function tree(x,y,r=22){return `<circle class="plant" cx="${x}" cy="${y}" r="${r*.65}"/><circle class="plant" cx="${x-8}" cy="${y+4}" r="${r*.45}"/><circle class="plant" cx="${x+8}" cy="${y+4}" r="${r*.45}"/>`}
function garden(x,y,w,h,label='JARDÍN'){return `${rect(x,y,w,h,'garden',2)}${text(x+w/2,y+h/2,label,'sub')} ${tree(x+28,y+25,20)}${tree(x+w-28,y+h-25,18)}`}
function dims(x,y,w,h,L,W){let s='';s+=line(x,y-28,x+w,y-28,'dim')+line(x,y-35,x,y-21,'dim')+line(x+w,y-35,x+w,y-21,'dim')+text(x+w/2,y-38,L.toFixed(2)+' m','dimt');s+=line(x-30,y,x-30,y+h,'dim')+line(x-37,y,x-23,y,'dim')+line(x-37,y+h,x-23,y+h,'dim')+`<text class="dimt" transform="translate(${x-44},${y+h/2}) rotate(-90)">${W.toFixed(2)} m</text>`;return s}
function axes(x,y,w,h){let s='';for(let i=0;i<=4;i++){const xx=x+w*i/4;s+=`<circle cx="${xx}" cy="${y-66}" r="10" fill="#fff" stroke="#555"/>`+text(xx,y-63,String(i+1),'axis')}for(let i=0;i<=5;i++){const yy=y+h*i/5;s+=`<circle cx="${x-55}" cy="${yy}" r="10" fill="#fff" stroke="#555"/>`+text(x-55,yy+3,String.fromCharCode(65+i),'axis')}return s}
function north(x,y){return `<g>${text(x,y-28,'N','axis')}${line(x,y+20,x,y-10)}<path d="M ${x} ${y-18} L ${x-7} ${y-4} L ${x+7} ${y-4} Z" fill="#111"/></g>`}
function needs(s){const t=(s||'').toLowerCase();return{open:t.includes('cocina abierta'),patio:/patio|jard[ií]n/.test(t),laundry:/lavander[ií]a|lavado/.test(t),study:/estudio|oficina/.test(t),terrace:/terraza/.test(t)}}
function sheet(level,L,W,rooms,baths,cars,needsText,roof=false){const VBW=1000,VBH=780,plotX=110,plotY=90,plotW=410,plotH=Math.min(610,Math.max(460,plotW*W/L*0.72)),n=needs(needsText);let s=`<svg viewBox="0 0 ${VBW} ${VBH}" aria-label="Plano conceptual ${level===3?'roof garden':'planta '+level}"><rect width="1000" height="780" fill="#fff"/>${text(520,28,roof?'PLANTA ROOF GARDEN':`PLANTA ${level}`,'plan-title')}${text(520,47,`${L.toFixed(2)} × ${W.toFixed(2)} m · CONCEPTO RESIDENCIAL`,'plan-sub')}${axes(plotX,plotY,plotW,plotH)}${dims(plotX,plotY,plotW,plotH,L,W)}${north(910,84)}${rect(plotX,plotY,plotW,plotH,'plot')}`;
  if(roof){
    s+=garden(plotX+12,plotY+12,plotW-24,plotH-24,'ROOF GARDEN');
    s+=room(plotX+145,plotY+105,120,120,'TERRAZA');
    s+=room(plotX+280,plotY+265,100,105,'PÉRGOLA');
    s+=room(plotX+92,plotY+395,112,120,'SERVICIO');
    s+=room(plotX+225,plotY+395,110,120,'ESCALERA / VACÍO');
    s+=dining(plotX+175,plotY+145)+doorH(plotX+225,plotY+395,26);
  } else if(level===1){
    const leftX=plotX+28, leftW=175, rightX=plotX+235, rightW=145, top=plotY+42, mid=plotY+245, bottom=plotY+500;
    s+=garden(plotX+5,plotY+5,120,95,'JARDÍN');
    s+=garden(plotX+290,plotY+5,115,75,'JARDÍN');
    s+=garden(plotX+5,plotY+plotH-78,plotW-10,65,'JARDÍN');
    s+=room(leftX,top,leftW,175,'COCINA',n.open?'ABIERTA':'');s+=kitchen(leftX+26,top+25,leftW-52);s+=room(leftX,top+180,leftW,145,'COMEDOR');s+=dining(leftX+54,top+220);
    s+=room(leftX,top+330,leftW,135,'SALA');s+=sofa(leftX+46,top+375);
    s+=room(leftX+5,top-36,leftW-10,30,n.laundry?'LAVANDERÍA':'SERVICIO');
    s+=room(rightX,top,rightW,120,'BAÑO');s+=wc(rightX+38,top+43)+shower(rightX+92,top+45);
    s+=room(rightX,top+126,rightW,155,'RECÁMARA 1');s+=bed(rightX+38,top+182);s+=winV(rightX+rightW-3,top+160,60);
    s+=room(rightX,top+286,rightW,155,'RECÁMARA 2');s+=bed(rightX+38,top+342);s+=winV(rightX+rightW-3,top+320,60);
    s+=room(plotX+255,top+112,85,70,'VESTÍBULO\nDE ACCESO');
    s+=room(plotX+205,top+198,50,260,'PASILLO','1.20 m');
    s+=room(plotX+260,top+410,92,115,n.study?'ESTUDIO':'ESCALERA ↑');
    s+=room(plotX+355,top+410,50,115,'BAÑO');
    s+=doorV(plotX+205,top+205,26)+doorV(plotX+255,top+140,26)+doorH(rightX,top+126,26)+doorH(rightX,top+286,26)+winH(leftX+20,top+177,70)+winH(leftX+20,top+308,70)+winH(leftX+20,top+458,70)+winV(rightX+rightW,top+32,65);
    // Access from street and parking/porch
    s+=room(plotX+145,plotY+plotH-28,120,22,'ACCESO');
    s+=line(plotX+205,plotY+plotH-28,plotX+205,plotY+plotH-2)+line(plotX+265,plotY+plotH-28,plotX+265,plotY+plotH-2);
    s+=text(plotX+235,plotY+plotH+18,'ACCESO PRINCIPAL','sub');
    if(cars>0){const c=Math.min(cars,2);for(let i=0;i<c;i++)s+=car(plotX+32+i*58,plotY+plotH-160);s+=text(plotX+82,plotY+plotH-172,'COCHERA','sub')}
  } else {
    const rightX=plotX+215,rightW=155,top=plotY+38;
    s+=garden(plotX+5,plotY+5,plotW-10,55,'JARDÍN / VACÍO');
    s+=room(plotX+18,top,155,86,'VESTÍBULO');
    s+=room(plotX+182,top,48,410,'PASILLO','1.20 m');
    s+=room(rightX,top,rightW,110,'RECÁMARA 1');s+=bed(rightX+42,top+48);s+=winV(rightX+rightW-3,top+30,55);
    s+=room(rightX,top+116,rightW,110,'RECÁMARA 2');s+=bed(rightX+42,top+164);s+=winV(rightX+rightW-3,top+145,55);
    s+=room(rightX,top+232,rightW,120,'RECÁMARA 3');s+=bed(rightX+42,top+280);s+=winV(rightX+rightW-3,top+265,55);
    s+=room(plotX+18,top+98,155,110,'BAÑO 1');s+=wc(plotX+62,top+145)+shower(plotX+118,top+145);
    s+=room(plotX+18,top+218,155,110,'BAÑO 2');s+=wc(plotX+62,top+265)+shower(plotX+118,top+265);
    s+=room(plotX+18,top+338,155,105,n.study?'ESTUDIO':'ESTAR FAMILIAR');
    s+=room(plotX+18,top+453,155,88,n.terrace?'TERRAZA':'SERVICIO');
    s+=doorV(plotX+182,top+40,24)+doorH(rightX,top+110,24)+doorH(rightX,top+226,24)+doorH(rightX,top+352,24);
    s+=garden(plotX+8,plotY+plotH-72,plotW-16,58,'JARDÍN');
  }
  s+=text(520,740,'OFIELD AI · PLANO CONCEPTUAL · NO EJECUTIVO','note');s+=text(910,740,'ESC. REFERENCIAL 1:100','note');s+='</svg>';return s}
function areaTable(L,W,levels,rooms,baths,cars){const area=L*W;return `<div class="tb"><div><b>PROYECTO</b><br>OFIELD AI</div><div><b>TERRENO</b><br>${L.toFixed(2)} × ${W.toFixed(2)} m</div><div><b>ESCALA</b><br>Referencial 1:100</div><div><b>ESTADO</b><br>CONCEPTUAL</div></div><table class="areas"><tr><th>Cuadro de datos</th><th>Valor</th></tr><tr><td>Superficie del terreno</td><td>${area.toFixed(2)} m²</td></tr><tr><td>Niveles</td><td>${levels===3?'2 + Roof Garden':levels}</td></tr><tr><td>Recámaras</td><td>${rooms}</td></tr><tr><td>Baños</td><td>${baths}</td></tr><tr><td>Cochera</td><td>${cars} auto(s)</td></tr></table>`}
function generate(){const p=panel(),L=+$('profL').value||0,W=+$('profW').value||0,levels=+$('profLevels').value,rooms=+$('profRooms').value,baths=+$('profBaths').value,cars=+$('profCars').value,needsText=$('profNeeds').value.trim(),msg=$('profMsgV3'),out=$('profResultV3');if(L<3||W<5){msg.textContent='Ingresa medidas válidas.';return}msg.textContent='✦ Organizando acceso, jardines, pasillos, recámaras y zonas sociales...';const n=Math.min(levels,2);let sheets='';for(let i=1;i<=n;i++)sheets+=`<div class="sheet">${sheet(i,L,W,rooms,baths,cars,needsText,false)}</div>`;if(levels===3)sheets+=`<div class="sheet">${sheet(3,L,W,rooms,baths,cars,needsText,true)}</div>`;out.innerHTML=`<div class="sheet-wrap">${sheets}</div>${areaTable(L,W,levels,rooms,baths,cars)}<p class="disclaimer">⚠️ Referencia visual: este plano es conceptual. Para construir se requieren levantamiento, proyecto ejecutivo, cálculo estructural, instalaciones, estudio de suelo, permisos y revisión de normativa local.</p>`;out.dataset.plan=JSON.stringify({L,W,levels,rooms,baths,cars,needsText,created:new Date().toISOString()});msg.textContent='✓ Plano conceptual generado.'}
function save(){const r=$('profResultV3');const m=$('profMsgV3');if(!r?.dataset.plan){m.textContent='Genera un plano primero.';return}let a=[];try{a=JSON.parse(localStorage.getItem('ofield_prof_plans')||'[]')}catch{}a.unshift(JSON.parse(r.dataset.plan));localStorage.setItem('ofield_prof_plans',JSON.stringify(a.slice(0,20)));m.textContent='✓ Plano guardado en este navegador.'}
function bind(){const b=$('openConceptPlan');if(b){b.removeAttribute('onclick');b.onclick=e=>{e.preventDefault();open()}}}
function start(){panel();bind()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();