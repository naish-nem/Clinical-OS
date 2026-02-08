
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { Patient, TranscriptEntry, MedicalSuggestions, VisualAnalysis } from '../types';

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
export const getMedicalSuggestions = async (patient: Patient, transcript: TranscriptEntry[]): Promise<MedicalSuggestions> => {
  const ai = getGeminiClient();
  const transcriptString = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
  
  // Update prompt keys to match the MedicalInsight interface properties
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Institutional Clinical Copilot Analysis for Patient ${patient.name}.
      
      Demographics: ${patient.age}y, ${patient.gender}.
      Cultural/Linguistic Context: Support multilingual input (Spanish, Hindi, Hebrew, etc.) and translate insights to standard clinical English. 
      EHR Context: 
      - History: ${patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : 'UNSPECIFIED'}
      - Meds: ${patient.currentMedications.length > 0 ? patient.currentMedications.join(', ') : 'UNSPECIFIED'}
      - Allergies: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'NKA'}

      Session Transcript:
      ${transcriptString}

      Task: Generate a real-time differential and order set. 
      If patient history is minimal, focus suggestions on baseline diagnostic intake.

      Output JSON:
      {
        "possibleDiagnoses": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}],
        "recommendedQuestions": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}],
        "suggestedLabsAndTests": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}],
        "potentialTreatments": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}],
        "workingObservations": [{"id": "string", "title": "string", "details": "string", "confidence": "Low|Medium|High"}]
      }
    `,
    config: {
      responseMimeType: "application/json",
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
