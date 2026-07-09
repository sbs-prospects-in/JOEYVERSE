# Product Requirements Document (PRD)
## Project: "Being Kind" — NGO Website

**Version:** 1.0
**Owner:** Being Kind Digital Team
**Build environment:** Antigravity (AI coding agent)
**Status:** Draft for build

---

## 1. Purpose & Vision

Being Kind is an NGO website whose job is to (a) explain the organization's mission and work, (b) build trust with donors, volunteers, and partners, and (c) convert visitors into action — donating, volunteering, sharing a story, or joining a campaign.

The visual language is inherited from **fromfauna.org** (award-winning nonprofit storytelling site — editorial, cinematic, confident typography, generous whitespace, scroll-driven narrative), re-skinned for Being Kind's own brand colors, copy, and imagery. The footer is a hard exception: it must replicate the structure and content pattern shown in the supplied reference screenshot (illustration strip + 3-column footer + legal bar), not the fromfauna.org footer.

This document defines **what** gets built. See `design-strategy.md` for **how it should look/feel** and `techstack.md` for **how it is engineered**.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Communicate mission clearly within one scroll | Bounce rate on Home < industry avg (~45%) |
| Convert visitors into supporters | CTA click-through rate on "Get Involved" / "Donate" |
| Build credibility | Time on "Our Work" and "Community Stories" pages |
| Be usable everywhere | Lighthouse Performance/Accessibility ≥ 90 on mobile |
| Be maintainable by any dev who opens the repo | New page addable in < 30 min without touching unrelated files |

---

## 3. Target Audience

1. **Prospective donors** — need trust signals, impact proof, transparent "Our Work."
2. **Volunteers / supporters** — need a clear, low-friction "Get Involved" path.
3. **Beneficiaries / community members** — need to find help and see themselves represented in "Community Stories."
4. **Press / partners / policymakers** — need "Campaigns & Advocacy" for positioning and current initiatives.

---

## 4. Information Architecture / Sitemap

Primary navigation (fixed order, per brief):

1. **Home** (`/`)
2. **About Us** (`/about-us`)
3. **Contact Us** (`/contact-us`)
4. **Get Involved** (`/get-involved`)
5. **Community Stories** (`/community-stories`)
6. **Campaigns & Advocacy** (`/campaigns-advocacy`)
7. **Our Work** (`/our-work`)

Supporting (non-nav) routes:
- `/community-stories/:slug` — individual story detail
- `/campaigns-advocacy/:slug` — individual campaign detail
- `/privacy-policy`, `/terms-and-conditions` — linked from footer only
- `/404` — not-found page

**Rule: one route = one page-level component = one file.** No page shares a component file with another page (see `techstack.md` §4).

---

## 5. Global Elements

### 5.1 Navigation Bar
- Sticky/fixed on scroll, transparent-over-hero → solid-on-scroll transition (matches fromfauna.org scroll behavior).
- Left: Being Kind logo/wordmark (links to `/`).
- Center/right: the 7 nav items listed above, in that exact order.
- Right-most: a primary CTA button ("Donate" or "Get Involved" — pick one, do not add a second competing CTA).
- Mobile: collapses into a full-screen or slide-in menu; all 7 items + CTA must remain reachable in 1 tap.
- Active route must be visually indicated (underline or weight change, not color-only, for accessibility).

### 5.2 Footer (reference-image exact structure — see attached screenshot)
Must reproduce, re-skinned to Being Kind branding:
1. **Illustration strip** — a row of character/animal illustrations "peeking" over the footer's top edge (swap the reference dogs for Being Kind's own brand imagery/illustration, but keep the peeking-over-the-edge composition and layout proportions).
2. **Column 1 — Brand block**: logo, org name, 3–4 line mission statement.
3. **Column 2 — Quick Links**: Home, About Us, Get Involved, Our Work, Campaigns & Advocacy (mirrors primary nav, does not need to be identical count).
4. **Column 3 — Find Us**: physical address, phone number(s), email, heading "Social Media" with icon row (Facebook, Twitter/X, Instagram, YouTube at minimum).
5. **Bottom bar**: "© [Year] Being Kind." + "Terms & Conditions" and "Privacy Policy" links.
- Background: light neutral gray, subtle repeating brand-motif watermark pattern behind the columns (as in reference).
- Fully responsive: 3 columns → stacked single column on mobile, illustration strip scales/crops gracefully.

---

## 6. Page-Level Requirements

### 6.1 Home (`/`)
- Full-viewport hero (image or looping video) with headline + subhead + primary CTA.
- Mission/impact summary section.
- 2–3 "pillar" sections summarizing Our Work / Get Involved / Campaigns (link out to full pages — do not duplicate full content here).
- Impact stats block (numbers: people helped, campaigns run, volunteers, etc.) — use Recharts if any stat is visualized as a chart, otherwise animated counters via Framer Motion.
- Featured Community Story (single card, links to `/community-stories`).
- Newsletter / stay-in-touch signup with toast confirmation (React Hot Toast).
- Footer (global).

### 6.2 About Us (`/about-us`)
- Origin story / mission / vision / values.
- Leadership / team grid.
- Timeline of milestones (optional Framer Motion scroll-reveal).
- Trust/credibility section (registration number, transparency, annual report link if applicable).

### 6.3 Contact Us (`/contact-us`)
- Contact form (name, email, subject, message) — client-side validation, Axios POST to a contact endpoint, success/error via React Hot Toast.
- Org address, phone, email (kept in sync with footer content — single source of truth, see `techstack.md` §5).
- Embedded map or static map image.
- Office hours if relevant.

### 6.4 Get Involved (`/get-involved`)
- Ways to help: Donate, Volunteer, Fundraise, Corporate Partnerships — presented as distinct, non-generic sections (avoid a flat 3-equal-card grid; use asymmetric or zig-zag layout per design strategy).
- Volunteer sign-up form or link to external form.
- Donation CTA (can route to an external payment processor — do not build in-house payment processing for v1).

### 6.5 Community Stories (`/community-stories`)
- Filterable/browsable grid or list of stories (by category/tag).
- Each story card → detail page (`/community-stories/:slug`) with full narrative, photos, and a related-stories section.
- Data can be static/local JSON for v1 (see `techstack.md` §6) with an API-ready shape for future CMS integration.

### 6.6 Campaigns & Advocacy (`/campaigns-advocacy`)
- Active campaigns list with status (Active / Upcoming / Completed).
- Each campaign → detail page (`/campaigns-advocacy/:slug`) with goals, progress (Recharts progress/bar chart if a numeric goal exists, e.g. funds raised or signatures collected), and a call to action (sign petition / donate / share).

### 6.7 Our Work (`/our-work`)
- Program areas / focus areas breakdown.
- Data-backed impact section (Recharts: bar/line/pie as appropriate — e.g. beneficiaries by program, funds allocation by category).
- Partner/sponsor logos strip (logo-only, no category labels beneath, per design strategy taste rules).

---

## 7. Functional Requirements

- **FR-1**: All 7 nav routes must exist, render distinct content, and be reachable from both desktop and mobile nav.
- **FR-2**: Footer must appear identically (content wiring aside) on every route, including 404.
- **FR-3**: All forms (Contact, Newsletter, Volunteer) validate required fields client-side before Axios submission and show a toast on success/failure.
- **FR-4**: All data-visualized numbers (impact stats, campaign progress) render via Recharts, not static images.
- **FR-5**: Site must be keyboard-navigable end to end; nav, forms, and cards all reachable via Tab with visible focus states.
- **FR-6**: No broken internal links; 404 page must exist and be styled consistently with the rest of the site.
- **FR-7**: Every icon in the UI comes from `lucide-react` — no mixed icon libraries.

---

## 8. Non-Functional Requirements

- **Performance**: Lighthouse ≥ 90 (Performance, Accessibility, Best Practices) on mobile emulation.
- **Responsiveness**: Fully functional from 360px to 1920px+ widths.
- **Accessibility**: WCAG 2.1 AA — color contrast, alt text on all images, semantic HTML, ARIA where native semantics fall short.
- **SEO basics**: unique `<title>`/meta description per route (React Router + `<title>` management), semantic heading hierarchy (one `<h1>` per page).
- **Code quality**: ESLint passes with zero errors before merge; component files stay single-responsibility (see `techstack.md`).
- **Testability**: Every page-level component and shared component (Navbar, Footer, forms) has at least one Vitest + React Testing Library test.

---

## 9. Out of Scope (v1)

- In-house payment/donation processing (link out to a processor instead).
- CMS/back-office for non-technical content editing (content is local JSON/MD for v1; structure it so a CMS can be swapped in later).
- User authentication / donor accounts.
- Multi-language / i18n (structure copy so it's not hard-blocked later, but do not build the switcher now).

---

## 10. Assumptions & Open Questions

- Brand illustration assets to replace the reference image's dogs are not yet supplied — placeholder illustrations should be used and clearly marked as swappable.
- Exact organization name for footer/legal ("Being Kind" vs. full legal entity name) to be confirmed before copy is finalized.
- Payment processor / donation link destination TBD.
- Content for Community Stories and Campaigns is placeholder/sample until real content is supplied — must be trivially replaceable (single JSON/data file per collection, see `techstack.md` §6).
