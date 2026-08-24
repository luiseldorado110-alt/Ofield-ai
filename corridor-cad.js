(() => {
  const STYLE_ID='ofield-corridor-style';
  function addStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .ofield-corridor-label{font:700 8px Arial, sans-serif;fill:#222;text-anchor:middle}
      .ofield-corridor-wall{stroke:#111;stroke-width:3;fill:#fff}
      .ofield-corridor-door{stroke:#111;stroke-width:1.2;fill:none}
      .ofield-corridor-dash{stroke:#777;stroke-width:1;stroke-dasharray:4 3;fill:none}
    `;document.head.appendChild(s);
  }
  function inject(svg, level){
    if(svg.querySelector('.ofield-corridor')) return;
    const ns='http://www.w3.org/2000/svg';
    const g=document.createElementNS(ns,'g');g.classList.add('ofield-corridor');
    const x=267,y=220,w=36,h=455;
    const r=document.createElementNS(ns,'rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',w);r.setAttribute('height',h);r.setAttribute('class','ofield-corridor-wall');g.appendChild(r);
    const label=document.createElementNS(ns,'text');label.setAttribute('x',x+w/2);label.setAttribute('y',y+h/2);label.setAttribute('class','ofield-corridor-label');label.setAttribute('transform',`rotate(-90 ${x+w/2} ${y+h/2})`);label.textContent='PASILLO / DISTRIBUCIÓN · 1.20 m';g.appendChild(label);
    [270,370,470,570].forEach(yy=>{const d=document.createElementNS(ns,'path');d.setAttribute('d',`M ${x} ${yy} A 22 22 0 0 1 ${x-22} ${yy+22}`);d.setAttribute('class','ofield-corridor-door');g.appendChild(d);});
    const note=document.createElementNS(ns,'text');note.setAttribute('x',x+w/2);note.setAttribute('y',y+h+18);note.setAttribute('class','ofield-corridor-label');note.textContent='Circulación principal';g.appendChild(note);
    svg.appendChild(g);
  }
  function scan(){
    addStyle();
    document.querySelectorAll('#cadV2Result .cad-v2-svg').forEach(svg=>{
      const title=svg.querySelector('.cad-v2-title');
      const t=title?.textContent||'';
      if(t.includes('PLANTA 2')) inject(svg,2);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',scan); else scan();
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();