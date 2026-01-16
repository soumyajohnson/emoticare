# EmotiCare - AI Mental Health Assistant

A secure, bilingual (English/Hindi) voice-enabled mental health chatbot with **Real-Time Streaming**.

## Features
- **Voice Interaction:** Speak to the bot and hear responses.
- **Real-Time AI:** Responses stream character-by-character using **Google Gemini (gemini-2.5-flash)** via WebSockets.
- **Secure:** Production-grade authentication and encryption.
- **Privacy:** User data is encrypted at rest and can be deleted on demand.

## Security & Privacy Architecture (Threat Model)

### 1. Authentication
- **Method:** JWT (JSON Web Tokens) with expiration.
- **Storage:** Passwords are hashed using `bcrypt`.
- **Protection:** Rate limiting prevents brute-force attacks.

### 2. Data Storage & Encryption
- **Database:** MongoDB (NoSQL).
- **Encryption at Rest:** Envelope Encryption pattern.
  - Each message is encrypted with a unique **Data Key**.
  - Only encrypted blobs are stored.
- **No Plaintext Logging:** Logs are sanitized.

### 3. Streaming & Privacy
- **WebSockets:** Used for real-time communication (Socket.IO).
- **Transient Processing:** User text is processed in memory for the LLM stream and encrypted immediately for storage. No intermediate plaintext logs.

## Setup

### Prerequisites
- Python 3.9+
- MongoDB (running locally or cloud URI)
- Node.js (for frontend)
- **Google Cloud API Key** (for Gemini)

### 1. Backend Setup
1. Navigate to `server/`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment:
   - Copy `.env.example` to `.env`.
   - Update `MONGODB_HOST`.
   - Generate `ENCRYPTION_MASTER_KEY` (see below).
   - Set `GEMINI_API_KEY`.
   - Verify `GEMINI_MODEL=gemini-2.5-flash`.
4. Run the server:
   ```bash
   python run.py
   ```

### 2. Frontend Setup
1. Navigate to `client/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start React:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /auth/register`: Create account.
- `POST /auth/login`: Get JWT.
- `POST /conversations`: Create a new session.
- **WebSocket Events**:
  - `join_session`: Join a chat room.
  - `user_message`: Send text -> streams `assistant_token`.

## Key Generation
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

## License
MIT
