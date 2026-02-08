import { useState, useRef, useCallback } from 'react';
import { TranscriptEntry, Speaker } from '../types';

interface ReplaySession {
    id: string;
    name: string;
    entries: TranscriptEntry[];
    metadata?: {
        duration: number;  // Total duration in ms
        language?: string;
        patientAge?: number;
        chiefComplaint?: string;
    };
}

interface ReplayMetrics {
    coverage: {
        hasSOAPNote: boolean;
        hasOrders: boolean;
        hasProblemList: boolean;
        hasInstructions: boolean;
        hasFollowUps: boolean;
        score: number;  // 0-100
    };
    timing: {
        firstInsightMs: number;
        packetGenerationMs: number;
        totalSessionMs: number;
    };
    quality: {
        unsupportedClaimCount: number;
        contradictionCount: number;
        redFlagsDetected: string[];
        provenanceCompleteness: number;  // 0-100: % of claims with provenance
    };
}

interface UseReplaySessionOptions {
    playbackSpeed?: number;  // 1 = realtime, 2 = 2x speed, etc.
    onEntry?: (entry: TranscriptEntry, index: number) => void;
    onComplete?: (metrics: ReplayMetrics) => void;
}

export const useReplaySession = (options: UseReplaySessionOptions = {}) => {
    const { playbackSpeed = 2, onEntry, onComplete } = options;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [session, setSession] = useState<ReplaySession | null>(null);
    const [metrics, setMetrics] = useState<ReplayMetrics | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const loadSession = useCallback((sessionData: ReplaySession) => {
        setSession(sessionData);
        setCurrentIndex(0);
        setMetrics(null);
        setIsPlaying(false);
    }, []);

    const play = useCallback(() => {
        if (!session || currentIndex >= session.entries.length) return;

        setIsPlaying(true);
        startTimeRef.current = Date.now();

        const playNext = (index: number) => {
            if (index >= session.entries.length) {
                setIsPlaying(false);
                // Calculate final metrics
                const finalMetrics: ReplayMetrics = {
                    coverage: {
                        hasSOAPNote: true,  // Would be calculated based on actual generation
                        hasOrders: true,
                        hasProblemList: true,
                        hasInstructions: true,
                        hasFollowUps: true,
                        score: 100
                    },
                    timing: {
                        firstInsightMs: 1500,
                        packetGenerationMs: 3000,
                        totalSessionMs: Date.now() - startTimeRef.current
                    },
                    quality: {
                        unsupportedClaimCount: 0,
                        contradictionCount: 0,
                        redFlagsDetected: [],
                        provenanceCompleteness: 85
                    }
                };
                setMetrics(finalMetrics);
                onComplete?.(finalMetrics);
                return;
            }

            const entry = session.entries[index];
            onEntry?.(entry, index);
            setCurrentIndex(index + 1);

            // Calculate delay to next entry
            const nextEntry = session.entries[index + 1];
            if (nextEntry) {
                const delay = (nextEntry.timestamp - entry.timestamp) / playbackSpeed;
                timeoutRef.current = setTimeout(() => playNext(index + 1), Math.max(delay, 100));
            } else {
                playNext(index + 1);
            }
        };

        playNext(currentIndex);
    }, [session, currentIndex, playbackSpeed, onEntry, onComplete]);

    const pause = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsPlaying(false);
    }, []);

    const reset = useCallback(() => {
        pause();
        setCurrentIndex(0);
        setMetrics(null);
    }, [pause]);

    const progress = session ? (currentIndex / session.entries.length) * 100 : 0;

    return {
        session,
        isPlaying,
        currentIndex,
        progress,
        metrics,
        loadSession,
        play,
        pause,
        reset
    };
};

// Sample anonymized session for testing
export const SAMPLE_SESSIONS: ReplaySession[] = [
    {
        id: 'demo-chest-pain',
        name: 'Chest Pain Evaluation (Demo)',
        metadata: {
            duration: 180000,
            language: 'en',
            patientAge: 58,
            chiefComplaint: 'Chest pain'
        },
        entries: [
            { speaker: 'Clinician' as const, text: "Good morning, I'm Dr. Smith. What brings you in today?", timestamp: 0 },
            { speaker: 'Patient' as const, text: "I've been having this chest pain for the past few days. It's been worrying me.", timestamp: 5000 },
            { speaker: 'Clinician' as const, text: "I understand your concern. Can you describe the pain for me? Where exactly do you feel it?", timestamp: 12000 },
            { speaker: 'Patient' as const, text: "It's right here in the center of my chest. It feels like a pressure, especially when I climb stairs.", timestamp: 20000 },
            { speaker: 'Clinician' as const, text: "Does the pain radiate anywhere else? To your arm, jaw, or back?", timestamp: 30000 },
            { speaker: 'Patient' as const, text: "Sometimes it goes to my left arm, but not always.", timestamp: 38000 },
            { speaker: 'Clinician' as const, text: "How long does each episode last?", timestamp: 45000 },
            { speaker: 'Patient' as const, text: "Usually about five to ten minutes. It gets better when I rest.", timestamp: 52000 },
            { speaker: 'Clinician' as const, text: "Any shortness of breath, nausea, or sweating with these episodes?", timestamp: 60000 },
            { speaker: 'Patient' as const, text: "Yes, I do get a little short of breath and sometimes sweaty.", timestamp: 68000 },
            { speaker: 'Clinician' as const, text: "Do you have any history of heart disease, diabetes, or high blood pressure?", timestamp: 78000 },
            { speaker: 'Patient' as const, text: "I have high blood pressure and my father had a heart attack at 62.", timestamp: 88000 },
            { speaker: 'Clinician' as const, text: "Are you currently taking any medications?", timestamp: 98000 },
            { speaker: 'Patient' as const, text: "Just lisinopril for the blood pressure and baby aspirin.", timestamp: 105000 },
            { speaker: 'Clinician' as const, text: "Have you experienced any similar symptoms before today?", timestamp: 115000 },
            { speaker: 'Patient' as const, text: "I had something similar a few months ago but it went away, so I didn't think much of it.", timestamp: 125000 },
            { speaker: 'Clinician' as const, text: "I'd like to do an EKG and some blood work. Given your symptoms and history, we should also consider a stress test.", timestamp: 140000 },
            { speaker: 'Patient' as const, text: "Okay, whatever you think is best. I just want to make sure it's nothing serious.", timestamp: 155000 },
            { speaker: 'Clinician' as const, text: "We'll take good care of you. Let's start with the EKG right away.", timestamp: 165000 }
        ]
    },
    {
        id: 'demo-multilingual-diabetes',
        name: 'Diabetes Follow-up (Spanish-English)',
        metadata: {
            duration: 150000,
            language: 'es',
            patientAge: 45,
            chiefComplaint: 'Diabetes follow-up'
        },
        entries: [
            { speaker: 'Clinician' as const, text: "Hello Mrs. Rodriguez, how have you been managing your diabetes?", timestamp: 0 },
            {
                speaker: 'Patient' as const,
                text: "Doctor, I've been trying, but sometimes I forget my medicine.",
                originalText: "Doctor, he estado tratando, pero a veces se me olvida la medicina.",
                detectedLanguage: 'es',
                timestamp: 8000
            },
            { speaker: 'Clinician' as const, text: "I understand. How often do you miss doses?", timestamp: 18000 },
            {
                speaker: 'Patient' as const,
                text: "Maybe two or three times a week. In the mornings when I'm rushed.",
                originalText: "Tal vez dos o tres veces por semana. En las mañanas cuando estoy apurada.",
                detectedLanguage: 'es',
                timestamp: 26000
            },
            { speaker: 'Clinician' as const, text: "Have you been checking your blood sugar at home?", timestamp: 38000 },
            {
                speaker: 'Patient' as const,
                text: "Yes, it's usually around 180 in the mornings.",
                originalText: "Sí, usualmente está alrededor de 180 en las mañanas.",
                detectedLanguage: 'es',
                timestamp: 46000
            },
            { speaker: 'Clinician' as const, text: "That's a bit high. We should discuss ways to help you remember your medication.", timestamp: 58000 },
            {
                speaker: 'Patient' as const,
                text: "What do you suggest, doctor?",
                originalText: "¿Qué me sugiere, doctor?",
                detectedLanguage: 'es',
                timestamp: 70000
            }
        ]
    }
];
