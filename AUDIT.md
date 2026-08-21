# Implementation Audit — Man–Computer Symbiosis

This audit records the approved 32-scene revision on `feat/wonder-cut-symbiosis`. The protected pre-feedback version remains available at `backup/pre-feedback-20260820-214451`. This document describes repository state; it does not imply deployment.

## Story and interaction status

| Area | Result |
|---|---|
| Opening | The Wonder Cut keeps the bright fig tree and independently identifies the *Pleistodontes* habitat photograph and separate *Blastophaga psenes* reference specimen. Scene 03 removes the label-swap/coupling graphic and cuts immediately to a full-black question naming both human and computer. The Mystery Cut remains selectable with `?opening=mystery`. |
| Leader | Scene 00's replay control is bottom-left and restarts the leader animation and procedural sound without reloading. |
| Aims and self-study | Scenes 07–10 retain the two aims, begin Scene 08 with its dossier rather than an empty build, and present “about 85%” as Licklider's qualified self-estimate. |
| Graph sequence | Scenes 11–13 visibly identify their invented records, calculations, and curve as illustrative reconstructions. Scene 12 remains manual under reduced motion, Scene 13 is silent, and Scene 14 is explicitly a provisional presentation interpretation. |
| Working exchange | Scene 16 presents its builds in chronological DOM order while showing goal, hypothesis, criterion, machine operations, evidence/anomaly/alternative, evaluation, and the better next question. Scene 17 marks its apparent pattern as a possible relation requiring human review. |
| Room prompt | Scene 18 shows at most three temporary responses. Copy, CSV, Print, persistence, download, and transmission behavior have been removed. |
| Prerequisite reel | Scenes 19–25 form a causal argument and distinguish reconstruction from history: the Scene 19 break; a meaningful time-sharing diagram beside a dated 1970 image; a 2009 drawer analogy separated from Licklider's trie-like proposal; goal-level language with both §5.4 approaches retained in notes; dated 1969/1964 display images; an explicitly contemporary and conditional speech demo; then the prerequisites synthesis and relationship question. |
| Relationship | Scene 26 uses the paper's mechanical extension / humanly extended machine / symbiotic partnership distinctions. Scene 27 labels tool / servant / partner as contemporary discussion vocabulary and reveals a deeper question without recording a tally. |
| Ending | Scene 28 preserves the existing production artifacts, frames them as situated testimony, replaces them completely at Build 4, and displays Licklider's complete §4 sentence. Scene 29 owns the final spoken words under a sharply subtracted score. Scene 30 transports three real photographs through a fixed film gate and reveals an enlarged, attributed “productive and thriving partnership” without another speech or full-screen image transition. |
| Notes and sources | All 32 embedded notes and `speaker-notes.md` distinguish quotations, interpretation, reconstructions, analogies, and later images. `SOURCES.md` now carries the complete Scene 28 quotation and the two §5.4 language approaches. `presenter-cues.md` provides a short preflight and run-of-show reference. |
| Accessibility and controls | Inactive scenes, closed panels, and the gated presentation are inert; panel controls expose state and restore focus; Scene 03 hides superseded content from assistive technology; build changes are announced; and Scene 12 respects reduced motion without collapsing its argument. |
| Sound | The scene/build-reactive score has addressable projector and motor levels, true silence at Scene 03 Build 3 and Scene 13, a quiet Scene 19 break, no generic cue on every build, subtraction at Scene 29 Build 2, and score ducking during recognition and speech playback. |

## Verification

| Check | Result |
|---|---|
| Static structure | 32 sequential scenes, 32 embedded speaker-note records, final indicator `00 / 31`, and clean `node --check presentation.js`. |
| Local assets | Playwright verifies every image loads with non-zero dimensions. |
| Opening variants | Automated coverage verifies Wonder default, Mystery alternate, technical specimen build, full-black Scene 03 question, title withholding, and leader replay. |
| Core argument | Automated coverage exercises the graph automation, two-way Scene 16 exchange, published-memory retrieval sequence, causal prerequisite chain, three-card temporary prompt, relationship follow-up, iterative making-of evidence, interim quotation, and photographic final coda. |
| Removed behavior | Automated coverage verifies the Scene 18 record is capped, has no export controls, and disappears on reload; Scene 27 writes no local-storage tally. |
| Speech | Automated coverage verifies unsupported-browser text fallback, mocked SpeechRecognition and synthesis, and score ducking across recognition/playback start and completion. |
| Viewport scope | The complete deck suite runs at 1600×900 desktop and 1366×768 laptop. A separate 390×844 project verifies the intended wide-screen gate instead of treating portrait mobile as a presentation target. |
| Runtime and navigation | Direct final-build navigation across all 32 scenes completes without page or console errors and keeps scene bounds within each viewport. |
| Automated result | **35 Playwright tests passed** in the post-revision suite, including both wide-screen resolutions, the mobile gate, Web Audio arming/profiles, reduced motion, accessibility states, and both speech paths. |
| Rehearsal capture | Initial and final desktop captures and contact sheets completed for all 32 scenes. A narrow-screen review led to the explicit desktop/wide-device gate; portrait is no longer a supported presentation surface. |

## Remaining live rehearsal

- Sound-check the dynamic score in the actual room; automated tests verify mappings but do not establish perceived loudness. Confirm that Scene 03 and Scene 13 truly read as silence, Scene 12 creates pressure, Scene 19 breaks the rhythm, Scene 29 subtracts beneath the quotation, and Scene 30 resolves without competing with the room.
- Preflight Scene 24 in the exact managed browser, account, and network. Browser- or vendor-operated speech services may process audio. Coordinate with CART/live-caption staff, and use the visible text fallback immediately if permission or recognition delays the room.
- Rehearse Scene 29 so the personal “golden age” interpretation comes before the exact quotation; Licklider's attributed sentence should remain the last spoken line.
- Rehearse Scene 30's silence and timing: let each short film transport settle, then give the final real-wasp frame and partnership phrase enough time before credits.
