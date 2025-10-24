// Motion patterns from motion.json
export class MotionPatterns {
  constructor() {
    this.easing = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    this.durations = {
      micro: 200,
      macro: 400,
      cinematic: 600
    };

    this.patterns = {
      'MI-01': {
        name: 'Button: Hover',
        duration: 200,
        properties: ['transform', 'box-shadow'],
        reducedMotion: { properties: ['background-color'] }
      },
      'MI-02': {
        name: 'Button: Focus',
        duration: 200,
        properties: ['box-shadow'],
        reducedMotion: { properties: [] }
      },
      'MI-03': {
        name: 'Tooltip: Reveal',
        duration: 200,
        properties: ['opacity', 'transform'],
        reducedMotion: { properties: ['opacity'] }
      },
      'MI-04': {
        name: 'Data Point: Hover',
        duration: 200,
        properties: ['transform', 'stroke-width'],
        reducedMotion: { properties: ['fill'] }
      },
      'MI-05': {
        name: 'Chart: Data Update',
        duration: 400,
        properties: ['transform', 'opacity'],
        reducedMotion: { properties: ['opacity'] }
      },
      'MI-06': {
        name: 'Chart: Staggered Entrance',
        duration: 400,
        properties: ['opacity', 'transform'],
        reducedMotion: { properties: ['opacity'] }
      },
      'MI-07': {
        name: 'Panel: Reveal',
        duration: 400,
        properties: ['opacity', 'transform'],
        reducedMotion: { properties: ['opacity'] }
      },
      'MI-08': {
        name: 'Stopwatch: Needle Tick',
        duration: 200,
        easing: 'linear',
        properties: ['transform'],
        reducedMotion: { properties: [] }
      },
      'MI-09': {
        name: 'Planet: Orbit',
        duration: null,
        easing: 'linear',
        properties: ['transform'],
        reducedMotion: { properties: [] }
      },
      'MI-10': {
        name: 'Section: Cinematic Handoff',
        duration: 600,
        properties: ['opacity', 'transform'],
        reducedMotion: { properties: ['opacity'] }
      },
      'MI-11': {
        name: 'Link: Hover',
        duration: 200,
        properties: ['color', 'text-shadow'],
        reducedMotion: { properties: ['color'] }
      },
      'MI-12': {
        name: 'Filter: State Change',
        duration: 200,
        properties: ['background-color', 'border-color'],
        reducedMotion: { properties: [] }
      }
    };
  }

  getPattern(id) {
    return this.patterns[id] || null;
  }

  getDuration(type) {
    return this.durations[type] || this.durations.macro;
  }

  applyPattern(element, patternId, options = {}) {
    const pattern = this.getPattern(patternId);
    if (!pattern) return;

    const reducedMotion = this.prefersReducedMotion();
    const properties = reducedMotion ?
      pattern.reducedMotion.properties :
      pattern.properties;

    const duration = pattern.duration || this.getDuration('macro');
    const easing = pattern.easing || this.easing;

    // Apply CSS transition
    element.style.transition = properties
      .map(prop => `${prop} ${duration}ms ${easing}`)
      .join(', ');

    // Apply styles from options
    if (options.styles) {
      Object.assign(element.style, options.styles);
    }

    // Clean up transition after completion
    if (duration) {
      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    }
  }

  animateStagger(elements, patternId, staggerDelay = 50) {
    const pattern = this.getPattern(patternId);
    if (!pattern) return;

    elements.forEach((element, index) => {
      setTimeout(() => {
        this.applyPattern(element, patternId);
      }, index * staggerDelay);
    });
  }

  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Section transition helpers
  applyTransition(from, to, callback) {
    const pattern = this.getPattern('MI-10'); // Cinematic handoff
    const duration = pattern.duration || this.getDuration('cinematic');

    if (this.prefersReducedMotion()) {
      // Simple cross-fade for reduced motion
      if (from) from.style.opacity = '0';
      if (to) to.style.opacity = '1';
      if (callback) callback();
      return;
    }

    // Full transition
    if (from) {
      from.style.transition = `opacity ${duration}ms ${this.easing}, transform ${duration}ms ${this.easing}`;
      from.style.opacity = '0';
      from.style.transform = 'translateY(-20px)';
    }

    if (to) {
      to.style.transition = `opacity ${duration}ms ${this.easing}, transform ${duration}ms ${this.easing}`;
      to.style.opacity = '1';
      to.style.transform = 'translateY(0)';
    }

    if (callback) {
      setTimeout(callback, duration);
    }
  }
}