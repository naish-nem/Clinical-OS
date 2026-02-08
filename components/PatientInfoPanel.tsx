
import React, { useState } from 'react';
import { Patient } from '../types';
import { PatientAvatar } from './PatientAvatar';

interface PatientInfoPanelProps {
  patient: Patient;
}

const PatientInfoPanel: React.FC<PatientInfoPanelProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'logs'>('chart');

  return (
    <div className="cps-card h-full flex flex-col overflow-hidden bg-white">
      {/* Patient Biography Header */}
      <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/30">
        <PatientAvatar name={patient.name} url={patient.avatarUrl} size="lg" className="rounded-lg shadow-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <h3 className="text-sm font-black text-slate-900 truncate">{patient.name}</h3>
             <span className="mono-data text-[9px] font-bold text-slate-400">#{patient.id === 999 ? 'NEW' : patient.id}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            {patient.gender} • {patient.age > 0 ? `${patient.age}Y` : 'Age Unspecified'}
          </p>
          <div className="mt-2 flex gap-1">
             <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black rounded uppercase">
               {patient.id === 999 ? 'Emergency Entry' : 'Verified EHR Record'}
             </span>
          </div>
        </div>
      </div>

      {/* Panel Navigation */}
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest relative ${activeTab === 'chart' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Clinical Context
          {activeTab === 'chart' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest relative ${activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Historical Encounter
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
      </div>

      {/* Content Area with Empty State Handling */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-6">
        {activeTab === 'chart' ? (
          <div className="space-y-6 animate-clinical">
            <section>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex justify-between items-center">
                Documented History
                <span className="text-[7px] font-normal lowercase opacity-60">Source: Central Registry</span>
              </h4>
              <div className="space-y-1.5">
                {patient.medicalHistory.length > 0 ? (
                  patient.medicalHistory.map((item, i) => (
                    <div key={i} className="text-[11px] font-bold text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/60">{item}</div>
                  ))
                ) : (
                  <div className="p-3 border border-dashed border-slate-200 rounded text-center">
                    <p className="text-[10px] italic text-slate-400">Minimal longitudinal data. Establish clinical baseline during ambient intake.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-2">Active Regimen</h4>
              <div className="space-y-1.5">
                {patient.currentMedications.length > 0 ? (
                  patient.currentMedications.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 group">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] italic text-slate-400 pl-2 border-l border-slate-100">No active pharmacy records found.</p>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.15em] mb-2">High Risk Alerts</h4>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-black rounded uppercase">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded uppercase border border-emerald-100">No Known Clinical Allergies (NKCA)</span>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4 animate-clinical">
            {patient.previousConsultations.length > 0 ? (
              patient.previousConsultations.map((visit, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-4 py-1 group hover:border-indigo-400 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="mono-data text-[9px] font-bold text-slate-400">{visit.date}</span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{visit.type}</span>
                  </div>
                  <h5 className="text-[11px] font-black text-slate-800 leading-tight">{visit.diagnosis}</h5>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{visit.summary}</p>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded p-6 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No Past Encounters</p>
                <p className="text-[11px] text-slate-400 font-medium">This is likely a new patient or an external referral without linked records.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
        Secured HIPAA Node // Real-time EHR Sync
      </div>
    </div>
  );
};

export default PatientInfoPanel;
