import * as d3 from 'd3';

const VIEWBOX_SIZE = 640;
const CENTER = VIEWBOX_SIZE / 2;
const OUTER_RADIUS = CENTER - 70;
const INNER_RADIUS = 42;
const ROTATION_SPEED = 360 / 12000; // deg per ms

export class RecordPlayerViz {
    constructor() {
        this.container = null;
        this.svg = null;
        this.ringsGroup = null;
        this.wrapperEl = null;
        this.notesWrapper = null;
        this.tonearm = null;
        this.tonearmArm = null;
        this.tonearmHinge = null;
        this.tonearmHead = null;

        this.data = [];
        this.radiusScale = null;
        this.angleScale = null;

        this.activeIndex = null;
        this.lockedIndex = null;
        this.isDraggingTonearm = false;
        this.activePointerElement = null;

        this.spinAngles = new Map(); // index -> angle
        this.spinTimers = new Map(); // index -> { rafId, last }

        this.audioCache = new Map(); // url -> Audio
        this.currentAudio = null;
        this.currentAudioIndex = null;

        this.autoplayUnlocked = false;
        this.pendingAudioIndex = null;
        this.handleFirstGesture = this.handleFirstGesture.bind(this);
    }

    async init(selector, options = {}) {
        this.container = document.querySelector(selector);
        if (!this.container) {
            throw new Error(`RecordPlayerViz: container "${selector}" not found.`);
        }

        this.wrapperEl = this.container.querySelector('.record-player-wrapper');
        this.notesWrapper = this.container.querySelector('.record-player-notes');
        this.svg = d3.select(this.container.querySelector('.record-disc'));
        this.ringsGroup = this.svg.select('[data-record-rings]');
        this.tonearm = this.container.querySelector('.tonearm');
        this.tonearmArm = this.container.querySelector('[data-tonearm-arm]');
        this.tonearmHinge = this.container.querySelector('.tonearm-hinge');
        this.tonearmHead = this.container.querySelector('.tonearm-head');

        await this.loadData();
        this.setupScales();
        this.renderRings();
        this.bindInteractions();
        document.addEventListener('pointerdown', this.handleFirstGesture, { once: true });
        this.setTonearmToIndex(0, { silent: true });
    }

    async loadData() {
        const parsed = await d3.csv('/data/top10_music.csv', (d) => ({
            name: d['musicMeta/musicName'] ?? d['Music Name'],
            playUrl: d['music_playUrl'] ?? d['musicMeta/musicPlayUrl'] ?? '',
            totalPlayCount: +d['total_playCount'] || +d['Total Digg'] || 0
        }));

        this.data = parsed
            .filter((row) => row.name && Number.isFinite(row.totalPlayCount))
            .sort((a, b) => b.totalPlayCount - a.totalPlayCount)
            .slice(0, 10);

        if (this.data.length < 10) {
            const fallback = [
                { name: 'Subway Surfers (Main Theme)', totalPlayCount: 250700000, playUrl: '' },
                { name: 'So Easy (To Fall in Love)', totalPlayCount: 156900000, playUrl: '' },
                { name: 'Elevator Music', totalPlayCount: 117400000, playUrl: '' },
                { name: 'Ring Ring Ring', totalPlayCount: 96000000, playUrl: '' },
                { name: 'Olivia Dean - The Hardest Part', totalPlayCount: 50400000, playUrl: '' }
            ];
            const existing = new Set(this.data.map((d) => d.name));
            fallback
                .filter((song) => !existing.has(song.name))
                .slice(0, 10 - this.data.length)
                .forEach((song) => this.data.push(song));
        }
    }

    setupScales() {
        const ringStep = (OUTER_RADIUS - INNER_RADIUS) / this.data.length;
        this.radiusScale = (index) => OUTER_RADIUS - (index + 0.5) * ringStep;

        const maxAngle = 18;
        const minAngle = -62;
        this.angleScale = d3.scaleLinear().domain([0, this.data.length - 1]).range([maxAngle, minAngle]);
    }

    renderRings() {
        // reset timers/angles when rendering
        this.stopAllRingRotation();
        this.spinAngles.clear();

        const defs = this.ensureDefs();

        const rings = this.ringsGroup
            .selectAll('.record-ring')
            .data(this.data, d => d.name);

        const ringsEnter = rings.enter()
            .append('g')
            .attr('class', 'record-ring')
            .attr('data-song-index', (_, i) => i)
            .attr('transform', `translate(${CENTER}, ${CENTER})`);

        ringsEnter.append('circle').attr('class', 'record-ring-arc');
        ringsEnter.append('text').attr('class', 'record-ring-label').append('textPath');

        const ringsMerge = ringsEnter.merge(rings);

        ringsMerge
            .attr('data-song-index', (_, i) => i)
            .each((d, i, nodes) => {
                const radius = Math.max(14, this.radiusScale(i));
                const strokeWidth = Math.max(18, (OUTER_RADIUS - INNER_RADIUS) / this.data.length * 0.85);
                const ringSel = d3.select(nodes[i]);
                const arc = ringSel.select('.record-ring-arc');

                arc
                    .attr('r', radius)
                    .attr('stroke-width', strokeWidth);

                const labelRadius = Math.max(12, radius - strokeWidth * 0.35);
                const sweep = Math.PI * 0.72;
                const baseStart = -Math.PI / 2 - sweep / 2;
                const startAngle = baseStart + (i % 2 === 0 ? -0.05 : 0.05);
                const endAngle = startAngle + sweep;

                const pathId = `record-ring-label-path-${i}`;
                let labelPath = defs.select(`#${pathId}`);
                if (labelPath.empty()) {
                    labelPath = defs.append('path').attr('id', pathId);
                }
                const pathBuilder = d3.path();
                pathBuilder.arc(0, 0, labelRadius, startAngle, endAngle);
                labelPath.attr('d', pathBuilder.toString());

                ringSel
                    .select('.record-ring-label')
                    .select('textPath')
                    .attr('startOffset', '50%')
                    .attr('href', `#${pathId}`)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('method', 'stretch')
                    .attr('dy', 0)
                    .text(() => {
                        const millions = d.totalPlayCount / 1_000_000;
                        const metric = millions >= 100 ? Math.round(millions) : millions.toFixed(1);
                        return `🎵 ${d.name} • ${metric}M`;
                    });

                this.spinAngles.set(i, this.spinAngles.get(i) ?? 0);
                this.applyRingTransform(i);
            });

        rings.exit().remove();
    }

    ensureDefs() {
        let defs = this.svg.select('defs');
        if (defs.empty()) {
            defs = this.svg.insert('defs', ':first-child');
        }
        return defs;
    }

    bindInteractions() {
        const ringNodes = this.container.querySelectorAll('.record-ring');
        ringNodes.forEach((ringEl) => {
            ringEl.addEventListener('mouseenter', () => {
                const index = Number(ringEl.dataset.songIndex);
                this.activateRing(index, { locked: false, source: 'hover' });
            });

            ringEl.addEventListener('mouseleave', () => {
                const index = Number(ringEl.dataset.songIndex);
                if (this.isDraggingTonearm) return;
                if (this.lockedIndex !== null && this.lockedIndex !== index) {
                    this.activateRing(this.lockedIndex, { locked: true, source: 'tonearm' });
                    return;
                }
                const isLockedRing = this.lockedIndex === index;
                this.stopRingRotation(index);
                ringEl.classList.remove('is-hovered');
                if (!isLockedRing) {
                    ringEl.classList.remove('is-active');
                    this.stopSong(true);
                    if (this.activeIndex === index) this.activeIndex = null;
                }
            });

            ringEl.addEventListener('click', () => {
                const index = Number(ringEl.dataset.songIndex);
                this.handleFirstGesture();
                this.activateRing(index, { locked: true, source: 'click' });
                this.setTonearmToIndex(index);
            });
        });

        if (this.tonearmHead) {
            this.installTonearmPointerHandlers(this.tonearmHead);
        }
    }

    getRingSelection(index) {
        return this.ringsGroup.select(`[data-song-index="${index}"]`);
    }

    getRingNode(index) {
        return this.getRingSelection(index).node();
    }

    applyRingTransform(index) {
        const node = this.getRingNode(index);
        if (!node) return;
        const angle = this.spinAngles.get(index) || 0;
        node.setAttribute('transform', `translate(${CENTER}, ${CENTER}) rotate(${angle})`);
    }

    startRingRotation(index) {
        if (this.spinTimers.has(index)) return;
        const node = this.getRingNode(index);
        if (!node) return;
        let angle = this.spinAngles.get(index) || 0;
        const state = { last: null, rafId: null };
        const step = (timestamp) => {
            if (!this.spinTimers.has(index)) return;
            if (state.last === null) state.last = timestamp;
            const delta = timestamp - state.last;
            state.last = timestamp;
            angle = (angle + delta * ROTATION_SPEED) % 360;
            this.spinAngles.set(index, angle);
            node.setAttribute('transform', `translate(${CENTER}, ${CENTER}) rotate(${angle})`);
            state.rafId = requestAnimationFrame(step);
        };
        state.rafId = requestAnimationFrame(step);
        this.spinTimers.set(index, state);
    }

    stopRingRotation(index) {
        const state = this.spinTimers.get(index);
        if (state) {
            if (state.rafId) cancelAnimationFrame(state.rafId);
            this.spinTimers.delete(index);
        }
        this.applyRingTransform(index);
    }

    stopAllRingRotation() {
        this.spinTimers.forEach((state) => {
            if (state.rafId) cancelAnimationFrame(state.rafId);
        });
        this.spinTimers.clear();
    }

    getRingRotation(index) {
        return this.spinAngles.get(index) || 0;
    }

    activateRing(index, { locked = false, source = 'hover' } = {}) {
        if (index < 0 || index >= this.data.length) return;
        const ringSel = this.getRingSelection(index);
        if (!ringSel.node()) return;

        if (locked) {
            if (this.lockedIndex !== index) {
                if (this.lockedIndex !== null && this.lockedIndex !== index) {
                    this.stopRingRotation(this.lockedIndex);
                    const prevLocked = this.getRingSelection(this.lockedIndex);
                    prevLocked.classed('is-active', false).classed('is-hovered', false);
                }
                this.lockedIndex = index;
            }
        }

        if (this.activeIndex !== null && this.activeIndex !== index) {
            const previous = this.getRingSelection(this.activeIndex);
            if (previous.node() && this.lockedIndex !== this.activeIndex) {
                this.stopRingRotation(this.activeIndex);
                previous.classed('is-active', false).classed('is-hovered', false);
            }
        }

        const isHover = source === 'hover';

        ringSel.classed('is-hovered', isHover);
        ringSel.classed('is-active', locked || this.lockedIndex === index || !isHover);

        if (isHover) {
            this.startRingRotation(index);
        } else if (!locked && this.lockedIndex !== index) {
            this.stopRingRotation(index);
        }

        this.playSong(index, { autoplay: isHover || locked });
        if ((locked || source === 'tonearm' || source === 'click') && !this.isDraggingTonearm) {
            this.setTonearmToIndex(index);
        }
    }

    clearActiveRing({ preserveLocked = true } = {}) {
        this.ringsGroup.selectAll('.record-ring').each((d, i, nodes) => {
            const ringIndex = Number(nodes[i].dataset.songIndex);
            if (preserveLocked && ringIndex === this.lockedIndex) {
                return;
            }
            this.stopRingRotation(ringIndex);
            nodes[i].classList.remove('is-active', 'is-hovered');
            this.spinAngles.set(ringIndex, this.getRingRotation(ringIndex));
            this.applyRingTransform(ringIndex);
        });
        if (!preserveLocked) {
            this.lockedIndex = null;
        }
        this.activeIndex = null;
    }

    setTonearmToIndex(index, { silent = false } = {}) {
        if (!this.tonearmArm || index == null || index < 0 || index >= this.data.length) return;
        const angle = this.angleScale(index);
        this.tonearmArm.style.transform = `rotate(${angle}deg)`;
        if (!silent) {
            this.lockedIndex = index;
        }
    }

    clampTonearmAngle(angle) {
        const range = this.angleScale.range();
        const min = Math.min(...range) - 12;
        const max = Math.max(...range) + 8;
        return Math.max(min, Math.min(max, angle));
    }

    installTonearmPointerHandlers(node) {
        node.addEventListener('pointerdown', (event) => this.startTonearmDrag(event));
        node.addEventListener('pointermove', (event) => this.onTonearmDrag(event));
        node.addEventListener('pointerup', (event) => this.endTonearmDrag(event));
        node.addEventListener('pointercancel', (event) => this.endTonearmDrag(event));
    }

    startTonearmDrag(event) {
        event.preventDefault();
        this.handleFirstGesture();
        this.isDraggingTonearm = true;
        this.wrapperEl?.classList.add('is-engaged');
        const target = event.currentTarget;
        target.setPointerCapture(event.pointerId);
        this.activePointerElement = target;
        if (this.lockedIndex == null && this.activeIndex != null) {
            this.lockedIndex = this.activeIndex;
        }
        this.onTonearmDrag(event);
    }

    onTonearmDrag(event) {
        const rect = this.tonearmHinge.getBoundingClientRect();
        const pivotX = rect.left + rect.width / 2;
        const pivotY = rect.top + rect.height / 2;
        const dx = event.clientX - pivotX;
        const dy = event.clientY - pivotY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const MIN_DIST = INNER_RADIUS + 30;
        const MAX_DIST = OUTER_RADIUS + 30;

        if ((dist < MIN_DIST || dist > MAX_DIST) || (!this.isDraggingTonearm || !this.tonearmHinge || !this.tonearmArm)) return;

        const rawAngle = Math.atan2(event.clientY - pivotY, event.clientX - pivotX) * (180 / Math.PI);
        const adjusted = this.clampTonearmAngle(rawAngle - 90);

        this.tonearmArm.style.transform = `rotate(${adjusted}deg)`;
        const targetIndex = Math.round(this.angleScale.invert(adjusted));
        const clampedIndex = Math.max(0, Math.min(this.data.length - 1, targetIndex));

        if (clampedIndex !== this.lockedIndex) {
            this.activateRing(clampedIndex, { locked: true, source: 'tonearm' });
        }
    }

    endTonearmDrag(event) {
        if (!this.isDraggingTonearm) return;
        this.isDraggingTonearm = false;
        this.wrapperEl?.classList.remove('is-engaged');
        this.activePointerElement?.releasePointerCapture(event.pointerId);
        this.activePointerElement = null;
        if (this.lockedIndex != null) {
            this.setTonearmToIndex(this.lockedIndex, { silent: true });
        }
    }

    playSong(index, { autoplay = true, force = false } = {}) {
        const song = this.data[index];
        if (!song || !song.playUrl) {
            this.stopSong(true);
            return;
        }

        if (autoplay && !force && !this.autoplayUnlocked) {
            this.pendingAudioIndex = index;
            return;
        }

        if (this.currentAudioIndex === index && this.currentAudio) {
            if (autoplay && this.currentAudio.paused) {
                this.currentAudio.play().catch(() => this.toggleNotes(false));
            }
            return;
        }

        if (this.currentAudio && this.currentAudioIndex !== index) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        let audio = this.audioCache.get(song.playUrl);
        if (!audio) {
            audio = new Audio(song.playUrl);
            audio.loop = true;
            audio.preload = 'auto';
            this.audioCache.set(song.playUrl, audio);
        }

        this.currentAudio = audio;
        this.currentAudioIndex = index;

        audio.currentTime = 0;
        if (autoplay || force) {
            this.toggleNotes(true);
            audio.play().catch(() => {
                this.pendingAudioIndex = index;
                this.toggleNotes(false);
                this.autoplayUnlocked = false;
                document.addEventListener('pointerdown', this.handleFirstGesture, { once: true });
            });
        } else {
            this.toggleNotes(false);
        }
    }

    stopSong(force = false) {
        if (!this.currentAudio) return;
        if (!force && this.lockedIndex !== null) return;
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
        this.currentAudioIndex = null;
        this.toggleNotes(false);
    }

    toggleNotes(isPlaying) {
        if (!this.wrapperEl) return;
        if (isPlaying) {
            this.wrapperEl.classList.add('is-playing');
        } else {
            this.wrapperEl.classList.remove('is-playing');
        }
    }

    mount() {
        this.mounted = true;
    }

    update() { }

    destroy() {
        this.stopSong(true);
        this.stopAllRingRotation();
    }

    handleFirstGesture() {
        if (this.autoplayUnlocked) return;
        this.autoplayUnlocked = true;
        if (this.pendingAudioIndex != null) {
            const pending = this.pendingAudioIndex;
            this.pendingAudioIndex = null;
            this.playSong(pending, { autoplay: true, force: true });
        }
    }
}
