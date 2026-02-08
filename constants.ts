
import { Patient } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 101,
    name: 'Elena Rodriguez',
    age: 38,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: ['Gestational Diabetes (2021)', 'Mild Anxiety'],
    currentMedications: ['Prenatal Vitamins'],
    allergies: ['Latex'],
    previousConsultations: [
      {
        date: '2024-03-10',
        summary: 'Patient prefers Spanish for complex medical terms. Routine checkup post-pregnancy.',
        diagnosis: 'Normal postpartum recovery',
        doctor: 'Dr. Sarah Mitchell',
        type: 'Routine'
      }
    ],
    upcomingAppointments: []
  },
  {
    id: 102,
    name: 'Jacob Yoder',
    age: 64,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: [], // Amish context: Minimal documentation, traditional community
    currentMedications: [],
    allergies: ['None known'],
    previousConsultations: [],
    upcomingAppointments: [
      {
        date: '2024-05-15',
        time: '10:00 AM',
        type: 'Initial Assessment',
        doctor: 'Dr. James Wilson',
        location: 'Clinic A',
        status: 'Confirmed'
      }
    ]
  },
  {
    id: 103,
    name: 'Arjun Venkat',
    age: 48,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: ['Hyperlipidemia', 'Family history of CAD'],
    currentMedications: ['Atorvastatin 10mg'],
    allergies: ['Dust Mites'],
    previousConsultations: [
      {
        date: '2024-01-20',
        summary: 'Discussion regarding vegetarian diet and protein intake. Hindi-speaking family present.',
        diagnosis: 'Hyperlipidemia',
        doctor: 'Dr. Robert Chen',
        type: 'Routine'
      }
    ],
    upcomingAppointments: []
  },
  {
    id: 104,
    name: 'Rivka Goldstein',
    age: 74,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: ['Osteoarthritis', 'Glaucoma'],
    currentMedications: ['Latanoprost drops', 'Acetaminophen PRN'],
    allergies: ['Sulfa drugs'],
    previousConsultations: [
      {
        date: '2023-12-05',
        summary: 'Patient requested consultation end before Sabbath. Mobility issues noted.',
        diagnosis: 'Osteoarthritis Flare',
        doctor: 'Dr. Elena Rossi',
        type: 'Follow-up'
      }
    ],
    upcomingAppointments: []
  },
  {
    id: 105,
    name: 'Marcus Washington',
    age: 31,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: ['Sickle Cell Trait'],
    currentMedications: [],
    allergies: ['Peanuts'],
    previousConsultations: [],
    upcomingAppointments: []
  },
  {
    id: 106,
    name: 'Li Wei',
    age: 68,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: ['Post-stroke recovery (2022)', 'Type 2 Diabetes'],
    currentMedications: ['Metformin', 'Clopidogrel'],
    allergies: ['Seafood'],
    previousConsultations: [
      {
        date: '2024-02-15',
        summary: 'Focus on fine motor skill recovery. Mandarin translation used.',
        diagnosis: 'Stable recovery',
        doctor: 'Dr. Robert Chen',
        type: 'Routine'
      }
    ],
    upcomingAppointments: []
  },
  {
    id: 108,
    name: 'Maria Santos',
    age: 82,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1520155346-36773ad24ba8?q=80&w=256&h=256&auto=format&fit=crop',
    medicalHistory: ['Hypertension', 'Cognitive Impairment'],
    currentMedications: ['Lisinopril', 'Donepezil'],
    allergies: ['Shellfish'],
    previousConsultations: [],
    upcomingAppointments: []
  },
  {
    id: 999,
    name: 'Unidentified Trauma Case',
    age: 0,
    gender: 'Other',
    avatarUrl: '', // Will show initials "UT"
    medicalHistory: [], // Minimal data edge case
    currentMedications: [],
    allergies: [],
    previousConsultations: [],
    upcomingAppointments: []
  }
];
