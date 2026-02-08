
import React, { useState } from 'react';
import { MedicalSuggestions, VisualAnalysis, MedicalInsight } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { Loader } from './Loader';

interface AiSuggestionsPanelProps {
  suggestions: MedicalSuggestions | null;
  isLoading: boolean;
  visualAnalysis?: VisualAnalysis | null;
}

const AiSuggestionsPanel: React.FC<AiSuggestionsPanelProps> = ({ suggestions, isLoading, visualAnalysis }) => {
  const [activeTab, setActiveTab] = useState<'DECISION' | 'BUFFER'>('DECISION');

  const highConfidenceDiagnoses = suggestions?.possibleDiagnoses.filter(d => d.confidence === 'High') || [];
  const bufferInsights = [
    ...(suggestions?.workingObservations || []),
    ...(suggestions?.possibleDiagnoses.filter(d => d.confidence !== 'High') || [])
  ];

  const renderInsight = (insight: MedicalInsight) => (
    <div key={insight.id || Math.random()} className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group">
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <h5 className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">{insight.title}</h5>
        {insight.confidence === 'High' && (
          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded border border-emerald-100 uppercase">Verified</span>
        )}
      </div>
      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{insight.details}</p>
      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-[8px] font-black uppercase text-indigo-600 hover:underline">Link to Chart</button>
      </div>
    </div>
  );

  return (
    <div className="cps-card h-full flex flex-col bg-white overflow-hidden shadow-xl border-slate-200">
      <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Support Engine</h3>
        </div>
        {isLoading && <Loader />}
      </div>

      <div className="grid grid-cols-2 bg-slate-50/30 border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('DECISION')}
          className={`py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'DECISION' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'
          }`}
        >
          Decision Engine ({highConfidenceDiagnoses.length})
        </button>
        <button 
          onClick={() => setActiveTab('BUFFER')}
          className={`py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'BUFFER' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'
          }`}
        >
          Observation Buffer ({bufferInsights.length})
        </button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {visualAnalysis && activeTab === 'DECISION' && (
          <div className="m-3 p-3 bg-indigo-900 text-white rounded shadow-lg border-l-4 border-indigo-400">
            <span className="text-[8px] font-black uppercase text-indigo-300 tracking-widest block mb-1">Multimodal Evidence</span>
            <p className="text-[11px] font-bold leading-tight">{visualAnalysis.observation}</p>
          </div>
        )}

        {activeTab === 'DECISION' ? (
          <div>
            {highConfidenceDiagnoses.length > 0 ? (
              highConfidenceDiagnoses.map(renderInsight)
            ) : (
              <div className="p-8 text-center opacity-40">
                <SparklesIcon className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest">High Confidence Required</p>
                <p className="text-[11px] mt-1">Confirmed clinical findings will populate here.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {bufferInsights.length > 0 ? (
              bufferInsights.map(renderInsight)
            ) : (
              <div className="p-8 text-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest">Monitoring Buffer</p>
                <p className="text-[11px] mt-1">Collecting emerging narrative patterns...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-900 text-slate-500 text-[8px] font-black uppercase tracking-widest flex justify-between items-center">
        <span>Grounded Analysis</span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionsPanel;
