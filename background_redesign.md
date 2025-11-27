### Scene 1 – Arrival hero (fixed as requested)

**Family**: Space / Orbit

**Background**:

* Full viewport canvas with:

    * Deep navy to black vertical gradient.
    * Dense, tiny white star specks, slightly brighter near the top.
    * A large curved planet horizon at the bottom, slightly off center, with a cyan and magenta glow that matches glint and blaze.
* The phone sits above the planet horizon, as if hovering in low orbit.

**Transition to Scene 2**:

* As the user scrolls out of Scene 1:

    * The planet horizon moves up slightly and shrinks.
    * Additional smaller planets and orbit rings fade in around it.
* Starfield and gradient remain unchanged. User should feel that they are zooming from “arrival view” into a broader orbital map.

---

### Scene 2 – Planet music solar system

**Family**: Space / Orbit

**Background**:

* Reuse **exact same starfield and gradient** from Scene 1.
* The large planet horizon from Scene 1 becomes slightly smaller and moves to the lower left corner.
* Additional faint ring outlines are added behind the actual D3 planet orbits (very low opacity, just to suggest structure).
* No new colors introduced. Only soften or slightly reposition existing planetary shapes.

**Transition from Scene 1**:

* The starfield does not change.
* The horizon shrinks and slides left while music planets fade in.
* Feels like the camera pulled back to reveal the larger system, not a different place.

**Transition to Scene 3**:

* On scroll to Scene 3:

    * The central largest planet gradually shifts toward the center of the screen and increases in size.
    * The extra smaller planets and far orbits fade to a lower opacity, so the large planet is dominant.

---

### Scene 3 – Record Player

You said you like the record player background from the earlier spec, but are unsure if it fits. Here is how to make it fit.

**Family**: Space / Orbit

**Background**:

* Keep the **same starfield and top gradient** from Scenes 1 and 2.
* The big central “planet” from Scene 2 gradually becomes the main disc of the record player.
* The v2 record player background elements are added as a **foreground layer** that sits just behind the D3 SVG:

    * A slightly tilted circular platform beneath the record, with subtle glow ring in blaze.
    * Very faint radial lines around the record to suggest grooves.
    * A minimal, stylized tonearm silhouette on the right edge, but with extremely low opacity so it does not interfere with labels.
* The horizon from Scene 1 is no longer a strong curve here, but its glow color is reused as the highlight rim around the record platform.

The result: it still feels like we are in orbit, but we have zoomed into one “sound planet” and discovered it is also a record. That keeps the background consistent in world building and makes the v2 design usable.

**Transition from Scene 2**:

* The user scrolls down.
* The big central planet from Scene 2 scales up and becomes the record disc.
* Smaller planets fade out.
* The tonearm and platform fade in.

---

### Scene 4 – Stopwatch duration

**Family**: Studio Dashboard

**Background**:

* Base gradient:

    * Top: same deep teal as the space scenes, but with the stars almost completely faded out.
    * Bottom: slightly lighter teal, hint of a studio wall or soundproof panel.
* Simple studio elements:

    * Two or three vertical columns on the far left and right, very dark, hinting at equipment racks.
    * A soft vignette behind the stopwatch viz, using shimmer as a subtle glow.
* No distinct new theme like “space” or “city”; this should feel like you stepped inside a TikTok “analytics lab” that still remembers the space colors.

**Transition from Scene 3**:

* The starfield fades to almost zero opacity.
* The record disc and tonearm slide down and disappear.
* A dark frame appears around the center and the stopwatch visualization fades in over it, as if you are now examining metrics in the control room.

---

### Scene 5 – Ranking pyramid

**Family**: Studio Dashboard

**Background**:

* Same base gradient as Scene 4.
* Add only a few faint triangular silhouettes in the distant background to suggest pyramid shapes.
* Keep them large and low opacity so they do not compete with the D3 pyramid.

**Transition from Scene 4**:

* The stopwatch frame slides left or shrinks.
* One of the faint triangular shapes in the background becomes more visible for a moment as the new scene’s frame appears.
* Because gradient and studio tone are the same, the user perceives it as moving from one dashboard panel to the next.

---

### Scene 6 – Emotion bubbles

**Family**: Studio Dashboard

**Background**:

* Same base gradient as Scenes 4 and 5.
* Add very faint, blurry speech bubble outlines in the top corners, large and low contrast.
* Inside the actual D3 emotion viz area, the background should be a flat slightly dark panel, so bubbles and text remain clear.

**Transition from Scene 5**:

* Pyramid scene fades its triangular shadows.
* The soft speech bubble outlines appear near the edges.
* Emotion bubbles animate into place over a still base.

---

### Scene 7 – Conveyor quiz

**Family**: Show Stage

**Background**:

* Base gradient slightly warmer, for example deep teal at the top transitioning to a deeper bluish black at the bottom, with subtle colored “stage lights”.
* Add a horizontal strip near the bottom that resembles a stage floor:

    * A wide, low contrast rectangle that the conveyor belt can visually “sit” on.
* Behind the conveyor belt and quiz panel, add two faint light beams angled up from the sides, to suggest a game show spotlight.

**Transition from Scene 6**:

* The studio background darkens slightly.
* The speech bubble outlines shrink and vanish.
* The stage floor strip rises from the bottom.
* Spotlights fade in slowly, after the quiz UI appears, so they do not distract.

---

### Scene 8 – Wrap up

**Family**: Show Stage, but calmer

**Background**:

* Keep the same gradient as Scene 7 but tone down the spotlights.
* Remove the conveyor stage floor and instead show a simple wide platform where the alien and a summary panel stand.
* In the far background, very faint stars can return at the top, hinting back to Scene 1 and completing the loop.

**Transition from Scene 7**:

* Conveyor and answer panel slide off screen.
* Stage lights dim.
* The platform with summary text and alien fades in.
* Very faint stars fade in at the top so the story ends in a softer echo of the original space scene.