# Tech Stack & Project Architecture
## Project: "Being Kind" — NGO Website

**Companion docs:** `prd.md` (what to build), `design-strategy.md` (how it should look/feel)

---

## 1. Stack Summary

| Layer | Choice | Notes |
|---|---|---|
| Core library | React 19 | Function components + hooks only, no class components |
| Routing | React Router DOM v7 | Data-router / `createBrowserRouter` pattern |
| Build tool | Vite 8 | Fast dev server + HMR, ESM-native |
| Styling | Tailwind CSS v4 + PostCSS + Autoprefixer | Utility-first, tokens in `tailwind.config.js` |
| Icons | lucide-react | Only icon library used site-wide |
| Animation | Framer Motion | All transitions/reveals; shared motion config |
| Data viz | Recharts | Impact stats, campaign progress |
| Notifications | React Hot Toast | Form feedback, async states |
| Networking | Axios | Single configured instance, no raw `fetch` scattered around |
| Testing | Vitest + React Testing Library + Jest DOM | One test file per component minimum |
| Linting | ESLint | Must pass with zero errors before merge |

---

## 2. Guiding Engineering Principles

1. **One responsibility per file.** A component file does one thing: render one page, one section, or one reusable UI piece. If a file starts doing two things, split it.
2. **One page = one route = one folder.** Every nav item in the PRD gets its own page folder under `src/pages/`. Nothing about page A's markup or state lives inside page B's file.
3. **Shared UI lives in `components/`, page-specific UI lives inside that page's own folder.** Never reach across page folders to reuse a section — if two pages need the same UI, promote it to `components/`.
4. **No inline magic values.** Colors, spacing, font sizes → Tailwind tokens (`tailwind.config.js`). Copy/content → data files (`src/data/`), not hardcoded inside JSX.
5. **Predictable naming**: `PascalCase.jsx` for components, `camelCase.js` for utilities/hooks, `kebab-case` for asset filenames and route paths.
6. **New dev test**: someone unfamiliar with the repo should be able to open `src/pages/`, immediately see all 7+ pages as folders, open one, and understand it without reading any other file.

---

## 3. Folder Structure

```
being-kind/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                     # App entry, mounts <App /> + router
│   ├── App.jsx                      # Root layout shell (Navbar + <Outlet /> + Footer)
│   ├── router.jsx                   # createBrowserRouter config — single source of routes
│   │
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.jsx
│   │   │   ├── HomeHero.jsx
│   │   │   ├── HomeImpactStats.jsx
│   │   │   └── Home.test.jsx
│   │   ├── AboutUs/
│   │   │   ├── AboutUs.jsx
│   │   │   ├── AboutTimeline.jsx
│   │   │   └── AboutUs.test.jsx
│   │   ├── ContactUs/
│   │   │   ├── ContactUs.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   └── ContactUs.test.jsx
│   │   ├── GetInvolved/
│   │   │   ├── GetInvolved.jsx
│   │   │   ├── WaysToHelp.jsx
│   │   │   └── GetInvolved.test.jsx
│   │   ├── CommunityStories/
│   │   │   ├── CommunityStories.jsx        # list/index route
│   │   │   ├── CommunityStoryDetail.jsx    # :slug route
│   │   │   ├── StoryCard.jsx
│   │   │   └── CommunityStories.test.jsx
│   │   ├── CampaignsAdvocacy/
│   │   │   ├── CampaignsAdvocacy.jsx       # list/index route
│   │   │   ├── CampaignDetail.jsx          # :slug route
│   │   │   ├── CampaignProgressChart.jsx
│   │   │   └── CampaignsAdvocacy.test.jsx
│   │   ├── OurWork/
│   │   │   ├── OurWork.jsx
│   │   │   ├── ProgramAreas.jsx
│   │   │   ├── ImpactChart.jsx
│   │   │   └── OurWork.test.jsx
│   │   └── NotFound/
│   │       └── NotFound.jsx
│   │
│   ├── components/                  # Shared across 2+ pages only
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   └── Footer.jsx           # Reference-image footer, self-contained
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── SectionHeading.jsx
│   │   │   ├── Card.jsx
│   │   │   └── SocialIconLink.jsx
│   │   └── feedback/
│   │       ├── ToastProvider.jsx
│   │       └── LoadingState.jsx
│   │
│   ├── data/                        # Static content — swap-ready for future CMS/API
│   │   ├── nav.js                   # Single source of truth for nav + footer links
│   │   ├── stories.js
│   │   ├── campaigns.js
│   │   └── impactStats.js
│   │
│   ├── hooks/
│   │   ├── useScrollReveal.js
│   │   └── useMediaQuery.js
│   │
│   ├── lib/
│   │   ├── axiosClient.js           # Single configured Axios instance
│   │   └── motion.js                # Shared Framer Motion variants/easing config
│   │
│   ├── styles/
│   │   └── index.css                # Tailwind directives + font-face + CSS variables/tokens
│   │
│   └── assets/
│       ├── images/
│       └── illustrations/           # Footer "peeking" character illustrations
│
├── tests/
│   └── setupTests.js                # Vitest + Jest DOM setup
│
├── .eslintrc.cjs
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── package.json
└── index.html
```

---

## 4. Routing (`router.jsx`)

Single, explicit route table — no scattered route definitions:

```jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
import AboutUs from "./pages/AboutUs/AboutUs";
import ContactUs from "./pages/ContactUs/ContactUs";
import GetInvolved from "./pages/GetInvolved/GetInvolved";
import CommunityStories from "./pages/CommunityStories/CommunityStories";
import CommunityStoryDetail from "./pages/CommunityStories/CommunityStoryDetail";
import CampaignsAdvocacy from "./pages/CampaignsAdvocacy/CampaignsAdvocacy";
import CampaignDetail from "./pages/CampaignsAdvocacy/CampaignDetail";
import OurWork from "./pages/OurWork/OurWork";
import NotFound from "./pages/NotFound/NotFound";

export const router = createBrowserRouter([
  {
    element: <App />, // Navbar + <Outlet /> + Footer
    children: [
      { path: "/", element: <Home /> },
      { path: "/about-us", element: <AboutUs /> },
      { path: "/contact-us", element: <ContactUs /> },
      { path: "/get-involved", element: <GetInvolved /> },
      { path: "/community-stories", element: <CommunityStories /> },
      { path: "/community-stories/:slug", element: <CommunityStoryDetail /> },
      { path: "/campaigns-advocacy", element: <CampaignsAdvocacy /> },
      { path: "/campaigns-advocacy/:slug", element: <CampaignDetail /> },
      { path: "/our-work", element: <OurWork /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
```

`App.jsx` renders `<Navbar />`, then `<Outlet />`, then `<Footer />` — guaranteeing the footer and nav are identical across every route without duplication.

---

## 5. Single Source of Truth for Nav + Footer Links

`src/data/nav.js` exports the 7 primary nav items once; both `Navbar.jsx` and `Footer.jsx`'s Quick Links column import from it. This prevents the two from drifting out of sync when a route is renamed.

```js
export const PRIMARY_NAV = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about-us" },
  { label: "Contact Us", path: "/contact-us" },
  { label: "Get Involved", path: "/get-involved" },
  { label: "Community Stories", path: "/community-stories" },
  { label: "Campaigns & Advocacy", path: "/campaigns-advocacy" },
  { label: "Our Work", path: "/our-work" },
];
```

---

## 6. Content Data Layer

- `src/data/stories.js`, `campaigns.js`, `impactStats.js` hold placeholder content in an API-ready shape (array of objects with `id`/`slug`, not indexed by array position).
- Detail pages (`CommunityStoryDetail.jsx`, `CampaignDetail.jsx`) look up by `slug` from `useParams()` — swapping this data layer for a real API later only means changing these files' data source, not their JSX.

---

## 7. Networking

- One Axios instance in `src/lib/axiosClient.js` with base config (base URL from `import.meta.env`, timeout, interceptors for error toasts).
- All forms (`ContactForm.jsx`, newsletter signup) import this instance — never call `axios` directly in a component.

---

## 8. Motion Config

- `src/lib/motion.js` exports shared Framer Motion variants (`fadeUp`, `staggerContainer`) and easing constants, imported by any component doing scroll reveals — keeps motion consistent per `design-strategy.md` §5.

---

## 9. Styling Setup

- Tailwind v4 configured via `tailwind.config.js`; design tokens (colors, font sizes, radii) defined there, consumed via utility classes — no ad hoc inline styles except where truly dynamic (e.g., a computed progress-bar width).
- `src/styles/index.css` holds the Tailwind directives, the San Francisco font-stack declaration, and root CSS variables for colors referenced in `design-strategy.md` §8.

---

## 10. Testing

- Vitest + React Testing Library + Jest DOM, configured via `vite.config.js` (`test` block) and `tests/setupTests.js`.
- Minimum bar: every page component renders without crashing and shows its `<h1>`; `Navbar`, `Footer`, and `ContactForm` have interaction tests (nav link click, form validation/submit).
- Test files live next to the component they test (`Home.test.jsx` beside `Home.jsx`), not in a separate mirrored tree — keeps page folders self-contained per §2.

---

## 11. Linting & Scripts

`package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --max-warnings 0",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- ESLint must run clean (`npm run lint`) before any change is considered done.
- No `console.log` left in committed code (enforced via ESLint rule).

---

## 12. Environment Variables

- `.env` (not committed) holds `VITE_API_BASE_URL` and any future keys.
- `.env.example` committed with placeholder keys so any dev can bootstrap locally without guessing required variables.

---

## 13. Build/Deploy Notes

- `vite build` outputs static assets to `dist/` — deployable to any static host (Netlify, Vercel, S3+CDN, etc.).
- No server-side rendering in v1; all routes are client-rendered via React Router — ensure the hosting platform is configured to redirect all paths to `index.html` (SPA fallback) so deep links like `/community-stories/some-slug` don't 404 on refresh.
