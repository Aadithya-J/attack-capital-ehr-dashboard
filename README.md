# Attack Capital — EHR Integration Dashboard

A Next.js dashboard that integrates with ModMed (Modernizing Medicine) FHIR APIs using a Backend‑for‑Frontend (BFF) approach. The app provides patient search, appointments scheduling, clinical data access, billing artifacts, and credential management.

Links to docs:
- Integration Approach and Architecture: `docs/integration-approach.md`
- Implementation Guide: `docs/implementation-guide.md`
- Route → ModMed Mapping: `docs/routes-to-modmed.md`

---

## Features

- Patient search, details, and demographics
- Appointments end‑to‑end: search, create, update/cancel, slot availability
- Clinical data: allergies, conditions, medications, encounters, diagnostic reports, compositions (clinical notes)
- Billing: accounts, coverage, charge items
- Practitioners and locations lookup
- Credentials page to set ModMed connection at runtime (encrypted cookie)
- Security headers and CSP for HIPAA‑oriented hardening

---

## Quick Start

1) Install dependencies
```bash
npm install
```

2) Environment variables
- Copy `env.example` → `.env` and fill values, OR use the in‑app Credentials page (see below).

`env.example` keys:
```
MODMED_BASE_URL=
MODMED_FIRM_URL_PREFIX=
MODMED_API_KEY=
MODMED_USERNAME=
MODMED_PASSWORD=
# Optional: secret to decrypt cookie creds on the server
CRED_SECRET=
```

3) Run dev
```bash
npm run dev
# Local: http://localhost:3000
```

4) Set credentials (Option A: UI — recommended)
- Open `http://localhost:3000/credentials`
- Enter Base URL, Firm URL Prefix, API Key, Username, Password
- Click “Test & Save” to set the encrypted `modmed_creds` cookie

5) Or set credentials (Option B: .env)
- Fill `.env` with the same values and restart the dev server

---

## Build & Deploy

Build:
```bash
npm run build
```

Start:
```bash
npm run start
```

Vercel deployment tips:
- Add the following Environment Variables in Vercel (Production & Preview):
  - `MODMED_BASE_URL`, `MODMED_FIRM_URL_PREFIX`, `MODMED_API_KEY`, `MODMED_USERNAME`, `MODMED_PASSWORD`
  - Optional: `CRED_SECRET` for cookie decryption
- Alternatively, rely on the `/credentials` page to set cookie‑based creds in production
- The build skips ESLint during production builds to avoid blocking on type strictness (see `next.config.ts`)

---

## Architecture (Summary)

The app is a BFF over ModMed APIs.

- Server routes: `src/app/api/**/route.ts`
  - Validate inputs
  - Get OAuth token (`src/lib/modmedAuth.ts`) and use axios client (`src/lib/modmedClient.ts`)
  - Call ModMed FHIR endpoints
  - Normalize responses and add security headers (`src/lib/securityHeaders.ts`)

- Runtime credentials: `src/lib/getModMedConfig.ts`, `src/lib/runtimeConfig.ts`
  - Cookie `modmed_creds` (encrypted) preferred; `.env` fallback

- Client state: React Query hooks under `src/hooks/**`
  - Caching, retry, and background refresh

Read the detailed docs in:
- `docs/integration-approach.md`
- `docs/implementation-guide.md`

---

## API Routes (BFF)

Common resources (see `docs/routes-to-modmed.md` for full list):

- `GET /api/patients` → ModMed `GET /ema/fhir/v2/Patient`
- `GET/PUT /api/patients/[id]` → `GET/PUT /ema/fhir/v2/Patient/{id}`
- `GET/POST /api/appointments` → `GET/POST /ema/fhir/v2/Appointment`
- `GET/PUT /api/appointments/[id]` → `GET/PUT /ema/fhir/v2/Appointment/{id}`
- `GET /api/slots` → `GET /ema/fhir/v2/Slot`
- `GET /api/practitioners` → `GET /ema/fhir/v2/Practitioner`
- `GET /api/locations` → `GET /ema/fhir/v2/Location`
- `GET/POST/PUT /api/allergies` → `.../AllergyIntolerance`
- `GET/POST/PUT /api/conditions` → `.../Condition`
- `GET/POST/PUT /api/medications` → `.../MedicationStatement`
- `GET /api/encounters` → `.../Encounter`
- `GET /api/diagnostic-reports` → `.../DiagnosticReport`
- `GET /api/compositions` (clinical notes) → `.../Composition`
- `GET /api/coverage` → `.../Coverage`
- `GET /api/accounts` → `.../Account`
- `GET/POST /api/charge-items` → `.../ChargeItem`

---

## Security

- Security headers and CSP applied to all responses (`src/lib/securityHeaders.ts`)
- Cookie credentials are encrypted; server decrypts with `CRED_SECRET` or dev fallback
- OAuth2 Password Grant is used for ModMed