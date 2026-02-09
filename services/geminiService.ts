
import { GoogleGenAI, Modality, Type, GenerateContentResponse, DynamicRetrievalConfigMode } from "@google/genai";
import { Patient, TranscriptEntry, MedicalSuggestions, VisualAnalysis, EncounterPacket } from '../types';

// Use the recommended initialization pattern
export const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze a visual symptom using multimodal input
export const analyzeVisualSymptom = async (base64Image: string, patientContext: Patient): Promise<VisualAnalysis> => {
  const ai = getGeminiClient();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `You are a world-class institutional medical diagnostic assistant. 
          Analyze this clinical image for ${patientContext.name}. 
          Age: ${patientContext.age > 0 ? patientContext.age : 'Unknown'}, Gender: ${patientContext.gender}.
          History: ${patientContext.medicalHistory.length > 0 ? patientContext.medicalHistory.join(', ') : 'No documented history'}.
          
          Guidelines:
          1. Be specific and clinical.
          2. Consider cultural contexts (e.g., skin tone variations for dermatological symptoms).
          3. Provide your analysis in JSON format:
          {
            "observation": "detailed clinical description",
            "concerns": ["potential differentials"],
            "suggestedAction": "immediate next step"
          }`
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || '{}') as VisualAnalysis;
  } catch (e) {
    console.error("Failed to parse visual analysis", e);
    return {
      observation: "Processing delay in high-resolution analysis.",
      concerns: ["Resolution Error"],
      suggestedAction: "Re-capture evidence with neutral lighting."
    };
  }
};

// Generate structured medical suggestions based on transcript and patient history
// Now includes Google Search Retrieval for medical grounding
export const getMedicalSuggestions = async (patient: Patient, transcript: TranscriptEntry[]): Promise<MedicalSuggestions> => {
  const ai = getGeminiClient();
  const transcriptString = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');

  // Update prompt keys to match the MedicalInsight interface properties
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Institutional Clinical Copilot Analysis for Patient ${patient.name}.
      
      Demographics: ${patient.age}y, ${patient.gender}.
      Cultural/Linguistic Context: Always analyze and respond in English. If the input is in another language, translate it to standard clinical English.
      EHR Context: 
      - History: ${patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : 'UNSPECIFIED'}
      - Meds: ${patient.currentMedications.length > 0 ? patient.currentMedications.join(', ') : 'UNSPECIFIED'}
      - Allergies: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'NKA'}

      Session Transcript:
      ${transcriptString}

      Task: Generate a real-time differential and order set. 
      Use current medical literature and clinical guidelines to ground your suggestions.
      If patient history is minimal, focus suggestions on baseline diagnostic intake.

      Output JSON:
      {
        "possibleDiagnoses": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High", "source": "guideline or literature reference if available"}],
        "recommendedQuestions": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}],
        "suggestedLabsAndTests": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}],
        "potentialTreatments": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High", "source": "guideline reference if available"}],
        "workingObservations": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}]
      }
    `,
    config: {
      responseMimeType: "application/json",
      // Enable Google Search grounding for medical accuracy
      tools: [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
            dynamicThreshold: 0.3 // Lower threshold = more grounding
          }
        }
      }]
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      possibleDiagnoses: data.possibleDiagnoses || [],
      recommendedQuestions: data.recommendedQuestions || [],
      suggestedLabsAndTests: data.suggestedLabsAndTests || [],
      potentialTreatments: data.potentialTreatments || [],
      workingObservations: data.workingObservations || []
    } as MedicalSuggestions;
  } catch (e) {
    console.error("Suggestions parse error", e);
    // Fix: Ensure the returned object matches the MedicalSuggestions and MedicalInsight interfaces
    return {
      possibleDiagnoses: [],
      recommendedQuestions: [{
        id: 'err-default',
        title: "Baseline assessment required.",
        details: "Insufficient data in transcript.",
        confidence: 'Low'
      }],
      suggestedLabsAndTests: [],
      potentialTreatments: [],
      workingObservations: []
    };
  }
};

// Generate a complete, signable encounter packet
export const generateEncounterPacket = async (
  patient: Patient,
  transcript: TranscriptEntry[],
  visualAnalysis?: VisualAnalysis
): Promise<EncounterPacket> => {
  const ai = getGeminiClient();
  const transcriptString = transcript.map(t =>
    `[${Math.floor(t.timestamp / 1000)}s] ${t.speaker}: ${t.text}`
  ).join('\n');

  const visualContext = visualAnalysis
    ? `\n\nVisual Findings: ${visualAnalysis.observation}\nConcerns: ${visualAnalysis.concerns.join(', ')}\nSuggested Action: ${visualAnalysis.suggestedAction}`
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      TASK: Generate a complete, signable clinical encounter packet.
      
      PATIENT: ${patient.name}, ${patient.age}y ${patient.gender}
      HISTORY: ${patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : 'None documented'}
      MEDICATIONS: ${patient.currentMedications.length > 0 ? patient.currentMedications.join(', ') : 'None'}
      ALLERGIES: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'NKA'}
      
      ENCOUNTER TRANSCRIPT:
      ${transcriptString}
      ${visualContext}
      
      REQUIREMENTS:
      1. Every clinical assertion MUST have provenance with:
         - "quote": Anchor phrase from transcript (exact or near-exact)
         - "reasoning": Clinical rationale for inference
         - "confidence": Low/Medium/High
         - "alternativeInterpretations": What could change this conclusion
      
      2. RED FLAGS: Identify any urgent findings (chest pain, neuro deficits, suicidal ideation, etc.)
      
      3. Language: Always generate in English.
      
      OUTPUT JSON:
      {
        "soapNote": {
          "subjective": {
            "chiefComplaint": "string",
            "historyOfPresentIllness": "string",
            "reviewOfSystems": ["string"],
            "provenance": [{"quote": "string", "reasoning": "string", "confidence": "Low|Medium|High", "alternativeInterpretations": ["string"]}]
          },
          "objective": {
            "vitalSigns": "string or null",
            "physicalExam": "string or null",
            "visualFindings": "string or null",
            "provenance": [...]
          },
          "assessment": {
            "diagnoses": ["string"],
            "differentials": ["string"],
            "provenance": [...]
          },
          "plan": {
            "treatments": ["string"],
            "tests": ["string"],
            "referrals": ["string"],
            "provenance": [...]
          }
        },
        "problemList": [{"description": "string", "status": "Active|Resolved|Chronic", "dateIdentified": "today", "code": "ICD-10 if known", "provenance": {...}}],
        "orders": [{"type": "Lab|Imaging|Medication|Referral|Procedure", "description": "string", "priority": "Routine|Urgent|STAT", "rationale": "string", "provenance": {...}}],
        "patientInstructions": [{"instruction": "string", "language": "en", "category": "Medication|Lifestyle|FollowUp|Warning|General"}],
        "followUps": [{"type": "string", "timeframe": "string", "reason": "string", "provenance": {...}}],
        "redFlags": ["string"],
        "requiresConfirmation": true
      }
    `,
    config: {
      responseMimeType: "application/json",
      // Enable Google Search grounding for evidence-based clinical documentation
      tools: [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
            dynamicThreshold: 0.3
          }
        }
      }]
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      generatedAt: new Date().toISOString(),
      patientId: patient.id,
      patientName: patient.name,
      soapNote: data.soapNote || { subjective: { chiefComplaint: '', historyOfPresentIllness: '' }, objective: {}, assessment: { diagnoses: [] }, plan: { treatments: [], tests: [] } },
      problemList: data.problemList || [],
      orders: data.orders || [],
      patientInstructions: data.patientInstructions || [],
      followUps: data.followUps || [],
      redFlags: data.redFlags || [],
      requiresConfirmation: data.requiresConfirmation ?? true,
      signatureStatus: 'Draft'
    } as EncounterPacket;
  } catch (e) {
    console.error("Encounter packet parse error", e);
    return {
      generatedAt: new Date().toISOString(),
      patientId: patient.id,
      patientName: patient.name,
      soapNote: {
        subjective: { chiefComplaint: 'Unable to generate', historyOfPresentIllness: 'Parsing error occurred' },
        objective: {},
        assessment: { diagnoses: ['Error in generation'] },
        plan: { treatments: [], tests: [] }
      },
      problemList: [],
      orders: [],
      patientInstructions: [],
      followUps: [],
      redFlags: ['Generation error - manual review required'],
      requiresConfirmation: true,
      signatureStatus: 'Draft'
    };
  }
};

// ============================================
// GROUNDING ENRICHMENT FUNCTION
// Combines Gemini output with free medical API data
// ============================================

import {
  gatherGroundingEvidence,
  formatGroundingAsInsights,
  GroundingResult
} from './groundingService';

export interface EnrichedEncounterPacket extends EncounterPacket {
  groundingEvidence?: GroundingResult;
  groundingInsights?: ReturnType<typeof formatGroundingAsInsights>;
}

export const generateEnrichedEncounterPacket = async (
  patient: Patient,
  transcript: TranscriptEntry[],
  visualAnalysis?: VisualAnalysis
): Promise<EnrichedEncounterPacket> => {
  // Generate the base encounter packet with Google Search grounding
  const basePacket = await generateEncounterPacket(patient, transcript, visualAnalysis);

  // Extract diagnoses and medications for targeted grounding
  const diagnoses = basePacket.soapNote.assessment.diagnoses || [];
  const medications = patient.currentMedications || [];

  // Also extract any medications mentioned in the plan
  const planMeds = basePacket.orders
    .filter(o => o.type === 'Medication')
    .map(o => o.description.split(' ')[0]); // Get first word (drug name)

  const allMedications = [...new Set([...medications, ...planMeds])];

  console.log('[Grounding] Gathering evidence for:', { diagnoses, medications: allMedications });

  // Gather evidence from free APIs (PubMed, OpenFDA, RxNorm, ICD-10)
  const groundingEvidence = await gatherGroundingEvidence(diagnoses, allMedications);
  const groundingInsights = formatGroundingAsInsights(groundingEvidence);

  console.log('[Grounding] Evidence gathered:', {
    pubmedArticles: groundingEvidence.pubmedArticles.length,
    drugInfo: groundingEvidence.drugInfo.size,
    interactions: groundingEvidence.drugInteractions.length,
    icdCodes: groundingEvidence.icdCodes.size
  });

  return {
    ...basePacket,
    groundingEvidence,
    groundingInsights
  };
};
