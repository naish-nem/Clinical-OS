
import React, { useState, useCallback, useRef } from 'react';
import { Patient, TranscriptEntry, MedicalSuggestions, Speaker, VisualAnalysis, MedicalInsight } from '../types';
import PatientInfoPanel from './PatientInfoPanel';
import TranscriptionPanel from './TranscriptionPanel';
import AiSuggestionsPanel from './AiSuggestionsPanel';
import { useLiveSession } from '../hooks/useLiveSession';
import { getMedicalSuggestions, analyzeVisualSymptom } from '../services/geminiService';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import { CameraIcon } from './icons/CameraIcon';
import { Type } from '@google/genai';

interface ConsultationViewProps {
  patient: Patient;
}

const ConsultationView: React.FC<ConsultationViewProps> = ({ patient }) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [suggestions, setSuggestions] = useState<MedicalSuggestions | null>(null);
  const [visualAnalysis, setVisualAnalysis] = useState<VisualAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toolDeclarations = [
    {
      name: 'updateClinicalIntelligence',
      description: 'Silently update the diagnostic dashboard with structured evidence. Items marked HIGH confidence move to the primary decision engine.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          possibleDiagnoses: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                title: { type: Type.STRING }, 
                details: { type: Type.STRING }, 
                confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] } 
              } 
            } 
          },
          recommendedQuestions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                title: { type: Type.STRING, description: 'The specific question for the doctor to ask' }, 
                details: { type: Type.STRING, description: 'The clinical rationale' },
                confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
              } 
            } 
          },
          workingObservations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                details: { type: Type.STRING },
                confidence: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  ];

  const handleTranscription = useCallback((text: string, isUser: boolean, isFinal: boolean) => {
    setTranscript(prev => {
      // In a real scenario, the model would diarize. Here we infer Clinician/Patient logic
      // based on keywords or context provided in the system instruction's log format.
      let speaker = isUser ? Speaker.Clinician : Speaker.Patient;
      
      const lastEntry = prev[prev.length - 1];
      if (lastEntry && lastEntry.speaker === speaker && (Date.now() - lastEntry.timestamp < 3000)) {
        const updated = [...prev];
        updated[updated.length - 1] = { ...lastEntry, text: lastEntry.text + " " + text, timestamp: Date.now() };
        return updated;
      }
      return [...prev, { speaker, text, timestamp: Date.now() }];
    });
  }, []);

  const handleToolCall = async (functionCalls: any[]) => {
    for (const fc of functionCalls) {
      if (fc.name === 'updateClinicalIntelligence') {
        const newInsights = fc.args as Partial<MedicalSuggestions>;
        setSuggestions(prev => ({
          possibleDiagnoses: [...(newInsights.possibleDiagnoses || []), ...(prev?.possibleDiagnoses || [])].slice(0, 10),
          recommendedQuestions: [...(newInsights.recommendedQuestions || []), ...(prev?.recommendedQuestions || [])].slice(0, 5),
          workingObservations: [...(newInsights.workingObservations || []), ...(prev?.workingObservations || [])].slice(0, 10),
          suggestedLabsAndTests: prev?.suggestedLabsAndTests || [],
          potentialTreatments: prev?.potentialTreatments || []
        }));
        setLastUpdate(Date.now());
      }
    }
    return functionCalls.map(fc => ({ id: fc.id, name: fc.name, response: { status: 'registered' } }));
  };

  const { isActive: isLive, startSession, stopSession } = useLiveSession({
    onTranscription: handleTranscription,
    onToolCall: handleToolCall
  });

  const toggleLiveConsultation = () => {
    if (isLive) {
      stopSession();
    } else {
      const systemPrompt = `SYSTEM ROLE: Institutional Clinical Scribe. 
      STRICT GUIDELINES:
      1. DO NOT SPEAK. DO NOT INTERJECT. 
      2. Listen to the interaction between CLINICIAN (User) and PATIENT.
      3. Diarize the conversation silently.
      4. Detect patterns. If confidence is HIGH, use 'updateClinicalIntelligence' to promote items to the Decision Engine.
      5. For lower confidence findings, add them to 'workingObservations'.
      6. Generate 'recommendedQuestions' as directional widgets for the Clinician to consider.
      7. Current Patient Context: ${patient.name}, ${patient.age}y.`;
      
      startSession(systemPrompt, toolDeclarations);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { setIsCameraActive(false); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
    setIsAiLoading(true);
    try {
      const analysis = await analyzeVisualSymptom(base64, patient);
      setVisualAnalysis(analysis);
      setLastUpdate(Date.now());
      stopCamera();
    } catch (e) { console.error(e); } finally { setIsAiLoading(false); }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-3 min-h-0 flex flex-col">
        <div className="flex-grow min-h-0">
          <PatientInfoPanel patient={patient} />
        </div>
        <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 leading-relaxed font-medium">
          <span className="font-black uppercase block mb-1">Diarization Engine</span>
          Listening for multi-party clinical narrative. Assistant is restricted from audio output.
        </div>
      </div>

      <div className="col-span-6 flex flex-col gap-4 min-h-0">
        <div className={`cps-card flex-grow flex flex-col min-h-0 overflow-hidden bg-white ${isLive ? 'border-indigo-400 ring-1 ring-indigo-100' : ''}`}>
          <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <div>
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Clinical Interaction Log</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Institutional Multi-Speaker Monitor</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={toggleLiveConsultation}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                  isLive ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-indigo-600 text-white shadow-md'
                }`}
              >
                {isLive ? <StopIcon /> : <MicIcon />}
                <span>{isLive ? 'Stop Monitoring' : 'Start Scribe'}</span>
              </button>
              
              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`p-2 rounded border transition-all ${isCameraActive ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                <CameraIcon />
              </button>
            </div>
          </div>

          <div className="flex-grow flex flex-col min-h-0 relative">
            {isCameraActive && (
              <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center">
                 <video ref={videoRef} autoPlay playsInline className="max-h-[70%] rounded-lg shadow-2xl border border-white/20" />
                 <button onClick={captureAndAnalyze} className="mt-6 bg-white text-slate-900 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Capture Diagnostic Frame</button>
              </div>
            )}

            <div className="flex-grow min-h-0 relative">
               <TranscriptionPanel transcript={transcript} />
               
               {transcript.length === 0 && !isLive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white">
                   <div className="max-w-xs space-y-4 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <MicIcon />
                      </div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Scribe Mode Standby</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Assistant will capture the conversation between clinician and patient to generate silent insights.</p>
                   </div>
                </div>
              )}
            </div>

            {/* Directional Widget Overlay - "Recommended Questions" */}
            {isLive && suggestions?.recommendedQuestions && suggestions.recommendedQuestions.length > 0 && (
              <div className="absolute bottom-6 right-6 w-64 animate-in slide-in-from-bottom-4 duration-500 z-10">
                <div className="bg-indigo-900 rounded-lg shadow-2xl p-4 border border-indigo-400/30 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Inquiry Prompt</span>
                  </div>
                  <div className="space-y-3">
                    {suggestions.recommendedQuestions.slice(0, 2).map((q, i) => (
                      <div key={i} className="group cursor-help">
                        <p className="text-[11px] font-bold text-white leading-tight">{q.title}</p>
                        <p className="text-[9px] text-indigo-300/80 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">{q.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-3 min-h-0 flex flex-col gap-4">
        <div className="flex-grow min-h-0 relative">
          <AiSuggestionsPanel 
            suggestions={suggestions} 
            isLoading={isAiLoading} 
            visualAnalysis={visualAnalysis}
          />
        </div>
        <div className="p-3 bg-slate-900 text-slate-400 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-800">
           Silent Copilot // Institutional Core
           <div className="mt-1 flex items-center gap-2 opacity-50">
             <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
             Diarization: Active
           </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationView;
