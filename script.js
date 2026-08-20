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

let lastProject = '';
const API_URL = 'https://ofield-ai-api.luiseldorado110.workers.dev/';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = idea.value.trim();
  if (!text) {
    message.textContent = 'Escribe primero una idea para tu proyecto.';
    idea.focus();
    return;
  }

  const details = `Tipo: ${type.value}\nDatos/tamaño: ${size.value.trim() || 'No especificado'}\nPresupuesto: ${budget.value.trim() || 'No especificado'}\nIdea: ${text}`;

  message.textContent = '✦ Ofield AI está preparando tu proyecto...';
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.style.opacity = '.6';

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

    const answer = data.result;
    resultSummary.textContent = `${type.value} · propuesta generada con Ofield AI.`;
    resultBox.innerHTML = `<div class="result-box"><div class="result-section"><h3>Proyecto generado</h3><div class="ai-answer">${formatAnswer(answer)}</div></div></div>`;

    lastProject = `OFIELD AI — PROYECTO GENERADO\n\n${answer}`;
    saveProject({ type: type.value, idea: text, answer, date: new Date().toLocaleString('es-MX') });
    result.classList.remove('hidden');
    message.textContent = '✓ Proyecto generado y guardado en tu historial.';
    result.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error(error);
    message.textContent = 'No pudimos conectar con la IA. Revisa que el Worker esté desplegado e inténtalo de nuevo.';
  } finally {
    button.disabled = false;
    button.style.opacity = '1';
  }
});

downloadBtn.addEventListener('click', () => {
  if (!lastProject) return;
  const blob = new Blob([lastProject], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ofield-ai-proyecto.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

printBtn.addEventListener('click', () => {
  if (!lastProject) return;
  window.print();
});

copyBtn.addEventListener('click', async () => {
  if (!lastProject) return;
  try {
    await navigator.clipboard.writeText(lastProject);
    copyBtn.textContent = '✓ Copiado';
    setTimeout(() => copyBtn.textContent = '⧉ Copiar', 1800);
  } catch {
    copyBtn.textContent = 'No disponible';
    setTimeout(() => copyBtn.textContent = '⧉ Copiar', 1800);
  }
});

function saveProject(project) {
  const history = JSON.parse(localStorage.getItem('ofieldProjects') || '[]');
  history.unshift(project);
  localStorage.setItem('ofieldProjects', JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('ofieldProjects') || '[]');
  if (!history.length) {
    historyList.innerHTML = '<p class="empty-history">Todavía no tienes proyectos guardados.</p>';
    return;
  }
  historyList.innerHTML = history.map((p, i) => `
    <article class="history-card">
      <div><span>${escapeHtml(p.type)}</span><h3>${escapeHtml(p.idea.slice(0, 80))}${p.idea.length > 80 ? '…' : ''}</h3><small>${escapeHtml(p.date)}</small></div>
      <button class="secondary history-open" data-index="${i}">Abrir →</button>
    </article>
  `).join('');

  document.querySelectorAll('.history-open').forEach(btn => {
    btn.addEventListener('click', () => openHistory(Number(btn.dataset.index)));
  });
}

function openHistory(index) {
  const history = JSON.parse(localStorage.getItem('ofieldProjects') || '[]');
  const project = history[index];
  if (!project) return;
  type.value = project.type;
  idea.value = project.idea;
  resultSummary.textContent = `${project.type} · proyecto recuperado del historial.`;
  resultBox.innerHTML = `<div class="result-box"><div class="result-section"><h3>Proyecto recuperado</h3><div class="ai-answer">${formatAnswer(project.answer)}</div></div></div>`;
  lastProject = `OFIELD AI — PROYECTO GENERADO\n\n${project.answer}`;
  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth' });
}

function formatAnswer(text) {
  let html = escapeHtml(text);

  html = html.replace(/(?:^|<br>)(\|.+\|)(?:<br>)(\|\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|)(?:(?:<br>)(\|.+\|))+/g, (block) => {
    const lines = block.replace(/^<br>/, '').split('<br>').filter(Boolean);
    if (lines.length < 3) return block;
    const headers = parseTableRow(lines[0]);
    const rows = lines.slice(2).map(parseTableRow);
    return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  });

  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  html = html.replace(/(?:^|<br>)[ \t]*[\-*]\s+(.+)(?=<br>|$)/g, '<li>$1</li>');
  html = html.replace(/(?:<li>.*?<\/li>)(?:<br><li>.*?<\/li>)*/g, (list) => `<ul>${list.replace(/<br>/g, '')}</ul>`);
  html = html.replace(/(?:^|<br>)[ \t]*\d+[.)]\s+(.+)(?=<br>|$)/g, '<li>$1</li>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/(?:<br>){3,}/g, '<br><br>');
  html = html.replace(/^(?:<br>)+|(?:<br>)+$/g, '');

  return html;
}

function parseTableRow(row) {
  return row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
}

renderHistory();
