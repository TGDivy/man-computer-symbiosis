# Implementation Audit — Man–Computer Symbiosis

This audit records the approved 32-scene revision on `feat/wonder-cut-symbiosis`. The protected pre-feedback version remains available at `backup/pre-feedback-20260820-214451`. No commit, push, or deployment is implied by this document.

## Story and interaction status

| Area | Result |
|---|---|
| Opening | The Wonder Cut keeps the bright fig tree and real habitat wasp while restoring the technical specimen slide, measurement rule, and *Blastophaga psenes* label. Scene 03 removes the label-swap/coupling graphic and cuts to a full-black question naming both human and computer. The Mystery Cut remains selectable with `?opening=mystery`. |
| Leader | Scene 00's replay control is bottom-left and restarts the leader animation and procedural sound without reloading. |
| Aims and self-study | Scenes 07–10 retain the two aims, 1957 self-study, preparatory operations, and properly qualified 85 percent finding. |
| Graph sequence | Scenes 11–14 preserve the incompatible measures, deliberately slow clerical conversion, immediate clean graph, and interpretive manifesto. |
| Working exchange | Scene 16 restores physical card movement while showing goal, hypothesis, criterion, machine operations, evidence/anomaly/alternative, evaluation, and the better next question. Scene 17 develops the return through alternative plots. |
| Room prompt | Scene 18 shows at most three temporary responses. Copy, CSV, Print, persistence, download, and transmission behavior have been removed. |
| Prerequisite reel | Scenes 19–25 now form a causal argument: the missing real-time machine; availability during thought; memory plus retrieval; goals rather than fixed routes; a shared surface briefly scaled to a team; speech; then Licklider's “prerequisites” synthesis and relationship question. |
| Relationship | Scene 26 uses the paper's mechanical extension / humanly extended machine / symbiotic partnership distinctions. Scene 27 restores the large tool / servant / partner cards and reveals a deeper spoken question without recording a tally. |
| Ending | Scene 28 uses this presentation's real storyboard/build/test/critique/revision loop as a contemporary exchange and ends on Licklider's “difficult to separate neatly” quotation. Scene 29 gives the uncertain interim its proper context and owns the final spoken words. Scene 30 transports three real photographs through a fixed film gate and reveals “productive and thriving partnership” without another speech or full-screen image transition. |
| Notes and sources | All 32 embedded notes are expanded; `speaker-notes.md` contains full rehearsal language, pacing, transitions, sound, quote status, and paper sections—including the precise §5.2–5.3 context for Scene 21. `SOURCES.md` maps the revised sequence, direct textual examples, image use, and biological caveats. |
| Sound | A scene/build-reactive procedural score combines six motifs with stereo spread, reverb, an adjustable narrative pulse, accumulating prerequisite voices, physical cues, strategic silence, and a coda resolution above the projector base. |

## Verification

| Check | Result |
|---|---|
| Static structure | 32 sequential scenes, 32 embedded speaker-note records, final indicator `00 / 31`, and clean `node --check presentation.js`. |
| Local assets | Playwright verifies every image loads with non-zero dimensions. |
| Opening variants | Automated coverage verifies Wonder default, Mystery alternate, technical specimen build, full-black Scene 03 question, title withholding, and leader replay. |
| Core argument | Automated coverage exercises the graph automation, two-way Scene 16 exchange, published-memory retrieval sequence, causal prerequisite chain, three-card temporary prompt, relationship follow-up, iterative making-of evidence, interim quotation, and photographic final coda. |
| Removed behavior | Automated coverage verifies the Scene 18 record is capped, has no export controls, and disappears on reload; Scene 27 writes no local-storage tally. |
| Speech | Automated coverage verifies both unsupported-browser text fallback and mocked SpeechRecognition plus speech-synthesis playback. |
| Viewport scope | The complete deck suite runs at 1600×900 desktop and 1366×768 laptop. A separate 390×844 project verifies the intended wide-screen gate instead of treating portrait mobile as a presentation target. |
| Runtime and navigation | Direct final-build navigation across all 32 scenes completes without page or console errors and keeps scene bounds within each viewport. |
| Automated result | **31 Playwright tests passed** in the final wide-screen-gated suite, including live Web Audio arming and narrative-profile checks. |
| Rehearsal capture | Initial and final desktop captures and contact sheets completed for all 32 scenes. A narrow-screen review led to the explicit desktop/wide-device gate; portrait is no longer a supported presentation surface. |

## Remaining live rehearsal

- Sound-check the dynamic score in the actual room; it is intentionally restrained and may need speaker-volume adjustment rather than code changes. Confirm that the Scene 12 pressure, Scene 19 break, Scene 29 subtraction, and Scene 30 resolution remain audible without competing with speech.
- Grant microphone permission in the presentation browser before relying on live recognition. The visible text fallback remains available.
- Rehearse Scene 29 so the personal “golden age” interpretation comes before the exact quotation; Licklider's attributed sentence should remain the last spoken line.
- Rehearse Scene 30's silence and timing: let each short film transport settle, then give the final real-wasp frame and partnership phrase enough time before credits.
