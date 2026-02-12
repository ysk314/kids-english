function noOp() {}

function resolveAssetUrl(pathname) {
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const viteBase = import.meta.env?.BASE_URL;
  if (typeof viteBase === "string" && viteBase.length > 0) {
    const normalizedBase = viteBase.endsWith("/") ? viteBase : `${viteBase}/`;
    return new URL(`${normalizedBase}${normalizedPath}`, window.location.href).toString();
  }
  return new URL(normalizedPath, window.location.href).toString();
}

export class Week5AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.correctAudio = null;
    this.wrongAudio = null;
    this.endRollAudio = null;
    this.endCymbalAudio = null;
    this.endFanfareTimer = null;
    this.enabled = false;
    this.bgmEnabled = true;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.metroTimer = null;
    this.metroBeat = 0;
    this.activeBpm = null;
    this.beatListeners = new Set();
  }

  async unlock() {
    if (this.enabled) {
      return true;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return false;
    }

    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.32;
    this.masterGain.connect(this.context.destination);

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.enabled = true;
    this.setupExternalClips();
    if (this.bgmEnabled) {
      this.startBgm();
    }

    return true;
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = enabled;
    if (!this.enabled) {
      return;
    }
    if (enabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  setMetronome(bpm) {
    if (!this.enabled) {
      this.activeBpm = bpm;
      return;
    }

    if (!bpm) {
      this.stopMetronome();
      this.activeBpm = null;
      return;
    }

    if (this.activeBpm === bpm && this.metroTimer) {
      return;
    }

    this.stopMetronome();
    this.activeBpm = bpm;
    const intervalMs = Math.max(30, Math.floor(60_000 / bpm / 4));
    this.metroBeat = 0;
    this.metroTimer = window.setInterval(() => {
      const step16 = this.metroBeat % 16;
      this.playDrumPatternStep(step16);
      this.emitBeat(step16, bpm);
      this.metroBeat += 1;
    }, intervalMs);
  }

  stopMetronome() {
    if (this.metroTimer) {
      window.clearInterval(this.metroTimer);
      this.metroTimer = null;
    }
  }

  onBeat(handler) {
    this.beatListeners.add(handler);
    return () => this.beatListeners.delete(handler);
  }

  emitBeat(step16, bpm) {
    this.beatListeners.forEach((handler) => {
      try {
        handler({
          step16,
          bpm,
          at: Date.now()
        });
      } catch {
        // no-op
      }
    });
  }

  playNavigate() {
    if (!this.enabled) {
      return;
    }
    this.playTone(760, 0.08, 0.01, "triangle", 0.06);
  }

  playPoint(team) {
    if (!this.enabled) {
      return;
    }

    if (team === "student") {
      this.playTone(880, 0.08, 0.008, "square", 0.08);
      window.setTimeout(() => this.playTone(1240, 0.09, 0.008, "triangle", 0.08), 65);
      window.setTimeout(() => this.playTone(1560, 0.11, 0.008, "sine", 0.06), 135);
      return;
    }

    this.playTone(520, 0.08, 0.008, "square", 0.08);
    window.setTimeout(() => this.playTone(740, 0.09, 0.008, "triangle", 0.08), 65);
    window.setTimeout(() => this.playTone(980, 0.11, 0.008, "sine", 0.06), 135);
  }

  playCorrect() {
    if (!this.enabled) {
      return;
    }
    this.playClip(this.correctAudio);
  }

  playIncorrect() {
    if (!this.enabled) {
      return;
    }
    this.playClip(this.wrongAudio);
  }

  playToggle() {
    if (!this.enabled) {
      return;
    }
    this.playTone(840, 0.06, 0.01, "square", 0.05);
  }

  playEndFanfare() {
    if (!this.enabled) {
      return;
    }
    this.setupEndClips();
    if (!this.endRollAudio || !this.endCymbalAudio) {
      return;
    }

    if (this.endFanfareTimer) {
      window.clearTimeout(this.endFanfareTimer);
      this.endFanfareTimer = null;
    }

    try {
      this.endRollAudio.currentTime = 0;
      const rollPromise = this.endRollAudio.play();
      if (rollPromise && typeof rollPromise.catch === "function") {
        rollPromise.catch(() => {});
      }
    } catch {
      // no-op
    }

    this.endFanfareTimer = window.setTimeout(() => {
      if (this.endRollAudio) {
        this.endRollAudio.pause();
      }
      if (this.endCymbalAudio) {
        try {
          this.endCymbalAudio.currentTime = 0;
          const cymbalPromise = this.endCymbalAudio.play();
          if (cymbalPromise && typeof cymbalPromise.catch === "function") {
            cymbalPromise.catch(() => {});
          }
        } catch {
          // no-op
        }
      }
      this.endFanfareTimer = null;
    }, 1300);
  }

  startBgm() {
    if (!this.enabled || this.bgmTimer) {
      return;
    }
    const notes = [261.63, 329.63, 392.0, 329.63, 293.66, 369.99, 440.0, 369.99];
    this.bgmStep = 0;
    this.bgmTimer = window.setInterval(() => {
      const note = notes[this.bgmStep % notes.length];
      this.playTone(note, 0.2, 0.03, "triangle", 0.035);
      this.bgmStep += 1;
    }, 420);
  }

  stopBgm() {
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playTone(frequency, duration, attack, type, gainValue) {
    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.03);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  playDrumPatternStep(step16) {
    const kick = step16 === 0 || step16 === 8;
    const snare = step16 === 4 || step16 === 12;
    const hat = step16 % 2 === 0;

    if (kick) {
      this.playKick();
    }
    if (snare) {
      this.playSnare();
    }
    if (hat) {
      this.playHat();
    }
  }

  playKick() {
    if (!this.context || !this.masterGain) {
      return;
    }
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(46, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playSnare() {
    if (!this.context || !this.masterGain) {
      return;
    }
    const now = this.context.currentTime;
    this.playNoiseBurst(0.095, 0.16, 1500);
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.11);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playHat() {
    this.playNoiseBurst(0.03, 0.06, 6400);
  }

  playBuzz(frequency, duration, gainValue) {
    if (!this.context || !this.masterGain) {
      return;
    }
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoiseBurst(duration, gainValue, highpassFreq) {
    if (!this.context || !this.masterGain) {
      return;
    }
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    source.buffer = this.ensureNoiseBuffer();
    const filter = this.context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(highpassFreq, now);
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);
    source.stop(now + duration + 0.01);
  }

  ensureNoiseBuffer() {
    if (this.noiseBuffer || !this.context) {
      return this.noiseBuffer;
    }
    const length = this.context.sampleRate * 0.22;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return this.noiseBuffer;
  }

  setupExternalClips() {
    if (this.correctAudio && this.wrongAudio) {
      return;
    }

    this.correctAudio = new Audio(resolveAssetUrl("mockup/assets/audio/correct.mp3"));
    this.correctAudio.preload = "auto";

    this.wrongAudio = new Audio(resolveAssetUrl("mockup/assets/audio/wrong.mp3"));
    this.wrongAudio.preload = "auto";
  }

  setupEndClips() {
    if (this.endRollAudio && this.endCymbalAudio) {
      return;
    }
    this.endRollAudio = new Audio(resolveAssetUrl("mockup/assets/audio/end_drum_roll.mp3"));
    this.endRollAudio.preload = "auto";
    this.endCymbalAudio = new Audio(resolveAssetUrl("mockup/assets/audio/end_cymbal.mp3"));
    this.endCymbalAudio.preload = "auto";
  }

  playClip(audio) {
    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch (_error) {
      // no-op
    }
  }

  destroy() {
    this.stopBgm();
    this.stopMetronome();
    if (this.endFanfareTimer) {
      window.clearTimeout(this.endFanfareTimer);
      this.endFanfareTimer = null;
    }
    if (this.endRollAudio) {
      this.endRollAudio.pause();
    }
    if (this.endCymbalAudio) {
      this.endCymbalAudio.pause();
    }

    if (this.context) {
      this.context.close().catch(noOp);
      this.context = null;
    }

    this.masterGain = null;
    this.noiseBuffer = null;
    this.correctAudio = null;
    this.wrongAudio = null;
    this.endRollAudio = null;
    this.endCymbalAudio = null;
    this.beatListeners.clear();
    this.enabled = false;
  }
}
