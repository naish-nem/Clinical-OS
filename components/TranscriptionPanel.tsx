
import React, { useEffect, useRef, useState } from 'react';
import { TranscriptEntry, Speaker } from '../types';

interface TranscriptionPanelProps {
  transcript: TranscriptEntry[];
  piiRedactionEnabled?: boolean;
}

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  hi: 'हिंदी',
  zh: '中文',
  he: 'עברית',
  ar: 'العربية',
  pt: 'Português',
  fr: 'Français',
};

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ transcript, piiRedactionEnabled }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const hasMultilingualContent = transcript.some(e => e.originalText && e.detectedLanguage && e.detectedLanguage !== 'en');

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Multilingual Toggle */}
      {hasMultilingualContent && (
        <div className="px-6 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">🌐 Multilingual Session</span>
            <span className="text-[9px] text-indigo-500">Code-switching detected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Show:</span>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`px-2 py-1 text-[9px] font-bold uppercase rounded transition-all ${showOriginal
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
                }`}
            >
              {showOriginal ? 'Original + English' : 'English Only'}
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 py-6">
        {transcript.length > 0 && (
          <div className="space-y-6">
            {transcript.map((entry, index) => {
              const isClinician = entry.speaker === Speaker.Clinician;
              const isNonEnglish = entry.originalText && entry.detectedLanguage && entry.detectedLanguage !== 'en';

              return (
                <div key={`${entry.timestamp}-${index}`} className="group relative border-l border-slate-100 pl-6 pb-2">
                  <div className={`absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full border border-white transition-colors ${isNonEnglish ? 'bg-purple-400' : 'bg-slate-200 group-hover:bg-indigo-400'
                    }`}></div>

                  <div className="flex items-baseline gap-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isClinician ? 'text-indigo-600' : 'text-slate-900'
                      }`}>
                      {isClinician ? 'Clinician' : 'Patient'}
                    </span>
                    <span className="mono-data text-[9px] text-slate-300 font-bold">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {isNonEnglish && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[8px] font-bold uppercase rounded">
                        {LANGUAGE_NAMES[entry.detectedLanguage!] || entry.detectedLanguage}
                      </span>
                    )}
                  </div>

                  {/* Show original if non-English and toggle is on */}
                  {isNonEnglish && showOriginal && (
                    <div className="mb-2 pl-3 border-l-2 border-purple-200">
                      <p className="text-[12px] leading-relaxed font-medium text-purple-700 italic">
                        {entry.originalText}
                      </p>
                      <span className="text-[8px] text-purple-400 uppercase font-bold">Original</span>
                    </div>
                  )}

                  {/* Clinical English */}
                  <p className={`text-[13px] leading-relaxed font-medium ${isClinician ? 'text-slate-600' : 'text-slate-900'}`}>
                    {entry.text}
                  </p>
                  {isNonEnglish && showOriginal && (
                    <span className="text-[8px] text-slate-400 uppercase font-bold">Clinical English</span>
                  )}
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

