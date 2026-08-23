(() => {
  const planEl = id => document.getElementById(id);
  const escPlan = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function roomPlan(level, rooms, cars, needs) {
    const cells = [];
    if (level === 1) {
      if (cars > 0) cells.push(`<div class="plan-room wide"><b>COCHERA</b><small>${cars} auto(s)</small></div>`);
      cells.push('<div class="plan-room"><b>SALA</b><small>Área social</small></div>');
      cells.push('<div class="plan-room"><b>COMEDOR</b><small>Área social</small></div>');
      cells.push('<div class="plan-room"><b>COCINA</b><small>Abierta / barra</small></div>');
      cells.push('<div class="plan-room"><b>BAÑO</b><small>Completo</small></div>');
      cells.push('<div class="plan-room"><b>ESCALERA</b><small>Conexión vertical</small></div>');
      cells.push('<div class="plan-room wide"><b>PATIO / SERVICIO</b><small>Iluminación y ventilación</small></div>');
    } else {
      for (let i = 1; i <= rooms; i++) cells.push(`<div class="plan-room"><b>RECÁMARA ${i}</b><small>Área privada</small></div>`);
      cells.push('<div class="plan-room"><b>BAÑO</b><small>Distribución conceptual</small></div>');
      cells.push('<div class="plan-room"><b>ESTAR / CIRCULACIÓN</b><small>Área familiar</small></div>');
      if (needs) cells.push(`<div class="plan-room wide"><b>NECESIDADES</b><small>${escPlan(needs)}</small></div>`);
    }
    return `<div class="concept-floor"><div class="floor-title">PLANTA ${level}</div><div class="plan-grid">${cells.join('')}</div></div>`;
  }

  function generatePlan() {
    const L = Number(planEl('planL')?.value) || 0;
    const W = Number(planEl('planW')?.value) || 0;
    const levels = Number(planEl('planLevels')?.value) || 2;
    const rooms = Number(planEl('planRooms')?.value) || 3;
    const baths = Number(planEl('planBaths')?.value) || 2;
    const cars = Number(planEl('planCars')?.value) || 0;
    const needs = (planEl('planNeeds')?.value || '').trim();
    const msg = planEl('conceptPlanMessage');
    const out = planEl('conceptPlanResult');
    if (!L || !W) { msg.textContent = 'Ingresa frente y fondo del terreno.'; return; }
    msg.textContent = '✦ Generando distribución conceptual...';
    let floors = '';
    for (let i = 1; i <= levels; i++) floors += roomPlan(i, rooms, cars, needs);
    out.innerHTML = `<div class="result-box"><h3>Plano conceptual · ${L} × ${W} m</h3><p><strong>Terreno:</strong> ${(L * W).toFixed(2)} m² · <strong>Niveles:</strong> ${levels} · <strong>Recámaras:</strong> ${rooms} · <strong>Baños:</strong> ${baths} · <strong>Autos:</strong> ${cars}</p><div class="concept-plan">${floors}</div><p class="message">⚠️ Es un plano conceptual, no ejecutivo. Las medidas, estructura, instalaciones, orientación, retiros y normativa deben ser revisadas por un profesional.</p><button id="printConceptPlan" class="primary" type="button">▣ Imprimir / Guardar PDF</button></div>`;
    planEl('printConceptPlan').onclick = () => window.print();
    msg.textContent = '✓ Plano conceptual generado.';
  }

  function addPlanTool() {
    const tools = document.querySelector('.tools .grid');
    const section = document.querySelector('#herramientas');
    if (!tools || !section || document.getElementById('openConceptPlan')) return;

    const card = document.createElement('article');
    card.innerHTML = '<div class="tool-icon">📐</div><h3>Plano conceptual</h3><p>Genera una distribución visual orientativa de tu vivienda por niveles.</p><button id="openConceptPlan" class="secondary" type="button">Generar plano</button><span>Disponible</span>';
    tools.appendChild(card);

    const panel = document.createElement('div');
    panel.id = 'conceptPlanPanel';
    panel.className = 'budget-panel hidden';
    panel.innerHTML = `<div class="budget-top"><div><div class="section-tag">ARQUITECTURA / PLANO</div><h3>Generador de plano conceptual</h3><p>Introduce las dimensiones y necesidades. Ofield AI creará una distribución visual orientativa.</p></div><button id="closeConceptPlan" class="secondary" type="button">Cerrar</button></div><div class="form-grid"><div><label for="planL">Frente (m)</label><input id="planL" type="number" min="1" step="0.1" value="8"></div><div><label for="planW">Fondo (m)</label><input id="planW" type="number" min="1" step="0.1" value="20"></div></div><div class="form-grid"><div><label for="planLevels">Niveles</label><select id="planLevels"><option value="1">1 planta</option><option value="2" selected>2 plantas</option><option value="3">3 plantas</option></select></div><div><label for="planRooms">Recámaras</label><input id="planRooms" type="number" min="1" max="8" value="3"></div></div><div class="form-grid"><div><label for="planBaths">Baños</label><input id="planBaths" type="number" min="1" max="6" value="2"></div><div><label for="planCars">Autos</label><input id="planCars" type="number" min="0" max="4" value="2"></div></div><label for="planNeeds">Necesidades adicionales</label><textarea id="planNeeds" rows="4" placeholder="Ej. cocina abierta, patio trasero, lavandería, estudio, terraza..."></textarea><button id="generateConceptPlan" class="primary full" type="button">Generar plano conceptual ✦</button><p id="conceptPlanMessage" class="message"></p><div id="conceptPlanResult"></div>`;
    section.appendChild(panel);

    document.getElementById('openConceptPlan').addEventListener('click', () => {
      panel.classList.remove('hidden');
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('closeConceptPlan').addEventListener('click', () => panel.classList.add('hidden'));
    document.getElementById('generateConceptPlan').addEventListener('click', generatePlan);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addPlanTool);
  else addPlanTool();
})();