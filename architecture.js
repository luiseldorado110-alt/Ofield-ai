(() => {
  const loadScript = (src, key, after) => {
    if (window[key]) { after?.(); return; }
    window[key] = true;
    const s = document.createElement('script');
    s.src = src;
    s.defer = false;
    s.onload = () => after?.();
    s.onerror = () => console.error('[Ofield AI] No se pudo cargar:', src);
    document.head.appendChild(s);
  };

  const cleanLegacy = () => {
    document.querySelectorAll('script[src*="plan-smart.js"],script[src*="plan-cad.js"],script[src*="corridor-cad.js"]').forEach(s => s.remove());
    const open = document.getElementById('openConceptPlan');
    if (open) open.removeAttribute('onclick');
    document.querySelectorAll('#conceptPlanPanel').forEach((panel, i) => {
      if (i > 0) panel.remove();
    });
  };

  const start = () => {
    cleanLegacy();
    loadScript('history-budget.js?v=2', '__ofieldHistoryBudgetLoaded', () => {
      loadScript('professional-plan.js?v=4', '__ofieldProfessionalPlanLoaded', () => {
        window.dispatchEvent(new Event('ofield-professional-plan-ready'));
        const open = document.getElementById('openConceptPlan');
        if (open && !open.dataset.ofieldBound) {
          open.dataset.ofieldBound = '1';
          open.addEventListener('click', e => {
            e.preventDefault();
            const panel = document.getElementById('conceptPlanPanel');
            if (panel) {
              panel.classList.remove('hidden');
              panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }
      });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();