import React, { useState } from 'react';
import { usePatientMemory, MemoryItem } from '../hooks/usePatientMemory';

interface PatientMemoryPanelProps {
    patientId: number;
    isOpen: boolean;
    onClose: () => void;
}

const TYPE_ICONS: Record<MemoryItem['type'], string> = {
    fact: '📌',
    medication: '💊',
    allergy: '⚠️',
    diagnosis: '🩺',
    note: '📝'
};

const TYPE_COLORS: Record<MemoryItem['type'], { bg: string; text: string; border: string }> = {
    fact: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    medication: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    allergy: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    diagnosis: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    note: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
};

const PatientMemoryPanel: React.FC<PatientMemoryPanelProps> = ({ patientId, isOpen, onClose }) => {
    const { items, addItem, togglePin, forgetItem, clearAll, getPinnedItems } = usePatientMemory(patientId);
    const [newItemContent, setNewItemContent] = useState('');
    const [newItemType, setNewItemType] = useState<MemoryItem['type']>('fact');
    const [showAddForm, setShowAddForm] = useState(false);

    const pinnedItems = getPinnedItems();
    const unpinnedItems = items.filter(item => !item.isPinned);

    const handleAddItem = () => {
        if (!newItemContent.trim()) return;

        addItem({
            type: newItemType,
            content: newItemContent.trim(),
            source: `Manual entry - ${new Date().toLocaleDateString()}`
        });

        setNewItemContent('');
        setShowAddForm(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[550px] max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[12px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            🧠 Longitudinal Memory
                        </h2>
                        <p className="text-[10px] text-indigo-300 mt-0.5">
                            Inspectable store of patient facts across encounters
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-indigo-300 hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Add New Item */}
                    <div className="mb-6">
                        {showAddForm ? (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex gap-2 mb-3">
                                    {(['fact', 'medication', 'allergy', 'diagnosis', 'note'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewItemType(type)}
                                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded transition-all ${newItemType === type
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            {TYPE_ICONS[type]} {type}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={newItemContent}
                                    onChange={(e) => setNewItemContent(e.target.value)}
                                    placeholder="Enter memory content..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-800 uppercase"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!newItemContent.trim()}
                                        className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                    >
                                        Add Memory
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                            >
                                + Add Memory Item
                            </button>
                        )}
                    </div>

                    {/* Pinned Items */}
                    {pinnedItems.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                📌 Pinned Facts
                            </h3>
                            <div className="space-y-2">
                                {pinnedItems.map(item => (
                                    <MemoryItemCard
                                        key={item.id}
                                        item={item}
                                        onTogglePin={() => togglePin(item.id)}
                                        onForget={() => forgetItem(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Items */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span>All Memory Items ({items.length})</span>
                            {items.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-rose-500 hover:text-rose-600 font-bold"
                                >
                                    Clear All
                                </button>
                            )}
                        </h3>
                        {unpinnedItems.length === 0 && pinnedItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <div className="text-3xl mb-2">🧠</div>
                                <p className="text-[11px] font-medium">No memory items yet</p>
                                <p className="text-[10px]">Items from encounters will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {unpinnedItems.map(item => (
                                    <MemoryItemCard
                                        key={item.id}
                                        item={item}
                                        onTogglePin={() => togglePin(item.id)}
                                        onForget={() => forgetItem(item.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 font-medium">
                        Stored locally • {items.length} items
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Memory Item Card Component
const MemoryItemCard: React.FC<{
    item: MemoryItem;
    onTogglePin: () => void;
    onForget: () => void;
}> = ({ item, onTogglePin, onForget }) => {
    const colors = TYPE_COLORS[item.type];

    return (
        <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 group`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span>{TYPE_ICONS[item.type]}</span>
                        <span className={`text-[9px] font-bold uppercase ${colors.text}`}>{item.type}</span>
                        {item.isPinned && (
                            <span className="text-[8px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                PINNED
                            </span>
                        )}
                    </div>
                    <p className={`text-[11px] font-medium ${colors.text}`}>{item.content}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{item.source}</p>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onTogglePin}
                        className="p-1.5 hover:bg-white rounded transition-colors"
                        title={item.isPinned ? 'Unpin' : 'Pin'}
                    >
                        <span className="text-sm">{item.isPinned ? '📌' : '📍'}</span>
                    </button>
                    <button
                        onClick={onForget}
                        className="p-1.5 hover:bg-rose-100 rounded transition-colors text-rose-500"
                        title="Forget"
                    >
                        <span className="text-sm">🗑️</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientMemoryPanel;
