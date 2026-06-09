# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **priyanshuchawda20@gmail.com**

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix or mitigation**: Depending on severity, within 2-4 weeks

## Supported Versions

| Version  | Supported |
| -------- | --------- |
| latest   | ✅        |
| < latest | ❌        |

## Security Measures

This project implements the following security practices:

- **Strict Input Validation**: All public API endpoints (`/api/calculate`, `/api/recommendations`, `/api/assistant/narrate`, and `/api/assistant/chat`) enforce strict JSON body schemas using Zod's `.strict()` parser. Any additional or malformed properties are rejected.
- **Sensitive Data Redaction**: The custom utility `lib/carbon/redaction.ts` recursively scrubs API keys, Bearer tokens, and URL query params from server-side logs and error outputs before sending them back to the client.
- **Session Data Re-verification**: The session bridge (`lib/carbon/session.ts`) parses and validates sessionStorage data with Zod on every read to prevent crashes or manipulation of local state.
- **Rate Limiting**: Public AI endpoints (`/api/assistant/narrate` and `/api/assistant/chat`) are protected by an in-memory IP rate limiter to mitigate API key abuse and exhaustions.
- **Secure Headers Suite**: Next.js configurations (`next.config.ts`) enforce modern security headers, including:
  - **Content-Security-Policy (CSP)**: Restrictions on script and connect destinations (permitting 'unsafe-inline' for Next.js hydration but disallowing third-party script sources).
  - **X-Frame-Options**: Set to `DENY` to prevent clickjacking.
  - **X-Content-Type-Options**: Set to `nosniff`.
  - **Referrer-Policy**: Set to `strict-origin-when-cross-origin`.
  - **Permissions-Policy**: Camera, microphone, and geolocation access disabled.
- **Safe Fallbacks**: The assistant narrates via structured context and fails over to highly customized local mock templates if API limits are hit, keeping the client UX operational without throwing unhandled failures.
