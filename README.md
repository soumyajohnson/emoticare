
# EmotiCare: AI-Powered Emotional Support System

EmotiCare is an AI-powered web application that provides real-time voice-based emotional support. Designed with accessibility in mind, it enables personalized, empathetic conversations and is especially tailored for visually impaired users.

Mental health is a growing concern, particularly for those lacking consistent support. EmotiCare bridges the gap by combining AI-driven emotional feedback with an intuitive voice interface that is accessible to all.

## Tech Stack

- **Frontend:** React.js (`client/`)
- **Backend:** Flask (Python, in `server/`)
- **AI Modules:** Custom GPT integration for emotional analysis

## Project Structure

```
emoticare/
├── client/                  # React frontend
│   ├── node_modules/
│   ├── public/
│   │   └── index.html
│   ├── src/                 # React source files
│   ├── package.json
│   └── package-lock.json
├── server/                  # Flask backend
│   ├── ai_modules/
│   │   ├── gpt_helper.py
│   │   └── sentiment.py
│   ├── app.py
│   └── requirements.txt
├── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/soumyajohnson/emoticare.git
cd emoticare
```

### 2. Backend Setup (Flask)

```bash
cd server
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup (React)

Open a new terminal window:

```bash
cd client
npm install
npm start
```

Your frontend will run at [http://localhost:3000](http://localhost:3000) and will connect to the Flask backend.

## Features

- Real-time voice interaction
- Personalized emotional feedback using GPT
- Sentiment analysis with NLP
- Accessibility-first design for visually impaired users

## License

This project is licensed under the MIT License.

## Contact

For questions or collaborations, please reach out via GitHub or email the authors.
