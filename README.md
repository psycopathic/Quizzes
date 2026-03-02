# 🎙️ Voice-Controlled Quiz App

An interactive quiz application with **fully offline voice control** that works across all major browsers — Firefox, Chrome, Brave, and Edge. Answer quiz questions hands-free using voice commands powered by [Vosk](https://alphacephei.com/vosk/) speech recognition running entirely in your browser via WebAssembly.

---

## ✨ Features

- **🎤 Voice Control** — Start the quiz, select options, and navigate using your voice
- **🦊 Cross-Browser** — Works in Firefox, Chrome, Brave, and Edge (no Web Speech API dependency)
- **📡 Fully Offline** — Speech recognition runs locally in the browser via WASM (after initial model download)
- **🆓 Zero Cost** — No API keys, no cloud services, no subscriptions
- **⌨️ Keyboard Shortcuts** — Full keyboard navigation as alternative/complement to voice
- **📱 Responsive** — Works on desktop, tablet, and mobile
- **🧠 30 Questions** — Covers Physics, Math, Chemistry, Biology, CS, Geopolitics, Space, and Economics

---

## 🗣️ Voice Commands

| Screen | Say | Action |
|--------|-----|--------|
| Start | "start", "begin", "go" | Start the quiz |
| Quiz | "one", "two", "three", "four" | Select option |
| Quiz | "option one", "option a" | Select option |
| Quiz | "next", "save" | Next question |
| Quiz | "reset", "clear" | Clear selection |
| Quiz | "exit", "quit" | Exit quiz |
| Result | "play again", "restart" | Restart quiz |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Speech Recognition** | [vosk-browser](https://github.com/niclasgriffel/vosk-browser) (Vosk WASM) |
| **Voice Model** | [vosk-model-small-en-us-0.15](https://alphacephei.com/vosk/models) (~40MB) |
| **Build Tool** | Vite |

### How Voice Control Works

```
Microphone → getUserMedia → AudioContext → vosk-browser (WASM + Web Worker) → Command Parser → Quiz Actions
```

- No backend server needed
- No external API calls
- Speech recognition runs 100% in the browser

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- A modern browser (Firefox, Chrome, Brave, or Edge)
- A microphone

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Quizzes

# Install dependencies
npm install
```

### Download the Vosk Model

The speech recognition model (~40MB) needs to be placed in the `public/models/` directory:

```bash
# Download and prepare the model
mkdir -p public/models
curl -L -o /tmp/vosk-model.zip https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip /tmp/vosk-model.zip -d /tmp/vosk-temp/
cd /tmp/vosk-temp && mv vosk-model-small-en-us-0.15 model
tar czf <path-to-project>/public/models/vosk-model-small-en-us.tar.gz model
```

> **Note:** If the model file already exists in `public/models/vosk-model-small-en-us.tar.gz`, you can skip this step.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Click the 🎤 mic button → allow microphone access → wait for model to load (first time only) → speak commands!

---

## 📦 Deployment (Render)

Deploy as a **Static Site** on [Render](https://render.com):

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

No environment variables needed. No backend server required.

> **Note:** The 40MB Vosk model in `public/models/` must be included in your repository or build step.

---

## 📁 Project Structure

```
Quizzes/
├── public/
│   └── models/
│       └── vosk-model-small-en-us.tar.gz   # Vosk speech model
├── src/
│   ├── components/
│   │   ├── Start.jsx          # Start screen
│   │   ├── Quiz.jsx           # Quiz questions
│   │   ├── Box.jsx            # Answer options
│   │   ├── Result.jsx         # Result screen
│   │   └── VoiceMic.jsx       # Mic button & status UI
│   ├── context/
│   │   ├── QuizHolder.jsx     # Quiz state & questions
│   │   └── VoiceContext.jsx   # Voice control (Vosk WASM)
│   ├── utils/
│   │   └── commandParser.js   # Fuzzy voice command matching
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 📄 License

MIT
