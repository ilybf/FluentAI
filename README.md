# FluentAI - English Learning Platform

FluentAI is an AI-powered English learning platform that helps users practice reading, perfect their writing, and chat with an AI language tutor to gain confidence. 

## Features

- **AI Chat Tutor**: Practice real-world conversations and get precise grammar corrections.
- **Writing Analysis**: Submit text for professional grading, grammar checks, and style suggestions.
- **Smart Reading**: Access reading passages appropriate for your CEFR level.

## Prerequisites

- Node.js 18+ (or 20+)
- MongoDB (running locally or a remote MongoDB URI)

## Environment Configuration

Create a `.env.local` file in the root of the project with the following required variables:

```env
# MongoDB Database Connection
MONGODB_URI="mongodb://localhost:27017/fluentai"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-for-jwt"
NEXTAUTH_URL="http://localhost:3000"

# AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. **Open the Application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## Deployment

To deploy this project to Vercel, ensure you configure all the environment variables from `.env.local` in your Vercel project settings, then push to a connected repository or use the Vercel CLI.
