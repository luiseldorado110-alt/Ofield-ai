(() => {
  const load = () => {
    if (window.__ofieldProfessionalPlanLoaded) return;
    window.__ofieldProfessionalPlanLoaded = true;
    const s = document.createElement('script');
    s.src = 'professional-plan.js?v=2';
    s.defer = false;
    s.onload = () => window.dispatchEvent(new Event('ofield-professional-plan-ready'));
    document.head.appendChild(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();