(() => {
  'use strict';
  const API_URL='https://ofield-ai-api.luiseldorado110.workers.dev/';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const format=t=>esc(t).replace(/^###\s+(.+)$/gm,'<h4>$1</h4>').replace(/^##\s+(.+)$/gm,'<h3>$1</h3>').replace(/^#\s+(.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');

  function css(){
    if($('ofield-ai-engine-style')) return;
    const s=document.createElement('style'); s.id='ofield-ai-engine-style';
    s.textContent=`
      #aiEnginePanel{margin-top:24px;background:#151515;color:#eee;border:1px solid #333;border-radius:12px;padding:18px}
      #aiEnginePanel .a-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap}
      #aiEnginePanel .a-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}
      #aiEnginePanel .a-card{background:#202020;border:1px solid #3b3b3b;border-radius:10px;padding:12px}
      #aiEnginePanel label{display:block;margin:10px 0 6px;font-size:13px;font-weight:700;color:#ddd}
      #aiEnginePanel input,#aiEnginePanel select,#aiEnginePanel textarea{width:100%;box-sizing:border-box;background:#202020;color:#eee;border:1px solid #444;border-radius:9px;padding:11px}
      #aiEnginePanel input:focus,#aiEnginePanel select:focus,#aiEnginePanel textarea:focus{outline:2px solid #caa74a;border-color:#caa74a}
      #aiEnginePanel .a-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
      #aiEnginePanel .a-output{margin-top:16px;background:#f7f7f7;color:#111;border-radius:9px;padding:18px;min-height:120px}
      #aiEnginePanel .a-status{min-height:22px}
      #aiEnginePanel .a-progress{height:6px;background:#292929;border-radius:99px;overflow:hidden;margin:10px 0 16px}.a-bar{height:100%;width:0;background:linear-gradient(90deg,#b51f2d,#caa74a);transition:width .25s}
      @media(max-width:850px){#aiEnginePanel .a-grid{grid-template-columns:1fr 1fr}} @media(max-width:600px){#aiEnginePanel .a-grid{grid-template-columns:1fr}}
    `; document.head.appendChild(s);
  }

  function context(){
    return {
      type:$('type')?.value||'Otro proyecto',
      idea:$('idea')?.value.trim()||'',
      size:$('size')?.value.trim()||'',
      budget:$('budget')?.value.trim()||'',
      proposal:$('resultBox')?.innerText||''
    };
  }

  function ensure(){
    css(); let p=$('aiEnginePanel'); if(p) return p;
    const host=$('resultado')||$('herramientas'); if(!host) return null;
    p=document.createElement('section'); p.id='aiEnginePanel';
    p.innerHTML=`<div class="a-head"><div><div class="section-tag">IA CENTRAL / OFIELD AI</div><h3>Asistente inteligente del proyecto</h3><p>Una sola IA para analizar, mejorar, planificar, revisar y explicar tu proyecto.</p></div><button id="closeAIEngine" class="secondary" type="button">Cerrar</button></div>
      <div class="a-grid">
        <div class="a-card"><label for="aiRole">Rol de IA</label><select id="aiRole"><option>Arquitecto / diseñador</option><option>Director de proyecto</option><option>Analista financiero</option><option>Consultor de negocio</option><option>Diseñador de producto</option><option>Guionista / creativo</option><option>Desarrollador de software</option></select></div>
        <div class="a-card"><label for="aiMode">Tarea</label><select id="aiMode"><option value="diagnostico">Diagnosticar proyecto</option><option value="mejorar">Mejorar propuesta</option><option value="alternativas">Proponer 3 alternativas</option><option value="plan">Crear plan paso a paso</option><option value="presupuesto">Analizar presupuesto</option><option value="riesgos">Detectar riesgos y errores</option><option value="materiales">Definir materiales y recursos</option><option value="explicar">Explicar de forma sencilla</option><option value="pregunta">Responder una pregunta</option></select></div>
        <div class="a-card"><label for="aiStyle">Nivel</label><select id="aiStyle"><option>Profesional</option><option>Muy detallado</option><option>Práctico y directo</option><option>Principiante</option></select></div>
      </div>
      <label for="aiInstruction">Qué quieres que haga la IA</label><textarea id="aiInstruction" rows="4" placeholder="Ej. Revisa si esta distribución es cómoda para una familia de 4 y dame una versión mejorada."></textarea>
      <div class="a-actions"><button id="runAIEngine" class="primary" type="button">✦ Ejecutar IA</button><button id="loadAIContext" class="secondary" type="button">Cargar proyecto actual</button><button id="saveAIAnswer" class="secondary" type="button">＋ Guardar respuesta</button></div>
      <p id="aiEngineStatus" class="message a-status"></p><div class="a-progress"><div id="aiEngineBar" class="a-bar"></div></div><div id="aiEngineOutput" class="a-output"><p>La respuesta aparecerá aquí.</p></div>`;
    host.appendChild(p);
    $('closeAIEngine').onclick=()=>p.classList.add('hidden');
    $('loadAIContext').onclick=()=>{const c=context();$('aiInstruction').value=`Proyecto: ${c.idea||'sin descripción'}\nTerreno/tamaño: ${c.size||'no especificado'}\nPresupuesto: ${c.budget||'no especificado'}\n\nPropuesta actual:\n${c.proposal||'todavía no hay propuesta.'}`;$('aiEngineStatus').textContent='✓ Contexto cargado.'};
    $('runAIEngine').onclick=run;
    $('saveAIAnswer').onclick=save;
    return p;
  }

  async function run(){
    const p=ensure(); if(!p) return; const c=context(), role=$('aiRole').value, mode=$('aiMode').value, level=$('aiStyle').value, instruction=$('aiInstruction').value.trim();
    const status=$('aiEngineStatus'), out=$('aiEngineOutput'), bar=$('aiEngineBar');
    const modeMap={diagnostico:'diagnostica el proyecto y encuentra inconsistencias',mejorar:'mejora la propuesta manteniendo sus objetivos',alternativas:'propone exactamente 3 alternativas comparables',plan:'crea un plan paso a paso con prioridades y dependencias',presupuesto:'analiza el presupuesto y detecta costos o supuestos faltantes',riesgos:'detecta errores, riesgos técnicos, operativos y decisiones pendientes',materiales:'propone materiales, recursos y criterios de selección',explicar:'explica el proyecto con lenguaje sencillo y ejemplos',pregunta:'responde la pregunta del usuario usando el contexto disponible'};
    const prompt=`Actúa como ${role} para Ofield AI. No afirmes tener licencia profesional ni sustituyas revisiones legales, estructurales o técnicas donde sean necesarias.\n\nPROYECTO\nTipo: ${c.type}\nIdea: ${c.idea||'no especificada'}\nTamaño: ${c.size||'no especificado'}\nPresupuesto: ${c.budget||'no especificado'}\nPropuesta existente:\n${c.proposal.slice(0,18000)||'no existe'}\n\nTAREA\n${modeMap[mode]}\nNivel solicitado: ${level}\nInstrucción adicional: ${instruction||'ninguna'}\n\nREGLAS\n- Razona sobre datos y restricciones antes de recomendar.\n- Distingue hechos, supuestos y estimaciones.\n- No inventes normas locales, precios exactos ni medidas que no puedas verificar.\n- Señala información faltante y cómo obtenerla.\n- Cuando haya varias opciones, compáralas con ventajas y desventajas.\n- Entrega decisiones concretas y próximos pasos.\n- Responde en español.`;
    bar.style.width='15%'; status.textContent='✦ Ofield AI está pensando...'; $('runAIEngine').disabled=true;
    try{
      bar.style.width='45%';
      const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:prompt})});
      const d=await r.json(); if(!r.ok||!d.result) throw new Error('IA sin respuesta');
      bar.style.width='100%'; out.innerHTML=`<h3>Resultado</h3><div>${format(d.result)}</div>`; status.textContent='✓ IA completada.';
      p.dataset.last=d.result;
    }catch(e){console.error(e);status.textContent='No se pudo completar la tarea de IA. Revisa la conexión con el Worker.'}
    finally{$('runAIEngine').disabled=false;}
  }

  function save(){const p=ensure(),answer=p?.dataset.last;if(!answer){$('aiEngineStatus').textContent='Primero ejecuta una tarea.';return}let h=[];try{h=JSON.parse(localStorage.getItem('ofieldAIAnswers')||'[]')}catch{}h.unshift({answer,date:new Date().toLocaleString('es-MX'),type:$('aiRole').value,mode:$('aiMode').value});localStorage.setItem('ofieldAIAnswers',JSON.stringify(h.slice(0,20)));$('aiEngineStatus').textContent='✓ Respuesta guardada en este navegador.'}

  function mountButton(){
    const result=$('resultado'); if(!result) return; ensure();
    const actions=result.querySelector('.result-head .hero-actions');
    if(actions&&!$('openAIEngine')){const b=document.createElement('button');b.id='openAIEngine';b.className='secondary';b.type='button';b.textContent='🧠 Asistente IA';b.onclick=()=>{const p=ensure();p.classList.remove('hidden');p.scrollIntoView({behavior:'smooth',block:'center'});};actions.appendChild(b)}
  }
  function start(){mountButton();const obs=new MutationObserver(mountButton);obs.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();