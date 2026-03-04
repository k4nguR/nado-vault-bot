# Nado Vault Cap Monitor Bot 🏦

Telegram bot that monitors NLP vault cap changes on the [Nado](https://nado.xyz) protocol (Ink chain) and sends real-time notifications.

## What It Monitors

- **Total TVL** (USDT0 balances across Clearinghouse + Endpoint)
- **NLP Pool count** and weight changes
- **Insurance fund** balance
- New pools added or removed

## Quick Start (Local)

```bash
# 1. Install Node.js (v18+)
# macOS:
brew install node

# 2. Install dependencies
cd nado-vault-bot
npm install

# 3. Run a one-time data check
npm run check

# 4. Start the monitor
npm start
```

## Telegram Setup

Your bot is already created (via @BotFather). To see messages:

1. Open Telegram and search for your bot by its username
2. Press **Start** in the chat with the bot
3. The bot will send messages to chat ID `964241644` — this is already configured

> **Note:** This bot only *sends* messages (push notifications). It doesn't respond to commands. You'll see notifications appear in your chat with the bot automatically when vault data changes.

## Deploy to Railway (Recommended) 🚂

[Railway](https://railway.app) is the easiest option — free tier available, no credit card needed for small projects.

### Steps:

1. **Push to GitHub** (or use Railway's CLI):
   ```bash
   cd nado-vault-bot
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/nado-vault-bot.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
   - Select your `nado-vault-bot` repo
   - Railway auto-detects Node.js and runs `npm start`

3. **Add environment variables** in Railway dashboard → your service → **Variables**:
   ```
   TELEGRAM_BOT_TOKEN=8782265379:AAGyqtjqXU6AmnGc54SpbdQAmn_obtVUZ9k
   TELEGRAM_CHAT_ID=964241644
   INK_RPC_URL=https://rpc-gel.inkonchain.com
   ENDPOINT_ADDRESS=0x05ec92D78ED421f3D3Ada77FFdE167106565974E
   CLEARINGHOUSE_ADDRESS=0xD218103918C19D0A10cf35300E4CfAfbD444c5fE
   POLL_INTERVAL_MS=300000
   CHANGE_THRESHOLD_USD=100
   ```

4. **Done!** The bot will start and send a startup message to your Telegram.

### Other Hosting Options

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5/month credit | Easiest setup, auto-deploy from GitHub |
| **Render** | Free (with sleep) | Free tier sleeps after 15min inactivity — not ideal for a monitor |
| **Fly.io** | Free tier | Good for always-on, slightly more setup |
| **VPS** (Hetzner/DigitalOcean) | ~$4/mo | Full control, use PM2 to keep alive |

> **Railway is the best choice** because: always-on (no sleep), easy GitHub deploy, free $5/mo credit covers this bot easily.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `POLL_INTERVAL_MS` | `300000` | How often to check (ms). 300000 = 5 minutes |
| `CHANGE_THRESHOLD_USD` | `100` | Min USD change to trigger notification |

## Project Structure

```
nado-vault-bot/
├── .env                 # Config (not committed)
├── package.json
├── src/
│   ├── index.js         # Entry point
│   ├── config.js        # Configuration loader
│   ├── contracts.js     # Ink chain RPC queries
│   ├── telegram.js      # Telegram bot messaging
│   ├── monitor.js       # Polling loop & change detection
│   └── check.js         # One-time data check
└── state.json           # Persisted state (auto-created)
```
