# EmotiCare - AI Mental Health Assistant

A secure, bilingual (English/Hindi) voice-enabled mental health chatbot.

## Features
- **Voice Interaction:** Speak to the bot and hear responses.
- **Empathetic AI:** Powered by **Google Gemini (gemini-2.5-flash)** for high-quality, privacy-conscious responses.
- **Secure:** Production-grade authentication and encryption.
- **Privacy:** User data is encrypted at rest and can be deleted on demand.

## Security & Privacy Architecture (Threat Model)

### 1. Authentication
- **Method:** JWT (JSON Web Tokens) with expiration.
- **Storage:** Passwords are hashed using `bcrypt` (work factor 12+).
- **Protection:** Rate limiting prevents brute-force attacks.

### 2. Data Storage & Encryption
- **Database:** MongoDB (NoSQL) stores structured conversation data.
- **Encryption at Rest:** Envelope Encryption pattern.
  - Each message is encrypted with a unique **Data Key (DK)** (Fernet/AES-128-CBC).
  - The DK is encrypted with a **Master Key (MK)** stored in the environment.
  - Only encrypted blobs are stored in the database.
- **No Plaintext Logging:** Logging is sanitized to exclude user message content.

### 3. Privacy Controls
- **Retention:** Messages have a TTL (Time-To-Live) index for auto-deletion (default 30 days).
- **Right to be Forgotten:** `/privacy/delete-my-data` endpoint permanently removes all user records.
- **Audit Logs:** Sensitive actions (Login, Register, Delete Data) are logged for security audits.

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
   - **Important:** Generate an encryption master key:
     ```python
     from cryptography.fernet import Fernet
     print(Fernet.generate_key().decode())
     ```
     Paste this value into `.env` as `ENCRYPTION_MASTER_KEY`.
   - Set your `GEMINI_API_KEY` (Get one from [Google AI Studio](https://aistudio.google.com/)).
4. Run the server:
   ```bash
   python run.py
   ```

### 2. Frontend Setup
1. Navigate to `client/`.
2. Install dependencies: `npm install`.
3. Start React: `npm start`.

## API Endpoints

- `POST /auth/register`: Create account.
- `POST /auth/login`: Get JWT.
- `POST /chat`: Send encrypted message, get encrypted reply (via Gemini).
- `DELETE /privacy/delete-my-data`: Wipe data.

## License
MIT