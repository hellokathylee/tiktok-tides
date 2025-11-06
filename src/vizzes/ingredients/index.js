// Ingredients Visualization - Quiz Panels for Viral Recipe
import { EventEmitter, prefersReducedMotion } from '../shared/utils.js';
import { VIZ_EVENTS, DEFAULT_OPTIONS } from '../shared/types.js';

export class IngredientsViz extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.data = null;
    this.state = {
      currentStep: 0,
      selectedIngredient: null,
      quizActive: false,
      userGuesses: {},
      filters: {},
      highlights: [],
      animationPaused: false,
      interactionMode: 'explore'
    };
    this.options = { ...DEFAULT_OPTIONS };
    this.mounted = false;
  }

  async init(selector, options = {}) {
    this.container = typeof selector === 'string' ?
      document.querySelector(selector) : selector;

    if (!this.container) {
      throw new Error(`Container not found: ${selector}`);
    }

    this.options = { ...this.options, ...options };

    // Load ingredient data
    await this.loadData();
    this.emit(VIZ_EVENTS.DATA_READY);
  }

  async loadData() {
    // Try to load from file, fallback to mock data
    try {
      const response = await fetch('/data/ingredients_sample.json');
      if (response.ok) {
        this.data = await response.json();
      } else {
        throw new Error('File not found');
      }
    } catch (err) {
      // Use mock data
      this.data = [
        {
          ingredient: 'video_length_bucket',
          label: 'Video Duration',
          icon: '⏱️',
          description: 'Optimal length for engagement',
          with: { views: 'PLACEHOLDER_892K', shares: 'PLACEHOLDER_45K' },
          without: { views: 'PLACEHOLDER_234K', shares: 'PLACEHOLDER_12K' },
          examples: ['15-30 sec sweet spot', '60 sec for tutorials']
        },
        {
          ingredient: 'sound_reuse',
          label: 'Trending Audio',
          icon: '🎵',
          description: 'Using viral sounds',
          with: { views: 'PLACEHOLDER_1.2M', shares: 'PLACEHOLDER_89K' },
          without: { views: 'PLACEHOLDER_156K', shares: 'PLACEHOLDER_8K' },
          examples: ['Original sounds', 'Remixes']
        },
        {
          ingredient: 'hashtag_count',
          label: 'Hashtag Strategy',
          icon: '#️⃣',
          description: '3-5 targeted hashtags',
          with: { views: 'PLACEHOLDER_678K', shares: 'PLACEHOLDER_34K' },
          without: { views: 'PLACEHOLDER_234K', shares: 'PLACEHOLDER_11K' },
          examples: ['#ForYou', '#Viral', 'Niche tags']
        },
        {
          ingredient: 'duet_stitch',
          label: 'Duet/Stitch',
          icon: '🔄',
          description: 'Collaborative features',
          with: { views: 'PLACEHOLDER_934K', shares: 'PLACEHOLDER_67K' },
          without: { views: 'PLACEHOLDER_445K', shares: 'PLACEHOLDER_23K' },
          examples: ['React videos', 'Challenges']
        },
        {
          ingredient: 'posting_time_bucket',
          label: 'Timing',
          icon: '🕐',
          description: 'Peak hours posting',
          with: { views: 'PLACEHOLDER_789K', shares: 'PLACEHOLDER_56K' },
          without: { views: 'PLACEHOLDER_345K', shares: 'PLACEHOLDER_19K' },
          examples: ['6-10 AM', '7-11 PM']
        },
        {
          ingredient: 'caption_emotion_family',
          label: 'Emotional Hook',
          icon: '💭',
          description: 'Caption sentiment',
          with: { views: 'PLACEHOLDER_823K', shares: 'PLACEHOLDER_61K' },
          without: { views: 'PLACEHOLDER_412K', shares: 'PLACEHOLDER_28K' },
          examples: ['Joy', 'Surprise', 'Nostalgia']
        },
        {
          ingredient: 'creator_reach',
          label: 'Creator Base',
          icon: '👥',
          description: 'Follower count impact',
          with: { views: 'PLACEHOLDER_1.5M', shares: 'PLACEHOLDER_112K' },
          without: { views: 'PLACEHOLDER_89K', shares: 'PLACEHOLDER_4K' },
          examples: ['Micro-influencer', 'Rising creator']
        },
        {
          ingredient: 'effects_used',
          label: 'Visual Effects',
          icon: '✨',
          description: 'Filters and transitions',
          with: { views: 'PLACEHOLDER_934K', shares: 'PLACEHOLDER_72K' },
          without: { views: 'PLACEHOLDER_567K', shares: 'PLACEHOLDER_31K' },
          examples: ['Green screen', 'Time warp']
        },
        {
          ingredient: 'sound_age',
          label: 'Sound Freshness',
          icon: '📈',
          description: 'Timing the trend wave',
          with: { views: 'PLACEHOLDER_1.1M', shares: 'PLACEHOLDER_95K' },
          without: { views: 'PLACEHOLDER_234K', shares: 'PLACEHOLDER_15K' },
          examples: ['First 48 hours', 'Peak week']
        }
      ];
    }
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
      case 11:
        // Highlight key ingredients
        this.highlightKeyIngredients();
        break;
      case 12:
        // Show quiz prompt
        this.showQuizPrompt();
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

    // Create card grid
    const grid = document.createElement('div');
    grid.className = 'ingredients-grid';
    grid.setAttribute('role', 'list');
    grid.setAttribute('aria-label', 'Viral recipe ingredients');

    // Create cards
    this.data.forEach((item, index) => {
      const card = this.createCard(item, index);
      grid.appendChild(card);
    });

    this.container.appendChild(grid);

    // Create quiz modal (hidden initially)
    const modal = this.createQuizModal();
    this.container.appendChild(modal);

    // Initial animation
    if (!this.options.reducedMotion) {
      const cards = grid.querySelectorAll('.ingredient-card');
      cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'all 400ms cubic-bezier(0.4, 0.0, 0.2, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 50);
      });
    }
  }

  createCard(item, index) {
    const card = document.createElement('div');
    card.className = 'ingredient-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-ingredient', item.ingredient);
    card.setAttribute('aria-label', `${item.label}: ${item.description}`);

    card.innerHTML = `
      <div class="card-icon">${item.icon}</div>
      <h3 class="card-title">${item.label}</h3>
      <p class="card-description">${item.description}</p>
      <button class="card-action" aria-label="Test ${item.label} impact">
        <span>Test Impact</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    // Click handler
    card.addEventListener('click', () => this.openQuiz(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openQuiz(item);
      }
    });

    return card;
  }

  createQuizModal() {
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'quiz-title');
    modal.setAttribute('aria-describedby', 'quiz-description');

    modal.innerHTML = `
      <div class="quiz-content">
        <button class="quiz-close" aria-label="Close quiz">×</button>
        <h2 id="quiz-title">Test Your Intuition</h2>
        <p id="quiz-description">Compare performance with and without this ingredient</p>

        <div class="quiz-ingredient-info">
          <span class="quiz-icon"></span>
          <h3 class="quiz-ingredient-name"></h3>
        </div>

        <div class="quiz-comparison">
          <div class="comparison-with">
            <h4>With <span class="ingredient-name"></span></h4>
            <div class="metric-bars">
              <div class="metric-row">
                <span class="metric-label">Views</span>
                <div class="metric-bar">
                  <div class="bar-fill with-fill" style="width: 75%"></div>
                  <span class="metric-value"></span>
                </div>
              </div>
              <div class="metric-row">
                <span class="metric-label">Shares</span>
                <div class="metric-bar">
                  <div class="bar-fill with-fill" style="width: 70%"></div>
                  <span class="metric-value"></span>
                </div>
              </div>
            </div>
            <div class="example-thumbnails">
              <div class="thumbnail-placeholder"></div>
              <div class="thumbnail-placeholder"></div>
            </div>
          </div>

          <div class="comparison-without">
            <h4>Without <span class="ingredient-name"></span></h4>
            <div class="metric-bars">
              <div class="metric-row">
                <span class="metric-label">Views</span>
                <div class="metric-bar">
                  <div class="bar-fill without-fill" style="width: 35%"></div>
                  <span class="metric-value"></span>
                </div>
              </div>
              <div class="metric-row">
                <span class="metric-label">Shares</span>
                <div class="metric-bar">
                  <div class="bar-fill without-fill" style="width: 30%"></div>
                  <span class="metric-value"></span>
                </div>
              </div>
            </div>
            <div class="example-thumbnails">
              <div class="thumbnail-placeholder"></div>
              <div class="thumbnail-placeholder"></div>
            </div>
          </div>
        </div>

        <div class="quiz-examples">
          <h4>Pro Tips</h4>
          <ul class="example-list"></ul>
        </div>

        <div class="quiz-actions">
          <button class="btn-secondary quiz-guess">Make Your Guess First</button>
          <button class="btn-primary quiz-reveal">Reveal Impact</button>
        </div>
      </div>
    `;

    // Setup close button
    const closeBtn = modal.querySelector('.quiz-close');
    closeBtn.addEventListener('click', () => this.closeQuiz());

    // Setup action buttons
    const guessBtn = modal.querySelector('.quiz-guess');
    guessBtn.addEventListener('click', () => this.recordGuess());

    const revealBtn = modal.querySelector('.quiz-reveal');
    revealBtn.addEventListener('click', () => this.revealAnswer());

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeQuiz();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.quizActive) {
        this.closeQuiz();
      }
    });

    return modal;
  }

  openQuiz(item) {
    this.state.selectedIngredient = item;
    this.state.quizActive = true;

    const modal = this.container.querySelector('.quiz-modal');
    if (!modal) return;

    // Update modal content
    modal.querySelector('.quiz-icon').textContent = item.icon;
    modal.querySelector('.quiz-ingredient-name').textContent = item.label;
    modal.querySelectorAll('.ingredient-name').forEach(el => {
      el.textContent = item.label;
    });

    // Update metrics
    const withMetrics = modal.querySelector('.comparison-with');
    withMetrics.querySelector('.metric-row:nth-child(1) .metric-value').textContent = item.with.views;
    withMetrics.querySelector('.metric-row:nth-child(2) .metric-value').textContent = item.with.shares;

    const withoutMetrics = modal.querySelector('.comparison-without');
    withoutMetrics.querySelector('.metric-row:nth-child(1) .metric-value').textContent = item.without.views;
    withoutMetrics.querySelector('.metric-row:nth-child(2) .metric-value').textContent = item.without.shares;

    // Update examples
    const exampleList = modal.querySelector('.example-list');
    exampleList.innerHTML = item.examples.map(ex => `<li>${ex}</li>`).join('');

    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');

    // Animation
    if (!this.options.reducedMotion) {
      const content = modal.querySelector('.quiz-content');
      content.style.opacity = '0';
      content.style.transform = 'scale(0.95)';
      setTimeout(() => {
        content.style.transition = 'all 400ms cubic-bezier(0.4, 0.0, 0.2, 1)';
        content.style.opacity = '1';
        content.style.transform = 'scale(1)';
      }, 10);
    }

    // Focus management
    modal.querySelector('.quiz-close').focus();

    // Announce
    this.emit('quizOpened', { ingredient: item.label });
  }

  closeQuiz() {
    const modal = this.container.querySelector('.quiz-modal');
    if (!modal) return;

    this.state.quizActive = false;

    // Animation
    if (!this.options.reducedMotion) {
      const content = modal.querySelector('.quiz-content');
      content.style.transition = 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)';
      content.style.opacity = '0';
      content.style.transform = 'scale(0.95)';
      setTimeout(() => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }, 300);
    } else {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }

    // Return focus to the card
    if (this.state.selectedIngredient) {
      const card = this.container.querySelector(`[data-ingredient="${this.state.selectedIngredient.ingredient}"]`);
      if (card) card.focus();
    }

    this.emit('quizClosed');
  }

  recordGuess() {
    if (this.state.selectedIngredient) {
      this.state.userGuesses[this.state.selectedIngredient.ingredient] = Date.now();

      // Store in localStorage
      localStorage.setItem('tiktok-tides-guesses', JSON.stringify(this.state.userGuesses));

      // Visual feedback
      const guessBtn = this.container.querySelector('.quiz-guess');
      guessBtn.textContent = 'Guess Recorded ✓';
      guessBtn.disabled = true;
    }
  }

  revealAnswer() {
    // Animate the reveal
    const bars = this.container.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
      bar.style.transition = 'width 800ms cubic-bezier(0.4, 0.0, 0.2, 1)';
    });

    // Highlight the winner
    const withSection = this.container.querySelector('.comparison-with');
    withSection.classList.add('winner');

    this.emit('answerRevealed', { ingredient: this.state.selectedIngredient?.label });
  }

  highlightKeyIngredients() {
    // Highlight top performing ingredients
    const keyIngredients = ['sound_reuse', 'video_length_bucket', 'caption_emotion_family'];

    keyIngredients.forEach(key => {
      const card = this.container.querySelector(`[data-ingredient="${key}"]`);
      if (card) {
        card.classList.add('highlighted');
      }
    });
  }

  showQuizPrompt() {
    // Add a call-to-action overlay
    const prompt = document.createElement('div');
    prompt.className = 'quiz-prompt';
    prompt.innerHTML = `
      <p>🎯 Ready to build your viral recipe? Click any ingredient to test your intuition!</p>
    `;
    this.container.insertBefore(prompt, this.container.firstChild);

    setTimeout(() => {
      prompt.style.opacity = '0';
      setTimeout(() => prompt.remove(), 400);
    }, 5000);
  }
}