// Language/Emotion vs Engagement Visualization - MVP Scaffold
import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class EmotionViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.data = null;
    this.state = {
      currentStep: 0,
      filters: { layer: 'emotion' },
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
    // Mock emotion/engagement data
    this.data = {
      tokens: [
        { word: 'amazing', emotion: 'joy', sentiment: 0.9, engagement: 0.85, count: 1523 },
        { word: 'love', emotion: 'joy', sentiment: 0.8, engagement: 0.78, count: 2341 },
        { word: 'excited', emotion: 'surprise', sentiment: 0.7, engagement: 0.72, count: 892 },
        { word: 'sad', emotion: 'sadness', sentiment: -0.6, engagement: 0.65, count: 567 },
        { word: 'angry', emotion: 'anger', sentiment: -0.8, engagement: 0.82, count: 423 },
        { word: 'fear', emotion: 'fear', sentiment: -0.7, engagement: 0.68, count: 334 },
        { word: 'disgusting', emotion: 'disgust', sentiment: -0.9, engagement: 0.71, count: 234 },
        { word: 'beautiful', emotion: 'joy', sentiment: 0.85, engagement: 0.88, count: 1892 },
        { word: 'terrible', emotion: 'fear', sentiment: -0.75, engagement: 0.69, count: 445 },
        { word: 'wow', emotion: 'surprise', sentiment: 0.6, engagement: 0.75, count: 1234 }
      ],
      emotionCategories: ['joy', 'surprise', 'sadness', 'anger', 'fear', 'disgust'],
      emotionColors: {
        joy: '#FFEB3B',
        surprise: '#00FFE0',
        sadness: '#3B82F6',
        anger: '#EF4444',
        fear: '#8B5CF6',
        disgust: '#10B981'
      }
    };
  }

  mount() {
    if (this.mounted) return;
    this.render();
    this.setupLegend();
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
      case 9:
        this.toggleLayer('sentiment');
        break;
      case 10:
        this.highlightHighEngagement();
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
      .attr('aria-label', 'Bubble cloud showing emotion and engagement correlation');

    // Scales
    const xScale = d3.scaleLinear()
      .domain([-1, 1])  // Sentiment range
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])  // Engagement range
      .range([height - 50, 50]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(this.data.tokens, d => d.count)])
      .range([10, 50]);

    // Create bubble force simulation
    const simulation = d3.forceSimulation(this.data.tokens)
      .force('x', d3.forceX(d => xScale(d.sentiment)).strength(0.5))
      .force('y', d3.forceY(d => yScale(d.engagement)).strength(0.5))
      .force('collision', d3.forceCollide(d => sizeScale(d.count) + 2))
      .stop();

    // Run simulation
    for (let i = 0; i < 120; i++) simulation.tick();

    // Draw bubbles
    const bubbles = this.svg.selectAll('.bubble')
      .data(this.data.tokens)
      .join('g')
      .attr('class', 'bubble')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Bubble circles
    bubbles.append('circle')
      .attr('r', d => sizeScale(d.count))
      .attr('fill', d => this.data.emotionColors[d.emotion])
      .attr('opacity', 0.7)
      .attr('stroke', 'var(--color-text-primary)')
      .attr('stroke-width', 1);

    // Bubble labels
    bubbles.append('text')
      .text(d => d.word)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', d => `${Math.min(sizeScale(d.count) / 3, 14)}px`)
      .style('pointer-events', 'none');

    // Add axes labels
    this.addAxesLabels(width, height);

    // Add interactions
    this.addBubbleInteractions(bubbles);

    // Initial animation
    if (!this.options.reducedMotion) {
      bubbles
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    }
  }

  addAxesLabels(width, height) {
    // X-axis label (sentiment)
    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-secondary)')
      .text('← Negative Sentiment | Positive Sentiment →');

    // Y-axis label (engagement)
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, 20, ${height / 2})`)
      .style('fill', 'var(--color-text-secondary)')
      .text('Engagement Rate →');
  }

  addBubbleInteractions(bubbles) {
    bubbles
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 3);

        // Show info in detail drawer
        this.showBubbleDetail(d);
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('opacity', 0.7)
          .attr('stroke-width', 1);
      })
      .on('click', (event, d) => {
        this.openDetailDrawer(d);
      });
  }

  setupLegend() {
    // Populate emotion legend in sidebar
    const legendPanel = document.querySelector('.emotion-legend');
    if (!legendPanel) return;

    this.data.emotionCategories.forEach(emotion => {
      const item = document.createElement('li');
      item.innerHTML = `
        <span style="display: inline-block; width: 12px; height: 12px;
               background: ${this.data.emotionColors[emotion]};
               border-radius: 50%; margin-right: 8px;"></span>
        ${emotion}
      `;
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      legendPanel.appendChild(item);
    });
  }

  showBubbleDetail(data) {
    // Show detail in a tooltip or info panel
    const detailContent = document.querySelector('.drawer-content');
    if (detailContent) {
      detailContent.innerHTML = `
        <h3>${data.word}</h3>
        <p>Emotion: ${data.emotion}</p>
        <p>Sentiment: ${data.sentiment.toFixed(2)}</p>
        <p>Engagement: ${(data.engagement * 100).toFixed(1)}%</p>
        <p>Count: ${data.count}</p>
      `;
    }
  }

  openDetailDrawer(data) {
    const drawer = document.querySelector('.detail-drawer');
    if (drawer) {
      drawer.setAttribute('aria-hidden', 'false');
      this.showBubbleDetail(data);
    }

    // Setup close button
    const closeBtn = document.querySelector('.drawer-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        drawer.setAttribute('aria-hidden', 'true');
      };
    }
  }

  toggleLayer(layer) {
    // Toggle between emotion and sentiment view - simplified for MVP
    console.log(`Toggling to ${layer} layer`);
  }

  highlightHighEngagement() {
    if (!this.svg) return;

    // Highlight bubbles with high engagement
    this.svg.selectAll('.bubble')
      .transition()
      .duration(400)
      .attr('opacity', d => d.engagement > 0.75 ? 1 : 0.3);
  }

  emphasizeOutlines() {
    // Reduced motion alternative - emphasize outlines
    if (this.svg) {
      this.svg.selectAll('.bubble circle')
        .attr('stroke-width', 3);
    }
  }
}