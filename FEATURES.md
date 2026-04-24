# 🔧 Features Deep Dive

Technical documentation for developers and advanced users on how each feature works.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AI Chat Tutor](#ai-chat-tutor)
3. [Writing Analysis](#writing-analysis)
4. [Reading Practice](#reading-practice)
5. [Vocabulary Tracker](#vocabulary-tracker)
6. [Authentication & Security](#authentication--security)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Performance Optimizations](#performance-optimizations)
10. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  (React Components, Pages, Client-side Logic)           │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                 Next.js API Routes                       │
│  (Backend business logic, validation, routing)          │
└─────────────────────────────────────────────────────────┘
                     ↙               ↘
          ┌──────────────────┐   ┌──────────────────┐
          │   MongoDB        │   │  Google Gemini   │
          │   Database       │   │  AI API          │
          └──────────────────┘   └──────────────────┘
```

### Tech Stack

| Layer              | Technology                         | Purpose                                              |
| ------------------ | ---------------------------------- | ---------------------------------------------------- |
| **Frontend**       | Next.js 14, React 18, Tailwind CSS | UI, routing, forms                                   |
| **Backend**        | Node.js API Routes                 | Business logic, validation                           |
| **Authentication** | NextAuth.js + JWT                  | User sessions, password security                     |
| **Database**       | MongoDB + Mongoose                 | User data, chat history, submissions                 |
| **AI**             | Google Gemini 2.5 Flash            | Chat responses, writing analysis, content generation |
| **Security**       | bcryptjs, Zod validation           | Password hashing, input validation                   |

---

## 🗣️ AI Chat Tutor

### How It Works

```
User Types Message
       ↓
Server validates & saves to ChatSession
       ↓
Prepare system prompt (language, CEFR level)
       ↓
Send message + last 30 messages to Gemini API
       ↓
Stream response back to client
       ↓
Save assistant's response to ChatSession
       ↓
Client updates UI with streamed text
```

### System Prompt

The AI is instructed with a **context prompt** before each message. Example:

```
You are an English tutor helping a Spanish speaker at B1 level (Intermediate).
- Use vocabulary appropriate for B1: common verbs, simple idioms, clear structures
- When the user makes a grammar error, gently correct them with explanation
- Keep responses to 2-3 sentences max (don't overwhelm)
- If user uses Spanish, praise the effort but ask them to try English
- For questions, ask back to encourage conversation
```

**Prompt variables:**

- `nativeLanguage` - User's L1 (from profile)
- `level` - CEFR level A1-C2 (from profile)
- `messageCount` - Adapt length based on conversation history

### Rate Limiting

FluentAI uses a **5 requests per minute limit** for free Gemini tier:

**Implementation:**

```javascript
// src/lib/ai/service.ts
const rateLimiter = new Map(); // Track requests per user

async function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // Keep only requests from last 60 seconds
  const recent = userRequests.filter((t) => now - t < 60000);

  if (recent.length >= 5) {
    return false; // Rate limited
  }

  recent.push(now);
  rateLimiter.set(userId, recent);
  return true; // OK
}
```

If limit exceeded: **429 status code** returned with retry-after header.

### Message Storage

Each chat session stores messages as array:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: "Learning about hobbies",  // auto-generated from first message
  messages: [
    {
      role: "user",
      content: "I enjoy playing football",
      timestamp: 2026-04-24T10:30:00Z
    },
    {
      role: "assistant",
      content: "That's great! ...",
      timestamp: 2026-04-24T10:30:05Z
    }
  ],
  lastActive: 2026-04-24T10:30:05Z
}
```

**Limits:**

- Max 200 messages per session (oldest deleted when exceeded)
- Max 30 messages sent to AI (prevents token overflow)
- Messages indexed by `userId` for quick lookup

### Endpoint: `POST /api/chat`

**Request:**

```json
{
  "messages": [{ "role": "user", "content": "Hello!" }],
  "sessionId": "optional-session-id"
}
```

**Response:** HTTP 200 with streamed text

```
Hello! It's great to meet you. How are you doing today?
```

**Error Codes:**

- `401` - Not authenticated
- `429` - Rate limited (wait 1 minute)
- `503` - AI API unavailable

---

## ✍️ Writing Analysis

### How It Works

```
User submits text
       ↓
Validate text (not empty, < 5000 chars)
       ↓
Send to Gemini with structured output request
       ↓
Parse AI response (score, grammar, style feedback)
       ↓
Save WritingSubmission to MongoDB
       ↓
Update user's totalScore (average of all submissions)
       ↓
Return score + feedback to client
```

### Scoring Algorithm

AI generates score (0-100) based on:

| Aspect              | Weight |
| ------------------- | ------ |
| Grammar correctness | 40%    |
| Vocabulary variety  | 25%    |
| Sentence structure  | 20%    |
| Clarity & coherence | 15%    |

**Score interpretation:**

- **90-100**: Excellent (near-native)
- **70-89**: Good (few errors, clear communication)
- **50-69**: Fair (some grammar/vocab issues)
- **30-49**: Needs work (multiple errors affecting clarity)
- **0-29**: Very poor (heavy revision needed)

### Feedback Structure

AI returns structured feedback:

```json
{
  "score": 75,
  "feedback": {
    "grammar": [
      {
        "error": "I am learning since 5 years",
        "correction": "I have been learning for 5 years",
        "explanation": "Use present perfect for ongoing actions"
      }
    ],
    "style": [
      {
        "suggestion": "Use 'enjoy practicing' instead of 'enjoy to practice'",
        "reason": "enjoy + gerund (-ing), not infinitive"
      }
    ]
  }
}
```

### Data Storage

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  originalText: "I am learning english...",
  score: 75,
  feedback: {...},
  createdAt: 2026-04-24T10:30:00Z
  // No updates allowed - immutable record
}
```

**Why immutable?**

- Audit trail for learning progress
- Prevents cheating (can't erase bad scores)
- Historical data integrity

### Endpoint: `POST /api/writing`

**Request:**

```json
{
  "text": "I am happy because I learn english."
}
```

**Response:**

```json
{
  "score": 72,
  "feedback": {
    "grammar": [...],
    "style": [...]
  }
}
```

---

## 📖 Reading Practice

### Passage Generation

Two sources:

#### 1. Seed Passages (Pre-written)

Stored in MongoDB, created by admin:

```javascript
{
  _id: ObjectId,
  level: "B1",  // CEFR level
  title: "The Coffee Shop",
  content: "Every morning, Sarah visits her favorite coffee shop...",
  questions: [
    {
      text: "What does Sarah do every morning?",
      options: ["Visits a restaurant", "Visits a coffee shop", "Works", "Sleeps"],
      correctIndex: 1
    },
    // 2 more questions
  ]
}
```

#### 2. AI-Generated Passages

On-demand generation if seed passages exhausted:

```
User requests reading
       ↓
Check for unread seed passages at user's level
       ↓
If available: return seed passage
       ↓
If not available: prompt Gemini to generate
       ↓
AI generates: title, 150-400 words, 3 comprehension questions
       ↓
Return to user (not stored - ephemeral)
```

### CEFR Level Mapping

| Level  | Vocabulary            | Grammar                    | Word Count | Topics               |
| ------ | --------------------- | -------------------------- | ---------- | -------------------- |
| **A1** | 500 most common words | Present simple, basic past | 150-200    | Daily life, family   |
| **A2** | 1000-1500 words       | Past tense, simple future  | 200-250    | Travel, hobbies      |
| **B1** | 2000-2500 words       | Mixed tenses, conditionals | 250-350    | Culture, technology  |
| **B2** | 3500+ words           | Complex structures, idioms | 300-400    | Abstract topics      |
| **C1** | Advanced vocab        | Native-level complexity    | 350-400+   | Literature, nuance   |
| **C2** | Rare words, idioms    | Full range of expression   | 400+       | Philosophy, subtlety |

### Grading

```
User answers 3 questions
       ↓
Compare answers to correctIndex
       ↓
Calculate percentage correct
       ↓
Return results (questions, user answers, correct answers)
       ↓
Update user's vocabulary if words are unfamiliar
```

**No score impact** - reading is formative (for learning, not grading).

### Endpoint: `GET /api/reading`

**Query parameters:**

```
GET /api/reading?level=B1&generateIfEmpty=true
```

**Response:**

```json
{
  "passage": {
    "title": "The Coffee Shop",
    "content": "...",
    "questions": [...]
  }
}
```

### Endpoint: `POST /api/reading`

**Request:**

```json
{
  "passageId": "...",
  "answers": [1, 0, 2] // indices of selected options
}
```

**Response:**

```json
{
  "score": 67,
  "results": [
    {
      "question": "What does Sarah do?",
      "userAnswer": "Visits a restaurant",
      "correctAnswer": "Visits a coffee shop",
      "correct": false
    }
  ]
}
```

---

## 📚 Vocabulary Tracker

### Data Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  word: "eloquent",
  contextSentence: "The politician gave an eloquent speech.",
  translatedDefinition: "Expresivo, elocuente (Spanish)",
  createdAt: 2026-04-24T10:30:00Z
}
```

### Features

- **Quick Save**: From chat or reading, save unfamiliar words
- **Manual Entry**: Add words from outside the platform
- **Search**: Filter by word or definition
- **Delete**: Remove when mastered
- **Export** (future): Download as CSV/PDF

### Learning Strategy

**Spaced Repetition (SRS):**

- Day 1: Learn word
- Day 3: Review
- Week 1: Use in sentence
- Month 1: Master

(Not yet automated in app - user manages manually)

### Endpoints

**GET `/api/vocabulary`**

```json
// Response
[
  {
    "_id": "...",
    "word": "eloquent",
    "contextSentence": "...",
    "translatedDefinition": "..."
  }
]
```

**POST `/api/vocabulary`**

```json
// Request
{
  "word": "eloquent",
  "contextSentence": "...",
  "translatedDefinition": "..."
}

// Response - same structure
```

**DELETE `/api/vocabulary/{id}`**

```
DELETE /api/vocabulary/507f1f77bcf86cd799439011
// Response: 204 No Content
```

---

## 👤 Authentication & Security

### Flow

```
User Registration
       ↓
Validate email/password (Zod schema)
       ↓
Hash password with bcryptjs (10 salt rounds)
       ↓
Save to MongoDB
       ↓
User Login
       ↓
Validate credentials
       ↓
Create JWT session (NextAuth)
       ↓
Set secure HTTP-only cookie
       ↓
Redirect to dashboard
```

### Password Hashing

Using **bcryptjs** with 10 salt rounds:

```javascript
import bcryptjs from "bcryptjs";

const password = "UserPassword123";
const hashedPassword = await bcryptjs.hash(password, 10);
// stored in MongoDB

// On login:
const isValid = await bcryptjs.compare(inputPassword, hashedPassword);
```

**Why bcrypt?**

- ✅ Deliberately slow (prevents brute force)
- ✅ Includes salt (prevents rainbow tables)
- ✅ Industry standard
- ✅ Hard-coded cost of 10 rounds (~100ms per hash)

### JWT Sessions

NextAuth.js with JWT strategy:

```javascript
// Configured in [...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate against database
        // Return user object if valid
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

**Session lifespan:** 30 days

**HTTP-only cookie:**

- ✅ Secure (not accessible from JavaScript)
- ✅ Sent automatically on requests
- ✅ Protected against XSS

### Input Validation

Using **Zod** for schema validation:

```javascript
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
  displayName: z.string().min(2),
  nativeLanguage: z.enum(["Spanish", "French", "Chinese", ...])
});

// Usage in API:
const data = registerSchema.parse(request.body);
// Throws if invalid
```

**Validated fields:**

- Email format
- Password length (min 6)
- Display name (min 2 chars)
- CEFR level (A1-C2)
- Native language (known languages)

---

## Database Schema

### User

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String (bcrypt hash),
  displayName: String,
  nativeLanguage: String, // e.g., "Spanish"
  level: String, // CEFR: A1-C2, default B1
  totalScore: Number, // Aggregate from WritingSubmissions
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `email` (unique) - Fast login
- `_id` (default) - All queries

### ChatSession

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  title: String, // Auto-generated from first message
  messages: [
    {
      role: "user" | "assistant" | "system",
      content: String,
      timestamp: Date
    }
  ], // Max 200 messages
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Limits:**

- Max 200 messages (oldest deleted when exceeded)
- Only last 30 sent to AI (token optimization)

### WritingSubmission

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  originalText: String,
  score: Number, // 0-100
  feedback: {
    grammar: [
      {
        error: String,
        correction: String,
        explanation: String
      }
    ],
    style: [
      {
        suggestion: String,
        reason: String
      }
    ]
  },
  createdAt: Date
  // No updatedAt - immutable
}
```

**Immutable:** Once created, cannot be edited (audit trail).

### VocabularyEntry

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  word: String,
  contextSentence: String,
  translatedDefinition: String,
  createdAt: Date
  // No updatedAt - immutable by design
}
```

### ReadingPassage

```javascript
{
  _id: ObjectId,
  level: String, // A1-C2 (indexed),
  title: String,
  content: String, // 150-400 words
  questions: [
    {
      text: String,
      options: [String, String, String, String], // Always 4
      correctIndex: Number // 0-3
    }
  ], // Exactly 3 questions
  source: "seed" | "ai-generated",
  createdAt: Date
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint                  | Purpose                          |
| ------ | ------------------------- | -------------------------------- |
| `POST` | `/api/auth/register`      | Create new user account          |
| `POST` | `/api/auth/[...nextauth]` | NextAuth OAuth/credential routes |

### Chat

| Method | Endpoint    | Purpose                          |
| ------ | ----------- | -------------------------------- |
| `POST` | `/api/chat` | Send message, stream AI response |

### Writing

| Method | Endpoint       | Purpose                            |
| ------ | -------------- | ---------------------------------- |
| `POST` | `/api/writing` | Analyze text, get score & feedback |

### Reading

| Method | Endpoint            | Purpose                      |
| ------ | ------------------- | ---------------------------- |
| `GET`  | `/api/reading`      | Get passage for user's level |
| `POST` | `/api/reading`      | Grade user's answers         |
| `POST` | `/api/seed-reading` | Admin: seed initial passages |

### Vocabulary

| Method   | Endpoint               | Purpose                |
| -------- | ---------------------- | ---------------------- |
| `GET`    | `/api/vocabulary`      | List user's vocabulary |
| `POST`   | `/api/vocabulary`      | Add new word           |
| `DELETE` | `/api/vocabulary/{id}` | Delete word            |

### User

| Method  | Endpoint    | Purpose          |
| ------- | ----------- | ---------------- |
| `GET`   | `/api/user` | Get user profile |
| `PATCH` | `/api/user` | Update settings  |

---

## Performance Optimizations

### Database

**Indexing:**

```javascript
// Fast user lookups by ID
db.users.createIndex({ _id: 1 });

// Fast session retrieval
db.chatSessions.createIndex({ userId: 1 });

// Fast writing lookup by user
db.writingSubmissions.createIndex({ userId: 1 });

// Fast vocabulary search
db.vocabularyEntries.createIndex({ userId: 1 });

// Fast reading passage by level
db.readingPassages.createIndex({ level: 1 });
```

**Lean Queries:**

```javascript
// For read-only operations
const sessions = await ChatSession.find({ userId })
  .lean() // Return plain objects, not Documents
  .sort({ lastActive: -1 });
```

### Caching

**Message History Limit:**

- Only last 30 messages sent to AI (token optimization)
- Reduces API costs by 50%+
- User still sees full conversation history

**Session Limiting:**

- Max 200 messages per session
- Prevents unbounded database growth
- Oldest messages deleted automatically

### API Streaming

**Chat streaming:**

```javascript
// Vercel AI SDK streams response as it arrives
const { text } = await generateText({...});
// Sent to client immediately, not buffered
```

**Benefits:**

- Lower perceived latency
- User sees typing in real-time
- Can cancel mid-stream

### Code Optimization

**Middleware route protection:**

```javascript
// Checked before reaching /dashboard routes
// Faster than per-route checks
export async function middleware(request) {
  const token = await getToken({ req: request });
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

---

## Future Enhancements

### Planned Features

- [ ] **Spaced Repetition (SRS)** - Auto-schedule vocabulary reviews
- [ ] **Listening Practice** - AI-generated audio lessons
- [ ] **Pronunciation Scoring** - Speech-to-text with feedback
- [ ] **Progress Analytics** - Charts, streak tracking, milestones
- [ ] **Collaborative Learning** - Peer review, leaderboards
- [ ] **Mobile App** - React Native for iOS/Android
- [ ] **Offline Mode** - Download lessons, sync when online
- [ ] **Export Data** - PDF reports, CSV downloads
- [ ] **Text-to-Speech** - Natural voice for reading passages
- [ ] **Custom Lessons** - Upload your own reading materials

### Performance Roadmap

- [ ] **Caching layer** - Redis for frequently accessed data
- [ ] **Image optimization** - WebP, lazy loading
- [ ] **Database sharding** - For millions of users
- [ ] **CDN** - Global content delivery
- [ ] **GraphQL** - Alternative to REST API (lower bandwidth)

### AI Roadmap

- [ ] **Multiple AI models** - Switch between Gemini, GPT-4, etc.
- [ ] **Fine-tuning** - Customize AI for specific dialects
- [ ] **Embedding-based search** - Better vocabulary recommendations
- [ ] **Sentiment analysis** - Track mood/motivation trends

---

## Debugging Tips

### Enable Logging

```javascript
// Add to .env.local
DEBUG=fluentai:*

// Then in code:
import debug from 'debug';
const logger = debug('fluentai:chat');

logger('Message received:', messageContent);
```

### Check API Responses

```javascript
// Browser DevTools → Network tab
// Click on API request
// See request body & response
```

### MongoDB Compass

Connect to local or cloud MongoDB:

```
mongodb://localhost:27017/fluentai
// or
mongodb+srv://user:pass@cluster.mongodb.net/fluentai
```

View, search, edit documents directly.

### Vercel Analytics

```javascript
// Already integrated in Next.js
// Dashboard shows: pageviews, slowest pages, errors
```

---

## Contributing

To add new features:

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write tests for new code
3. Update FEATURES.md with implementation details
4. Submit PR with description

---

**End of Features documentation. Questions?** Check [INSTALLATION.md](./INSTALLATION.md) or [USER_GUIDE.md](./USER_GUIDE.md).
