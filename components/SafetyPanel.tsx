import React, { useState } from 'react';

interface SafetyPanelProps {
    isOpen: boolean;
    onClose: () => void;
    redFlags: string[];
    onPIIRedactionChange?: (enabled: boolean) => void;
    piiRedactionEnabled?: boolean;
}

// PII detection patterns
const PII_PATTERNS = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, label: 'SSN' },
    { pattern: /\b\d{9}\b/g, label: 'SSN' },
    { pattern: /\b\d{10}\b/g, label: 'Phone' },
    { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, label: 'Phone' },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: 'Email' },
    { pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, label: 'Date' },
    { pattern: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, label: 'Date' },
];

// Critical symptom patterns that require immediate attention
const RED_FLAG_PATTERNS = [
    { pattern: /chest\s*pain/gi, severity: 'critical', action: 'Consider ACS workup' },
    { pattern: /shortness\s*of\s*breath/gi, severity: 'high', action: 'Assess oxygenation' },
    { pattern: /suicid/gi, severity: 'critical', action: 'Immediate psychiatric evaluation' },
    { pattern: /homicid/gi, severity: 'critical', action: 'Safety protocol required' },
    { pattern: /stroke|tia|transient\s*ischemic/gi, severity: 'critical', action: 'Time-sensitive intervention' },
    { pattern: /seizure/gi, severity: 'high', action: 'Neuro evaluation' },
    { pattern: /severe\s*(head)?ache|worst\s*headache/gi, severity: 'critical', action: 'Rule out SAH' },
    { pattern: /syncop|pass(ed)?\s*out|faint/gi, severity: 'high', action: 'Cardiac/neuro workup' },
    { pattern: /anaphyla|allergic\s*reaction/gi, severity: 'critical', action: 'Epinephrine ready' },
    { pattern: /cough(ing)?\s*blood|hemoptysis/gi, severity: 'critical', action: 'Urgent imaging' },
    { pattern: /blood\s*in\s*stool|melena|hematochezia/gi, severity: 'high', action: 'GI evaluation' },
    { pattern: /child\s*abuse|abuse|neglect/gi, severity: 'critical', action: 'Mandatory reporting' },
];

export const detectPII = (text: string): Array<{ match: string; label: string; index: number }> => {
    const findings: Array<{ match: string; label: string; index: number }> = [];

    PII_PATTERNS.forEach(({ pattern, label }) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
            findings.push({ match: match[0], label, index: match.index });
        }
    });

    return findings;
};

export const detectRedFlags = (text: string): Array<{ match: string; severity: string; action: string }> => {
    const findings: Array<{ match: string; severity: string; action: string }> = [];

    RED_FLAG_PATTERNS.forEach(({ pattern, severity, action }) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
            findings.push({ match: match[0], severity, action });
        }
    });

    // Deduplicate by match
    return findings.filter((v, i, a) => a.findIndex(t => t.match.toLowerCase() === v.match.toLowerCase()) === i);
};

export const redactPII = (text: string): string => {
    let redacted = text;

    PII_PATTERNS.forEach(({ pattern, label }) => {
        redacted = redacted.replace(pattern, `[REDACTED ${label}]`);
    });

    return redacted;
};

const SafetyPanel: React.FC<SafetyPanelProps> = ({
    isOpen,
    onClose,
    redFlags,
    onPIIRedactionChange,
    piiRedactionEnabled = false
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[12px] font-black text-white uppercase tracking-widest">Safety & Privacy Panel</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Configure safety controls for this session</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* PII Redaction */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">PII Redaction Mode</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Automatically mask sensitive patient information in display</p>
                            </div>
                            <button
                                onClick={() => onPIIRedactionChange?.(!piiRedactionEnabled)}
                                className={`w-12 h-6 rounded-full transition-all relative ${piiRedactionEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${piiRedactionEnabled ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                        <div className={`text-[10px] px-3 py-2 rounded border ${piiRedactionEnabled
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                            {piiRedactionEnabled
                                ? '✓ SSN, phone numbers, emails, and dates will be masked in the UI'
                                : '⚠ PII may be visible in transcript and notes'
                            }
                        </div>
                    </div>

                    {/* Red Flags */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3">
                            🚨 Red Flag Detector
                        </h3>
                        {redFlags.length === 0 ? (
                            <div className="bg-emerald-50 text-emerald-700 text-[11px] px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span>No critical findings detected in current session</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {redFlags.map((flag, i) => (
                                    <div key={i} className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-2 text-rose-700 font-bold text-[11px]">
                                            <span className="text-rose-500">⚠️</span>
                                            {flag}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Human Confirmation Workflow */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3">
                            👤 Human Confirmation Workflow
                        </h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-[11px] text-amber-800 mb-3">
                                AI-generated content requires clinician review before:
                            </p>
                            <ul className="text-[10px] text-amber-700 space-y-1.5 ml-2">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Orders are submitted to pharmacy/lab
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Notes are added to permanent medical record
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Patient instructions are shared
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Referrals are initiated
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contraindication Checks */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3">
                            💊 Contraindication Alerts
                        </h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <p className="text-[10px] text-slate-600">
                                Medication contraindications are checked against:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['Allergies', 'Current Meds', 'Conditions', 'Age', 'Pregnancy'].map(item => (
                                    <span key={item} className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Close Panel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SafetyPanel;
