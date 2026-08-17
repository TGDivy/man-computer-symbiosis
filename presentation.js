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
      const levels = [0.022, 0.005, 0.007, 0.006, 0.017, 0.024, 0.002];
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

  function setBuild(buildIndex, { silent = false } = {}) {
    const nextBuild = clamp(Number(buildIndex) || 0, 0, getMaxBuild());
    const changed = nextBuild !== presentationState.build;
    presentationState.build = nextBuild;
    updateBuilds();
    if (changed && !silent) sound.cueBuild(presentationState.index, nextBuild);
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

  function initialize() {
    const initialIndex = parseHash();
    body.classList.toggle("sound-muted", sound.muted);
    goToSlide(initialIndex, { silent: true, updateHash: Boolean(window.location.hash) });
    if (initialIndex > 0) startProjector({ silent: true });

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
    };
  }

  initialize();
})();
