
import React, { useState, useEffect } from 'react';
import { Patient } from './types';
import { MOCK_PATIENTS } from './constants';
import PatientSelector from './components/PatientSelector';
import ConsultationView from './components/ConsultationView';
import PortalPrimer from './components/PortalPrimer';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [showPrimer, setShowPrimer] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const aistudio = (window as any).aistudio;
        if (aistudio) {
          const exists = await aistudio.hasSelectedApiKey();
          setHasKey(exists);
        } else {
          setHasKey(true);
        }
      } catch (e) {
        setHasKey(true);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();

    // Check if user has already dismissed primer in this session
    const primerDismissed = sessionStorage.getItem('clinical_os_primer_dismissed');
    if (primerDismissed) {
      setShowPrimer(false);
    }
  }, []);

  const handleDismissPrimer = () => {
    setShowPrimer(false);
    sessionStorage.setItem('clinical_os_primer_dismissed', 'true');
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center animate-pulse">
          <LogoIcon />
          <p className="mt-4 text-[10px] font-black text-white uppercase tracking-widest">Initialising Secure Node...</p>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 px-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden p-8 border border-white/10">
          <div className="flex justify-center mb-6">
            <LogoIcon />
          </div>
          <h2 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">Institutional Access Required</h2>
          <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
            To enable real-time multimodal intelligence, you must select an API key associated with a paid Google Cloud project.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-lg text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98]"
          >
            Select API Key
          </button>
          <p className="mt-6 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Note: Billing documentation available at <br />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">ai.google.dev/gemini-api/docs/billing</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="h-14 bg-slate-900 flex items-center px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <LogoIcon />
          <div className="h-6 w-px bg-white/20"></div>
          <h1 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
            Clinical<span className="text-indigo-400 font-medium">OS</span>
          </h1>
        </div>
        
        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
               Node: Secure
            </div>
          </div>
          {selectedPatient && (
            <button
              onClick={() => setSelectedPatient(null)}
              className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded uppercase transition-colors"
            >
              Exit Encounter
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-grow overflow-hidden">
        <div className="h-full p-6 overflow-y-auto custom-scrollbar">
          {!selectedPatient ? (
            <div className="max-w-6xl mx-auto flex flex-col min-h-full">
              {showPrimer && <PortalPrimer onDismiss={handleDismissPrimer} />}
              
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Encounter Queue</h2>
                <p className="text-sm font-medium text-slate-500">Initiate ambient intelligence for the next scheduled record.</p>
              </div>
              
              <div className="flex-grow">
                <PatientSelector patients={MOCK_PATIENTS} onSelectPatient={setSelectedPatient} />
              </div>
            </div>
          ) : (
            <div className="h-full">
              <ConsultationView patient={selectedPatient} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
