## Stage 1. Constraints and definition of success (v3)

### 1.1 Hard project requirements and grading criteria

From the final project spec and lecture slides:

1. **Project type and scope**

    * Single main web page that tells a **data story**.
    * Uses **multiple coordinated visualizations** (your 6 D3 vizzes already satisfy count and complexity).
    * Must be hosted and accessible in a browser without extra build steps for the marker.

2. **Narrative and data story requirements**

    * Story introduces a **clear guiding question** and motivates why it matters.
    * Visualizations appear in a **deliberate sequence** that builds understanding.
    * Reader should reach **explicit takeaways**, not just see charts.
    * Narrative text and visuals must work together: text should **point to** specific chart features.

3. **Novel visualization requirement**

    * At least **two visualizations** must be clearly **beyond lab patterns**.
    * Your current main branch already has several complex custom vizzes: stopwatch, planet, record player, ranking pyramid with bubble chart, emotion word cloud, conveyor quiz.
    * Success requires that the site **frames** these as part of a coherent story, not just as “cool charts”.

4. **Design and usability**

    * Layout must be readable on typical laptop resolutions.
    * Use **consistent color system** and typography; avoid visual clutter.
    * Include legends, labels, and interaction hints.
    * Respect accessibility basics: contrast, keyboard focus, reduced motion preferences.

5. **Technical correctness and robustness**

    * All D3 code must load data correctly, respond to resize, and avoid crashing.
    * Interactions must be discoverable and not feel broken.
    * Use D3 patterns taught in course: enter-update-exit, scales, transitions.

6. **Evaluation dimensions inferred from spec and lectures**
   Likely marking components:

    * Narrative and insight.
    * Visual design and aesthetics.
    * Technical implementation and D3 use.
    * Innovation and creativity.
    * Process and reflection (already in your process book).

### 1.2 Technical constraints and current architecture

From the codebase map and overview:

1. **Single page app**

    * `index.html` contains **7 major sections** with `data-viz` attributes.
    * `TikTokTidesApp` in `src/js/main.js` uses an `IntersectionObserver` to mount vizzes when sections are in view and sets `body[data-scene]` to control backgrounds.

2. **Scene map (important for backgrounds)**

   ```text
   section-hero        -> scene "cosmos"
   section-ignite      -> scene "dawn"      (stopwatch)
   section-surface     -> scene "orbit"     (planet)
   section-record      -> scene "city"      (community / could hold record)
   section-spillover   -> scene "city"      (record currently)
   section-fade        -> scene "forest"    (ranking)
   section-takeaway    -> scene "air"       (emotion)
   section-ingredients -> scene "lab"       (conveyor, ingredients)
   ```

3. **Visualization registration**

    * Stopwatch: `stopwatch/index.js` – duration clock using `cleaned_tiktok_data.csv` (bins videos by `videoMeta/duration` and aggregates `playCount`).
    * Planet: `planet/index.js` – artist solar system using four yearly CSVs: `TikTok_songs_2019.csv`, `TikTok_songs_2020.csv`, `TikTok_songs_2021.csv`, `TikTok_songs_2022.csv`.
    * RecordPlayer: `record-player/index.js` – viral sounds vinyl using `top_music.csv` plus `songInfo/songInfo.json`.
    * Ranking: `ranking/index.js` and `rankingBubbleChart.js` – category pyramid and bubble chart using `youtube_shorts_tiktok_trends_2025.csv`.
    * Emotion: `emotion/index.js` – word cloud using `cleaned_tiktok_data.csv` (extracts caption `text` for NLP analysis).
    * Conveyor: `conveyor/index.js` – quiz with hardcoded questions.
    * Community, Ingredients: scaffolds that can be left as optional Easter eggs.

4. **Design tokens and motion**

    * `tokens.css` already defines typography, colors, spacing, motion.
    * `micro-interactions.js` and `motion/patterns.js` manage comets, leaves, bubbles, etc.

5. **Special cases**

    * Stopwatch mounts to `#chart` instead of `.viz-container`.
    * Record player mounts immediately on init.
    * Emotion viz loads a large ML model; need to avoid remounting too often.

### 1.3 Target audience and environment

Based on spec and process book:

* Primary audience: undergraduate students, TAs, and instructor familiar with TikTok but not necessarily expert in algorithms.
* Context: desktop or laptop, typical 13–15 inch screens, modern browsers.
* Time budget: 5–10 minutes to read and interact.
* Background: knows basic charts, not advanced statistics.

### 1.4 Virality questions across specs

From initial design, process book, and earlier specs:

* How audio choice (sounds and artists) relates to virality.
* How video duration affects performance.
* Which content categories dominate cross platform trends.
* How captions and emotions differ between viral and nonviral content.
* How creators and communities cluster around trends.

Earlier specs already assign a role to each viz (music, duration, ranking, emotion, quiz), but current main branch does not weave them into a smooth story.

### 1.5 Current repo vs course goals vs earlier specs

1. **Current repo**

    * Strong individual vizzes, each technically rich.
    * Scene theming infrastructure exists (`body[data-scene]`, illustrations).
    * Navigation and backgrounds exist, but **narrative text is thin** and sections feel like separate posters.
    * Alien narrator largely missing; quiz exists but is not tightly tied to previous insights.

2. **Earlier specs (v2 and v3)**

    * Provide a detailed scene-by-scene narrative.
    * Add alien as guide and journey map.
    * Propose scroll steps and auto sequences.
    * Some ideas already implemented (auto sequence on record player, alien entrance animations), others not.

3. **Conflicts and obsolescence**

    * Planet viz uses four yearly CSVs (`TikTok_songs_2019.csv` through `TikTok_songs_2022.csv`) with year buttons for switching.
    * Stopwatch uses `cleaned_tiktok_data.csv` for video duration and playCount data.
    * Record player uses `top_music.csv` (not `top10_music.csv`) with a year range slider (2020–2025).
    * Some branching information in v3 progress uses `scene-` IDs while main still uses `section-` IDs.
    * The professor does not want record-player physically merged into the planet viz as one integrated view, while one old idea explored that.

### 1.6 Final constraints and success criteria for this redesign

1. **Story constraints**

    * Single clear guiding question: “What makes a short video go viral on TikTok like platforms?”
    * Each of the 6 main vizzes must answer a **sub question** that feeds into the main answer.
    * At least one **low effort narrative path**: a user who only scrolls and barely hovers should still see all main takeaways.

2. **Visualization constraints**

    * Keep all existing D3 vizzes and data structures. Small framing changes and added annotations are allowed.
    * Do not add completely new complex charts.
    * Respect performance constraints of emotion viz.

3. **UX constraints**

    * Preserve and respect teammates’ enhancements except where they directly conflict with narrative clarity.
    * Preserve the current arrival background for Scene 1.
    * Avoid secondary vertical scrollbars for steps. Use scroll position in the main viewport to trigger states.
    * Avoid “AI look”: repetitive layouts, generic rectangular cards, and vague animations.

4. **Brand constraints**

    * Use the TikTok palette given: glint, blaze, thrive, shimmer, dawn, ember, glow, muse.
    * Integrate recognizably TikTok style elements: vertical phone frame, right side action icon stack, progress bar, neon glows.

5. **Technical constraints**

    * Work within current HTML structure: seven sections mapped to scenes.
    * Work with existing scene map and illustration system.
    * Use only lightweight scroll detection patterns that fit in existing `main.js`.

### 1.7 Definition of “full marks” for this project

A marker should be able to:

1. Describe in 3–4 sentences what the site claims about virality, citing concrete insights (for example “Most viral sounds cluster in a few artists, and mid length clips dominate top charts”).
2. Point to each visualization and say what question it answers.
3. Reach the main takeaways by **simply scrolling and reading** without guessing how to interact.
4. Recognize aesthetic and UX quality that matches examples from lectures and data story references.
5. Confirm that at least two visualizations are clearly novel and technically robust.
6. See evidence that user testing issues from the process book have been addressed (confusing legends, hidden interactions, disjoint sections).

The redesign should make all six vizzes feel like coordinated chapters in one story rather than a set of disconnected scenes.

---

## Stage 2. Analysis of current site and visualizations

For each viz, here is: current behavior, candidate insights, and UX/narrative gaps. All descriptions are grounded in the codebase overview and per viz analysis documents.

### 2.1 Stopwatch: "Seconds to Success"

**Current behavior**

* Section: `section-ignite` mapped to scene `dawn`.
* Data: `cleaned_tiktok_data.csv`. Fields used: `videoMeta/duration`, `playCount`.
* Visual: Clock like radial chart:

    * Full circle divided into arc sectors for 10-second duration bins (0–10s, 10–20s, 20–30s, 30–40s, 40–50s, 50–60s).
    * Each arc's radial extent (radius) encodes the average `playCount` for videos in that duration bin.
    * Arc sweep angle corresponds to the mean duration within each bin.
* Interactions:

    * Hover reveals tooltip with duration bin range, average duration in bin, and average playCount.
    * Helper functions `highlightShortClips()`, `highlightMidClips()`, `highlightLongClips()` emphasize different duration ranges.
    * Click the top button to trigger animation replay.
    * Stopwatch mounts when its section comes in view, to `#chart`.

**Candidate main insights**

1. Viral songs avoid extremes: most cluster in a **middle duration band**, not the very shortest or longest clips.
2. Certain durations seem to pair with **higher danceability**, suggesting that choreography friendly lengths do better.
3. Duration buckets have different density: some buckets have many songs, others nearly none, hinting at sweet spots.

**UX and narrative weaknesses**

* Current section does not state explicitly which question the chart answers.
* It is easy for a user to see a clock with dots without realizing that the densest sector represents an optimal duration band.
* No strong connection back to TikTok viewing expectations: people might not connect a “duration bucket” to actual experience.
* Alien narrator and story context are not integrated; section feels like a poster with a fancy clock.

### 2.2 Planet: "Solar System of Sound"

**Current behavior**

* Section: `section-surface` mapped to scene `orbit`.
* Data: Four yearly CSVs: `TikTok_songs_2019.csv`, `TikTok_songs_2020.csv`, `TikTok_songs_2021.csv`, `TikTok_songs_2022.csv`. Fields used: `artist_name`, `track_name`, `danceability`, `energy`.
* Visual:

    * Artists represented as **planets** orbiting a central "sun".
    * Encodings (current main):

        * Artist name becomes planet identity.
        * Average energy maps to orbit radius (distance from sun).
        * Song count maps to planet size (via `scaleSqrt`).
        * Average danceability maps to planet color (white → TikTok blue → TikTok pink gradient).
    * Planets rotate around the sun with animation using `requestAnimationFrame`.
* UI:

    * Year buttons (2019–2022) allow switching between datasets with smooth planet transitions.
    * Section markup includes introduction text and legend; a color legend is present next to the viz showing danceability gradient.
    * Planets have hover tooltips listing artist name, song count, average danceability, average energy, and up to 3 song names.
    * Scroll steps call `PlanetViz.update(step)` for highlight sequences (e.g., `highlightTopArtists()` dims all but top 2).

**Candidate main insights**

1. A small number of **artists dominate viral soundscape**: many planets small, few planets large and bright.
2. Viral artists share **similar energy or danceability profiles**, forming visible clusters in the orbit layout.
3. Many artists appear once or twice, while a handful contribute many tracks, reinforcing the idea of “sound monopolies”.

**UX and narrative weaknesses**

* Legend is present but does not explicitly connect to virality question (for example, “High energy and medium danceability are common in viral tracks”).
* No narrative stepping stone: user may see a pretty solar system but not understand what patterns to look at.
* Alien narrator absent; no story about “arriving in a galaxy of sounds”.
* No explicit pointer from this scene to the record player or ranking; connections remain in the user’s head.

### 2.3 Record Player: "Viral Vinyl"

**Current behavior**

* Section: `section-spillover` mapped to scene `city`.
* Data:

    * `top_music.csv` for quantitative fields: `music_name`, `music_author`, `year`, `play_count`, `music_url`, `cover_url`.
    * `songInfo/songInfo.json` for qualitative descriptions and additional metadata.
* Visual:

    * Concentric vinyl rings representing top 7 viral sounds (sorted by play count).
    * Each ring corresponds to a song; outermost ring = highest play count.
    * Tonearm rotates to point at active ring (angle computed from ring index).
    * Album cover image (or randomized fallback cover) sits at center; center label displays current year range.
* Interactions:

    * Hover a ring:

        * Ring starts rotating animation.
        * Tonearm previews position.
        * Info panel updates with song title, author, and play count.
        * Audio plays if unmuted (muted by default).
    * Click a ring to lock it as active.
    * Year range slider (2020–2025) filters songs by year range and re-renders top 7 rings.
    * An **auto sequence** (`startAutoSequence()`) cycles through top 3 rings when triggered.

**Candidate main insights**

1. Viral sounds are **not random**; a few tracks dominate and stay in rotation across time.
2. Some artists recur in multiple rings, reinforcing that certain creators or songs repeatedly drive virality.
3. Year slider reveals that viral sounds for different periods share structural properties (duration, energy), even if tracks change.

**UX and narrative weaknesses**

* Audio playback limitations mean user cannot rely on sound; the narrative must emphasize visual and text aspects.
* Info panel is present but not strongly framed as “evidence” about why songs go viral.
* Auto sequence is implemented but no textual explanation invites user to watch it as a mini story.
* Connection to previous scene (planet) is not explicit: user does not get told that some “planets” appear again as records.

### 2.4 Ranking Pyramid: “Trends, but make it a pyramid”

**Current behavior**

* Section: `section-fade` mapped to scene `forest`.
* Data: `youtube_shorts_tiktok_trends_2025.csv`, aggregated by content category.
* Visual:

    * Sticky notes arranged in a **three level pyramid**:

        * Top row: rank 1 category.
        * Middle row: ranks 2 and 3.
        * Bottom row: rank 4, 5, 6 or similar.
    * Each sticky note has a cover layer and a number showing rank.
* Interactions:

    * Hover lifts cover slightly.
    * Click triggers cover falling animation, revealing underlying category and a call to click again.
    * Click again opens popup with bubble chart:

        * Circles represent top short creators for that category.
        * Circle size encodes views; tooltips show creator handle, hashtags, sounds.
        * Background shows a category themed GIF.

**Candidate main insights**

1. A small set of categories dominates cross platform virality; pyramid layout makes top categories visually obvious.
2. Within categories, a handful of creators account for massive view counts.
3. Categories differ in “creator concentration”: some categories have many medium creators; others are dominated by a single giant bubble.

**UX and narrative weaknesses**

* Pyramid concept is strong but current text does not clearly state the insight: user may just play with sticky notes.
* Bubble chart is hidden behind interactions; some users never discover it.
* Forest background and sticky note color palette may not strongly connect back to TikTok brand or previous scenes.
* No explicit explanation of how YouTube Shorts and TikTok relate; the cross platform angle is implicit.

### 2.5 Emotion Word Cloud: “How do captions feel?”

**Current behavior**

* Section: `section-takeaway` mapped to scene `air`.
* Data: `cleaned_tiktok_data.csv`.

    * Uses `text` (caption), preprocessed embeddings or emotion tags; some sample JSON also exists.
* Visual:

    * Bubble or word cloud layout of words or topics, sized by frequency or importance.
    * Colors encode emotion categories, for example positive, neutral, negative, or more granular (joy, surprise, sadness).
    * Some words may float or pulse over time.
* Interactions:

    * Filter controls or checkboxes to toggle emotion categories.
    * Hover reveals example captions or statistics.
    * There may be a slider or toggle contrasting viral vs nonviral captions, depending on implementation.

**Candidate main insights**

1. Viral captions tend to skew toward **specific emotional tones** (for example hype, excitement, curiosity) rather than neutral language.
2. Certain words or phrases appear repeatedly across viral posts, hinting at “caption recipes”.
3. Emotion distribution differs between viral and less viral content, suggesting that emotional framing matters.

**UX and narrative weaknesses**

* Heavy ML model load causes slow first render; users may see a blank space for a moment without clear loading state.
* Emotion legend and filter controls may feel technical rather than narrative (for example “valence” vs “happy vs sad”).
* Story connection is not spelled out: why should readers care about caption emotion after seeing music and category scenes.
* Alien narrator not used to explain how to interpret emotion categories.

### 2.6 Conveyor Quiz: “Can you spot a viral video?”

**Current behavior**

* Section: `section-ingredients` mapped to scene `lab`.
* Data: quiz questions are hardcoded; not derived from underlying datasets.
* Visual:

    * Horizontal conveyor belt with cards moving or shuffled along it.
    * Each card displays a question or scenario, with some iconography.
    * Above the belt, a multiple choice panel shows 3–4 answer buttons.
* Interactions:

    * User clicks an answer button.
    * Feedback indicates correct or incorrect (for example card border changes color, explanation text appears).
    * Next card moves into the main spotlight.

**Candidate main insights**

1. Quiz reinforces the ingredients for virality: sound choice, duration, category, emotion, community.
2. Readers realize which factors matter more and which are weaker than they assumed.
3. Site transitions from passive storytelling to active recall and application.

**UX and narrative weaknesses**

* Question wording and visual presentation may not clearly refer back to the previous scenes.
* Belt cards are decorative only; some users try to click them and become confused.
* Feedback may be subtle or not connected visually to earlier vizzes (colors, icons).
* Missing explicit “wrap up” that summarizes final answer to central question after quiz.

---

## Stage 3. Updated narrative and high level theme

### 3.1 Core story arc

The story becomes a **mission through the TikTok Tides** guided by an alien researcher in a lab coat who studies short video virality from outer space.

High level arc:

1. **Arrival (Scene: Cosmos)**

    * Alien invites viewer to investigate “What makes a short video go viral?”
    * A large phone frame shows a stylized feed: similar layouts to TikTok, but abstracted.
    * Viewer sees hints of music icons, caption snippets, and duration bars.

2. **Soundscape (Scene: Orbit)**

    * Planet viz and record player pair show that viral videos are built on a sound ecosystem.
    * Planet scene reveals which artists and sound profiles dominate.
    * Record scene drills into individual top tracks and their properties.

3. **Timing (Scene: Dawn / Stopwatch)**

    * Stopwatch reveals that not all durations perform equally.
    * Viewer sees a specific band of durations where viral songs cluster.

4. **Trends and categories (Scene: Forest / Ranking)**

    * Pyramid scene shows which content themes rise to the top, and how creators cluster.
    * Cross platform notion: data from YouTube Shorts and TikTok like trends.

5. **Captions and emotion (Scene: Air / Emotion)**

    * Word cloud scene reveals how caption emotion shapes engagement.
    * Filters let viewer compare emotional recipes for viral versus nonviral.

6. **Quiz and recipe (Scene: Lab / Conveyor + ingredients)**

    * Quiz asks user to apply what they learned to scenarios.
    * Wrap up displays a “recipe card” summarizing the main ingredients and shows how they interact.

### 3.2 Mapping visualizations to roles and sub questions

1. **Hero phone (no D3)**

    * Role: frame central question and hint at all ingredients visually.
    * Sub question: “What do you think makes these videos viral?” (cold open).

2. **Planet viz: Artist ecosystem**

    * Role: show sound and artist concentration.
    * Sub question: “Are viral sounds spread across many artists or concentrated in a few?”

3. **Record player: Top viral sounds**

    * Role: inspect top songs in detail.
    * Sub question: “What do the biggest viral sounds look like in terms of duration, energy, and time?”

4. **Stopwatch: Duration sweet spot**

    * Role: reveal when people stop watching and where most viral songs cluster.
    * Sub question: “Which clip lengths show up most often among viral sounds?”

5. **Ranking pyramid: Categories and creators**

    * Role: show which topics dominate and how creators cluster.
    * Sub question: “Which themes and creators ride the strongest tide of views?”

6. **Emotion word cloud: Captions and tone**

    * Role: show emotional recipes and keywords that appear in viral captions.
    * Sub question: “How do successful creators talk about their videos in captions?”

7. **Conveyor quiz: Application**

    * Role: help user test understanding.
    * Sub question: “Given these ingredients, can you correctly predict what would go viral?”

8. **Wrap up card: Recipe summary**

    * Role: finalize explicit answer to main question.
    * Sub question answered: “What makes a short video go viral on TikTok like platforms?”

### 3.3 Alien narrator plan

The alien appears selectively at scene “checkpoints” rather than everywhere:

1. **Scene 1 (Hero)**: appears on a hovering mini planet in bottom left, with a speech bubble:

    * Bubble 1: “Hi, I am your Virality Researcher. Let us decode TikTok Tides together.”
    * Bubble 2 (after scroll hint): “Scroll to fly past music, timing, trends, and captions.”

2. **Scene 2 (Planet)**: appears riding a small satellite above the solar system.

    * Bubble: “Look how a few artists shine much brighter. These orbits tell us who shapes the sound tide.”

3. **Scene 3 (Record)**: stands on a tiny DJ booth at the bottom edge.

    * Bubble: “Watch the needle. These are the heavy hitters: the sounds everyone reuses.”

4. **Scene 4 (Stopwatch)**: floats near 30 second mark.

    * Bubble: “Notice how clips cluster here. Our tide of attention peaks at certain lengths.”

5. **Scene 5 (Ranking)**: hides behind a sticky note, peeking out.

    * Bubble: “Peel back each layer. Some categories tower above others.”

6. **Scene 6 (Emotion)**: hangs from a bubble line.

    * Bubble: “Captions are not just words. They shape how we feel about a video before we watch.”

7. **Scene 7 (Quiz)**: moves along the belt on a lab cart.

    * Bubble: “Ready for a lab test? Try guessing which recipe goes viral.”

8. **Scene 8 (Wrap up)**: stands beside recipe card.

    * Bubble: “Here is the short version of what we found.”

Alien movement uses simple CSS transforms already wired in v3 progress (enter from below then float) with slightly different offsets per scene.

### 3.4 How interactions reveal answers

* Scroll alone triggers a minimal guided path:

    * Auto sequence on record player shows top 3 tracks in order while text calls out what the user should notice.
    * Scroll steps for planet highlight cluster of large high energy planets.
    * Stopwatch animates emphasized sectors for popular durations.
    * Ranking pyramid auto highlights the top row before user interacts.
    * Emotion scene reveals default “viral only” filter first, then invites the user to toggle “all captions”.

* Optional deeper interactions:

    * Hovering and clicking gives more detailed tooltips and bubble chart data.
    * Quiz offers multiple questions with short explanations after each answer.

The combination provides one **low effort narrative** via scrolling and reading, plus **deeper exploration** for curious users.

---

## Stage 4. Information architecture and navigation

### 4.1 Scenes, sections, and scroll behavior

Match scenes to existing sections and add narrative structure:

1. `section-hero`   → Scene 1: Arrival and Hero phone (scene key: cosmos).
2. `section-ignite` → Scene 2: Timing preview or small intro, but in this redesign used only as a **transition ramp** into stopwatch, with a mini story tile; stopwatch still mounts to `#chart`.
3. `section-surface` → Scene 3: Soundscape galaxy (Planet viz).
4. `section-spillover` → Scene 4: Viral vinyl (Record player).
5. `section-fade` → Scene 5: Trend pyramid (Ranking).
6. `section-takeaway` → Scene 6: Caption emotions (Emotion).
7. `section-ingredients` → Scene 7: Quiz plus wrap up card (Conveyor and summary).

Vertical scrolling behavior:

* Each section fits roughly one viewport height on laptops, with some overflow for longer text but not more than 1.5x viewport height.
* Intersection observer remains as current: when section passes 50 percent threshold, `handleSectionEnter` sets `body[data-scene]` for backgrounds and mounts viz.
* Scroll steps for planet and record are implemented as in v3 spec but visually integrated into text (small numbered markers rather than separate scroll panels).

### 4.2 Global TopNavBar

TopNavBar runs across top of all scenes.

**Structure**

* Left: site logo wordmark “TikTok Tides” with a tiny orbiting dot.
* Center: thin progress bar showing scroll progress from 0 to 100 percent.
* Right: cluster of navigation controls:

    * “Start” (scroll to hero).
    * “Jump to scene” dropdown opened by clicking text label “Journey map”.
    * “Replay quiz” button visible only when screen is at or past quiz section.

**Visual design**

* Height: 64 px.
* Background: semi transparent dark overlay using thrive (`#033624`) at 80 percent opacity, blur behind to keep content visible.
* Text: white or near white from tokens.
* Progress bar: 2 px stripe underneath nav content using glint (`#2DCCD3`) as fill.

### 4.3 Mini journey strip inside TopNavBar

Directly below nav labels, a small horizontal strip represents the journey.

* Shape: row of seven small capsules (rounded rectangles) arranged left to right, each 32 px wide, 8 px high.
* Each capsule corresponds to a scene:

    1. Cosmos (hero)
    2. Ignite (transition)
    3. Orbit (planets)
    4. City (record)
    5. Forest (ranking)
    6. Air (emotion)
    7. Lab (quiz)
* Capsule colors:

    * Inactive: muted version of shimmer (`#BAF6F0`) at 40 percent opacity.
    * Active scene: bright blaze (`#F1204A`) with a small glowing outline of glint.
    * Completed scenes: dawn (`#EDBBE8`) with a thin top border of glow (`#FBEB35`).

Icons:

* A tiny 10 px icon inside each capsule:

    * Hero: small phone outline.
    * Ignite: small sun rise arc.
    * Orbit: small ringed planet.
    * City: small vinyl disc.
    * Forest: small pyramid silhouette.
    * Air: small speech bubble.
    * Lab: small beaker.

Interaction:

* Hover: shows tooltip “Scene 3: Sound Galaxy”.
* Click: scrolls smoothly to that section (matching current 1–7 keyboard shortcuts).

### 4.4 Full cartoon JourneyMap overlay

A clickable overlay map appears when the user clicks “Journey map” in the nav or presses a key (for example “M”).

**Characteristics**

* Overlay fills screen with a darkened backdrop (black at 40 percent opacity).
* Centered card showing a **cartoon style map** of the whole journey.

Map composition:

* Background: wide horizontal rectangle, aspect ratio 16:9, resembling a board game track.
* The path:

    * Starts at top left with a small stylized rocket over a dark star field (cosmos).
    * Slides down into a soft yellow strip labeled “Timing” (ignite).
    * Curves into a blue ring zone labeled “Sound galaxy” (orbit).
    * Enters a purple city skyline patch labeled “Viral sounds” (city).
    * Moves into a green forest patch with a pyramid icon labeled “Trends”.
    * Floats into a light airy area with speech bubbles labeled “Captions”.
    * Ends in a lab tile with bubbling flasks labeled “Quiz and recipe”.

Each location is a clickable circular node:

* Diameter: 40 px.
* Each node has:

    * A simple icon (phone, clock, planet, disc, pyramid, bubble, beaker).
    * A label below in small uppercase letters.

The alien icon:

* A small circular avatar of the alien sits on top of the node for the **current scene**.
* When the scene changes, alien moves along the path with a simple slide animation (translate along a curve in approximately 400 ms).

Interaction details:

* Hover: node increases to 48 px with a faint glow.
* Click: overlay closes and page scrolls to corresponding section.
* Esc key or clicking outside map closes overlay.

### 4.5 Behavior on different laptop widths

Breakpoints:

1. **Wide (≥ 1280 px)**

    * Journey strip appears fully with labels.
    * Nav text and icons show side by side.
    * Map overlay appears large in center.

2. **Medium (between 960 px and 1280 px)**

    * Journey strip compresses: labels removed, only icons remain; tooltips supply names.
    * Nav items use shorter text (for example “Start”, “Map”, “Quiz”).

No phone or tablet design is required.

### 4.6 Step indicators and scroll alignment

* For scenes with scroll steps (planet, record, ranking):

    * Use **small circular markers** along the left side of the text column:

        * 8 px circles, evenly spaced vertically.
        * Active step filled with blaze; inactive steps use muse.
    * Each step corresponds to a block of narrative text (one short paragraph).
    * When a paragraph enters the visible middle of viewport, step becomes active and triggers `viz.update(stepNumber)`.

* No additional scrollbars appear. All text scrolls with page content.

---

## Stage 5. Scene by scene layout and interaction specification

In this section each scene is described in enough detail that an implementer can reconstruct layout and behavior visually.

### Scene 1: Arrival in the TikTok Tides (section-hero, scene “cosmos”)

**Purpose and key message**

* Introduce the research question and context.
* Give first hint of ingredients: sound, timing, category, captions, community.
* Preserve and build upon the existing arrival background.

**Layout**

* Viewport: full height section.

* Three main layers:

    1. **Far background** (100 percent width and height, behind everything):

        * Deep navy to black gradient sky using thrive darkened with opacity.
        * Scatter of small stars created as tiny white dots at random positions.
        * A large soft purple-blue planet disk occupying bottom right quarter of screen, overlapping slightly with bottom edge.

    2. **Midground**:

        * A low curved “horizon” glow at bottom, representing the atmosphere of a planet.
        * A subtle horizontal band of glint tinted haze that fades into space at both sides.

    3. **Foreground content**:

        * Left half: headline and text.
        * Right half: tall phone frame.

* Grid:

    * Content container width: max 1100 px, centered.
    * Desktop: two columns, 55 percent width left, 45 percent width right.

**Content**

Left column:

1. **Title**

    * Large heading: “What makes short videos go viral?”
    * Text color: pure white.
    * Underline accent: a short thick underline under the word “viral” using blaze.

2. **Subtitle paragraph**

    * One or two sentences that mention TikTok and short video culture.
    * Example: “You scroll past hundreds of clips, but only a few take over your entire feed. Our alien researcher wants to know why.”

3. **Ingredient checklist row**

    * A row of small pill badges representing the five ingredients:

        * “Sound choice”, “Timing”, “Category”, “Captions”, “Community”.
    * Each pill:

        * Background: semi transparent dark rectangle with rounded corners.
        * Border: thin line in glint.
        * Small icon left (disc, clock, tag, quote, network node).

4. **Call to scroll**

    * Short instruction: “Scroll to follow the tide from space, through sound and time, down to captions in the lab.”
    * Underneath, a slim downward arrow icon gently bobbing up and down.

Right column: **Phone frame**

1. **Phone container**

    * Proportions: height about 80 percent of viewport height, width about 40 percent of viewport width but capped at 360 px.
    * Shape: rounded rectangle with thick black border.
    * Outer shell color: near black.
    * Inner screen: slightly rounded white rectangle nested inside.

2. **Within phone screen**:

    * **Top bar**:

        * Left: small circular avatar placeholder (gray circle).
        * Center: text “For You” bold, and smaller text “Following” to the left in muted color.
        * Right: three dots icon.

    * **Main video area**:

        * A 9:16 rectangle inside the phone, with slight vertical gradient from dark at top to lighter near bottom.

        * Inside the video area, three stacked “clips” representing different example videos in feed:

            1. The main visible clip in center;
            2. Top part of previous clip partially visible above;
            3. Bottom part of next clip slightly visible below.

        * Each clip shows:

            * A simple tinted background color;
            * A white rectangular bar near bottom center representing the **duration bar**;
            * A small musical note icon at the bottom left;
            * Thin lines for caption text near bottom left.

    * **Right side action column** (inside phone):

        * Align along right edge of video area:

            1. Top icon: circular profile picture placeholder.
            2. Below: heart icon.
            3. Below: speech bubble icon.
            4. Below: share arrow icon.
            5. Bottom: spinning tiny disc icon that hints at sound.

        * Each icon is a solid white icon on dark background, with glint colored glow behind.

    * **Bottom area**:

        * Caption area with three lines of text (dummy text such as “Dance challenge with trending sound A”).
        * A simple hashtag row in smaller text.
        * A progress bar along the very bottom edge, bright blaze that animates left to right for the currently visible clip.

**Interactions**

* Background animation:

    * Stars slowly drift downward at a very slow rate.
    * The large planet at bottom right has a subtle vertical bob (2 px up and down, 6 second cycle) following an ease in out curve.

* Phone screen animation:

    * Every 4 seconds, the visible clip content shifts slightly upwards, simulating a gentle feed scroll:

        * The main clip moves up and fades out.
        * The next clip moves into center.
        * The top clip disappears.
    * Progress bar at bottom fills over those 4 seconds.
    * For reduced motion users, clip content remains static; only progress bar may animate lightly or remain static.

* Hover on phone:

    * When user hovers over the phone, icons slightly brighten and scale up by 5 percent.

No D3 here; animation uses CSS and simple JS timers already available.

**Alien behavior**

* Position: bottom left corner of content region, standing on a tiny platform shaped like a small asteroid.
* Animation:

    * On scene enter, alien slides up from below edge over 1.2 seconds using `alienEnterFromBelow` timing pattern.
    * After entry, a slow float animation moves it up and down by 8 px over 3 seconds, looping.
* Speech bubbles:

    * Bubble 1 appears as soon as alien fully visible: “Welcome to TikTok Tides. We are here to chase viral waves.”
    * After user scrolls a small amount, bubble content changes to: “Keep scrolling, I will point out each ingredient we find.”

**Background transition to next scene**

* As user approaches bottom of the hero section:

    * Star density decreases slightly.
    * The horizon glow grows a bit brighter and more yellow, hinting at dawn.
* On crossing into `section-ignite`, `body[data-scene]` changes to `dawn` which:

    * Lightens the sky color.
    * Introduces a soft radial glow behind the future stopwatch.

---

### Scene 2: Timing ramp and Stopwatch (section-ignite, scene “dawn”)

**Purpose and key message**

* Provide a bridge between general TikTok experience and concrete measurement of duration.
* Prepare user conceptually for the stopwatch viz: clip length matters.

**Layout**

* Section height: about 1.1 times viewport.
* Vertical stack:

    1. Top half: short narrative text and small icon row.
    2. Bottom half: main stopwatch chart area.

**Content**

Top half:

* Title: “Timing is the tide of attention” centered.
* One short paragraph: “Short videos cannot be infinitely long. Viewers swipe away fast. The stopwatch below shows where viral songs cluster inside that time limit.”
* A horizontal row of three icons with labels:

    * “Too short: forgettable flickers”.
    * “Just right: repeatable beats”.
    * “Too long: swipe away”.

Bottom half: Stopwatch viz

**Visualization specifics**

Stopwatch itself follows current implementation, but framed visually:

* Clock face rendered centrally inside a circular frame about 60 percent of container width.
* Duration sectors colored with a gradient from dawn (darker) to glow at “sweet spot” sectors.
* Outer ring labels durations (e.g. “0–15 s”, “15–30 s”, etc).

**Interactions**

* Auto highlight sequence on scene enter:

    * Step 1 (default): entire clock appears with even opacity.
    * Step 2 (after 1 second): sectors with highest song density brighten and pulsing glow for 1.5 seconds.
    * Text callout to the right of clock updates:

        * “Most viral songs live here.” with a small arrow pointing to highlighted sector.
* Hover on any sector or dot shows tooltip as existing.

**Alien behavior**

* Alien floats near the upper right of the clock circle.
* Speech bubble: “See how dots pack into some bands more than others. Virality loves certain durations.”

**Background transition**

* Dawn theme uses a gradient from deep blue at top to pale warm yellow near bottom.
* At bottom boundary, gradient darkens again slightly, preparing to switch into darker orbit scene.

---

### Scene 3: Sound galaxy (section-surface, scene “orbit”, Planet viz)

**Purpose and key message**

* Show that viral sounds concentrate around a small set of artists and sonic profiles.
* Help user visually grasp clustering of high energy, high popularity artists.

**Layout**

* Full bleed layout:

    * Background covers entire viewport with dark navy to teal gradient, dotted with slowly moving star points.
    * Planet viz occupies 70 percent of width and 70 percent of height, centered.
    * Text and step indicators appear along a narrow vertical rail on the left side.
    * Alien stands on a small hovering platform at bottom right.

**Content**

Left rail:

* Step markers: four small circles stacked vertically.
* For each step, a short paragraph:

    1. “First, meet all the artists in our viral dataset.”
    2. “A few planets are much larger and brighter. Those are the dominant viral artists.”
    3. “These planets share high energy and medium danceability. The sound of viral clips is rarely slow and dull.”
    4. “Even with many artists present, a handful shapes the overall sound tide.”

Each paragraph sits horizontally aligned with its marker. Only one paragraph is fully opaque at any time; others are dimmed.

Right area: Planet visualization

**Visualization specifics**

* Use current PlanetViz behavior: orbiting planets around central sun, with encodings as code describes.
* Visual adjustments:

    * Sun: bright glow in center using glint.
    * Planets:

        * Base color: gradient from dawn to blaze for high popularity.
        * Stroke: thin border in shimmer.
    * Orbits: thin rings in muted muse; lighten only when step 3 triggered.

**Scroll step behavior**

Using `viz.update(stepIndex)`:

1. **Step 1 (default)**

    * All planets appear with moderate opacity.
    * No special highlighting.
    * Text: introduction.

2. **Step 2**

    * Call method to dim all planets except top 5 by popularity.
    * Top planets enlarge and gain extra glow.
    * A small annotation label appears next to each highlighted planet: “Artist X has N viral songs”.

3. **Step 3**

    * Highlight high energy, medium danceability band:

        * Orbits corresponding to this band brighten and thicken slightly.
    * Non band planets fade to 40 percent opacity.
    * A legend appears at top right: “Energy” with a simple gradient bar.

4. **Step 4**

    * All planets fade in again but maintain slight emphasis on top artists.
    * A translucent arc sweeps across the system, representing “viral tide”.
    * A short annotation near bottom: “Many artists appear once, but a few shape the tide.”

**Alien behavior**

* Alien stands on a tiny moon at bottom right of viz, holding a telescope.
* On scene enter, alien jumps up from below, then begins slow sideways float.
* Speech bubble at step 2: “Notice how a few artists dwarf the rest. TikTok relies on a small sound galaxy.”

**Background transition**

* As user scrolls to bottom of section, orbit background darkens slightly and a neon city skyline silhouette fades in near the horizon, preparing for record player scene.

---

### Scene 4: Viral vinyl studio (section-spillover, scene “city”, Record player)

**Purpose and key message**

* Zoom in from artist galaxy to individual hits that power viral trends.
* Show that top sounds share characteristics and that a few tracks dominate.

**Layout**

* Split layout with strong asymmetry:

    * Left 40 percent: tall column of narrative text and story panels.
    * Right 60 percent: record player viz almost full height, centered horizontally.

* Background:

    * City skyline at night across bottom third: building silhouettes in dark blues and greens, windows tinted glint.
    * Behind record player, a soft circular spotlight using dawn plus shimmer.

**Content**

Left column:

* Section label: “Chapter 2 · Viral sounds” in small uppercase letters.
* Main heading: “A handful of sounds spin through every feed.”
* Step markers: three small numbered circles aligned vertically.
* Three paragraphs:

    1. “This turntable stacks the biggest viral sounds. Each ring is a track; the center holds the current hit.”
    2. “Watch which songs appear again and again across years by sliding the year range. Some artists stay on the deck.”
    3. “Durations and energy levels of these tracks line up with the sweet spot you saw in the stopwatch.”

Right area: Record player viz

**Visualization specifics**

Use existing RecordPlayerViz behavior with small framing tweaks:

* Center disc: large circle with album art; outer rings represent tracks.
* Tonearm extends from right side toward active ring.
* Info panel sits below the player, full width of right column, styled as a card with white background and rounded corners.

Info panel content:

* Song title in bold.
* Artist name and year in smaller text.
* Short description from `songInfo.json` (for example “Upbeat electronic track used in dance challenges”).
* A small row of icons representing attributes:

    * A tiny clock with duration (for example “18 s”).
    * Flame icon for energy level.
    * Smile or note icon for danceability.

**Interactions**

* Auto sequence:

    * When scene enters view, after 500 ms auto sequence begins.
    * Sequence:

        1. Highlight top ranked ring. Tonearm moves smoothly to that ring. Info panel updates.
        2. After 1.5 seconds, highlight next ring, tonearm moves, info updates.
        3. Repeat for third ring.
    * During sequence, a small banner above player reads: “Top 3 viral sounds in this range”.

* User interaction:

    * Hover ring: ring glows glint, tonearm previews position but does not play audio.
    * Click ring: ring locks as selected; info panel remains on that song.
    * Year range slider below chart:

        * Two handles define a year span.
        * Slider track uses muse; selected span uses blaze gradient.
        * On handle change, records reflow with 500 ms transition.

Because audio playback is unreliable, treat sound icon as “muted by default”:

* A mute toggle icon near top right of the card shows sound state.
* When sound cannot play, show tooltip on icon: “Audio preview unavailable in this demo”.

**Alien behavior**

* Alien stands at bottom right as DJ, with one hand on a tiny second turntable.
* Animation: gentle head bob up and down.
* Speech bubble: “These are the sounds that everyone reuses. They match the energy and duration sweet spots you saw earlier.”

**Background transition**

* City skyline remains, but at bottom of section, lights fade slightly and a forest of tall triangular shapes starts to appear behind buildings, hinting at next forest scene.

---

### Scene 5: Trend pyramid in the forest (section-fade, scene “forest”, Ranking)

**Purpose and key message**

* Show that viral views are not equally distributed across topics.
* Reveal that some categories and their creators stand much higher on the viral pyramid.

**Layout**

* Foreground: large pyramid of sticky notes slightly right of center.
* Left side: text column plus step markers.
* Background: stylized forest illustration with dark silhouettes of trees; sky tinted deep green and teal.

**Content**

Left column:

* Chapter label: “Chapter 3 · Trends and categories”.
* Main heading: “Some topics tower above the rest.”
* Three step paragraphs:

    1. “Each sticky note here represents a content category. The top row holds the most viewed categories.”
    2. “Lift a note to reveal its name and see how much higher it stands than the rest.”
    3. “Inside each category lives a crowd of creators. Sometimes a single giant dominates the view count.”

Right area: Ranking pyramid visualization

**Visualization specifics**

* Pyramid layout:

    * Base row: three sticky note covers, slightly offset horizontally to create sense of depth.
    * Middle row: two notes.
    * Top: one note.

* Each sticky note:

    * Shape: square around 120 px wide, with small folded corner at top right.
    * Cover color: slightly desaturated glow of glint or dawn.
    * Rank number printed large in center of cover.

* Under each cover, revealed note:

    * Background: pale muse.
    * Category name at top.
    * Simple metric line: “Total views: 123M”.
    * Tiny tag icons: hashtags or genre words.

* On click of a revealed note, popup panel appears centered on screen:

    * Panel width: about 60 percent of viewport.
    * Title: category name.
    * Inside: bubble chart of creators with circles sized by views.
    * Right side: vertical column listing top 3 creators with their handles and sample hashtags.

**Interactions**

* Initial auto emphasize:

    * When scene enters view, the top rank sticky note shakes gently once and its cover lifts 10 px then falls back.
    * A label arrow appears near it: “Most viewed category”.

* Hover:

    * Hover on any cover lifts it slightly (translate up by 4 px) and casts a small shadow.

* Click cover:

    * Cover falls off with a short physics like drop animation.
    * Underlying category is revealed permanently for that category.
    * A small explanation line appears at bottom: “Category: Dance challenges focus on short, repeatable moves.”

* Click revealed note:

    * Popup opens with bubble chart.
    * Background behind panel darkens.
    * Clicking close icon or outside panel closes the popup.

**Alien behavior**

* Initially hidden behind a tree on left. Only its eyes and antenna show.
* When user first reveals any sticky note, alien slides out from behind tree to stand near pyramid base.
* Speech bubble: “Peeling these layers shows which topics really dominate the tide.”

**Background transition**

* As user scrolls to bottom of forest scene, sky gradually lightens and tree silhouettes fade into a soft sky with floating speech bubbles, moving toward the emotion scene.

---

### Scene 6: Captions and emotions in the air (section-takeaway, scene “air”, Emotion)

**Purpose and key message**

* Show that caption language and emotional tone matter.
* Emphasize that viral captions lean toward specific emotional patterns.

**Layout**

* Background: bright airy gradient from light blue at top to white at bottom, with translucent speech bubbles drifting slowly.
* Foreground layout:

    * Center: large bubble cloud viz area covering about 60 percent of width.
    * Right side: narrow control panel for filters and legend.
    * Left side: short paragraphs.

**Content**

Left side:

* Title: “Captions give videos a voice.”
* Two short paragraphs:

    1. “Every clip here comes with a caption. Our model groups them by emotion: hype, curiosity, nostalgia, and more.”
    2. “We compare viral captions to typical ones to see which tones appear more often when a video takes off.”

Right panel:

* Filter controls:

    * Toggle or buttons to select:

        * “All captions” vs “Viral captions only”.
    * Checkboxes for emotion categories: “Hype”, “Joy”, “Curiosity”, “Nostalgia”, “Calm”, “Other”.

* Legend:

    * A row of colored mini bubbles mapping each color to an emotion label.

Center: Emotion viz

**Visualization specifics**

Based on current implementation:

* Bubbles represent words or topics.
* Size encodes frequency of word or importance within selected subset.
* Color encodes emotion category.
* Bubbles float slightly within a defined area.

Visual styling:

* Use glint and blaze for higher energy emotions (hype, joy).
* Use dawn and muse for softer emotions (nostalgia, calm).
* Bubble border: thin white line to distinguish adjacent bubbles.

**Interactions**

* Auto state:

    * On scene enter, default filter is “Viral captions only”.
    * Bubbles appear with gentle grow animation from radius 0 to full over 600 ms.
    * A small text label floats at top of viz area: “Showing viral captions only”.

* Toggle behavior:

    * When user switches from “Viral only” to “All captions”:

        * Bubbles re-layout; some shrink or grow.
        * A faint vertical split line may appear for 500 ms to visually represent comparison, then fade.
    * Optionally, animate color saturation:

        * Viral only: colors more saturated.
        * All captions: colors slightly muted.

* Hover:

    * Hover bubble displays tooltip with:

        * Word or phrase.
        * Example caption line containing that word.
        * Emotion category label.
        * Simple metric: “Appears in 35 percent of viral captions”.

**Alien behavior**

* Alien hangs from a speech bubble by one hand near top center.
* Speech bubble: “Notice how some tones fill more space in the viral view. Hype and curiosity stretch out farther here.”

**Background transition**

* As user scrolls down, floating bubbles drift upward and fade, while a subtle lab scene emerges at bottom: beakers and tubes from lab illustration start to appear, transitioning into the quiz lab.

---

### Scene 7: Quiz conveyor in the lab (section-ingredients, scene “lab”, Conveyor)

**Purpose and key message**

* Let users test themselves on what matters for virality.
* Provide immediate feedback that reinforces takeaways.

**Layout**

* Background: lab illustration with counters, beakers, pipes, and bubbles.
* Foreground:

    * Top half: multiple choice question panel.
    * Middle: single large conveyor card in spotlight.
    * Bottom: belt with other cards moving horizontally.

**Content**

Question panel (top):

* Title: “Can you spot a viral recipe?”

* Under that, the current question text, such as:

    * “Which version of this video is more likely to go viral?”

* Answer buttons:

    * Two or three rectangular buttons stacked vertically.
    * Each button contains a short scenario:

      For example:

        * “Version A: 9 second dance clip, using a top trending sound, caption: ‘Repeat after me’.”
        * “Version B: 45 second clip with a slower song, caption: ‘Here is my entire day’.”

* Buttons styled as:

    * Background: muse.
    * Selected state:

        * Correct: background changes to glint with a thin glow; small check icon appears on left.
        * Incorrect: background changes to ember with a small cross icon.

Explanation area:

* Below buttons, a small area reserved for explanation text.
* Example: “Version A fits our findings: mid length, high energy sound, caption that invites repetition.”

Conveyor card (middle):

* One large card aligned with center of belt, representing the **question context**:

    * Visual summary:

        * A small phone outline with simple colored blocks representing different versions.
        * Icons at bottom representing sound and duration.
    * Non interactive; just display.

Belt (bottom):

* Narrow horizontal strip with smaller cards sliding from right to left at a constant slow speed.
* Each card shows thumbnail icons for previous or upcoming questions.
* The card under spotlight in the middle row visually corresponds to the active question above.

**Interactions**

* Question flow:

    * On scene enter, first question auto loads in question panel and the corresponding card slides into the center of belt with a slight snap.
    * User clicks an answer button:

        * Button immediately changes to correct or incorrect style.
        * Correctness message appears in explanation area.
        * Alien reacts (see below).
    * A “Next question” button appears in explanation area after answer is shown.
    * Clicking “Next question” slides belt to bring next card into center and replaces question text.

* Cards:

    * Cards on belt are not clickable; pointer cursor remains default.
    * However, card in center is slightly larger and has thicker border to emphasize connection to active question.

**Alien behavior**

* Alien stands atop the conveyor belt near left side wearing lab goggles.
* Idle animation: arms move up and down as if operating a lever.
* On correct answer:

    * Alien jumps up 10 px and confetti shaped like tiny music notes float up around it for 800 ms.
    * Speech bubble: “Nice call. That version matches the recipe we discovered.”
* On incorrect answer:

    * Alien tilts head sideways.
    * Speech bubble: “Almost. Look again at the sound and duration choices.”

**Background transition**

* Lab scene remains but gradually dims slightly towards bottom, where a final wrap up card sits atop a clean table.

---

### Scene 8: Wrap up recipe card (end of section-ingredients)

**Purpose and key message**

* Provide a clear, concise summary of findings.
* Connect all scenes back to the central question.

**Layout**

* Large card centered horizontally, width about 60 percent of viewport.
* Background outside card: lab remains but blurred slightly to make card pop.

**Content**

Card structure:

1. **Heading**

    * “Recipe for a viral short video (according to our tides)”.

2. **Two column grid inside card**:

    * Left column: labelled “Ingredients”.

        * Bullet listing:

            * “A sound from a small group of dominant artists or popular tracks.”
            * “Clip length near the duration band where our stopwatch shows the densest cluster.”
            * “A category near the top of our trend pyramid.”
            * “A caption tone leaning toward hype or curiosity rather than flat description.”
            * “Connection to communities that use that sound repeatedly.”

    * Right column: labelled “What the charts showed”.

        * For each ingredient, a tiny thumbnail icon representing the corresponding viz:

            * Mini solar system circle for sound.
            * Tiny clock for timing.
            * Mini pyramid for category.
            * Bubble sprite for emotion.
            * Belt icon for quiz check.

3. **Closing text**

    * Two short sentences summarizing trade offs, for example:

        * “Not every video that uses these ingredients will go viral. However, our data shows that viral clips tend to live in this region of the TikTok Tides.”

**Alien behavior**

* Alien stands next to card holding a clipboard.
* Speech bubble: “You have reached the shore. Remember, this recipe does not guarantee virality, but it shows where most viral waves form.”

**Interaction**

* The only interaction is a “Back to top” button at bottom of card.

    * Button style: rounded pill using blaze background and white text.
    * On hover, background brightens slightly.

---

## Stage 6. Design system and visual language

This section defines a concrete design system that can be translated into CSS tokens and utility classes.

### 6.1 Color roles (using TikTok palette)

Palette:

* glint:   `#2DCCD3`
* blaze:   `#F1204A`
* thrive:  `#033624`
* shimmer: `#BAF6F0`
* dawn:    `#EDBBE8`
* ember:   `#4A0505`
* glow:    `#FBEB35`
* muse:    `#EDD4B2`

Roles:

1. **Background tiers**

    * Primary dark backgrounds (space, city):

        * Base: thrive darkened by about 20 percent.
    * Mid backgrounds (forest, lab):

        * Use muted variants of muse and dawn mixed with thrive at low opacity.
    * Light backgrounds (air, hero text areas):

        * Base: shimmer and muse at high brightness.

2. **Text**

    * Primary text on dark backgrounds: pure white.
    * Primary text on light backgrounds: near black (for example `#111`).
    * Secondary text: medium gray that passes contrast checks.
    * Emphasis text: blaze for key numbers or labels.

3. **Interactive elements**

    * Primary actions (buttons, key toggles): blaze background, white text, hover lighten by 10 percent.
    * Secondary actions: glint border with transparent background, text glint; hover fill shimmer.
    * Chips and badges: dawn background, dark text, with thin border of glint.

4. **Chart encodings**

    * Positive or high intensity: blaze or glow.
    * Neutral: glint or shimmer.
    * Negative or “less effective”: ember, used sparingly (for example to indicate wrong quiz choice).
    * Emotional categories:

        * Hype: blaze.
        * Joy: glow.
        * Curiosity: glint.
        * Nostalgia: dawn.
        * Calm: muse.
        * Other: muted thrive.

5. **States in quiz**

    * Correct: background glint, left border glow.
    * Incorrect: background ember, text white.

### 6.2 Typography hierarchy

Use a modern geometric sans serif such as “Inter” or similar, with fallbacks.

Sizes (approximate on 16 px base):

* Display title (Scene titles): 32–40 px, bold.
* Section headings: 28 px, semi bold.
* Subheadings and card headings: 20–22 px, medium weight.
* Body text: 16 px regular.
* Small annotations and legends: 12–14 px.

Line heights:

* Titles: 1.2 line height.
* Body text: 1.5 line height.
* Captions: 1.4 line height.

Use consistent letter spacing:

* Uppercase labels (scene labels, chip text): slight letter spacing (for example 0.08em).

### 6.3 Spacing and corner radii

Spacing system:

* Base unit: 8 px.
* Small gap: 4 px.
* Medium gap: 8 px.
* Large gap: 16 px.
* Extra large: 24 px.
* Margins between major sections: at least 48 px.

Corner radii:

* Cards and panels: 16 px radius for friendly rounded shape.
* Buttons and pills: 999 px radius for full pill shape.
* Speech bubbles: 12 px radius with triangular pointer.

### 6.4 Panel and card styles

1. **Standard narrative panel**

    * Background: semi transparent dark overlay for dark scenes, or white with slight shadow for light scenes.
    * Padding: 24 px on all sides.
    * Border radius: 16 px.
    * Shadow: soft shadow offset 0 8 px 24 px with 20 percent opacity.

2. **Info panels under visualizations**

    * For record player and ranking popups:

        * Use white background with subtle border of shimmer.
        * Include a colored bar at top using blaze or glint to connect to active scene.
        * Use clear hierarchy: title at top, then bullet list, then small metrics.

3. **Quiz answer buttons**

    * Default: muse background, solid border of transparent 1 px.
    * Hover: border becomes glint and background brightens slightly.
    * Correct: glint fill, glow border, small left side icon area.
    * Incorrect: ember fill, text white.

### 6.5 Icon usage

* Use a consistent icon set such as Heroicons or Lucide for:

    * Phone outline, heart, comment, share, play, pause, clock, disc, flame, tag, quote, beaker.

* Only monochrome icons; colors applied via CSS (for example white at base, tinted with glint when active).

* Size rules:

    * Phone screen icons: 24 px.
    * Nav icons: 20 px.
    * Map nodes: 20 px inside 40 px circles.

No emojis used anywhere.

### 6.6 Motion timing and easing

Motion patterns:

1. **Scene transitions**

    * When `body[data-scene]` changes, fade backgrounds over 500 ms.
    * Use ease in out cubic for opacity and background color transitions.

2. **Scroll step animations**

    * Planet highlights, pyramid cover drops, record auto sequences:

        * Duration: 400–800 ms.
        * Easing: ease out cubic for highlight expansions; ease in for cover drops.

3. **Alien animations**

    * Enter from below: 1.2 seconds, 0.3 second delay at scene entry, using custom cubic; then float loops every 3 seconds.

4. **Micro interactions**

    * Hover scaling: 150 ms, ease out.
    * Button presses: 120 ms transform from scale 1.0 to 0.97 then back.

Respect `prefers-reduced-motion` by:

* Disabling background parallax and auto sequences.
* Keeping only essential visual changes, such as opacity adjustments.

### 6.7 Chart specific visual guidelines

1. **Stopwatch**

    * Use distinct hues for each duration bucket but same saturation; highlight cluster bucket with extra glow.
    * Tooltips use white background and small shadow.

2. **Planet**

    * Planet sizes range should be visibly different at a glance (factor of about 2 between smallest and largest).
    * Avoid too many strong colors at once; use one main accent per planet plus white border.

3. **Record player**

    * Rings should be thick enough that highlight is visible even when many rings overlap.
    * Tonearm should not obscure ring labels; choose angles that keep label arcs readable.

4. **Ranking pyramid**

    * Sticky note covers share consistent dimensions and spacing; ensure depth effect is clear but not cluttered.
    * Bubble chart has clear axis free background; use forest theme only in outer frame to maintain readability.

5. **Emotion word cloud**

    * Label text inside bubbles uses contrasting color (dark text on light fill).
    * Avoid overlapping labels; when necessary, some smaller bubbles show only color and reveal text on hover.

6. **Conveyor quiz**

    * Cards on belt share consistent spacing; card under spotlight is clearly larger and centrally aligned.
    * Use motion for belt that is slow and gentle; user must not feel rushed.
