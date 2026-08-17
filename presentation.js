(() => {
  "use strict";

  const app = document.querySelector("#app");
  const deck = document.querySelector("#deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const currentReadout = document.querySelector("#scene-current");
  const totalReadout = document.querySelector("#scene-total");
  const reelReadout = document.querySelector("#reel-readout");
  const progressBar = document.querySelector("#progress-bar");
  const slideAnnouncer = document.querySelector("#slide-announcer");
  const notesPanel = document.querySelector("#notes-panel");
  const notesContent = document.querySelector("#notes-content");
  const referencePanel = document.querySelector("#reference-panel");
  const helpPanel = document.querySelector("#help-panel");
  const overexposureFlash = document.querySelector("#overexposure-flash");
  const soundButton = document.querySelector('[data-action="sound"]');

  const presentationState = {
    index: 0,
    buildStep: 0,
    soundEnabled: false,
    audioContext: null,
    chromeTimer: null,
    speechTimers: [],
    touchStartX: null,
    touchStartY: null,
  };

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

  function getBuildSteps(slide) {
    return Array.from(slide.querySelectorAll("[data-build]"))
      .map((element) => Number.parseInt(element.dataset.build, 10))
      .filter(Number.isFinite)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((firstValue, secondValue) => firstValue - secondValue);
  }

  function getMaximumBuild(slide) {
    const steps = getBuildSteps(slide);
    return steps.length ? steps.at(-1) : 0;
  }

  function setBuildStep(step) {
    const activeSlide = slides[presentationState.index];
    const maximumBuild = getMaximumBuild(activeSlide);
    presentationState.buildStep = clamp(step, 0, maximumBuild);

    activeSlide.querySelectorAll("[data-build]").forEach((element) => {
      const elementStep = Number.parseInt(element.dataset.build, 10);
      element.classList.toggle("is-visible", elementStep <= presentationState.buildStep);
    });

    updateProgress();
  }

  function parseHash() {
    const requestedId = window.location.hash.replace(/^#/, "");
    const requestedIndex = slides.findIndex((slide) => slide.id === requestedId);
    return requestedIndex >= 0 ? requestedIndex : 0;
  }

  function formatSceneNumber(index) {
    return String(index + 1).padStart(2, "0");
  }

  function updateProgress() {
    const activeSlide = slides[presentationState.index];
    const maximumBuild = getMaximumBuild(activeSlide);
    const buildFraction = maximumBuild ? presentationState.buildStep / maximumBuild : 0;
    const overallFraction = (presentationState.index + buildFraction) / slides.length;

    currentReadout.textContent = formatSceneNumber(presentationState.index);
    totalReadout.textContent = String(slides.length).padStart(2, "0");
    reelReadout.textContent = activeSlide.dataset.reel || "RESTORATION COPY";
    progressBar.style.width = `${Math.max(2, overallFraction * 100)}%`;
  }

  function updateNotes() {
    const activeSlide = slides[presentationState.index];
    const slideNotes = activeSlide.querySelector(".speaker-notes");
    notesContent.innerHTML = slideNotes
      ? slideNotes.innerHTML
      : `<h2>${activeSlide.dataset.title}</h2><p>No notes recorded for this scene.</p>`;
    notesContent.insertAdjacentHTML(
      "beforeend",
      `<p class="notes-source-links"><strong>Source links:</strong> <a href="https://groups.csail.mit.edu/medg/people/psz/Licklider.html" target="_blank" rel="noreferrer">primary paper ↗</a> · <a href="SOURCES.md" target="_blank">quote and asset register ↗</a></p>`,
    );
    notesContent.scrollTop = 0;
  }

  function announceSlide() {
    const activeSlide = slides[presentationState.index];
    slideAnnouncer.textContent = `Scene ${presentationState.index + 1} of ${slides.length}: ${activeSlide.dataset.title}`;
    document.title = `${formatSceneNumber(presentationState.index)} · ${activeSlide.dataset.title} — Man–Computer Symbiosis`;
  }

  function updateHash() {
    const activeSlide = slides[presentationState.index];
    const newUrl = `${window.location.pathname}${window.location.search}#${activeSlide.id}`;
    window.history.replaceState(null, "", newUrl);
  }

  function preloadAdjacentImages() {
    [presentationState.index - 1, presentationState.index + 1].forEach((adjacentIndex) => {
      const adjacentSlide = slides[adjacentIndex];
      if (!adjacentSlide) return;
      adjacentSlide.querySelectorAll("img").forEach((image) => {
        image.loading = "eager";
        if (image.decode) image.decode().catch(() => undefined);
      });
    });
  }

  function triggerFlash() {
    overexposureFlash.classList.remove("is-flashing");
    window.requestAnimationFrame(() => {
      overexposureFlash.classList.add("is-flashing");
    });
  }

  function showChrome() {
    app.classList.add("is-chrome-active");
    window.clearTimeout(presentationState.chromeTimer);
    presentationState.chromeTimer = window.setTimeout(() => {
      if (!document.querySelector(".chrome:focus-within")) {
        app.classList.remove("is-chrome-active");
      }
    }, 2200);
  }

  function goToSlide(index, options = {}) {
    const targetIndex = clamp(index, 0, slides.length - 1);
    const previousSlide = slides[presentationState.index];
    const targetSlide = slides[targetIndex];
    const direction = targetIndex >= presentationState.index ? "forward" : "backward";

    if (targetSlide !== previousSlide) {
      previousSlide.classList.remove("is-active");
      previousSlide.classList.add("is-leaving");
      previousSlide.setAttribute("aria-hidden", "true");

      window.setTimeout(() => previousSlide.classList.remove("is-leaving"), 760);

      presentationState.index = targetIndex;
      targetSlide.dataset.direction = direction;
      targetSlide.classList.add("is-active");
      targetSlide.setAttribute("aria-hidden", "false");

      if (!options.silent && ["overexpose", "splice", "reel"].includes(targetSlide.dataset.transition)) {
        triggerFlash();
      }

      if (!options.silent) playProjectorClick(targetSlide.dataset.transition === "reel" ? "reel" : "cut");
    }

    const requestedBuild = Number.isFinite(options.build) ? options.build : 0;
    setBuildStep(requestedBuild);
    updateNotes();
    announceSlide();
    updateHash();
    preloadAdjacentImages();
    showChrome();

    if (targetSlide.id === "scene-16") {
      window.requestAnimationFrame(resizeSketchCanvas);
    }
  }

  function next() {
    const activeSlide = slides[presentationState.index];
    const steps = getBuildSteps(activeSlide);
    const nextStep = steps.find((step) => step > presentationState.buildStep);

    if (nextStep !== undefined) {
      setBuildStep(nextStep);
      playProjectorClick("tick");
      showChrome();
      return;
    }

    if (presentationState.index < slides.length - 1) {
      goToSlide(presentationState.index + 1);
    } else {
      playProjectorClick("end");
    }
  }

  function previous() {
    const activeSlide = slides[presentationState.index];
    const steps = getBuildSteps(activeSlide);
    const previousSteps = steps.filter((step) => step < presentationState.buildStep);

    if (presentationState.buildStep > 0) {
      setBuildStep(previousSteps.length ? previousSteps.at(-1) : 0);
      playProjectorClick("tick");
      showChrome();
      return;
    }

    if (presentationState.index > 0) {
      const previousSlide = slides[presentationState.index - 1];
      goToSlide(presentationState.index - 1, { build: getMaximumBuild(previousSlide) });
    }
  }

  function isFormControl(target) {
    return target instanceof HTMLElement && Boolean(target.closest("input, button, textarea, select, [contenteditable='true']"));
  }

  function closePanels() {
    [notesPanel, referencePanel, helpPanel].forEach((panel) => {
      panel.setAttribute("aria-hidden", "true");
      panel.inert = true;
    });
  }

  function togglePanel(panel) {
    const willOpen = panel.getAttribute("aria-hidden") !== "false";
    closePanels();
    if (willOpen) {
      panel.setAttribute("aria-hidden", "false");
      panel.inert = false;
      const closeButton = panel.querySelector("button");
      if (closeButton) window.setTimeout(() => closeButton.focus(), 80);
    }
    showChrome();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }

  function initialiseAudioContext() {
    if (!presentationState.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) presentationState.audioContext = new AudioContextClass();
    }
    return presentationState.audioContext;
  }

  function playProjectorClick(type = "tick") {
    if (!presentationState.soundEnabled) return;
    const audioContext = initialiseAudioContext();
    if (!audioContext) return;
    if (audioContext.state === "suspended") audioContext.resume().catch(() => undefined);

    const now = audioContext.currentTime;
    const duration = type === "reel" ? 0.12 : type === "end" ? 0.18 : 0.055;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(type === "reel" ? 58 : 92, now);
    oscillator.frequency.exponentialRampToValueAtTime(38, now + duration);
    gain.gain.setValueAtTime(type === "end" ? 0.12 : 0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, now);

    oscillator.connect(filter).connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function toggleSound() {
    presentationState.soundEnabled = !presentationState.soundEnabled;
    soundButton.setAttribute("aria-pressed", String(presentationState.soundEnabled));
    soundButton.textContent = presentationState.soundEnabled ? "S•" : "S";
    soundButton.setAttribute(
      "aria-label",
      presentationState.soundEnabled ? "Turn projector sounds off" : "Turn projector sounds on",
    );

    if (presentationState.soundEnabled) {
      initialiseAudioContext();
      playProjectorClick("reel");
    }
  }

  function runAction(action) {
    const actions = {
      next,
      previous,
      notes: () => togglePanel(notesPanel),
      references: () => togglePanel(referencePanel),
      help: () => togglePanel(helpPanel),
      fullscreen: toggleFullscreen,
      sound: toggleSound,
    };
    actions[action]?.();
  }

  function handleKeydown(event) {
    showChrome();

    if (event.key === "Escape") {
      closePanels();
      return;
    }

    if (isFormControl(event.target)) return;

    const key = event.key.toLowerCase();
    const shouldPrevent = ["arrowright", "arrowleft", "pagedown", "pageup", "home", "end", " "].includes(key);
    if (shouldPrevent) event.preventDefault();

    if (["arrowright", "pagedown", " "].includes(key)) next();
    if (["arrowleft", "pageup"].includes(key)) previous();
    if (key === "home") goToSlide(0);
    if (key === "end") goToSlide(slides.length - 1);
    if (key === "n") togglePanel(notesPanel);
    if (key === "r") togglePanel(referencePanel);
    if (key === "s") toggleSound();
    if (key === "f") toggleFullscreen();
    if (event.key === "?") togglePanel(helpPanel);
  }

  function handleTouchStart(event) {
    if (event.target.closest("#sketch-surface, input, button")) return;
    const touch = event.changedTouches[0];
    presentationState.touchStartX = touch.clientX;
    presentationState.touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    if (presentationState.touchStartX === null || presentationState.touchStartY === null) return;
    const touch = event.changedTouches[0];
    const horizontalDistance = touch.clientX - presentationState.touchStartX;
    const verticalDistance = touch.clientY - presentationState.touchStartY;
    presentationState.touchStartX = null;
    presentationState.touchStartY = null;

    if (Math.abs(horizontalDistance) < 55 || Math.abs(horizontalDistance) < Math.abs(verticalDistance)) return;
    if (horizontalDistance < 0) next();
    else previous();
  }

  function setupEstimateControl() {
    const estimateInput = document.querySelector("#thinking-estimate");
    const estimateOutput = document.querySelector("#estimate-output");
    const lockButton = document.querySelector("#lock-estimate");
    const estimateStatus = document.querySelector("#estimate-status");

    estimateInput.addEventListener("input", () => {
      estimateOutput.value = `${estimateInput.value}%`;
      estimateOutput.textContent = `${estimateInput.value}%`;
      estimateStatus.textContent = "ESTIMATE NOT YET LOCKED";
    });

    lockButton.addEventListener("click", () => {
      estimateStatus.textContent = `ESTIMATE RECORDED: ${estimateInput.value}%. THE NEXT REEL HOLDS THE RESULT.`;
      lockButton.textContent = "ESTIMATE LOCKED";
      playProjectorClick("tick");
    });
  }

  const defaultWords = ["SEARCHING", "FORMATTING", "GETTING TOOLS TO TALK"];

  function sanitiseAudienceWord(value) {
    return value.replace(/\s+/g, " ").trim().slice(0, 36).toUpperCase();
  }

  function renderWords(words) {
    const wordField = document.querySelector("#word-field");
    wordField.replaceChildren();
    words.forEach((word) => {
      const wordElement = document.createElement("span");
      wordElement.textContent = word;
      wordField.append(wordElement);
    });
  }

  function loadAudienceWords() {
    try {
      const storedWords = JSON.parse(window.localStorage.getItem("symbiosis-audience-words") || "[]");
      return Array.isArray(storedWords) && storedWords.length ? storedWords : defaultWords;
    } catch {
      return defaultWords;
    }
  }

  function saveAudienceWords(words) {
    try {
      window.localStorage.setItem("symbiosis-audience-words", JSON.stringify(words));
    } catch {
      // The presentation remains fully usable when storage is unavailable.
    }
  }

  function setupWordField() {
    const wordForm = document.querySelector("#word-entry");
    const wordInput = document.querySelector("#friction-word");
    const clearWordsButton = document.querySelector("#clear-words");
    let audienceWords = loadAudienceWords();
    renderWords(audienceWords);

    wordForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newWord = sanitiseAudienceWord(wordInput.value);
      if (!newWord) return;
      audienceWords = [...audienceWords, newWord].slice(-18);
      renderWords(audienceWords);
      saveAudienceWords(audienceWords);
      wordInput.value = "";
      wordInput.focus();
      playProjectorClick("tick");
    });

    clearWordsButton.addEventListener("click", () => {
      audienceWords = defaultWords;
      renderWords(audienceWords);
      saveAudienceWords(audienceWords);
      wordInput.focus();
    });
  }

  const sketchState = {
    context: null,
    drawing: false,
    previousPoint: null,
  };

  function getSketchElements() {
    return {
      canvas: document.querySelector("#sketch-canvas"),
      surface: document.querySelector("#sketch-surface"),
      status: document.querySelector("#sketch-status"),
    };
  }

  function sketchCoordinates(event, canvas) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  function drawDefaultSketch() {
    const { canvas } = getSketchElements();
    if (!sketchState.context || !canvas.clientWidth || !canvas.clientHeight) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const context = sketchState.context;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(203, 231, 187, 0.74)";
    context.lineWidth = Math.max(2, width / 240);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(width * 0.08, height * 0.81);
    context.lineTo(width * 0.15, height * 0.79);
    context.lineTo(width * 0.23, height * 0.76);
    context.lineTo(width * 0.32, height * 0.66);
    context.lineTo(width * 0.4, height * 0.58);
    context.lineTo(width * 0.48, height * 0.42);
    context.lineTo(width * 0.57, height * 0.28);
    context.lineTo(width * 0.68, height * 0.22);
    context.lineTo(width * 0.78, height * 0.18);
    context.lineTo(width * 0.9, height * 0.16);
    context.stroke();
  }

  function resizeSketchCanvas() {
    const { canvas } = getSketchElements();
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * pixelRatio);
    canvas.height = Math.round(bounds.height * pixelRatio);
    sketchState.context = canvas.getContext("2d");
    sketchState.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawDefaultSketch();
  }

  function setupSketchpad() {
    const { canvas, surface, status } = getSketchElements();
    const cleanButton = document.querySelector("#clean-sketch");
    const resetButton = document.querySelector("#reset-sketch");

    const startDrawing = (event) => {
      event.preventDefault();
      surface.classList.remove("is-cleaned");
      status.textContent = "RECEIVING HUMAN INPUT…";
      sketchState.drawing = true;
      sketchState.previousPoint = sketchCoordinates(event, canvas);
      canvas.setPointerCapture?.(event.pointerId);
    };

    const continueDrawing = (event) => {
      if (!sketchState.drawing || !sketchState.context) return;
      const currentPoint = sketchCoordinates(event, canvas);
      sketchState.context.strokeStyle = "rgba(213, 235, 197, 0.9)";
      sketchState.context.lineWidth = Math.max(2, canvas.clientWidth / 230);
      sketchState.context.lineCap = "round";
      sketchState.context.beginPath();
      sketchState.context.moveTo(sketchState.previousPoint.x, sketchState.previousPoint.y);
      sketchState.context.lineTo(currentPoint.x, currentPoint.y);
      sketchState.context.stroke();
      sketchState.previousPoint = currentPoint;
    };

    const stopDrawing = () => {
      if (!sketchState.drawing) return;
      sketchState.drawing = false;
      sketchState.previousPoint = null;
      status.textContent = "ROUGH RELATIONSHIP RECEIVED";
    };

    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", continueDrawing);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    canvas.addEventListener("pointerleave", stopDrawing);

    cleanButton.addEventListener("click", () => {
      surface.classList.add("is-cleaned");
      status.textContent = "NORMALISED · LABELLED · READY TO INSPECT";
      playProjectorClick("reel");
    });

    resetButton.addEventListener("click", () => {
      surface.classList.remove("is-cleaned");
      status.textContent = "HUMAN INPUT READY";
      drawDefaultSketch();
    });

    resizeSketchCanvas();
  }

  function setupMicrophoneTest() {
    const microphoneButton = document.querySelector("#microphone-test");
    const microphoneStatus = document.querySelector("#microphone-status");
    const speechTest = microphoneButton.closest(".speech-test");

    microphoneButton.addEventListener("click", () => {
      presentationState.speechTimers.forEach(window.clearTimeout);
      presentationState.speechTimers = [];
      speechTest.classList.add("is-listening");
      microphoneStatus.textContent = "LISTENING…";
      microphoneButton.disabled = true;
      playProjectorClick("reel");

      presentationState.speechTimers.push(
        window.setTimeout(() => {
          microphoneStatus.textContent = "SIGNAL DETECTED.";
        }, 900),
        window.setTimeout(() => {
          microphoneStatus.textContent = "PLEASE SPEAK CLEARLY.";
          speechTest.classList.remove("is-listening");
          microphoneButton.disabled = false;
        }, 1850),
      );
    });
  }

  function handleBrokenImages() {
    document.querySelectorAll("img").forEach((image) => {
      image.addEventListener("error", () => {
        const figure = image.closest("figure, div");
        if (figure) figure.classList.add("image-unavailable");
        image.alt = `${image.alt || "Archival image"} (image unavailable)`;
      });
    });
  }

  function initialise() {
    totalReadout.textContent = String(slides.length).padStart(2, "0");
    closePanels();
    setupEstimateControl();
    setupWordField();
    setupSketchpad();
    setupMicrophoneTest();
    handleBrokenImages();

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("pointermove", showChrome, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("resize", resizeSketchCanvas);
    window.addEventListener("hashchange", () => {
      const hashIndex = parseHash();
      if (hashIndex !== presentationState.index) goToSlide(hashIndex, { silent: true });
    });

    document.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) runAction(actionButton.dataset.action);
    });

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === 0);
      slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");
    });

    goToSlide(parseHash(), { silent: true });
    window.setTimeout(() => app.classList.remove("is-chrome-active"), 2600);

    window.__symbiosisDeck = {
      next,
      previous,
      goToSlide,
      getState: () => ({ ...presentationState }),
      slides,
    };
  }

  initialise();
})();
