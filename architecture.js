(() => {
  'use strict';

  const attach = () => {
    const button = document.getElementById('openConceptPlan');
    if (!button) return false;

    button.removeAttribute('onclick');
    button.dataset.ofieldBound = '1';
    button.onclick = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof window.__ofieldOpenPlan === 'function') {
        window.__ofieldOpenPlan();
        return;
      }
      const panel = document.getElementById('conceptPlanPanel');
      if (panel) {
        panel.classList.remove('hidden');
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    return true;
  };

  const loadScript = (src, key, after) => {
    if (window[key]) {
      after?.();
      return;
    }
    window[key] = true;
    const script = document.createElement('script');
    script.src = src;
    script.defer = false;
    script.onload = () => after?.();
    script.onerror = () => console.error('[Ofield AI] No se pudo cargar:', src);
    document.head.appendChild(script);
  };

  const cleanLegacy = () => {
    document.querySelectorAll('script[src*="plan-smart.js"],script[src*="plan-cad.js"],script[src*="corridor-cad.js"]').forEach(s => s.remove());
    document.querySelectorAll('#conceptPlanPanel').forEach((panel, i) => {
      if (i > 0) panel.remove();
    });
  };

  const start = () => {
    cleanLegacy();
    attach();
    loadScript('history-budget.js?v=3', '__ofieldHistoryBudgetLoaded', () => {
      loadScript('professional-plan.js?v=5', '__ofieldProfessionalPlanLoaded', () => {
        if (typeof window.__ofieldBuildPlan === 'function') window.__ofieldBuildPlan();
        if (typeof window.__ofieldOpenPlan === 'function') window.__ofieldOpenPlan.attach?.();
        attach();
      });
    });

    let attempts = 0;
    const retry = () => {
      if (attach() || attempts++ >= 30) return;
      setTimeout(retry, 200);
    };
    retry();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();