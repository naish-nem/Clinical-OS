
import React, { useState, useCallback, useRef } from 'react';
import { Patient, TranscriptEntry, MedicalSuggestions, Speaker, VisualAnalysis, MedicalInsight } from '../types';
import PatientInfoPanel from './PatientInfoPanel';
import TranscriptionPanel from './TranscriptionPanel';
import AiSuggestionsPanel from './AiSuggestionsPanel';
import OrderSetsPanel, { OrderItem } from './OrderSetsPanel';
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
  const [orders, setOrders] = useState<OrderItem[]>([]);
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
          suggestedLabsAndTests: {
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
          potentialTreatments: {
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
    const normalized = text.trim();
    if (!normalized) return;

    // isUser=true means input from user/patient, isUser=false means model output
    let entryText = normalized;
    let speaker = isUser ? Speaker.Patient : Speaker.System;
    const labeledMatch = normalized.match(/^(clinician|doctor|patient)\s*:\s*(.+)$/i);
    if (labeledMatch) {
      const label = labeledMatch[1].toLowerCase();
      entryText = labeledMatch[2].trim();
      speaker = label === 'patient' ? Speaker.Patient : Speaker.Clinician;
    }

    setTranscript(prev => {
      const lastEntry = prev[prev.length - 1];
      if (lastEntry && lastEntry.speaker === speaker && (Date.now() - lastEntry.timestamp < 3000)) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...lastEntry,
          text: `${lastEntry.text} ${entryText}`,
          timestamp: Date.now()
        };
        return updated;
      }
      return [...prev, { speaker, text: entryText, timestamp: Date.now() }];
    });
  }, []);

  const handleToolCall = async (functionCalls: any[]) => {
    for (const fc of functionCalls) {
      if (fc.name === 'updateClinicalIntelligence') {
        const newInsights = fc.args as Partial<MedicalSuggestions>;

        // Update the dashboard suggestions
        setSuggestions(prev => ({
          possibleDiagnoses: [...(newInsights.possibleDiagnoses || []), ...(prev?.possibleDiagnoses || [])].slice(0, 10),
          recommendedQuestions: [...(newInsights.recommendedQuestions || []), ...(prev?.recommendedQuestions || [])].slice(0, 5),
          workingObservations: [...(newInsights.workingObservations || []), ...(prev?.workingObservations || [])].slice(0, 10),
          suggestedLabsAndTests: [...(newInsights.suggestedLabsAndTests || []), ...(prev?.suggestedLabsAndTests || [])].slice(0, 5),
          potentialTreatments: [...(newInsights.potentialTreatments || []), ...(prev?.potentialTreatments || [])].slice(0, 5)
        }));

        // Automatically populate order sets if confidence is high
        const newOrders: OrderItem[] = [];
        if (newInsights.suggestedLabsAndTests) {
          newInsights.suggestedLabsAndTests.forEach(lab => {
            newOrders.push({
              id: `lab-${Date.now()}-${Math.random()}`,
              type: lab.title.toLowerCase().includes('x-ray') || lab.title.toLowerCase().includes('mri') || lab.title.toLowerCase().includes('ct') ? 'Imaging' : 'Lab',
              name: lab.title,
              details: lab.details,
              priority: lab.confidence === 'High' ? 'Urgent' : 'Routine',
              rationale: 'AI Suggested based on clinical findings',
              status: 'suggested'
            });
          });
        }
        if (newInsights.potentialTreatments) {
          newInsights.potentialTreatments.forEach(tx => {
            newOrders.push({
              id: `tx-${Date.now()}-${Math.random()}`,
              type: 'Medication',
              name: tx.title,
              details: tx.details,
              priority: tx.confidence === 'High' ? 'Urgent' : 'Routine',
              rationale: 'AI Suggested based on clinical findings',
              status: 'suggested'
            });
          });
        }

        if (newOrders.length > 0) {
          setOrders(prev => [...newOrders, ...prev].slice(0, 10));
        }

        setLastUpdate(Date.now());
      }
    }
    return functionCalls.map(fc => ({ id: fc.id, name: fc.name, response: { status: 'registered' } }));
  };

  const { isActive: isLive, startSession, stopSession, error: liveError } = useLiveSession({
    onTranscription: handleTranscription,
    onToolCall: handleToolCall
  });

  const toggleLiveConsultation = () => {
    if (isLive) {
      stopSession();
    } else {
      const systemPrompt = `SYSTEM ROLE: Institutional Clinical Decision Support Scribe.
      
      CRITICAL REQUIREMENTS:
      1. SILENT MODE: Never speak or generate audio responses. Only listen and analyze.
      2. PROACTIVE TOOL USE: You MUST call 'updateClinicalIntelligence' FREQUENTLY as you hear clinical information.
      3. DO NOT WAIT: Even partial observations should be reported via the tool. Call it early and often.
      4. LANGUAGE: Always respond and analyze in English. If you hear other languages (e.g. Hindi, Spanish), translate them to clinical English for the dashboard.
      
      WHAT TO DETECT AND REPORT:
      - Any symptoms mentioned → add to workingObservations
      - Any medications discussed → add to workingObservations  
      - Possible diagnoses (even if uncertain) → add to possibleDiagnoses with appropriate confidence
      - Questions the clinician should ask → add to recommendedQuestions
      - Red flags or urgent findings → add with HIGH confidence
      - Required labs, imaging, or diagnostic tests → add to suggestedLabsAndTests
      - Potential medications or treatments to consider → add to potentialTreatments
      
      PATIENT CONTEXT:
      - Name: ${patient.name}
      - Age: ${patient.age} years old
      - Gender: ${patient.gender}
      - Medical History: ${patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : 'None documented'}
      - Current Medications: ${patient.currentMedications.length > 0 ? patient.currentMedications.join(', ') : 'None'}
      - Allergies: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'NKDA'}
      
      SPEAKER LABELING:
      - Default to PATIENT when ambiguous
      - Only mark as CLINICIAN when clearly the doctor/provider speaking
      
      START NOW: As soon as you hear any clinical content, call updateClinicalIntelligence immediately.`;

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

  // Demo mode: Simulate a clinical conversation for testing
  const simulateDemoCase = async () => {
    const demoTranscript: TranscriptEntry[] = [
      { speaker: Speaker.Patient, text: "Doctor, I've been having this tightness in my chest for the past three days. It gets worse when I walk up stairs.", timestamp: Date.now() - 60000 },
      { speaker: Speaker.Clinician, text: "Can you describe the pain? Is it sharp or more of a pressure?", timestamp: Date.now() - 55000 },
      { speaker: Speaker.Patient, text: "It's more like a pressure, and I'm also feeling really tired and short of breath.", timestamp: Date.now() - 50000 },
      { speaker: Speaker.Clinician, text: "Do you have any other medical conditions?", timestamp: Date.now() - 45000 },
      { speaker: Speaker.Patient, text: "I'm diabetic - I take Metformin 500mg twice a day. My blood sugar has been running high lately, around 250.", timestamp: Date.now() - 40000 },
      { speaker: Speaker.Clinician, text: "Any family history of heart disease?", timestamp: Date.now() - 35000 },
      { speaker: Speaker.Patient, text: "Yes, my dad had a heart attack when he was 55. I'm 52 years old.", timestamp: Date.now() - 30000 },
      { speaker: Speaker.Clinician, text: "I see. Let's get a 12-lead EKG, troponin levels, CBC, and a basic metabolic panel stat. We need to rule out acute coronary syndrome.", timestamp: Date.now() - 25000 },
    ];

    setTranscript(demoTranscript);

    // Simulate AI-generated insights
    setSuggestions({
      possibleDiagnoses: [
        { id: 'dx1', title: 'Acute Coronary Syndrome', details: 'Exertional chest tightness with cardiac risk factors (diabetes, family history, age >50)', confidence: 'High' },
        { id: 'dx2', title: 'Unstable Angina', details: 'Progressive anginal symptoms without rest relief', confidence: 'Medium' },
        { id: 'dx3', title: 'Diabetic Cardiomyopathy', details: 'Poorly controlled diabetes with cardiac symptoms', confidence: 'Medium' },
      ],
      recommendedQuestions: [
        { id: 'q1', title: 'Does the pain radiate to your arm, jaw, or back?', details: 'Assess for typical anginal radiation pattern', confidence: 'High' },
        { id: 'q2', title: 'Have you experienced any nausea, sweating, or dizziness?', details: 'Screen for associated autonomic symptoms', confidence: 'High' },
        { id: 'q3', title: 'When was your last HbA1c test?', details: 'Assess glycemic control timeline', confidence: 'Medium' },
      ],
      suggestedLabsAndTests: [
        { id: 'lab1', title: '12-Lead EKG', details: 'Evaluate for ischemic changes, ST elevation/depression', confidence: 'High' },
        { id: 'lab2', title: 'Troponin I/T', details: 'Serial cardiac biomarkers to rule out MI', confidence: 'High' },
        { id: 'lab3', title: 'Basic Metabolic Panel', details: 'Assess electrolytes, glucose, renal function', confidence: 'High' },
      ],
      potentialTreatments: [
        { id: 'tx1', title: 'Aspirin 325mg', details: 'Antiplatelet therapy if no contraindications', confidence: 'High' },
        { id: 'tx2', title: 'Nitroglycerin sublingual', details: 'For symptom relief if BP adequate', confidence: 'Medium' },
      ],
      workingObservations: [
        { id: 'obs1', title: 'Poorly Controlled Type 2 Diabetes', details: 'Blood glucose 250 mg/dL, on Metformin monotherapy', confidence: 'High' },
        { id: 'obs2', title: 'Significant Cardiac Risk Factors', details: 'Age 52, T2DM, family history premature CAD (father at 55)', confidence: 'High' },
        { id: 'obs3', title: 'Exertional Symptoms', details: 'Chest pressure and dyspnea worsen with stair climbing', confidence: 'High' },
      ]
    });

    // Populate Smart Order Sets
    setOrders([
      { id: 'ord1', type: 'Lab', name: '12-Lead EKG', details: 'Evaluate for ST changes and arrhythmias', priority: 'STAT', rationale: 'Rule out acute MI given symptom profile', status: 'suggested' },
      { id: 'ord2', type: 'Lab', name: 'Troponin I (Serial)', details: 'Baseline + 3hr + 6hr levels', priority: 'STAT', rationale: 'High-sensitivity troponin for ACS workup', status: 'suggested' },
      { id: 'ord3', type: 'Lab', name: 'Basic Metabolic Panel', details: 'Electrolytes, glucose, renal function', priority: 'Urgent', rationale: 'Assess for metabolic derangements', status: 'suggested' },
      { id: 'ord4', type: 'Medication', name: 'Aspirin 325mg PO', details: 'Chewable, one-time dose', priority: 'STAT', rationale: 'Antiplatelet therapy - no ASA allergy documented', status: 'suggested' },
      { id: 'ord5', type: 'Medication', name: 'Nitroglycerin 0.4mg SL', details: 'PRN chest pain, may repeat x3', priority: 'Urgent', rationale: 'Symptomatic relief if SBP > 90', status: 'suggested' },
      { id: 'ord6', type: 'Imaging', name: 'Chest X-Ray PA/Lateral', details: 'Portable if patient unstable', priority: 'Routine', rationale: 'Evaluate cardiac silhouette and pulmonary status', status: 'suggested' },
    ]);

    setLastUpdate(Date.now());
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
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${isLive ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-indigo-600 text-white shadow-md'
                  }`}
              >
                {isLive ? <StopIcon /> : <MicIcon />}
                <span>{isLive ? 'Stop Monitoring' : 'Start Scribe'}</span>
              </button>

              <button
                onClick={simulateDemoCase}
                className="px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-all"
                title="Load a demo clinical case for testing"
              >
                🧪 Demo
              </button>

              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`p-2 rounded border transition-all ${isCameraActive ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                <CameraIcon />
              </button>
            </div>
          </div>

          {liveError && (
            <div className="px-4 py-2 text-[10px] font-bold text-rose-700 bg-rose-50 border-b border-rose-100">
              Live session error: {liveError}
            </div>
          )}

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

      {/* Right Panel: Clinical Intelligence */}
      <div className="col-span-3 min-h-0 flex flex-col gap-3 overflow-hidden">
        {/* AI Suggestions */}
        <div className="flex-shrink-0 max-h-[50%] overflow-y-auto custom-scrollbar">
          <AiSuggestionsPanel
            suggestions={suggestions}
            isLoading={isAiLoading}
            visualAnalysis={visualAnalysis}
          />
        </div>

        {/* Smart Order Sets */}
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto custom-scrollbar">
          <OrderSetsPanel orders={orders} />
        </div>

        <div className="p-3 bg-slate-900 text-slate-400 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-800">
          Silent Copilot // Institutional Core
          <div className="mt-1 flex items-center gap-2 opacity-50">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
            Clinical Intelligence: Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationView;
