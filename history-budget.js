(() => {
  const KEY = 'ofieldBudgetByProject';
  let activeIndex = 0;
  const $ = id => document.getElementById(id);
  const money = v => Number(v || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  function readRows() {
    const rows = $('budgetRows');
    if (!rows) return [];
    return [...rows.querySelectorAll('.budget-row')].map(r => ({
      name: r.querySelector('.b-name')?.value || '',
      category: r.querySelector('.b-category')?.value || 'Materiales',
      qty: Number(r.querySelector('.b-qty')?.value) || 0,
      unit: r.querySelector('.b-unit')?.value || '',
      price: Number(r.querySelector('.b-price')?.value) || 0
    }));
  }

  function saveBudget() {
    const rows = readRows();
    if (!rows.length) return;
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    all[activeIndex] = {
      rows,
      contingency: Number($('contingency')?.value) || 0,
      area: Number($('budgetArea')?.value) || 0,
      materials: $('budgetMaterials')?.textContent || money(0),
      labor: $('budgetLabor')?.textContent || money(0),
      other: $('budgetOther')?.textContent || money(0),
      subtotal: $('budgetSubtotal')?.textContent || money(0),
      total: $('budgetTotal')?.textContent || money(0),
      costPerM2: $('costPerM2')?.textContent || '$0.00 / m²',
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  function loadBudget(index) {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    const data = all[index];
    if (!data || !$('budgetRows')) return false;
    $('budgetRows').innerHTML = '';
    data.rows.forEach(item => {
      const row = document.createElement('div');
      row.className = 'budget-row';
      row.innerHTML = `<input class="b-name" placeholder="Concepto"><select class="b-category"><option>Materiales</option><option>Mano de obra</option><option>Transporte / otros</option></select><input class="b-qty" type="number" min="0" step="0.01"><input class="b-unit" placeholder="Unidad"><input class="b-price" type="number" min="0" step="0.01"><strong class="b-sub">$0.00</strong><button type="button" class="secondary b-remove">×</button>`;
      row.querySelector('.b-name').value = item.name;
      row.querySelector('.b-category').value = item.category;
      row.querySelector('.b-qty').value = item.qty;
      row.querySelector('.b-unit').value = item.unit;
      row.querySelector('.b-price').value = item.price;
      row.querySelectorAll('input,select').forEach(el => el.addEventListener('input', () => { saveBudget(); window.dispatchEvent(new Event('ofield-budget-refresh')); }));
      row.querySelector('.b-remove').addEventListener('click', () => { row.remove(); saveBudget(); window.dispatchEvent(new Event('ofield-budget-refresh')); });
      $('budgetRows').appendChild(row);
    });
    if ($('contingency')) $('contingency').value = data.contingency;
    if ($('budgetArea')) $('budgetArea').value = data.area;
    if (typeof window.updateBudget === 'function') window.updateBudget();
    $('budgetPanel')?.classList.remove('hidden');
    $('budgetPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  function enhanceHistory() {
    document.querySelectorAll('.history-open').forEach(btn => {
      if (btn.dataset.budgetEnhanced) return;
      btn.dataset.budgetEnhanced = '1';
      btn.addEventListener('click', () => { activeIndex = Number(btn.dataset.i) || 0; }, true);
      const wrap = btn.parentElement;
      const all = JSON.parse(localStorage.getItem(KEY) || '{}');
      const index = Number(btn.dataset.i);
      if (all[index] && !wrap.querySelector('.history-budget-open')) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'secondary history-budget-open';
        b.textContent = '💰 Presupuesto';
        b.addEventListener('click', e => { e.stopPropagation(); activeIndex = index; loadBudget(index); });
        wrap.appendChild(b);
      }
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.history-open');
    if (btn) activeIndex = Number(btn.dataset.i) || 0;
  }, true);

  document.addEventListener('input', e => {
    if (e.target.closest('#budgetPanel')) {
      clearTimeout(window.__ofieldBudgetSaveTimer);
      window.__ofieldBudgetSaveTimer = setTimeout(saveBudget, 250);
    }
  });
  document.addEventListener('change', e => {
    if (e.target.closest('#budgetPanel')) saveBudget();
  });

  const history = $('historyList');
  if (history) new MutationObserver(enhanceHistory).observe(history, { childList: true, subtree: true });
  setTimeout(enhanceHistory, 300);
  window.addEventListener('beforeunload', saveBudget);
})();