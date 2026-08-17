# PrizeQuest

PrizeQuest is a browser-based sweepstakes and gamification web application. Users browse prize draws (daily, weekly, and monthly raffles), earn entries through simulated surveys and mini-games, and participate in a visual winner-selection experience via a 3D claw machine. An admin dashboard configures prizes, caps, timers, and drawing behavior.

<!-- TODO: Add live demo link -->
<!-- Demo: https://your-demo-url.example -->

<!-- TODO: Add screenshots -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->

---

## Overview

**Problem / product idea:** Traditional sweepstakes often feel opaque and passive. PrizeQuest explores a more engaging model: users earn raffle entries through lightweight interactions (surveys, games, ticket purchases), see transparent progress toward prize caps, and experience winner selection as an interactive event.

**Current scope:** PrizeQuest is a **frontend prototype / portfolio project**. Core user flows work in the browser, but raffle state, entries, and admin settings are stored in **localStorage** (per browser), not in a shared backend. Firebase provides authentication and user profile storage only.

---

## Current Features

### User-facing (implemented)

| Area | What works |
|------|------------|
| **Authentication** | Email/password registration and login via Firebase Auth; email verification gate; password reset flow; optional guest browsing mode |
| **Dashboard** | Tabbed UI (Home, Daily, Weekly, Monthly, Quests); raffle cards with entry counts, progress bars, and optional countdown timers |
| **Entry earning** | Simulated “Take Survey” (up to 5 per prize, +1 entry each); simulated “Buy Ticket” (+1 entry, no payment processor); Snake and Scratcher mini-games award entries |
| **Profile** | Create/edit profile in Firestore (`users/{uid}`): name, demographics, location, consent flags |
| **Winner draw** | When a prize cap is reached, admin can start a drawing; users see overlay states and can view the 3D claw machine experience |
| **Guest mode** | Browse the dashboard without an account; interactive actions prompt registration |

### Admin (implemented)

| Area | What works |
|------|------------|
| **Admin access** | Separate admin login page; session-based access to `admin.html` |
| **Prize configuration** | Edit daily/weekly/monthly prize name, value, entry cap, optional end timer, and prize image (uploaded as Base64) |
| **Stats** | View aggregate entry and survey counts from localStorage |
| **Raffle cycle reset** | Clear entries, drawing state, and winner data while keeping prize configs |
| **Admin Mode toggle** | Controls claw machine behavior: manual admin play vs. automated random winner display |

### Incomplete or placeholder (not fully implemented)

| Area | Status |
|------|--------|
| **Quests tab** | UI shows “Quests Coming Soon”; quest logic is commented out in `script.js` |
| **Xbox / PS5 prizes** | Cards marked “Coming Soon”; buttons disabled |
| **Real surveys** | “Take Survey” increments a counter locally; no Typeform, Google Forms, or third-party survey embed |
| **Watch ads** | `adCount` exists in the data model; no “Watch Ad” buttons in the current dashboard UI |
| **Real payments** | “Buy Ticket ($1.99)” is a label only; no Stripe, PayPal, or checkout integration |
| **Survey gate before Scratcher** | TODO in code; not enforced |
| **Server-side raffle state** | Entries and drawings are not synced across users or devices |
| **Production admin auth** | Firebase custom claims scaffold exists but is empty; admin relies on client-side session login |

---

## Technology Stack

Verified from the repository (not inferred):

| Layer | Technologies |
|-------|--------------|
| **Frontend** | HTML5, CSS3, vanilla JavaScript (ES modules) |
| **Auth** | [Firebase Authentication](https://firebase.google.com/docs/auth) v10.13.1 (CDN), email/password |
| **Database** | [Cloud Firestore](https://firebase.google.com/docs/firestore) v10.13.1 (CDN) — user profiles only |
| **Hosting** | [Firebase Hosting](https://firebase.google.com/docs/hosting) (`firebase.json`, `.firebaserc`) |
| **3D graphics** | [Three.js](https://threejs.org/) r128 (CDN) — claw machine scene |
| **Canvas games** | HTML Canvas 2D API — Snake, Scratcher scratch-off rendering |
| **Fonts** | Google Fonts — Exo 2 |
| **Client storage** | `localStorage`, `sessionStorage` — raffle state, prize configs, game sessions, admin flags |
| **Build tooling** | None — no `package.json`, bundler, or compile step |

---

## Application Architecture

PrizeQuest is a **multi-page static web app**. Pages share Firebase config and communicate through browser storage and global functions on `window`.

```text
index.html
  └─ Auth router → login or dashboard

dashboard.html + script.js
  ├─ Raffle state (localStorage: raffleState, prize_*)
  ├─ Tab UI, timers, survey/buy handlers
  ├─ Embeds Snake (snake-game.js, inline in dashboard)
  └─ Links to scratcher.html, admin-access.html, profile

scratcher.html + scratcher.js
  └─ Canvas scratch game → awards entries to daily raffle (localStorage)

claw-machine.html
  └─ Three.js 3D claw machine + drawing countdown (reads drawing_* from localStorage)

admin-access.html → admin.html
  └─ Prize CRUD, stats, Admin Mode toggle → writes prize_* to localStorage

profile/build.html
  └─ Firestore users/{uid} read/write

auth/
  └─ firebase-config.js, login, forgot/reset password, email verification
```

### Data flow (simplified)

1. **Admin** saves prize config → `localStorage` (`prize_daily`, etc.).
2. **Dashboard** loads configs on init → updates caps, names, images, timers.
3. **User actions** (survey, buy, games) → update `raffleState` in `localStorage`.
4. **Cap reached** → overlay on prize card; admin (with Admin Mode) clicks to start draw.
5. **Drawing** → `drawing_{type}` state → redirect to `claw-machine.html?prize={type}`.
6. **Winner flow complete** → raffle entries reset locally for the next cycle.

### Project structure

```text
PrizeQuest/
├── index.html                 # Auth-based entry redirect
├── dashboard.html             # Main application shell
├── script.js                  # Raffle logic, UI, timers, drawing overlays
├── style.css                  # Global styles and dashboard theme
├── snake-game.js              # Snake mini-game (loaded by dashboard)
├── scratcher.html             # Scratcher game page
├── scratcher.js
├── scratcher.css
├── claw-machine.html          # 3D claw machine (inline Three.js + game logic)
├── claw-machine.js            # Redirect helper to claw-machine.html
├── admin-access.html          # Admin login gate
├── admin.html                 # Admin dashboard
├── auth/
│   ├── firebase-config.js     # Firebase app initialization
│   ├── auth.js                # Login/register handlers
│   ├── login.html
│   ├── check-email.html
│   ├── forgot.html
│   └── reset.html
├── profile/
│   └── build.html             # User profile (Firestore)
├── assets/
│   └── snake-logo.svg
├── images/                    # Referenced prize images (may need to be added locally)
├── firebase.json              # Hosting configuration
├── .firebaserc                # Firebase project alias
└── *.md                       # Feature/design notes (internal docs)
```

---

## Authentication and Data

### Firebase Authentication

- **Registration:** `createUserWithEmailAndPassword` → verification email → `check-email.html`.
- **Login:** Requires verified email before reaching the dashboard.
- **Password reset:** `forgot.html` sends reset email; `reset.html` completes the flow.
- **Persistence:** `browserLocalPersistence`.
- **Guest mode:** `localStorage.guestMode = 'true'` bypasses auth on the dashboard with restricted interactions.

### Firestore (profiles only)

Document path: `users/{uid}`

Fields include: `firstName`, `lastName`, `birthdate`, `gender`, `country`, `state`, `city`, `zip`, `consentSurveys`, `consentMarketing`, `createdAt`, `updatedAt`, and initial survey limit fields on create.

Raffle entries, prize configurations, drawing state, Snake leaderboard, and Scratcher sessions are **not** stored in Firestore.

### localStorage keys (application state)

| Key | Purpose |
|-----|---------|
| `raffleState` | Entry counts, survey counts, caps per raffle type |
| `prize_daily`, `prize_weekly`, `prize_monthly` | Admin prize configuration |
| `drawing_{type}` | Active drawing countdown state |
| `currentPrize` | Prize info when cap is reached |
| `isAdminMode` | Claw machine manual vs. automated behavior |
| `activeTab` | Last selected dashboard tab |
| `scratcher_*` | Scratcher session and daily play limits |
| `snakeLeaderboard` | Local Snake high scores |
| `guestMode` | Guest browsing flag |

---

## Games and Gamification

### Snake (`snake-game.js`)

Embedded in the dashboard (not a separate page).

- **Level mode:** Progress through levels (10 apples per level); completing 4 levels opens a modal to claim 1 entry and choose daily/weekly/monthly raffle via ticket modal.
- **Unlimited mode:** Endless play; reaching 100 points awards 1 entry to the monthly raffle automatically.
- **Controls:** Keyboard (arrow keys) and touch swipe on mobile.
- **Leaderboard:** Stored locally in `snakeLeaderboard`.

### Scratcher (`scratcher.html`, `scratcher.js`)

Standalone page; requires Firebase login.

- 5 tickets per session, 6 scratch spots each (30 total).
- Guaranteed 3–10 total entries per session via outcome generation logic.
- Canvas-based scratch interaction (mouse and touch).
- Daily limit: 5 sessions per calendar day.
- Entries awarded to the **daily** raffle in `localStorage` (hardcoded target; TODO for user choice).

### 3D Claw Machine (`claw-machine.html`)

Winner-selection experience using Three.js.

- Joystick and drop-button controls (when enabled).
- Countdown mode when opened with `?prize=daily|weekly|monthly` during an active drawing.
- **Admin Mode ON:** Admin can manually control the claw after countdown; displays admin test player name.
- **Admin Mode OFF:** Auto-drop at countdown end; displays a random placeholder username from a fixed list.
- Resets raffle entries for the prize type after the winner flow completes.

---

## Admin Functionality

1. **`admin-access.html`** — Username/password form; on success sets `sessionStorage.adminAuthenticated` and redirects to the dashboard.
2. **`admin.html`** — Protected by session auth and optional Firebase custom claims check (claims list is currently empty).
3. **Prize management** — Edit and save daily, weekly, and monthly prizes; images stored as Base64 strings in localStorage.
4. **Timers** — Optional datetime end time per prize; dashboard shows live countdown.
5. **Admin Mode** — Toggle stored in `localStorage.isAdminMode`; affects drawing overlays on the main app and claw machine behavior.
6. **Reset Raffle Cycle** — Clears player progress and drawing data without removing prize configs.

> **Note:** Admin authentication is client-side only and is suitable for demos, not production. See [Security](#security).

---

## Survey and Integration Functionality

### What exists today

- **Simulated surveys:** Clicking “Take Survey” on a raffle card increments `surveyCount`, awards +1 entry, shows a completion modal, and disables the button after 5 surveys per prize.
- **Profile consent:** Users can opt in to survey invitations via the profile form (`consentSurveys` stored in Firestore).
- **Firestore profile fields:** `dailySurveyCount` and `dailySurveyLimit` are initialized on profile create but are not wired to the dashboard survey buttons.

### What is not integrated

- No external survey provider (Typeform, SurveyMonkey, Google Forms, etc.).
- No survey gate before Scratcher (marked TODO in `scratcher.js` and `script.js`).
- No ad network or “Watch Ad” UI despite `adCount` in the raffle data model.
- Internal docs (`SURVEY_FEATURE*.md`) describe an older 2-survey flow; the live code uses **5 surveys per prize**.

---

## Technical Challenges and Learning

This project demonstrates practical front-end and product development work without overclaiming backend sophistication:

- **Auth gating patterns** — Multiple pages hide content until `onAuthStateChanged` resolves; guest mode as a parallel access path.
- **State management without a framework** — Coordinating raffle state, admin configs, and drawing lifecycle across pages via localStorage and shared globals (`window.handleBuyTicket`, `window.updateRaffleUI`).
- **Canvas game development** — Snake (game loop, collision, modes) and Scratcher (scratch mask rendering, touch support).
- **Three.js integration** — 3D scene, lighting, and interactive claw controls tied to application state.
- **Admin ↔ user app sync** — Prize cap changes in admin must propagate to the dashboard; implemented by re-reading `prize_*` keys and overriding caps from raffle state.
- **UI/UX polish** — Tab persistence, progress bars, confetti/burst animations, drawing overlays, modals, responsive touch controls.
- **Firebase setup** — Auth, Firestore profile CRUD, Hosting deployment configuration.
- **Iterative feature development** — Quest system stubbed; survey and ad flows partially built; documentation reflects evolution.

---

## Running Locally

### Prerequisites

- A modern browser (Chrome, Firefox, Edge, Safari)
- [Firebase CLI](https://firebase.google.com/docs/cli) (optional, for `firebase serve` / deploy)
- A Firebase project with **Authentication** (Email/Password) and **Firestore** enabled

### Firebase configuration

1. Create a Firebase web app in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** sign-in under Authentication.
3. Create a Firestore database and configure security rules so authenticated users can read/write their own `users/{uid}` document.
4. Copy your Firebase web config into `auth/firebase-config.js` (do not commit production secrets to public repos if you rotate keys).

### Serve the app

Because the project uses ES module imports with absolute paths (e.g. `/auth/firebase-config.js`), open it through a local HTTP server — not `file://`.

**Option A — Firebase Hosting emulator**

```bash
npm install -g firebase-tools
firebase login
firebase serve
```

Then open `http://localhost:5000`.

**Option B — Any static server**

```bash
# Python 3
python -m http.server 8080

# npx (no install)
npx serve .
```

Then open `http://localhost:8080` (or the port shown).

### Deploy (optional)

```bash
firebase deploy --only hosting
```

Project alias is configured in `.firebaserc` (`prizequest`). Use your own Firebase project for forks.

---

## Current Project Status

### Functional

- User registration, login, email verification, password reset
- Guest dashboard browsing
- Profile create/edit (Firestore)
- Dashboard raffle UI with local entry tracking
- Simulated surveys and ticket purchases
- Admin prize configuration and raffle cycle reset
- Snake and Scratcher mini-games with entry rewards
- 3D claw machine drawing flow with Admin Mode
- Firebase Hosting-ready static deployment

### Limitations

- **Single-browser state** — Raffle progress does not sync between users or devices.
- **No real monetization** — Ticket purchase is simulated.
- **No real surveys or ads** — Counters only; no third-party integrations.
- **Admin security** — Client-side admin login; not suitable for production without backend enforcement.
- **Placeholder winners** — Public drawing mode uses random display names, not actual entrant selection from a database.
- **Asset gaps** — Some prize images reference local paths (`./images/switch.avif`, etc.) that may not be present in the repo; admin can upload replacements.

---

## Future Improvements

Based on TODOs, commented code, and obvious gaps in the repository:

1. **Backend raffle service** — Persist entries, caps, and drawings in Firestore or a custom API; enforce rules server-side.
2. **Real survey integration** — Embed or redirect to a survey provider; gate Scratcher and other rewards on completion.
3. **Payment integration** — Connect “Buy Ticket” to a payment processor.
4. **Quest system** — Implement the commented-out daily/streak quest logic.
5. **Watch ad flow** — Build UI and hook into an ad SDK; use existing `adCount` field.
6. **Firebase custom claims admin** — Replace client-side admin credentials with Cloud Functions–set claims.
7. **Xbox / PS5 / additional prize tiers** — Enable cards currently marked “Coming Soon”.
8. **Scratcher improvements** — Survey gate, user-selected target raffle, cross-page UI refresh.
9. **Multi-user winner selection** — Select winners from actual entry records rather than placeholder names.
10. **Testing and CI** — Add automated tests for raffle logic and auth flows.

---

## Security

- **Firebase config** lives in `auth/firebase-config.js`. For portfolio or public repos, restrict API keys in the [Google Cloud Console](https://console.cloud.google.com/) (HTTP referrer restrictions) and use Firestore/Auth security rules appropriate for your deployment.
- **Do not rely on client-side admin login for production.** Replace `admin-access.html` credentials with Firebase custom claims or a backend-admin API before any real deployment.
- **No secrets in this README** — Configure Firebase and admin access through your own environment; rotate any credentials that were ever committed to source control.
- **Firestore rules** — Ensure users can only read/write their own profile document. Raffle data is currently client-only; moving it server-side will require new rules and validation.
- **Guest mode** — Intended for preview only; interactive actions are blocked client-side, not server-side.

---

## Internal Documentation

The repository includes additional markdown notes from development (not required to run the app):

- `ADMIN_DASHBOARD.md`, `ADMIN_MODE_FEATURE.md` — Admin panel behavior
- `SURVEY_FEATURE.md`, `SURVEY_FEATURE_UPDATED.md` — Survey flow notes (partially outdated vs. current 5-survey code)
- `CLAW_MACHINE_INTEGRATION.md`, `CLAW_MACHINE_CONTROLS_UPDATE.md` — Claw machine design
- `IMAGE_UPLOAD_FEATURE.md` — Admin image upload notes

Refer to the source code as the source of truth when docs and implementation differ.

---

## License

<!-- TODO: Add license if applicable -->

No license file is present in the repository. Add one before public distribution if desired.
