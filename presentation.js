(() => {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const body = document.body;
  const film = document.querySelector("#film");
  const notesPanel = document.querySelector("#notes-panel");
  const notesContent = document.querySelector("#notes-content");
  const referencePanel = document.querySelector("#reference-panel");
  const helpPanel = document.querySelector("#help-panel");
  const sceneIndicator = document.querySelector("#scene-indicator");
  const projectorStatus = document.querySelector("#projector-status");
  const panels = [notesPanel, referencePanel, helpPanel].filter(Boolean);

  const presentationState = {
    index: 0,
    build: 0,
    started: false,
    leaderComplete: false,
    leaderTimer: null,
    chromeTimer: null,
    transitionTimer: null,
    clericalTimers: [],
    clericalCounterTimer: null,
    touchStartX: 0,
    touchStartY: 0,
    touchHandledUntil: 0,
  };

  class ProjectorSound {
    constructor() {
      this.context = null;
      this.master = null;
      this.bedGain = null;
      this.noiseSource = null;
      this.motorOscillator = null;
      this.chapterBuses = new Map();
      this.chapterSources = [];
      this.scoreDry = null;
      this.scoreReverb = null;
      this.rhythm = null;
      this.currentSceneIndex = 0;
      this.currentBuildIndex = 0;
      this.muted = this.readMutedState();
    }

    readMutedState() {
      try {
        return sessionStorage.getItem("symbiosis-muted") === "true";
      } catch {
        return false;
      }
    }

    persistMutedState() {
      try {
        sessionStorage.setItem("symbiosis-muted", String(this.muted));
      } catch {
        // Session storage is optional for a local presentation.
      }
    }

    createContext() {
      if (this.context) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0.0001 : 0.72;
      this.master.connect(this.context.destination);
      return true;
    }

    async arm({ leader = false } = {}) {
      if (!this.createContext()) return;
      if (this.context.state === "suspended") await this.context.resume();
      this.startProjectorBed();
      this.setNarrativeState(this.currentSceneIndex, this.currentBuildIndex, { immediate: true });
      if (leader) this.playLeaderTrack();
    }

    startProjectorBed() {
      if (!this.context || this.noiseSource) return;
      const length = this.context.sampleRate * 2;
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) {
        const flutter = Math.sin((index / this.context.sampleRate) * Math.PI * 2 * 11) * 0.08;
        channel[index] = (Math.random() * 2 - 1) * (0.34 + flutter);
      }

      const noiseSource = this.context.createBufferSource();
      const noiseFilter = this.context.createBiquadFilter();
      const bedGain = this.context.createGain();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1250;
      noiseFilter.Q.value = 0.45;
      bedGain.gain.value = 0.012;
      noiseSource.connect(noiseFilter).connect(bedGain).connect(this.master);

      const motorOscillator = this.context.createOscillator();
      const motorGain = this.context.createGain();
      motorOscillator.type = "triangle";
      motorOscillator.frequency.value = 46;
      motorGain.gain.value = 0.008;
      motorOscillator.connect(motorGain).connect(this.master);

      noiseSource.start();
      motorOscillator.start();
      this.noiseSource = noiseSource;
      this.motorOscillator = motorOscillator;
      this.bedGain = bedGain;
      this.startChapterBeds();
    }

    startChapterBeds() {
      if (!this.context || this.chapterBuses.size) return;
      const dry = this.context.createGain();
      const convolver = this.context.createConvolver();
      const wet = this.context.createGain();
      dry.gain.value = 0.9;
      wet.gain.value = 0.13;
      convolver.buffer = this.createReverbImpulse(1.65, 2.7);
      dry.connect(this.master);
      convolver.connect(wet).connect(this.master);
      this.scoreDry = dry;
      this.scoreReverb = convolver;

      const beds = {
        organic: { frequencies: [174.61, 261.63], type: "sine", level: 0.01 },
        clerical: { frequencies: [55, 110, 164.81], type: "triangle", level: 0.012 },
        product: { frequencies: [98, 146.83, 196], type: "sine", level: 0.01 },
        prerequisites: { frequencies: [73.42, 110, 164.81, 220, 329.63], type: "triangle", level: 0.012 },
        relation: { frequencies: [82.41, 123.47, 164.81], type: "sine", level: 0.01 },
        coda: { frequencies: [130.81, 196, 261.63, 329.63], type: "sine", level: 0.012 },
      };

      Object.entries(beds).forEach(([name, definition]) => {
        const bus = this.context.createGain();
        const send = this.context.createGain();
        const voices = [];
        bus.gain.value = 0.0001;
        send.gain.value = name === "clerical" ? 0.22 : 0.5;
        bus.connect(dry);
        bus.connect(send).connect(convolver);
        definition.frequencies.forEach((frequency, index) => {
          const oscillator = this.context.createOscillator();
          const voiceGain = this.context.createGain();
          const panner = typeof this.context.createStereoPanner === "function" ? this.context.createStereoPanner() : null;
          oscillator.type = definition.type;
          oscillator.frequency.value = frequency;
          oscillator.detune.value = index % 2 ? 3 : -3;
          voiceGain.gain.value = 1 / definition.frequencies.length;
          if (panner) {
            panner.pan.value = definition.frequencies.length === 1 ? 0 : -0.28 + (0.56 * index) / (definition.frequencies.length - 1);
            oscillator.connect(voiceGain).connect(panner).connect(bus);
          } else {
            oscillator.connect(voiceGain).connect(bus);
          }
          oscillator.start();
          voices.push({ gain: voiceGain, weight: 1 / definition.frequencies.length });
          this.chapterSources.push(oscillator);
        });
        this.chapterBuses.set(name, { bus, level: definition.level, voices });
      });

      this.startNarrativePulse(dry);
    }

    createReverbImpulse(seconds, decay) {
      const length = Math.max(1, Math.floor(this.context.sampleRate * seconds));
      const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
      for (let channelIndex = 0; channelIndex < impulse.numberOfChannels; channelIndex += 1) {
        const channel = impulse.getChannelData(channelIndex);
        for (let index = 0; index < length; index += 1) {
          const envelope = Math.pow(1 - index / length, decay);
          channel[index] = (Math.random() * 2 - 1) * envelope;
        }
      }
      return impulse;
    }

    startNarrativePulse(destination) {
      if (!this.context || this.rhythm) return;
      const carrier = this.context.createOscillator();
      const filter = this.context.createBiquadFilter();
      const pulseGain = this.context.createGain();
      const bus = this.context.createGain();
      const lfo = this.context.createOscillator();
      const lfoDepth = this.context.createGain();
      carrier.type = "triangle";
      carrier.frequency.value = 55;
      filter.type = "lowpass";
      filter.frequency.value = 150;
      filter.Q.value = 0.8;
      pulseGain.gain.value = 0.5;
      bus.gain.value = 0.0001;
      lfo.type = "sine";
      lfo.frequency.value = 0.72;
      lfoDepth.gain.value = 0.49;
      carrier.connect(filter).connect(pulseGain).connect(bus).connect(destination);
      lfo.connect(lfoDepth).connect(pulseGain.gain);
      carrier.start();
      lfo.start();
      this.chapterSources.push(carrier, lfo);
      this.rhythm = { carrier, filter, bus, lfo };
    }

    scoreProfile(index, build) {
      const levels = { organic: 0, clerical: 0, product: 0, prerequisites: 0, relation: 0, coda: 0 };
      const profile = {
        levels,
        prerequisiteLayers: 5,
        pulse: { level: 0, rate: 0.7, frequency: 55, filter: 150 },
        projector: 0.008,
        fade: 0.45,
      };
      const boundedBuild = Math.max(0, Number(build) || 0);

      if (index === 0) profile.projector = 0.012;
      if (index === 1) levels.organic = 0.34;
      if (index === 2) levels.organic = 0.52;
      if (index === 3) {
        levels.organic = boundedBuild >= 3 ? 0 : 0.66;
        profile.projector = boundedBuild >= 3 ? 0.00035 : 0.006;
        profile.fade = boundedBuild >= 3 ? 0.055 : 0.5;
      }
      if (index === 4) {
        levels.organic = 0.08;
        levels.coda = 0.16;
        profile.projector = 0.002;
        profile.fade = 0.14;
      }
      if (index === 5) {
        levels.clerical = 0.34 + Math.min(boundedBuild, 6) * 0.045;
        profile.pulse = { level: 0.2 + Math.min(boundedBuild, 6) * 0.035, rate: 0.78 + boundedBuild * 0.06, frequency: 55, filter: 130 };
        profile.projector = 0.021;
      }
      if (index === 6) {
        levels.clerical = 0.04;
        profile.projector = 0.0008;
        profile.fade = 0.09;
      }
      if (index === 7) levels.relation = 0.18;
      if (index === 8) {
        levels.clerical = 0.2;
        profile.pulse.level = 0.08;
      }
      if (index === 9) {
        levels.clerical = 0.31;
        profile.pulse = { level: 0.15, rate: 0.82, frequency: 55, filter: 145 };
      }
      if (index === 10) {
        levels.clerical = 0.46;
        profile.pulse = { level: 0.25, rate: 0.92, frequency: 55, filter: 155 };
      }
      if (index === 11) {
        levels.clerical = 0.58;
        profile.pulse = { level: 0.36, rate: 1.02, frequency: 55, filter: 165 };
      }
      if (index === 12) {
        levels.clerical = Math.min(1, 0.62 + boundedBuild * 0.065);
        profile.pulse = { level: Math.min(0.86, 0.4 + boundedBuild * 0.075), rate: 1.08 + boundedBuild * 0.1, frequency: 55 + boundedBuild * 1.5, filter: 170 + boundedBuild * 10 };
      }
      if (index === 13) {
        levels.clerical = 0.72;
        levels.coda = 0.12;
        profile.pulse = { level: 0.2, rate: 0.7, frequency: 55, filter: 145 };
      }
      if (index === 14) {
        levels.clerical = 0.1;
        levels.coda = 0.1;
        profile.projector = 0.001;
        profile.fade = 0.12;
      }
      if (index === 15) {
        levels.product = 0.42;
        profile.pulse = { level: 0.16, rate: 0.88, frequency: 49, filter: 155 };
      }
      if (index === 16) {
        levels.product = Math.min(0.82, 0.46 + boundedBuild * 0.065);
        profile.pulse = { level: Math.min(0.62, 0.18 + boundedBuild * 0.06), rate: 0.9 + boundedBuild * 0.055, frequency: 49, filter: 165 };
      }
      if (index === 17) {
        levels.product = 0.76;
        profile.pulse = { level: 0.44, rate: 1.1, frequency: 49, filter: 180 };
      }
      if (index === 18) {
        levels.product = 0.22;
        profile.projector = 0.003;
        profile.fade = 0.2;
      }
      if (index === 19) {
        profile.projector = 0.00055;
        profile.fade = 0.055;
      }
      if (index >= 20 && index <= 25) {
        const prerequisiteStep = index - 19;
        levels.prerequisites = 0.17 + prerequisiteStep * 0.12;
        profile.prerequisiteLayers = Math.min(5, prerequisiteStep);
        profile.pulse = { level: 0.06 + prerequisiteStep * 0.065, rate: 0.58 + prerequisiteStep * 0.09, frequency: 55, filter: 135 + prerequisiteStep * 12 };
      }
      if (index === 25 && boundedBuild >= 4) {
        levels.prerequisites = 0.16;
        levels.relation = 0.18;
        profile.pulse.level = 0;
        profile.projector = 0.001;
        profile.fade = 0.1;
      }
      if (index === 26) {
        levels.relation = 0.46;
        levels.organic = 0.08;
        profile.pulse = { level: 0.14, rate: 0.72, frequency: 55, filter: 150 };
      }
      if (index === 27) {
        levels.relation = 0.16;
        profile.projector = 0.0015;
        profile.fade = 0.18;
      }
      if (index === 28) {
        if (boundedBuild >= 4) {
          levels.relation = 0.72;
          levels.product = 0.18;
          levels.organic = 0.12;
          levels.coda = 0.14;
          profile.pulse = { level: 0.04, rate: 0.55, frequency: 55, filter: 130 };
        } else {
          levels.relation = 0.34 + boundedBuild * 0.13;
          levels.product = 0.08 + boundedBuild * 0.05;
          levels.organic = 0.05 + boundedBuild * 0.025;
          profile.pulse = { level: 0.12 + boundedBuild * 0.09, rate: 0.72 + boundedBuild * 0.1, frequency: 55, filter: 145 + boundedBuild * 12 };
        }
      }
      if (index === 29) {
        levels.coda = 0.34 + Math.min(boundedBuild, 2) * 0.16;
        levels.relation = 0.08;
        profile.pulse = boundedBuild >= 2 ? { level: 0, rate: 0.5, frequency: 55, filter: 130 } : { level: 0.08, rate: 0.48, frequency: 55, filter: 130 };
        profile.projector = 0.0008;
        profile.fade = 0.75;
      }
      if (index === 30) {
        levels.organic = 0.22 + Math.min(boundedBuild, 2) * 0.1;
        levels.coda = 0.3 + Math.min(boundedBuild, 2) * 0.22;
        levels.relation = 0.07 + Math.min(boundedBuild, 2) * 0.055;
        levels.product = boundedBuild >= 2 ? 0.1 : 0.04;
        profile.pulse = boundedBuild === 1 ? { level: 0.06, rate: 0.42, frequency: 49, filter: 125 } : { level: 0, rate: 0.42, frequency: 49, filter: 125 };
        profile.projector = 0.00075;
        profile.fade = 0.9;
      }
      if (index === 31) {
        const remaining = Math.max(0, 1 - boundedBuild * 0.24);
        levels.coda = 0.24 * remaining;
        levels.organic = 0.08 * remaining;
        profile.projector = Math.max(0.00015, 0.0008 * remaining);
        profile.fade = 0.65;
      }
      return profile;
    }

    setNarrativeState(index, build, { immediate = false } = {}) {
      this.currentSceneIndex = Number(index) || 0;
      this.currentBuildIndex = Number(build) || 0;
      if (!this.context || !this.bedGain) return;
      const profile = this.scoreProfile(this.currentSceneIndex, this.currentBuildIndex);
      const now = this.context.currentTime;
      const fade = immediate ? 0.01 : profile.fade;
      this.bedGain.gain.cancelScheduledValues(now);
      this.bedGain.gain.setTargetAtTime(Math.max(0.0001, profile.projector), now, Math.max(0.01, fade * 0.35));
      this.chapterBuses.forEach(({ bus, level, voices }, name) => {
        const intensity = profile.levels[name] || 0;
        bus.gain.cancelScheduledValues(now);
        bus.gain.setTargetAtTime(Math.max(0.0001, level * intensity), now, Math.max(0.01, fade));
        if (name === "prerequisites") {
          voices.forEach((voice, voiceIndex) => {
            voice.gain.gain.cancelScheduledValues(now);
            const target = voiceIndex < profile.prerequisiteLayers ? voice.weight : 0.0001;
            voice.gain.gain.setTargetAtTime(target, now, Math.max(0.01, fade * 0.8));
          });
        }
      });
      if (this.rhythm) {
        this.rhythm.bus.gain.cancelScheduledValues(now);
        this.rhythm.bus.gain.setTargetAtTime(Math.max(0.0001, 0.018 * profile.pulse.level), now, Math.max(0.01, fade * 0.65));
        this.rhythm.lfo.frequency.cancelScheduledValues(now);
        this.rhythm.lfo.frequency.setTargetAtTime(profile.pulse.rate, now, Math.max(0.01, fade));
        this.rhythm.carrier.frequency.cancelScheduledValues(now);
        this.rhythm.carrier.frequency.setTargetAtTime(profile.pulse.frequency, now, Math.max(0.01, fade));
        this.rhythm.filter.frequency.cancelScheduledValues(now);
        this.rhythm.filter.frequency.setTargetAtTime(profile.pulse.filter, now, Math.max(0.01, fade));
      }
    }

    setScene(index, build = 0) {
      this.setNarrativeState(index, build);
    }

    setBuild(index, build) {
      this.setNarrativeState(index, build);
    }

    getDiagnostics() {
      const profile = this.scoreProfile(this.currentSceneIndex, this.currentBuildIndex);
      return {
        supported: Boolean(window.AudioContext || window.webkitAudioContext),
        contextState: this.context?.state || "unarmed",
        sceneIndex: this.currentSceneIndex,
        buildIndex: this.currentBuildIndex,
        projector: profile.projector,
        levels: { ...profile.levels },
        prerequisiteLayers: profile.prerequisiteLayers,
        pulse: { ...profile.pulse },
      };
    }

    playTone({ frequency = 620, duration = 0.08, gain = 0.055, delay = 0, type = "sine" } = {}) {
      if (!this.context || !this.master) return;
      const startTime = this.context.currentTime + delay;
      const oscillator = this.context.createOscillator();
      const toneGain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      toneGain.gain.setValueAtTime(0.0001, startTime);
      toneGain.gain.exponentialRampToValueAtTime(gain, startTime + 0.008);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(toneGain).connect(this.master);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.03);
    }

    playNoiseBurst({ duration = 0.08, gain = 0.08, delay = 0, filterType = "highpass", frequency = 900 } = {}) {
      if (!this.context || !this.master) return;
      const sampleCount = Math.max(1, Math.floor(this.context.sampleRate * duration));
      const buffer = this.context.createBuffer(1, sampleCount, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < sampleCount; index += 1) {
        data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
      }

      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const burstGain = this.context.createGain();
      source.buffer = buffer;
      filter.type = filterType;
      filter.frequency.value = frequency;
      burstGain.gain.value = gain;
      source.connect(filter).connect(burstGain).connect(this.master);
      source.start(this.context.currentTime + delay);
    }

    playFilmTransport() {
      if (!this.context) return;
      for (let index = 0; index < 8; index += 1) {
        this.playNoiseBurst({
          duration: 0.028,
          gain: 0.022 + (index % 3) * 0.004,
          delay: index * 0.105,
          filterType: "bandpass",
          frequency: 620 + index * 28,
        });
      }
      this.playTone({ frequency: 68, duration: 0.34, gain: 0.018, type: "triangle" });
      this.playTone({ frequency: 98, duration: 0.42, gain: 0.012, delay: 0.78, type: "sine" });
    }

    playLeaderTrack() {
      this.playNoiseBurst({ duration: 0.22, gain: 0.11, delay: 0.65 });
      this.playNoiseBurst({ duration: 0.05, gain: 0.1, delay: 0.95 });
      [3.35, 5.1, 6.85].forEach((delay, index) => {
        this.playTone({ frequency: 860 - index * 35, duration: 0.07, gain: 0.07, delay, type: "square" });
        this.playNoiseBurst({ duration: 0.035, gain: 0.08, delay: delay + 0.02 });
      });
    }

    cueScene(scene) {
      if (!this.context) return;
      if (scene === "scene-01" || scene === "scene-02") this.playNoiseBurst({ duration: 0.045, gain: 0.04 });
      if (scene === "scene-04" || scene === "scene-15") {
        this.playTone({ frequency: 196, duration: 0.55, gain: 0.025, type: "sine" });
        this.playTone({ frequency: 294, duration: 0.65, gain: 0.02, delay: 0.06, type: "sine" });
        this.playTone({ frequency: 392, duration: 0.75, gain: 0.016, delay: 0.12, type: "sine" });
      }
      if (scene === "scene-05") this.playTone({ frequency: 84, duration: 0.16, gain: 0.035, type: "square" });
      if (scene === "scene-06" && this.bedGain) this.bedGain.gain.setTargetAtTime(0.001, this.context.currentTime, 0.04);
      if (scene === "scene-19") this.playTone({ frequency: 72, duration: 0.3, gain: 0.04, type: "square" });
      if (scene === "scene-20" || scene === "scene-21") this.playTone({ frequency: 146, duration: 0.2, gain: 0.026, type: "triangle" });
      if (scene === "scene-26") {
        [164, 137, 196].forEach((frequency, index) => this.playTone({ frequency, duration: 0.18, gain: 0.022, delay: index * 0.08, type: "triangle" }));
      }
      if (scene === "scene-29") {
        this.playTone({ frequency: 130.81, duration: 0.8, gain: 0.018, type: "sine" });
        this.playTone({ frequency: 196, duration: 0.9, gain: 0.014, delay: 0.08, type: "sine" });
      }
      if (scene === "scene-30") {
        this.playTone({ frequency: 130.81, duration: 1.15, gain: 0.012, type: "sine" });
        this.playTone({ frequency: 196, duration: 1.3, gain: 0.009, delay: 0.08, type: "sine" });
      }
      if (scene === "scene-31" && this.bedGain) this.bedGain.gain.setTargetAtTime(0.0005, this.context.currentTime, 0.08);
    }

    cueBuild(scene, buildIndex) {
      if (!this.context) return;
      if (scene === "scene-12") {
        this.playTone({ frequency: 150 + buildIndex * 26, duration: buildIndex === 5 ? 0.18 : 0.045, gain: 0.035, type: "square" });
        this.playNoiseBurst({ duration: 0.025, gain: 0.03, delay: 0.025 });
        return;
      }
      if (scene === "scene-02") {
        this.playNoiseBurst({ duration: buildIndex === 1 ? 0.07 : 0.035, gain: 0.052 });
        this.playTone({ frequency: buildIndex === 1 ? 310 : 420, duration: 0.055, gain: 0.022, type: "triangle" });
        return;
      }
      if (scene === "scene-03") {
        if (buildIndex >= 3) return;
        this.playTone({ frequency: 174 + buildIndex * 28, duration: 0.16, gain: 0.024, type: "sine" });
        this.playTone({ frequency: 261 + buildIndex * 20, duration: 0.19, gain: 0.018, delay: 0.04, type: "sine" });
        return;
      }
      if (scene === "scene-14") {
        this.playNoiseBurst({ duration: 0.045, gain: 0.045 });
        return;
      }
      if (scene === "scene-28") {
        this.playNoiseBurst({ duration: 0.055, gain: 0.032, filterType: "bandpass", frequency: 740 });
        if (buildIndex < 4) {
          this.playTone({ frequency: 146.83 + buildIndex * 27.5, duration: 0.22, gain: 0.02, type: "triangle" });
          this.playTone({ frequency: 220 + buildIndex * 27.5, duration: 0.28, gain: 0.014, delay: 0.06, type: "sine" });
        } else {
          this.playTone({ frequency: 164.81, duration: 0.8, gain: 0.015, type: "sine" });
          this.playTone({ frequency: 246.94, duration: 0.9, gain: 0.011, delay: 0.08, type: "sine" });
        }
        return;
      }
      if (scene === "scene-15" || scene === "scene-16" || scene === "scene-17") {
        this.playTone({ frequency: 150 + buildIndex * 35, duration: 0.06, gain: 0.03, type: "triangle" });
        this.playNoiseBurst({ duration: 0.04, gain: 0.035 });
        return;
      }
      if (scene === "scene-19") {
        this.playNoiseBurst({ duration: buildIndex === 1 ? 0.12 : 0.05, gain: 0.06 });
        return;
      }
      if (scene === "scene-21") {
        this.playTone({ frequency: 92 + buildIndex * 24, duration: buildIndex === 4 ? 0.4 : 0.09, gain: 0.022, type: "triangle" });
        this.playNoiseBurst({ duration: 0.045, gain: 0.022, delay: 0.02, filterType: "bandpass", frequency: 680 });
        return;
      }
      if (scene === "scene-22" || scene === "scene-23" || scene === "scene-25" || scene === "scene-26") {
        this.playTone({ frequency: 120 + buildIndex * 32, duration: 0.08, gain: 0.025, type: "triangle" });
        return;
      }
      if (scene === "scene-29") {
        this.playTone({ frequency: buildIndex === 1 ? 164.81 : 261.63, duration: 0.55, gain: 0.018, type: "sine" });
        return;
      }
      if (scene === "scene-30") {
        this.playFilmTransport();
        if (buildIndex >= 2) {
          this.playTone({ frequency: 261.63, duration: 1.15, gain: 0.014, delay: 1.25, type: "sine" });
          this.playTone({ frequency: 329.63, duration: 1.35, gain: 0.01, delay: 1.34, type: "sine" });
        }
        return;
      }
      this.playNoiseBurst({ duration: 0.03, gain: 0.025 });
    }

    async toggle() {
      this.muted = !this.muted;
      this.persistMutedState();
      if (!this.createContext()) return this.muted;
      if (this.context.state === "suspended") await this.context.resume();
      this.startProjectorBed();
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.muted ? 0.0001 : 0.72, now, 0.04);
      return this.muted;
    }
  }

  const sound = new ProjectorSound();

  function formatScene(index) {
    return String(index).padStart(2, "0");
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function parseHash() {
    const match = window.location.hash.match(/^#scene-(\d{2})$/);
    if (!match) return 0;
    return clamp(Number(match[1]), 0, scenes.length - 1);
  }

  function parseOpening() {
    return new URLSearchParams(window.location.search).get("opening") === "mystery" ? "mystery" : "wonder";
  }

  function currentSceneId(index = presentationState.index) {
    return scenes[index]?.id || "";
  }

  function getMaxBuild(scene = scenes[presentationState.index]) {
    return Array.from(scene?.querySelectorAll("[data-build]") || []).reduce(
      (maximum, element) => Math.max(maximum, Number(element.dataset.build) || 0),
      0,
    );
  }

  function announce(message) {
    projectorStatus.textContent = "";
    window.requestAnimationFrame(() => {
      projectorStatus.textContent = message;
    });
  }

  function updateIndicator() {
    sceneIndicator.textContent = formatScene(presentationState.index) + " / " + formatScene(scenes.length - 1);
    sceneIndicator.setAttribute(
      "aria-label",
      "Scene " + presentationState.index + " of " + (scenes.length - 1) + ": " + scenes[presentationState.index].dataset.title,
    );
  }

  function updateBuilds() {
    const activeScene = scenes[presentationState.index];
    activeScene.querySelectorAll("[data-build]").forEach((element) => {
      const isVisible = Number(element.dataset.build) <= presentationState.build;
      element.classList.toggle("is-visible", isVisible);
      element.setAttribute("aria-hidden", String(!isVisible));
    });
  }

  function updateClericalCounter(buildIndex = presentationState.build) {
    const counter = document.querySelector("#clerical-counter");
    if (!counter) return;
    const milestones = [0, 47, 126, 238, 417, 862];
    counter.textContent = String(milestones[clamp(buildIndex, 0, milestones.length - 1)]).padStart(4, "0");
  }

  function clearClericalSequence() {
    presentationState.clericalTimers.forEach((timer) => window.clearTimeout(timer));
    presentationState.clericalTimers = [];
    window.clearInterval(presentationState.clericalCounterTimer);
    presentationState.clericalCounterTimer = null;
  }

  function startClericalSequence() {
    clearClericalSequence();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepDuration = reducedMotion ? 90 : 2650;
    const counter = document.querySelector("#clerical-counter");
    const startTime = performance.now();
    const totalDuration = stepDuration * 4;
    if (counter) {
      presentationState.clericalCounterTimer = window.setInterval(() => {
        const progress = clamp((performance.now() - startTime) / totalDuration, 0, 1);
        counter.textContent = String(Math.round(862 * progress)).padStart(4, "0");
        if (progress >= 1) {
          window.clearInterval(presentationState.clericalCounterTimer);
          presentationState.clericalCounterTimer = null;
        }
      }, reducedMotion ? 20 : 80);
    }
    for (let buildIndex = 2; buildIndex <= 5; buildIndex += 1) {
      const timer = window.setTimeout(() => {
        if (currentSceneId() !== "scene-12") return;
        setBuild(buildIndex, { source: "automatic" });
      }, stepDuration * (buildIndex - 1));
      presentationState.clericalTimers.push(timer);
    }
  }

  function setBuild(buildIndex, { silent = false, source = "manual" } = {}) {
    const nextBuild = clamp(Number(buildIndex) || 0, 0, getMaxBuild());
    const changed = nextBuild !== presentationState.build;
    presentationState.build = nextBuild;
    updateBuilds();
    if (changed) sound.setBuild(presentationState.index, nextBuild);
    if (changed && !silent) sound.cueBuild(currentSceneId(), nextBuild);
    if (currentSceneId() === "scene-12") {
      if (changed && nextBuild === 1 && source !== "automatic" && !silent) startClericalSequence();
      if (changed && source !== "automatic" && nextBuild !== 1) clearClericalSequence();
      if (silent || source !== "automatic") updateClericalCounter(nextBuild);
    }
    return nextBuild;
  }

  function refreshNotes() {
    if (notesPanel.getAttribute("aria-hidden") !== "false") return;
    const source = scenes[presentationState.index].querySelector(".speaker-notes");
    notesContent.innerHTML = source ? source.innerHTML : "<p>No notes for this scene.</p>";
  }

  function setTransition(name) {
    Array.from(body.classList)
      .filter((className) => className.startsWith("transition--"))
      .forEach((className) => body.classList.remove(className));
    if (!name) return;
    body.classList.add("transition--" + name);
    window.clearTimeout(presentationState.transitionTimer);
    presentationState.transitionTimer = window.setTimeout(() => {
      body.classList.remove("transition--" + name);
    }, 520);
  }

  function goToSlide(index, { build = 0, silent = false, updateHash = true } = {}) {
    const nextIndex = clamp(Number(index) || 0, 0, scenes.length - 1);
    const previousIndex = presentationState.index;
    if (currentSceneId(previousIndex) === "scene-12" && nextIndex !== previousIndex) clearClericalSequence();
    if (!presentationState.started && nextIndex > 0) startProjector({ silent: true });

    scenes.forEach((scene, sceneIndex) => {
      const isActive = sceneIndex === nextIndex;
      scene.classList.toggle("is-active", isActive);
      scene.setAttribute("aria-hidden", String(!isActive));
    });

    presentationState.index = nextIndex;
    presentationState.build = 0;
    setBuild(build, { silent: true });
    updateIndicator();
    refreshNotes();
    if (updateHash) {
      const nextHash = "#scene-" + formatScene(nextIndex);
      if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
    }
    if (nextIndex !== previousIndex) {
      setTransition(scenes[nextIndex].dataset.transition);
      sound.setScene(nextIndex, presentationState.build);
      if (!silent) sound.cueScene(currentSceneId(nextIndex));
    }
    announce("Scene " + nextIndex + ": " + scenes[nextIndex].dataset.title);
    return nextIndex;
  }

  function scheduleLeaderCompletion() {
    window.clearTimeout(presentationState.leaderTimer);
    presentationState.leaderTimer = window.setTimeout(() => {
      presentationState.leaderComplete = true;
      body.classList.add("leader-complete");
      announce("Film leader complete");
    }, 9400);
  }

  function startProjector({ silent = false } = {}) {
    if (presentationState.started) return false;
    presentationState.started = true;
    body.classList.add("projector-started");
    body.classList.toggle("sound-muted", sound.muted);
    if (!silent) sound.arm({ leader: presentationState.index === 0 });
    if (presentationState.index === 0) scheduleLeaderCompletion();
    announce(sound.muted ? "Projector started, sound muted" : "Projector started");
    return true;
  }

  function replayLeader() {
    closePanels();
    clearClericalSequence();
    presentationState.started = true;
    presentationState.leaderComplete = false;
    window.clearTimeout(presentationState.leaderTimer);
    body.classList.remove("leader-complete", "projector-started");
    goToSlide(0, { silent: true });
    void body.offsetWidth;
    body.classList.add("projector-started");
    body.classList.toggle("sound-muted", sound.muted);
    if (!sound.muted) sound.arm({ leader: true });
    scheduleLeaderCompletion();
    announce("Opening leader replayed");
  }

  function next() {
    closePanels();
    if (!presentationState.started) {
      startProjector();
      return;
    }
    if (presentationState.build < getMaxBuild()) {
      setBuild(presentationState.build + 1);
      return;
    }
    if (presentationState.index < scenes.length - 1) goToSlide(presentationState.index + 1);
  }

  function previous() {
    closePanels();
    if (!presentationState.started) return;
    if (presentationState.build > 0) {
      setBuild(presentationState.build - 1);
      return;
    }
    if (presentationState.index > 0) {
      const previousIndex = presentationState.index - 1;
      goToSlide(previousIndex, { build: getMaxBuild(scenes[previousIndex]) });
    }
  }

  function closePanels() {
    let closed = false;
    panels.forEach((panel) => {
      if (panel.getAttribute("aria-hidden") === "false") closed = true;
      panel.setAttribute("aria-hidden", "true");
    });
    body.classList.remove("panel-open");
    return closed;
  }

  function openPanel(panel) {
    const wasOpen = panel.getAttribute("aria-hidden") === "false";
    closePanels();
    if (wasOpen) return;
    if (panel === notesPanel) {
      const source = scenes[presentationState.index].querySelector(".speaker-notes");
      notesContent.innerHTML = source ? source.innerHTML : "<p>No notes for this scene.</p>";
    }
    panel.setAttribute("aria-hidden", "false");
    body.classList.add("panel-open");
    panel.querySelector("button")?.focus({ preventScroll: true });
  }

  function togglePanel(panel) {
    if (panel.getAttribute("aria-hidden") === "false") closePanels();
    else openPanel(panel);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      announce("Fullscreen is unavailable in this browser");
    }
  }

  async function toggleSound() {
    const muted = await sound.toggle();
    body.classList.toggle("sound-muted", muted);
    sound.setScene(presentationState.index, presentationState.build);
    announce(muted ? "Sound muted" : "Sound on");
  }

  function showChrome() {
    if (!presentationState.started && !body.classList.contains("panel-open")) return;
    body.classList.add("chrome-visible");
    window.clearTimeout(presentationState.chromeTimer);
    presentationState.chromeTimer = window.setTimeout(() => {
      if (!body.classList.contains("panel-open")) body.classList.remove("chrome-visible");
    }, 2300);
  }

  function isInteractiveTarget(target) {
    return Boolean(target.closest("button, a, input, textarea, select, [contenteditable='true'], .utility-panel"));
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      if (closePanels()) event.preventDefault();
      return;
    }
    if (event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    const key = event.key.toLowerCase();
    if (key === "n") {
      event.preventDefault();
      togglePanel(notesPanel);
      return;
    }
    if (key === "r") {
      event.preventDefault();
      togglePanel(referencePanel);
      return;
    }
    if (key === "m") {
      event.preventDefault();
      toggleSound();
      return;
    }
    if (key === "f") {
      event.preventDefault();
      toggleFullscreen();
      return;
    }
    if (key === "?" || (event.shiftKey && key === "/")) {
      event.preventDefault();
      togglePanel(helpPanel);
      return;
    }
    if (event.target.closest("button, a")) return;
    if (key === "home") {
      event.preventDefault();
      goToSlide(0);
      return;
    }
    if (key === "end") {
      event.preventDefault();
      goToSlide(scenes.length - 1);
      return;
    }
    if (key === "arrowleft" || key === "pageup") {
      event.preventDefault();
      previous();
      return;
    }
    if (key === "arrowright" || key === "pagedown" || event.code === "Space" || key === "enter") {
      event.preventDefault();
      if (!event.repeat) next();
    }
  }

  function handleAction(action) {
    const actions = {
      previous,
      next,
      sound: toggleSound,
      notes: () => togglePanel(notesPanel),
      references: () => togglePanel(referencePanel),
      fullscreen: toggleFullscreen,
      overview: () => togglePanel(helpPanel),
      "replay-leader": replayLeader,
    };
    actions[action]?.();
  }

  function handleDocumentClick(event) {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      event.preventDefault();
      handleAction(actionButton.dataset.action);
      return;
    }
    if (event.target.closest("[data-close-panel]")) {
      event.preventDefault();
      closePanels();
      return;
    }
    if (!event.target.closest("#film") || isInteractiveTarget(event.target)) return;
    if (Date.now() < presentationState.touchHandledUntil) return;
    next();
  }

  function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    presentationState.touchStartX = touch.clientX;
    presentationState.touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const horizontalDistance = touch.clientX - presentationState.touchStartX;
    const verticalDistance = touch.clientY - presentationState.touchStartY;
    if (Math.abs(horizontalDistance) < 52 || Math.abs(horizontalDistance) < Math.abs(verticalDistance)) return;
    presentationState.touchHandledUntil = Date.now() + 500;
    if (horizontalDistance < 0) next();
    else previous();
  }

  const thinkingResponses = [];

  function setThinkingStatus(message) {
    const status = document.querySelector("#thinking-action-status");
    if (status) status.textContent = message;
  }

  function renderThinkingResponses() {
    const list = document.querySelector("#thinking-responses");
    if (!list) return;
    list.replaceChildren();
    thinkingResponses.forEach((response, index) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      const text = document.createElement("strong");
      number.textContent = String(index + 1).padStart(2, "0") + " - FILED";
      text.textContent = response;
      item.append(number, text);
      list.append(item);
    });
  }

  function addThinkingResponse(text) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return false;
    if (thinkingResponses.length >= 3) thinkingResponses.shift();
    thinkingResponses.push(cleanText);
    renderThinkingResponses();
    setThinkingStatus("Filed response: " + cleanText);
    return true;
  }

  function initializeResponseForms() {
    const form = document.querySelector("#thinking-action-form");
    const input = document.querySelector("#thinking-action");
    if (form && input) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!addThinkingResponse(input.value)) {
          setThinkingStatus("Write a response before filing it.");
          input.focus();
          return;
        }
        input.value = "";
        sound.cueBuild("scene-18", thinkingResponses.length);
      });
    }

    renderThinkingResponses();
  }

  function initializeRelationshipPoll() {
    const cards = Array.from(document.querySelectorAll(".relationship-card"));
    if (!cards.length) return;
    cards.forEach((card, cardIndex) => {
      card.addEventListener("click", () => {
        cards.forEach((candidate) => {
          const selected = candidate === card;
          candidate.classList.toggle("is-selected", selected);
          candidate.setAttribute("aria-pressed", String(selected));
        });
        const relation = card.dataset.relation || card.textContent.trim();
        const status = document.querySelector("#relationship-status");
        if (status) status.textContent = "Selected relationship: " + relation + ". The selection is not recorded.";
        if (currentSceneId() === "scene-27" && presentationState.build < 1) setBuild(1, { silent: true });
        sound.cueBuild("scene-27", cardIndex + 1);
      });
    });
  }

  function initializeSpeechInterface() {
    const recordButton = document.querySelector("#speech-record");
    const playbackButton = document.querySelector("#speech-playback");
    const transcript = document.querySelector("#speech-transcript");
    const status = document.querySelector("#speech-status");
    const fallback = document.querySelector("#speech-fallback");
    const fallbackInput = document.querySelector("#speech-fallback-input");
    if (!recordButton || !playbackButton || !transcript || !status) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let listening = false;
    let transcriptValue = transcript.textContent.trim();
    const setTranscript = (value) => {
      transcriptValue = value.trim() || "Your words can appear here.";
      transcript.textContent = transcriptValue;
    };

    if (!SpeechRecognitionClass) {
      fallback.hidden = false;
      recordButton.disabled = true;
      status.textContent = "Speech recognition is unavailable in this browser. Use the text field; playback may still be available.";
      fallbackInput?.addEventListener("input", () => setTranscript(fallbackInput.value));
    } else {
      recognition = new SpeechRecognitionClass();
      recognition.lang = document.documentElement.lang || "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        listening = true;
        recordButton.classList.add("is-listening");
        recordButton.setAttribute("aria-pressed", "true");
        status.textContent = "Listening. Speak naturally, then pause.";
      };
      recognition.onresult = (event) => {
        let value = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) value += event.results[index][0].transcript;
        setTranscript(value);
      };
      recognition.onerror = (event) => {
        fallback.hidden = false;
        status.textContent = event.error === "not-allowed"
          ? "Microphone permission was not granted. Use the text field below."
          : "Speech recognition stopped: " + event.error + ". Use the text field below.";
      };
      recognition.onend = () => {
        listening = false;
        recordButton.classList.remove("is-listening");
        recordButton.setAttribute("aria-pressed", "false");
        if (!status.textContent.includes("stopped") && !status.textContent.includes("permission")) {
          status.textContent = "Transcript ready for review or playback.";
        }
      };
      recordButton.addEventListener("click", () => {
        try {
          if (listening) recognition.stop();
          else recognition.start();
        } catch {
          status.textContent = "Recognition is already starting. Pause briefly, then try again.";
        }
      });
      fallbackInput?.addEventListener("input", () => setTranscript(fallbackInput.value));
    }

    playbackButton.addEventListener("click", () => {
      if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
        status.textContent = "Speech playback is unavailable in this browser.";
        return;
      }
      const value = transcriptValue === "Your words can appear here." ? "" : transcriptValue;
      if (!value) {
        status.textContent = "Record or enter a phrase before playback.";
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.onstart = () => {
        status.textContent = "Playing back the transcript.";
      };
      utterance.onend = () => {
        status.textContent = "Playback complete.";
      };
      utterance.onerror = () => {
        status.textContent = "Speech playback could not complete in this browser.";
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  function initialize() {
    const opening = parseOpening();
    body.classList.toggle("opening-wonder", opening === "wonder");
    body.classList.toggle("opening-mystery", opening === "mystery");
    body.classList.toggle("sound-muted", sound.muted);
    const initialIndex = parseHash();
    goToSlide(initialIndex, { silent: true, updateHash: Boolean(window.location.hash) });
    if (initialIndex > 0) startProjector({ silent: true });

    initializeResponseForms();
    initializeRelationshipPoll();
    initializeSpeechInterface();

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("pointermove", showChrome, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("hashchange", () => {
      const nextIndex = parseHash();
      if (nextIndex !== presentationState.index) goToSlide(nextIndex, { silent: true, updateHash: false });
    });

    window.__symbiosisDeck = {
      slides: scenes,
      get state() {
        return { ...presentationState, soundMuted: sound.muted, sound: sound.getDiagnostics(), opening: parseOpening() };
      },
      goToSlide,
      setBuild,
      next,
      previous,
      startProjector,
      replayLeader,
      toggleSound,
      closePanels,
      startClericalSequence,
      clearClericalSequence,
    };
  }

  initialize();
})();
