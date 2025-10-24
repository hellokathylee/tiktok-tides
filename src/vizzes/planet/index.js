// Planet Visualization Adapter - Simplified MVP version
import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class PlanetViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.data = null;
    this.currentYear = '2019';
    this.state = {
      currentStep: 0,
      filters: {},
      highlights: [],
      animationPaused: false,
      interactionMode: 'explore'
    };
    this.options = { ...DEFAULT_OPTIONS };
    this.mounted = false;
    this.svg = null;
    this.animationRunning = true;
    this.startTime = Date.now();
  }

  async init(selector, options = {}) {
    this.container = typeof selector === 'string' ?
      document.querySelector(selector) : selector;

    if (!this.container) {
      throw new Error(`Container not found: ${selector}`);
    }

    this.options = { ...this.options, ...options };

    // Load mock data for MVP
    await this.loadData();
    this.emit(VIZ_EVENTS.DATA_READY);
  }

  async loadData() {
    // Mock data for artists as planets
    this.data = {
      '2019': [
        { name: 'Lil Nas X', songCount: 8, avgDanceability: 0.85, avgEnergy: 0.72 },
        { name: 'Billie Eilish', songCount: 12, avgDanceability: 0.67, avgEnergy: 0.45 },
        { name: 'Post Malone', songCount: 6, avgDanceability: 0.72, avgEnergy: 0.58 },
        { name: 'Lizzo', songCount: 5, avgDanceability: 0.89, avgEnergy: 0.81 }
      ],
      '2020': [
        { name: 'Doja Cat', songCount: 10, avgDanceability: 0.82, avgEnergy: 0.69 },
        { name: 'Megan Thee Stallion', songCount: 7, avgDanceability: 0.91, avgEnergy: 0.85 },
        { name: 'DaBaby', songCount: 8, avgDanceability: 0.78, avgEnergy: 0.73 },
        { name: 'Roddy Ricch', songCount: 6, avgDanceability: 0.65, avgEnergy: 0.52 }
      ],
      '2021': [
        { name: 'Olivia Rodrigo', songCount: 11, avgDanceability: 0.58, avgEnergy: 0.62 },
        { name: 'Dua Lipa', songCount: 9, avgDanceability: 0.76, avgEnergy: 0.71 },
        { name: 'The Weeknd', songCount: 7, avgDanceability: 0.69, avgEnergy: 0.58 },
        { name: 'Ariana Grande', songCount: 8, avgDanceability: 0.73, avgEnergy: 0.65 }
      ],
      '2022': [
        { name: 'Glass Animals', songCount: 6, avgDanceability: 0.71, avgEnergy: 0.55 },
        { name: 'Kate Bush', songCount: 4, avgDanceability: 0.52, avgEnergy: 0.48 },
        { name: 'Steve Lacy', songCount: 5, avgDanceability: 0.78, avgEnergy: 0.61 },
        { name: 'Jack Harlow', songCount: 7, avgDanceability: 0.81, avgEnergy: 0.74 }
      ]
    };
  }

  mount() {
    if (this.mounted) return;
    this.render();
    this.setupYearButtons();
    this.mounted = true;
    this.emit(VIZ_EVENTS.ENTER_COMPLETE);
  }

  unmount() {
    if (!this.mounted) return;
    this.animationRunning = false;
    this.container.innerHTML = '';
    this.mounted = false;
    this.emit(VIZ_EVENTS.EXIT_COMPLETE);
  }

  destroy() {
    this.unmount();
    this.data = null;
    this.state = null;
    this.events.clear();
  }

  update(step, payload = {}) {
    this.state.currentStep = step;

    switch (step) {
      case 3:
        this.highlightTopArtists();
        break;
      case 4:
        this.switchYear('2022');
        break;
    }

    this.emit(VIZ_EVENTS.UPDATE_COMPLETE);
  }

  resize(width, height) {
    this.options.width = width;
    this.options.height = height;
    if (this.mounted) {
      this.render();
    }
    this.emit(VIZ_EVENTS.RESIZE);
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    if (newState.reducedMotion !== undefined) {
      this.animationRunning = !newState.reducedMotion;
    }
    this.emit(VIZ_EVENTS.STATE_CHANGE);
  }

  isDataReady() {
    return this.data !== null;
  }

  render() {
    const yearData = this.data[this.currentYear];
    if (!yearData) return;

    // Clear container
    this.container.innerHTML = '';

    // Get dimensions
    const bbox = this.container.getBoundingClientRect();
    const width = bbox.width || 1200;
    const height = bbox.height || 800;

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Planet system visualization showing artists as gravitational centers');

    // Add groups
    this.svg.append('g').attr('id', 'orbits');
    this.svg.append('g').attr('id', 'planets');

    // Draw sun
    this.svg.append('circle')
      .attr('class', 'sun')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', 40)
      .attr('fill', 'var(--color-accent-yellow)')
      .style('filter', 'var(--shadow-glow-yellow)');

    // Update visualization
    this.updateVisualization();
  }

  updateVisualization() {
    const yearData = this.data[this.currentYear];
    if (!yearData) return;

    const bbox = this.container.getBoundingClientRect();
    const width = bbox.width || 1200;
    const height = bbox.height || 800;
    const centerX = width / 2;
    const centerY = height / 2;
    const minRadius = 80;
    const maxRadius = Math.min(width, height) / 2 - 100;

    // Scales
    const sizeScale = d3.scaleSqrt()
      .domain([1, d3.max(yearData, d => d.songCount)])
      .range([15, 50]);

    const distanceScale = d3.scaleLinear()
      .domain([0, 1])
      .range([minRadius, maxRadius]);

    const angleStep = (2 * Math.PI) / yearData.length;

    // Prepare planet data
    const planetsData = yearData.map((d, i) => {
      const baseAngle = i * angleStep;
      const distance = distanceScale(d.avgEnergy);
      const orbitalSpeed = 0.00005 / (distance / 100);

      return {
        ...d,
        baseAngle,
        distance,
        orbitalSpeed,
        x: centerX + distance * Math.cos(baseAngle),
        y: centerY + distance * Math.sin(baseAngle)
      };
    });

    // Draw orbits
    const orbits = this.svg.select('#orbits')
      .selectAll('.planet-orbit')
      .data(planetsData, d => d.name);

    orbits.enter()
      .append('circle')
      .attr('class', 'planet-orbit')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 0)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-border-primary)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)
      .merge(orbits)
      .transition()
      .duration(1000)
      .attr('r', d => d.distance);

    orbits.exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .remove();

    // Draw planets
    const planets = this.svg.select('#planets')
      .selectAll('.planet')
      .data(planetsData, d => d.name);

    const planetsEnter = planets.enter()
      .append('g')
      .attr('class', 'planet');

    planetsEnter.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0)
      .attr('fill', d => this.danceabilityToColor(d.avgDanceability))
      .attr('stroke', 'var(--color-text-primary)')
      .attr('stroke-width', 2);

    planetsEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', 'var(--font-size-caption)')
      .text(d => d.name);

    const planetsUpdate = planetsEnter.merge(planets);

    planetsUpdate
      .transition()
      .duration(1000)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    planetsUpdate.select('circle')
      .transition()
      .duration(1000)
      .attr('r', d => sizeScale(d.songCount));

    planets.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

    // Start animation if enabled
    if (this.animationRunning && !this.options.reducedMotion) {
      this.animatePlanets(planetsData, centerX, centerY);
    }
  }

  danceabilityToColor(danceability) {
    const scale = d3.scaleSequential(d3.interpolatePlasma)
      .domain([0, 1]);
    return scale(danceability);
  }

  animatePlanets(planetsData, centerX, centerY) {
    const animate = () => {
      if (!this.animationRunning) return;

      const elapsed = Date.now() - this.startTime;

      this.svg.select('#planets')
        .selectAll('.planet')
        .data(planetsData, d => d.name)
        .attr('transform', d => {
          const angle = d.baseAngle + (elapsed * d.orbitalSpeed);
          const x = centerX + d.distance * Math.cos(angle);
          const y = centerY + d.distance * Math.sin(angle);
          return `translate(${x}, ${y})`;
        });

      requestAnimationFrame(animate);
    };

    animate();
  }

  setupYearButtons() {
    // Connect to year selector buttons in the DOM
    document.querySelectorAll('.year-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const year = e.target.dataset.year;
        this.switchYear(year);

        // Update active state
        document.querySelectorAll('.year-btn').forEach(b => {
          b.classList.remove('active');
        });
        e.target.classList.add('active');
      });
    });
  }

  switchYear(year) {
    if (!this.data[year]) return;

    this.currentYear = year;
    this.startTime = Date.now();
    this.updateVisualization();
  }

  highlightTopArtists() {
    const yearData = this.data[this.currentYear];
    if (!yearData) return;

    // Highlight top artists by song count
    const top2 = yearData
      .sort((a, b) => b.songCount - a.songCount)
      .slice(0, 2)
      .map(d => d.name);

    this.svg.selectAll('.planet')
      .transition()
      .duration(400)
      .attr('opacity', d => top2.includes(d.name) ? 1 : 0.3);
  }

  fadeOrbits() {
    // Transition effect for section change
    this.svg.selectAll('.planet-orbit')
      .transition()
      .duration(600)
      .attr('opacity', 0);
  }
}