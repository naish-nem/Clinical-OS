
export interface ConsultationRecord {
  date: string;
  time?: string;
  summary: string;
  diagnosis: string;
  doctor: string;
  type?: 'Follow-up' | 'Emergency' | 'Routine' | 'Specialist';
}

export interface Appointment {
  date: string;
  time: string;
  type: string;
  doctor: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  previousConsultations: ConsultationRecord[];
  upcomingAppointments: Appointment[];
}

export interface TranscriptEntry {
  speaker: 'Clinician' | 'Patient' | 'System';
  text: string;                    // Clinical English (translated if needed)
  originalText?: string;           // Original language text (if different)
  detectedLanguage?: string;       // ISO code: 'en', 'es', 'hi', 'zh', 'he', etc.
  timestamp: number;
  confidence?: number;
}

export interface MedicalInsight {
  id: string;
  title: string;
  details: string;
  confidence: 'Low' | 'Medium' | 'High';
  source?: string;
}

export interface MedicalSuggestions {
  possibleDiagnoses: MedicalInsight[];
  recommendedQuestions: MedicalInsight[];
  suggestedLabsAndTests: MedicalInsight[];
  potentialTreatments: MedicalInsight[];
  workingObservations: MedicalInsight[];
}

export enum Speaker {
  Clinician = 'Clinician',
  Patient = 'Patient',
  System = 'System'
}

export interface VisualAnalysis {
  observation: string;
  concerns: string[];
  suggestedAction: string;
}

// === ENCOUNTER PACKET TYPES ===

export interface Provenance {
  quote: string;           // Anchor phrase from transcript
  timestampStart?: number; // Start time in ms
  timestampEnd?: number;   // End time in ms
  reasoning: string;       // Why this was inferred
  confidence: 'Low' | 'Medium' | 'High';
  alternativeInterpretations?: string[]; // What could change the conclusion
}

export interface SOAPNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems?: string[];
    provenance?: Provenance[];
  };
  objective: {
    vitalSigns?: string;
    physicalExam?: string;
    visualFindings?: string; // From image analysis
    provenance?: Provenance[];
  };
  assessment: {
    diagnoses: string[];
    differentials?: string[];
    provenance?: Provenance[];
  };
  plan: {
    treatments: string[];
    tests: string[];
    referrals?: string[];
    provenance?: Provenance[];
  };
}

export interface ProblemListItem {
  code?: string;          // ICD-10 if available
  description: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  dateIdentified: string;
  provenance?: Provenance;
}

export interface Order {
  type: 'Lab' | 'Imaging' | 'Medication' | 'Referral' | 'Procedure';
  description: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  rationale: string;
  provenance?: Provenance;
}

export interface PatientInstruction {
  instruction: string;
  language: 'en' | 'es' | 'hi' | 'zh' | 'he' | 'other';
  category: 'Medication' | 'Lifestyle' | 'FollowUp' | 'Warning' | 'General';
}

export interface FollowUp {
  type: string;
  timeframe: string;
  reason: string;
  provenance?: Provenance;
}

export interface EncounterPacket {
  generatedAt: string;
  patientId: number;
  patientName: string;
  clinicianName?: string;
  soapNote: SOAPNote;
  problemList: ProblemListItem[];
  orders: Order[];
  patientInstructions: PatientInstruction[];
  followUps: FollowUp[];
  redFlags: string[];        // Critical findings requiring immediate attention
  requiresConfirmation: boolean;
  signatureStatus: 'Draft' | 'PendingReview' | 'Signed';
}
