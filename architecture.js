(() => {
  const start = () => {
    const old = document.querySelector('script[data-ofield-plan-cad]');
    if (old) old.remove();
    const s = document.createElement('script');
    s.src = 'plan-cad.js?v=4';
    s.setAttribute('data-ofield-plan-cad','1');
    s.onload = () => window.dispatchEvent(new Event('ofield-plan-ready'));
    document.head.appendChild(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();