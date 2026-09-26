# ECOLIFE ARCHITECTURAL MOTION SYSTEM

> "Motion is the transition between darkness and light, raw aluminium and illuminated space."

---

## 1. TIMING & EASING CURVES

- **Aperture Reveal (Standard)**: `cubic-bezier(0.16, 1, 0.3, 1)` — Architectural deceleration curve; starts with high velocity and settles smoothly into place.
- **Light Beam Expansion**: `cubic-bezier(0.25, 1, 0.5, 1)` — Linear profile illumination mimicking the gradual warm ramp of an electronic LED driver.
- **Durations**:
  - Micro-interactions (hover, toggle, active button): `180ms` – `220ms`
  - Panel & Drawer Transitions: `320ms` – `400ms`
  - Hero & Chapter Unfolds: `700ms` – `1100ms`
  - Interactive CCT/Photometric shift: `300ms` smooth lerp

---

## 2. REVEAL & STAGING BEHAVIORS

- **Light Ignition Pattern**: Rather than every element fading up randomly from `y: 40`, hero and section anchors utilize an ignition sequence:
  1. Fine drafting line / profile outline renders.
  2. The LED beam illuminates along the profile axis.
  3. Ambient illumination spreads to reveal the structural typography.
- **Photographic Crop Masks**: Images expand within architectural aspect ratio frames rather than simple scale zoom.
- **Controlled Parallax**: Soft depth difference between architectural background photography and foreground specification overlays (max 8–15px displacement).

---

## 3. INTERACTIVE 3D & EXPLODED PROFILE VISUALIZATION

- **Digital Twin Experience**:
  - Interactive profile assembly: Housing (anodized aluminium), LED PCB strip (SMD 2835 diodes), Diffuser (micro-prismatic or opal PMMA), End Caps, and Mounting clips.
  - Interactive CCT slider: Changes light temperature in real time (2700K $\to$ 6500K) affecting the local ambient illumination and surface reflectance.
  - 3D/CSS layered depth with tactile pointer orientation.

---

## 4. REDUCED MOTION SAFEGUARDS

When `prefers-reduced-motion: reduce` is enabled:
- All transforms (`translate`, `rotate`, `scale`) are disabled.
- Transitions default to pure `opacity` changes ($\le 150\text{ms}$).
- Continuous ambient animations are terminated.
