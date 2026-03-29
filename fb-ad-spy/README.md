# FB Ad Spy Tool

A production-ready Facebook Ad Intelligence Tool that lets you search, analyze, and spy on Facebook ads across niches, countries, and competitors.

## Features

- **Ad Explorer** — Search and filter Facebook ads by keyword, country, niche, age, platform, format, and funnel type
- **Winning Score** — Algorithmic scoring system (0-100) based on days running, countries, platforms, and more
- **Revenue Estimator** — Industry-benchmark-based revenue and spend estimates per ad
- **Competitor Tracking** — Monitor competitor Facebook pages for new ads
- **Swipe File** — Save ads to organized collections with notes
- **AI Studio** — Analyze ad copy with Claude AI and generate new variations
- **Alerts** — Get email notifications when new ads match your criteria
- **Export** — PDF and CSV export of your swipe file
- **Dashboard** — Charts showing niche distribution, country breakdown, spend trends, and saturation

## Tech Stack

- **Backend:** Node.js, Express 4, better-sqlite3
- **Frontend:** React 18, Vite, Tailwind CSS v3, Recharts, Zustand
- **AI:** Anthropic SDK (Claude claude-opus-4-5)
- **Auth:** JWT + bcryptjs
- **Alerts:** node-cron + nodemailer

---

## Prerequisites

### 1. Facebook Ad Library API Token

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app (type: Business)
3. Add the "Marketing API" product
4. Generate a long-lived access token with `ads_read` permission
5. Copy the token to `FB_ACCESS_TOKEN` in your `.env`

**Note:** The Ad Library API requires your app to be approved for Standard Access. You may need to submit your app for review.

### 2. Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account and generate an API key
3. Copy the key to `ANTHROPIC_API_KEY` in your `.env`

### 3. Gmail App Password (for SMTP alerts)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords → Generate a new app password
4. Use your Gmail address for `SMTP_USER` and the app password for `SMTP_PASS`

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd fb-ad-spy

# Install backend dependencies
cd backend
npm install

# Create your environment file
cp .env.example .env
# Edit .env with your actual values

# Install frontend dependencies
cd ../frontend
npm install
```

## Running

```bash
# Terminal 1 — Backend
cd backend
node server.js
# Server runs on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## First Time Setup

Register your first user via the API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "your-secure-password",
    "team_name": "My Agency"
  }'
```

Then log in at `http://localhost:5173/login` with your credentials.

---

## API Endpoints

### Auth (no token required)

```bash
# Register
POST /api/auth/register
Body: { "name", "email", "password", "team_name" }

# Login
POST /api/auth/login
Body: { "email", "password" }
```

### Ads (requires Bearer token)

```bash
# Search ads
GET /api/ads?search=fitness&country=US&niche=Health&sort=score&page=1&limit=20

# Get single ad
GET /api/ads/:fb_ad_id

# Get ads by niche
GET /api/ads/niche/Health

# Get ads by country
GET /api/ads/country/US

# Get ads by age
GET /api/ads/age/new

# Compare ads
POST /api/ads/compare
Body: { "ad_ids": ["123", "456", "789"] }

# Refresh cache
GET /api/ads/refresh
```

### Stats

```bash
GET /api/stats
```

### Competitors

```bash
GET /api/competitors
POST /api/competitors
Body: { "page_id", "page_name", "niche", "notes" }

DELETE /api/competitors/:id
GET /api/competitors/:id/ads
POST /api/competitors/:id/check
```

### Alerts

```bash
GET /api/alerts
POST /api/alerts
Body: { "alert_type", "keyword", "country", "niche", "email_to" }

PUT /api/alerts/:id
Body: { "is_active", "email_to", "keyword" }

DELETE /api/alerts/:id
GET /api/alerts/log
```

### Swipe File

```bash
GET /api/swipefile?collection=My+Swipe+File&search=keyword
POST /api/swipefile
Body: { "fb_ad_id", "ad_data", "collection_name", "notes" }

DELETE /api/swipefile/:id
GET /api/swipefile/collections
GET /api/swipefile/collection/:name
GET /api/swipefile/export/pdf
GET /api/swipefile/export/csv
PATCH /api/swipefile/:id/notes
Body: { "notes" }
```

### AI Studio

```bash
POST /api/ai/analyze
Body: { "ad_id": "fb_ad_id_here" }

POST /api/ai/generate
Body: { "ad_id": "fb_ad_id_here", "user_product": "Description of your product" }

GET /api/ai/history
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `FB_ACCESS_TOKEN` | Facebook Marketing API access token |
| `FB_API_VERSION` | Facebook API version (default: v19.0) |
| `PORT` | Backend server port (default: 3001) |
| `CORS_ORIGIN` | Frontend URL (default: http://localhost:5173) |
| `CACHE_DURATION_MINUTES` | How long to cache FB API results (default: 60) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude AI |
| `SMTP_HOST` | SMTP server host (default: smtp.gmail.com) |
| `SMTP_PORT` | SMTP server port (default: 587) |
| `SMTP_USER` | SMTP username (email address) |
| `SMTP_PASS` | SMTP password (app password for Gmail) |
| `ALERT_CHECK_HOURS` | How often to run alert checks (default: 6) |

---

## Revenue Estimate Disclaimer

**IMPORTANT:** All revenue and spend estimates shown in this tool are calculated using industry-average benchmarks (CPC rates, ROAS multipliers) and are **NOT** actual Facebook data. These estimates are provided for competitive intelligence purposes only. Actual advertiser spend and revenue may differ significantly. Do not make business decisions based solely on these estimates.

---

## Known Facebook API Limitations

1. **Rate Limits** — The Ad Library API has rate limits. The tool adds 1-second delays between paginated requests.
2. **Data Availability** — Not all ad data fields are available for all ads. Some fields may be null.
3. **Access Levels** — Standard Access is required for most features. Development mode has lower limits.
4. **Country Restrictions** — Some ads may not be visible in all countries.
5. **Maximum Results** — The tool caps at 300 ads per search to stay within rate limits.
6. **Historical Data** — The Ad Library only contains ads from the last 7 years.

---

## Troubleshooting

### "FB_ACCESS_TOKEN is not configured"
- Make sure your `.env` file exists in the `backend/` directory
- Ensure `FB_ACCESS_TOKEN` is set with a valid token

### "Facebook API Error: Invalid OAuth access token"
- Your token may have expired. Generate a new long-lived token
- Ensure your app has `ads_read` permission

### "SQLITE_BUSY" errors
- The WAL mode should handle concurrent reads, but if issues persist, ensure only one server instance is running

### Frontend shows blank page
- Check browser console for errors
- Ensure the backend is running on port 3001
- Check that CORS_ORIGIN matches your frontend URL

### Alerts not sending emails
- Verify SMTP credentials in `.env`
- For Gmail, ensure you're using an App Password (not your regular password)
- Check that 2-Step Verification is enabled on your Google account

### AI analysis fails
- Verify your `ANTHROPIC_API_KEY` is valid
- Check that you have sufficient API credits
- The tool uses claude-opus-4-5 model — ensure your account has access

### "Cannot find module" errors
- Run `npm install` in both `backend/` and `frontend/` directories
- Delete `node_modules` and reinstall if issues persist
