# Man–Computer Symbiosis — A Lost Film

An interactive 22-scene presentation built from J. C. R. Licklider’s 1960 paper “Man-Computer Symbiosis.” It is art-directed as a restored instructional/science film rather than a conventional slide deck.

## Presenting

Serve the directory over HTTP, then open `index.html`:

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>.

### Controls

- `→` / `Space`: next build or scene
- `←`: previous build or scene
- `Home` / `End`: first or final scene
- `N`: embedded speaker notes
- `R`: reference and asset panel
- `S`: optional projector sounds
- `F`: fullscreen
- `?`: keyboard help
- Horizontal swipe: touch navigation

The deck also supports the visible control strip, URL hashes such as `#scene-10`, reduced-motion preferences, and print-to-PDF styles.

## Interactive Checkpoints

1. What did people in 1960 think computers were for?
2. What percentage of your working day do you actually spend thinking?
3. What do you do in order to think that you frequently mistake for thinking?

The final checkpoint includes a presenter-operated local word field. Entries remain in that browser’s local storage and are never transmitted.

## Research Integrity

- The complete primary paper was read before design.
- Every quotation is checked against the MIT-hosted full text.
- Quotes, paraphrases, interpretation, and illustrative reconstruction are visibly distinguished.
- Historical photographs and illustrations are authentic and recorded in `SOURCES.md`.
- The graph data, SYMBIOTE™ product, desk interface, and microphone test are clearly labelled reconstructions.

See `speaker-notes.md` for delivery guidance and `SOURCES.md` for the quote audit, archival links, creators, licences, and intended slide use.

## Technical Design

- Dependency-free HTML, CSS, and JavaScript at runtime
- 16:9 screen with a recurring projected 4:3 archival frame
- Progressive builds, film-splice/reel/overexposure transition vocabulary
- Canvas-based shared-surface sketch demonstration
- Fake microphone interaction with no permission request
- Keyboard, touch, fullscreen, notes, references, and accessible announcements
- GitHub Pages deployment via `.github/workflows/pages.yml`

## Verification

```bash
npm install
npx playwright install chromium
npm test
```

Playwright verifies scene navigation, build progression, notes/references, audience input, the sketch interaction, responsive bounds, missing assets, console errors, and screenshot output.
