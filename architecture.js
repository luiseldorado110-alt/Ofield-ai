(() => {
  const start = () => {
    const old = document.querySelector('script[data-ofield-plan-cad]');
    if (old) old.remove();
    const s = document.createElement('script');
    s.src = 'professional-plan.js?v=1';
    s.setAttribute('data-ofield-plan-professional','1');
    s.onload = () => window.dispatchEvent(new Event('ofield-plan-ready'));
    document.head.appendChild(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();