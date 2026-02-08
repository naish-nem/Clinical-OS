
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { MicIcon } from './icons/MicIcon';
import { CameraIcon } from './icons/CameraIcon';

interface PortalPrimerProps {
  onDismiss: () => void;
}

const PortalPrimer: React.FC<PortalPrimerProps> = ({ onDismiss }) => {
  return (
    <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-[#0f172a] p-12 shadow-2xl border border-white/5 animate-clinical">
      {/* Mesh Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-16">
        {/* Header Section */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 mb-8">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.25em]">Clinical Intelligence Platform</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
            The Silent Observer for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Modern Clinician.</span>
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed font-medium max-w-3xl">
            ClinicalOS leverages Gemini 2.5 Flash Multimodal reasoning to transform ambient room audio and visual data into structured evidence—without ever distracting you from patient care.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <MicIcon className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 rounded-xl mb-6">
                <MicIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Ambient Capture</h4>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                Seamless multi-speaker diarization that distinguishes clinical dialogue from patient narrative automatically.
              </p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="relative p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <SparklesIcon className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 rounded-xl mb-6">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Decision Engine</h4>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                Emerging patterns are refined in real-time. Only high-confidence findings are promoted to your primary dashboard.
              </p>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="relative p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <CameraIcon className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 rounded-xl mb-6">
                <CameraIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Visual Evidence</h4>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                Ground your observations with multimodal frame analysis, providing visual context for complex physical findings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-8 pt-8 border-t border-white/5">
          <button 
            onClick={onDismiss}
            className="w-full sm:w-auto px-10 py-5 bg-white text-[#0f172a] rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-50 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
          >
            Acknowledge & Start Session
          </button>
          
          <div className="flex items-center gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
               HIPAA Secure Node
            </div>
            <div className="flex items-center gap-2.5">
               <span className="w-2 h-2 rounded-full bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
               Real-time EHR Sync
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalPrimer;
