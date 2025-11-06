// src/illustrations/air.js
const NS='http://www.w3.org/2000/svg';

export function createAirIllustration(){
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 1440 400');
  svg.setAttribute('class','illu illu-air');
  svg.setAttribute('aria-hidden','true');

  // Create defs for gradients and filters
  const defs=document.createElementNS(NS,'defs');

  // Glow filter for emotion elements
  const glowFilter=document.createElementNS(NS,'filter');
  glowFilter.setAttribute('id','airGlow');
  glowFilter.setAttribute('x','-50%');
  glowFilter.setAttribute('y','-50%');
  glowFilter.setAttribute('width','200%');
  glowFilter.setAttribute('height','200%');
  const feGlow1=document.createElementNS(NS,'feGaussianBlur');
  feGlow1.setAttribute('in','SourceGraphic');
  feGlow1.setAttribute('stdDeviation','2.5');
  feGlow1.setAttribute('result','blur');
  const feGlow2=document.createElementNS(NS,'feMerge');
  const feGlowNode1=document.createElementNS(NS,'feMergeNode');
  feGlowNode1.setAttribute('in','blur');
  const feGlowNode2=document.createElementNS(NS,'feMergeNode');
  feGlowNode2.setAttribute('in','SourceGraphic');
  feGlow2.append(feGlowNode1, feGlowNode2);
  glowFilter.appendChild(feGlow1);
  glowFilter.appendChild(feGlow2);
  defs.appendChild(glowFilter);

  // Heart gradient - warm emotion colors (BRIGHTER for visibility)
  const heartGrad=document.createElementNS(NS,'linearGradient');
  heartGrad.setAttribute('id','heartGradient');
  heartGrad.setAttribute('x1','0%');
  heartGrad.setAttribute('y1','0%');
  heartGrad.setAttribute('x2','0%');
  heartGrad.setAttribute('y2','100%');
  const heartStop1=document.createElementNS(NS,'stop');
  heartStop1.setAttribute('offset','0%');
  heartStop1.setAttribute('stop-color','#ff3388'); // Much brighter pink
  const heartStop2=document.createElementNS(NS,'stop');
  heartStop2.setAttribute('offset','100%');
  heartStop2.setAttribute('stop-color','#ff0066'); // Deeper magenta
  heartGrad.append(heartStop1, heartStop2);
  defs.appendChild(heartGrad);

  // Note gradient - musical expression (BRIGHTER for visibility)
  const noteGrad=document.createElementNS(NS,'linearGradient');
  noteGrad.setAttribute('id','noteGradient');
  noteGrad.setAttribute('x1','0%');
  noteGrad.setAttribute('y1','0%');
  noteGrad.setAttribute('x2','100%');
  noteGrad.setAttribute('y2','100%');
  const noteStop1=document.createElementNS(NS,'stop');
  noteStop1.setAttribute('offset','0%');
  noteStop1.setAttribute('stop-color','#5599ff'); // Much brighter blue
  const noteStop2=document.createElementNS(NS,'stop');
  noteStop2.setAttribute('offset','100%');
  noteStop2.setAttribute('stop-color','#3366ff'); // Deeper blue
  noteGrad.append(noteStop1, noteStop2);
  defs.appendChild(noteGrad);

  // Leaf gradient - transitioning from forest
  const leafGrad=document.createElementNS(NS,'linearGradient');
  leafGrad.setAttribute('id','airLeafGradient');
  leafGrad.setAttribute('x1','0%');
  leafGrad.setAttribute('y1','0%');
  leafGrad.setAttribute('x2','100%');
  leafGrad.setAttribute('y2','100%');
  const leafStop1=document.createElementNS(NS,'stop');
  leafStop1.setAttribute('offset','0%');
  leafStop1.setAttribute('stop-color','#8ec9a8');
  leafStop1.setAttribute('stop-opacity','0.6');
  const leafStop2=document.createElementNS(NS,'stop');
  leafStop2.setAttribute('offset','100%');
  leafStop2.setAttribute('stop-color','#6aa885');
  leafStop2.setAttribute('stop-opacity','0.4');
  leafGrad.append(leafStop1, leafStop2);
  defs.appendChild(leafGrad);

  svg.appendChild(defs);

  // Floating hearts - representing love and connection emotions
  function heart(cx, cy, size, delay){
    const path=document.createElementNS(NS,'path');
    const s=size;
    path.setAttribute('d',`M${cx} ${cy+s*0.3}
      c0 ${-s*0.5} ${-s*0.75} ${-s*0.75} ${-s*0.75} ${-s*0.25}
      c0 ${s*0.25} ${s*0.25} ${s*0.5} ${s*0.75} ${s*0.75}
      c${s*0.5} ${-s*0.25} ${s*0.75} ${-s*0.5} ${s*0.75} ${-s*0.75}
      c0 ${-s*0.5} ${-s*0.75} ${-s*0.75} ${-s*0.75} ${-s*0.25} Z`);
    path.setAttribute('class','air-heart');
    path.setAttribute('fill','url(#heartGradient)');
    path.setAttribute('stroke','#ff0066'); // Add stroke for visibility
    path.setAttribute('stroke-width','2');
    path.setAttribute('filter','url(#airGlow)');
    path.style.animationDelay=`${delay}s`;
    path.style.opacity='1'; // Force full opacity
    return path;
  }

  // Add floating hearts - AT THE VERY TOP
  svg.appendChild(heart(100, 15, 28, 0));  // Left top
  svg.appendChild(heart(180, 25, 24, 1.2)); // Left top
  svg.appendChild(heart(1260, 20, 32, 2.1)); // Right top
  svg.appendChild(heart(1340, 10, 26, 0.8)); // Right top

  // Musical notes - joy and expression
  function musicNote(x, y, size, delay){
    const g=document.createElementNS(NS,'g');
    g.setAttribute('class','air-note');
    g.setAttribute('filter','url(#airGlow)');
    g.style.animationDelay=`${delay}s`;
    g.style.opacity='1'; // Force full opacity

    // Note head
    const head=document.createElementNS(NS,'ellipse');
    head.setAttribute('cx',String(x));
    head.setAttribute('cy',String(y+size*0.8));
    head.setAttribute('rx',String(size*0.4));
    head.setAttribute('ry',String(size*0.3));
    head.setAttribute('fill','url(#noteGradient)');
    head.setAttribute('transform',`rotate(-20 ${x} ${y+size*0.8})`);
    g.appendChild(head);

    // Note stem
    const stem=document.createElementNS(NS,'line');
    stem.setAttribute('x1',String(x+size*0.35));
    stem.setAttribute('y1',String(y+size*0.8));
    stem.setAttribute('x2',String(x+size*0.35));
    stem.setAttribute('y2',String(y-size*0.3));
    stem.setAttribute('stroke','url(#noteGradient)');
    stem.setAttribute('stroke-width',String(size*0.12));
    stem.setAttribute('stroke-linecap','round');
    g.appendChild(stem);

    return g;
  }

  // Add musical notes - AT THE TOP
  svg.appendChild(musicNote(80, 40, 28, 0.5));   // Left top
  svg.appendChild(musicNote(140, 50, 26, 1.8));  // Left top
  svg.appendChild(musicNote(1300, 35, 30, 2.5)); // Right top
  svg.appendChild(musicNote(1360, 45, 26, 1.0)); // Right top

  // Breath ripples - calm and meditation
  function breathRipple(cx, cy, size, delay){
    const g=document.createElementNS(NS,'g');
    g.setAttribute('class','air-breath');
    g.style.animationDelay=`${delay}s`;
    // No opacity set here, CSS will handle it

    for(let i=0; i<3; i++){
      const circle=document.createElementNS(NS,'circle');
      circle.setAttribute('cx',String(cx));
      circle.setAttribute('cy',String(cy));
      circle.setAttribute('r',String(size*(0.8+i*0.3)));
      circle.setAttribute('fill','none');
      circle.setAttribute('stroke','rgba(100, 220, 255, 0.9)'); // Much brighter cyan
      circle.setAttribute('stroke-width','3'); // Thicker stroke
      circle.style.animationDelay=`${delay+i*0.3}s`;
      g.appendChild(circle);
    }

    return g;
  }

  // Add breath ripples - AT THE TOP
  svg.appendChild(breathRipple(120, 60, 60, 0));  // Left top
  svg.appendChild(breathRipple(1320, 55, 55, 1.5)); // Right top

  // Floating leaves - transition from forest scene
  function floatingLeaf(x, y, size, rotation, delay){
    const path=document.createElementNS(NS,'path');
    path.setAttribute('d',`M${x} ${y}
      q${size*0.3} ${-size*0.4} ${size*0.6} ${-size*0.2}
      q${size*0.3} ${size*0.2} ${size*0.6} ${size*0.2}
      q${-size*0.3} ${size*0.4} ${-size*0.6} ${size*0.2}
      q${-size*0.3} ${-size*0.2} ${-size*0.6} ${-size*0.2} Z`);
    path.setAttribute('class','air-leaf');
    path.setAttribute('fill','url(#airLeafGradient)');
    path.setAttribute('transform',`rotate(${rotation} ${x} ${y})`);
    path.style.animationDelay=`${delay}s`;
    return path;
  }

  // Add floating leaves - AT THE TOP
  svg.appendChild(floatingLeaf(60, 70, 16, 25, 0.3));   // Left top
  svg.appendChild(floatingLeaf(160, 80, 14, -15, 1.2)); // Left top
  svg.appendChild(floatingLeaf(1280, 75, 18, 40, 2.0)); // Right top
  svg.appendChild(floatingLeaf(1380, 65, 12, -30, 0.7)); // Right top

  // Energy flow lines - emotional energy
  function energyFlow(x1, y1, x2, y2, delay){
    const path=document.createElementNS(NS,'path');
    const mx=(x1+x2)/2;
    const my=(y1+y2)/2 - 60;
    path.setAttribute('d',`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`);
    path.setAttribute('class','air-flow');
    path.setAttribute('fill','none');
    path.setAttribute('stroke','rgba(120, 255, 200, 0.8)'); // Brighter cyan-green
    path.setAttribute('stroke-width','4'); // Thicker
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('filter','url(#airGlow)');
    path.style.animationDelay=`${delay}s`;
    return path;
  }

  // Add energy flows - AT THE TOP
  svg.appendChild(energyFlow(40, 20, 200, 50, 0));     // Left top
  svg.appendChild(energyFlow(80, 50, 180, 80, 1.0));   // Left top
  svg.appendChild(energyFlow(1240, 25, 1400, 55, 2.0)); // Right top
  svg.appendChild(energyFlow(1260, 55, 1380, 85, 0.5)); // Right top

  return svg;
}
