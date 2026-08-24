(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const API_URL = 'https://ofield-ai-api.luiseldorado110.workers.dev/';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const format = t => esc(t).replace(/^###\s+(.+)$/gm,'<h4>$1</h4>').replace(/^##\s+(.+)$/gm,'<h3>$1</h3>').replace(/^#\s+(.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  function addCss(){ if($('ofield-complete-style')) return; const s=document.createElement('style'); s.id='ofield-complete-style'; s.textContent=`
    #completeProjectPanel{margin-top:24px;background:#151515;color:#eee;border:1px solid #333;border-radius:12px;padding:18px}
    #completeProjectPanel .cp-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}
    #completeProjectPanel .cp-tools{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
    #completeProjectPanel .cp-status{min-height:22px}
    #completeProjectPanel .cp-progress{height:7px;background:#292929;border-radius:99px;overflow:hidden;margin:10px 0 16px}
    #completeProjectPanel .cp-bar{height:100%;width:0;background:linear-gradient(90deg,#b51f2d,#caa74a);transition:width .35s ease}
    #completeProjectPanel .cp-sheet{background:#fff;color:#111;margin-top:16px;padding:22px;overflow:auto;border-radius:8px}
    #completeProjectPanel .cp-cover{min-height:650px;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box}
    #completeProjectPanel .cp-cover h1{font-size:34px;margin:40px 0 8px}.cp-kicker{font-size:12px;letter-spacing:.12em;font-weight:800;color:#555}
    #completeProjectPanel .cp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:18px}
    #completeProjectPanel .cp-card{border:1px solid #bbb;padding:14px;background:#fafafa}.cp-card h4{margin:0 0 8px}.cp-list{margin:0;padding-left:18px}.cp-note{font-size:12px;color:#555}
    #completeProjectPanel .cp-data{border-collapse:collapse;width:100%;font-size:12px}.cp-data th,.cp-data td{border:1px solid #aaa;padding:7px;text-align:left}.cp-data th{background:#eee}
    @media print{body *{visibility:hidden!important}#completeProjectPanel,#completeProjectPanel *{visibility:visible!important}#completeProjectPanel{position:absolute!important;left:0!important;top:0!important;width:100%!important;background:#fff!important;border:0!important}.cp-tools,.cp-status,.cp-progress{display:none!important}.cp-sheet{break-after:page!important;border-radius:0!important}}
  `; document.head.appendChild(s); }
  function readProject(){
    const type=$('type')?.value||'';
    const idea=$('idea')?.value.trim()||'';
    const size=$('size')?.value.trim()||'';
    const budget=$('budget')?.value.trim()||'';
    const result=$('resultBox')?.innerText||'';
    return {type,idea,size,budget,result};
  }
  function ensurePanel(){
    addCss(); let p=$('completeProjectPanel'); if(p) return p;
    const host=$('resultado'); if(!host) return null;
    p=document.createElement('section'); p.id='completeProjectPanel';
    p.innerHTML=`<div class="cp-head"><div><div class="section-tag">07 / PROYECTO COMPLETO</div><h3>Generador de proyecto arquitectónico completo</h3><p>Integra propuesta, planos, fachadas, cortes, revisión y resumen en una sola entrega.</p></div><button id="closeCompleteProject" class="secondary" type="button">Cerrar</button></div><div class="cp-tools"><button id="generateCompleteProject" class="primary" type="button">Generar proyecto completo ✦</button><button id="printCompleteProject" class="secondary" type="button">▣ Guardar PDF</button><button id="saveCompleteProject" class="secondary" type="button">＋ Guardar proyecto</button></div><div class="cp-progress"><div id="completeProjectBar" class="cp-bar"></div></div><p id="completeProjectStatus" class="message cp-status"></p><div id="completeProjectResult"></div>`;
    host.appendChild(p);
    $('closeCompleteProject').onclick=()=>p.classList.add('hidden');
    $('printCompleteProject').onclick=()=>window.print();
    $('saveCompleteProject').onclick=saveProject;
    $('generateCompleteProject').onclick=generate;
    return p;
  }
  function addButton(){
    const result=$('resultado'); if(!result) return;
    ensurePanel();
    const actions=result.querySelector('.result-head .hero-actions');
    if(actions && !$('openCompleteProject')){
      const b=document.createElement('button'); b.id='openCompleteProject'; b.className='primary'; b.type='button'; b.textContent='📄 Generar proyecto completo';
      b.onclick=()=>{const p=ensurePanel(); p.classList.remove('hidden'); p.scrollIntoView({behavior:'smooth',block:'center'});};
      actions.appendChild(b);
    }
  }
  function capturePlan(){
    const p=$('conceptPlanPanel')||$('professionalPlanPanel');
    return p?.innerText||'';
  }
  function captureReview(){return $('reviewResult')?.innerText||''}
  function captureDocs(){return $('elevSheets')?.innerText||''}
  async function aiSummary(data){
    const prompt=`Actúa como coordinador de un proyecto arquitectónico residencial. Integra los datos siguientes en un resumen profesional para una entrega conceptual. No afirmes tener licencia ni que el documento sirve para construir.\n\nDATOS\nTipo: ${data.type}\nTerreno: ${data.size||'no especificado'}\nPresupuesto: ${data.budget||'no especificado'}\nIdea: ${data.idea}\n\nPROPUESTA\n${data.result.slice(0,16000)}\n\nEntrega una síntesis con: criterios de diseño, programa de espacios y áreas aproximadas, distribución por niveles, materiales/acabados conceptuales, estrategia de presupuesto, riesgos y próximos pasos. Responde en español profesional.`;
    try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:prompt})});const d=await r.json();if(r.ok&&d.result)return d.result;}catch(e){console.error(e)}
    return 'No fue posible obtener la síntesis adicional de IA; se conservan los datos del proyecto generado.';
  }
  async function generate(){
    const p=ensurePanel(); if(!p)return; const data=readProject(); if(!data.idea && !data.result){$('completeProjectStatus').textContent='Primero genera una propuesta arquitectónica.';return}
    p.classList.remove('hidden'); p.scrollIntoView({behavior:'smooth',block:'center'}); const bar=$('completeProjectBar'), status=$('completeProjectStatus'), out=$('completeProjectResult');
    const set=(n,t)=>{bar.style.width=n+'%';status.textContent=t}; set(8,'✦ Recopilando la propuesta...');
    await new Promise(r=>setTimeout(r,200)); set(22,'✦ Preparando documentación...');
    const summary=await aiSummary(data); set(48,'✦ Integrando planos...'); await new Promise(r=>setTimeout(r,250));
    const planText=capturePlan()||'El plano conceptual se generará desde la herramienta de plano.';
    set(66,'✦ Integrando fachadas y cortes...'); await new Promise(r=>setTimeout(r,200));
    const docsText=captureDocs()||'Fachadas y cortes conceptuales disponibles en la sección de documentación.';
    set(80,'✦ Integrando revisión del proyecto...'); const review=captureReview()||'La revisión automática aún no se ha ejecutado.';
    set(92,'✦ Preparando entrega final...');
    out.innerHTML=`<div class="cp-sheet cp-cover"><div><div class="cp-kicker">OFIELD AI · ARQUITECTURA</div><h1>Proyecto arquitectónico completo</h1><p>${esc(data.idea||'Propuesta arquitectónica residencial')}</p></div><div class="cp-grid"><div class="cp-card"><h4>Datos principales</h4><table class="cp-data"><tr><th>Terreno</th><td>${esc(data.size||'No especificado')}</td></tr><tr><th>Presupuesto</th><td>${esc(data.budget||'No especificado')}</td></tr><tr><th>Tipo</th><td>${esc(data.type)}</td></tr></table></div><div class="cp-card"><h4>Contenido</h4><ul class="cp-list"><li>Propuesta arquitectónica</li><li>Plantas y distribución conceptual</li><li>Fachadas y cortes</li><li>Revisión del proyecto</li><li>Resumen técnico y próximos pasos</li></ul></div></div><p class="cp-note">Documento conceptual generado con Ofield AI. Requiere revisión profesional, levantamiento, cálculo, instalaciones, permisos y normativa local antes de construir.</p></div><div class="cp-sheet"><h2>01 · Propuesta arquitectónica</h2><div class="ai-answer">${format(summary)}</div></div><div class="cp-sheet"><h2>02 · Planos y distribución</h2><p class="cp-note">${esc(planText.slice(0,12000))}</p></div><div class="cp-sheet"><h2>03 · Fachadas y cortes</h2><p class="cp-note">${esc(docsText.slice(0,12000))}</p></div><div class="cp-sheet"><h2>04 · Revisión automática</h2><p class="cp-note">${esc(review.slice(0,12000))}</p></div><div class="cp-sheet"><h2>05 · Próximos pasos</h2><div class="cp-grid"><div class="cp-card"><h4>Documentación</h4><ul class="cp-list"><li>Actualizar cotas y niveles.</li><li>Definir estructura con cálculo.</li><li>Desarrollar instalaciones.</li><li>Verificar normativa local.</li></ul></div><div class="cp-card"><h4>Construcción</h4><ul class="cp-list"><li>Levantamiento del terreno.</li><li>Presupuesto con cotizaciones reales.</li><li>Permisos aplicables.</li><li>Proyecto ejecutivo y supervisión.</li></ul></div></div></div>`;
    bar.style.width='100%'; status.textContent='✓ Proyecto completo generado.';
    p.dataset.project=JSON.stringify({data,summary,planText,docsText,review,created:new Date().toISOString()});
  }
  function saveProject(){const p=$('completeProjectPanel'),s=p?.dataset.project;if(!s){$('completeProjectStatus').textContent='Genera el proyecto completo primero.';return}let list=[];try{list=JSON.parse(localStorage.getItem('ofieldCompleteProjects')||'[]')}catch{}list.unshift(JSON.parse(s));localStorage.setItem('ofieldCompleteProjects',JSON.stringify(list.slice(0,8)));$('completeProjectStatus').textContent='✓ Proyecto completo guardado en este navegador.';}
  function start(){addButton(); const observer=new MutationObserver(addButton); observer.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();