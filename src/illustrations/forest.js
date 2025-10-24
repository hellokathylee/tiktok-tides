// src/illustrations/forest.js
const NS='http://www.w3.org/2000/svg';

export function createForestIllustration(){
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 1440 400');
  svg.setAttribute('class','illu illu-forest');
  svg.setAttribute('aria-hidden','true');

  // Create defs for gradients to add depth
  const defs=document.createElementNS(NS,'defs');

  // Tree trunk gradient - cylindrical look
  const trunkGrad=document.createElementNS(NS,'linearGradient');
  trunkGrad.setAttribute('id','trunkGradient');
  trunkGrad.setAttribute('x1','0%');
  trunkGrad.setAttribute('y1','0%');
  trunkGrad.setAttribute('x2','100%');
  trunkGrad.setAttribute('y2','0%');
  const trunkStop1=document.createElementNS(NS,'stop');
  trunkStop1.setAttribute('offset','0%');
  trunkStop1.setAttribute('stop-color','#3d2817');
  const trunkStop2=document.createElementNS(NS,'stop');
  trunkStop2.setAttribute('offset','50%');
  trunkStop2.setAttribute('stop-color','#5a3d26');
  const trunkStop3=document.createElementNS(NS,'stop');
  trunkStop3.setAttribute('offset','100%');
  trunkStop3.setAttribute('stop-color','#2d1f12');
  trunkGrad.append(trunkStop1, trunkStop2, trunkStop3);
  defs.appendChild(trunkGrad);

  // Tree foliage gradient - light from above
  const leafGrad=document.createElementNS(NS,'linearGradient');
  leafGrad.setAttribute('id','leafGradient');
  leafGrad.setAttribute('x1','0%');
  leafGrad.setAttribute('y1','0%');
  leafGrad.setAttribute('x2','0%');
  leafGrad.setAttribute('y2','100%');
  const leafStop1=document.createElementNS(NS,'stop');
  leafStop1.setAttribute('offset','0%');
  leafStop1.setAttribute('stop-color','#4a8c5a');
  const leafStop2=document.createElementNS(NS,'stop');
  leafStop2.setAttribute('offset','50%');
  leafStop2.setAttribute('stop-color','#3a7549');
  const leafStop3=document.createElementNS(NS,'stop');
  leafStop3.setAttribute('offset','100%');
  leafStop3.setAttribute('stop-color','#2d5d38');
  leafGrad.append(leafStop1, leafStop2, leafStop3);
  defs.appendChild(leafGrad);

  // Cloud gradient - greenish gray, not white
  const cloudGrad=document.createElementNS(NS,'radialGradient');
  cloudGrad.setAttribute('id','cloudGradient');
  cloudGrad.setAttribute('cx','40%');
  cloudGrad.setAttribute('cy','30%');
  const cloudStop1=document.createElementNS(NS,'stop');
  cloudStop1.setAttribute('offset','0%');
  cloudStop1.setAttribute('stop-color','#d8e8e0'); // Greenish gray
  cloudStop1.setAttribute('stop-opacity','0.5'); // More transparent
  const cloudStop2=document.createElementNS(NS,'stop');
  cloudStop2.setAttribute('offset','60%');
  cloudStop2.setAttribute('stop-color','#c0d5d0');
  cloudStop2.setAttribute('stop-opacity','0.4');
  const cloudStop3=document.createElementNS(NS,'stop');
  cloudStop3.setAttribute('offset','100%');
  cloudStop3.setAttribute('stop-color','#a8c068');
  cloudStop3.setAttribute('stop-opacity','0.3');
  cloudGrad.append(cloudStop1, cloudStop2, cloudStop3);
  defs.appendChild(cloudGrad);

  // Mountain gradient - darker green
  const mountainGrad=document.createElementNS(NS,'linearGradient');
  mountainGrad.setAttribute('id','mountainGradient');
  mountainGrad.setAttribute('x1','0%');
  mountainGrad.setAttribute('y1','0%');
  mountainGrad.setAttribute('x2','0%');
  mountainGrad.setAttribute('y2','100%');
  const mtStop1=document.createElementNS(NS,'stop');
  mtStop1.setAttribute('offset','0%');
  mtStop1.setAttribute('stop-color','#2d5540'); // Darker green
  const mtStop2=document.createElementNS(NS,'stop');
  mtStop2.setAttribute('offset','100%');
  mtStop2.setAttribute('stop-color','#1f3d2e'); // Even darker
  mountainGrad.append(mtStop1, mtStop2);
  defs.appendChild(mountainGrad);

  // Ridge gradient - darker for consistency
  const ridgeGrad=document.createElementNS(NS,'linearGradient');
  ridgeGrad.setAttribute('id','ridgeGradient');
  ridgeGrad.setAttribute('x1','0%');
  ridgeGrad.setAttribute('y1','0%');
  ridgeGrad.setAttribute('x2','0%');
  ridgeGrad.setAttribute('y2','100%');
  const rdgStop1=document.createElementNS(NS,'stop');
  rdgStop1.setAttribute('offset','0%');
  rdgStop1.setAttribute('stop-color','#3a5d48'); // Darker
  const rdgStop2=document.createElementNS(NS,'stop');
  rdgStop2.setAttribute('offset','100%');
  rdgStop2.setAttribute('stop-color','#284535'); // Darker
  ridgeGrad.append(rdgStop1, rdgStop2);
  defs.appendChild(ridgeGrad);

  // Ground gradient - texture
  const groundGrad=document.createElementNS(NS,'linearGradient');
  groundGrad.setAttribute('id','groundGradient');
  groundGrad.setAttribute('x1','0%');
  groundGrad.setAttribute('y1','0%');
  groundGrad.setAttribute('x2','0%');
  groundGrad.setAttribute('y2','100%');
  const gndStop1=document.createElementNS(NS,'stop');
  gndStop1.setAttribute('offset','0%');
  gndStop1.setAttribute('stop-color','#3d6048');
  const gndStop2=document.createElementNS(NS,'stop');
  gndStop2.setAttribute('offset','100%');
  gndStop2.setAttribute('stop-color','#2a4535');
  groundGrad.append(gndStop1, gndStop2);
  defs.appendChild(groundGrad);

  // Bush gradient
  const bushGrad=document.createElementNS(NS,'radialGradient');
  bushGrad.setAttribute('id','bushGradient');
  const bushStop1=document.createElementNS(NS,'stop');
  bushStop1.setAttribute('offset','0%');
  bushStop1.setAttribute('stop-color','#4a7555');
  const bushStop2=document.createElementNS(NS,'stop');
  bushStop2.setAttribute('offset','100%');
  bushStop2.setAttribute('stop-color','#2f5038');
  bushGrad.append(bushStop1, bushStop2);
  defs.appendChild(bushGrad);

  // Drop shadow filter for depth
  const shadowFilter=document.createElementNS(NS,'filter');
  shadowFilter.setAttribute('id','dropShadow');
  shadowFilter.setAttribute('x','-50%');
  shadowFilter.setAttribute('y','-50%');
  shadowFilter.setAttribute('width','200%');
  shadowFilter.setAttribute('height','200%');
  const feGaussian=document.createElementNS(NS,'feGaussianBlur');
  feGaussian.setAttribute('in','SourceAlpha');
  feGaussian.setAttribute('stdDeviation','2');
  const feOffset=document.createElementNS(NS,'feOffset');
  feOffset.setAttribute('dx','2');
  feOffset.setAttribute('dy','3');
  feOffset.setAttribute('result','offsetblur');
  const feFlood=document.createElementNS(NS,'feFlood');
  feFlood.setAttribute('flood-color','#000000');
  feFlood.setAttribute('flood-opacity','0.3');
  const feComposite=document.createElementNS(NS,'feComposite');
  feComposite.setAttribute('in2','offsetblur');
  feComposite.setAttribute('operator','in');
  const feMerge=document.createElementNS(NS,'feMerge');
  const feMergeNode1=document.createElementNS(NS,'feMergeNode');
  const feMergeNode2=document.createElementNS(NS,'feMergeNode');
  feMergeNode2.setAttribute('in','SourceGraphic');
  feMerge.append(feMergeNode1, feMergeNode2);
  shadowFilter.append(feGaussian, feOffset, feFlood, feComposite, feMerge);
  defs.appendChild(shadowFilter);

  svg.appendChild(defs);

  // Clouds in the sky with gradient for volume
  function cloud(cx, cy, scale=1){
    const g=document.createElementNS(NS,'g');
    g.setAttribute('class','forest-cloud');
    g.style.opacity=String(0.3+Math.random()*0.2);
    g.setAttribute('filter','url(#dropShadow)');

    const c1=document.createElementNS(NS,'ellipse');
    c1.setAttribute('cx',String(cx));
    c1.setAttribute('cy',String(cy));
    c1.setAttribute('rx',String(40*scale));
    c1.setAttribute('ry',String(20*scale));
    c1.setAttribute('fill','url(#cloudGradient)');

    const c2=document.createElementNS(NS,'ellipse');
    c2.setAttribute('cx',String(cx-25*scale));
    c2.setAttribute('cy',String(cy+5*scale));
    c2.setAttribute('rx',String(30*scale));
    c2.setAttribute('ry',String(18*scale));
    c2.setAttribute('fill','url(#cloudGradient)');

    const c3=document.createElementNS(NS,'ellipse');
    c3.setAttribute('cx',String(cx+28*scale));
    c3.setAttribute('cy',String(cy+3*scale));
    c3.setAttribute('rx',String(35*scale));
    c3.setAttribute('ry',String(22*scale));
    c3.setAttribute('fill','url(#cloudGradient)');

    g.append(c1,c2,c3);
    return g;
  }

  // Add clouds
  svg.appendChild(cloud(200, 80, 1.2));
  svg.appendChild(cloud(600, 120, 0.9));
  svg.appendChild(cloud(950, 60, 1.1));
  svg.appendChild(cloud(1300, 100, 0.8));

  // Flying birds
  function bird(x, y, delay){
    const path=document.createElementNS(NS,'path');
    path.setAttribute('d',`M${x} ${y} q-8 -6 -12 0 q8 -5 12 0 q4 -5 12 0 q-8 6 -12 0`);
    path.setAttribute('class','forest-bird');
    path.style.animationDelay=`${delay}s`;
    return path;
  }

  // Add more birds flying across sky
  for(let i=0; i<12; i++){
    const x = 150 + i*110;
    const y = 80 + (i%3)*30 + Math.random()*20;
    svg.appendChild(bird(x, y, i*0.5));
  }

  // Distant mountains with gradient
  const mountains=document.createElementNS(NS,'path');
  mountains.setAttribute('d','M0 240 L180 180 L280 200 L420 150 L560 170 L720 130 L880 160 L1040 140 L1200 170 L1360 150 L1440 180 L1440 400 L0 400 Z');
  mountains.setAttribute('class','forest-mountains');
  mountains.setAttribute('fill','url(#mountainGradient)');
  mountains.setAttribute('filter','url(#dropShadow)');
  svg.appendChild(mountains);

  // far ridge - more organic with gradient
  const ridge=document.createElementNS(NS,'path');
  ridge.setAttribute('d','M0,260 C180,220 320,240 520,230 C760,215 980,250 1200,230 C1320,220 1440,240 1440,400 L0,400 Z');
  ridge.setAttribute('class','forest-ridge');
  ridge.setAttribute('fill','url(#ridgeGradient)');
  ridge.setAttribute('filter','url(#dropShadow)');
  svg.appendChild(ridge);

  // mid ground with gradient texture
  const ground=document.createElementNS(NS,'rect');
  ground.setAttribute('x','0');
  ground.setAttribute('y','300');
  ground.setAttribute('width','1440');
  ground.setAttribute('height','100');
  ground.setAttribute('class','forest-ground');
  ground.setAttribute('fill','url(#groundGradient)');
  svg.appendChild(ground);

  // bushes/undergrowth along ground with gradient
  for(let x=0; x<1440; x+=80){
    const bush=document.createElementNS(NS,'ellipse');
    bush.setAttribute('cx',String(x+20+(Math.random()*40)));
    bush.setAttribute('cy','300');
    bush.setAttribute('rx',String(25+Math.random()*15));
    bush.setAttribute('ry',String(12+Math.random()*8));
    bush.setAttribute('class','forest-bush');
    bush.setAttribute('fill','url(#bushGradient)');
    bush.setAttribute('filter','url(#dropShadow)');
    svg.appendChild(bush);
  }

  // refined pine factory with 3 layers and gradients
  function pine(x, baseY, h, opacity=1){
    const g=document.createElementNS(NS,'g');
    g.setAttribute('class','pine sway');
    g.style.opacity = String(opacity);
    g.setAttribute('filter','url(#dropShadow)');

    // Trunk with gradient for cylindrical appearance
    const trunk=document.createElementNS(NS,'rect');
    trunk.setAttribute('x',String(x-5));
    trunk.setAttribute('y',String(baseY-h*0.2));
    trunk.setAttribute('width','10');
    trunk.setAttribute('height',String(h*0.25));
    trunk.setAttribute('rx','2');
    trunk.setAttribute('class','trunk');
    trunk.setAttribute('fill','url(#trunkGradient)');

    // Three layers of foliage with gradient for depth
    const tri1=document.createElementNS(NS,'polygon');
    tri1.setAttribute('points',`${x},${baseY-h} ${x-18},${baseY-h*0.65} ${x+18},${baseY-h*0.65}`);
    tri1.setAttribute('class','leaf');
    tri1.setAttribute('fill','url(#leafGradient)');

    const tri2=document.createElementNS(NS,'polygon');
    tri2.setAttribute('points',`${x},${baseY-h*0.75} ${x-26},${baseY-h*0.45} ${x+26},${baseY-h*0.45}`);
    tri2.setAttribute('class','leaf');
    tri2.setAttribute('fill','url(#leafGradient)');

    const tri3=document.createElementNS(NS,'polygon');
    tri3.setAttribute('points',`${x},${baseY-h*0.50} ${x-32},${baseY-h*0.20} ${x+32},${baseY-h*0.20}`);
    tri3.setAttribute('class','leaf');
    tri3.setAttribute('fill','url(#leafGradient)');

    g.append(trunk, tri1, tri2, tri3);
    return g;
  }

  // Background layer - smaller, more distant trees
  for(let x=30; x<1440; x+=35){
    const h=80+(x*7%30);
    svg.appendChild(pine(x, 280, h, 0.4));
  }

  // Mid layer - medium trees with variety
  for(let x=50; x<1440; x+=60){
    const h=110+((x*13)%40);
    svg.appendChild(pine(x, 310, h, 0.7));
  }

  // Foreground layer - larger, more prominent trees
  for(let x=25; x<1440; x+=90){
    const h=140+((x*17)%35);
    svg.appendChild(pine(x+15, 340, h, 0.95));
  }

  return svg;
}
