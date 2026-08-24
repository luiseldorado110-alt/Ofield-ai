(() => {
  const STYLE_ID='ofield-corridor-style';
  function addStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`.ofield-corridor-label{font:700 8px Arial,sans-serif;fill:#222;text-anchor:middle}.ofield-corridor-wall{stroke:#111;stroke-width:3;fill:#fff}.ofield-corridor-door{stroke:#111;stroke-width:1.2;fill:none}`;document.head.appendChild(s);
  }
  const el=(ns,t,a={})=>{const e=document.createElementNS(ns,t);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e;};
  function inject(svg,level){
    if(svg.querySelector('.ofield-corridor')) return;
    const ns='http://www.w3.org/2000/svg',g=el(ns,'g');g.classList.add('ofield-corridor');
    if(level===2){
      const x=267,y=220,w=36,h=455;
      g.appendChild(el(ns,'rect',{x,y,width:w,height:h,class:'ofield-corridor-wall'}));
      const label=el(ns,'text',{x:x+w/2,y:y+h/2,class:'ofield-corridor-label',transform:`rotate(-90 ${x+w/2} ${y+h/2})`});label.textContent='PASILLO / DISTRIBUCIÓN · 1.20 m';g.appendChild(label);
      [270,370,470,570].forEach(yy=>g.appendChild(el(ns,'path',{d:`M ${x} ${yy} A 22 22 0 0 1 ${x-22} ${yy+22}`,class:'ofield-corridor-door'})));
      const n=el(ns,'text',{x:x+w/2,y:y+h+18,class:'ofield-corridor-label'});n.textContent='Circulación principal';g.appendChild(n);
    } else if(level===1){
      const x=115,y=450,w=340,h=34;
      g.appendChild(el(ns,'rect',{x,y,width:w,height:h,class:'ofield-corridor-wall'}));
      const label=el(ns,'text',{x:x+w/2,y:y+21,class:'ofield-corridor-label'});label.textContent='PASILLO / DISTRIBUCIÓN · 1.10 m';g.appendChild(label);
      [145,260,375].forEach(xx=>g.appendChild(el(ns,'path',{d:`M ${xx} ${y} A 20 20 0 0 0 ${xx+20} ${y+20}`,class:'ofield-corridor-door'})));
    }
    svg.appendChild(g);
  }
  function scan(){
    addStyle();
    document.querySelectorAll('#cadV2Result .cad-v2-svg').forEach(svg=>{
      const t=svg.querySelector('.cad-v2-title')?.textContent||'';
      if(t.includes('PLANTA 1')) inject(svg,1); else if(t.includes('PLANTA 2')) inject(svg,2);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();