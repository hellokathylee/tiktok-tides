// src/illustrations/city.js
const NS='http://www.w3.org/2000/svg';

export function createCityIllustration(){
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 1440 360');
  svg.setAttribute('class','illu illu-city');
  svg.setAttribute('aria-hidden','true');

  // Moon
  const moon=document.createElementNS(NS,'circle');
  moon.setAttribute('cx','1320');
  moon.setAttribute('cy','80');
  moon.setAttribute('r','35');
  moon.setAttribute('class','city-moon');
  svg.appendChild(moon);

  // Moon glow
  const moonGlow=document.createElementNS(NS,'circle');
  moonGlow.setAttribute('cx','1320');
  moonGlow.setAttribute('cy','80');
  moonGlow.setAttribute('r','50');
  moonGlow.setAttribute('class','city-moon-glow');
  svg.appendChild(moonGlow);

  // Distant mountain/building silhouette
  const distantSilhouette=document.createElementNS(NS,'path');
  distantSilhouette.setAttribute('d','M0 200 L120 180 L180 190 L280 160 L380 175 L480 155 L600 170 L720 145 L840 165 L960 150 L1080 170 L1200 155 L1320 175 L1440 165 L1440 360 L0 360 Z');
  distantSilhouette.setAttribute('class','city-distant');
  svg.appendChild(distantSilhouette);

  // skyline buildings - taller and more varied
  for(let x=0;x<1440;x+=52){
    const h=200+((x*37)%120); // Increased base height from 140 to 200
    const b=document.createElementNS(NS,'rect');
    b.setAttribute('x',String(x+6));
    b.setAttribute('y',String(360-h));
    b.setAttribute('width','40');
    b.setAttribute('height',String(h));
    b.setAttribute('rx','2');
    b.setAttribute('class','bldg');
    svg.appendChild(b);

    // Antenna/spire on tallest buildings
    if(h>280 && (x%208===0)){
      const antenna=document.createElementNS(NS,'line');
      antenna.setAttribute('x1',String(x+26));
      antenna.setAttribute('y1',String(360-h));
      antenna.setAttribute('x2',String(x+26));
      antenna.setAttribute('y2',String(360-h-40));
      antenna.setAttribute('class','city-antenna');
      svg.appendChild(antenna);

      // Red light on top
      const light=document.createElementNS(NS,'circle');
      light.setAttribute('cx',String(x+26));
      light.setAttribute('cy',String(360-h-40));
      light.setAttribute('r','3');
      light.setAttribute('class','city-antenna-light');
      svg.appendChild(light);
    }

    // Neon sign on some tall buildings
    if(h>250 && (x%156===0)){
      const neon=document.createElementNS(NS,'rect');
      neon.setAttribute('x',String(x+14));
      neon.setAttribute('y',String(360-h+20));
      neon.setAttribute('width','18');
      neon.setAttribute('height','14');
      neon.setAttribute('class','city-neon');
      neon.style.animationDelay=`${x%5/10}s`;
      svg.appendChild(neon);
    }

    // a few windows
    for(let wy=360-h+18; wy<360-18; wy+=20){
      if(((wy+x)%3)!==0) continue;
      const w=document.createElementNS(NS,'rect');
      w.setAttribute('x',String(x+14));
      w.setAttribute('y',String(wy));
      w.setAttribute('width','6');
      w.setAttribute('height','8');
      w.setAttribute('class','win twinkle');
      w.style.animationDelay=`${(x+wy)%7/10}s`;
      svg.appendChild(w);
    }
  }

  // Street lamps
  for(let x=80; x<1440; x+=160){
    // Lamp post
    const post=document.createElementNS(NS,'rect');
    post.setAttribute('x',String(x-2));
    post.setAttribute('y','320');
    post.setAttribute('width','4');
    post.setAttribute('height','40');
    post.setAttribute('class','city-lamp-post');
    svg.appendChild(post);

    // Lamp head
    const lampHead=document.createElementNS(NS,'ellipse');
    lampHead.setAttribute('cx',String(x));
    lampHead.setAttribute('cy','318');
    lampHead.setAttribute('rx','10');
    lampHead.setAttribute('ry','6');
    lampHead.setAttribute('class','city-lamp');
    svg.appendChild(lampHead);

    // Light glow
    const glow=document.createElementNS(NS,'ellipse');
    glow.setAttribute('cx',String(x));
    glow.setAttribute('cy','325');
    glow.setAttribute('rx','20');
    glow.setAttribute('ry','15');
    glow.setAttribute('class','city-lamp-glow');
    svg.appendChild(glow);
  }

  // ground line
  const g=document.createElementNS(NS,'rect');
  g.setAttribute('x','0');
  g.setAttribute('y','356');
  g.setAttribute('width','1440');
  g.setAttribute('height','4');
  g.setAttribute('class','city-ground');
  svg.appendChild(g);

  // Fog layers for atmosphere
  for(let i=0; i<3; i++){
    const fog=document.createElementNS(NS,'ellipse');
    fog.setAttribute('cx',String(200+i*450));
    fog.setAttribute('cy','340');
    fog.setAttribute('rx',String(350+i*50));
    fog.setAttribute('ry',String(30+i*10));
    fog.setAttribute('class','city-fog');
    fog.style.opacity=String(0.08-i*0.02);
    fog.style.animationDelay=`${i*1.5}s`;
    svg.appendChild(fog);
  }

  // White sparkling meteors HIGH in the sky (above all buildings)
  function createMeteor(x, y, delay) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'city-meteor');
    g.style.animationDelay = `${delay}s`;

    // Long white streak
    const streak = document.createElementNS(NS, 'line');
    streak.setAttribute('x1', String(x));
    streak.setAttribute('y1', String(y));
    streak.setAttribute('x2', String(x + 120)); // Much longer
    streak.setAttribute('y2', String(y + 70));
    streak.setAttribute('stroke', '#ffffff');
    streak.setAttribute('stroke-width', '4');
    streak.setAttribute('stroke-linecap', 'round');
    streak.setAttribute('opacity', '0.95');
    g.appendChild(streak);

    // Bright white head
    const head = document.createElementNS(NS, 'circle');
    head.setAttribute('cx', String(x));
    head.setAttribute('cy', String(y));
    head.setAttribute('r', '5');
    head.setAttribute('fill', '#ffffff');
    head.setAttribute('class', 'meteor-head-sparkle');
    g.appendChild(head);

    // Large white glow
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', String(x));
    glow.setAttribute('cy', String(y));
    glow.setAttribute('r', '18');
    glow.setAttribute('fill', 'rgba(255, 255, 255, 0.6)');
    glow.setAttribute('class', 'meteor-glow-sparkle');
    g.appendChild(glow);

    // Sparkle points along trail
    for(let i = 0; i < 5; i++) {
      const sparkle = document.createElementNS(NS, 'circle');
      sparkle.setAttribute('cx', String(x + 20 + i * 20));
      sparkle.setAttribute('cy', String(y + 12 + i * 12));
      sparkle.setAttribute('r', '2.5');
      sparkle.setAttribute('fill', '#ffffff');
      sparkle.setAttribute('class', 'meteor-trail-sparkle');
      sparkle.style.animationDelay = `${i * 0.15}s`;
      g.appendChild(sparkle);
    }

    return g;
  }

  // Add 3 meteors VERY HIGH in the sky - above moon
  svg.appendChild(createMeteor(350, 15, 0));
  svg.appendChild(createMeteor(750, 10, 2.5));
  svg.appendChild(createMeteor(1100, 20, 4));

  return svg;
}
