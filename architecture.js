(() => {
  const loadPlanCad = () => {
    if (window.__ofieldPlanCadLoaded) return;
    window.__ofieldPlanCadLoaded = true;
    const s = document.createElement('script');
    s.src = 'plan-cad.js?v=2';
    s.defer = false;
    document.head.appendChild(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadPlanCad); else loadPlanCad();
})();