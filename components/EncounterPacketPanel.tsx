import React, { useState } from 'react';
import { EncounterPacket, Provenance, Order, ProblemListItem, PatientInstruction, FollowUp } from '../types';

interface EncounterPacketPanelProps {
    packet: EncounterPacket;
    onSign?: () => void;
    onExportFHIR?: () => void;
}

const ProvenanceTooltip: React.FC<{ provenance?: Provenance }> = ({ provenance }) => {
    if (!provenance) return null;

    return (
        <div className="group relative inline-block ml-1">
            <span className="cursor-help text-indigo-400 text-[9px] font-bold uppercase">[src]</span>
            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                <div className="font-bold text-indigo-300 mb-1">Evidence</div>
                <p className="italic text-slate-300 mb-2">"{provenance.quote}"</p>
                <div className="text-slate-400 mb-1"><span className="font-bold">Reasoning:</span> {provenance.reasoning}</div>
                <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${provenance.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' :
                            provenance.confidence === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                        }`}>{provenance.confidence}</span>
                </div>
                {provenance.alternativeInterpretations && provenance.alternativeInterpretations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700 text-slate-500">
                        <span className="font-bold">Alternatives:</span> {provenance.alternativeInterpretations.join('; ')}
                    </div>
                )}
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ title: string; icon?: string }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
        {icon && <span>{icon}</span>}
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{title}</h4>
    </div>
);

const EncounterPacketPanel: React.FC<EncounterPacketPanelProps> = ({ packet, onSign, onExportFHIR }) => {
    const [activeTab, setActiveTab] = useState<'soap' | 'orders' | 'instructions' | 'safety'>('soap');

    const tabs = [
        { id: 'soap' as const, label: 'SOAP Note', icon: '📋' },
        { id: 'orders' as const, label: 'Orders', icon: '💊' },
        { id: 'instructions' as const, label: 'Instructions', icon: '📄' },
        { id: 'safety' as const, label: 'Safety', icon: '🚨' },
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between">
                <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Encounter Packet</h3>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {packet.patientName} • Generated {new Date(packet.generatedAt).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${packet.signatureStatus === 'Signed' ? 'bg-emerald-500/20 text-emerald-400' :
                            packet.signatureStatus === 'PendingReview' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-700 text-slate-400'
                        }`}>
                        {packet.signatureStatus}
                    </span>
                </div>
            </div>

            {/* Red Flags Alert */}
            {packet.redFlags.length > 0 && (
                <div className="bg-rose-50 border-b border-rose-200 px-4 py-2">
                    <div className="flex items-center gap-2 text-rose-700">
                        <span className="text-sm">⚠️</span>
                        <span className="text-[10px] font-black uppercase">Critical Findings Require Review</span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                        {packet.redFlags.map((flag, i) => (
                            <li key={i} className="text-[11px] text-rose-600 font-medium">• {flag}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="mr-1">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'soap' && (
                    <div className="space-y-4">
                        {/* Subjective */}
                        <div>
                            <SectionHeader title="Subjective" icon="🗣️" />
                            <div className="space-y-2">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Chief Complaint</span>
                                    <p className="text-[12px] text-slate-800 font-medium">{packet.soapNote.subjective.chiefComplaint}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">HPI</span>
                                    <p className="text-[11px] text-slate-700 leading-relaxed">{packet.soapNote.subjective.historyOfPresentIllness}</p>
                                    {packet.soapNote.subjective.provenance?.[0] && (
                                        <ProvenanceTooltip provenance={packet.soapNote.subjective.provenance[0]} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Objective */}
                        <div>
                            <SectionHeader title="Objective" icon="🔬" />
                            <div className="space-y-2 text-[11px] text-slate-700">
                                {packet.soapNote.objective.vitalSigns && (
                                    <div><span className="font-bold">Vitals:</span> {packet.soapNote.objective.vitalSigns}</div>
                                )}
                                {packet.soapNote.objective.physicalExam && (
                                    <div><span className="font-bold">Exam:</span> {packet.soapNote.objective.physicalExam}</div>
                                )}
                                {packet.soapNote.objective.visualFindings && (
                                    <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                                        <span className="font-bold text-indigo-700">📷 Visual Analysis:</span> {packet.soapNote.objective.visualFindings}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assessment */}
                        <div>
                            <SectionHeader title="Assessment" icon="🎯" />
                            <div className="space-y-1">
                                {packet.soapNote.assessment.diagnoses.map((dx, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-[10px] font-black text-indigo-600">{i + 1}.</span>
                                        <span className="text-[11px] text-slate-800">{dx}</span>
                                    </div>
                                ))}
                                {packet.soapNote.assessment.differentials && packet.soapNote.assessment.differentials.length > 0 && (
                                    <div className="mt-2 pl-3 border-l-2 border-slate-200">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Differentials</span>
                                        <p className="text-[10px] text-slate-600">{packet.soapNote.assessment.differentials.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Plan */}
                        <div>
                            <SectionHeader title="Plan" icon="📝" />
                            <div className="space-y-2">
                                {packet.soapNote.plan.treatments.length > 0 && (
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Treatments</span>
                                        <ul className="mt-1 space-y-0.5">
                                            {packet.soapNote.plan.treatments.map((tx, i) => (
                                                <li key={i} className="text-[11px] text-slate-700">• {tx}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {packet.soapNote.plan.tests.length > 0 && (
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Tests/Labs</span>
                                        <ul className="mt-1 space-y-0.5">
                                            {packet.soapNote.plan.tests.map((test, i) => (
                                                <li key={i} className="text-[11px] text-slate-700">• {test}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Problem List */}
                        {packet.problemList.length > 0 && (
                            <div>
                                <SectionHeader title="Problem List" icon="📑" />
                                <div className="space-y-1">
                                    {packet.problemList.map((problem, i) => (
                                        <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded">
                                            <span className="text-slate-800">{problem.description}</span>
                                            <span className={`text-[9px] font-bold uppercase ${problem.status === 'Active' ? 'text-rose-500' :
                                                    problem.status === 'Chronic' ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>{problem.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-3">
                        <SectionHeader title="Orders Draft" icon="💊" />
                        {packet.orders.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic">No orders generated from this encounter.</p>
                        ) : (
                            <div className="space-y-2">
                                {packet.orders.map((order, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${order.type === 'Medication' ? 'bg-purple-100 text-purple-600' :
                                                    order.type === 'Lab' ? 'bg-blue-100 text-blue-600' :
                                                        order.type === 'Imaging' ? 'bg-cyan-100 text-cyan-600' :
                                                            order.type === 'Referral' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-slate-200 text-slate-600'
                                                }`}>{order.type}</span>
                                            <span className={`text-[9px] font-bold uppercase ${order.priority === 'STAT' ? 'text-rose-600' :
                                                    order.priority === 'Urgent' ? 'text-amber-600' : 'text-slate-500'
                                                }`}>{order.priority}</span>
                                        </div>
                                        <p className="text-[12px] text-slate-800 font-medium">{order.description}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{order.rationale}</p>
                                        {order.provenance && <ProvenanceTooltip provenance={order.provenance} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'instructions' && (
                    <div className="space-y-4">
                        <SectionHeader title="Patient Instructions" icon="📄" />
                        {packet.patientInstructions.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic">No patient instructions generated.</p>
                        ) : (
                            <div className="space-y-2">
                                {packet.patientInstructions.map((inst, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-bold uppercase text-slate-500">{inst.category}</span>
                                            {inst.language !== 'en' && (
                                                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                                                    {inst.language.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-800">{inst.instruction}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <SectionHeader title="Follow-Ups" icon="📅" />
                        {packet.followUps.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic">No follow-ups scheduled.</p>
                        ) : (
                            <div className="space-y-2">
                                {packet.followUps.map((fu, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 px-3 py-2 rounded border border-slate-200">
                                        <div>
                                            <span className="font-bold text-slate-800">{fu.type}</span>
                                            <span className="text-slate-500 ml-2">— {fu.reason}</span>
                                        </div>
                                        <span className="text-indigo-600 font-bold">{fu.timeframe}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'safety' && (
                    <div className="space-y-4">
                        <SectionHeader title="Safety Review" icon="🚨" />

                        {/* Red Flags */}
                        <div>
                            <h5 className="text-[10px] font-bold text-rose-600 uppercase mb-2">Red Flags Detected</h5>
                            {packet.redFlags.length === 0 ? (
                                <div className="bg-emerald-50 text-emerald-700 text-[11px] px-3 py-2 rounded border border-emerald-200">
                                    ✓ No critical findings detected
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {packet.redFlags.map((flag, i) => (
                                        <div key={i} className="bg-rose-50 text-rose-700 text-[11px] px-3 py-2 rounded border border-rose-200">
                                            ⚠️ {flag}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirmation Status */}
                        <div>
                            <h5 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Human Confirmation</h5>
                            {packet.requiresConfirmation ? (
                                <div className="bg-amber-50 text-amber-700 text-[11px] px-3 py-2 rounded border border-amber-200">
                                    ⏳ This packet requires clinician review before any actions are taken.
                                </div>
                            ) : (
                                <div className="bg-emerald-50 text-emerald-700 text-[11px] px-3 py-2 rounded border border-emerald-200">
                                    ✓ Packet has been reviewed
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={onExportFHIR}
                    className="text-[10px] font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                    <span>🔗</span> Export FHIR Bundle
                </button>
                <button
                    onClick={onSign}
                    disabled={packet.signatureStatus === 'Signed'}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${packet.signatureStatus === 'Signed'
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                        }`}
                >
                    {packet.signatureStatus === 'Signed' ? '✓ Signed' : 'Review & Sign'}
                </button>
            </div>
        </div>
    );
};

export default EncounterPacketPanel;
