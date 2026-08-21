# Implementation Audit — Man–Computer Symbiosis

This audit records the approved 35-scene revision implemented on the working branch. The untouched pre-feedback baseline remains available at **backup/pre-feedback-20260820-214451**.

## Story and interaction status

| Area | Result |
|---|---|
| Opening | Wonder Cut is the default: bright fig tree, real wasp in fig, clear symbiosis build. The prior mystery emphasis remains at **?opening=mystery**. |
| Leader | Scene 00 has a replay control that resets the leader animation and procedural audio without reload. |
| Aims and self-study | Scenes 07–10 replace the confusing field-study/dial sequence with two aims, the 1957 self-study, legible preparatory work, then the 85 percent finding. |
| Graph sequence | Scenes 11–14 establish one question, incompatible measures, clerical normalization, clean insight, and the manifesto. |
| Division of work | Scenes 15–18 make the human/machine handoff readable and preserve all audience responses locally. |
| Prerequisites | Scenes 19–27 cover time sharing, the thinking center, durable published memory, retrieval, goals versus courses, common surface, shared display, real browser speech, and familiar infrastructure. |
| Argument and coda | Scenes 28–34 distinguish extension, semi-automation, and partnership; add the interim; state the division of work; return to the real fig/wasp; and preserve credits. |
| Assets | Selected archival sources are recorded in SOURCES.md. Server-rack imagery and Apocrypta images are excluded. |

## Verification

| Check | Result |
|---|---|
| Scene and note count | 35 scenes and 35 embedded speaker-note records. |
| Local assets | Playwright verifies every image has loaded dimensions. |
| Wonder and Mystery cuts | Automated coverage verifies default and alternate opening modes. |
| Replay and progressive builds | Automated coverage exercises the replay leader, symbiosis, graph sequence, division of work, and direct scene navigation. |
| Audience records | Automated coverage verifies local persistence, CSV copying with real line breaks, and browser download. |
| Speech interaction | Automated coverage verifies unsupported-browser fallback and mocked SpeechRecognition path. |
| Responsive scope | Playwright suite runs at desktop, laptop, and 390 by 844 mobile viewports. |
| Runtime errors | Direct navigation over all 35 scenes completes without page or console errors. |
| Rehearsal captures | The updated capture tool generated initial and final image sets plus contact sheets for all 35 scenes. |

## Latest validation

- Playwright: 33 passed across the three Chromium viewports.
- Capture: completed successfully with the updated 35-scene capture utility.
- Visual inspection: final states reviewed from the generated desktop contact sheet; mobile states were separately reviewed during implementation.
- Static local presentation: http://127.0.0.1:4173

## Remaining live rehearsal

- Sound-check the procedural projector mix in the room.
- Grant microphone permission in the presentation browser before relying on live speech recognition; the visible text fallback remains available.
- Decide whether to show audience response records during discussion or only use their Copy, CSV, and Print controls after the room exercise.
