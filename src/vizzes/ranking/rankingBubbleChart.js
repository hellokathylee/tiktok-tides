// RankingBubbleChart.js
// Secondary view for RankingViz: top creators within a selected category.

export class RankingBubbleChart {
  /**
   * @param {string|HTMLElement} parentElement - container for the popup view
   * @param {string} category - initial selected category
   * @param {string} categoryColor - fill color for circles (match sticky note color)
   * @param {Object} options - optional config overrides
   */
  constructor(parentElement, category, categoryColor, options = {}) {
    this.parentElement =
      typeof parentElement === 'string'
        ? d3.select(parentElement)
        : d3.select(parentElement);

    if (this.parentElement.empty()) {
      throw new Error(
        `RankingBubbleChart: container "${parentElement}" not found.`
      );
    }

    this.category = category;
    this.categoryColor = categoryColor || 'var(--color-accent)';
    this.options = {
      maxAuthors: 18, // show top N authors in this category
      margin: { top: 40, right: 24, bottom: 32, left: 24 },
      minRadius: 14,
      maxRadius: 60,
      dataPath: '/data/youtube_shorts_tiktok_trends_2025.csv',
      ...options
    };

    this.width =
      this.parentElement.node().clientWidth ||
      480;
    this.height =
      this.parentElement.node().clientHeight ||
      360;

    this.rawData = [];      // all rows from CSV
    this.authorStats = [];  // aggregated per-author stats

    this.svg = null;
    this.chartG = null;
    this.tooltip = null;

    this.initVis();
    // Load data asynchronously; once loaded we wrangle + render.
    this.loadData();
  }

  // ---------- VIS SETUP ----------

  initVis() {
    // Clear any previous SVG (for safety / resize)
    this.parentElement.selectAll('*').remove();

    // Remove old tooltip if re-initializing
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    this.svg = this.parentElement
      .append('svg')
      .attr('class', 'ranking-bubble-chart')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('role', 'img')
      .attr(
        'aria-label',
        `Top creators in ${this.category} community by total views`
      );
    
     // 👇 Background + border for the whole drawing area
    this.svg
      .append('rect')
      .attr('class', 'bubble-bg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', '#ffffff')
      .attr('stroke', '#ff0050') // TikTok pink border
      .attr('stroke-width', 0)
      .attr('rx', 40)   // horizontal corner radius
      .attr('ry', 40);

    // Main chart group on top
    this.chartG = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.options.margin.left},${this.options.margin.top})`
      );

    this.innerWidth =
      this.width -
      this.options.margin.left -
      this.options.margin.right;
    this.innerHeight =
      this.height -
      this.options.margin.top -
      this.options.margin.bottom;

    // Optional title inside popup
    this.title = this.chartG
      .append('text')
      .attr('class', 'bubble-title')
      .attr('x', this.innerWidth / 2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .text(this.category ? `${this.category}Tok` : 'Creators')
      .style('font-size', '25px')
      .style('font-weight', '600');
    
    // Subtitle
    this.subtitle = this.chartG
      .append('text')
      .attr('class', 'bubble-subtitle')
      .attr('x', this.innerWidth / 2)
      .attr('y', 5)  // just below the title; tweak as needed
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-size', '15px')
      .text('Top Creators In This Community By Total Views');


    // Lab 6-style tooltip
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip ranking-bubble-tooltip')
      .attr('id', 'rankingBubbleTooltip')
      .style('position', 'absolute')     // important for placement
        .style('pointer-events', 'none')   // ignore mouse events
      .style('z-index', '9999')          // sit on top of SVG & overlays
      .style('opacity', 0)
      .style('width', '350px')          // fixed width
      .style('max-width', '350px')      // (optional) enforce max
      .style('white-space', 'normal')   // allow wrapping
      .style('word-wrap', 'break-word') // break long tokens if needed
      .style('overflow', 'hidden');     // don't grow forever vertically (optional)
  }

  // ---------- DATA LOADING & EXTERNAL HOOKS ----------

  async loadData() {
    if (!this.rawData.length) {
      this.rawData = await d3.csv(this.options.dataPath, d3.autoType);
    }
    this.wrangleData();
    this.updateVis();
  }

  /**
   * Allow parent (RankingViz) to inject already-loaded dataset
   * to avoid re-fetching.
   */
  setData(data) {
    this.rawData = data || [];
    this.wrangleData();
    this.updateVis();
  }

  /**
   * Update category + color from parent viz (on sticky-note click).
   */
  setCategory(category, categoryColor) {
    this.category = category;
    if (categoryColor) this.categoryColor = categoryColor;
    if (this.title) {
      this.title.text(`Top Creators in ${this.category} Community by Total Views`);
    }
    this.wrangleData();
    this.updateVis();
  }

  // ---------- WRANGLE DATA (Lab 3 style aggregation) ----------

  wrangleData() {
    if (!this.rawData.length || !this.category) {
      this.authorStats = [];
      return;
    }

    // Filter by selected category
    const categoryFiltered = this.rawData.filter((d) => {
      const g = d.category || d.Category;
      return g === this.category;
    });

    // Group by author handle
    const rollup = d3.rollups(
      categoryFiltered,
      (v) => {
        const totalViews = d3.sum(v, (d) => d.views ?? d.playCount ?? 0);
        const totalLikes = d3.sum(v, (d) => d.likes ?? 0);
        const totalComments = d3.sum(v, (d) => d.comments ?? 0);
        const totalShares = d3.sum(v, (d) => d.shares ?? 0);
        const totalSaves = d3.sum(v, (d) => d.saves ?? 0);

        const hashtagSet = new Set();
        const genreSet = new Set();
        const soundSet = new Set();

        v.forEach((d) => {
          // Hashtags: handle either single or multiple
          if (d.hashtag) {
            String(d.hashtag)
              .split(/[,\s]+/)
              .filter(Boolean)
              .forEach((t) =>
                hashtagSet.add(t.startsWith('#') ? t : `#${t}`)
              );
          }
          if (d.hashtags) {
            String(d.hashtags)
              .split(/[,\s]+/)
              .filter(Boolean)
              .forEach((t) =>
                hashtagSet.add(t.startsWith('#') ? t : `#${t}`)
              );
          }

          // Genre tags
          const genre = d.genre || d.Genre;
            if (genre) {
              // allow comma-separated lists too
              String(genre)
                .split(/[,\s]+/)
                .filter(Boolean)
                .forEach((c) => genreSet.add(c));
            }

          // Sounds / tracks
          const s =
            d.music_track ||
            d.soundtrack ||
            d.sound ||
            d.audio;
          if (s) soundSet.add(String(s));
        });

        return {
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          totalSaves,
          hashtags: Array.from(hashtagSet).slice(0, 15),
          genres: Array.from(genreSet).slice(0, 10),
          sounds: Array.from(soundSet).slice(0, 10)
        };
      },
      (d) =>
        d.authorHandle ||
        d.author_handle ||
        d.creator ||
        'Unknown'
    );

    let stats = rollup
      .map(([author, metrics]) => ({
        author,
        ...metrics
      }))
      .filter((d) => d.totalViews > 0);

    // Rank by total views and keep top 10
    stats.sort((a, b) =>
      d3.descending(a.totalViews, b.totalViews)
    );
    stats = stats.slice(0, 10);

    // Proportional circle sizes (area ~ views)
    const maxViews =
      d3.max(stats, (d) => d.totalViews) || 1;
    const rScale = d3
      .scaleSqrt()
      .domain([0, maxViews])
      .range([this.options.minRadius, this.options.maxRadius]);

    stats.forEach((d) => {
      d.r = rScale(d.totalViews);
    });

    this.authorStats = stats;
  }

  // ---------- RENDER / UPDATE (Lab 4 pattern + force layout) ----------

  updateVis() {
    if (!this.chartG) return;

    const nodesData = this.authorStats;

    // No data: clear
    if (!nodesData.length) {
      this.chartG.selectAll('.author-node').remove();
      return;
    }

    const cx = this.innerWidth / 2;
    const cy = this.innerHeight / 2;

    // Use a local force simulation to avoid overlapping circles
    const simNodes = nodesData.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(simNodes)
      .force('x', d3.forceX(cx).strength(0.08))
      .force('y', d3.forceY(cy).strength(0.08))
      .force(
        'collide',
        d3.forceCollide((d) => d.r + 4)
      )
      .stop();

    // Run a fixed number of ticks and clamp within the inner chart box
    const maxTicks = 260;
    for (let i = 0; i < maxTicks; i++) {
    simulation.tick();
    simNodes.forEach((d) => {
        // keep each circle fully inside [0, innerWidth] x [0, innerHeight]
        d.x = Math.max(d.r, Math.min(this.innerWidth - d.r, d.x));
        d.y = Math.max(d.r, Math.min(this.innerHeight - d.r, d.y));
    });
    }
    simulation.stop();

    // DATA JOIN
    const nodes = this.chartG
      .selectAll('.author-node')
      .data(simNodes, (d) => d.author);

    // EXIT
    nodes
      .exit()
      .transition()
      .duration(200)
      .attr('opacity', 0)
      .remove();

    // ENTER
    const nodesEnter = nodes
      .enter()
      .append('g')
      .attr('class', 'author-node')
      .attr(
        'transform',
        `translate(${cx},${cy})`
      )
      .attr('opacity', 0);

    nodesEnter
      .append('circle')
      .attr('class', 'author-circle')
      .attr('r', 0)
      .attr('fill', this.categoryColor)
      .attr('fill-opacity', 0.9);

    nodesEnter
      .append('text')
      .attr('class', 'author-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('pointer-events', 'none')
      .text((d) => d.author);

    // ENTER + UPDATE MERGE
    const nodesMerged = nodesEnter.merge(nodes);

    nodesMerged
      .transition()
      .duration(400)
      .attr('opacity', 1)
      .attr(
        'transform',
        (d) => `translate(${d.x},${d.y})`
      );

    nodesMerged
      .select('.author-circle')
      .transition()
      .duration(400)
      .attr('r', (d) => d.r)
      .attr('fill', this.categoryColor);

    nodesMerged.select('.author-label').each(function (d) {
      const textSel = d3.select(this);

      // Start with full handle
      let label = d.author || '';
      textSel.text(label);

      const padding = 6;                          // small padding from circle edge
      const maxWidth = (d.r * 2) - padding;       // max label width inside circle
      let fontSize = Math.min(16, d.r * 0.6);     // initial guess: depends on radius

      if (fontSize < 8) {
        // If the circle is tiny, don't force unreadable text; hide and rely on tooltip
        textSel.text('');
        return;
      }

      textSel.style('font-size', `${fontSize}px`);

      // Measure and shrink font-size until it fits
      let bbox = this.getBBox();
      while (bbox.width > maxWidth && fontSize > 7) {
        fontSize -= 1;
        textSel.style('font-size', `${fontSize}px`);
        bbox = this.getBBox();
      }

      // If it still doesn't fit at minimum font size, truncate with ellipsis
      if (bbox.width > maxWidth) {
        let truncated = label;
        // Keep trimming until it fits or is very short
        while (truncated.length > 3) {
          truncated = truncated.slice(0, -2);
          textSel.text(truncated + '…');
          bbox = this.getBBox();
          if (bbox.width <= maxWidth) break;
        }
        // If it's still too big, hide label
        if (bbox.width > maxWidth) {
          textSel.text('');
        }
      }
    });


    // TOOLTIP (hover only; clicks handled by RankingViz)
    nodesMerged
      .on('mouseover', (event, d) => {
        const node = d3.select(event.currentTarget);

        // Highlight circle with TikTok aqua
        node.select('.author-circle')
          .attr('stroke', '#484848ff')
          .attr('stroke-width', 5);

        this.tooltip
          .style('opacity', 1)
          .html(this.getTooltipHtml(d));
        this.moveTooltip(event);
      })
      .on('mousemove', (event) => {
        this.moveTooltip(event);
      })
      .on('mouseleave', () => {
        const node = d3.select(event.currentTarget);

        // Remove highlight, restore original (no stroke)
        node.select('.author-circle')
          .attr('stroke', null)
          .attr('stroke-width', null);
        this.tooltip
          .transition()
          .duration(0.1)
          .style('opacity', 0);
      });
  }

  // ---------- TOOLTIP HELPERS (Lab 6 style) ----------

  moveTooltip(event) {
    if (!this.tooltip) return;
    const offsetX = -40;
    const offsetY = 20;

    let x = event.pageX + offsetX;
    let y = event.pageY + offsetY;

    this.tooltip
      .style('left', `${x}px`)
      .style('top', `${y}px`);
  }

  getTooltipHtml(d) {
    const fmt = d3.format(',d');
    return `
      <div class="tooltip-title">@${d.author}</div>
      <div class="tooltip-metric"><span>Views:</span> ${fmt(
        d.totalViews
      )}</div>
      <div class="tooltip-metric"><span>Likes:</span> ${fmt(
        d.totalLikes
      )}</div>
      <div class="tooltip-metric"><span>Comments:</span> ${fmt(
        d.totalComments
      )}</div>
      <div class="tooltip-metric"><span>Shares:</span> ${fmt(
        d.totalShares
      )}</div>
      <div class="tooltip-metric"><span>Saves:</span> ${fmt(
        d.totalSaves
      )}</div>
      ${
        d.hashtags &&
        d.hashtags.length
          ? `<div class="tooltip-list"><span>Hashtags:</span> ${d.hashtags.join(
              ', '
            )}</div>`
          : ''
      }
      ${
        d.sounds &&
        d.sounds.length
          ? `<div class="tooltip-list"><span>Sounds:</span> ${d.sounds.join(
              ', '
            )}</div>`
          : ''
      }
    `;
  }

  // ---------- LIFECYCLE HELPERS ----------

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.initVis();
    // reuse loaded data
    this.wrangleData();
    this.updateVis();
  }

  destroy() {
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
      this.chartG = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    this.authorStats = [];
  }
}
