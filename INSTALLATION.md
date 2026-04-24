# ⚙️ Installation & Setup Guide

Complete guide to installing and configuring FluentAI for local development or deployment.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Installation Checklist](#pre-installation-checklist)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [API Keys & Credentials](#api-keys--credentials)
7. [Running the Application](#running-the-application)
8. [Verification Checklist](#verification-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Deployment](#deployment)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org))
  - Check: `node --version`
- **npm**: Version 8.0.0 or higher (installed with Node.js)
  - Check: `npm --version`
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 500MB free space

### Optional But Recommended

- **Git**: For version control ([Download](https://git-scm.com))
- **MongoDB Compass**: GUI for MongoDB ([Download](https://www.mongodb.com/products/compass))
- **Visual Studio Code**: Recommended editor ([Download](https://code.visualstudio.com))

---

## Pre-Installation Checklist

Before you start, have ready:

- [ ] Node.js 18+ installed
- [ ] Git cloned (or code downloaded)
- [ ] MongoDB account (local or Atlas)
- [ ] Google Gemini API key
- [ ] Text editor or IDE open
- [ ] Terminal/Command Prompt ready

---

## Local Development Setup

### Step 1: Clone & Navigate

```bash
# Clone the repository (or extract if downloaded as ZIP)
git clone <repository-url>
cd "web app"

# Verify you're in the right directory
pwd  # (macOS/Linux) or cd (Windows) - should show the project path
```

### Step 2: Install Dependencies

```bash
npm install
```

**What this does:**

- Installs all packages from `package.json`
- Creates `node_modules/` folder
- Sets up Next.js, React, MongoDB, and AI SDK dependencies
- Takes 2-5 minutes depending on internet speed

**Expect to see:**

```
added 500+ packages in 2m45s
```

### Step 3: Create Environment File

Create a `.env.local` file **in the root directory** (same level as `package.json`):

```bash
# macOS/Linux:
touch .env.local

# Windows (PowerShell):
New-Item -Path .env.local -ItemType File

# Or just create it in your text editor
```

**Do NOT commit this file to Git!** It contains secrets. Add to `.gitignore` if not already present.

---

## Environment Variables

Copy and fill in the template below in your `.env.local`:

```env
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DATABASE (MongoDB)
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Local MongoDB (if running locally)
MONGODB_URI="mongodb://localhost:27017/fluentai"

# OR MongoDB Atlas (cloud - recommended)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/fluentai?retryWrites=true&w=majority"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AUTHENTICATION (NextAuth.js)
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Generate with: openssl rand -base64 32
# OR: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="your-32-character-random-secret-key-here"

# Local development URL
NEXTAUTH_URL="http://localhost:3000"

# Production: change to your domain
# NEXTAUTH_URL="https://fluentai.example.com"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI CONFIGURATION (Google Gemini)
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key-here"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OPTIONAL: Alternative AI Provider
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# If you want to use OpenAI as backup
# OPENAI_API_KEY="your-openai-key-here"
```

### Variable Descriptions

| Variable                       | Required | Description                                  | Example                 |
| ------------------------------ | -------- | -------------------------------------------- | ----------------------- |
| `MONGODB_URI`                  | ✅ Yes   | Database connection string                   | `mongodb+srv://...`     |
| `NEXTAUTH_SECRET`              | ✅ Yes   | Session encryption key (32+ chars)           | Base64 random string    |
| `NEXTAUTH_URL`                 | ✅ Yes   | App URL (localhost for dev, domain for prod) | `http://localhost:3000` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ Yes   | Gemini API key for AI features               | 39-char alphanumeric    |
| `OPENAI_API_KEY`               | ❌ No    | Optional fallback AI provider                | OpenAI API key          |

---

## Database Setup

### Option A: MongoDB Local (Simple, No Internet)

#### Installation

**Windows:**

1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Run installer, accept defaults
3. MongoDB runs as a service automatically

**macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Verify Installation

```bash
mongo --version  # Should show version info
# Or connect to check it's running:
mongo
# You should see a "mongosh>" prompt
# Type: exit
```

#### Set MongoDB URI

In `.env.local`:

```env
MONGODB_URI="mongodb://localhost:27017/fluentai"
```

**Pros:** ✅ No internet needed, ✅ No costs, ✅ Fast for development  
**Cons:** ❌ Only accessible locally, ❌ No automatic backups

---

### Option B: MongoDB Atlas (Cloud, Recommended)

#### Create Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Sign Up** (or **Sign In** if you have account)
3. Create organization and project
4. Click **Build a Database**
5. Select **M0 Sandbox** (free tier)
6. Choose region near you
7. Click **Create**

#### Create Database User

1. In left sidebar, go to **Database Access**
2. Click **Add New Database User**
3. Create username: `fluentai` (example)
4. Create password: `use-a-strong-password` (save this!)
5. Click **Add User**

#### Allow Network Access

1. Go to **Network Access** in left sidebar
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for development)
   - ⚠️ For production, specify your IP only
4. Click **Confirm**

#### Get Connection String

1. Go back to **Databases**
2. Click **Connect** on your cluster
3. Select **Drivers** → **Node.js**
4. Copy the connection string

**Format:**

```
mongodb+srv://username:password@cluster-name.mongodb.net/database?retryWrites=true&w=majority
```

**Example:**

```
mongodb+srv://fluentai:MySecurePassword123@cluster.u8abc.mongodb.net/fluentai?retryWrites=true&w=majority
```

#### Set MongoDB URI

Replace placeholder in `.env.local`:

```env
MONGODB_URI="mongodb+srv://fluentai:MySecurePassword123@cluster.u8abc.mongodb.net/fluentai?retryWrites=true&w=majority"
```

**Pros:** ✅ Cloud-hosted, ✅ Accessible anywhere, ✅ Automatic backups, ✅ Free tier generous  
**Cons:** ❌ Requires internet, ❌ Slightly slower than local for development

---

## API Keys & Credentials

### Google Gemini API Key

**Why:** Powers the AI Chat Tutor, Writing Analysis, and Reading Generation.

#### Get Your Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create new API key**
4. Copy the key (looks like: `AIzaSyC_...`)
5. Save in `.env.local`:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyC_your_key_here"
   ```

#### Quotas & Limits

- **Free Tier**: 5 requests per minute
- **Paid Tier**: Higher limits (requires billing setup)

**If you hit the limit:**

- App will show error: "429 Too Many Requests"
- Wait 1 minute, try again
- For production, upgrade to paid tier

#### Test Your Key

```bash
# After setup, run:
npm run dev

# Try the Chat feature in the app
# If it streams responses, your key works! ✅
```

---

### NextAuth Secret

**Why:** Encrypts session cookies for security.

#### Generate Secret

**Option 1: OpenSSL (macOS/Linux):**

```bash
openssl rand -base64 32
# Output: gY7kR9pL2mX8vQ3nJhB5tC6wD9fG1sE4aW+yU/pO=
```

**Option 2: Node.js (All platforms):**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online generator:**
Go to [1Password Generator](https://1password.com/password-generator/) and create 32-char alphanumeric string

#### Set in `.env.local`

```env
NEXTAUTH_SECRET="gY7kR9pL2mX8vQ3nJhB5tC6wD9fG1sE4aW+yU/pO="
```

**Important:** Never share this value! It's a secret.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

**Output:**

```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

**Open browser:**

- Navigate to `http://localhost:3000`
- You should see the FluentAI landing page

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Stopping the Server

- Press `Ctrl+C` in the terminal
- Wait for clean shutdown (a few seconds)

---

## Verification Checklist

After setup, verify everything works:

### ✅ Dependencies Installed

```bash
npm list | grep -E "next|react|mongoose|nextauth"
# Should show versions without errors
```

### ✅ Environment Variables

Confirm `.env.local` has all required variables:

```bash
# Check file exists
ls -la .env.local  # macOS/Linux
dir .env.local     # Windows

# Open and verify it contains:
# MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_GENERATIVE_AI_API_KEY
```

### ✅ Database Connection

```bash
npm run dev
# Watch console for: "MongoDB connected successfully" or similar
```

### ✅ Can Register

1. Open `http://localhost:3000`
2. Click **Register**
3. Create an account with:
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Name: `Test User`
   - Language: `Spanish` (or your choice)
4. Should redirect to **Login**
5. Enter credentials → Should see **Dashboard** ✅

### ✅ Can Chat

1. Click **Chat** in sidebar
2. Type: "Hello, my name is [YourName]"
3. Should see AI response streaming ✅

### ✅ Can Write

1. Click **Writing**
2. Paste: "I am happy because I learn english every day."
3. Click **Analyze**
4. Should see AI feedback and score ✅

If all checks pass, you're ready to develop! 🎉

---

## Troubleshooting

### "Cannot find module 'mongoose'"

**Cause:** Dependencies not installed

**Solution:**

```bash
npm install
# Wait for completion, then try again
```

### "Error: connect ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB not running

**Solution:**

**Local MongoDB:**

```bash
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
# MongoDB service should auto-start; if not:
# Services app → MongoDB Server → Start
```

**MongoDB Atlas:**

- Verify connection string in `.env.local` is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Test connection in MongoDB Compass

### "Error: NextAuth NEXTAUTH_SECRET is invalid"

**Cause:** Secret not set or invalid format

**Solution:**

1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
2. Copy output exactly to `.env.local`
3. Restart server: `npm run dev`

### "Error: 429 Too Many Requests"

**Cause:** Gemini API free tier limit (5 req/min)

**Solution:**

- Wait 1 minute before next request
- For production, upgrade to Google API paid tier
- Add rate limiting to your code

### "EADDRINUSE: address already in use :::3000"

**Cause:** Port 3000 already in use (another app/dev server running)

**Solution:**

**Option 1:** Kill process on port 3000

```bash
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Option 2:** Use different port

```bash
PORT=3001 npm run dev
# Access at http://localhost:3001
```

### "Cannot write to `.env.local` - Permission Denied"

**Cause:** File permissions issue

**Solution:**

```bash
# macOS/Linux:
chmod 644 .env.local

# Windows (in PowerShell as Admin):
icacls .env.local /grant Everyone:F
```

### "Error: MONGODB_URI is not a valid string"

**Cause:** Connection string malformed

**Solution:**

1. Double-check connection string in `.env.local`
   - Should start with `mongodb://` or `mongodb+srv://`
   - Should NOT have angle brackets: `<username>` → replace with actual value
2. Verify no typos in username/password
3. Verify database name at end: `/fluentai`
4. Test in MongoDB Compass (paste URI there)

### "Black screen after login / Dashboard won't load"

**Cause:** Usually API connection issue

**Solution:**

1. Open browser **Developer Tools** (F12 or right-click → Inspect)
2. Go to **Console** tab
3. Look for red error messages
4. Check:
   - MongoDB is running
   - `.env.local` has all variables
   - No typos in connection strings

### "AI responses very slow or timing out"

**Cause:** Network issue or API overloaded

**Solution:**

- Check internet connection
- Restart dev server: `Ctrl+C` then `npm run dev`
- Check Google Cloud Console for API quota status
- Try a different prompt (some are slower)

### Still stuck?

1. **Check logs**: Look at full error message in terminal
2. **Check docs**: Review [README.md](./README.md) and [USER_GUIDE.md](./USER_GUIDE.md)
3. **Check code**: Search error message in `src/` files
4. **Ask for help**: Include full error message, terminal output, and steps to reproduce

---

## Deployment

### Vercel (Recommended - 5 minutes)

#### Pre-Deployment

1. Ensure code is on GitHub/GitLab/Bitbucket
2. All environment variables in `.env.local` are ready
3. Test locally: `npm run build && npm start`

#### Deploy Steps

1. Go to [Vercel](https://vercel.com)
2. Click **Import Project**
3. Select your Git repository
4. Click **Import**
5. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = `https://your-domain.vercel.app`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
6. Click **Deploy**

**URL:** Vercel generates: `https://your-project.vercel.app`

**Pros:** ✅ Zero config, ✅ Auto-scaling, ✅ Free tier good for hobby projects

### Docker (For Advanced Users)

```dockerfile
# Create Dockerfile in root
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build & run:

```bash
docker build -t fluentai .
docker run -p 3000:3000 --env-file .env.local fluentai
```

### Traditional VPS (DigitalOcean, Linode, AWS)

1. SSH into server
2. Install Node.js 18+: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
3. Clone repo: `git clone <your-repo>`
4. Install deps: `npm install`
5. Create `.env.local` with production variables
6. Build: `npm run build`
7. Use **PM2** to run persistently:
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name fluentai
   pm2 startup
   pm2 save
   ```
8. Set up **Nginx** as reverse proxy
9. Configure **SSL** with Let's Encrypt

---

## Production Checklist

Before going live:

- [ ] Change `NEXTAUTH_URL` to your domain (not localhost)
- [ ] Generate new, strong `NEXTAUTH_SECRET`
- [ ] MongoDB Atlas IP whitelist updated (not "Allow Anywhere")
- [ ] Verify all 4 environment variables are set
- [ ] Test registration, login, all features
- [ ] Enable HTTPS/SSL (required for production)
- [ ] Set up monitoring/error tracking (Sentry, LogRocket)
- [ ] Backup strategy for MongoDB
- [ ] Domain name configured
- [ ] Email notifications set up (optional)

---

## Next Steps

- **Local dev?** → Run `npm run dev` and explore in [USER_GUIDE.md](./USER_GUIDE.md)
- **Want to understand code?** → Read [FEATURES.md](./FEATURES.md)
- **Need to deploy?** → Follow Deployment section above
- **Having issues?** → Check Troubleshooting section

**Happy coding!** 🚀
