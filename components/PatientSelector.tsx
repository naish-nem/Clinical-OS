
import React from 'react';
import { Patient } from '../types';
import { PatientAvatar } from './PatientAvatar';

interface PatientSelectorProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ patients, onSelectPatient }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {patients.map((patient) => (
          <button
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className="group text-left cps-card p-4 hover:border-indigo-400 transition-all bg-white border-slate-200"
          >
            <div className="flex items-start gap-4">
              <PatientAvatar name={patient.name} url={patient.avatarUrl} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="mono-data text-[10px] font-bold text-slate-400">MRN-{patient.id}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{patient.name}</h3>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tighter">
                  {patient.gender} • {patient.age > 0 ? `${patient.age}Y` : 'New Entry'}
                </p>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {patient.medicalHistory.length > 0 ? patient.medicalHistory.slice(0, 2).map((h, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-600 rounded border border-slate-200 uppercase truncate max-w-full">
                      {h}
                    </span>
                  )) : (
                    <span className="px-1.5 py-0.5 bg-slate-50 text-[9px] font-medium text-slate-400 rounded italic uppercase truncate max-w-full">
                      No Records
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
              Initialize Encounter →
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-4 bg-slate-100/50 rounded-lg border border-slate-200">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Queue Intelligence</p>
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Select a patient record to begin an ambient consultation session. The copilot will automatically synchronize historical EHR data with real-time conversation and visual diagnostics. 
          Support included for <span className="text-slate-900 font-bold">English, Spanish, Hindi, Hebrew, Mandarin</span>, and specialized community contexts.
        </p>
      </div>
    </div>
  );
};

export default PatientSelector;
