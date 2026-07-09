# Tech Stack — PetConnect

> Companion to `prd.md`. This file is the single source of truth for what the project is built with, what's missing, and how the codebase should be organized so 4 developers can work in parallel without conflicts.

---

## Table of Contents
1. Current Stack (already decided)
2. What's Missing for This Feature Set
3. Recommended Additions
4. Recommended Folder Structure
5. Naming & Code Style Conventions
6. Environment Setup
7. Package Reference Table

---
<!-- page -->
## 1. Current Stack (already decided)

| Layer | Tool | Version | Purpose |
|---|---|---|---|
| UI framework | React | 19.0.0 | Core UI |
| Rendering | React-DOM | 19.0.0 | DOM rendering |
| Routing | React Router DOM | 7.1.5 | Client-side navigation, route guards |
| Build tool | Vite | 8.1.1 | Dev server, bundling |
| Styling | Tailwind CSS | 4.0.0 | Utility-first CSS |
| Smooth scroll | Lenis | 1.3.25 | Landing page scroll feel |
| Animation | GSAP | 3.15.0 | Complex/timeline animation |
| Animation | Framer Motion | 12.0.6 | Component-level transitions |
| Charts | Recharts | 2.15.1 | Doctor earnings/analytics visualizations |
| HTTP client | Axios | 1.7.9 | API calls |
| Notifications | React Hot Toast | 2.5.1 | Toasts (login errors, chat events) |
| Icons | Lucide React | 0.475.0 | SVG icon set |
| Testing | Vitest | 3.0.5 | Unit tests |
| Linting | ESLint | 9.19.0 | Code quality |

This stack is solid for the **landing page + dashboards UI layer**. It has no opinion yet on: state management, real-time communication, backend/API, auth storage, or a database — those are addressed below.

---
<!-- page -->
## 2. What's Missing for This Feature Set

Login/signup + two dashboards + real-time chat needs a few pieces the current stack doesn't cover:

| Need | Why the current stack doesn't cover it |
|---|---|
| Global auth/session state | React alone has no built-in cross-page state store |
| Real-time messaging | Axios is request/response only — chat needs a persistent connection |
| Backend/API | Nothing in the list is a server framework |
| Database | Needs to persist users, pets, doctors, chat history |
| File/image upload | Symptom photos, doctor certificates need storage somewhere |
| Payments (if monetized) | Wallet recharge needs a payment gateway |

---

## 3. Recommended Additions

### 3.1 State Management
- **Zustand** — lightweight, minimal boilerplate, pairs well with React 19. Use for: auth/session state, active chat state, doctor "online" status cache.
- *(Redux Toolkit is a fine alternative if the team already knows it — Zustand is recommended purely to keep 4 people from writing inconsistent reducers under time pressure.)*

### 3.2 Real-Time Chat
- **Socket.IO** (client: `socket.io-client`, server: `socket.io`) — handles the WebSocket connection, auto-reconnect, and room-based chat (one room per `sessionId`) that Section 9 of the PRD requires.
- Alternative if you want a managed/no-backend option: **Firebase Realtime Database** or **Firestore** with `onSnapshot` listeners — trades control for zero backend-ops work. Good option if the team wants to move fast and skip building/hosting a Socket.IO server.

### 3.3 Backend / API
- **Node.js + Express** (or **Fastify**) — pairs naturally with Socket.IO in the same process.
- If the team wants to skip building a custom backend entirely for the prototype phase: **Firebase** (Auth + Firestore + Storage) or **Supabase** (Postgres + Auth + Realtime + Storage) can cover auth, database, file storage, and real-time updates in one service — worth strongly considering for a 4-person team on a 6–8 week timeline.

### 3.4 Database
- If custom backend: **MongoDB** (flexible schema, fast to prototype pet/doctor profiles) or **PostgreSQL** (better fit if you'll need relational integrity between owners/pets/doctors/sessions later).
- If using Supabase: Postgres comes included.

### 3.5 Auth
- **JWT** (access + refresh token pattern) issued by your backend, stored in an httpOnly cookie.
- Or, if using Firebase/Supabase: use their built-in Auth (email/password + OTP support out of the box), which removes a large chunk of custom auth work.

### 3.6 File Uploads
- **Cloudinary** or **Firebase Storage** / **Supabase Storage** for pet photos and doctor certificate uploads. Don't store binary files in your primary database.

### 3.7 Payments (only if session billing / wallet is in scope — see PRD Open Questions)
- **Razorpay** — most common choice for an India-based user base (ties in with the Ahmedabad/SBS Financials context) for UPI/card wallet recharge.

### 3.8 Forms & Validation
- **React Hook Form** + **Zod** — clean, typed validation for signup/login/pet-profile forms; avoids messy manual `useState` form handling across 4 different contributors' code.

### 3.9 Testing (extends existing Vitest setup)
- **React Testing Library** alongside Vitest for component-level tests (forms, protected routes, chat message rendering).

---
<!-- page -->
## 4. Recommended Folder Structure

Feature-based structure — each of the 4 developers owns one top-level feature folder (matches PRD Section 12), which keeps merge conflicts low and makes the codebase predictable to navigate.

```
src/
├── app/
│   ├── App.jsx                 # Root component, top-level router
│   ├── routes.jsx              # Central route definitions (all pages listed here)
│   └── ProtectedRoute.jsx      # Role-based route guard
│
├── features/
│   ├── auth/                   # Owned by Dev A
│   │   ├── components/         # LoginForm, SignupForm, OtpInput
│   │   ├── pages/               # LoginPage.jsx, SignupPage.jsx, VerifyOtpPage.jsx
│   │   ├── hooks/               # useAuth.js
│   │   ├── api/                 # authApi.js (axios calls)
│   │   └── store/               # authStore.js (zustand)
│   │
│   ├── pet-owner/              # Owned by Dev B
│   │   ├── components/         # PetCard, DoctorCard, WalletWidget
│   │   ├── pages/               # DashboardPage.jsx, PetsPage.jsx, DoctorsPage.jsx, WalletPage.jsx
│   │   ├── hooks/
│   │   └── api/
│   │
│   ├── doctor/                  # Owned by Dev C
│   │   ├── components/         # RequestQueueItem, EarningsChart
│   │   ├── pages/               # DashboardPage.jsx, EarningsPage.jsx, ProfilePage.jsx
│   │   ├── hooks/
│   │   └── api/
│   │
│   └── chat/                    # Owned by Dev D — shared by both roles
│       ├── components/         # ChatWindow, MessageBubble, TypingIndicator
│       ├── pages/               # ChatPage.jsx
│       ├── hooks/               # useSocket.js, useChatSession.js
│       └── api/                 # chatApi.js
│
├── shared/
│   ├── components/              # Button, Modal, Input, Avatar — used by everyone
│   ├── layouts/                 # PetOwnerLayout.jsx, DoctorLayout.jsx, AuthLayout.jsx
│   ├── lib/                     # axiosInstance.js, socketClient.js
│   ├── utils/                   # formatDate.js, validators.js
│   └── constants/               # roles.js, routes.js
│
├── assets/                      # Images, icons not covered by lucide-react
├── styles/                      # Tailwind config extensions, global.css
└── main.jsx
```

### Why this structure keeps things "not messing with working things"
- Nobody edits another dev's `features/*` folder — cross-feature needs go through `shared/`.
- One page = one file in `pages/`. Rule of thumb: if a component is only used on one page, it lives next to that page, not in `shared/`.
- `shared/components/` is **append-only** during active development — if you need to change an existing shared component's behavior, flag it in standup first since 4 people depend on it.

---
<!-- page -->
## 5. Naming & Code Style Conventions

- **Components:** PascalCase file + export name (`ChatWindow.jsx`).
- **Hooks:** camelCase, prefixed `use` (`useChatSession.js`).
- **API files:** camelCase, suffixed `Api` (`authApi.js`).
- **One component per file.** No default-export-plus-five-helper-components-in-one-file.
- **Props destructured in the function signature**, not accessed via `props.x` inline.
- **No inline magic strings for roles/routes** — always import from `shared/constants/roles.js` and `shared/constants/routes.js`.
- **ESLint + Prettier enforced on commit** (recommend adding a simple Husky pre-commit hook running `eslint --fix`).

---

## 6. Environment Setup

```bash
# Install dependencies
npm install

# Local dev
npm run dev

# Run tests
npm run test

# Lint
npm run lint
```

Recommended `.env` variables (adjust to your chosen backend):
```
VITE_API_BASE_URL=
VITE_SOCKET_URL=
VITE_FIREBASE_API_KEY=        # only if using Firebase
VITE_RAZORPAY_KEY=            # only if wallet/payments in scope
```

---
<!-- page -->
## 7. Package Reference Table (What to `npm install` beyond the existing stack)

| Package | Purpose |
|---|---|
| `zustand` | Auth & chat state management |
| `socket.io-client` | Real-time chat (frontend) |
| `socket.io` (backend repo) | Real-time chat (server) |
| `react-hook-form` | Form handling |
| `zod` + `@hookform/resolvers` | Schema validation for forms |
| `@testing-library/react` | Component testing alongside Vitest |
| `date-fns` | Formatting session/chat timestamps |

If going the Firebase/Supabase route instead of custom backend, add `firebase` or `@supabase/supabase-js` instead of building your own auth/db/socket layer.

---
*End of document.*
