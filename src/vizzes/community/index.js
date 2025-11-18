// Community × Sounds Visualization - MVP Scaffold
import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class CommunityViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.data = null;
    this.state = {
      currentStep: 0,
      filters: { topN: 10 },
      highlights: [],
      animationPaused: false,
      interactionMode: 'explore'
    };
    this.options = { ...DEFAULT_OPTIONS };
    this.mounted = false;
    this.svg = null;
    this.simulation = null;
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
    // Mock data for MVP - replace with real data loading
    this.data = {
      nodes: [
        { id: 'BookTok', type: 'community', size: 450230 },
        { id: 'FoodTok', type: 'community', size: 382190 },
        { id: 'CleanTok', type: 'community', size: 234560 },
        { id: 'FitTok', type: 'community', size: 567230 },
        { id: 'sound1', type: 'sound', name: 'Trending Audio 1', duration_weeks: 8 },
        { id: 'sound2', type: 'sound', name: 'Viral Beat', duration_weeks: 12 },
        { id: 'sound3', type: 'sound', name: 'Dance Track', duration_weeks: 6 }
      ],
      links: [
        { source: 'BookTok', target: 'sound1', value: 0.8 },
        { source: 'FoodTok', target: 'sound2', value: 0.6 },
        { source: 'CleanTok', target: 'sound3', value: 0.7 },
        { source: 'FitTok', target: 'sound1', value: 0.5 },
        { source: 'BookTok', target: 'sound2', value: 0.4 }
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
    if (this.simulation) {
      this.simulation.stop();
    }
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
      case 5:
        this.filterByCommunity('BookTok');
        break;
      case 6:
        this.highlightTrendingSounds();
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

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Network visualization showing community and sound connections');

    // Create groups
    const g = this.svg.append('g');
    const linksG = g.append('g').attr('class', 'links');
    const nodesG = g.append('g').attr('class', 'nodes');

    // Scales
    const nodeScale = d3.scaleSqrt()
      .domain([0, d3.max(this.data.nodes.filter(n => n.type === 'community'), d => d.size)])
      .range([20, 60]);

    const linkScale = d3.scaleLinear()
      .domain([0, 1])
      .range([1, 5]);

    // Force simulation
    this.simulation = d3.forceSimulation(this.data.nodes)
      .force('link', d3.forceLink(this.data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d =>
        d.type === 'community' ? nodeScale(d.size) + 10 : 20
      ));

    // Draw links
    const links = linksG.selectAll('line')
      .data(this.data.links)
      .join('line')
      .attr('stroke', 'var(--color-border-interactive)')
      .attr('stroke-width', d => linkScale(d.value))
      .attr('opacity', 0.3);

    // Draw nodes
    const nodes = nodesG.selectAll('g')
      .data(this.data.nodes)
      .join('g')
      .attr('class', d => `node ${d.type}`);

    // Community nodes
    nodes.filter(d => d.type === 'community')
      .append('circle')
      .attr('r', d => nodeScale(d.size))
      .attr('fill', 'var(--color-background-secondary)')
      .attr('stroke', 'var(--color-accent-glint)')
      .attr('stroke-width', 2);

    // Sound nodes
    nodes.filter(d => d.type === 'sound')
      .append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('x', -15)
      .attr('y', -15)
      .attr('rx', 6)
      .attr('fill', 'var(--color-accent-blaze)')
      .attr('opacity', 0.8);

    // Labels
    nodes.append('text')
      .text(d => d.id.substring(0, 10))
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'community' ? 0 : 40)
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', 'var(--font-size-caption)');

    // Add interactions
    this.addInteractions(nodes);

    // Update positions on tick
    this.simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }

  addInteractions(nodes) {
    // Drag behavior
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodes.call(drag);

    // Hover effects
    nodes.on('mouseenter', (event, d) => {
      this.highlightConnected(d);
    })
      .on('mouseleave', () => {
        this.resetHighlights();
      });
  }

  filterByCommunity(communityId) {
    if (!this.svg) return;

    // Fade out non-connected nodes
    const connectedNodes = new Set([communityId]);
    this.data.links.forEach(link => {
      if (link.source.id === communityId || link.source === communityId) {
        connectedNodes.add(typeof link.target === 'object' ? link.target.id : link.target);
      }
      if (link.target.id === communityId || link.target === communityId) {
        connectedNodes.add(typeof link.source === 'object' ? link.source.id : link.source);
      }
    });

    this.svg.selectAll('.node')
      .transition()
      .duration(400)
      .attr('opacity', d => connectedNodes.has(d.id) ? 1 : 0.2);
  }

  highlightTrendingSounds() {
    if (!this.svg) return;

    // Highlight sound nodes with pulsing effect
    this.svg.selectAll('.node.sound rect')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .style('filter', 'var(--shadow-glow-magenta)');
  }

  highlightConnected(node) {
    const connected = new Set([node.id]);
    this.data.links.forEach(link => {
      if (link.source.id === node.id || link.source === node.id) {
        connected.add(typeof link.target === 'object' ? link.target.id : link.target);
      }
      if (link.target.id === node.id || link.target === node.id) {
        connected.add(typeof link.source === 'object' ? link.source.id : link.source);
      }
    });

    this.svg.selectAll('.node')
      .transition()
      .duration(200)
      .attr('opacity', d => connected.has(d.id) ? 1 : 0.3);
  }

  resetHighlights() {
    this.svg.selectAll('.node')
      .transition()
      .duration(200)
      .attr('opacity', 1);
  }

  showCityLine() {
    // Transition effect for section entry
    console.log('Showing city line transition');
  }

  growStems() {
    // Transition effect showing stems growing into leaves
    console.log('Growing stems transition');
  }
}