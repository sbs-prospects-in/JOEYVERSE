# Design Strategy
## Project: "Being Kind" — NGO Website

**Companion docs:** `prd.md` (what to build), `techstack.md` (how it's engineered)

---

## 1. Reference Sources & How to Use Them

| Source | Role | Applies to |
|---|---|---|
| `fromfauna.org/?p=m1` | **UI/visual system of reference** | Every page EXCEPT the footer |
| Attached footer screenshot | **Exact structural reference** | Footer only, on every page |
| `tasteskill.dev` (Taste Skill) | Anti-generic-AI-slop ruleset | All layout/visual decisions |
| `github.com/pbakaus/impeccable` | Code/UI quality bar (craft, polish, no sloppy edges) | All components |
| `github.com/kylezantos/design-motion-principles` | Motion/animation philosophy | All Framer Motion usage |

> **Note on fromfauna.org access:** this reference is a live, editorially-designed nonprofit storytelling site (cinematic hero imagery, scroll-driven narrative sections, confident oversized typography, generous whitespace, restrained color, subtle scroll-triggered reveals). Because the exact page is behind bot protection, Antigravity should open `https://fromfauna.org/?p=m1` directly in its own browser tool at build time and extract concrete values (exact spacing scale, hero proportions, section rhythm, color hexes, easing curves) rather than guessing — the principles below are the ones to match; the pixel values should come from live inspection of the reference page itself.

---

## 2. Visual Direction (fromfauna.org-inspired)

- **Tone**: editorial, confident, calm — not a typical "startup SaaS" or "AI slop" template. Feels like a beautifully art-directed long-form article, not a marketing funnel.
- **Typography-led**: large, bold display headings carry each section; body copy stays small and restrained by contrast. Type does the heavy lifting — not boxes/cards/gradients.
- **Whitespace as a design tool**: sections breathe; do not compress content into tight grids "to fit more above the fold."
- **Cinematic imagery**: full-bleed photography/video for hero and section breaks, treated with a consistent color grade so donated/stock photography feels unified.
- **Scroll as narrative**: each page tells a story top-to-bottom — hero → context → proof → call to action — using scroll-triggered reveals (fade/slide-up via Framer Motion), not scroll-jacking or gimmicks.
- **Restrained color**: one primary brand color + one accent + neutrals. Do not introduce a second competing accent color per page.
- **Section rhythm**: alternate full-bleed image sections with generous-margin text sections to create visual pacing, mirroring fromfauna.org's chapter-like feel.

---

## 3. Footer Design (reference-image exact — the one deliberate exception)

Reproduce this structure precisely, re-skinned to Being Kind branding:

1. **Top illustration strip**: a horizontal row of character illustrations whose heads/paws appear to "peek" over the footer's top edge, breaking the boundary between the page above and the footer below. Use Being Kind's own illustrated brand character(s) in place of the reference's dogs — same peeking-over-the-ledge composition and rhythm (evenly spaced, alternating slight height variation).
2. **Background**: light neutral gray (`~#F4F5F6`–`#F7F7F8` range) with a very low-opacity repeating brand-motif watermark pattern (icons related to the org's cause) tiled behind the columns — subtle, not distracting.
3. **Three-column layout** (stacks to one column ≤768px):
   - **Col 1 – Brand**: logo mark + wordmark, short mission line (3–4 lines max).
   - **Col 2 – Quick Links**: heading "Quick Links," vertical list of key routes.
   - **Col 3 – Find Us**: heading "Find Us," address block, phone (with phone icon), email (with mail icon), then a "Social Media" sub-heading with circular colored icon buttons (Facebook / Twitter-X / Instagram / YouTube).
4. **Bottom legal bar**: centered, small text — "[Org Name] © [Year]." plus "Terms & Condition" and "Privacy Policy" as inline links, separated by " and ".
5. **Spacing**: generous vertical padding above the illustration strip so it doesn't feel cramped against the section above it; columns aligned to the same top baseline.

This footer's visual language (rounded social icons, gray watermark background, illustration strip) is intentionally distinct from the rest of the fromfauna.org-inspired page — treat it as a self-contained, fully-styled component (`Footer.jsx`) that does not inherit page-specific section styling.

---

## 4. Anti-Slop Rules (from Taste Skill)

Apply these as hard constraints across the whole build, not suggestions:

- **No locale/weather/status strips** ("Lisbon 14:23 · 18°C" style widgets) — irrelevant to an NGO site.
- **No scroll cue affordances** ("Scroll to explore," bouncing down-arrows) — the hero content itself should invite scrolling.
- **No decorative status dots** unless conveying a real state (e.g., "Active" campaign badge), and at most one per section.
- **No `border-t` + `border-b` boxed rows on long lists** (e.g., Community Stories list, Campaign list) — use cards, tabs, or a scroll-snap layout instead.
- **No fake dashboard/terminal UI built from styled divs** — if a stat needs a chart, use Recharts with real data, not a mocked-up widget.
- **No default three-equal-card feature rows** — "Ways to Help," "Program Areas," etc. should use 2-column zig-zag or asymmetric grids instead of three identical boxes.
- **No AI-purple / mesh-blob gradients** — stick to the brand palette derived from the fromfauna.org-style neutral/editorial system.
- **Logo walls (partners/sponsors) are logo-only** — no category caption underneath each logo.
- **Pick one theme (light) and lock it** — no per-section light/dark flips unless it is a single, deliberate, well-executed "chapter break" moment (use sparingly, at most once site-wide, e.g. a dark full-bleed impact-stats section on Our Work).

---

## 5. Motion Principles (from design-motion-principles)

- **Motion must be purposeful**, not decorative: every animation should clarify hierarchy, guide attention, or provide feedback (e.g., form submit → toast slide-in; card hover → subtle lift).
- **Consistent easing**: define one or two easing curves (e.g., `ease-out` for entrances, `ease-in-out` for hover/transition) in a shared motion config and reuse everywhere — do not hand-tune easing per component.
- **Respect reduced motion**: honor `prefers-reduced-motion`; large scroll-reveals and parallax must degrade to simple fades or be disabled.
- **Restraint over spectacle**: scroll-triggered fade/slide-up reveals for section entrances are enough; avoid stacking multiple simultaneous motion effects on one element.
- **Micro-interactions matter**: nav link underline transitions, button hover/press states, and form field focus states should all be animated subtly and consistently (Framer Motion `whileHover` / `whileTap`).
- **Performance-aware**: animate `transform`/`opacity` only; avoid animating layout-triggering properties (`width`, `top`, `margin`).

---

## 6. Craft / Quality Bar (from impeccable)

- No "almost aligned" edges — spacing, grid alignment, and optical centering (not just mathematical centering) should be checked, especially for icons next to text.
- Every interactive element has a visible hover, focus, and active state — none left as browser defaults.
- Image aspect ratios are fixed/reserved (no layout shift on load).
- Empty/loading/error states are designed for every data-driven section (Community Stories, Campaigns, Contact form), not left blank or as a raw error string.
- Consistent corner-radius, shadow, and border scale used site-wide — defined once as design tokens, not improvised per component.

---

## 7. Typography

- **Font family**: San Francisco system font stack, applied globally:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "SF Pro Text",
    "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  ```
- Use a modular type scale (e.g., 1.25 ratio) with 2–3 display sizes for hero/section headings, one body size, one small/caption size. Define once in Tailwind config as custom font-size tokens — do not hardcode sizes in components.
- Heading weight: bold/semibold for display type to match fromfauna.org's confident editorial headlines; body copy stays regular weight for readability.

---

## 8. Color & Tokens

Define as CSS variables / Tailwind theme tokens (single source of truth, consumed everywhere — no inline hex values in components):

- `--color-primary` — Being Kind brand color (to be finalized with brand assets; placeholder warm, human, "kind" tone — e.g., a warm coral or leaf-green, not corporate blue).
- `--color-primary-dark` — used sparingly for the one dark "chapter break" section.
- `--color-neutral-900…50` — grayscale ramp for text/backgrounds.
- `--color-footer-bg` — the light gray footer background (~`#F4F5F6`).
- `--color-accent` — single accent for CTAs/links only.

---

## 9. Responsive Strategy

- Breakpoints (Tailwind defaults, used consistently): `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.
- Nav collapses to mobile menu below `lg`.
- Footer: 3 columns → 1 column below `md`; illustration strip scales down and may reduce the number of visible characters on very small screens rather than shrinking them illegibly.
- Zig-zag/asymmetric content sections stack vertically below `md`, image-then-text order preserved for scannability.

---

## 10. Accessibility

- Color contrast checked against WCAG AA for all text/background pairs, including over imagery (use scrim/gradient overlays behind hero text).
- All icons paired with accessible labels (`aria-label` or visually-hidden text) — icons are never the sole content of an interactive element.
- Focus states visible and consistent (do not rely on browser default outline removal without a styled replacement).
- Motion-heavy sections have a reduced-motion fallback per §5.
