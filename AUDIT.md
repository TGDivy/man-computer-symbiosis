# Redesign Audit — Opening and Graph-Reel Checkpoint

This is a workprint audit, not a final compliance claim. It records what is live after the second redesign checkpoint and makes unfinished scenes explicit.

## Checkpoint Scope

| Item | Evidence | Status |
|---|---|---|
| New storyboard replaces old ask | `presentation.md` defines 27 scenes and seven frame-level opening cue sheets | Complete |
| Audience initially does not know the subject | Scene 00 is an unidentified leader; Scenes 01–03 contain fig, wasp, and symbiosis only | Complete |
| Paper title withheld until Scene 04 | Automated title-withholding test plus visual review | Complete |
| Projector starts from pure black | No visible preflight UI; first gesture arms leader and audio | Complete |
| Countdown sound works under autoplay rules | Procedural Web Audio starts from the presenter gesture | Complete |
| Authentic photographic fig and wasp material | Four licensed photographs logged in `SOURCES.md` | Complete |
| Scene 05 dramatizes batch computing | Six builds cover formulate, explain, compute, output, paper, repeat | Complete |
| Scene 06 creates first philosophical turn | Full-frame `WHAT IS THE QUESTION?` with machine sound removed | Complete |
| Scenes 07–09 stage the self-study and audience estimate | Physical dossier, interactive local dial, and isolated `85%` reveal | Complete |
| Scenes 10–12 make clerical delay experiential | Six incompatible sheets, timed conversion sequence, and clean graph | Complete |
| Scene 13 lands the interpretive manifesto | Two presenter-controlled beats on black | Complete |
| All planned scenes have stable rehearsal addresses | `scene-00` through `scene-26` and URL hashes | Complete |
| Unbuilt material is honestly represented | Scenes 14–26 use a consistent visible `WORKPRINT` treatment | Complete |

## Scene Assembly Status

| Scenes | Reel | State |
|---|---|---|
| 00–06 | Leader and opening biological/computing reveal | Finished checkpoint |
| 07–13 | Thinking experiment, 85%, and graph sequence | Finished checkpoint |
| 14–17 | SYMBIOTE™ and audience experiment #2 | Workprint cards; next build |
| 18–20 | Reel change, future desk, thinking center | Workprint cards |
| 21–26 | Anti-prophecy turn, partnership thesis, ending | Workprint cards |

## Scholarship

| Requirement | Evidence | Status |
|---|---|---|
| Full paper read before design | Primary-paper record and section-specific notes | Complete |
| Quote, paraphrase, interpretation, fiction separated | `SOURCES.md`, `speaker-notes.md`, and embedded scene notes | Complete for finished scenes |
| Opening claim follows the paper | Scenes 01–03 closely track the paper’s opening biological analogy | Complete |
| Interpretive manifesto not passed as quotation | Scene 13 embedded notes and `speaker-notes.md` identify it as presentation interpretation | Complete |
| Reconstructed imagery identified | Leader, laboratory label, SYMBIOTE™, graph data, and future diagrams are labelled reconstruction/fiction | Complete |

## Direction and Design

| Requirement | Evidence | Status |
|---|---|---|
| Found educational film, not retro UI | Full-frame scenes, optical title, physical dossiers, graph paper, ruler, grease pencil, and gate weave | Complete for Scenes 00–13 |
| Explanation remains primarily verbal | Fig, title, and question frames contain no explanatory paragraphs | Complete |
| Small physical motion vocabulary | Hard cut, splice, optical title, leader, card placement, paper feed | Complete |
| Sound is narrative and optional | Projector leader, title chord, machine cues, clerical sequence, `M` mute, silent fallback | Opening and graph pass complete |
| No modern AI imagery | No modern interface, chatbot, logo, or AI claim appears | Complete |
| Target viewports remain legible | Manual review at 1600×900 and 1366×768 | Complete |

## Runtime and Deployment

| Check | Evidence | Status |
|---|---|---|
| 27 scenes and 27 embedded note records | Playwright count checks | Pass |
| All local images load | Playwright natural-width check | Pass |
| Progressive builds and reverse navigation | Specimen, definition, batch-process, graph, and manifesto tests | Pass |
| Notes, references, sound, hashes | Playwright interaction checks | Pass |
| Runtime errors and viewport bounds | All-scene loop in both Chromium projects | Pass |
| Local automated result | `npm test`: 20 tests across two viewports | Pass after final rerun |
| GitHub Pages pipeline | Verify → deploy → deployed-site Playwright | Configured |
| Public URL | <https://www.divyb.xyz/man-computer-symbiosis/> | Active |
| BBGitHub mirror and Pages | Native Pages sourced from mirrored `main` | Active |

## Remaining Definition of Done

- Replace the remaining 13 workprint cards with storyboarded scenes.
- Rehearse the 85% and graph sequence at its intended 4–5 minute dramatic duration.
- Build all three audience interactions without network dependencies.
- Complete the recurring straight-faced SYMBIOTE™ product language.
- Add future desk and thinking-center physical diagrams.
- Complete the anti-prophecy turn, partnership thesis, fig return, and credits.
- Finish the scene-specific soundtrack and final audio balance.
- Expand this workprint audit into the final 27-scene requirement audit.
