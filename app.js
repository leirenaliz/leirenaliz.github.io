// ============================================================
// MUSIC MIXER - Web Audio API Engine
// ============================================================

(function () {
  'use strict';

  // ---- Audio Context ----
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ---- Master Gain ----
  let masterGain = null;

  function getMasterGain() {
    if (!masterGain) {
      const ctx = getAudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.8;
      masterGain.connect(ctx.destination);
    }
    return masterGain;
  }

  // ---- Analyser for visualizer ----
  let masterAnalyser = null;

  function getMasterAnalyser() {
    if (!masterAnalyser) {
      const ctx = getAudioContext();
      masterAnalyser = ctx.createAnalyser();
      masterAnalyser.fftSize = 256;
      getMasterGain().connect(masterAnalyser);
    }
    return masterAnalyser;
  }

  // ---- Create reverb impulse response ----
  function createReverbImpulse(ctx, duration, decay) {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  // ---- Deck Class ----
  class Deck {
    constructor(id) {
      this.id = id; // 'a' or 'b'
      this.buffer = null;
      this.source = null;
      this.isPlaying = false;
      this.isLooping = false;
      this.startTime = 0;
      this.pauseOffset = 0;
      this.playbackRate = 1.0;
      this.duration = 0;

      // Audio nodes (created lazily)
      this.gainNode = null;
      this.eqHi = null;
      this.eqMid = null;
      this.eqLo = null;
      this.filterNode = null;
      this.reverbGain = null;
      this.dryGain = null;
      this.convolver = null;
      this.analyser = null;

      this._initNodes();
      this._bindUI();
    }

    _initNodes() {
      const ctx = getAudioContext();

      // Gain
      this.gainNode = ctx.createGain();
      this.gainNode.gain.value = 0.8;

      // EQ: 3-band
      this.eqHi = ctx.createBiquadFilter();
      this.eqHi.type = 'highshelf';
      this.eqHi.frequency.value = 3200;
      this.eqHi.gain.value = 0;

      this.eqMid = ctx.createBiquadFilter();
      this.eqMid.type = 'peaking';
      this.eqMid.frequency.value = 1000;
      this.eqMid.Q.value = 0.5;
      this.eqMid.gain.value = 0;

      this.eqLo = ctx.createBiquadFilter();
      this.eqLo.type = 'lowshelf';
      this.eqLo.frequency.value = 320;
      this.eqLo.gain.value = 0;

      // Low-pass filter for filter sweep
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 20000;
      this.filterNode.Q.value = 1;

      // Reverb using convolver
      this.convolver = ctx.createConvolver();
      this.convolver.buffer = createReverbImpulse(ctx, 2, 3);

      this.dryGain = ctx.createGain();
      this.dryGain.gain.value = 1;

      this.reverbGain = ctx.createGain();
      this.reverbGain.gain.value = 0;

      // Analyser for waveform
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;

      // Chain: source -> eqLo -> eqMid -> eqHi -> filter -> split(dry/reverb) -> gain -> master
      this.eqLo.connect(this.eqMid);
      this.eqMid.connect(this.eqHi);
      this.eqHi.connect(this.filterNode);

      // Dry path
      this.filterNode.connect(this.dryGain);
      this.dryGain.connect(this.gainNode);

      // Reverb path
      this.filterNode.connect(this.convolver);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.gainNode);

      this.gainNode.connect(this.analyser);
      this.analyser.connect(getMasterGain());
    }

    _bindUI() {
      const id = this.id;

      // Drop zone
      const dropZone = document.getElementById('drop-' + id);
      const fileInput = document.getElementById('file-' + id);

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.loadFile(e.target.files[0]);
        }
      });

      // Transport
      document.getElementById('play-' + id).addEventListener('click', () => this.togglePlay());
      document.getElementById('stop-' + id).addEventListener('click', () => this.stop());
      document.getElementById('loop-' + id).addEventListener('click', () => this.toggleLoop());

      // Volume
      document.getElementById('vol-' + id).addEventListener('input', (e) => {
        this.gainNode.gain.value = parseFloat(e.target.value);
        this._applyCrossfade();
      });

      // Speed
      document.getElementById('speed-' + id).addEventListener('input', (e) => {
        this.playbackRate = parseFloat(e.target.value);
        document.getElementById('speed-display-' + id).textContent = this.playbackRate.toFixed(2) + 'x';
        if (this.source) {
          this.source.playbackRate.value = this.playbackRate;
        }
      });

      // EQ
      document.getElementById('hi-' + id).addEventListener('input', (e) => {
        this.eqHi.gain.value = parseFloat(e.target.value);
        document.getElementById('hi-val-' + id).textContent = e.target.value;
      });
      document.getElementById('mid-' + id).addEventListener('input', (e) => {
        this.eqMid.gain.value = parseFloat(e.target.value);
        document.getElementById('mid-val-' + id).textContent = e.target.value;
      });
      document.getElementById('lo-' + id).addEventListener('input', (e) => {
        this.eqLo.gain.value = parseFloat(e.target.value);
        document.getElementById('lo-val-' + id).textContent = e.target.value;
      });

      // Filter
      document.getElementById('filter-' + id).addEventListener('input', (e) => {
        this.filterNode.frequency.value = parseFloat(e.target.value);
      });

      // Reverb
      document.getElementById('reverb-' + id).addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.reverbGain.gain.value = val;
        this.dryGain.gain.value = 1 - val * 0.5;
      });

      // Seek
      document.getElementById('seek-' + id).addEventListener('input', (e) => {
        if (!this.buffer) return;
        const seekTo = (parseFloat(e.target.value) / 100) * this.duration;
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this._stopSource();
        this.pauseOffset = seekTo;
        if (wasPlaying) this._startSource();
      });
    }

    loadFile(file) {
      const ctx = getAudioContext();
      const reader = new FileReader();

      const dropZone = document.getElementById('drop-' + this.id);
      dropZone.querySelector('p').textContent = 'Loading...';

      reader.onload = (e) => {
        ctx.decodeAudioData(e.target.result, (decoded) => {
          this.buffer = decoded;
          this.duration = decoded.duration;
          this.pauseOffset = 0;

          // Update UI
          const name = file.name.replace(/\.[^/.]+$/, '');
          document.getElementById('name-' + this.id).textContent = name;
          dropZone.querySelector('p').textContent = name;
          dropZone.classList.add('loaded');

          // Enable buttons
          document.getElementById('play-' + this.id).disabled = false;
          document.getElementById('stop-' + this.id).disabled = false;
          document.getElementById('loop-' + this.id).disabled = false;
          document.getElementById('seek-' + this.id).disabled = false;

          // Draw static waveform
          this._drawStaticWaveform();
        }, () => {
          dropZone.querySelector('p').textContent = 'Error decoding file. Try another.';
        });
      };

      reader.readAsArrayBuffer(file);
    }

    _drawStaticWaveform() {
      const canvas = document.getElementById('waveform-' + this.id);
      const ctx2d = canvas.getContext('2d');
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = 160;

      const data = this.buffer.getChannelData(0);
      const step = Math.ceil(data.length / w);

      ctx2d.clearRect(0, 0, w, h);
      ctx2d.fillStyle = '#0a0a14';
      ctx2d.fillRect(0, 0, w, h);

      const color = this.id === 'a' ? '#00d4ff' : '#ff2d95';
      ctx2d.strokeStyle = color;
      ctx2d.globalAlpha = 0.6;
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();

      for (let i = 0; i < w; i++) {
        let min = 1.0, max = -1.0;
        for (let j = 0; j < step; j++) {
          const val = data[i * step + j] || 0;
          if (val < min) min = val;
          if (val > max) max = val;
        }
        const yMin = ((1 + min) / 2) * h;
        const yMax = ((1 + max) / 2) * h;
        ctx2d.moveTo(i, yMin);
        ctx2d.lineTo(i, yMax);
      }

      ctx2d.stroke();
      ctx2d.globalAlpha = 1;
    }

    _startSource() {
      const ctx = getAudioContext();
      this.source = ctx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.loop = this.isLooping;
      this.source.playbackRate.value = this.playbackRate;
      this.source.connect(this.eqLo);

      this.source.onended = () => {
        if (this.isPlaying && !this.isLooping) {
          this.isPlaying = false;
          this.pauseOffset = 0;
          this._updatePlayButton();
        }
      };

      this.source.start(0, this.pauseOffset);
      this.startTime = ctx.currentTime - this.pauseOffset;
      this.isPlaying = true;
    }

    _stopSource() {
      if (this.source) {
        this.source.onended = null;
        try { this.source.stop(); } catch (_) {}
        this.source.disconnect();
        this.source = null;
      }
    }

    togglePlay() {
      getAudioContext(); // ensure resumed
      if (!this.buffer) return;

      if (this.isPlaying) {
        // Pause
        this.pauseOffset = this._getCurrentTime();
        this._stopSource();
        this.isPlaying = false;
      } else {
        // Play
        this._startSource();
      }
      this._updatePlayButton();
    }

    stop() {
      this._stopSource();
      this.isPlaying = false;
      this.pauseOffset = 0;
      this._updatePlayButton();
      document.getElementById('seek-' + this.id).value = 0;
      this._updateTimeDisplay(0);
    }

    toggleLoop() {
      this.isLooping = !this.isLooping;
      if (this.source) {
        this.source.loop = this.isLooping;
      }
      const btn = document.getElementById('loop-' + this.id);
      btn.classList.toggle('active', this.isLooping);
    }

    _getCurrentTime() {
      if (!this.isPlaying) return this.pauseOffset;
      const ctx = getAudioContext();
      let t = (ctx.currentTime - this.startTime) * this.playbackRate;
      if (this.isLooping && this.duration > 0) {
        t = t % this.duration;
      }
      return Math.min(t, this.duration);
    }

    _updatePlayButton() {
      const btn = document.getElementById('play-' + this.id);
      if (this.isPlaying) {
        btn.innerHTML = '&#10074;&#10074;';
        btn.classList.add('playing');
      } else {
        btn.innerHTML = '&#9654;';
        btn.classList.remove('playing');
      }
    }

    _updateTimeDisplay(currentTime) {
      const fmt = (s) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
      };
      document.getElementById('time-' + this.id).textContent =
        fmt(currentTime) + ' / ' + fmt(this.duration);
    }

    _applyCrossfade() {
      // Called from crossfader update
    }

    update() {
      if (!this.buffer) return;

      const currentTime = this._getCurrentTime();
      this._updateTimeDisplay(currentTime);

      // Update seek bar
      if (this.duration > 0) {
        const seekBar = document.getElementById('seek-' + this.id);
        if (document.activeElement !== seekBar) {
          seekBar.value = (currentTime / this.duration) * 100;
        }
      }

      // Draw playhead on waveform
      this._drawPlayhead(currentTime);
    }

    _drawPlayhead(currentTime) {
      const canvas = document.getElementById('waveform-' + this.id);
      const ctx2d = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      // Redraw waveform
      this._drawStaticWaveform();

      if (this.duration <= 0) return;

      // Draw playhead line
      const x = (currentTime / this.duration) * w;
      ctx2d.strokeStyle = '#fff';
      ctx2d.lineWidth = 2;
      ctx2d.globalAlpha = 0.8;
      ctx2d.beginPath();
      ctx2d.moveTo(x, 0);
      ctx2d.lineTo(x, h);
      ctx2d.stroke();
      ctx2d.globalAlpha = 1;

      // Dim the already-played portion
      const color = this.id === 'a' ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255, 45, 149, 0.08)';
      ctx2d.fillStyle = color;
      ctx2d.fillRect(0, 0, x, h);
    }
  }

  // ---- Initialize Decks ----
  const deckA = new Deck('a');
  const deckB = new Deck('b');

  // ---- Master Volume ----
  document.getElementById('master-volume').addEventListener('input', (e) => {
    getMasterGain().gain.value = parseFloat(e.target.value);
  });

  // ---- Crossfader ----
  const crossfader = document.getElementById('crossfader');
  crossfader.addEventListener('input', () => {
    applyCrossfade();
  });

  function applyCrossfade() {
    const val = parseFloat(crossfader.value);
    // Equal power crossfade
    const gainA = Math.cos(val * Math.PI / 2);
    const gainB = Math.sin(val * Math.PI / 2);

    const volA = parseFloat(document.getElementById('vol-a').value);
    const volB = parseFloat(document.getElementById('vol-b').value);

    deckA.gainNode.gain.value = volA * gainA;
    deckB.gainNode.gain.value = volB * gainB;
  }

  // Initial crossfade
  applyCrossfade();

  // Re-apply crossfade when individual volumes change
  document.getElementById('vol-a').addEventListener('input', applyCrossfade);
  document.getElementById('vol-b').addEventListener('input', applyCrossfade);

  // ---- Sync Speed ----
  document.getElementById('sync-btn').addEventListener('click', () => {
    // Match Deck B's speed to Deck A's speed
    const speedA = deckA.playbackRate;
    deckB.playbackRate = speedA;
    document.getElementById('speed-b').value = speedA;
    document.getElementById('speed-display-b').textContent = speedA.toFixed(2) + 'x';
    if (deckB.source) {
      deckB.source.playbackRate.value = speedA;
    }
  });

  // ---- Visualizer ----
  function drawVisualizer() {
    const canvas = document.getElementById('visualizer');
    const ctx2d = canvas.getContext('2d');
    const w = canvas.width = 200;
    const h = canvas.height = 200;

    const analyser = getMasterAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx2d.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const barCount = 64;
      const angleStep = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i] || 0;
        const barHeight = (val / 255) * 60 + 2;
        const angle = i * angleStep - Math.PI / 2;

        const innerR = 30;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + barHeight);
        const y2 = cy + Math.sin(angle) * (innerR + barHeight);

        // Gradient from deck A color to deck B color
        const ratio = i / barCount;
        const r = Math.round(0 + ratio * 255);
        const g = Math.round(212 - ratio * 167);
        const b = Math.round(255 - ratio * 106);

        ctx2d.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx2d.lineWidth = 2.5;
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.stroke();
      }
    }

    draw();
  }

  // ---- Animation Loop ----
  function tick() {
    requestAnimationFrame(tick);
    deckA.update();
    deckB.update();
  }

  // ---- Start ----
  // Wait for first user interaction to start audio context
  function initOnInteraction() {
    getAudioContext();
    getMasterAnalyser();
    drawVisualizer();
    tick();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  }

  document.addEventListener('click', initOnInteraction);
  document.addEventListener('keydown', initOnInteraction);

  // Also start tick for UI updates even before interaction
  tick();

  // ---- Keyboard shortcuts ----
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    switch (e.key.toLowerCase()) {
      case 'q': deckA.togglePlay(); break;
      case 'w': deckA.stop(); break;
      case 'p': deckB.togglePlay(); break;
      case 'o': deckB.stop(); break;
    }
  });

})();
