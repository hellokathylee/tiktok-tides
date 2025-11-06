// Community Ranking & Topic Breakdown - MVP with falling leaf interaction
import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class RankingViz extends EventEmitter {
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
    // Mock data for community rankings
    this.data = {
      communities: [
        { name: 'BookTok', videos: 450230, engagement: 0.0823, rank: 1, topics: ['romance', 'fantasy', 'thriller'] },
        { name: 'FoodTok', videos: 382190, engagement: 0.0756, rank: 2, topics: ['recipes', 'restaurants', 'cooking'] },
        { name: 'CleanTok', videos: 234560, engagement: 0.0698, rank: 3, topics: ['organizing', 'cleaning', 'minimalism'] },
        { name: 'FitTok', videos: 567230, engagement: 0.0912, rank: 4, topics: ['workout', 'nutrition', 'wellness'] },
        { name: 'ArtTok', videos: 189230, engagement: 0.0654, rank: 5, topics: ['painting', 'digital', 'crafts'] }
      ],
      revivalPatterns: [
        { trend: 'Y2K Fashion', originalPeak: '2021-03', revival: '2023-08', strength: 0.7 },
        { trend: 'Cottagecore', originalPeak: '2020-06', revival: '2023-04', strength: 0.6 }
      ]
    };
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
      case 7:
        this.updateMetric('engagement');
        break;
      case 8:
        this.highlightRevivalPatterns();
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

    // Get dimensions
    const bbox = this.container.getBoundingClientRect();
    const width = bbox.width || 800;
    const height = bbox.height || 600;
    const margin = { top: 60, right: 150, bottom: 60, left: 100 };

    // Create SVG with canopy background
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Community ranking visualization with topic breakdown');

    // Add canopy silhouette background
    this.addCanopyBackground(width, height);

    // Main chart group
    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.data.communities, d => d.videos)])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(this.data.communities.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.2);

    // Draw ranking bars
    const bars = g.selectAll('.ranking-bar')
      .data(this.data.communities)
      .join('g')
      .attr('class', 'ranking-bar')
      .attr('transform', d => `translate(0, ${yScale(d.name)})`);

    // Background bars
    bars.append('rect')
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', 'var(--color-background-secondary)')
      .attr('opacity', 0.3);

    // Value bars
    bars.append('rect')
      .attr('class', 'value-bar')
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', 'var(--color-accent-cyan)')
      .attr('opacity', 0.7)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('width', d => xScale(d.videos));

    // Community labels
    bars.append('text')
      .attr('x', -10)
      .attr('y', yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('fill', 'var(--color-text-primary)')
      .style('font-weight', 'var(--font-weight-semibold)')
      .text(d => d.name);

    // Engagement values
    bars.append('text')
      .attr('class', 'engagement-value')
      .attr('x', d => xScale(d.videos) + 10)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-family', 'var(--font-family-mono)')
      .style('opacity', 0)
      .text(d => `${(d.engagement * 100).toFixed(1)}%`)
      .transition()
      .delay(1500)
      .duration(400)
      .style('opacity', 1);

    // Add falling leaves (topics)
    this.addFallingLeaves(g, innerWidth, innerHeight);
  }

  addCanopyBackground(width, height) {
    const canopy = this.svg.append('g')
      .attr('class', 'canopy-bg')
      .attr('opacity', 0.1);

    // Create tree canopy silhouette using paths
    const canopyPath = `
      M 0,${height * 0.3}
      Q ${width * 0.25},${height * 0.2} ${width * 0.5},${height * 0.25}
      T ${width},${height * 0.3}
      L ${width},0
      L 0,0
      Z
    `;

    canopy.append('path')
      .attr('d', canopyPath)
      .attr('fill', 'var(--color-accent-cyan)')
      .attr('opacity', 0.05);

    // Add some leaf shapes
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.3;
      const rotation = Math.random() * 360;

      canopy.append('path')
        .attr('d', 'M0,0 Q5,-10 10,-5 T15,0 Q10,5 5,0 Z')
        .attr('transform', `translate(${x}, ${y}) rotate(${rotation})`)
        .attr('fill', 'var(--color-accent-cyan)')
        .attr('opacity', 0.1);
    }
  }

  addFallingLeaves(g, width, height) {
    // Add clickable leaf elements that reveal topics
    const leaves = g.append('g')
      .attr('class', 'falling-leaves');

    this.data.communities.forEach((community, i) => {
      const leafGroup = leaves.append('g')
        .attr('class', 'leaf-group')
        .attr('transform', `translate(${width - 100}, ${i * (height / 5)})`);

      // Leaf shape
      const leaf = leafGroup.append('path')
        .attr('d', 'M0,0 Q10,-20 20,-10 T30,0 Q20,10 10,0 Z')
        .attr('fill', 'var(--color-accent-magenta)')
        .attr('opacity', 0.6)
        .attr('cursor', 'pointer');

      // Topic text (hidden initially)
      const topicText = leafGroup.append('text')
        .attr('x', 40)
        .attr('y', 0)
        .attr('opacity', 0)
        .style('fill', 'var(--color-text-secondary)')
        .style('font-size', 'var(--font-size-caption)')
        .text(community.topics.join(', '));

      // Click interaction
      leaf.on('click', () => {
        if (this.options.reducedMotion) {
          // Simple fade for reduced motion
          topicText
            .transition()
            .duration(200)
            .attr('opacity', 1);
        } else {
          // Falling leaf animation
          this.animateFallingLeaf(leafGroup, topicText);
        }

        this.emit('onLeafReveal', { community: community.name, topics: community.topics });
      });
    });
  }

  animateFallingLeaf(leafGroup, topicText) {
    // Falling leaf animation
    leafGroup.select('path')
      .transition()
      .duration(800)
      .ease(d3.easeQuadIn)
      .attr('transform', 'rotate(15)')
      .attr('opacity', 0.3)
      .on('end', () => {
        topicText
          .transition()
          .duration(400)
          .attr('opacity', 1);
      });
  }

  updateMetric(metric) {
    if (!this.svg) return;

    // Update bars based on selected metric
    const xScale = metric === 'engagement' ?
      d3.scaleLinear()
        .domain([0, 0.1])
        .range([0, 600]) :
      d3.scaleLinear()
        .domain([0, d3.max(this.data.communities, d => d.videos)])
        .range([0, 600]);

    this.svg.selectAll('.value-bar')
      .transition()
      .duration(600)
      .attr('width', d => xScale(metric === 'engagement' ? d.engagement : d.videos));

    this.emit('onKPIChange', { metric });
  }

  highlightRevivalPatterns() {
    // Show revival pattern overlays - simplified for MVP
    console.log('Highlighting revival patterns');
  }

  showCanopy() {
    // Transition effect for section entry
    if (this.svg) {
      this.svg.select('.canopy-bg')
        .transition()
        .duration(600)
        .attr('opacity', 0.2);
    }
  }

  leavesToBubbles() {
    // Transition effect to emotion viz
    if (!this.options.reducedMotion && this.svg) {
      this.svg.selectAll('.leaf-group path')
        .transition()
        .duration(800)
        .style('filter', 'blur(5px)')
        .attr('opacity', 0);
    }
  }
}