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
    }

    setScene(index) {
      if (!this.context || !this.bedGain) return;
      const subdued = new Set([6, 13, 14, 30, 31, 32, 33]);
      const target = subdued.has(index) ? 0.001 : index === 5 ? 0.024 : 0.008;
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
        data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
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
      if (scene === "scene-31" && this.bedGain) this.bedGain.gain.setTargetAtTime(0.0005, this.context.currentTime, 0.08);
    }

    cueBuild(scene, buildIndex) {
      if (!this.context) return;
      if (scene === "scene-12") {
        this.playTone({ frequency: 150 + buildIndex * 26, duration: buildIndex === 5 ? 0.18 : 0.045, gain: 0.035, type: "square" });
        this.playNoiseBurst({ duration: 0.025, gain: 0.03, delay: 0.025 });
        return;
      }
      if (scene === "scene-14" || scene === "scene-30") {
        this.playNoiseBurst({ duration: 0.045, gain: 0.045 });
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
      sound.setScene(nextIndex);
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
    sound.setScene(presentationState.index);
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

  const responseConfig = {
    thinking: {
      key: "symbiosis-thinking-responses-v2",
      list: "#thinking-responses",
      status: "#thinking-action-status",
      label: "thinking response",
      filename: "man-computer-symbiosis-thinking-responses.csv",
    },
    relationship: {
      key: "symbiosis-relationship-responses-v2",
      list: "#relationship-responses",
      status: "#relationship-status",
      label: "relationship selection",
      filename: "man-computer-symbiosis-relationship-selections.csv",
    },
  };

  function getResponses(kind) {
    const config = responseConfig[kind];
    if (!config) return [];
    try {
      const stored = JSON.parse(localStorage.getItem(config.key) || "[]");
      return Array.isArray(stored) ? stored.filter((item) => typeof item?.text === "string") : [];
    } catch {
      return [];
    }
  }

  function setResponses(kind, responses) {
    const config = responseConfig[kind];
    if (!config) return;
    try {
      localStorage.setItem(config.key, JSON.stringify(responses));
    } catch {
      // The visible record still works if local storage is unavailable.
    }
  }

  function renderResponses(kind) {
    const config = responseConfig[kind];
    const list = document.querySelector(config?.list || "");
    if (!list) return;
    const responses = getResponses(kind);
    list.replaceChildren();
    responses.forEach((response, index) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      const text = document.createElement("strong");
      number.textContent = String(index + 1).padStart(2, "0") + " - " + (kind === "relationship" ? "SELECTED" : "FILED");
      text.textContent = response.text;
      item.append(number, text);
      list.append(item);
    });
  }

  function setResponseStatus(kind, message) {
    const status = document.querySelector(responseConfig[kind]?.status || "");
    if (status) status.textContent = message;
  }

  function addResponse(kind, text) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return false;
    const responses = getResponses(kind);
    responses.push({ text: cleanText, recordedAt: new Date().toISOString() });
    setResponses(kind, responses);
    renderResponses(kind);
    setResponseStatus(kind, "Recorded " + responseConfig[kind].label + ": " + cleanText);
    return true;
  }

  function responseCsv(kind) {
    const responses = getResponses(kind);
    const escape = (value) => '"' + String(value).replace(/"/g, '""') + '"';
    return ["number,response,recorded_at"].concat(
      responses.map((response, index) => [index + 1, response.text, response.recordedAt].map(escape).join(",")),
    ).join("\n");
  }

  async function copyResponses(kind) {
    const text = responseCsv(kind);
    try {
      await navigator.clipboard.writeText(text);
      setResponseStatus(kind, "Copied local record to clipboard.");
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
      setResponseStatus(kind, "Copied local record to clipboard.");
    }
  }

  function downloadResponses(kind) {
    const config = responseConfig[kind];
    const blob = new Blob([responseCsv(kind)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = config.filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setResponseStatus(kind, "Prepared CSV download from this browser only.");
  }

  function initializeResponseForms() {
    const form = document.querySelector("#thinking-action-form");
    const input = document.querySelector("#thinking-action");
    if (form && input) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!addResponse("thinking", input.value)) {
          setResponseStatus("thinking", "Write a response before filing it.");
          input.focus();
          return;
        }
        input.value = "";
        sound.cueBuild("scene-18", getResponses("thinking").length);
      });
    }

    document.querySelectorAll("[data-response-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const kind = button.dataset.responseKind;
        if (!responseConfig[kind]) return;
        if (button.dataset.responseAction === "copy") copyResponses(kind);
        if (button.dataset.responseAction === "download") downloadResponses(kind);
        if (button.dataset.responseAction === "print") window.print();
      });
    });

    renderResponses("thinking");
    renderResponses("relationship");
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
        addResponse("relationship", relation);
        if (currentSceneId() === "scene-29" && presentationState.build < 1) setBuild(1, { silent: true });
        sound.cueBuild("scene-29", cardIndex + 1);
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
        return { ...presentationState, soundMuted: sound.muted, opening: parseOpening() };
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
