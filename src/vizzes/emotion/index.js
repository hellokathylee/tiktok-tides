// Language/Emotion vs Engagement Visualization - Word Cloud Version
import { EventEmitter, prefersReducedMotion } from "../shared/utils.js";
import { VIZ_EVENTS, DEFAULT_OPTIONS } from "../shared/types.js";

import "../../css/emotion.css";

export class EmotionViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.rawData = null;

    this.data = null; // { tokens, links, emotionCategories, emotionColors }

    this.state = {
      currentStep: 0,
      filters: { layer: "emotion" },
      highlights: [],
      animationPaused: false,
      interactionMode: "explore",
    };

    this.options = {
      ...DEFAULT_OPTIONS,
      reducedMotion: prefersReducedMotion(),
    };
    this.mounted = false;
    this.svg = null;

    // NLP bits
    this.sentiment = null;

    // --- Manual fallback lexicon so we always get non-neutral scores ----
    this.manualLexicon = {
      "+3": new Set([
        "amazing",
        "awesome",
        "love",
        "loving",
        "perfect",
        "incredible",
        "best",
        "beautiful",
      ]),
      "+2": new Set([
        "good",
        "great",
        "nice",
        "cool",
        "funny",
        "fun",
        "popular",
        "viral",
        "trend",
        "trendy",
        "fyp",
        "foryou",
        "foryoupage",
        "dance",
        "cute",
        "enjoy",
        "wow",
        "happy",
        "smile",
      ]),
      "-2": new Set([
        "bad",
        "sad",
        "angry",
        "hate",
        "cringe",
        "boring",
        "worst",
        "tired",
        "alone",
        "upset",
        "cry",
        "crying",
      ]),
    };
  }

  async init(selector, options = {}) {
    this.container =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!this.container) {
      throw new Error(`Container not found: ${selector}`);
    }

    this.options = { ...this.options, ...options };

    // Load data + NLP tools
    await this.loadData();
    this.emit(VIZ_EVENTS.DATA_READY);
  }

  // --- NLP / sentiment -------------------------------------------------------
  async initNLP() {
    // If using modules:
    //   import Sentiment from 'sentiment';
    //   this.sentiment = new Sentiment();
    if (this.sentiment) return;

    if (window.Sentiment) {
      this.sentiment = new window.Sentiment();
    } else {
      console.warn(
        "Sentiment library not found; using manual lexicon for emotions. " +
          'Include it via <script src="https://cdn.jsdelivr.net/npm/sentiment@5.0.1/dist/sentiment.min.js"></script>'
      );
    }
  }

  lexiconScore(word) {
    const w = word.toLowerCase();
    if (this.manualLexicon["+3"].has(w)) return 3;
    if (this.manualLexicon["+2"].has(w)) return 2;
    if (this.manualLexicon["-2"].has(w)) return -2;
    return 0;
  }

  // Less strict mapping: add a small jitter so scores spread into more buckets
  mapSentimentToEmotion(score) {
    // jitter in [-0.6, 0.6]
    const jitter = (Math.random() - 0.5) * 1.2;
    const s = score + jitter;

    if (s <= -1.2) return "anger"; // strong negative
    if (s <= -0.4) return "sadness"; // moderate negative
    if (s < 0) return "disappointment"; // mild negative
    if (s < 0.6) return "neutral"; // near zero
    if (s < 1.4) return "hope"; // mild positive
    if (s < 2.4) return "joy"; // solid positive
    return "excitement"; // very positive
  }

  // --- Data loading + processing --------------------------------------------
  async loadData() {
    try {
      await this.initNLP();

      const [data] = await Promise.all([
        // UPDATED PATH
        d3.csv("/data/cleaned_tiktok_data.csv", d3.autoType),
      ]);

      this.rawData = data;

      // Use only rows that actually have caption text
      const rows = data.filter(
        (d) => typeof d?.text === "string" && d.text.trim().length > 0
      );

      // Basic stopword list (extend as needed)
      const stopwords = new Set([
        "the",
        "and",
        "for",
        "that",
        "this",
        "with",
        "have",
        "has",
        "was",
        "are",
        "but",
        "not",
        "just",
        "you",
        "your",
        "they",
        "them",
        "their",
        "its",
        "it's",
        "ive",
        "i've",
        "cant",
        "can't",
        "didnt",
        "didn't",
        "im",
        "i'm",
        "like",
        "get",
        "got",
        "tiktok",
        "http",
        "https",
        "www",
        "com",
      ]);

      // Keep only simple English tokens: a–z after lowercasing
      const englishWordRegex = /^[a-z]+$/;

      // Small list of common English words for a rough language heuristic
      const englishCommonWords = new Set([
        "the",
        "and",
        "for",
        "that",
        "this",
        "with",
        "have",
        "has",
        "was",
        "were",
        "are",
        "is",
        "on",
        "in",
        "of",
        "to",
        "from",
        "it",
        "its",
        "as",
        "at",
        "by",
        "or",
        "if",
        "but",
        "so",
        "just",
        "not",
        "no",
        "yes",
        "you",
        "your",
        "yours",
        "me",
        "my",
        "we",
        "our",
        "ours",
        "they",
        "them",
        "their",
        "what",
        "when",
        "where",
        "why",
        "how",
        "who",
        "which",
        "can",
        "could",
        "do",
        "did",
        "done",
        "will",
        "would",
        "all",
        "any",
        "some",
        "more",
        "most",
        "very",
        "too",
        "also",
        "only",
        "new",
        "now",
        "one",
        "two",
        "make",
        "made",
        "get",
        "got",
        "see",
        "look",
        "watch",
        "video",
        "music",
        "song",
        "dance",
        "trend",
        "trending",
        "viral",
        "fyp",
        "foryou",
        "foryoupage",
        "love",
        "like",
        "good",
        "great",
        "best",
        "fun",
        "funny",
        "cool",
        "nice",
        "happy",
        "sad",
        "bad",
        "girl",
        "boy",
        "girls",
        "boys",
        "school",
        "day",
        "time",
        "life",
        "people",
        "friend",
        "friends",
      ]);

      const wordMap = new Map();

      // Build word frequencies + which captions they appear in (for similarity)
      rows.forEach((row, rowIndex) => {
        const text = String(row.text).toLowerCase();
        const rawTokens = text.match(/\b[\p{L}\p{N}'’]+\b/gu) || [];

        // Normalize + keep only a–z words
        const normalizedTokens = rawTokens
          .map((rawToken) => rawToken.replace(/['’]/g, ""))
          .filter((token) => token && englishWordRegex.test(token));

        if (!normalizedTokens.length) return;

        // Caption-level English heuristic:
        // if too few tokens are common English words, treat caption as non-English
        const englishCount = normalizedTokens.filter((t) =>
          englishCommonWords.has(t)
        ).length;
        const englishRatio = englishCount / normalizedTokens.length;

        // Threshold can be tuned; 0.3 works well to drop Spanish/French, etc.
        if (englishRatio < 0.3) {
          return; // skip this caption entirely
        }

        normalizedTokens.forEach((token) => {
          if (stopwords.has(token)) return;
          if (token.length <= 2) return; // drop super-short words

          let entry = wordMap.get(token);
          if (!entry) {
            entry = {
              word: token,
              count: 0,
              docs: new Set(), // which caption indices it appears in
            };
            wordMap.set(token, entry);
          }
          entry.count += 1;
          entry.docs.add(rowIndex);
        });
      });

      // Take the top N most frequent words to keep layout manageable
      let tokens = Array.from(wordMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 120);

      // --- Emotion colors: more categories + more colors --------------------
      const emotionColors = {
        anger: "#dc2626", // red
        sadness: "#2563eb", // blue
        disappointment: "#7c3aed", // purple
        neutral: "#6b7280", // gray
        hope: "#22c55e", // green
        joy: "#a3e635", // lime
        excitement: "#f97316", // orange
      };
      const emotionCategories = new Set();

      // Assign sentiment + emotion bucket
      tokens.forEach((t) => {
        let score = 0;

        // Try external sentiment library if present
        if (this.sentiment) {
          const res = this.sentiment.analyze(t.word);
          score = res.score || 0;
        }

        // Fallback / override with manual lexicon if still neutral
        if (!this.sentiment || score === 0) {
          score = this.lexiconScore(t.word);
        }

        t.sentiment = score;
        t.emotion = this.mapSentimentToEmotion(score);
        emotionCategories.add(t.emotion);
      });

      // Build a co-occurrence–based similarity graph to control distances
      const links = [];
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          const a = tokens[i].docs;
          const b = tokens[j].docs;

          let intersectionSize = 0;
          for (const id of a) {
            if (b.has(id)) intersectionSize++;
          }
          if (!intersectionSize) continue;

          const unionSize = a.size + b.size - intersectionSize;
          const similarity = unionSize ? intersectionSize / unionSize : 0;
          if (similarity > 0) {
            links.push({
              source: i,
              target: j,
              similarity,
            });
          }
        }
      }

      // Clean up heavy doc sets before storing
      tokens.forEach((t) => delete t.docs);

      this.data = {
        tokens,
        links,
        emotionCategories: Array.from(emotionCategories),
        emotionColors,
      };
    } catch (err) {
      console.error("Error loading TikTok data for EmotionViz:", err);
    }
  }

  // --- Lifecycle ------------------------------------------------------------

  mount() {
    if (this.mounted || !this.data) return;
    this.render();
    this.setupLegend();
    this.mounted = true;
    this.emit(VIZ_EVENTS.ENTER_COMPLETE);
  }

  unmount() {
    if (!this.mounted) return;
    this.container.innerHTML = "";
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
        this.toggleLayer("sentiment");
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

  // --- Rendering: word cloud with speech bubbles ----------------------------
  render() {
    if (!this.data) return;

    const { tokens, links, emotionColors } = this.data;

    // Clear container
    this.container.innerHTML = "";

    // Dimensions
    const bbox = this.container.getBoundingClientRect();
    const width = this.options.width || bbox.width || 800;
    const height = this.options.height || bbox.height || 600;

    // Create SVG
    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr(
        "aria-label",
        "Word cloud showing sentiment-colored speech bubbles for TikTok caption words"
      );

    // Size scale: frequency → font size / bubble size
    const sizeScale = d3
      .scaleSqrt()
      .domain(d3.extent(tokens, (d) => d.count))
      .range([12, 42]);

    // Pre-compute estimated bubble box sizes (for collision + drawing)
    const paddingX = 10;
    const paddingY = 6;
    tokens.forEach((t) => {
      const fontSize = sizeScale(t.count);
      const textWidth = t.word.length * fontSize * 0.6; // rough estimate
      t.fontSize = fontSize;
      t.boxWidth = textWidth + paddingX * 2;
      t.boxHeight = fontSize + paddingY * 2;
    });

    // Force simulation:
    const simulation = d3
      .forceSimulation(tokens)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-20))
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d, i) => i)
          .distance((d) => 220 * (1 - d.similarity) + 30) // closer if more similar
          .strength((d) => 0.5 * d.similarity)
      )
      .force(
        "collision",
        d3.forceCollide((d) => Math.max(d.boxWidth, d.boxHeight) / 2 + 8)
      )
      .stop();

    for (let i = 0; i < 250; i++) simulation.tick();

    // where you create `bubbles`
    const bubbles = this.svg
      .selectAll(".word-bubble")
      .data(tokens)
      .join("g")
      .attr("class", "word-bubble")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    // Rounded rect for speech bubble body
    bubbles
      .append("rect")
      .attr("class", "bubble-body") // 👈 add class
      .attr("x", (d) => -d.boxWidth / 2)
      .attr("y", (d) => -d.boxHeight / 2)
      .attr("width", (d) => d.boxWidth)
      .attr("height", (d) => d.boxHeight)
      .attr("rx", 16) // a bit rounder
      .attr("ry", 16)
      .attr("fill", (d) => emotionColors[d.emotion] || "#e5e7eb")
      .attr("stroke", "transparent") // let CSS handle visible stroke
      .attr("opacity", 0.95);

    // Small triangle tail for the speech bubble
    // Placed at the BOTTOM, slightly to the right (not centered)
    bubbles
      .append("path")
      .attr("class", "bubble-tail")
      .attr("d", (d) => {
        const tailWidth = 12;
        const tailHeight = 9;

        // Bottom edge of the rect in local coords
        const y = d.boxHeight / 2 - 1;

        // Shifted toward the right, not centered
        const baseLeft = d.boxWidth / 2 - tailWidth - 12; // tweak "- 4" to move it
        const baseRight = baseLeft + tailWidth;
        const tipX = (baseLeft + baseRight) / 2;
        const tipY = y + tailHeight; // tip points downward

        return `M ${baseLeft} ${y}
                L ${baseRight} ${y}
                L ${tipX} ${tipY}
                Z`;
      })
      .attr("fill", (d) => emotionColors[d.emotion] || "#e5e7eb")
      .attr("stroke", "transparent")
      .attr("opacity", 0.95);

    // Word text
    bubbles
      .append("text")
      .text((d) => d.word)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", (d) => `${d.fontSize}px`)
      .style("fill", "var(--color-text-primary, #020617)")
      .style("pointer-events", "none");

    // Interactions (hover / click)
    this.addBubbleInteractions(bubbles);

    // Simple fade-in animation
    if (!this.options.reducedMotion) {
      bubbles
        .attr("opacity", 0)
        .transition()
        .duration(700)
        .delay((d, i) => i * 20)
        .attr("opacity", 1);
    }
  }

  // --- Legend + interactions ------------------------------------------------
  setupLegend() {
    const legendPanel = document.querySelector(".emotion-legend");
    if (!legendPanel || !this.data) return;

    legendPanel.innerHTML = "";

    this.data.emotionCategories.forEach((emotion) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <span style="
          display:inline-block;
          width:12px;
          height:12px;
          background:${this.data.emotionColors[emotion]};
          border-radius:50%;
          margin-right:8px;
        "></span>
        ${emotion}
      `;
      item.style.display = "flex";
      item.style.alignItems = "center";
      legendPanel.appendChild(item);
    });
  }

  addBubbleInteractions(bubbles) {
    bubbles
      .on("mouseenter", (event, d) => {
        d3.select(event.currentTarget)
          .select("rect")
          .transition()
          .duration(200)
          .attr("stroke-width", 3);

        this.showBubbleDetail(d);
      })
      .on("mouseleave", (event) => {
        d3.select(event.currentTarget)
          .select("rect")
          .transition()
          .duration(200)
          .attr("stroke-width", 1.5);
      })
      .on("click", (event, d) => {
        this.openDetailDrawer(d);
      });
  }

  showBubbleDetail(data) {
    const detailContent = document.querySelector(".drawer-content");
    if (detailContent) {
      detailContent.innerHTML = `
        <h3>${data.word}</h3>
        <p>Emotion bucket: <strong>${data.emotion}</strong></p>
        <p>Sentiment score: ${
          data.sentiment?.toFixed ? data.sentiment.toFixed(2) : data.sentiment
        }</p>
        <p>Frequency (word count): ${data.count}</p>
      `;
    }
  }

  openDetailDrawer(data) {
    const drawer = document.querySelector(".detail-drawer");
    if (drawer) {
      drawer.setAttribute("aria-hidden", "false");
      this.showBubbleDetail(data);
    }

    const closeBtn = document.querySelector(".drawer-close");
    if (closeBtn && drawer) {
      closeBtn.onclick = () => {
        drawer.setAttribute("aria-hidden", "true");
      };
    }
  }

  // --- Misc behaviors used by scrollytelling driver ------------------------
  toggleLayer(layer) {
    console.log(`Toggling to "${layer}" layer`);
  }

  highlightHighEngagement() {
    // Reinterpreted as "highlight high-frequency words"
    if (!this.svg || !this.data) return;

    const maxCount = d3.max(this.data.tokens, (d) => d.count) || 1;
    const threshold = maxCount * 0.6;

    this.svg
      .selectAll(".word-bubble")
      .transition()
      .duration(400)
      .attr("opacity", (d) => (d.count >= threshold ? 1 : 0.25));
  }

  emphasizeOutlines() {
    if (this.svg) {
      this.svg.selectAll(".word-bubble rect").attr("stroke-width", 3);
    }
  }
}
