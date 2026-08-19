const form=document.getElementById('projectForm');
const idea=document.getElementById('idea');
const type=document.getElementById('type');
const size=document.getElementById('size');
const budget=document.getElementById('budget');
const result=document.getElementById('resultado');
const resultBox=document.getElementById('resultBox');
const resultSummary=document.getElementById('resultSummary');
const message=document.getElementById('message');
const downloadBtn=document.getElementById('downloadBtn');
const printBtn=document.getElementById('printBtn');
let lastProject='';
const API_URL='https://ofield-ai-api.luiseldorado110.workers.dev/';

form.addEventListener('submit',async e=>{
 e.preventDefault();
 const text=idea.value.trim();
 if(!text){message.textContent='Escribe primero una idea para tu proyecto.';idea.focus();return;}
 const details=`Tipo: ${type.value}\nDatos/tamaño: ${size.value.trim()||'No especificado'}\nPresupuesto: ${budget.value.trim()||'No especificado'}\nIdea: ${text}`;
 message.textContent='✦ Ofield AI está preparando tu proyecto...';
 const button=form.querySelector('button[type="submit"]');
 button.disabled=true;button.style.opacity='.6';
 try{
   const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:details})});
   const data=await response.json();
   if(!response.ok||!data.result) throw new Error(data.error||'No se recibió una respuesta.');
   const answer=data.result;
   resultSummary.textContent=`${type.value} · propuesta generada con Ofield AI.`;
   resultBox.innerHTML=`<div class="result-box"><div class="result-section"><h3>Proyecto generado</h3>${formatAnswer(answer)}</div></div>`;
   lastProject=`OFIELD AI — PROYECTO GENERADO\n\n${answer}`;
   result.classList.remove('hidden');message.textContent='✓ Proyecto generado correctamente.';result.scrollIntoView({behavior:'smooth'});
 }catch(error){
   console.error(error);
   message.textContent='No pudimos conectar con la IA. Revisa que el Worker esté desplegado e inténtalo de nuevo.';
 }finally{button.disabled=false;button.style.opacity='1';}
});

downloadBtn.addEventListener('click',()=>{if(!lastProject)return;const blob=new Blob([lastProject],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ofield-ai-proyecto.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);});
printBtn.addEventListener('click',()=>{if(!lastProject)return;window.print();});
function formatAnswer(text){return escapeHtml(text).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}