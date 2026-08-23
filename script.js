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
const addBudgetRowBtn = document.getElementById('addBudgetRow');
const clearBudget = document.getElementById('clearBudget');

let lastProject = '';
const API_URL = 'https://ofield-ai-api.luiseldorado110.workers.dev/';

const guides = {
  'Arquitectura': 'Prioriza distribución, medidas, circulaciones, orientación, materiales, etapas y presupuesto.',
  'Videojuego': 'Prioriza concepto jugable, historia, mundo, personajes, cámara, controles, mecánicas, niveles, arte y desarrollo.',
  'Aplicación / página web': 'Prioriza usuarios, problema, funciones, pantallas, flujo, tecnología, datos, seguridad y monetización.',
  'Proyecto escolar': 'Prioriza objetivo, investigación, metodología, materiales, procedimiento, entregables y cronograma.',
  'Negocio': 'Prioriza cliente objetivo, propuesta de valor, costos, precio, competencia, operación, marketing y ventas.',
  'Película / serie / animación': 'Prioriza premisa, género, personajes, mundo, estructura, producción, calendario y presupuesto.',
  'Comic / libro / historia': 'Prioriza premisa, personajes, conflicto, estructura, capítulos y arco narrativo.',
  'Diseño / producto': 'Prioriza usuario, problema, concepto, características, materiales, dimensiones, fabricación y costos.',
  'Otro proyecto': 'Detecta el tipo de proyecto y adapta la propuesta.'
};

const placeholders = {
  'Arquitectura': 'Ejemplo: quiero diseñar una casa de 2 pisos para una familia de 4 personas...',
  'Videojuego': 'Ejemplo: quiero crear un videojuego de mundo abierto en una ciudad...',
  'Aplicación / página web': 'Ejemplo: quiero crear una app para organizar gastos...',
  'Proyecto escolar': 'Ejemplo: necesito desarrollar un proyecto sobre energía solar...',
  'Negocio': 'Ejemplo: quiero iniciar un negocio de postres con $5,000 MXN...',
  'Película / serie / animación': 'Ejemplo: quiero crear una serie animada de 10 episodios...',
  'Comic / libro / historia': 'Ejemplo: quiero escribir una historia de superhéroes...',
  'Diseño / producto': 'Ejemplo: quiero diseñar un producto económico para estudiantes...',
  'Otro proyecto': 'Describe tu idea con todos los datos que tengas...'
};

function setMessage(text) {
  if (message) message.textContent = text;
}

if (type && idea) {
  type.addEventListener('change', () => {
    idea.placeholder = placeholders[type.value] || placeholders['Otro proyecto'];
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = idea.value.trim();
    if (!text) {
      setMessage('Escribe primero una idea para tu proyecto.');
      idea.focus();
      return;
    }

    const details = [
      `Tipo de proyecto: ${type.value}`,
      `Enfoque: ${guides[type.value] || guides['Otro proyecto']}`,
      `Datos: ${size.value.trim() || 'No especificado'}`,
      `Presupuesto: ${budget.value.trim() || 'No especificado'}`,
      `Idea: ${text}`
    ].join('\n');

    setMessage('✦ Ofield AI está preparando tu proyecto...');
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: details })
      });
      const data = await response.json();

      if (!response.ok || !data.result) {
        throw new Error(data.error || 'No se recibió una respuesta.');
      }

      resultSummary.textContent = `${type.value} · propuesta generada con Ofield AI.`;
      lastProject = `OFIELD AI — PROYECTO GENERADO\n\n${data.result}`;
      renderResult(data.result);
      saveProject({
        type: type.value,
        idea: text,
        size: size.value,
        budget: budget.value,
        answer: data.result,
        date: new Date().toLocaleString('es-MX')
      });

      result.classList.remove('hidden');
      setMessage('✓ Proyecto generado y guardado.');
      result.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      setMessage('No pudimos conectar con la IA. Revisa que el Worker esté desplegado e inténtalo de nuevo.');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

function renderResult(answer, title = 'Proyecto generado') {
  resultBox.innerHTML = `
    <div class="result-box">
      <h3>${escapeHtml(title)}</h3>
      <div class="ai-answer">${formatAnswer(answer)}</div>
      <div class="result-actions">
        <button class="secondary action-improve" data-action="Mejora este proyecto y hazlo más específico y profesional." type="button">✨ Mejorar</button>
        <button class="secondary action-improve" data-action="Amplía este proyecto con más detalle y ejemplos." type="button">＋ Más detalle</button>
        <button class="secondary action-improve" data-action="Crea un presupuesto detallado y realista para este proyecto." type="button">💰 Presupuesto</button>
        <button class="secondary action-improve" data-action="Convierte este proyecto en un plan paso a paso." type="button">✓ Plan de trabajo</button>
      </div>
    </div>`;

  resultBox.querySelectorAll('.action-improve').forEach((button) => {
    button.addEventListener('click', () => improveProject(button.dataset.action));
  });
}

async function improveProject(action) {
  if (!lastProject) return;
  setMessage('✦ Trabajando...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: `Proyecto actual:\n${lastProject}\n\nNueva instrucción:\n${action}`
      })
    });
    const data = await response.json();

    if (!response.ok || !data.result) throw new Error(data.error || 'Sin respuesta');

    lastProject = `OFIELD AI — PROYECTO GENERADO\n\n${data.result}`;
    renderResult(data.result, 'Proyecto actualizado');
    setMessage('✓ Proyecto actualizado.');
  } catch (error) {
    console.error(error);
    setMessage('No se pudo actualizar el proyecto.');
  }
}

if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    if (!lastProject) return;
    const url = URL.createObjectURL(new Blob([lastProject], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ofield-ai-proyecto.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

if (printBtn) {
  printBtn.addEventListener('click', () => {
    if (lastProject) window.print();
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    if (!lastProject) return;
    try {
      await navigator.clipboard.writeText(lastProject);
      copyBtn.textContent = '✓ Copiado';
      setTimeout(() => { copyBtn.textContent = '⧉ Copiar'; }, 1800);
    } catch (error) {
      console.error(error);
      setMessage('No se pudo copiar el proyecto.');
    }
  });
}

function saveProject(project) {
  const history = JSON.parse(localStorage.getItem('ofieldProjects') || '[]');
  history.unshift(project);
  localStorage.setItem('ofieldProjects', JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  if (!historyList) return;
  const history = JSON.parse(localStorage.getItem('ofieldProjects') || '[]');

  historyList.innerHTML = history.length
    ? history.map((project, index) => `
      <article class="history-card">
        <div>
          <span>${escapeHtml(project.type)}</span>
          <h3>${escapeHtml(String(project.idea).slice(0, 80))}</h3>
          <small>${escapeHtml(project.date)}</small>
        </div>
        <button class="secondary history-open" data-i="${index}" type="button">Abrir →</button>
      </article>`).join('')
    : '<p class="empty-history">Todavía no tienes proyectos guardados.</p>';

  historyList.querySelectorAll('.history-open').forEach((button) => {
    button.addEventListener('click', () => openHistory(Number(button.dataset.i)));
  });
}

function openHistory(index) {
  const history = JSON.parse(localStorage.getItem('ofieldProjects') || '[]');
  const project = history[index];
  if (!project) return;

  type.value = project.type;
  idea.value = project.idea;
  size.value = project.size || '';
  budget.value = project.budget || '';
  lastProject = `OFIELD AI — PROYECTO GENERADO\n\n${project.answer}`;
  renderResult(project.answer, 'Proyecto recuperado');
  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth' });
}

function formatAnswer(text) {
  return escapeHtml(text)
    .replace(/^###\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^##\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return entities[character];
  });
}

function money(value) {
  return Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });
}

function createBudgetRow(name = '', quantity = 1, price = 0) {
  if (!budgetRows) return;

  const row = document.createElement('div');
  row.className = 'budget-row';
  row.innerHTML = `
    <input class="b-name" placeholder="Concepto" value="${escapeHtml(name)}">
    <input class="b-qty" type="number" min="0" step="0.01" value="${quantity}">
    <input class="b-price" type="number" min="0" step="0.01" value="${price}">
    <strong class="b-sub">$0.00</strong>
    <button type="button" class="secondary b-remove">×</button>`;

  budgetRows.appendChild(row);
  row.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', updateBudget);
  });
  row.querySelector('.b-remove').addEventListener('click', () => {
    row.remove();
    updateBudget();
  });
  updateBudget();
}

function updateBudget() {
  if (!budgetRows || !budgetSubtotal || !budgetTotal) return;

  let subtotal = 0;
  budgetRows.querySelectorAll('.budget-row').forEach((row) => {
    const quantity = Number(row.querySelector('.b-qty').value) || 0;
    const price = Number(row.querySelector('.b-price').value) || 0;
    const rowTotal = quantity * price;
    subtotal += rowTotal;
    row.querySelector('.b-sub').textContent = money(rowTotal);
  });

  const percent = Math.max(0, Number(contingency ? contingency.value : 0) || 0);
  budgetSubtotal.textContent = money(subtotal);
  budgetTotal.textContent = money(subtotal * (1 + percent / 100));
}

if (openBudget && budgetPanel) {
  openBudget.addEventListener('click', () => {
    budgetPanel.classList.remove('hidden');

    if (!budgetRows.children.length) {
      createBudgetRow('Material', 1, 0);
      createBudgetRow('Mano de obra', 1, 0);
      createBudgetRow('Otros', 1, 0);
    }

    budgetPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (closeBudget && budgetPanel) {
  closeBudget.addEventListener('click', () => {
    budgetPanel.classList.add('hidden');
  });
}

if (addBudgetRowBtn) {
  addBudgetRowBtn.addEventListener('click', () => createBudgetRow());
}

if (clearBudget) {
  clearBudget.addEventListener('click', () => {
    budgetRows.innerHTML = '';
    updateBudget();
  });
}

if (contingency) {
  contingency.addEventListener('input', updateBudget);
}

renderHistory();
