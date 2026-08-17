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
    clericalOperations: 0,
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
        return;
      }
    }

    createContext() {
      if (this.context) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : 0.72;
      this.master.connect(this.context.destination);
      return true;
    }

    async arm({ leader = false } = {}) {
      if (!this.createContext()) return;
      if (this.context.state === "suspended") await this.context.resume();
      this.startProjectorBed();
      if (leader) this.playLeaderTrack();
    }

    startProjectorBed() {
      if (!this.context || this.noiseSource) return;

      const noiseLength = this.context.sampleRate * 2;
      const noiseBuffer = this.context.createBuffer(1, noiseLength, this.context.sampleRate);
      const channel = noiseBuffer.getChannelData(0);
      for (let index = 0; index < noiseLength; index += 1) {
        const flutter = Math.sin((index / this.context.sampleRate) * Math.PI * 2 * 11) * 0.08;
        channel[index] = (Math.random() * 2 - 1) * (0.34 + flutter);
      }

      const noiseSource = this.context.createBufferSource();
      const noiseFilter = this.context.createBiquadFilter();
      const bedGain = this.context.createGain();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1250;
      noiseFilter.Q.value = 0.45;
      bedGain.gain.value = 0.015;
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
    }

    setScene(sceneIndex) {
      if (!this.context || !this.bedGain) return;
      const levels = [0.022, 0.005, 0.007, 0.006, 0.017, 0.024, 0.002, 0.008, 0.006, 0.014, 0.009, 0.02, 0.0002, 0.001, 0.013, 0.009, 0.018, 0.006, 0.021, 0.008, 0.011, 0.016, 0.005, 0.004, 0.004, 0.001, 0.009];
      const target = levels[sceneIndex] ?? 0.007;
      const now = this.context.currentTime;
      this.bedGain.gain.cancelScheduledValues(now);
      this.bedGain.gain.setTargetAtTime(target, now, 0.18);
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

    playNoiseBurst({ duration = 0.08, gain = 0.08, delay = 0 } = {}) {
      if (!this.context || !this.master) return;
      const sampleCount = Math.max(1, Math.floor(this.context.sampleRate * duration));
      const buffer = this.context.createBuffer(1, sampleCount, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < sampleCount; index += 1) {
        const envelope = 1 - index / sampleCount;
        data[index] = (Math.random() * 2 - 1) * envelope;
      }

      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const burstGain = this.context.createGain();
      source.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.value = 900;
      burstGain.gain.value = gain;
      source.connect(filter).connect(burstGain).connect(this.master);
      source.start(this.context.currentTime + delay);
    }

    playLeaderTrack() {
      this.playNoiseBurst({ duration: 0.22, gain: 0.11, delay: 0.65 });
      this.playNoiseBurst({ duration: 0.05, gain: 0.16, delay: 1.95 });
      [4.45, 6.3, 8.1].forEach((delay, index) => {
        this.playTone({ frequency: 860 - index * 35, duration: 0.07, gain: 0.07, delay, type: "square" });
        this.playNoiseBurst({ duration: 0.035, gain: 0.08, delay: delay + 0.02 });
      });
      this.playNoiseBurst({ duration: 0.28, gain: 0.13, delay: 10.05 });
      this.playTone({ frequency: 145, duration: 0.22, gain: 0.04, delay: 10.5, type: "sawtooth" });
    }

    cueScene(sceneIndex) {
      if (!this.context) return;
      if (sceneIndex === 1) this.playNoiseBurst({ duration: 0.045, gain: 0.045 });
      if (sceneIndex === 2) this.playNoiseBurst({ duration: 0.055, gain: 0.07 });
      if (sceneIndex === 4) {
        this.playTone({ frequency: 196, duration: 0.55, gain: 0.025, type: "sine" });
        this.playTone({ frequency: 294, duration: 0.65, gain: 0.02, delay: 0.06, type: "sine" });
        this.playTone({ frequency: 392, duration: 0.75, gain: 0.016, delay: 0.12, type: "sine" });
      }
      if (sceneIndex === 5) {
        this.playTone({ frequency: 84, duration: 0.16, gain: 0.035, type: "square" });
      }
      if (sceneIndex === 6) {
        const now = this.context.currentTime;
        if (this.bedGain) this.bedGain.gain.setTargetAtTime(0.001, now, 0.04);
      }
      if (sceneIndex === 7) this.playNoiseBurst({ duration: 0.04, gain: 0.05 });
      if (sceneIndex === 9) {
        this.playTone({ frequency: 82, duration: 0.28, gain: 0.07, type: "square" });
        this.playNoiseBurst({ duration: 0.08, gain: 0.08 });
      }
      if (sceneIndex === 12 && this.bedGain) {
        const now = this.context.currentTime;
        this.bedGain.gain.setTargetAtTime(0.0001, now, 0.025);
      }
      if (sceneIndex === 14) {
        this.playTone({ frequency: 220, duration: 0.34, gain: 0.028, type: "sine" });
        this.playTone({ frequency: 330, duration: 0.42, gain: 0.022, delay: 0.08, type: "sine" });
        this.playTone({ frequency: 440, duration: 0.5, gain: 0.018, delay: 0.16, type: "sine" });
      }
      if (sceneIndex === 17) this.playNoiseBurst({ duration: 0.04, gain: 0.04 });
      if (sceneIndex === 18) this.playTone({ frequency: 58, duration: 0.42, gain: 0.04, type: "sawtooth" });
      if (sceneIndex === 19) this.playNoiseBurst({ duration: 0.035, gain: 0.035 });
      if (sceneIndex === 20) this.playTone({ frequency: 146, duration: 0.22, gain: 0.026, type: "triangle" });
      if (sceneIndex === 21) this.playTone({ frequency: 188, duration: 0.14, gain: 0.028, type: "triangle" });
      if (sceneIndex === 22) {
        this.playTone({ frequency: 174, duration: 0.46, gain: 0.018, type: "sine" });
        this.playTone({ frequency: 261, duration: 0.5, gain: 0.014, delay: 0.05, type: "sine" });
      }
      if (sceneIndex === 23) this.playNoiseBurst({ duration: 0.045, gain: 0.045 });
      if (sceneIndex === 24) {
        this.playTone({ frequency: 196, duration: 0.08, gain: 0.028, type: "square" });
        this.playTone({ frequency: 294, duration: 0.09, gain: 0.02, delay: 0.05, type: "square" });
      }
      if (sceneIndex === 25 && this.bedGain) {
        const now = this.context.currentTime;
        this.bedGain.gain.setTargetAtTime(0.0005, now, 0.08);
      }
      if (sceneIndex === 26) {
        this.playTone({ frequency: 146, duration: 0.18, gain: 0.022, type: "triangle" });
        this.playNoiseBurst({ duration: 0.04, gain: 0.035, delay: 0.12 });
      }
    }

    cueBuild(sceneIndex, buildIndex) {
      if (!this.context) return;
      if (sceneIndex === 2) this.playNoiseBurst({ duration: 0.035, gain: 0.05 });
      if (sceneIndex === 3 && buildIndex <= 2) {
        this.playTone({ frequency: 720, duration: 0.035, gain: 0.035, type: "square" });
      }
      if (sceneIndex === 5) {
        const frequency = buildIndex === 6 ? 118 : 105 + buildIndex * 19;
        this.playTone({ frequency, duration: buildIndex === 6 ? 0.22 : 0.055, gain: 0.045, type: "square" });
        if (buildIndex === 5) this.playNoiseBurst({ duration: 0.25, gain: 0.07 });
      }
      if (sceneIndex === 7) {
        this.playNoiseBurst({ duration: buildIndex === 3 ? 0.09 : 0.035, gain: buildIndex === 3 ? 0.1 : 0.045 });
      }
      if (sceneIndex === 11) {
        const frequencies = [0, 164, 196, 233, 277, 112];
        this.playTone({
          frequency: frequencies[buildIndex] || 180,
          duration: buildIndex === 5 ? 0.18 : 0.045,
          gain: buildIndex === 5 ? 0.055 : 0.035,
          type: "square",
        });
        this.playNoiseBurst({ duration: 0.025, gain: 0.03, delay: 0.025 });
      }
      if (sceneIndex === 13 && buildIndex === 1) {
        this.playNoiseBurst({ duration: 0.045, gain: 0.045 });
      }
      if (sceneIndex === 14) {
        this.playTone({ frequency: 170 + buildIndex * 64, duration: 0.06, gain: 0.035, type: "triangle" });
        if (buildIndex === 2) this.playNoiseBurst({ duration: 0.07, gain: 0.045 });
      }
      if (sceneIndex === 15) {
        this.playNoiseBurst({ duration: 0.045, gain: 0.055 });
        this.playTone({ frequency: buildIndex % 2 === 0 ? 132 : 176, duration: 0.05, gain: 0.03, type: "square" });
      }
      if (sceneIndex === 16) {
        this.playNoiseBurst({ duration: buildIndex === 4 ? 0.11 : 0.08, gain: buildIndex === 4 ? 0.065 : 0.045 });
        this.playTone({ frequency: 92 + buildIndex * 21, duration: 0.09, gain: 0.032, delay: 0.02, type: "square" });
      }
      if (sceneIndex === 17) this.playNoiseBurst({ duration: 0.035, gain: 0.04 });
      if (sceneIndex === 18) {
        if (buildIndex === 1) this.playNoiseBurst({ duration: 0.72, gain: 0.13 });
        if (buildIndex === 2) {
          this.playTone({ frequency: 72, duration: 0.3, gain: 0.045, type: "square" });
          this.playNoiseBurst({ duration: 0.08, gain: 0.055, delay: 0.04 });
        }
      }
      if (sceneIndex === 19) {
        this.playNoiseBurst({ duration: 0.035, gain: 0.04 });
        this.playTone({ frequency: 120 + buildIndex * 28, duration: 0.045, gain: 0.025, type: "square" });
      }
      if (sceneIndex === 20) {
        this.playTone({ frequency: 126 + buildIndex * 42, duration: 0.08, gain: 0.03, type: "triangle" });
        if (buildIndex >= 3) this.playNoiseBurst({ duration: 0.04, gain: 0.03 });
      }
      if (sceneIndex === 21) {
        if (buildIndex <= 6) {
          this.playTone({ frequency: 170 + buildIndex * 58, duration: 0.055, gain: 0.032, type: "square" });
          this.playNoiseBurst({ duration: 0.025, gain: 0.026, delay: 0.015 });
        } else {
          this.playNoiseBurst({ duration: 0.18, gain: 0.11 });
          this.playTone({ frequency: 66, duration: 0.22, gain: 0.045, type: "square" });
        }
      }
      if (sceneIndex === 22) {
        if (buildIndex === 1) this.playNoiseBurst({ duration: 0.035, gain: 0.032 });
        if (buildIndex === 2) this.playTone({ frequency: 116, duration: 0.08, gain: 0.035, type: "square" });
        if (buildIndex === 3) this.playNoiseBurst({ duration: 0.09, gain: 0.065 });
        if (buildIndex === 4) {
          this.playTone({ frequency: 196, duration: 0.38, gain: 0.024, type: "sine" });
          this.playTone({ frequency: 294, duration: 0.44, gain: 0.018, delay: 0.04, type: "sine" });
        }
      }
      if (sceneIndex === 23) {
        this.playNoiseBurst({ duration: 0.055, gain: 0.052 });
        this.playTone({ frequency: 102 + buildIndex * 24, duration: 0.045, gain: 0.022, type: "square" });
      }
      if (sceneIndex === 24) {
        if (buildIndex === 1) this.playNoiseBurst({ duration: 0.14, gain: 0.085 });
        if (buildIndex === 2) {
          this.playTone({ frequency: 174, duration: 0.32, gain: 0.022, type: "sine" });
          this.playTone({ frequency: 233, duration: 0.4, gain: 0.018, delay: 0.05, type: "sine" });
        }
        if (buildIndex === 3) this.playTone({ frequency: 131, duration: 0.18, gain: 0.025, type: "triangle" });
      }
      if (sceneIndex === 25 && buildIndex === 1) {
        this.playNoiseBurst({ duration: 0.035, gain: 0.018 });
      }
      if (sceneIndex === 26) {
        if (buildIndex < 4) {
          this.playNoiseBurst({ duration: 0.045, gain: 0.038 });
          this.playTone({ frequency: 154 + buildIndex * 42, duration: 0.11, gain: 0.022, type: "triangle" });
        } else if (this.bedGain) {
          const now = this.context.currentTime;
          this.bedGain.gain.setTargetAtTime(0.0001, now, 0.12);
        }
      }
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

  function getMaxBuild(scene = scenes[presentationState.index]) {
    return Array.from(scene?.querySelectorAll("[data-build]") || []).reduce(
      (maximum, element) => Math.max(maximum, Number(element.dataset.build) || 0),
      0,
    );
  }

  function parseHash() {
    const match = window.location.hash.match(/^#scene-(\d{2})$/);
    if (!match) return 0;
    return clamp(Number(match[1]), 0, scenes.length - 1);
  }

  function announce(message) {
    projectorStatus.textContent = "";
    window.requestAnimationFrame(() => {
      projectorStatus.textContent = message;
    });
  }

  function updateIndicator() {
    sceneIndicator.textContent = `${formatScene(presentationState.index)} / ${formatScene(scenes.length - 1)}`;
    sceneIndicator.setAttribute(
      "aria-label",
      `Scene ${presentationState.index} of ${scenes.length - 1}: ${scenes[presentationState.index].dataset.title}`,
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
    const value = milestones[clamp(buildIndex, 0, milestones.length - 1)];
    presentationState.clericalOperations = value;
    counter.textContent = String(value).padStart(4, "0");
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
    const stepDuration = reducedMotion ? 90 : 2_650;
    const finalOperationCount = 862;
    const startTime = performance.now();
    const totalDuration = stepDuration * 4;
    const counter = document.querySelector("#clerical-counter");

    if (counter) {
      presentationState.clericalCounterTimer = window.setInterval(() => {
        const progress = clamp((performance.now() - startTime) / totalDuration, 0, 1);
        presentationState.clericalOperations = Math.round(finalOperationCount * progress);
        counter.textContent = String(presentationState.clericalOperations).padStart(4, "0");
        if (progress >= 1) {
          window.clearInterval(presentationState.clericalCounterTimer);
          presentationState.clericalCounterTimer = null;
        }
      }, reducedMotion ? 20 : 80);
    }

    for (let buildIndex = 2; buildIndex <= 5; buildIndex += 1) {
      const timer = window.setTimeout(() => {
        if (presentationState.index !== 11) return;
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
    if (changed && !silent) sound.cueBuild(presentationState.index, nextBuild);
    if (presentationState.index === 11) {
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
    body.classList.add(`transition--${name}`);
    window.clearTimeout(presentationState.transitionTimer);
    presentationState.transitionTimer = window.setTimeout(() => {
      body.classList.remove(`transition--${name}`);
    }, 520);
  }

  function goToSlide(index, { build = 0, silent = false, updateHash = true } = {}) {
    const nextIndex = clamp(Number(index) || 0, 0, scenes.length - 1);
    const previousIndex = presentationState.index;

    if (previousIndex === 11 && nextIndex !== 11) clearClericalSequence();

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
      const nextHash = `#scene-${formatScene(nextIndex)}`;
      if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
    }

    if (nextIndex !== previousIndex) {
      setTransition(scenes[nextIndex].dataset.transition);
      sound.setScene(nextIndex);
      if (!silent) sound.cueScene(nextIndex);
    }

    announce(`Scene ${nextIndex}: ${scenes[nextIndex].dataset.title}`);
    return nextIndex;
  }

  function startProjector({ silent = false } = {}) {
    if (presentationState.started) return false;
    presentationState.started = true;
    body.classList.add("projector-started");
    body.classList.toggle("sound-muted", sound.muted);

    if (!silent) sound.arm({ leader: presentationState.index === 0 });

    window.clearTimeout(presentationState.leaderTimer);
    presentationState.leaderTimer = window.setTimeout(() => {
      presentationState.leaderComplete = true;
      body.classList.add("leader-complete");
      announce("Film leader complete");
    }, 11_700);

    announce(sound.muted ? "Projector started, sound muted" : "Projector started");
    return true;
  }

  function next() {
    closePanels();
    if (!presentationState.started) {
      startProjector();
      return;
    }

    const maximumBuild = getMaxBuild();
    if (presentationState.build < maximumBuild) {
      setBuild(presentationState.build + 1);
      return;
    }

    if (presentationState.index < scenes.length - 1) {
      goToSlide(presentationState.index + 1);
    }
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
    announce(muted ? "Sound muted" : "Sound on");
    sound.setScene(presentationState.index);
    return muted;
  }

  function showChrome() {
    if (!presentationState.started && !body.classList.contains("panel-open")) return;
    body.classList.add("chrome-visible");
    window.clearTimeout(presentationState.chromeTimer);
    presentationState.chromeTimer = window.setTimeout(() => {
      if (!body.classList.contains("panel-open")) body.classList.remove("chrome-visible");
    }, 2_300);
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
    const code = event.code;

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
    if (key === "arrowright" || key === "pagedown" || code === "Space" || key === "enter") {
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

  function initializeThinkingDial() {
    const estimateInput = document.querySelector("#thinking-estimate");
    const estimateOutput = document.querySelector("#estimate-output");
    const estimateStatus = document.querySelector("#estimate-status");
    const dial = document.querySelector(".thinking-dial");
    const marks = document.querySelector("#audience-marks");
    const lockButton = document.querySelector("#lock-estimate");
    if (!estimateInput || !estimateOutput || !estimateStatus || !dial || !marks || !lockButton) return;

    const updateEstimate = () => {
      const value = Number(estimateInput.value);
      dial.style.setProperty("--estimate", String(value));
      estimateOutput.textContent = `${value}%`;
    };

    estimateInput.addEventListener("input", updateEstimate);
    lockButton.addEventListener("click", () => {
      updateEstimate();
      const value = Number(estimateInput.value);
      const mark = document.createElement("span");
      mark.className = "audience-mark";
      mark.style.setProperty("--mark", String(value));
      mark.dataset.value = String(value);
      mark.setAttribute("aria-label", `Audience estimate ${value} percent`);
      marks.append(mark);
      while (marks.children.length > 6) marks.firstElementChild?.remove();
      estimateStatus.textContent = `Marked ${value}%. Take another answer or advance when ready.`;
      sound.cueBuild(8, marks.children.length);
    });
  }

  function initializeThinkingResponses() {
    const form = document.querySelector("#thinking-action-form");
    const input = document.querySelector("#thinking-action");
    const responses = document.querySelector("#thinking-responses");
    const status = document.querySelector("#thinking-action-status");
    if (!form || !input || !responses || !status) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const response = input.value.trim();
      if (!response) {
        status.textContent = "Write a response before filing the card.";
        input.focus();
        return;
      }

      const responseNumber = responses.children.length + 1;
      const card = document.createElement("li");
      const code = document.createElement("span");
      const text = document.createElement("strong");
      card.className = "thinking-response-card";
      code.textContent = `FILED ${String(responseNumber).padStart(2, "0")}`;
      text.textContent = response;
      card.append(code, text);
      responses.prepend(card);
      while (responses.children.length > 3) responses.lastElementChild?.remove();

      input.value = "";
      status.textContent = `Filed response: ${response}`;
      sound.cueBuild(17, responseNumber);
    });
  }

  function initializeRelationshipPoll() {
    const cards = Array.from(document.querySelectorAll(".relationship-card"));
    const status = document.querySelector("#relationship-status");
    if (!cards.length || !status) return;

    cards.forEach((card, cardIndex) => {
      card.addEventListener("click", () => {
        cards.forEach((candidate) => {
          const selected = candidate === card;
          candidate.classList.toggle("is-selected", selected);
          candidate.setAttribute("aria-pressed", String(selected));
        });

        const relation = card.dataset.relation || card.textContent.trim();
        status.textContent = `Selected ${relation}. Now consider what would have to be true to call a computer a partner.`;
        if (presentationState.index === 23 && presentationState.build < 1) setBuild(1, { silent: true });
        sound.cueBuild(23, cardIndex + 1);
      });
    });
  }

  function initialize() {
    const initialIndex = parseHash();
    body.classList.toggle("sound-muted", sound.muted);
    goToSlide(initialIndex, { silent: true, updateHash: Boolean(window.location.hash) });
    if (initialIndex > 0) startProjector({ silent: true });
    initializeThinkingDial();
    initializeThinkingResponses();
    initializeRelationshipPoll();

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
        return { ...presentationState, soundMuted: sound.muted };
      },
      goToSlide,
      setBuild,
      next,
      previous,
      startProjector,
      toggleSound,
      closePanels,
      startClericalSequence,
      clearClericalSequence,
    };
  }

  initialize();
})();
