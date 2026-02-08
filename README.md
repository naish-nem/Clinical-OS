<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Clinical-OS: AI-Powered Ambient Clinical Intelligence

> **Generate a Signable Encounter Packet in 60 Seconds** — SOAP notes, problem list, orders draft, patient instructions, and follow-ups with full provenance tracking.

## 🎯 The Problem

Clinicians spend **2+ hours daily** on documentation. This administrative burden:
- Reduces face time with patients
- Contributes to burnout (>50% of physicians)
- Delays care and increases errors

## 💡 The Solution

Clinical-OS is an ambient clinical scribe that listens to patient encounters and generates a **complete, signable encounter packet** — not just raw transcription, but structured clinical documentation ready for review.

---

## ✨ Key Features

### 1. Signable Encounter Packet
- **SOAP Notes** with Subjective, Objective, Assessment, and Plan
- **Problem List** with ICD-10 codes
- **Draft Orders** (labs, imaging, medications, referrals)
- **Patient Instructions** (multilingual support)
- **Follow-up Recommendations**

### 2. Evidence Provenance (The Tasteful Flex)
Every suggestion includes:
- 📍 **Transcript Anchor** — exact quote from the conversation
- 🧠 **Reasoning** — clinical rationale for the inference
- 📊 **Confidence Score** — Low/Medium/High
- 🔄 **Alternative Interpretations** — what could change the conclusion

### 3. Safety Layer (Product-Shaped, Not Legal-Shaped)
- 🔴 **Red Flag Detector** — chest pain, neuro deficits, suicidal ideation
- 🔒 **PII Redaction Mode** — mask SSN, phone, dates in display
- ✋ **Human Confirmation Workflow** — nothing is promoted without clinician review
- 💊 **Contraindication Alerts** — checks against allergies, meds, conditions

### 4. Multilingual Support
- **Dual Transcript View** — original language + clinical English
- **Code-Switch Detection** — identifies language changes mid-conversation
- **Localized Instructions** — patient instructions in their preferred language

### 5. FHIR-lite Interoperability
Export encounters as standard **FHIR R4 Bundles**:
- `Condition` (diagnoses, problem list)
- `Observation` (visual findings)
- `MedicationRequest` (medication orders)
- `ServiceRequest` (labs, imaging)
- `DocumentReference` (narrative note)

### 6. Patient Memory (Longitudinal Context)
- **Inspectable Store** — localStorage-based, fully transparent
- **Pin/Forget UX** — control what persists across encounters
- **Sourced Facts** — every memory item shows its origin

---

## 📊 Evaluation Metrics

Built-in replay harness for deterministic testing:

| Metric | Description | Target |
|--------|-------------|--------|
| **Coverage** | Did we generate note/orders/instructions? | 100% |
| **Latency** | Time to first insight | <2s |
| **Provenance Completeness** | % of claims with evidence links | >85% |
| **Unsupported Claim Rate** | Claims without transcript backing | <5% |
| **Contradiction Rate** | Conflicting information | 0% |

Sample sessions included for testing:
- `demo-chest-pain` — Cardiac evaluation with red flags
- `demo-multilingual-diabetes` — Spanish-English code-switching

---

## 🚀 Roadmap: What's Real vs. Aspirational

| Phase | Feature | Status |
|-------|---------|--------|
| **v0 (Current)** | Ambient transcription + basic suggestions | ✅ Shipped |
| **v1 (This Branch)** | Encounter Packet + Provenance + Safety | ✅ Implemented |
| **v1.1** | FHIR Export + Multilingual | ✅ Implemented |
| **v1.2** | Patient Memory + Replay Harness | ✅ Implemented |
| **v2 (Future)** | EHR Integration (Epic/Cerner) | 🔮 Aspirational |
| **v2.1** | Real-time contraindication checks via APIs | 🔮 Aspirational |
| **v2.2** | Automated ICD-10/CPT coding | 🔮 Aspirational |

---

## 🎬 2-Minute Demo Script

1. **0:00** — Select patient from queue (show diverse patient panel)
2. **0:15** — Start ambient scribe, simulate conversation
3. **0:45** — Show real-time insights appearing (diagnoses, questions)
4. **1:00** — Click "Generate Encounter Packet"
5. **1:15** — Walk through SOAP note with provenance tooltips
6. **1:30** — Show Orders tab, demonstrate priority levels
7. **1:45** — Open Safety panel, show red-flag detection
8. **2:00** — Export FHIR Bundle, show JSON structure

---

## 🛠 Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Set your Gemini API key
echo "API_KEY=your_key_here" > .env.local

# Run development server
npm run dev
```

---

## 📁 Project Structure

```
health-assist-ai-v1.1/
├── App.tsx                     # Main application
├── components/
│   ├── ConsultationView.tsx    # Main encounter view
│   ├── EncounterPacketPanel.tsx # Signable packet UI
│   ├── SafetyPanel.tsx         # Safety controls
│   ├── PatientMemoryPanel.tsx  # Longitudinal memory
│   ├── TranscriptionPanel.tsx  # Multilingual transcript
│   └── AiSuggestionsPanel.tsx  # Real-time insights
├── services/
│   ├── geminiService.ts        # AI generation (SOAP, suggestions)
│   └── fhirExport.ts           # FHIR R4 Bundle conversion
├── hooks/
│   ├── useLiveSession.ts       # WebSocket transcription
│   ├── usePatientMemory.ts     # localStorage persistence
│   └── useReplaySession.ts     # Evaluation harness
└── types.ts                    # Full type definitions
```

---

## ⚖️ Disclaimers

- **Not for production clinical use** — This is a prototype for demonstration
- **Mock data only** — All patient data is synthetic
- **No PHI** — No real patient information is stored or transmitted
- **Human-in-the-loop required** — AI suggestions require clinician review

---

## 📄 License

GNU Affero General Public License v3.0
