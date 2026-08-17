# MAN–COMPUTER SYMBIOSIS

## A film in several reels concerning figs, machines, graphs, questions, and the future

This document is the creative source of truth for a complete redesign of the presentation.

It supersedes the previous brief and presentation structure. The redesign is a restart, not a reskin. The previous version remains available in Git history, but its scene order, opening, visual hierarchy, and narrative grammar must not constrain this version.

Read J. C. R. Licklider’s full 1960 paper before making interpretive decisions:

<https://groups.csail.mit.edu/medg/people/psz/Licklider.html>

Do not rely on summaries where the paper itself is available.

---

# 1. THE CREATIVE CONTRACT

The audience must not initially know that they are being given a presentation about a 1960 computer-science paper.

The experience begins as though somebody found a strange educational film reel in a cupboard and has decided to screen it without explanation.

It should feel like:

- an art-directed short film presented live
- an actual 1950s/60s scientific or institutional film
- serious ideas delivered with curiosity and deadpan absurdity
- a physical object with dust, joins, reel changes, damage, and machinery
- a sequence in which many frames contain no explanation whatsoever

It must not feel like:

- a corporate presentation
- a “retro UI” theme
- an AI keynote
- a paper summary
- a chronology of inventions
- a prophecy slideshow
- a slideshow with film grain placed on top
- a collection of modern interfaces dressed in beige

The working runtime is **20–25 minutes**, excluding discussion.

The working title is:

> **MAN–COMPUTER SYMBIOSIS**<br>
> *A film in several reels concerning figs, machines, graphs, questions, and the future.*

---

# 2. THE THESIS WE EARN, NOT ANNOUNCE

The presentation gradually leads the audience to this interpretation:

> **Computers are most interesting when they reduce the distance between interesting thoughts.**

The machine does not need to have the insight. It can perform the tedious transformations required before insight becomes possible.

The final formulation is not:

> `QUESTION → MACHINE → ANSWER`

It is:

> `QUESTION → MACHINE → THING TO THINK ABOUT → BETTER QUESTION → …`

Symbiosis is therefore not primarily about shortening the route from question to answer. It shortens the clerical distance between **question, observation, and the next question**.

Do not state this thesis at the beginning. The audience should discover it through the fig, the time-and-motion study, the graph, SYMBIOTE™, and the closing question.

---

# 3. NON-NEGOTIABLE STORY RULES

1. **The fig comes first.** Do not open with Licklider, MIT, 1960, the paper title, an agenda, or “today I will discuss.”
2. **The title is withheld until Scene 4.** The subject is discovered rather than announced.
3. **The 85% and graph sequence is the emotional centre.** Scenes 7–13 should occupy roughly 4–5 minutes.
4. **Waiting is part of the argument.** The clerical graph sequence must be long enough to become slightly uncomfortable.
5. **SYMBIOTE™ is played completely straight.** It is a recurring fictional 1960s product, not a meme or mascot.
6. **Modern AI stays almost entirely off screen.** No ChatGPT screenshots, Copilot logos, chatbot bubbles, or claim that LLMs fulfil Licklider’s dream.
7. **Prediction is not the point.** Familiar-seeming technologies are acknowledged and then explicitly displaced by the partnership argument.
8. **Slides may refuse to explain themselves.** The presenter supplies interpretation verbally.
9. **Use authentic material culture.** Botanical specimens, macro insects, paper, rulers, CRT bloom, punched cards, oscilloscopes, machine rooms, grease pencil, photographed diagrams, and physical printouts—not generic “vintage” decoration.
10. **The ending is a question.** Do not resolve the talk with a summary or corporate Q&A slide.

---

# 4. VISUAL WORLD

The image world should draw from actual mid-century scientific and institutional material:

- botanical and specimen photography
- extreme macro insect photography
- educational-film leaders and countdowns
- laboratory footage and machine-room photography
- paper, graph paper, index cards, punched cards, rulers, and grease pencil
- photographed diagrams mounted slightly crooked
- CRT bloom, oscilloscope traces, reel-to-reel tape, and microfilm
- typewritten forms, research cards, library labels, and government questionnaires
- film dust, scratches, gate weave, splice flashes, reel-change circles, and projector burn
- restrained cream, carbon black, oxidised green, warning red, faded cyan, and paper tan

The visual effect must come from composition, material, motion, and pacing—not simply an overlay.

Use authentic, public-domain, Creative Commons, or otherwise appropriately licensed archival assets wherever practical. Do not silently present generated imagery as archival evidence. Any reconstruction must be identified in the references and speaker notes.

Exact fonts, crops, image selections, and interface styling are intentionally deferred until this storyboard is committed.

---

# 5. PERFORMANCE AND CONTROL GRAMMAR

The presentation is a live screening controlled by the presenter.

- `Enter`, `Space`, `ArrowRight`, click, or tap advances a build or scene.
- `ArrowLeft` returns to the previous build or scene.
- `F` toggles fullscreen.
- `M` toggles all sound.
- `N` opens speaker notes.
- `R` opens references.
- `Escape` closes panels or exits fullscreen.
- Direct scene links remain available for rehearsal.

All explanatory controls disappear during normal playback. No permanent slide counter, progress bar, toolbar, thumbnail rail, or corporate chrome should compete with the film.

The first user gesture arms the projector and audio. Before that gesture, the screen remains truly black. This both preserves the theatrical opening and satisfies browser autoplay rules.

Every scene needs:

- a stable scene ID from `scene-00` through `scene-26`
- speaker notes containing purpose, delivery, scholarship, transition, timing, and source status
- deterministic build states for rehearsal and Playwright
- a reduced-motion rendering that preserves meaning
- a silent fallback that remains fully intelligible

---

# 6. SOUND GRAMMAR

Sound is part of the storytelling, not wallpaper.

The presentation should use an original/procedural or properly licensed local soundtrack. It must not depend on streaming services or network availability during a talk.

## Recurring sound motifs

- **Projector:** low mechanical flutter and intermittent gate chatter; present at the beginning, reel change, and credits rather than continuously at full volume.
- **Leader:** countdown pops, brief hiss, splice clicks, and a short tone before picture.
- **Biology:** near-silence, faint room/field texture, and one delicate specimen-film cue.
- **Clerical work:** paper movement, pencil, ruler, adding-machine ticks, printer/chatter, and deliberately repetitive pulses.
- **Insight:** the clerical rhythm stops. Silence precedes the clean graph. A restrained harmonic bloom may arrive only after the audience has looked.
- **SYMBIOTE™:** a cheerfully overconfident institutional product-film motif, used sparingly and always straight-faced.
- **Thinking center:** widening bandwidth-like tone and relay impulses moving across stereo space.
- **Projector burn:** abrupt flutter, pitch instability, snap, then silence.
- **Credits:** light period-appropriate original cue or a dry mechanical reprise.

Sound must never obscure the presenter. Default levels should be conservative, and mute state must persist for the session.

---

# 7. COMPLETE SCENE STORYBOARD

## Scene 0 — The projector starts

**Screen:** Black. A film leader appears: `8…7…6…`. Dust, scratches, splice flashes, and possibly `PROPERTY OF ——— RESEARCH LABORATORY`.

**Room:** The presenter says nothing and does not introduce the talk.

**Motion:** The first gesture starts the mechanism, leader, and countdown. Picture intermittently slips out of registration. The final number cuts to black rather than revealing a title.

**Sound:** Projector motor catches, leader hiss, countdown pops, and one splice click.

**Purpose:** Establish immediately that this is a screening, not a deck.

## Scene 1 — A fig

**Screen:** A full-frame, beautiful, slightly uncanny fig tree or cut fig. No title, caption, date, or paper reference.

**Room:** “I want to begin with a computer scientist talking about… figs.”

**Motion:** Almost none. A barely perceptible optical push may reveal the structure inside the fruit.

**Sound:** Projector settles; the sound field becomes sparse.

**Purpose:** Productive confusion.

## Scene 2 — A wasp

**Screen:** An extreme macro photograph of a fig wasp. A specimen-film label arrives: `BLASTOPHAGA`.

**Room:** Explain Licklider’s opening analogy: the fig and insect depend on one another; he uses this biological relationship to introduce symbiosis.

**Motion:** A measurement rule, registration mark, or specimen pointer enters physically rather than as modern UI.

**Sound:** A dry label-stamp or optical-printer click.

**Purpose:** Use the paper’s own wonderfully cinematic opening.

## Scene 3 — SYMBIOSIS

**Screen:** Fig and wasp together. A dictionary-style definition is physically typed onto the frame. After a beat: `TWO DISSIMILAR ORGANISMS.`

**Room:** “And then Licklider asks: what if one of the organisms is us… and the other is a computer?”

**Motion:** Definition appears line by line with imperfect typewriter alignment. The two images move into a shared frame only at the end.

**Sound:** Typewriter strikes, carriage return, then silence on “computer.”

**Purpose:** First dramatic reveal.

## Scene 4 — Title card, finally

**Screen:** Hard cut to black. Huge cream lettering: `MAN–COMPUTER SYMBIOSIS`. Beneath it, very small: `J. C. R. LICKLIDER — 1960`. Reel-change circle in the corner.

**Room:** This is the first moment when the presenter may identify Licklider or contextualise the paper.

**Motion:** Title lands as a physical optical title, not a web animation. The subtitle waits one beat.

**Sound:** Short institutional title chord, projector flutter, then down.

**Purpose:** Reveal the subject only after curiosity has been established.

## Scene 5 — THE COMPUTER, 1960

**Screen:** Archival room-sized machine imagery: operator, tape reels, printer output. A long accordion-fold strip of paper snakes across the frame.

**Room:** Describe Licklider’s complaint: formulate a problem, spend the next day with a programmer, compute later, receive mountains of output, then discover another experiment is needed.

**Motion:** Each stage enters like a shot in a montage. The paper strip becomes excessive enough to be comic.

**Sound:** Tape spin, card/printer clatter, paper feed, and a final exhausted stop.

**Purpose:** Establish what “using a computer” meant before his imagined interaction.

## Scene 6 — WHAT IS THE QUESTION?

**Screen:** Everything disappears. One sentence fills the frame: `WHAT IS THE QUESTION?`

**Room:** Explain his distinction between solving an already formulated problem and helping a person formulate the problem itself—one of the paper’s two central aims.

**Motion:** No ornamental movement. Hold long enough for the question to change meaning.

**Sound:** Machine noise cuts completely. Optional low room tone only.

**Purpose:** First philosophical turn.

## Scene 7 — FIELD STUDY: ONE THINKING HUMAN

**Screen:** A fake laboratory card: `SUBJECT: J.C.R.L.` / `ACTIVITY: THINKING` / `YEAR: 1957`, with clipboard and time-study marks.

**Room:** Tell the story of Licklider using himself as the subject of an informal time-and-motion study.

**Motion:** Stamps and handwritten observations accumulate with deadpan seriousness.

**Sound:** Clipboard, pencil, date stamp.

**Purpose:** Comedic change of pace and factual setup.

## Scene 8 — Audience experiment #1

**Screen:** A giant blank physical dial from `0%` to `100%`.

**Room:** Ask: “Of the time you call thinking at work, how much do you reckon is actually spent thinking?” Take shouted answers or hands. Do not reveal Licklider’s result immediately.

**Motion:** The presenter may record several guesses as grease-pencil ticks. The interaction must also work without typing anything.

**Sound:** Dial detents or soft ticks only when guesses are marked.

**Purpose:** Make the audience Licklider’s next experimental group.

## Scene 9 — 85%

**Screen:** Giant `85%`. Nothing else. Slight projector shake.

**Room:** Reveal that about 85% of his “thinking” time was spent getting into a position to think: retrieving, calculating, plotting, and transforming information.

**Motion:** The number strikes the screen at once, then holds.

**Sound:** One blunt impact followed by projector flutter.

**Purpose:** Mild horror and humour.

## Scene 10 — THE GRAPH, PART I

**Screen:** Six datasets on scraps of paper with incompatible axes, scales, and definitions. Graph paper, pencil, notes, and ruler create a believable work surface.

**Room:** Tell the speech-intelligibility example: six experiments used incompatible definitions; hours were needed merely to make the data comparable.

**Motion:** New contradictions are exposed one by one. The mess should become cognitively legible rather than decorative.

**Sound:** Paper handling, pencil, ruler tap.

**Purpose:** Dramatise the work instead of summarising it.

## Scene 11 — THE GRAPH, PART II

**Screen:** The clerical process consumes the frame: `CONVERT → NORMALISE → CALCULATE → PLOT`. Lines appear slowly and tediously.

**Room:** Let the audience suffer for 10–15 seconds. Optional line: “This is the interactive portion.”

**Motion:** Each operation visibly transforms the actual data. Do not fake busyness with arbitrary spinners. The final plotting action should feel almost absurdly manual.

**Sound:** Repetitive adding-machine rhythm, ruler, pencil, printer. Build a pattern that becomes conspicuous.

**Purpose:** Waiting is the argument.

## Scene 12 — THE GRAPH, PART III

**Screen:** Suddenly, a clean graph. The relationship is visually obvious. No labels beyond what is needed to read the shape. No explanatory text.

**Room:** Look at it. Pause. “…right.” Explain that once the graphs existed, the relations became obvious immediately; in this example, the conclusion took seconds once the data was comparable.

**Motion:** The clean graph replaces the entire work surface in one cut. No celebratory animation.

**Sound:** Clerical rhythm stops before the cut. Hold silence. A restrained bloom may follow the audience’s recognition.

**Purpose:** Emotional centre of the film.

## Scene 13 — A manifesto

**Screen:** Black. White text only: `THE MACHINE DID NOT HAVE THE INSIGHT.` Beat. Then: `IT GOT US TO THE PLACE WHERE INSIGHT COULD HAPPEN.`

**Room:** Make clear in notes and references that this is the presentation’s interpretation, not a Licklider quotation.

**Motion:** Two distinct builds with a long beat between them.

**Sound:** Near-silence; perhaps one projector splice between statements.

**Purpose:** Give the audience the thought to carry forward.

## Scene 14 — SYMBIOTE™ enters

**Screen:** A lovingly ridiculous fictional product film: `INTRODUCING: SYMBIOTE™ — ELECTRONIC RESEARCH COMPANION`. An enormous console is photographed as though it were a washing machine of the future.

**Room:** Personify the relationship. Play the product claim completely straight.

**Motion:** Product beauty shots, diagram arrows, a model designation such as `MODEL: UNAVAILABLE`, and a legal-looking footnote.

**Sound:** Confident institutional fanfare and relay clicks.

**Purpose:** The joke makes space for a serious explanation without turning into an AI keynote.

## Scene 15 — Human / Symbiote

**Screen:** Split frame. Human: `GOALS / HYPOTHESES / QUESTIONS / JUDGEMENT`. Machine: transformation, simulation, calculation, plots. Physical cards travel across the centre line.

**Room:** Explain Licklider’s division: humans lead with goals, hypotheses, questions, and evaluation; machines carry out routinizable operations between decisions.

**Motion:** Cards are exchanged in both directions. Never imply a one-way command pipeline.

**Sound:** Card shuttle, relay confirmation, restrained SYMBIOTE motif.

**Purpose:** Explain symbiosis without bullet-slide logic.

## Scene 16 — I DON’T KNOW WHAT GRAPH I WANT

**Screen:** SYMBIOTE™ prints three genuinely different plots. One is unexpectedly interesting.

**Room:** Explain Licklider’s idea that the computer could plot data as requested or try several alternatives when the human does not yet know what representation they want.

**Motion:** Each plot emerges from a physical printer/CRT process. The surprising plot receives no glowing highlight; the human’s attention supplies the emphasis.

**Sound:** Printer bursts, then a curious machine tone on the third plot.

**Purpose:** Show exploration rather than mere automation.

## Scene 17 — Audience experiment #2

**Screen:** A government questionnaire: `PLEASE IDENTIFY ONE THING YOU DO IN ORDER TO THINK.`

**Room:** Give the audience 20 seconds. Offer examples verbally only if needed: searching, formatting, compiling, reproducing, plotting, translating representations. Ask one or two people.

**Motion:** A local word field may accept entries, but the scene must work equally well with silence, hands, or shouted answers.

**Sound:** Quiet clock or pencil texture; no “game show” effects.

**Purpose:** Personalise the argument without drifting into generic “AI at work.”

## Scene 18 — REEL CHANGE

**Screen:** Projector burn, frame buckle, then `REEL II — THE IMPOSSIBLE MACHINE`.

**Room:** Pause and physically reset.

**Motion:** Film catches, blooms, tears, and returns as a new reel leader.

**Sound:** Flutter, pitch wobble, snap, silence, then a new motor catch.

**Purpose:** Let the talk breathe and announce a change in scale.

## Scene 19 — THE DESK OF THE FUTURE

**Screen:** Licklider’s imagined desk reconstructed literally: a hand draws a rough graph, the machine interprets it, and notes and equations share one surface. No modern app icons.

**Room:** In 1960 he imagines human and computer drawing on the same surface, handwriting recognition, rough sketches becoming precise structures, and interaction almost like another engineer.

**Motion:** Human marks precede machine precision. The machine never erases the human hand from the exchange.

**Sound:** Pencil, surface contact, CRT/plotter response.

**Purpose:** Make 1960 feel wonderfully uncanny.

## Scene 20 — THE THINKING CENTER

**Screen:** Library stacks dissolve into machine cabinets; cabinets dissolve into network lines between cities. The language is educational-film diagram, not internet infographic.

**Room:** Explain “thinking centers” that combine library functions, information retrieval, and computation, then expand into a network connected by wide-band communication lines.

**Motion:** One center becomes several. Information and computation travel in both directions.

**Sound:** Relay impulses widen into a spacious bandwidth tone.

**Purpose:** Brush the future internet without hijacking ARPANET history.

## Scene 21 — Don’t make it a prophecy slideshow

**Screen:** Rapid montage: handwriting, shared screen, speech, retrieval, networks, graphs. A physical stamp lands across it: `THIS IS NOT THE INTERESTING PART.`

**Room:** “Yes, lots of this sounds familiar. But I don’t think predicting gadgets is why this paper survives.”

**Motion:** The montage accelerates into near-cliché before the stamp interrupts it.

**Sound:** Rising product-film montage abruptly stopped by a rubber stamp.

**Purpose:** Refuse the “look what he predicted” presentation.

## Scene 22 — The actual strange idea

**Screen:** Return to fig and wasp. The paired frames gradually become human hand and machine circuitry while preserving the biological composition.

**Room:** Explain that Licklider contrasts symbiosis both with machines that merely extend humans and with automation where people remain as leftover components. He proposes a partnership of different capabilities.

**Motion:** The return should feel like recognition, not repetition.

**Sound:** Biology motif and SYMBIOTE motif quietly coexist for the first time.

**Purpose:** Return to the opening metaphor with earned meaning.

## Scene 23 — Audience experiment #3

**Screen:** Three physical cards: `TOOL` / `SERVANT` / `PARTNER`.

**Room:** Ask: “Which relationship do you actually want with a computer?” Use hands or movement if the room permits. Then ask: “What would have to be true for you to call it a partner?”

**Motion:** Cards can be selected or physically shifted, but do not tally a fake consensus.

**Sound:** Card placement only.

**Purpose:** Richest discussion checkpoint.

## Scene 24 — The uncomfortable frame

**Screen:** `QUESTION → MACHINE → ANSWER` appears and is crossed out. It is replaced by `QUESTION → MACHINE → THING TO THINK ABOUT → BETTER QUESTION → …`.

**Room:** Tie the film together: symbiosis is not mainly about shortening question-to-answer; it shortens the clerical distance from question to observation to a better question.

**Motion:** The first model should look seductively neat. Its correction should be physical, imperfect, and more alive.

**Sound:** Clean machine confirmation for the first model, grease-pencil strike, then an open-ended pulse.

**Purpose:** State the thesis only after the film has earned it.

## Scene 25 — Final image

**Screen:** The original fig photograph. After a long hold, the wasp slowly enters the frame.

**Room:** Ask, rather than conclude: “What would you do with your 85%?”

**Motion:** The question may appear only after it has been spoken, or remain entirely verbal. Prefer the latter if the room can hold the silence.

**Sound:** Sparse biology texture, then silence.

**Purpose:** The audience supplies the ending.

## Scene 26 — End credits

**Screen:** Film credits: `FIGS / WASPS / J.C.R. LICKLIDER / VARIOUS ELECTRONIC MACHINES / THE AUDIENCE`. Final tiny card: `PLEASE RETURN THIS FILM TO THE ARCHIVE.`

**Room:** Questions happen while the credits remain on screen. Never display `Q&A`.

**Motion:** Credits roll or change as restrained optical cards. They must remain readable and may loop to a still end card.

**Sound:** Original mechanical reprise or period-appropriate licensed cue, fading low enough for discussion.

**Purpose:** Keep the fiction intact through the final frame.

---

# 8. OPENING REEL: FRAME-BY-FRAME CUE SHEET

Scenes 0–6 establish the grammar for the entire film. They must be built and reviewed as a continuous sequence before later scenes are polished.

The timings below are targets, not autoplay mandates. Presenter-controlled holds always take priority.

## Scene 0 cue sheet — target 20–25 seconds

| Cue | Approx. time | Picture | Sound | Presenter |
| --- | ---: | --- | --- | --- |
| 0A | hold | Pure black. No loading mark or visible control. | Silence. | Press the first advance only when the room is ready. |
| 0B | 0:00 | Motor catches while frame remains black. | Motor wind-up and soft mechanical flutter. | Say nothing. |
| 0C | 0:02 | White leader flashes, slips vertically, then settles. | Hiss and splice click. | Say nothing. |
| 0D | 0:04 | `PROPERTY OF` card, with the institution obscured by tape or grease pencil. | One optical pop. | Say nothing. |
| 0E | 0:07 | Crooked `8`, change mark, scratches. | Countdown pop. | Say nothing. |
| 0F | 0:09 | `7`, briefly out of focus. | Countdown pop. | Say nothing. |
| 0G | 0:11 | `6`, gate weave increases. | Countdown pop and flutter. | Say nothing. |
| 0H | 0:13 | A few missing/damaged leader frames; do not complete a predictable modern countdown. | Splice chatter. | Say nothing. |
| 0I | hold | Cut to pure black. | Motor continues quietly. | Advance to the fig after one uncomfortable beat. |

## Scene 1 cue sheet — target 25–35 seconds

| Cue | Picture | Sound | Presenter |
| --- | --- | --- | --- |
| 1A | Cut directly from black to a full-frame fig with rich, tactile detail. | Projector settles; faint natural room texture. | Hold before speaking. |
| 1B | Barely perceptible optical push into the fig’s interior. No text. | Almost silence. | “I want to begin with a computer scientist talking about…” |
| 1C | Image holds unchanged. | No sting. | “…figs.” Let the laugh or confusion happen. Advance only after it does. |

## Scene 2 cue sheet — target 35–45 seconds

| Cue | Picture | Sound | Presenter |
| --- | --- | --- | --- |
| 2A | Hard specimen-film cut to an extreme macro wasp. | Dry splice. | Begin the biological relationship. |
| 2B | A physical label strip slides in: `BLASTOPHAGA`. | Label click. | Explain that the insect pollinates the fig. |
| 2C | Measurement rule and specimen pointer appear. | Quiet optical-printer rhythm. | Explain that each depends on the other. Avoid introducing computers yet. |
| 2D | Wasp remains alone in frame. | Rhythm stops. | Use the word “symbiosis” only at the end. Advance on it. |

## Scene 3 cue sheet — target 45–60 seconds

| Cue | Picture | Sound | Presenter |
| --- | --- | --- | --- |
| 3A | Fig and wasp occupy separate physical frames on one field. | Projector and faint biology motif. | Define symbiosis in ordinary language. |
| 3B | `SYMBIOSIS` types in, imperfectly registered. | Individual typewriter strikes. | Pause. |
| 3C | `TWO DISSIMILAR ORGANISMS` types beneath it. | Carriage return, then strikes. | Emphasise “dissimilar.” |
| 3D | The frames move into a coupled composition. | Low joining tone, not sentimental. | “And then Licklider asks: what if one of the organisms is us…” |
| 3E | Cut to black before the sentence finishes. | Sound drops out. | “…and the other is a computer?” Advance into silence. |

## Scene 4 cue sheet — target 20–30 seconds

| Cue | Picture | Sound | Presenter |
| --- | --- | --- | --- |
| 4A | Black holds after the word “computer.” | Silence. | Do not rush. |
| 4B | Huge cream title: `MAN–COMPUTER SYMBIOSIS`. | Short institutional title chord. | Say nothing over the title. |
| 4C | Small line appears: `J. C. R. LICKLIDER — 1960`. | Projector flutter returns. | Introduce Licklider and the paper briefly. No biography dump. |
| 4D | Reel-change circle appears for two frames near the corner. | Soft splice click. | Move directly into the computer of 1960. |

## Scene 5 cue sheet — target 60–90 seconds

| Cue | Picture | Sound | Presenter |
| --- | --- | --- | --- |
| 5A | Wide machine-room photograph. Operator is visually small. | Room hum and tape movement. | Establish scale and mediation. |
| 5B | `DAY ONE: FORMULATE PROBLEM` appears on a photographed card. | Date stamp. | Describe formulating the problem. |
| 5C | Programmer/operator image replaces it: `DAY TWO: EXPLAIN PROBLEM`. | Pencil and card handling. | Describe the handoff. |
| 5D | Tape/card montage: `LATER: COMPUTE`. | Machine rhythm grows. | Describe the wait. |
| 5E | Printer begins producing accordion paper. | Printer clatter. | Describe receiving output. |
| 5F | Paper continues much too long, crossing the frame and folding back over itself. | Clatter becomes comically relentless. | Let the excess play; do not explain the joke. |
| 5G | Small card on top of the paper: `ANOTHER EXPERIMENT REQUIRED`. | Everything stops. One paper settle. | Land the frustration. |

## Scene 6 cue sheet — target 45–60 seconds

| Cue | Picture | Sound | Presenter |
| --- | --- | --- | --- |
| 6A | Hard cut to black. | Machine room vanishes. | Pause. |
| 6B | `WHAT IS THE QUESTION?` appears alone, centred and enormous. | Very low room tone. | Ask the distinction: solving a formulated problem versus helping formulate it. |
| 6C | The text remains unchanged through the explanation. | No additional effects. | Name this as one of Licklider’s two central aims. |
| 6D | Question fades to black only on presenter advance. | Soft splice. | Transition: he investigated what kept him from reaching good questions. |

---

# 9. AUDIENCE PARTICIPATION CONTRACT

There are exactly three substantial audience checkpoints:

1. **Scene 8:** Estimate how much “thinking time” is actually spent thinking.
2. **Scene 17:** Identify one thing done in order to think.
3. **Scene 23:** Choose `TOOL`, `SERVANT`, or `PARTNER`, then define what partnership would require.

These are intellectual turns, not icebreakers. Each must work with:

- spoken answers only
- a show of hands
- keyboard/mouse interaction if useful
- no network, account, QR code, or third-party polling service

The presenter must never be trapped waiting for a digital interaction to succeed.

---

# 10. SCHOLARSHIP AND ATTRIBUTION

The primary paper controls claims about Licklider’s argument.

For every scene, distinguish among:

- direct quotation
- close paraphrase
- presentation interpretation
- fictional product-film copy
- historical reconstruction

The following must never be presented as direct Licklider quotations:

> THE MACHINE DID NOT HAVE THE INSIGHT.<br>
> IT GOT US TO THE PLACE WHERE INSIGHT COULD HAPPEN.

and:

> Computers are most interesting when they reduce the distance between interesting thoughts.

They are the presentation’s interpretive language.

Maintain a complete `SOURCES.md` with source URLs, creator/institution, date, rights/license information, local filename, and scene usage. Maintain complete `speaker-notes.md` aligned one-to-one with all 27 scenes.

---

# 11. ACCESSIBILITY AND RESILIENCE

- The experience must work at 1600×900 and 1366×768 without clipping.
- Essential meaning must not depend on colour, sound, or animation alone.
- All images require useful alt text; decorative film damage does not.
- Interactive controls need keyboard support and visible focus when invoked.
- Reduced-motion mode replaces jitter, burns, and long motion with deliberate cuts and static texture.
- Mute must be immediate and obvious when requested.
- The deck must run from static files on GitHub Pages with relative asset paths.
- The deck must remain usable offline after the repository is cloned and dependencies are installed.
- No external runtime fonts, APIs, analytics, video hosts, or polling services.

---

# 12. IMPLEMENTATION AND DEPLOYMENT CHECKPOINTS

Development proceeds in small, reviewable, deployable commits. Every push to `main` runs local-equivalent Playwright checks, deploys to GitHub Pages, and then runs Playwright against the deployed URL.

Planned checkpoints:

1. `docs: lock found-film storyboard`
2. `feat: rebuild opening reel`
3. `feat: stage thinking experiment and graph sequence`
4. `feat: introduce the Symbiote partnership`
5. `feat: build the impossible machine reel`
6. `feat: complete thesis ending and credits`
7. `feat: add projector sound design`
8. `docs: align notes sources and audit`
9. `test: verify final film across viewports`

Intermediate versions should look like deliberate workprints rather than a mixture of finished and accidentally broken scenes. A visible `WORKPRINT` edge mark is acceptable during development; placeholder corporate components are not.

---

# 13. DEFINITION OF DONE

The redesign is complete only when:

- all 27 scenes exist in the storyboard order
- Scenes 0–6 follow the frame-level cue sheet
- the paper title is not revealed before Scene 4
- the 85% and graph sequence has real dramatic duration
- all three audience experiments work without a network
- SYMBIOTE™ recurs as a straight-faced product-film character
- the desk and thinking-center scenes avoid modern interface iconography
- the prophecy montage explicitly rejects prediction as the thesis
- the final spoken question is “What would you do with your 85%?”
- credits preserve the film fiction and never show a Q&A slide
- sound is local, optional, balanced, and presenter-controlled
- notes and references are complete and distinguish quote from interpretation
- all images are authentic or transparently identified reconstructions
- local Playwright passes in both target viewports
- deployed GitHub Pages Playwright passes against the public URL
- visual review confirms no clipping, illegible type, accidental UI, or broken film grammar

The finished experience should feel less like a deck about an old paper and more like the paper briefly became a film projector.
