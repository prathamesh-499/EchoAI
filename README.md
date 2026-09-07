# EchoAI 🤖💬

> A full-stack, real-time AI conversational platform with multi-model LLM support, streaming responses, persistent conversation history, automated chat titles, authentication, and API quota protection.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646C9F?logo=vite\&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express\&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs\&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.6-47A248?logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google\&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq-F05032?logo=groq\&logoColor=white)](https://groq.com/)

---

## 📖 Table of Contents

* [Overview](#-overview)
* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Architecture](#-architecture)
* [Project Structure](#-project-structure)
* [Prerequisites](#-prerequisites)
* [Environment Variables](#-environment-variables)
* [Installation](#-installation)
* [API Reference](#-api-reference)
* [Quota & Rate Limiting](#-quota--rate-limiting)
* [Authentication & Security](#-authentication--security)
* [How It Works](#-how-it-works)
* [Future Improvements](#-future-improvements)
* [License](#-license)

---

## 🎯 Overview

**EchoAI** is a full-stack AI chat application designed around a modern conversational workflow.

Instead of relying on a single AI provider, EchoAI supports multiple LLM providers and allows users to switch models directly from the chat interface.

The application combines:

* Multi-provider LLM integration
* Real-time Server-Sent Events (SSE) streaming
* Persistent conversations using MongoDB
* JWT-based authentication
* Automatic conversation title generation
* Model-specific quota protection
* Markdown and syntax-highlighted code rendering
* Responsive dark-mode UI

---

## ✨ Features

### 🤖 Multi-Model AI

Switch between different AI providers directly from the chat interface.

| Provider      | Model                   | Usage               |
| ------------- | ----------------------- | ------------------- |
| Google Gemini | `gemini-3.8-flash`      | Chat generation     |
| Groq          | `openai/gpt-oss-120b`   | Chat generation     |
| Google Gemini | `gemini-3.1-flash-lite` | Conversation titles |

---

### ⚡ Real-Time Streaming

AI responses are streamed to the client using **Server-Sent Events (SSE)** rather than waiting for the entire response.

This provides a more responsive, ChatGPT-like experience.

```text
User Prompt
     │
     ▼
Express API
     │
     ▼
AI Provider
     │
     │  Streaming tokens
     ▼
SSE Connection
     │
     ▼
React Chat UI
```

---

### 🛑 Stop Generation

Users can cancel an active AI generation.

The frontend uses `AbortController` to terminate the request, while the server handles connection termination.

---

### 📝 Automatic Conversation Titles

When a new conversation starts, EchoAI uses a lightweight Gemini model to automatically generate a concise title based on the initial prompt.

Example:

```text
User:
"Explain how JWT refresh tokens work"

Generated title:
"JWT Refresh Tokens"
```

---

### 💬 Conversation Management

Users can:

* Create conversations
* Switch between conversations
* View persistent chat history
* Rename conversations
* Delete conversations

Conversation changes are reflected immediately in the sidebar.

---

### 🔐 Authentication

EchoAI uses a dual-token JWT authentication system:

* Short-lived access token
* Long-lived refresh token
* HTTP-only cookies
* Automatic token refresh after authentication expiry

This avoids storing authentication tokens in browser-accessible JavaScript storage.

---

### 🧑‍💻 Markdown & Code Rendering

AI responses support:

* Markdown
* Syntax highlighting
* Code blocks
* One-click code copying

Powered by:

* `react-markdown`
* `react-syntax-highlighter`

---

### 📊 API Quota Protection

EchoAI includes an in-memory quota middleware that tracks:

* RPM — Requests Per Minute
* RPD — Requests Per Day
* TPM — Tokens Per Minute
* TPD — Tokens Per Day

When a configured limit is exceeded, the server responds with:

```http
429 Too Many Requests
```

---

### 🌙 Responsive Dark UI

The client includes:

* Dark-mode interface
* Responsive layout
* Collapsible mobile sidebar
* Auto-resizing chat input
* Toast notifications

---

## 🛠 Tech Stack

### Frontend

| Technology               | Purpose                      |
| ------------------------ | ---------------------------- |
| React 19                 | UI framework                 |
| Vite 8                   | Build tool                   |
| React Router DOM 7       | Client-side routing          |
| Bootstrap 5              | UI styling                   |
| Custom CSS               | Application-specific styling |
| Lucide React             | Icons                        |
| React Markdown           | Markdown rendering           |
| React Syntax Highlighter | Code highlighting            |
| React Hot Toast          | Notifications                |

### Backend

| Technology     | Purpose               |
| -------------- | --------------------- |
| Node.js 22     | Runtime               |
| Express 5      | REST API              |
| MongoDB        | Database              |
| Mongoose 9     | ODM                   |
| JSON Web Token | Authentication        |
| bcrypt         | Password hashing      |
| cookie-parser  | Cookie handling       |
| CORS           | Cross-origin requests |

### AI

| Technology         | Purpose                |
| ------------------ | ---------------------- |
| Google GenAI SDK   | Gemini integration     |
| Groq SDK           | Groq integration       |
| Server-Sent Events | Streaming AI responses |

---

## 🏗 Architecture

EchoAI follows a client-server architecture:

```text
                    ┌──────────────────┐
                    │     React UI     │
                    │     Vite 8       │
                    └────────┬─────────┘
                             │
                    HTTP / SSE Requests
                             │
                             ▼
                    ┌──────────────────┐
                    │  Express Server  │
                    │     Node.js      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        Authentication   AI Services     MongoDB
              │              │              │
              │        ┌─────┴─────┐        │
              │        ▼           ▼        │
              │     Gemini        Groq      │
              │        │           │        │
              └────────┴───────────┴────────┘
```

### Request Flow

```text
React
  │
  │ POST /conversation
  ▼
Express Route
  │
  ├── JWT Verification
  │
  ├── Quota Check
  │
  └── AI Service Router
          │
          ├── Gemini
          │
          └── Groq
                 │
                 ▼
             SSE Stream
                 │
                 ▼
             React UI
```

---

## 📂 Project Structure

```text
EchoAI/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Chats.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── styles/
│   │   │   ├── auth.css
│   │   │   ├── chat.css
│   │   │   ├── chats.css
│   │   │   ├── home.css
│   │   │   ├── navbar.css
│   │   │   └── sidebar.css
│   │   │
│   │   ├── main.jsx
│   │   └── index.html
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   │
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── login.controllers.js
│   │   ├── logout.controllers.js
│   │   ├── refreshToken.controllers.js
│   │   ├── signup.controllers.js
│   │   ├── conversation.controllers.js
│   │   ├── showChats.controllers.js
│   │   ├── renameConversationTitle.controllers.js
│   │   └── deleteConversation.controllers.js
│   │
│   ├── middleware/
│   │   ├── asyncWrapper.js
│   │   ├── quotaLimit.js
│   │   └── verifyJwt.js
│   │
│   ├── models/
│   │   ├── user.js
│   │   ├── conversation.js
│   │   └── chat.js
│   │
│   ├── routes/
│   │   ├── auth/
│   │   │   └── signup.routes.js
│   │   └── index/
│   │       └── chat.routes.js
│   │
│   ├── services/
│   │   ├── chatAi.js
│   │   ├── geminiApi.js
│   │   ├── geminiApiGetTitle.js
│   │   └── groqApi.js
│   │
│   ├── util/
│   │   ├── ApiError.js
│   │   └── generateAccessAndRefreshToken.js
│   │
│   ├── app.js
│   └── package.json
│
└── README.md
```

---

## 📋 Prerequisites

Before running EchoAI locally, make sure you have:

* **Node.js 22.x**
* **npm**
* **MongoDB**
* A **Google Gemini API key**
* A **Groq API key**

Verify Node.js:

```bash
node --version
```

Verify npm:

```bash
npm --version
```

---

## 🔑 Environment Variables

Create the required environment configuration files in the appropriate server/client directories.

### Server

Example:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

> **Never commit API keys, database credentials, or JWT secrets to Git.**

Add environment files to `.gitignore`:

```gitignore
.env
.env.*
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/prathamesh-499/EchoAI.git
cd EchoAI
```

---

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

Configure your server environment variables, then start the development server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

---

### 3. Install Frontend Dependencies

Open a second terminal:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## 📡 API Reference

### Authentication

Base path:

```text
/auth
```

| Method | Endpoint             | Description                                | Authentication |
| ------ | -------------------- | ------------------------------------------ | -------------- |
| `POST` | `/auth/signup`       | Create a new account                       | Public         |
| `POST` | `/auth/login`        | Authenticate user                          | Public         |
| `POST` | `/auth/logout`       | Clear session and invalidate refresh token | JWT Cookie     |
| `GET`  | `/auth/me`           | Get current user details                   | JWT Cookie     |
| `GET`  | `/auth/refreshToken` | Issue a new access/refresh token pair      | Refresh Cookie |

---

### Conversations

| Method   | Endpoint                   | Description                        | Authentication |
| -------- | -------------------------- | ---------------------------------- | -------------- |
| `POST`   | `/conversation`            | Send prompt and stream AI response | JWT Cookie     |
| `GET`    | `/conversation`            | Get user's conversations           | JWT Cookie     |
| `GET`    | `/conversation/:id`        | Get conversation history           | JWT Cookie     |
| `POST`   | `/conversation/:id/rename` | Rename conversation                | JWT Cookie     |
| `DELETE` | `/conversation/:id`        | Delete conversation                | JWT Cookie     |

### Rename Request

```json
{
  "renameValue": "My AI Conversation"
}
```

---

## 📊 Quota & Rate Limiting

EchoAI maintains model-specific usage counters in:

```text
server/middleware/quotaLimit.js
```

Current configured limits:

| Model / Service       | Purpose          | RPM | RPD |     TPM |     TPD |
| --------------------- | ---------------- | --: | --: | ------: | ------: |
| Gemini 3.8 Flash      | Chat generation  |   4 |  17 | 200,000 |       — |
| Gemini 3.1 Flash Lite | Title generation |  10 | 490 | 170,000 |       — |
| Groq `gpt-oss-120b`   | Chat generation  |  25 | 800 |   7,000 | 150,000 |

Where:

* **RPM** = Requests Per Minute
* **RPD** = Requests Per Day
* **TPM** = Tokens Per Minute
* **TPD** = Tokens Per Day

When a configured threshold is exceeded, the server returns:

```http
429 Too Many Requests
```

with a descriptive warning.

> These limits are application-level controls intended to protect external API quotas. They are not a replacement for provider-side rate limiting.

---

## 🛡 Authentication & Security

### Password Protection

User passwords are hashed using **bcrypt** with:

```text
saltRounds = 10
```

Passwords are never stored in plaintext.

### Dual JWT Token System

EchoAI uses two HTTP-only cookies:

```text
accessToken
└── Short-lived
└── 30 minutes
└── Path: /

refreshToken
└── Long-lived
└── 30 days
└── Path: /auth/refreshToken
```

### Cookie Configuration

In production:

```text
secure: true
sameSite: "none"
```

In development:

```text
sameSite: "lax"
```

### Resource Ownership

Conversation access is verified against the authenticated user.

A user attempting to access another user's conversation receives:

```http
403 Forbidden
```

---

## 🔄 How It Works

### Sending a Message

```text
1. User enters a prompt
          ↓
2. React sends request to /conversation
          ↓
3. JWT authentication is verified
          ↓
4. Quota middleware checks provider limits
          ↓
5. AI router selects Gemini or Groq
          ↓
6. AI response is streamed using SSE
          ↓
7. React renders tokens as they arrive
          ↓
8. Conversation is persisted in MongoDB
```

### New Conversation

```text
First User Prompt
       ↓
Create Conversation
       ↓
Generate AI Response
       ↓
Generate Conversation Title
       ↓
Store Conversation
       ↓
Display in Sidebar
```

---

## 🔮 Future Improvements

Potential improvements for future versions include:

* [ ] Redis-based distributed rate limiting
* [ ] Persistent quota tracking
* [ ] Streaming retry and reconnection support
* [ ] Message regeneration
* [ ] Conversation search
* [ ] File and image attachments
* [ ] Multimodal model support
* [ ] AI model performance comparison
* [ ] Production deployment
* [ ] Automated testing
* [ ] API documentation with OpenAPI/Swagger
* [ ] Observability and structured logging

---

## 👨‍💻 Author

**Prathamesh**

GitHub:
https://github.com/prathamesh-499
