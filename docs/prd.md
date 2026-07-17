# PRD — PetConnect (Working Title)
### "AstroTalk for Pet Care" — Real-Time Pet Owner ↔ Doctor Consultation Platform

> **Status:** Draft v1.0
> **Team size:** 4 developers
> **Reference model:** astrotalk.com (chat/consult marketplace UX, adapted for veterinary care)
> **Doc owner:** Priyanshu
> **Last updated:** July 2026

---

## Table of Contents
1. Overview & Vision
2. Problem Statement
3. Goals & Success Metrics
4. User Roles & Personas
5. Core User Flow
6. Feature Requirements — Authentication
7. Feature Requirements — Pet Owner Dashboard
8. Feature Requirements — Doctor Dashboard
9. Feature Requirements — Real-Time Chat
10. Non-Functional Requirements
11. Information Architecture (Folder Structure)
12. Team Split & Sprint Plan (4 devs)
13. Milestones & Timeline
14. Out of Scope / Future Phases
15. Open Questions

---
<!-- page -->
## 1. Overview & Vision

PetConnect is a two-sided marketplace that connects **Pet Owners** with **Verified Doctors (Veterinarians)** for real-time consultations — chat first, with call/video as a future phase. It borrows AstroTalk's proven consultation-marketplace UX pattern (browse experts → start chat → pay per session/wallet → rate the session) and applies it to pet healthcare.

**Vision statement:** Make trustworthy veterinary guidance available to any pet owner within minutes, from any device, without needing to leave home.

---

## 2. Problem Statement

- Pet owners often can't tell if a symptom is an emergency or something minor, and clinic visits are slow and expensive for quick questions.
- Verified vets have no lightweight platform to monetize short consultations the way astrologers/therapists already do on marketplace apps.
- Existing pet-care apps are either e-commerce-first (pet food/toys) or booking-only (no real-time chat layer).

---

## 3. Goals & Success Metrics

| Goal | Metric | Target (v1) |
|---|---|---|
| Get pet owners talking to doctors fast | Time from signup → first chat started | < 3 minutes |
| Doctor engagement | Avg. doctors online during peak hours | 70% of onboarded doctors |
| Reliability | Chat message delivery success | 99.5%+ |
| Retention | Pet owners returning within 30 days | 25%+ |
| Team velocity | Feature-complete MVP | 6–8 weeks (4 devs) |

---
<!-- page -->
## 4. User Roles & Personas

### 4.1 Pet Owner
- Wants quick, reliable answers about their pet's health/behavior.
- Owns 1+ pets, each with their own profile (species, breed, age, medical history).
- Needs: symptom description, photo upload, chat history, doctor ratings, appointment/session history.

### 4.2 Doctor (Veterinarian)
- Verified professional with credentials (license number, specialization, experience).
- Wants a queue of incoming consultation requests, ability to go online/offline, earnings tracking, patient (pet) history at a glance.

### 4.3 Admin (implied, minimal for MVP)
- Verifies doctor accounts, monitors reported chats, manages platform-wide settings. *(Can be a Phase 2 item — flagged in Section 14.)*

---

## 5. Core User Flow

```
                              Login / Signup
                                    │
                     ┌──────────────┴──────────────┐
                     │                              │
                Pet Owner                        Doctor
                     │                              │
                     ▼                              ▼
             Pet Owner Dashboard              Doctor Dashboard
        (Pet profiles, browse doctors,   (Availability toggle, incoming
         wallet, session history)         requests, patient/pet history)
                     │                              │
                     └────────────┬─────────────────┘
                                  ▼
                         Real-Time Chat Room
                    (Text + image, session timer,
                     end session → rating prompt)
```

**Key branching logic:** role is chosen/assigned at signup and determines which dashboard the user is routed to after login. This must be enforced both on the frontend (protected routes) and backend (JWT role claim) — never trust the frontend alone for role gating.

---
<!-- page -->
## 6. Feature Requirements — Authentication

### 6.1 Signup
- Single signup form with a **role selector**: "I'm a Pet Owner" / "I'm a Doctor".
- Pet Owner signup: name, email, phone, password.
- Doctor signup: name, email, phone, password, **license/registration number, specialization, years of experience, certificate upload** (goes into a `pending_verification` state — cannot go "online" until admin/manual approval in MVP).
- Email/phone verification (OTP) before dashboard access.

### 6.2 Login
- Email/phone + password login.
- "Forgot password" flow (email reset link).
- On success, redirect based on `role` claim: `/pet-owner/dashboard` or `/doctor/dashboard`.

### 6.3 Session & Route Protection
- JWT (access + refresh token) stored in httpOnly cookie (preferred) or memory + refresh — **not** localStorage, to reduce XSS token theft risk.
- `<ProtectedRoute role="petOwner">` / `<ProtectedRoute role="doctor">` wrapper components using React Router 7 loaders/guards.
- Doctors pending verification see a "Verification in progress" screen instead of the full dashboard.

### 6.4 Acceptance Criteria
- [ ] A pet owner cannot access `/doctor/*` routes and vice versa (redirect + toast).
- [ ] Expired token auto-refreshes silently or logs the user out gracefully.
- [ ] Passwords are never sent/stored in plaintext (bcrypt/argon2 on backend).

---
<!-- page -->
## 7. Feature Requirements — Pet Owner Dashboard

### 7.1 Pet Profiles
- Add/edit/delete multiple pets: name, species, breed, age, weight, photo, known conditions/allergies.
- Each pet has its own consultation history.

### 7.2 Browse Doctors
- List/grid of doctors with: photo, specialization, rating, years of experience, online/offline status, price per session (if monetized).
- Filters: specialization (general, dermatology, dietary, behavior, exotic pets), online-only, rating.
- Search bar.

### 7.3 Start Consultation
- Select a pet → select a doctor → "Start Chat" (queues if doctor is busy, or instant if free).
- Pre-chat form: short symptom description + optional photo upload.

### 7.4 Wallet / Session History (if monetized)
- Wallet balance, recharge flow (Razorpay/Stripe — see techstack.md).
- Past sessions list: doctor name, pet, date, duration, transcript link, rating given.

### 7.5 Notifications
- Toast (React Hot Toast) for: doctor accepted chat, doctor came online, session ending soon.

---
<!-- page -->
## 8. Feature Requirements — Doctor Dashboard

### 8.1 Availability Toggle
- Online/Offline/Busy switch, visible instantly to pet owners browsing.

### 8.2 Incoming Requests Queue
- Real-time list of consultation requests with pet name/species/symptom summary; Accept/Decline actions.

### 8.3 Active Chat Panel
- Same chat UI as pet owner side, plus a **side panel showing the pet's profile & past consultation history** with this doctor (and, with owner consent, other doctors).

### 8.4 Earnings & Analytics
- Sessions completed, average rating, earnings this week/month — visualized with **Recharts** (bar/line charts, matches existing stack).

### 8.5 Profile Management
- Edit specialization, bio, price per session, availability hours.

---
<!-- page -->
## 9. Feature Requirements — Real-Time Chat

### 9.1 Core Chat
- Real-time text messaging between one pet owner and one doctor per session.
- Image upload support (for symptom photos).
- Typing indicator, message delivered/read status (Phase 2 acceptable to defer read-receipts).
- Session timer visible to both sides (if session-based billing is used).

### 9.2 Session Lifecycle
`Requested → Accepted → Active → Ended → Rated`
- "End Session" button (either party) → triggers rating modal for the pet owner.
- Chat transcript saved and retrievable from session history.

### 9.3 Technical Approach
- WebSocket-based (Socket.IO recommended — see techstack.md) rather than polling, for true real-time delivery.
- Reconnect handling: if a user's connection drops mid-chat, messages queue and resend on reconnect.

### 9.4 Acceptance Criteria
- [ ] Message sent by A appears for B within ~1 second on a normal connection.
- [ ] Refreshing the page does not lose chat history (persisted server-side, rehydrated on load).
- [ ] A doctor cannot see chat rooms belonging to other doctors.

---
<!-- page -->
## 10. Non-Functional Requirements

- **Responsiveness:** Mobile-first (most pet owners will use this on phones), Tailwind breakpoints used consistently.
- **Performance:** Route-level code splitting (Vite + React.lazy) so the Doctor dashboard bundle isn't loaded for Pet Owners and vice versa.
- **Accessibility:** Form inputs labeled, sufficient color contrast, keyboard-navigable chat.
- **Security:** Role-based access control enforced server-side; rate-limit login/OTP endpoints; sanitize all chat/image inputs.
- **Scalability (light):** Chat should be built so a single Socket.IO server can later be scaled horizontally (Redis adapter) without a rewrite.

---

## 11. Information Architecture (Folder Structure)

> Full technical folder layout lives in **techstack.md** — this section defines the *page/route* structure only, so each screen maps to one predictable page/component and nothing gets tangled.

```
/                          → Public landing page
/login                     → Shared login (role auto-detected from account)
/signup                    → Role-selector signup
/verify-otp                → OTP verification

/pet-owner/dashboard        → Pet Owner home
/pet-owner/pets             → Manage pet profiles
/pet-owner/pets/:id         → Single pet profile + history
/pet-owner/doctors          → Browse/search doctors
/pet-owner/chat/:sessionId  → Active chat (owner view)
/pet-owner/wallet           → Wallet & recharge
/pet-owner/history          → Past sessions

/doctor/dashboard           → Doctor home (queue + toggle)
/doctor/chat/:sessionId     → Active chat (doctor view)
/doctor/profile             → Edit doctor profile
/doctor/earnings            → Earnings + Recharts analytics
/doctor/verification-pending→ Shown until admin approves
```

Each route above = **one page component**, one folder, one responsibility. Nothing shared between Pet Owner and Doctor route trees except the `Chat` UI primitives and `auth` logic — this is the rule that keeps the codebase from tangling as the team grows to 4 parallel contributors.

---
<!-- page -->
## 12. Team Split & Sprint Plan (4 Developers)

A clean way to split 4 people without stepping on each other's files:

| Dev | Owns | Touches |
|---|---|---|
| **Dev A — Auth & Infra** | Login, signup, OTP, route guards, JWT/session handling, project scaffolding | `src/features/auth/*`, `src/app/*` |
| **Dev B — Pet Owner Experience** | Pet profiles, doctor browsing, wallet, session history | `src/features/pet-owner/*` |
| **Dev C — Doctor Experience** | Doctor dashboard, queue, earnings, profile | `src/features/doctor/*` |
| **Dev D — Real-Time Chat** | Chat UI + Socket.IO integration, shared across both roles | `src/features/chat/*` |

This split matches the folder structure in `techstack.md` 1:1, so merge conflicts stay rare — each dev mostly lives inside their own feature folder.

### Suggested Sprint Breakdown (6–8 weeks)
1. **Week 1:** Project scaffold, design tokens, routing skeleton, auth API contracts agreed as a team.
2. **Weeks 2–3:** Auth complete end-to-end; Pet Owner & Doctor dashboards built with mock/static data.
3. **Weeks 4–5:** Real-time chat wired in; dashboards connected to real backend data.
4. **Week 6:** Wallet/rating/notifications polish.
5. **Weeks 7–8:** Bug bash, responsive QA, performance pass, deploy.

---

## 13. Milestones & Timeline

| Milestone | Target |
|---|---|
| Clickable prototype (static data) | End of Week 2 |
| Auth + role routing functional | End of Week 3 |
| Real-time chat working (text only) | End of Week 5 |
| MVP feature-complete | End of Week 6 |
| QA + deploy | End of Week 8 |

---
<!-- page -->
## 14. Out of Scope / Future Phases

- Voice/video calls between owner and doctor (Phase 2 — Agora/Twilio).
- Admin panel for doctor verification (MVP can do this manually via a database flag).
- In-app payments beyond a simple wallet recharge (subscriptions, coupons — Phase 2).
- Push notifications (web push / mobile app) — Phase 2.
- AI-assisted symptom triage before connecting to a doctor — Phase 3, interesting but not core to MVP.

---

## 15. Open Questions

- Is this a **paid marketplace** (session-based billing like AstroTalk) or **free/subscription** model? This changes the wallet + session-timer requirements significantly — confirm before Week 3.
- Do doctors need admin approval before their first session, or is self-declared credential upload enough for MVP/demo purposes?
- Single active chat per doctor, or can a doctor handle multiple chats concurrently (like a support inbox)?

---
*End of document.*
