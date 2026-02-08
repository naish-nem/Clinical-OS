
import React, { useEffect, useRef } from 'react';
import { TranscriptEntry, Speaker } from '../types';

interface TranscriptionPanelProps {
  transcript: TranscriptEntry[];
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ transcript }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 py-6">
        {transcript.length > 0 && (
          <div className="space-y-6">
            {transcript.map((entry, index) => {
              const isClinician = entry.speaker === Speaker.Clinician;
              
              return (
                <div key={`${entry.timestamp}-${index}`} className="group relative border-l border-slate-100 pl-6 pb-2">
                  <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full border border-white bg-slate-200 group-hover:bg-indigo-400 transition-colors"></div>
                  
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isClinician ? 'text-indigo-600' : 'text-slate-900'
                    }`}>
                      {isClinician ? 'Clinician' : 'Patient'}
                    </span>
                    <span className="mono-data text-[9px] text-slate-300 font-bold">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className={`text-[13px] leading-relaxed font-medium ${isClinician ? 'text-slate-600' : 'text-slate-900'}`}>
                    {entry.text}
                  </p>
                </div>
              );
            })}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionPanel;
