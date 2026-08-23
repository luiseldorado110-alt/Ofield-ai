const form = document.getElementById('projectForm');
const idea = document.getElementById('idea');
const type = document.getElementById('type');
const size = document.getElementById('size');
const budget = document.getElementById('budget');
const result = document.getElementById('resultado');
const resultBox = document.getElementById('resultBox');
const resultSummary = document.getElementById('resultSummary');
const message = document.getElementById('message');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const budgetPanel = document.getElementById('budgetPanel');
const budgetRows = document.getElementById('budgetRows');
const budgetSubtotal = document.getElementById('budgetSubtotal');
const budgetTotal = document.getElementById('budgetTotal');
const contingency = document.getElementById('contingency');
const openBudget = document.getElementById('openBudget');
const closeBudget = document.getElementById('closeBudget');
const addBudgetRow = document.getElementById('addBudgetRow');
const clearBudget = document.getElementById('clearBudget');
let lastProject = '';
const API_URL = 'https://ofield-ai-api.luiseldorado110.workers.dev/';

const categoryGuides = {
  'Arquitectura':'Prioriza programa arquitectónico, distribución, medidas, circulaciones, orientación, materiales, etapas de obra y presupuesto. No inventes reglamentos locales: indica qué debe verificarse.',
  'Videojuego':'Prioriza concepto jugable, historia, mundo, personajes, cámara, controles, mecánicas, sistemas, niveles, arte, tecnología, desarrollo por fases y alcance realista.',
  'Aplicación / página web':'Prioriza usuarios, problema que resuelve, funciones, pantallas, flujo de usuario, tecnología, base de datos, seguridad, monetización y plan de desarrollo.',
  'Proyecto escolar':'Prioriza objetivo, investigación, metodología, materiales, procedimiento, entregables, cronograma, criterios de evaluación y presentación.',
  'Negocio':'Prioriza cliente objetivo, propuesta de valor, producto o servicio, costos, precio, competencia, operación, marketing, ventas, riesgos y punto de equilibrio.',
  'Película / serie / animación':'Prioriza premisa, género, personajes, mundo, estructura narrativa, episodios o escenas, producción, recursos, calendario y presupuesto.',
  'Comic / libro / historia':'Prioriza premisa, personajes, conflicto, estructura, capítulos, escenas, tono, arco narrativo y plan de producción.',
  'Diseño / producto':'Prioriza usuario, problema, concepto, características, materiales, dimensiones, fabricación, costos, pruebas y mejoras.',
  'Otro proyecto':'Detecta automáticamente el tipo de proyecto y adapta la propuesta a sus necesidades específicas.'
};
const categoryPlaceholders = {
  'Arquitectura':'Ejemplo: quiero diseñar una casa de 2 pisos para una familia de 4 personas...',
  'Videojuego':'Ejemplo: quiero crear un videojuego de mundo abierto en una ciudad...',
  'Aplicación / página web':'Ejemplo: quiero crear una app para organizar gastos...',
  'Proyecto escolar':'Ejemplo: necesito desarrollar un proyecto sobre energía solar...',
  'Negocio':'Ejemplo: quiero iniciar un negocio de postres con $5,000 MXN...',
  'Película / serie / animación':'Ejemplo: quiero crear una serie animada de 10 episodios...',
  'Comic / libro / historia':'Ejemplo: quiero escribir una historia de superhéroes...',
  'Diseño / producto':'Ejemplo: quiero diseñar un producto económico para estudiantes...',
  'Otro proyecto':'Describe tu idea con todos los datos que tengas...'
};

form.addEventListener('submit', async e => {
  e.preventDefault(); const text=idea.value.trim();
  if(!text){message.textContent='Escribe primero una idea para tu proyecto.';idea.focus();return;}
  const details=`Tipo de proyecto seleccionado: ${type.value}\nEnfoque recomendado: ${categoryGuides[type.value]}\nDatos/tamaño: ${size.value.trim()||'No especificado'}\nPresupuesto: ${budget.value.trim()||'No especificado'}\nIdea: ${text}`;
  message.textContent='✦ Ofield AI está preparando tu proyecto...'; const button=form.querySelector('button[type="submit"]);button.disabled=true;
  try{const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:details})});const data=await response.json();if(!response.ok||!data.result)throw new Error(data.error||'No se recibió una respuesta.');const answer=data.result;resultSummary.textContent=`${type.value} · propuesta generada con Ofield AI.`;renderResult(answer);lastProject=`OFIELD AI — PROYECTO GENERADO\n\n${answer}`;saveProject({type:type.value,idea:text,size:size.value.trim(),budget:budget.value.trim(),answer,date:new Date().toLocaleString('es-MX')});result.classList.remove('hidden');message.textContent='✓ Proyecto generado y guardado en tu historial.';result.scrollIntoView({behavior:'smooth'});}catch(error){console.error(error);message.textContent='No pudimos conectar con la IA. Revisa que el Worker esté desplegado e inténtalo de nuevo.';}finally{button.disabled=false;}}
);
type.addEventListener('change',()=>idea.placeholder=categoryPlaceholders[type.value]||categoryPlaceholders['Otro proyecto']);

function renderResult(answer,title='Proyecto generado'){resultBox.innerHTML=`<div class="result-box"><div class="result-section"><h3>${title}</h3><div class="ai-answer">${formatAnswer(answer)}</div></div><div class="result-actions"><button class="secondary action-improve" data-action="Mejora este proyecto y hazlo más específico y profesional, conservando todos los datos importantes.">✨ Mejorar</button><button class="secondary action-improve" data-action="Amplía este proyecto con más detalle, ejemplos y decisiones concretas.">＋ Más detalle</button><button class="secondary action-improve" data-action="Crea un presupuesto detallado y realista para este proyecto, usando la moneda y ubicación indicadas si existen.">💰 Presupuesto</button><button class="secondary action-improve" data-action="Convierte este proyecto en un plan paso a paso con prioridades, tiempos y entregables.">✓ Plan de trabajo</button></div></div>`;document.querySelectorAll('.action-improve').forEach(btn=>btn.addEventListener('click',()=>improveProject(btn.dataset.action)));}
async function improveProject(action){if(!lastProject)return;message.textContent='✦ Ofield AI está trabajando sobre tu proyecto...';try{const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:`Proyecto actual:\n${lastProject}\n\nNueva instrucción:\n${action}\n\nDevuelve solamente la versión mejorada en español.`})});const data=await response.json();if(!response.ok||!data.result)throw new Error();lastProject=`OFIELD AI — PROYECTO GENERADO\n\n${data.result}`;renderResult(data.result,'Proyecto actualizado');message.textContent='✓ Proyecto actualizado.';saveProject({type:type.value,idea:idea.value.trim(),size:size.value.trim(),budget:budget.value.trim(),answer:data.result,date:new Date().toLocaleString('es-MX')});}catch(e){message.textContent='No se pudo actualizar el proyecto. Inténtalo nuevamente.';}}

downloadBtn.addEventListener('click',()=>{if(!lastProject)return;const blob=new Blob([lastProject],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ofield-ai-proyecto.txt';a.click();URL.revokeObjectURL(url);});
printBtn.addEventListener('click',()=>{if(lastProject)window.print();});
copyBtn.addEventListener('click',async()=>{if(!lastProject)return;try{await navigator.clipboard.writeText(lastProject);copyBtn.textContent='✓ Copiado';setTimeout(()=>copyBtn.textContent='⧉ Copiar',1800);}catch{}});
function saveProject(project){const history=JSON.parse(localStorage.getItem('ofieldProjects')||'[]');history.unshift(project);localStorage.setItem('ofieldProjects',JSON.stringify(history.slice(0,8)));renderHistory();}
function renderHistory(){const history=JSON.parse(localStorage.getItem('ofieldProjects')||'[]');if(!history.length){historyList.innerHTML='<p class="empty-history">Todavía no tienes proyectos guardados.</p>';return;}historyList.innerHTML=history.map((p,i)=>`<article class="history-card"><div><span>${escapeHtml(p.type)}</span><h3>${escapeHtml(p.idea.slice(0,80))}${p.idea.length>80?'…':''}</h3><small>${escapeHtml(p.date)}</small></div><button class="secondary history-open" data-index="${i}">Abrir →</button></article>`).join('');document.querySelectorAll('.history-open').forEach(btn=>btn.addEventListener('click',()=>openHistory(Number(btn.dataset.index))));}
function openHistory(index){const history=JSON.parse(localStorage.getItem('ofieldProjects')||'[]');const p=history[index];if(!p)return;type.value=p.type;idea.value=p.idea;size.value=p.size||'';budget.value=p.budget||'';resultSummary.textContent=`${p.type} · proyecto recuperado del historial.`;renderResult(p.answer,'Proyecto recuperado');lastProject=`OFIELD AI — PROYECTO GENERADO\n\n${p.answer}`;result.classList.remove('hidden');result.scrollIntoView({behavior:'smooth'});}
function formatAnswer(text){let html=escapeHtml(text);html=html.replace(/^###\s+(.+)$/gm,'<h4>$1</h4>').replace(/^##\s+(.+)$/gm,'<h3>$1</h3>').replace(/^#\s+(.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>').replace(/(?:<br>){3,}/g,'<br><br>');return html;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

// CALCULADORA DE PRESUPUESTOS
function money(n){return Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});}
function addBudgetRow(name='',qty=1,price=0){const row=document.createElement('div');row.className='budget-row';row.innerHTML=`<input class="b-name" placeholder="Concepto" value="${escapeHtml(name)}"><input class="b-qty" type="number" min="0" step="0.01" placeholder="Cantidad" value="${qty}"><input class="b-price" type="number" min="0" step="0.01" placeholder="Precio unitario" value="${price}"><strong class="b-sub">$0.00</strong><button type="button" class="secondary b-remove">×</button>`;budgetRows.appendChild(row);row.querySelectorAll('input').forEach(i=>i.addEventListener('input',updateBudget));row.querySelector('.b-remove').addEventListener('click',()=>{row.remove();updateBudget();});updateBudget();}
function updateBudget(){let subtotal=0;document.querySelectorAll('.budget-row').forEach(row=>{const qty=Number(row.querySelector('.b-qty').value)||0,price=Number(row.querySelector('.b-price').value)||0,sub=qty*price;subtotal+=sub;row.querySelector('.b-sub').textContent=money(sub);});const pct=Math.max(0,Number(contingency.value)||0),total=subtotal*(1+pct/100);budgetSubtotal.textContent=money(subtotal);budgetTotal.textContent=money(total);}
openBudget.addEventListener('click',()=>{budgetPanel.classList.remove('hidden');if(!budgetRows.children.length){addBudgetRow('Material',1,0);addBudgetRow('Mano de obra',1,0);addBudgetRow('Otros',1,0);}budgetPanel.scrollIntoView({behavior:'smooth',block:'center'});});
closeBudget.addEventListener('click',()=>budgetPanel.classList.add('hidden'));addBudgetRow.addEventListener('click',()=>addBudgetRow());clearBudget.addEventListener('click',()=>{budgetRows.innerHTML='';updateBudget();});contingency.addEventListener('input',updateBudget);renderHistory();
