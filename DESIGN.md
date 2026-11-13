---
name: "Neutrino & Dark Matter Group"
description: "An editorial, warm-paper website for an experimental particle-physics group."
colors:
  paper: "#f7f5ef"
  paper-deep: "#ece9df"
  paper-light: "#fcfbf7"
  ink: "#172f38"
  teal: "#184a52"
  muted: "#59686a"
  accent: "#a84f32"
  accent-light: "#dfb7a5"
  line: "#d5d8d1"
  line-strong: "#b8c1ba"
  dark: "#132e35"
  white: "#ffffff"
  success-ink: "#365f3c"
  success-line: "#a7bba8"
typography:
  display:
    fontFamily: "\"Iowan Old Style\", \"Palatino Linotype\", Palatino, Georgia, \"Songti SC\", serif"
    fontSize: "clamp(3rem, 5.4vw, 5.2rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "\"Iowan Old Style\", \"Palatino Linotype\", Palatino, Georgia, \"Songti SC\", serif"
    fontSize: "clamp(2rem, 3.2vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "\"Iowan Old Style\", \"Palatino Linotype\", Palatino, Georgia, \"Songti SC\", serif"
    fontSize: "clamp(1.3rem, 2vw, 1.65rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, \"PingFang SC\", sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  body-small:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, \"PingFang SC\", sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, \"PingFang SC\", sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.16em"
  control:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, \"PingFang SC\", sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  none: "0px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  xl: "48px"
  2xl: "64px"
  section: "86px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-light}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "12px 22px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.white}"
  button-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "12px 22px"
    height: "50px"
  button-light-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.accent}"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0 0 5px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.control}"
  nav-link-current:
    textColor: "{colors.accent}"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.none}"
    padding: "10px 13px"
    height: "46px"
  card-surface:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "28px"
  status-chip:
    backgroundColor: "transparent"
    textColor: "{colors.success-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
---

# Design System: Neutrino & Dark Matter Group

## Overview

**Creative North Star: "The Observatory Reading Room"**

The site reads as a quiet scholarly reading room: warm paper, deep blue-green ink, a single rust accent, and serif headlines over plain sans working text. It is editorial print translated to the web — visible hairline rules, figure-style captions, and measured spacing rather than app-like chrome.

Density is moderate-spacious and content-led. Sections separate through tonal paper bands and 1px rules, never through floating cards or shadows. Photography is treated as an archival plate: square-edged, captioned, and in the hero given a thin offset frame in the accent color. Metadata is deliberately small and uppercase, so the large serif titles and the photographs carry the hierarchy.

This record is a close reading of the shipped implementation, not a prior brand decree. The descriptive language is inferred from tokens, components, and rendered patterns; revise the wording freely without changing the normative tokens above.

**Key Characteristics:**
- Warm paper ground with deep petrol ink for text.
- Serif display type over a system sans for body and controls.
- Square geometry everywhere, with 1px hairline rules doing the separating.
- One rust accent used sparingly for dates, active states, focus, and small rules.
- Uppercase micro-labels and figure-style captions (`Fig. 01`).
- Photography as archival plates with narrow, factual captions.
- No shadows, no gradients, no decorative illustration.

## Colors

A warm, low-chroma archival palette: paper tones for ground, dark petrol for text, rust as the single expressive note, and green reserved for open-status marks.

### Primary
- **Oxblood Rust** (`accent`): Dates, active navigation, current-page underline, hover text, focus rings, small 2px rules, and status labels. It is the only saturated color and is always a signal, never a field.
- **Faded Oxblood** (`accent-light`): Text selection background and the soft hover border on research cards.

### Secondary
- **Petrol Teal** (`teal`): Button hover fill and the fallback initial on portrait cards. A supporting dark, never a competing accent.

### Tertiary
- **Moss Green** (`success-ink`) and **Sage Border** (`success-line`): The "Open" recruitment status chip only.

### Neutral
- **Warm Paper** (`paper`): The page ground and default section background.
- **Aged Paper** (`paper-deep`): Alternate sections, photo wells, contact cards, and goal callouts.
- **Bone** (`paper-light`): Card surfaces and text on dark ink buttons.
- **Deep Ink** (`ink`): Headings, primary text, primary buttons, and the skip link.
- **Slate Ink** (`muted`): Body paragraphs, captions, metadata, and secondary labels.
- **Hairline Grey** (`line`): The default 1px rule between sections, list rows, and columns.
- **Pencil Grey** (`line-strong`): The slightly darker 1px border on form fields.
- **Night Petrol** (`dark`): Footer and dark statement bands.
- **Paper White** (`white`): Only inside logo and photograph wells, never as a page background.

### Named Rules
**The One Accent Rule.** Rust is used on less than roughly 10% of any screen and only for small signals — dates, active states, focus, and thin rules. It never fills a button, band, or card.

**The Paper Ground Rule.** Page backgrounds come from the paper family. Pure white is reserved for image wells where a logo or portrait must sit on a neutral field.

**The Ink Rule.** Body copy is Slate Ink; headings are Deep Ink. Pure black is never used for text.

## Typography

**Display Font:** Iowan Old Style (with Palatino Linotype, Palatino, Georgia, Songti SC, serif)
**Body Font:** System UI sans (with Segoe UI, Arial, PingFang SC)
**Label Font:** The same system sans, set small and wide.

**Character:** A literary serif carries the voice while a plain, neutral sans handles everything operational. The pairing feels like a university press page rather than a product interface: warm, unhurried, and precise.

### Hierarchy
- **Display** (400, clamp 3rem–5.2rem, 1.02): The homepage title only; tight tracking and balanced wrapping.
- **Headline** (400, clamp 2rem–3rem, 1.15): Section and page titles.
- **Title** (400, clamp 1.3rem–1.65rem, 1.15): Card names, list-item titles, and subheads.
- **Body** (400, 16px, 1.65): Default prose and page introductions; reading measures sit around 65–75 characters.
- **Body Small** (400, 13px, 1.75): Metadata, list summaries, captions, and form text.
- **Label** (700, 11px, 1.4, 0.16em, uppercase): Eyebrows, category tags, field labels, and section markers.

### Named Rules
**The Serif Ceiling Rule.** The serif is for headings, names, pull-quotes, and figure captions only. Body copy, navigation, buttons, labels, and form controls always use the sans.

**The Two-Stack Rule.** No third typeface. Icons and arrows are text glyphs (`→`, `↗`, `☰`), not an icon font.

**The Micro-Label Rule.** Uppercase micro-labels use 11px, weight 700, and 0.16em tracking. At card scale they may drop to 10px; content-bearing captions and metadata stay at 11px or larger. They never gain color beyond rust or Slate Ink.

## Layout

The site uses a centered editorial container of `min(1200px, 100% - 96px)`, narrowing to 64px gutters at 1000px, 48px at 820px, and 36px at 600px. Sections use 86px block padding (54px for tight sections, 56px on small screens).

The homepage opens with a two-column hero (`1.04fr / 1fr`, 64px gap) that stacks below 820px, image after copy. Content below alternates between the paper ground and Aged Paper bands.

List pages favor a date-first row: a fixed 150px time column and a flexible content column, separated by 1px rules. Detail and archive layouts use asymmetric editorial grids: research entries at `250px / 1fr`, profiles at `300px / 1fr`, openings at `260px / 1fr`, all collapsing to one column at 600px. Card grids are three-up for members and gallery previews, two-up for research overviews and albums.

Breakpoints are 1100px (navigation tightening), 1000px (container and grid compression), 820px (mobile menu, hero stack, two-up grids), and 600px (single-column everything, reduced type).

### Named Rules
**The Rule Line, Not Box Rule.** Sections and list items are separated by 1px Hairline Grey rules and tonal paper bands. Do not convert a section into a floating card, and do not stack bordered boxes where a rule would do.

## Elevation & Depth

This system is flat by design: there are no shadows, no glows, and no gradients anywhere. Depth comes from tonal layering (Warm Paper → Aged Paper → Night Petrol) and from 1px rules, not from elevation. The single structural overlap is the homepage hero photograph, which carries a 1px rust frame offset to its top-right; it is a compositional device, not a shadow.

### Named Rules
**The Flat-By-Default Rule.** Surfaces never lift. Hover and focus are expressed through color, border color, and underline — not through shadow or translate.

**The Offset Frame Rule.** The hero photograph's thin rust frame is the only offset overlap in the system. Do not add offset frames to cards, portraits, or other images.

## Shapes

Forms are square. Cards, buttons, inputs, status chips, photo wells, and bands all use a 0px radius. The only circles are the 44px brand mark (`Ye` in italic serif, 1px ink border) and the 6px accent status dot. Borders are uniformly 1px; the emphasis rule is 2px rust. Photography uses fixed aspect ratios: 4:3 for hero and gallery covers, 4:4.6 for member portraits (4:4.8 on profiles, 3:4 on small screens), and free height for album plates. Portraits use `object-fit: contain` inside tinted wells; hero and gallery images use `cover`.

### Named Rules
**The Square-Edge Rule.** Radius is 0 everywhere except circles for the brand mark and status dot. Pills, rounded cards, and rounded inputs are off-system.

## Components

### Buttons
- **Shape:** Hard rectangle, 0px radius, 1px transparent border, minimum height 50px, padding 12px 22px.
- **Primary:** Deep Ink fill with Bone text, 13px/600 sans, an arrow glyph pushed right by a 28px gap. Hover fills Petrol Teal with white text.
- **Secondary:** Transparent fill, 1px Hairline Grey border, Deep Ink text. Hover turns white with rust text.
- **Focus:** Global 3px rust outline with 4px offset. No shadow, no scale.

### Text Links
Inline links inherit color and gain rust on hover. Arrow links use a 13px/650 label with a 1px bottom border in the current text color and a trailing arrow: `→` for internal destinations and `↗` for external ones. Arrows are decorative (`aria-hidden`); the bottom border is the affordance, not a button shape. Within prose, links are underlined with a muted hairline that turns rust on hover.

**The Arrow Rule.** `→` marks an internal destination; `↗` marks an external one. Never use `↗` on an internal link or `→` on an external one, and never let an arrow carry the only meaning.

### Chips
Status chips are 1px-bordered squares with 4px 10px padding and 10px/700 uppercase text. `Open` uses the moss/sage pair; general inquiry uses rust on faded rust; everything else uses Hairline Grey with Slate Ink.

### Cards / Containers
- **Member card:** No border and no background; the portrait sits in a square Aged Paper well with an arrow tab in the bottom-right corner. Name is serif, role is a 10px uppercase rust label, Chinese name is 12px Slate Ink.
- **Research / activity card:** 1px Hairline Grey border, Bone background, 28px padding, 0px radius. Hover changes only the border color to Faded Oxblood.
- **Album card:** Borderless; the image well and caption carry it. Hover scales the cover image by 1.018 over 260ms.
- **Cards never float.** No shadow, no offset, no rounded corner.

### Inputs / Fields
Search and select fields are 46px tall with a 1px Pencil Grey border, transparent fill, 0px radius, and 13px text. Labels sit above in Slate Ink at 11px. Focus uses the global 3px rust outline. The select chevron is an inline SVG data URI in Deep Ink.

### Navigation
The header is a 92px band (76px on small screens) with a 1px Hairline Grey bottom border and a paper-tinted background. The brand pairs a 44px circular `Ye` mark with two lines of 14px/700 uppercase sans. Links are 13px/550 with 26px spacing; the current page turns rust and gains an 18×2px rust underline at the bottom-left. Below 820px, a bordered `Menu` button toggles a full-width stacked navigation; Escape closes it and returns focus, and the page scroll locks while open.

### Signature Components
- **Date-first record row:** News, activities, and publications share a 150px (or 92px for publications) date/year column in rust, followed by content, with 1px rules between rows.
- **Figure caption:** Hero images pair a factual caption with a `Fig. 01 / Group` marker in 11px uppercase tracking.
- **Hero carousel controls:** 40px square numbered buttons, previous/next, a pause control, and a visible `1 / 4` position. Autoplay stops after one full cycle, pauses on hover, and is disabled under reduced motion.
- **Open-positions band:** A full-width Warm Paper band after Research and before Latest news, with a serif "Work with us." heading, one factual sentence carrying the last-reviewed date, an ink primary button, and a small mail link. No eyebrow and no card.
- **Editorial-preview notice:** An Aged Paper block bounded by top and bottom hairlines, with a bold "Editorial preview." lead at body-small size. It appears with news records marked `editorial_preview` on the homepage list, archive, and detail page.

## Do's and Don'ts

### Do:
- **Do** keep every corner at 0px; reserve 50% for the brand mark and status dot.
- **Do** separate sections with 1px Hairline Grey rules and Warm Paper / Aged Paper tonal shifts.
- **Do** use the serif at display and title scale only; keep body, controls, and labels in the sans.
- **Do** use rust for dates, active navigation, focus rings, hover text, and rules of 1–2px.
- **Do** keep uppercase micro-labels at 10–11px/700 with 0.16em tracking, and content-bearing captions at 11px or larger.
- **Do** use `→` for internal links and `↗` for external links; keep arrows decorative with `aria-hidden`.
- **Do** give auto-updating content a visible pause control and a position indicator.
- **Do** preserve `object-fit: contain` for member and profile portraits, and `cover` for hero and gallery imagery.
- **Do** keep transitions short and functional: 160ms for state, 200–260ms for image opacity/scale, 700ms only for the hero cross-fade.
- **Do** honor `prefers-reduced-motion` by disabling the carousel loop and all transitions.
- **Do** keep captions factual and small; the photograph, not the caption, carries the moment.
- **Do** surface open positions in the homepage body with the same restraint as the rest of the page: a tonal band, one factual sentence, and one primary action.

### Don't:
- **Don't** add border-radius to buttons, cards, inputs, chips, or photo wells.
- **Don't** add box-shadows, glows, or gradients.
- **Don't** fill large areas with rust; it is a signal, not a surface.
- **Don't** use pure black text or pure white page backgrounds; white belongs only inside image wells.
- **Don't** introduce a third typeface or an icon font.
- **Don't** update layout by turning sections into floating cards, stat tiles, or bento grids.
- **Don't** use the serif for buttons, navigation, form labels, or body copy.
- **Don't** add offset frames or decorative outlines to anything except the homepage hero photograph.
- **Don't** autoplay the hero carousel when reduced motion is requested, and never let it autoplay over a focused link.
- **Don't** bury recruitment status in an eyebrow or small print; the band's heading and sentence carry it.
- **Don't** use `↗` on internal links or `→` on external links.
