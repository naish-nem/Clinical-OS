# AI Clinical Copilot — Product Story (Slide 1)

## Who is the user?
- Clinicians with high patient volume (doctors, nurses, allied health professionals)
- Especially in multilingual, resource‑constrained settings (e.g., India)

## Problem statement
- Consultations are information‑dense and time‑pressured
- Clinicians must document, recall history, and decide in real time
- Language mismatch: patient speaks local language, clinical resources are in English
- Administrative burden (order sets, documentation) steals time from care

## Our solution (what we’re building)
- A **silent, real‑time AI copilot** during the consult
- Listens to the conversation, captures context, and surfaces structured next steps
- Suggests diagnoses and order sets with evidence‑based support
- Personalizes recommendations using patient profile embeddings

## Value
- Faster, more confident decisions
- Reduced admin workload
- Better continuity through patient‑specific context

---

# AI Clinical Copilot — Technical Stack & Architecture (Slide 2)

## Core stack
- **Gemini Live API** for real‑time, multimodal interaction
- **Speech + multilingual support** to handle vernacular inputs
- **Embedding layer** for patient profiles and longitudinal context

## How it works (high level)
- Live audio is transcribed and summarized in‑session
- Conversation context + patient embeddings injected into prompts
- Clinician sees suggested actions (diagnosis + order sets) and can approve
- Outputs are structured for downstream clinical systems

## Why this structure
- Real‑time inference minimizes disruption during consults
- Multimodal + multilingual support matches real‑world clinical settings
- Embeddings enable longitudinal personalization without heavy manual recall
- Human‑in‑the‑loop keeps clinical control and safety
