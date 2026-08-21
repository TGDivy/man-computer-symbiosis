# Man–Computer Symbiosis — Found-Film Presentation

A 32-scene live-screening presentation built from J. C. R. Licklider’s 1960 paper “Man-Computer Symbiosis.” The default Wonder Cut begins with a bright fig tree, a real fig wasp, and a restored scientific specimen-card sequence before withholding the paper title until Scene 04.

## Live Presentation

- GitHub Pages: <https://www.divyb.xyz/man-computer-symbiosis/>
- Repository: <https://github.com/TGDivy/man-computer-symbiosis>
- GitHub Pages alias: <https://tgdivy.github.io/man-computer-symbiosis/>
- BBGitHub Pages: <https://bbgithub.dev.bloomberg.com/pages/dbramhecha/man-computer-symbiosis/>
- BBGitHub mirror: <https://bbgithub.dev.bloomberg.com/dbramhecha/man-computer-symbiosis>

All 32 storyboarded scenes are implemented. The film moves from the replayable leader and biological opening through the 85% graph sequence, SYMBIOTE™, one working exchange, the prerequisites for real-time cooperation, a live speech demonstration, this deck's own making as a case study, Licklider's optimistic interim, and a quiet photographic fig/wasp coda.

## Presenting Locally

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>. The first keypress or click arms the projector and browser audio; the visible frame remains pure black before that gesture. Add **?opening=mystery** to the URL for the preserved alternate opening.

The film is composed for a wide screen. Narrow, short, and portrait viewports show a desktop/wide-device notice instead of presenting a compromised mobile layout.

### Controls

- `Space`, `Enter`, or `→`: start projector, then advance build or scene
- `←`: previous build or scene
- `Home` / `End`: first or final scene
- `M`: mute or restore local projector sound
- `N`: embedded speaker notes
- `R`: reference and asset panel
- `F`: fullscreen
- `?`: keyboard help
- Horizontal swipe: touch navigation

The control strip stays hidden during playback unless the pointer moves or a control receives focus. URL hashes such as `#scene-04`, reduced-motion preferences, and silent presentation are supported.

## Creative Source of Truth

**presentation.md** contains the current 32-scene storyboard, delivery contract, interaction model, sound structure, and visual guardrails. **speaker-notes.md** is the full rehearsal copy with suggested language, pacing, transitions, quote status, and paper-section references for every scene.

The redesign deliberately keeps modern AI imagery off screen. It is about the paper’s stranger partnership argument, not a prophecy reel.

## Research Integrity

- The complete primary paper was read before design.
- Quotes, close paraphrases, presentation interpretations, fictional product copy, and reconstructions are distinguished.
- Authentic or openly licensed images are logged in `SOURCES.md` with creator, rights, source URL, local filename, and scene usage.
- New biological opening assets are photographs rather than generated “archival” substitutes.
- SYMBIOTE™, the graph data, and future-machine diagrams are transparently identified as reconstructions.

## Technical Design

- Dependency-free static HTML, CSS, and JavaScript at runtime
- Scene/build-reactive procedural Web Audio: projector texture, stereo harmonic motifs, accumulating prerequisite voices, a narrative pulse, reverberant transitions, and film-transport cues
- Presenter-controlled progressive builds and deterministic rehearsal API
- Keyboard, touch, fullscreen, speaker notes, references, direct hashes, and reduced motion
- Relative asset paths suitable for project-site GitHub Pages
- Playwright coverage for the full deck at desktop and laptop sizes, plus explicit wide-screen-gate validation at 390×844

## Verification

```bash
npm install
npx playwright install chromium
npm test
```

Every push to `main` runs the Playwright suite, deploys the static site to GitHub Pages, and then runs the desktop Playwright suite against the deployed URL.

To run Playwright locally and push the same clean `main` checkpoint to both GitHub and BBGitHub, use:

```bash
npm run publish:checkpoint
```

BBGitHub does not run GitHub Actions. Its native Pages service rebuilds directly from the mirrored `main` branch after the checkpoint script pushes it.

Generate rehearsal captures and contact sheets with:

```bash
npm run capture
```
