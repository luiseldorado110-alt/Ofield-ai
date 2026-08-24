(() => {
  const load = (src, key, next) => {
    if (window[key]) { next?.(); return; }
    window[key] = true;
    const s = document.createElement('script');
    s.src = src;
    s.defer = false;
    s.onload = () => next?.();
    document.head.appendChild(s);
  };
  const start = () => load('plan-cad.js?v=3', '__ofieldPlanCadLoaded', () => load('corridor-cad.js?v=1', '__ofieldCorridorLoaded'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();