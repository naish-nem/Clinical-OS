
</div>

# Clinical-OS: AI-Powered Ambient Clinical Intelligence

> **Real-time clinical decision support** — Ambient scribe with live diagnostic suggestions, smart order sets, and evidence-based recommendations.

## 🎯 The Problem

Clinicians spend **2+ hours daily** on documentation. This administrative burden:
- Reduces face time with patients
- Contributes to burnout (>50% of physicians)
- Delays care and increases errors

## 💡 The Solution

Clinical-OS is an ambient clinical scribe that listens to patient encounters and provides **real-time clinical intelligence** — diagnostic suggestions, smart order recommendations, and evidence-based insights.

---

## ✨ Key Features

### 1. Ambient Scribe
- **Multi-speaker diarization** — Distinguishes patient, clinician, and system
- **Real-time transcription** — Powered by Gemini Live API
- **Clinical context extraction** — Automatically identifies symptoms, medications, diagnoses

### 2. AI Decision Support
Real-time suggestions as the conversation unfolds:
- 🩺 **Possible Diagnoses** with confidence levels
- ❓ **Recommended Questions** to ask the patient
- 🧪 **Suggested Labs & Tests** with clinical rationale
- 💊 **Potential Treatments** based on context

### 3. Smart Order Sets
One-click ordering with clinical intelligence:
- **Priority badges** — STAT, Urgent, Routine
- **Clinical rationale** — AI explains why each order is suggested
- **Order types** — Labs, Medications, Imaging, Referrals, Procedures

### 4. Safety Layer
- 🔴 **Red Flag Detector** — Chest pain, neuro deficits, suicidal ideation
- 💊 **Allergy Alerts** — Checks against documented allergies
- ✋ **Human-in-the-loop** — All suggestions require clinician review

### 5. Visual Analysis
- **Camera integration** — Capture and analyze visible symptoms
- **AI-powered assessment** — Skin conditions, wounds, physical findings

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/naish-nem/Clinical-OS.git
cd Clinical-OS

# Install dependencies
npm install

# Set your Gemini API key
echo "API_KEY=your_key_here" > .env.local

# Run development server
npm run dev
```

### Demo Mode
Click the **🧪 Demo** button to load a sample clinical scenario without requiring microphone access.

---

## 📁 Project Structure

```
health-assist-ai-v1.1/
├── App.tsx                     # Main application
├── components/
│   ├── ConsultationView.tsx    # Main encounter view
│   ├── AiSuggestionsPanel.tsx  # Real-time insights
│   ├── OrderSetsPanel.tsx      # Smart order recommendations
│   ├── TranscriptionPanel.tsx  # Clinical transcript
│   ├── PatientInfoPanel.tsx    # Patient context
│   └── SafetyPanel.tsx         # Safety controls
├── services/
│   ├── geminiService.ts        # AI generation
│   └── groundingService.ts     # Medical API integrations
├── hooks/
│   ├── useLiveSession.ts       # WebSocket transcription
│   └── usePatientMemory.ts     # localStorage persistence
└── types.ts                    # Type definitions
```

---

## 🛠 Technology Stack

- **Frontend**: React + TypeScript + Vite
- **AI**: Google Gemini API (Live + Text)
- **Styling**: Tailwind-inspired utility CSS
- **Medical APIs**: PubMed, OpenFDA, RxNorm, ICD-10

---

## 📊 Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v0 | Ambient transcription + basic suggestions | ✅ Complete |
| v1 | Smart Order Sets + Decision Support | ✅ Complete |
| v1.1 | Demo mode + Visual polish | ✅ Complete |
| v2 | EHR Integration (Epic/Cerner) | 🔮 Planned |
| v2.1 | Real-time drug interaction checks | 🔮 Planned |

---

## ⚖️ Disclaimers

- **Not for production clinical use** — This is a prototype for demonstration
- **Mock data only** — All patient data is synthetic
- **No PHI** — No real patient information is stored or transmitted
- **Human-in-the-loop required** — AI suggestions require clinician review

---

## 📄 License

GNU Affero General Public License v3.0
