const OFIELD_API='https://ofield-ai-api.luiseldorado110.workers.dev/';
const OFIELD_ARCH=$=>document.getElementById($);

document.addEventListener('submit',async function(e){
  if(e.target.id!=='projectForm') return;
  e.preventDefault(); e.stopImmediatePropagation();
  const form=e.target, idea=OFIELD_ARCH('idea').value.trim(), msg=OFIELD_ARCH('message');
  if(!idea){msg.textContent='Escribe primero una idea para tu proyecto.';return;}
  const type=OFIELD_ARCH('type')?.value||'Otro proyecto';
  const size=OFIELD_ARCH('size')?.value||'No especificado';
  const budget=OFIELD_ARCH('budget')?.value||'No especificado';
  const btn=form.querySelector('button[type="submit"]'); if(btn)btn.disabled=true;
  msg.textContent='✦ Ofield AI está preparando tu proyecto arquitectónico detallado...';
  const prompt=`Eres Ofield AI, un asistente especializado en convertir ideas en proyectos arquitectónicos claros y útiles.\n\nSolicitud del usuario:\nTipo: ${type}\nDatos/tamaño: ${size}\nPresupuesto: ${budget}\nIdea: ${idea}\n\nSi el proyecto es de ARQUITECTURA o construcción de vivienda, genera una propuesta mucho más completa y práctica. Incluye obligatoriamente:\n1. Nombre del proyecto\n2. Resumen y objetivo\n3. Datos del terreno y supuestos; si faltan datos, indícalos y no inventes restricciones legales\n4. Programa arquitectónico: lista de espacios, función y área sugerida en m²\n5. Distribución propuesta por planta/nivel, con medidas aproximadas y relaciones entre espacios\n6. Área construida aproximada, área libre y porcentaje de ocupación cuando pueda calcularse\n7. Orientación, iluminación y ventilación natural\n8. Concepto de fachada y materiales/acabados recomendados\n9. Sistema constructivo y materiales principales\n10. Instalaciones básicas: eléctrica, hidráulica, sanitaria y gas, indicando que deben ser calculadas por profesionales\n11. Presupuesto por partidas y rangos, aclarando supuestos y que son estimaciones\n12. Plan de trabajo por etapas\n13. Riesgos, permisos y verificaciones necesarias\n14. Próximos pasos concretos\n15. Una sección final llamada “Ficha rápida” con: terreno, niveles, área construida, recámaras, baños, estacionamientos, área libre y presupuesto.\n\nSi NO es arquitectura, adapta la respuesta al tipo de proyecto, pero conserva una estructura detallada con objetivo, características, plan, recursos, presupuesto, riesgos y próximos pasos.\n\nNo presentes cálculos estructurales, instalaciones o costos como definitivos. Diferencia claramente entre estimación conceptual y datos que requieren revisión profesional/local. Responde en español, con tablas cuando ayuden y sin una plantilla genérica.`;
  try{
    const r=await fetch(OFIELD_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:prompt})});
    const d=await r.json(); if(!r.ok||!d.result) throw Error(d.error||'Sin resultado');
    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const html=esc(d.result).replace(/^###\s+(.+)$/gm,'<h4>$1</h4>').replace(/^##\s+(.+)$/gm,'<h3>$1</h3>').replace(/^#\s+(.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    OFIELD_ARCH('resultSummary').textContent=`${type} · proyecto arquitectónico detallado generado con Ofield AI.`;
    OFIELD_ARCH('resultBox').innerHTML=`<div class="result-box"><h3>Proyecto arquitectónico generado</h3><div class="ai-answer">${html}</div></div>`;
    OFIELD_ARCH('resultado').classList.remove('hidden'); OFIELD_ARCH('resultado').scrollIntoView({behavior:'smooth'}); msg.textContent='✓ Proyecto arquitectónico generado.';
    const h=JSON.parse(localStorage.getItem('ofieldProjects')||'[]');
    h.unshift({type,idea,size,budget,answer:d.result,date:new Date().toLocaleString('es-MX')}); localStorage.setItem('ofieldProjects',JSON.stringify(h.slice(0,8)));
    if(typeof renderHistory==='function') renderHistory();
  }catch(err){console.error(err);msg.textContent='No pudimos conectar con la IA. Revisa el Worker.'}
  finally{if(btn)btn.disabled=false;}
},true);