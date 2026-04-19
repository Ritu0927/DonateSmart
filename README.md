# DonateSmart

DonateSmart is a hackathon-ready full-stack Next.js app for donor intake and staff-side QR item lookup. Donors start with onboarding details, can submit multiple items in one session, and each accepted item earns loyalty points based on the suggested resale range.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local JSON storage
- `qrcode` package for QR generation
- Gemini API integration for image-backed pricing analysis
- ElevenLabs website voice assistant

## Features

- Beautiful responsive homepage for demo entry
- Donation form with validation, image upload, and preview
- Donor onboarding with name, email, and phone
- Multi-item donation flow with donor context carried forward
- Local item creation with unique IDs
- Rule-based suggested resale range logic
- Gemini-powered image appraisal with optional Google Search grounding
- Staff-only dashboard login with demo credentials
- QR code generation linked to `/items/[id]`
- QR footer text showing the submitted category and condition
- Loyalty points earned as 10% of the low end of the suggested resale range
- Donor-facing motivation message for each donated item
- Success page with QR display
- Staff dashboard with search by item name or category
- Item detail page for QR scans
- Floating website voice assistant for donor or staff questions
- Seed data included in `data/items.json`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Add your environment variables in `.env.local`:

```bash
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
# Optional:
# NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
# Optional:
# GEMINI_MODEL=gemini-2.5-flash
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Staff login

- Dashboard login page: `/staff-login`
- Demo employee ID: `ghost`
- Demo password: `12345`

You can optionally override these in `.env.local`:

```bash
STAFF_LOGIN_ID=ghost
STAFF_LOGIN_PASSWORD=12345
```

## Project structure

```text
app/
  api/items/
  dashboard/
  donate/
  items/[id]/
  success/[id]/
components/
  dashboard/
  donate/
  home/
  items/
  layout/
  ui/
data/
  items.json
lib/
  impact.ts
  pricing.ts
  storage.ts
  types.ts
  validation.ts
```

## Notes

- Pricing language intentionally uses `suggested resale range`, not exact pricing.
- The pricing logic is isolated in `lib/pricing.ts` so it can later be replaced by an AI model.
- The Gemini integration lives in `lib/gemini.ts`. New submissions require working Gemini image validation; if `GEMINI_API_KEY` is missing or Gemini fails, the app blocks the submission instead of silently accepting a bad item.
- The local database is a JSON file at `data/items.json`, which keeps the demo simple.
- Gemini uses the uploaded image, donor input, and live Google Search grounding when available, then stores the resulting range and source links on the item record.
- Donor records are also stored in `data/items.json`, including accumulated loyalty points.
- The ElevenLabs voice assistant now starts through a signed-URL server route at `app/api/elevenlabs/signed-url/route.ts`.
- Set `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` in `.env.local` before testing the voice assistant.

## Demo flow

1. Visit `/donate` and complete donor onboarding.
2. Submit an item with category, condition, and image.
3. After submission, the server creates the item, appraises it with Gemini, awards loyalty points, and redirects to `/success/[id]`.
4. Choose `Next item` to keep donating as the same donor, or `Exit to home` to see the donor points summary.
5. Scan or open the QR-linked page at `/items/[id]` to view the record and staff-side pricing analysis.
