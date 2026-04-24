# 🌟 FluentAI - Master English with AI

Welcome to **FluentAI**, an intelligent English language learning platform powered by AI. Whether you're a beginner (A1) or advanced (C2), FluentAI adapts to your proficiency level and helps you practice reading, writing, speaking, and vocabulary in an engaging, interactive way.

---

## ✨ Key Features

### 🗣️ **AI Chat Tutor**

Practice real-time conversations with an AI tutor who:

- Provides personalized grammar corrections
- Adapts to your proficiency level (CEFR A1-C2)
- Understands your native language for better feedback
- Maintains conversation history for continuity

### ✍️ **Writing Analysis**

Submit any English text and get:

- **Scoring** (0-100 scale)
- **Grammar feedback** with specific corrections
- **Style suggestions** for clarity and tone
- **Automatic score tracking** on your profile

### 📖 **Reading Practice**

- Passages matched to your CEFR level (A1-C2)
- **3 comprehension questions** per passage
- Auto-grading to test understanding
- Difficulty increases as you progress

### 📚 **Vocabulary Tracker**

- Save words you learn with context
- Store translations in your native language
- Build your personal vocabulary bank
- Track learning progress

### 👤 **User Profile & Dashboard**

- **View your progress**: Total score, vocabulary count, chat history
- **Customize settings**: Native language, proficiency level
- **Quick access** to all learning tools
- **Personalized learning** experience

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download here](https://nodejs.org))
- **MongoDB** account (free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google Gemini API key** (free at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation (5 minutes)

1. **Clone & Install:**

   ```bash
   git clone <your-repo>
   cd <your-repo>
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/fluentai"

   # Authentication (generate a random 32-char string)
   NEXTAUTH_SECRET="your-random-secret-key-here-min-32-chars"
   NEXTAUTH_URL="http://localhost:3000"

   # AI API Key
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   ```

   👉 **Need help?** See [INSTALLATION.md](./INSTALLATION.md) for detailed setup instructions.

3. **Start the app:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Create an account:**
   - Click **Register**
   - Enter email, password, name, and native language
   - Click **Login** with your credentials
   - Start learning! 🎉

---

## 📚 User Guide

Ready to start learning? Check out the **[USER_GUIDE.md](./USER_GUIDE.md)** for:

- Step-by-step feature walkthroughs
- Tips for effective language learning
- CEFR proficiency level explanations
- Best practices for each tool

---

## 🛠️ For Developers

### Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React UI components
├── lib/             # Business logic (AI, auth, database)
├── models/          # MongoDB schemas
└── types/           # TypeScript definitions
```

### Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js API routes, MongoDB, NextAuth.js
- **AI**: Google Gemini 2.5 Flash (via Vercel AI SDK)
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript

### Development Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Check code quality
```

### Environment Setup

Full setup guide with troubleshooting → **[INSTALLATION.md](./INSTALLATION.md)**

### Deep Dive

For architecture details and feature specifics → **[FEATURES.md](./FEATURES.md)**

---

## 📊 Supported Proficiency Levels

FluentAI supports all **CEFR levels**:

| Level  | Description                              |
| ------ | ---------------------------------------- |
| **A1** | Beginner - Basic survival phrases        |
| **A2** | Elementary - Simple conversations        |
| **B1** | Intermediate - Fluent in familiar topics |
| **B2** | Upper-Intermediate - Independent user    |
| **C1** | Advanced - Complex ideas and nuances     |
| **C2** | Mastery - Native-like proficiency        |

---

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy with one click!

### Self-Hosted

See [INSTALLATION.md](./INSTALLATION.md) for Docker, VPS, or traditional server setup.

---

## 🐛 Troubleshooting

**Can't connect to MongoDB?**

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes your IP
- See [INSTALLATION.md](./INSTALLATION.md) for detailed steps

**AI features not working?**

- Confirm `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Check API quota hasn't been exceeded
- Free tier has 5 requests/minute limit

**Still stuck?**

- Check browser console for error messages
- Review server logs: `npm run dev` shows all output
- See [INSTALLATION.md](./INSTALLATION.md) troubleshooting section

---

## 📝 License

[Add your license here - MIT is recommended for open source]

---

## 🤝 Contributing

We'd love your contributions! Whether it's bug reports, feature suggestions, or code improvements:

1. Open an issue describing the problem/feature
2. Fork the repo and create a feature branch
3. Submit a pull request with a clear description

---

## 📞 Support

- **Found a bug?** → Open a GitHub Issue
- **Have a question?** → Check [USER_GUIDE.md](./USER_GUIDE.md) or [INSTALLATION.md](./INSTALLATION.md)
- **Want to help?** → See Contributing section above

---

**Happy learning with FluentAI!** 🚀✨
