import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class RankingViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.data = null;
    this.state = {
      currentStep: 0,
      filters: { topN: 6 },
      highlights: [],
      animationPaused: false,
      interactionMode: 'explore',
    };
    this.options = { ...DEFAULT_OPTIONS };
    this.mounted = false;
    this.svg = null;
    this.simulation = null;
    this.popup = null;
  }

  async init(selector, options = {}) {
    this.container = typeof selector === 'string' ?
      document.querySelector(selector) : selector;

    if (!this.container) {
      throw new Error(`Container not found: ${selector}`);
    }

    this.options = { ...this.options, ...options };

    // Load dataset
    await this.loadData();
    this.emit(VIZ_EVENTS.DATA_READY);
  }

  async loadData() {
    // Replace this!!!!!!!!!!!
    this.data = {
      categories: [
        { rank: 1, category: 'Food', color: '#FF69B4', views: 100000 },
        { rank: 2, category: 'Fashion', color: '#ADD8E6', views: 85000 },
        { rank: 3, category: 'Pets', color: '#f7d661ff', views: 76000 },
        { rank: 4, category: 'Travel', color: '#98FB98', views: 70000 },
        { rank: 5, category: 'Health', color: '#FF6347', views: 60000 },
        { rank: 6, category: 'Technology', color: '#8A2BE2', views: 50000 },
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

  render() {
    if (!this.data) return;

    this.container.innerHTML = '';

    const bbox = this.container.getBoundingClientRect();
    const width = bbox.width || 800;
    const height = bbox.height || 600;

    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Category visualization showing ranking and interaction');

    const pyramidData = this.data.categories.map((d, i) => {
      let row, column;
      if (i === 0) { row = 0; column = 0; }
      else if (i <= 2) { row = 1; column = i - 1; }
      else { row = 2; column = i - 3; }
      const rowSpacing = 200;
      const y = 100 + row * rowSpacing;
      return { ...d, row, column, y, coverFallen: false };
    });

    const rectWidth = 200;
    const rectHeight = 150;
    const paddingX = 40; // padding btn columns

    const columnXPositions = (row) => {
      switch (row) {
        case 0:
          return [(width - rectWidth) / 2];
        case 1:
          return [
            (width - rectWidth * 2 - paddingX) / 2,
            (width - rectWidth * 2 - paddingX) / 2 + rectWidth + paddingX
          ];
        case 2:
          return [
            (width - rectWidth * 3 - paddingX * 2) / 2,
            (width - rectWidth * 3 - paddingX * 2) / 2 + rectWidth + paddingX,
            (width - rectWidth * 3 - paddingX * 2) / 2 + (rectWidth + paddingX) * 2
          ];
        default:
          return [];
      }
    };


    // --- groups for pages ---
    // bottom-right pages are drawn first
    pyramidData.sort((a, b) => {
      if (a.row !== b.row) return b.row - a.row;
      return b.column - a.column;
    });

    const pages = this.svg.selectAll('g.page')
      .data(pyramidData)
      .enter()
      .append('g')
      .attr('class', 'page')
      .attr('transform', d => `translate(${columnXPositions(d.row)[d.column]}, ${d.y})`)
      .style('cursor', 'pointer');

    // categories
    pages.append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', d => d.color)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('rx', 20);

    pages.append('text')
      .attr('x', rectWidth / 2)
      .attr('y', rectHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'black')
      .style('font-size', '24px')
      .text(d => d.category);

    // cover 
    const coverGroup = pages.append('g')
      .attr('class', 'cover-group');

    coverGroup.append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('rx', 20)
      .style('pointer-events', 'none')
      .attr('class', 'cover');

    coverGroup.append('text')
      .attr('x', rectWidth / 2)
      .attr('y', rectHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'black')
      .style('font-size', '60px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.rank);

    coverGroup.append('rect')
      .attr('class', 'tape')
      .attr('x', rectWidth / 2 - 40)
      .attr('y', -10)
      .attr('width', 80)
      .attr('height', 25)
      .attr('fill', '#f2f2cbff')
      .attr('opacity', 0.8)
      .attr('transform', d => {
        const angle = (Math.random() * 10 - 5).toFixed(1);
        return `rotate(${angle}, ${rectWidth / 2}, 0)`;
      })
      .style('pointer-events', 'none');


    // --- hover to drop cover ---

    const fallenPages = new Set();
    let nextToFallIndex = 0;

    const fallOrder = new Map(
      pyramidData.map((d, i) => [d.category, i])
    );

    let isAudioPlaying = false;

    pages.on('mouseenter', function (event, d) {
      if (isAudioPlaying) return;

      const cover = d3.select(this).select('.cover-group');
      d3.select(this).select('rect')
        .transition()
        .duration(300)
        .style('filter', 'brightness(1.5)');

      const expectedIndex = nextToFallIndex;
      const thisIndex = fallOrder.get(d.category);

      if (thisIndex !== expectedIndex) return;

      fallenPages.add(d.category);
      nextToFallIndex++;

      const groundY = height - rectHeight;

      const delayArray = [1000, 1000, 1100, 2000, 2000, 6000];
      const delayTime = delayArray[expectedIndex] || 1000;
      const audioPath = `/assets/audio/ranking${expectedIndex}.mp3`;
      const fallAudio = new Audio(audioPath);
      fallAudio.volume = 1;

      isAudioPlaying = true;

      fallAudio.addEventListener('ended', () => {
        isAudioPlaying = false;
      });

      fallAudio.addEventListener('loadedmetadata', () => {
        setTimeout(() => {
          cover.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attr('transform', `
          translate(0, ${groundY - d.y}) 
          rotate(${Math.random() * 10 - 5}, ${rectWidth / 2}, ${rectHeight / 2}) 
          scale(1, 0.6)
        `);

          d.coverFallen = true;
        }, delayTime);

        fallAudio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      });

      fallAudio.onerror = (error) => {
        console.error('Error playing audio:', error);
      };
    });

    pages.on('mouseleave', function (event, d) {
      d3.select(this).select('rect')
        .transition()
        .duration(300)
        .style('filter', 'brightness(1)');
    });

    // --- popup ---
    pages.on('click', (event, d) => {
      event.stopPropagation();

      if (!d.coverFallen) return;  // prevent popup if cover is still on top

      if (this.popup) this.popup.remove();

      this.popup = this.svg.append('g')
        .attr('class', 'popup')
        .attr('transform', `translate(${(width - 300) / 2}, ${height / 3})`);

      this.popup.append('rect')
        .attr('width', 300)
        .attr('height', 200)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('rx', 30);

      this.popup.append('text')
        .attr('x', 150)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '30px')
        .text(`${d.category}`);

      this.popup.append('text')
        .attr('x', 150)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '18px')
        .text(`Views: ${d.views}`);
    });

    d3.select(this.container).on('click', (event) => {
      if (this.popup) {
        this.popup.remove();
        this.popup = null;
      }
    });
  }
}