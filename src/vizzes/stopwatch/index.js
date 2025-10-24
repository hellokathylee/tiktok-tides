// Stopwatch Visualization Adapter - Wraps legacy implementation with Canonical API
import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class StopwatchViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.data = null;
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
    // Mock data for video duration vs engagement
    this.data = [
      [5, 234500],
      [10, 445600],
      [15, 892300],
      [20, 756400],
      [25, 623100],
      [30, 512300],
      [35, 423100],
      [40, 334500],
      [45, 267800],
      [50, 198900],
      [55, 145600],
      [60, 89200]
    ];
  }

  mount() {
    if (this.mounted) return;
    this.render();
    this.mounted = true;
    this.emit(VIZ_EVENTS.ENTER_COMPLETE);
  }

  unmount() {
    if (!this.mounted) return;
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
      case 1:
        this.highlightDurationRange(15, 30);
        break;
      case 2:
        this.showVelocityMetrics();
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
    this.emit(VIZ_EVENTS.STATE_CHANGE);
  }

  isDataReady() {
    return this.data !== null;
  }

  render() {
    if (!this.data) return;

    // Clear container
    this.container.innerHTML = '';

    // Add wrapper with proper styling
    const wrapper = document.createElement('div');
    wrapper.className = 'stopwatch-wrapper';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.minHeight = '600px';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.position = 'relative';
    wrapper.style.padding = '20px';
    this.container.appendChild(wrapper);

    // Add title and controls
    const header = document.createElement('div');
    header.className = 'stopwatch-header';
    header.style.position = 'absolute';
    header.style.top = '10px';
    header.style.right = '20px';
    header.style.textAlign = 'right';
    header.style.maxWidth = '300px';
    header.innerHTML = `
      <h3 style="font-size: 1.2rem; color: var(--color-accent-cyan); margin-bottom: 0.3rem;">The Perfect Duration</h3>
      <p style="color: var(--color-text-secondary); font-size: 0.8rem;">Finding the sweet spot</p>
      <button id="replay-btn" style="
        margin-top: 0.5rem;
        padding: 0.3rem 1rem;
        background: rgba(20, 20, 30, 0.8);
        border: 1px solid var(--color-accent-cyan);
        color: var(--color-accent-cyan);
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
      ">▶ Play</button>
    `;
    wrapper.appendChild(header);

    // Add click handler for replay button
    setTimeout(() => {
      const replayBtn = document.getElementById('replay-btn');
      if (replayBtn) {
        replayBtn.addEventListener('click', () => {
          this.runAnimation();
        });
      }
    }, 0);

    // Add metrics panel
    const metricsPanel = document.createElement('div');
    metricsPanel.className = 'stopwatch-metrics';
    metricsPanel.style.position = 'absolute';
    metricsPanel.style.bottom = '10px';
    metricsPanel.style.left = '20px';
    metricsPanel.style.display = 'flex';
    metricsPanel.style.gap = '2rem';
    metricsPanel.style.padding = '1rem 1.5rem';
    metricsPanel.style.background = 'rgba(20, 20, 30, 0.8)';
    metricsPanel.style.borderRadius = '12px';
    metricsPanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    metricsPanel.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-accent-cyan);">15-30s</div>
        <div style="font-size: 0.7rem; color: var(--color-text-secondary);">Optimal</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-accent-magenta);">892K</div>
        <div style="font-size: 0.7rem; color: var(--color-text-secondary);">Views</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-accent-yellow);">78%</div>
        <div style="font-size: 0.7rem; color: var(--color-text-secondary);">Complete</div>
      </div>
    `;
    wrapper.appendChild(metricsPanel);

    // Get dimensions - use parent container size
    const containerRect = this.container.getBoundingClientRect();
    const width = containerRect.width || 1200;
    const height = containerRect.height || 700;
    const margin = 40;

    // Create SVG that fills the wrapper
    this.svg = d3.select(wrapper)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Stopwatch visualization showing video duration impact on engagement');

    // Add filter for glow effect
    const defs = this.svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'stopwatch-glow');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = this.svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Radii - adjust to leave space for UI elements
    const availableWidth = width > 900 ? width - 320 : width - 60; // Leave space for panels or padding
    const availableHeight = height - 140; // Leave space for top and bottom UI
    const R = Math.min(availableWidth, availableHeight) / 2 - margin;
    const ringOuter = R;
    const ringInner = R * 0.97;
    const sectorMaxRadius = R * 0.92;
    const sectorMinRadius = Math.max(30, R * 0.2);

    // Draw stopwatch chrome
    g.append('circle')
      .attr('r', ringOuter)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-border-interactive)')
      .attr('stroke-width', 2);

    g.append('circle')
      .attr('r', ringInner)
      .attr('fill', 'var(--color-background-secondary)')
      .attr('stroke', 'var(--color-border-primary)')
      .attr('stroke-width', 1);

    // Top button
    const btnW = R * 0.25, btnH = R * 0.1, btnR = 8;
    const btnY = -ringOuter - btnH - 10;

    g.append('rect')
      .attr('x', -btnW / 2)
      .attr('y', btnY)
      .attr('width', btnW)
      .attr('height', btnH)
      .attr('rx', btnR)
      .attr('fill', 'var(--color-accent-cyan)')
      .attr('cursor', 'pointer')
      .on('click', () => this.runAnimation());

    // Draw ticks
    const ticks = g.append('g').attr('aria-hidden', true);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const r1 = ringInner - (isMajor ? 10 : 6);
      const r2 = ringInner - 2;

      ticks.append('line')
        .attr('x1', r1 * Math.cos(a))
        .attr('y1', r1 * Math.sin(a))
        .attr('x2', r2 * Math.cos(a))
        .attr('y2', r2 * Math.sin(a))
        .attr('stroke', 'var(--color-text-disabled)')
        .attr('stroke-width', isMajor ? 2 : 1);
    }

    // Scales
    const angleScale = d3.scaleLinear()
      .domain([0, 60])
      .range([0, 2 * Math.PI]);

    const pcExtent = d3.extent(this.data, d => d[1]) || [0, 1];
    const rScale = d3.scaleSqrt()
      .domain(pcExtent)
      .range([sectorMinRadius, sectorMaxRadius])
      .nice();

    const color = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, 60]);

    // Draw sectors with enhanced styling
    const sectorsG = g.append('g').attr('aria-label', 'Duration segments');

    const arcFor = outerR =>
      d3.arc()
        .innerRadius(30) // Add inner radius for donut effect
        .outerRadius(outerR)
        .cornerRadius(8)
        .startAngle(0);

    const paths = sectorsG.selectAll('path.sector')
      .data(this.data)
      .join('path')
      .attr('class', 'sector')
      .attr('fill', d => color(d[0]))
      .attr('opacity', 0.7)
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 2)
      .attr('d', d => arcFor(rScale(d[1])).endAngle(angleScale(d[0]))(d))
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.9)
          .attr('stroke', 'var(--color-accent-cyan)')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.7)
          .attr('stroke', 'rgba(255, 255, 255, 0.1)')
          .attr('stroke-width', 2);
      });

    // Center dot
    g.append('circle')
      .attr('r', 6)
      .attr('fill', 'var(--color-accent-cyan)')
      .attr('filter', 'url(#stopwatch-glow)');

    // Labels at 15s, 30s, 45s, 60s with enhanced styling
    [15, 30, 45, 60].forEach(sec => {
      const a = angleScale(sec) - Math.PI / 2;
      const rLab = ringOuter + 25;
      const labelG = g.append('g')
        .attr('transform', `translate(${rLab * Math.cos(a)}, ${rLab * Math.sin(a)})`);

      labelG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', 'var(--color-text-primary)')
        .style('font-size', '1.3rem')
        .style('font-weight', 'bold')
        .text(`${sec}s`);
    });

    // Add side info panels (only on larger screens)
    if (width > 900) {
      const leftPanel = wrapper.appendChild(document.createElement('div'));
      leftPanel.style.position = 'absolute';
      leftPanel.style.left = '20px';
      leftPanel.style.top = '50%';
      leftPanel.style.transform = 'translateY(-50%)';
      leftPanel.style.width = '180px';
      leftPanel.innerHTML = `
      <div style="padding: 1rem; background: rgba(20, 20, 30, 0.75); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(0, 255, 224, 0.2);">
        <h4 style="color: var(--color-accent-cyan); margin-bottom: 0.75rem; font-size: 1rem;">Quick Stats</h4>
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 0.7rem; color: var(--color-text-secondary);">Best Time</div>
          <div style="font-size: 1.2rem; font-weight: bold;">22 sec</div>
        </div>
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 0.7rem; color: var(--color-text-secondary);">Avg Engagement</div>
          <div style="font-size: 1.2rem; font-weight: bold;">756K</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: var(--color-text-secondary);">Drop-off Rate</div>
          <div style="font-size: 1.2rem; font-weight: bold;">18%</div>
        </div>
      </div>
      `;

      const rightPanel = wrapper.appendChild(document.createElement('div'));
      rightPanel.style.position = 'absolute';
      rightPanel.style.right = '20px';
      rightPanel.style.top = '50%';
      rightPanel.style.transform = 'translateY(-50%)';
      rightPanel.style.width = '180px';
      rightPanel.innerHTML = `
      <div style="padding: 1rem; background: rgba(20, 20, 30, 0.75); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(255, 0, 224, 0.2);">
        <h4 style="color: var(--color-accent-magenta); margin-bottom: 0.75rem; font-size: 1rem;">Duration Tips</h4>
        <ul style="list-style: none; padding: 0; font-size: 0.85rem;">
          <li style="margin-bottom: 0.4rem; padding-left: 0.8rem; position: relative;">
            <span style="position: absolute; left: 0; color: var(--color-accent-cyan); font-size: 0.7rem;">•</span>
            Hook in 3s
          </li>
          <li style="margin-bottom: 0.4rem; padding-left: 0.8rem; position: relative;">
            <span style="position: absolute; left: 0; color: var(--color-accent-magenta); font-size: 0.7rem;">•</span>
            Peak 15-30s
          </li>
          <li style="padding-left: 0.8rem; position: relative;">
            <span style="position: absolute; left: 0; color: var(--color-accent-yellow); font-size: 0.7rem;">•</span>
            Loop it
          </li>
        </ul>
      </div>
      `;
    }

    // Initial animation
    if (!this.options.reducedMotion) {
      this.runAnimation();
    }
  }

  runAnimation() {
    if (!this.svg || this.options.reducedMotion) return;

    const sectorsG = this.svg.select('g[aria-label="Duration segments"]');
    const paths = sectorsG.selectAll('path.sector');

    paths
      .attr('opacity', 0)
      .transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr('opacity', 0.6);
  }

  highlightDurationRange(min, max) {
    if (!this.svg) return;

    const paths = this.svg.selectAll('path.sector');

    paths
      .transition()
      .duration(200)
      .attr('opacity', d => {
        const duration = d[0];
        return duration >= min && duration <= max ? 0.9 : 0.3;
      })
      .attr('stroke', d => {
        const duration = d[0];
        return duration >= min && duration <= max ?
          'var(--color-accent-cyan)' : 'none';
      })
      .attr('stroke-width', 2);
  }

  showVelocityMetrics() {
    // Show additional velocity overlay - simplified for MVP
    console.log('Showing velocity metrics');
  }

  playGlowSweep() {
    // Special effect for section transition
    if (!this.svg || this.options.reducedMotion) return;

    const g = this.svg.select('g');
    const sweep = g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -200)
      .attr('stroke', 'var(--color-accent-cyan)')
      .attr('stroke-width', 3)
      .attr('opacity', 0.8);

    sweep
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attrTween('transform', () => {
        return t => `rotate(${t * 360})`;
      })
      .on('end', () => sweep.remove());
  }
}