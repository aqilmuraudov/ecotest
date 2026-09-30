# ECOLIFE ARCHITECTURAL DESIGN SYSTEM (V2)

> "Light is not merely illumination. Light is an architectural material."

---

## 1. COLOR & ILLUMINATION SYSTEM

### Neutrals (Material Base)
The palette is derived from architectural building materials: raw concrete, matte black powder-coated aluminium, brushed natural anodized aluminium, and soft milky polycarbonate diffusers.

- **Obsidian Dark (Canvas)**: `#08090A` — Deep architectural neutral canvas, non-reflective.
- **Structural Charcoal**: `#0E1013` — Surface foundation for architectural blocks and section bands.
- **Anodized Dark Surface**: `#14161B` — Elevated architectural planes, technical spec panels.
- **Milled Aluminium**: `#1C1F26` — Border strokes, mechanical separation lines, hairline architectural grids.
- **Off-White Warmth**: `#F4F4F2` — Primary typography, softened from harsh digital white to match warm illuminated gallery walls.
- **Architectural Muted**: `#8E929B` — Technical metadata, specifications, dimension callouts.
- **Hairline Divider**: `rgba(255, 255, 255, 0.08)` / `rgba(255, 255, 255, 0.12)` — Architectural drafting lines.

### Accent: Ecolife Luminary Amber-Yellow
Yellow is **strictly treated as emitted light / energy**. It is never used as random decorative background paint.
- **Core Emission**: `#FFD21A` (approx. 3000K warm halogen/LED peak).
- **Subtle Optical Glow**: `rgba(255, 210, 26, 0.15)` — Soft optical diffusion, not muddy neon blur.
- **Technical Indicator**: `#FFD21A` for active CCT selection, active track circuit, illuminated state, or high-intent primary CTA.

### Light Temperatures (Kelvin Spectrum)
- **2700K**: Warm architectural residential glow (`#FFAE42`, warm halogen feel).
- **3000K**: Balanced commercial & hospitality standard (`#FFD21A`, Ecolife signature balance).
- **4000K**: Neutral crisp gallery/office daylight (`#F4EEDD` / `#E8EEF5`).
- **6500K**: High-precision clinical/drafting daylight (`#C8DCFF`).

---

## 2. TYPOGRAPHIC ARCHITECTURE

The typographic hierarchy combines European architectural neo-grotesk with precision industrial drafting annotations.

### Primary Display & Interface Grotesk
- **Font Stack**: `'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif` with tightened tracking (`tracking-tight` to `tracking-tighter`), bold architectural weight (700/800/900), and uppercase editorial posture for major statements.
- **Secondary Technical Display**: `'Space Grotesk', sans-serif` for curated metric figures and section index marks (`01`, `02`, `03`).
- **Specifications & Annotations**: Monospace tabular stack (`'Space Grotesk'`, monospace, `tabular-nums`) for dimensions (`40 × 70 mm`), Kelvin (`3000K`), CRI (`Ra >95`), voltages (`48V DC`).

### Scale & Hierarchy
- **Monumental Architectural Statement (Hero)**: `clamp(2.75rem, 7vw, 6.5rem)` — tight leading (`0.95`), uppercase, structural presence.
- **Editorial Section Narrative**: `clamp(2rem, 4.5vw, 3.75rem)` — crisp line-height (`1.05`), text-wrap balance.
- **Sub-Chapter Headline**: `1.25rem` – `1.75rem` — semi-bold, uppercase or natural title-case.
- **Body Architectural Prose**: `0.9375rem` – `1.0625rem` — line-height `1.65`, warm muted gray `#9E9EA4`, never pure white, max measure `65ch`.
- **Drafting Micro-Metadata**: `0.6875rem` – `0.75rem` (`11px`–`12px`) — uppercase, letter-spacing `+0.15em` to `+0.25em`, monospace numeric values.

---

## 3. SPATIAL & GRID COMPOSITION

- **No Box-in-Box Traps**: Reject the pattern of placing rounded bordered cards inside rounded bordered containers.
- **Swiss Architectural Grid**: 12-column asymmetric layout with varying column spans (e.g. 5/7 split, 8/4 split, or edge-to-edge bleed).
- **Negative Space**: Controlled architectural void space allowing photography and fixtures to dictate visual weight.
- **Hairline Precision**: Separation handled by 1px hairline dividers (`border-white/10`) inspired by architectural blueprint drafting lines.
- **Edge-to-Edge Moments**: Hero, project vignettes, and photographic chapters span the full viewport or snap cleanly to grid axes.

---

## 4. RADIUS DISCIPLINE (Anti-Bubble Rules)

- **Default Geometry**: `0px` (sharp architectural edge) or `2px`–`4px` (subtle CNC aluminium edge bevel).
- **Cards & Visual Containers**: `0px` or `4px` max.
- **Banned**: Unearned `rounded-2xl`, `rounded-3xl`, and soft pill wrappers on static content.
- **Interactive Toggles / Filters**: Subtle `rounded-md` (4px–6px) for tactile precision switches only.

---

## 5. BUTTONS & INTERACTION AFFORDANCES

- **Primary Action (Illuminated State)**: Solid `#FFD21A` with deep black text `#000000`, 0px or 2px radius, uppercase 12px bold typography, `tracking-wider`. Subtle inner optical glow on hover.
- **Secondary Action (Architectural Frame)**: Deep charcoal background, 1px hairline border (`border-white/20`), text `#F4F4F2`, with subtle yellow emission indicator on hover.
- **Technical Ghost Link**: Clean inline typography with an arrow transition (`group-hover:translate-x-1.5`) and thin underline indicator.
