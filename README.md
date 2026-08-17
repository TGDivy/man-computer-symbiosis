# Man–Computer Symbiosis — Found-Film Workprint

A 27-scene live-screening presentation built from J. C. R. Licklider’s 1960 paper “Man-Computer Symbiosis.” The redesign begins as an unidentified educational film about a fig and withholds the paper title until Scene 04.

## Live Workprint

- GitHub Pages: <https://www.divyb.xyz/man-computer-symbiosis/>
- Repository: <https://github.com/TGDivy/man-computer-symbiosis>
- GitHub Pages alias: <https://tgdivy.github.io/man-computer-symbiosis/>
- BBGitHub Pages: <https://bbgithub.dev.bloomberg.com/pages/dbramhecha/man-computer-symbiosis/>
- BBGitHub mirror: <https://bbgithub.dev.bloomberg.com/dbramhecha/man-computer-symbiosis>

The project is being published in reel-sized checkpoints. Scenes 00–20 contain the rebuilt opening, graph, SYMBIOTE™, reel-change, shared-desk, and thinking-center sequences; Scenes 21–26 are intentionally marked as workprint assembly cards until the final checkpoint lands.

## Presenting Locally

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>. The first keypress or click arms the projector and browser audio; the visible frame remains pure black before that gesture.

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

The control strip stays hidden during playback unless the pointer moves or a control receives focus. URL hashes such as `#scene-04`, reduced-motion preferences, silent presentation, and print output are supported.

## Creative Source of Truth

`presentation.md` contains the complete 27-scene storyboard, non-negotiable narrative rules, sound grammar, opening cue sheet, scholarship rules, and definition of done.

The redesign deliberately keeps modern AI imagery off screen. It is about the paper’s stranger partnership argument, not a prophecy reel.

## Research Integrity

- The complete primary paper was read before design.
- Quotes, close paraphrases, presentation interpretations, fictional product copy, and reconstructions are distinguished.
- Authentic or openly licensed images are logged in `SOURCES.md` with creator, rights, source URL, local filename, and scene usage.
- New biological opening assets are photographs rather than generated “archival” substitutes.
- SYMBIOTE™, the graph data, and future-machine diagrams are transparently identified as reconstructions.

## Technical Design

- Dependency-free static HTML, CSS, and JavaScript at runtime
- Procedural Web Audio projector, leader pops, title chord, and machine cues
- Presenter-controlled progressive builds and deterministic rehearsal API
- Keyboard, touch, fullscreen, speaker notes, references, direct hashes, and reduced motion
- Relative asset paths suitable for project-site GitHub Pages
- Playwright coverage at 1600×900 and 1366×768

## Verification

```bash
npm install
npx playwright install chromium
npm test
```

Every push to `main` runs the two-viewport Playwright suite, deploys the static site to GitHub Pages, and then runs the desktop Playwright suite against the deployed URL.

To run Playwright locally and push the same clean `main` checkpoint to both GitHub and BBGitHub, use:

```bash
npm run publish:checkpoint
```

BBGitHub does not run GitHub Actions. Its native Pages service rebuilds directly from the mirrored `main` branch after the checkpoint script pushes it.

Generate rehearsal captures and contact sheets with:

```bash
npm run capture
```
