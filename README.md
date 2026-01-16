# Auralis — Privacy-First, Real-Time Voice AI Companion

**Auralis** is a production-grade, privacy-first, bilingual (English/Hindi) voice AI system built for real-time emotional support.  
It demonstrates how to design and operate **secure, low-latency, AI-powered systems** that handle sensitive user data responsibly.

This project focuses on **real-world engineering concerns**: streaming systems, authentication, encryption, privacy controls, and clean system architecture.

---

## Key Features

- **Audio-First Interaction**
  - Voice input (Speech-to-Text) and voice output (Text-to-Speech)
  - Accessibility-focused, hands-free experience

- **Real-Time AI Streaming**
  - Token-level streaming responses using **Google Gemini (`gemini-2.5-flash`)**
  - Low-latency delivery via **WebSockets (Socket.IO)**

- **Production-Grade Security**
  - JWT-based authentication with expiration
  - Password hashing using `bcrypt`
  - Rate-limited auth and chat endpoints

- **Privacy-First Data Handling**
  - End-to-end encrypted message storage
  - No plaintext logging
  - User-initiated data deletion

- **Conversation-Aware Architecture**
  - Per-user, multi-session conversation isolation
  - Real-time conversation switching with history

---

## High-Level Architecture

Browser (STT / TTS)
↓
React (Audio-First UI + WebSockets)
↓
Flask API + Socket.IO
↓
Gemini 2.5 Flash (Streaming)
↓
Encrypted Persistence (MongoDB)


---

## Security & Privacy Architecture (Threat-Aware Design)

Auralis is designed with the assumption that **mental-health data is highly sensitive PII**.

### 1. Authentication & Access Control
- **JWT-based authentication** with expiration
- **Passwords hashed** using `bcrypt`
- **Rate limiting** to prevent brute-force and abuse

### 2. Encrypted Data Storage
- **Database:** MongoDB
- **Encryption at Rest:** Envelope Encryption
  - Each message encrypted with a unique **Data Key**
  - Only encrypted blobs stored in the database
- **Key Management:**
  - Master encryption key provided via environment variables
  - Designed to be replaceable with a managed KMS

### 3. Real-Time Streaming with Privacy Guarantees
- **WebSockets** for low-latency token streaming
- User input processed **only in memory**
- Messages encrypted immediately after streaming
- **No plaintext persisted or logged**

### 4. User Privacy Controls
- Full **Delete-My-Data** capability
- Configurable **data retention policy**
- Sanitized audit logs (metadata only)

---

## Tech Stack

### Frontend
- React
- Web Speech API (STT + TTS)
- Socket.IO Client
- Modern, audio-first UI

### Backend
- Flask
- Flask-SocketIO
- JWT Authentication
- Rate Limiting
- Cryptography for encryption

### AI
- **Google Gemini API**
  - Model: `gemini-2.5-flash`
  - Streaming responses enabled

### Data
- MongoDB
- Encrypted message storage

---

## Setup & Run Locally

### Prerequisites
- Python 3.9+
- Node.js
- MongoDB (local or cloud)
- Google Gemini API Key

---

### Backend Setup

```bash
cd server
pip install -r requirements.txt
```
Set the following values:
```bash
MONGODB_HOST

GEMINI_API_KEY

GEMINI_MODEL=gemini-2.5-flash

ENCRYPTION_MASTER_KEY
```
Run the server:

```bash
python run.py
```

### Frontend Setup
```bash
cd client
npm install
npm start
```
---

### API & Real-Time Events
**REST Endpoints**
- POST /auth/register — Create account

- POST /auth/login — Authenticate user

- POST /conversations — Create new conversation

**WebSocket Events**
- join_session — Join conversation room

- user_message — Send message

- assistant_token — Streamed AI tokens

- assistant_done — Final response

### Encryption Key Generation
```bash
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```
---
### Why This Project Stands Out
**Auralis** is not a simple chatbot wrapper.

It demonstrates:

- Real-time system design with WebSockets

- Secure authentication and session management

- Encryption-first data architecture

- Privacy-aware AI integration

- Production-style backend and frontend separation

This project is intentionally built to reflect how sensitive AI systems should be engineered in real production environments.

### License
MIT
