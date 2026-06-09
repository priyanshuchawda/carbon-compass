# Carbon Compass Security Policy & Boundaries

This document details the security layers, data boundaries, and threat defenses implemented in **Carbon Compass**.

---

## 1. Input Validation and Bounded Schema Protection

All server-side calculation actions and API payloads are strictly validated using **Zod** schema structures.

- **File**: [`lib/validation/schemas.ts`](file:///C:/Users/Admin/Desktop/project/lib/validation/schemas.ts)
- Any negative values, empty strings, or invalid enum payloads are caught at the boundary before they enter the carbon calculation engines or database helpers.

---

## 2. API Credentials & Error Redaction

To protect sensitive deployment configurations (such as the `GEMINI_API_KEY`), all API endpoints route through our error scrubbing utility.

- **File**: [`lib/carbon/redaction.ts`](file:///C:/Users/Admin/Desktop/project/lib/carbon/redaction.ts)
- **Regex scrubbers**: Clean headers (`Authorization`), URLs (query params like `?key=`), and raw Google API keys (`AIza...`) from caught exceptions before returning a standard, safe payload to client components.

---

## 3. Privacy & Minimal Data Bounded Scope

Carbon Compass does not ask for or store any personally identifiable information (PII):

- Location data is bounded strictly at the **city** level (e.g., Pune, India) for grid electricity scaling; no exact address, coordinate, or postal code is requested.
- Calculations are session-based (`sessionStorage`) and remain isolated inside the user's browser runtime.

---

## 4. Secure Response Headers

The application configures standard security headers via `next.config.ts`:

- `X-Content-Type-Options: nosniff` (Defends against MIME-sniffing)
- `X-Frame-Options: DENY` (Defends against clickjacking)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`
