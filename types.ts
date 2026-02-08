
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
  text: string;
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
