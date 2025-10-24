/* TikTok Stopwatch Radial Viz (D3 v7)
   - Filters to durations <= 60s
   - Fixed dial 0..60 with labels at 15s, 30s, 45s
   - Sectors start at 12 o'clock (0s)
   - Animated sweep on load AND when clicking the top button
   - Button has a deeper press animation
   - Faster sector animation
   - SVG legend removed (now in HTML under the title)
*/

(function () {
  const container = d3.select("#chart");
  const bbox = container.node().getBoundingClientRect();
  const size = Math.min(bbox.width, bbox.height);
  const width = size;
  const height = size;

  // Generous margin to avoid clipping
  const margin = 42;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img");

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Radii
  const R = Math.min(width, height) / 2 - margin;
  const ringOuter = R;
  const ringInner = R * 0.9;
  const sectorMaxRadius = R * 0.78;
  const sectorMinRadius = Math.max(12, R * 0.12);

  // --- Stopwatch chrome ------------------------------------------------------
  g.append("circle").attr("r", ringOuter).attr("class", "stopwatch-ring");
  g.append("circle").attr("r", ringInner).attr("class", "stopwatch-inner");

  // Top button & crown (button is clickable to replay animation)
  const btnW = R * 0.25, btnH = R * 0.1, btnR = 8;
  const btnY = -ringOuter - btnH - 10;
  const buttonRect = g.append("rect")
    .attr("x", -btnW / 2)
    .attr("y", btnY)
    .attr("width", btnW)
    .attr("height", btnH)
    .attr("rx", btnR)
    .attr("class", "stopwatch-button clickable");
  buttonRect.append("title").text("Replay animation");

  // Crown (non-clickable)
  const crownW = R * 0.08, crownH = R * 0.12, crownR = 5;
  const crownY = -ringOuter - crownH / 2 + 2;
  const crownRect = g.append("rect")
    .attr("x", -crownW / 2)
    .attr("y", crownY)
    .attr("width", crownW)
    .attr("height", crownH)
    .attr("rx", crownR)
    .attr("class", "stopwatch-button");

  // 60 tick marks (bold every 5)
  const ticks = g.append("g").attr("aria-hidden", true);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2; // 12 o'clock origin
    const isMajor = i % 5 === 0;
    const r1 = ringInner - (isMajor ? 10 : 6);
    const r2 = ringInner - 2;
    ticks.append("line")
      .attr("x1", r1 * Math.cos(a))
      .attr("y1", r1 * Math.sin(a))
      .attr("x2", r2 * Math.cos(a))
      .attr("y2", r2 * Math.sin(a))
      .attr("class", isMajor ? "tick-major" : "tick-minor");
  }

  // Tooltip
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  // Load CSV and render
  d3.csv("data/cleaned_tiktok_data.csv", d3.autoType).then(raw => {
    // Keep rows with both values, and duration <= 60
    const rows = raw.filter(d =>
      Number.isFinite(d["videoMeta/duration"]) &&
      Number.isFinite(d.playCount) &&
      +d["videoMeta/duration"] <= 60
    );

    // Group by exact duration (seconds) -> mean playCount
    let grouped = d3.rollups(
      rows,
      v => d3.mean(v, d => +d.playCount),
      d => +d["videoMeta/duration"]
    ).filter(d => Number.isFinite(d[0]) && Number.isFinite(d[1]));

    // Sort by duration ascending (needed for animation order)
    grouped.sort((a, b) => d3.ascending(a[0], b[0]));

    // Fixed 0..60 second dial
    const angleScale = d3.scaleLinear()
      .domain([0, 60])
      .range([0, 2 * Math.PI]);

    // Radius scale for avg playCount
    const pcExtent = d3.extent(grouped, d => d[1]) || [0, 1];
    const rScale = d3.scaleSqrt()
      .domain(pcExtent)
      .range([sectorMinRadius, sectorMaxRadius])
      .nice();

    // Colors
    const color = d3.scaleOrdinal()
      .domain(grouped.map(d => d[0]))
      .range(d3.schemeTableau10.concat(d3.schemeSet2).slice(0, grouped.length));

    // --- SECTORS -------------------------------------------------------------
    // Sectors sweep clockwise.
    const sectorsG = g.append("g")
      .attr("aria-label", "sectors")

    const arcFor = outerR =>
      d3.arc().innerRadius(0).outerRadius(outerR).cornerRadius(6).startAngle(0);

    const paths = sectorsG.selectAll("path.sector")
      .data(grouped) // ascending by duration
      .join("path")
      .attr("class", "sector")
      .attr("fill", d => color(d[0]));

    // Tooltips
    paths.on("pointerenter", function (event, d) {
        const [duration, avgPC] = d;
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>Duration:</strong> ${duration}s<br>` +
            `<strong>Avg playCount:</strong> ${d3.format(",.2f")(avgPC)}`
          )
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 18}px`);
        d3.select(this).transition().duration(120).style("opacity", 0.85);
      })
      .on("pointermove", function (event) {
        tooltip.style("left", `${event.pageX}px`).style("top", `${event.pageY - 18}px`);
      })
      .on("pointerleave", function () {
        tooltip.style("opacity", 0);
        d3.select(this).transition().duration(120).style("opacity", 0.55);
      })
      .append("title")
      .text(d => `Duration: ${d[0]}s\nAvg playCount: ${d3.format(",.2f")(d[1])}`);

    // -------- Animation (page load and on button click) ----------------------
    const sweepDuration = 300;   // ms per sector
    const sweepGap = 40;         // ms between sectors

    function runAnimation() {
      paths.interrupt();
      // reset arcs to 0 sweep (from 12 o'clock)
      paths.attr("d", d => arcFor(rScale(d[1])).endAngle(0)(d));
      // animate in order (shortest duration first)
      paths.transition()
        .delay((d, i) => i * (sweepDuration + sweepGap))
        .duration(sweepDuration)
        .ease(d3.easeCubicOut)
        .attrTween("d", function(d) {
          const outerR = rScale(d[1]);
          const end = angleScale(d[0]); // duration -> sweep angle
          const interp = d3.interpolateNumber(0, end);
          const arc = arcFor(outerR);
          return t => arc.endAngle(interp(t))(d);
        });
    }

    function pressAnimation() {
      // Deep press: move button and crown down then bounce back
      const pressDyBtn = 10;   // move button down by 10px
      const pressDyCrown = 5;  // crown down by 5px
      buttonRect.interrupt()
        .transition().duration(80).attr("y", btnY + pressDyBtn)
        .transition().duration(280).ease(d3.easeElastic.period(0.3)).attr("y", btnY);
      crownRect.interrupt()
        .transition().duration(80).attr("y", crownY + pressDyCrown)
        .transition().duration(280).ease(d3.easeElastic.period(0.3)).attr("y", crownY);
    }

    // trigger on page load
    runAnimation();

    // replay when clicking the top button (and animate the press)
    buttonRect
      .on("click", () => { pressAnimation(); runAnimation(); })
      .on("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { pressAnimation(); runAnimation(); }
      });

    // Center dot
    g.append("circle").attr("r", 4.5).attr("class", "center-dot");

    // Fixed labels at 15s, 30s, 45s
    [15, 30, 45].forEach(sec => {
      const a = angleScale(sec) - Math.PI / 2;
      const rLab = ringOuter - 14;
      g.append("text")
        .attr("class", "time-label")
        .attr("x", rLab * Math.cos(a))
        .attr("y", rLab * Math.sin(a))
        .text(`${sec}s`);
    });

  }).catch(err => {
    console.error(err);
    container.append("p").text("Failed to load CSV. Check path data/cleaned_tiktok_data.csv.");
  });
})();
