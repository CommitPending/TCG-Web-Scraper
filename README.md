# TCG Web Scraper

## Description

A trading card price tracker built with Node.js. It periodically scrapes prices from TCGPlayer and sends an email notification when a card drops below a desired price threshold. Works for any card listed on TCGPlayer, not just Pokémon.

The scraper is designed to run as a **GitHub Actions workflow** (every 8 hours), but can also be run locally.

---

## Project Structure

```
index.js              ← Entry point
data/
  cardList.js         ← Cards to track and their target prices
src/
  scraper/
    browser.js        ← Puppeteer launch (auto-detects local vs CI)
    scraper.js        ← Scraping + price check logic
  email/
    mailer.js         ← Email notifications
  utils/
    cleanup.js        ← Temp directory cleanup
ui/                   ← Optional local dashboard (does not affect scraper)
  server.js           ← Express API + SSE server
  client/             ← React frontend
```

---

## Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd TCG-Web-Scraper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```
BOT_EMAIL=your_bot_email@provider.com
EMAIL_PASSWORD=your_email_password
SEND_EMAIL=your_target_email@provider.com
```

- `BOT_EMAIL` — the email account used to send alerts
- `EMAIL_PASSWORD` — password for the bot email account
- `SEND_EMAIL` — where to send the price alert notifications

---

## Running the Scraper

### Locally

The `.npmrc` skips the automatic Chromium download during `npm install`. Run this **once** after cloning to download the browser:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx puppeteer browsers install chrome
```

> The `NODE_TLS_REJECT_UNAUTHORIZED=0` flag is needed due to the local SSL certificate setup. This is a one-time step — the browser is cached at `~/.cache/puppeteer`.

Then start the scraper:

```bash
npm start
```

### GitHub Actions (CI)

The workflow runs automatically every 8 hours via `.github/workflows/scraper.yml`. Set `BOT_EMAIL`, `EMAIL_PASSWORD`, and `SEND_EMAIL` as repository secrets in GitHub Settings → Secrets.

---

## Local Dashboard UI

A separate optional dashboard lets you monitor card prices and run counts in real time without affecting the scraper.

```bash
cd ui
npm install
npm start
```

Then open **http://localhost:3001** in your browser.

> The UI is completely independent — it does not modify the scraper or interfere with the GitHub Actions workflow.

---

Note: Look into pm2 for multiple nodes or clusters for multiple instance runs.

Thanks :)
