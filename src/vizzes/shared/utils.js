// Shared utilities for all visualizations

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }

  emit(event, data = {}) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        callback({ type: event, data });
      });
    }
  }
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getColorScale(type = 'default') {
  const scales = {
    default: ['#00FFE0', '#FF00E0', '#FFEB3B', '#3B82F6', '#EF4444'],
    accessible: ['#0066CC', '#FF6600', '#009900', '#990099', '#FFCC00'],
    print: ['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
  };
  return scales[type] || scales.default;
}

export function loadData(url) {
  if (url.endsWith('.csv')) {
    return d3.csv(url, d3.autoType);
  }
  if (url.endsWith('.json')) {
    return d3.json(url);
  }
  return Promise.reject(new Error('Unsupported data format'));
}

// Drawer Manager for detail panels
export class DrawerManager {
  constructor() {
    this.currentDrawer = null;
    this.drawers = new Map();
  }

  register(id, element) {
    this.drawers.set(id, element);

    // Add close button handler
    const closeBtn = element.querySelector('.drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close(id));
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentDrawer === id) {
        this.close(id);
      }
    });
  }

  open(id, data = {}) {
    // Close any currently open drawer
    if (this.currentDrawer && this.currentDrawer !== id) {
      this.close(this.currentDrawer);
    }

    const drawer = this.drawers.get(id);
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      this.currentDrawer = id;

      // Update drawer content if data provided
      if (data.title) {
        const titleEl = drawer.querySelector('.drawer-title');
        if (titleEl) titleEl.textContent = data.title;
      }
      if (data.content) {
        const contentEl = drawer.querySelector('.drawer-content');
        if (contentEl) contentEl.innerHTML = data.content;
      }
    }
  }

  close(id) {
    const drawer = this.drawers.get(id);
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      if (this.currentDrawer === id) {
        this.currentDrawer = null;
      }
    }
  }

  closeAll() {
    this.drawers.forEach((drawer, id) => {
      this.close(id);
    });
  }
}

// Audio Manager for sound previews
export class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.isMuted = false;
  }

  play(url) {
    if (this.isMuted) return;

    // Stop current audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    this.currentAudio = new Audio(url);
    this.currentAudio.volume = 0.5;
    this.currentAudio.play().catch(err => {
      console.warn('Audio playback failed:', err);
    });
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.currentAudio) {
      this.stop();
    }
    return this.isMuted;
  }
}

// Create interactive falling leaves
export function createFallingLeaves(container, count = 5) {
  if (prefersReducedMotion()) return;

  const leaves = [];
  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf interactive';
    leaf.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21C12 21 16 17 16 12C16 7 12 3 12 3Z" fill="currentColor"/></svg>';
    leaf.style.left = Math.random() * 100 + '%';
    leaf.style.animationDelay = Math.random() * 10 + 's';
    leaf.style.animationDuration = (10 + Math.random() * 5) + 's';

    leaf.addEventListener('click', () => {
      leaf.style.transform = 'scale(1.5) rotate(720deg)';
      setTimeout(() => {
        leaf.style.transform = '';
      }, 300);
    });

    container.appendChild(leaf);
    leaves.push(leaf);
  }

  return leaves;
}

// Create tooltip helper
export function createTooltip(className = 'viz-tooltip') {
  const tooltip = document.createElement('div');
  tooltip.className = className;
  document.body.appendChild(tooltip);

  return {
    show(x, y, content) {
      tooltip.innerHTML = content;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
      tooltip.style.opacity = '1';
    },
    hide() {
      tooltip.style.opacity = '0';
    },
    remove() {
      tooltip.remove();
    }
  };
}