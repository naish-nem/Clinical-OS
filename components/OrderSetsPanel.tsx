import React, { useState } from 'react';

export interface OrderItem {
    id: string;
    type: 'Medication' | 'Lab' | 'Imaging' | 'Referral' | 'Procedure';
    name: string;
    details: string;
    priority: 'STAT' | 'Urgent' | 'Routine';
    rationale?: string;
    status: 'suggested' | 'pending' | 'ordered';
}

interface OrderSetsPanelProps {
    orders: OrderItem[];
    onOrderClick?: (orderId: string) => void;
}

const typeStyles: Record<OrderItem['type'], { bg: string; icon: string; border: string }> = {
    Medication: { bg: 'from-purple-500/10 to-purple-600/5', icon: '💊', border: 'border-purple-300/50' },
    Lab: { bg: 'from-blue-500/10 to-blue-600/5', icon: '🧪', border: 'border-blue-300/50' },
    Imaging: { bg: 'from-cyan-500/10 to-cyan-600/5', icon: '📷', border: 'border-cyan-300/50' },
    Referral: { bg: 'from-amber-500/10 to-amber-600/5', icon: '🏥', border: 'border-amber-300/50' },
    Procedure: { bg: 'from-emerald-500/10 to-emerald-600/5', icon: '🩺', border: 'border-emerald-300/50' },
};

const priorityStyles: Record<OrderItem['priority'], { badge: string; pulse?: boolean }> = {
    STAT: { badge: 'bg-rose-500 text-white', pulse: true },
    Urgent: { badge: 'bg-amber-500 text-white', pulse: false },
    Routine: { badge: 'bg-slate-400 text-white', pulse: false },
};

const OrderSetsPanel: React.FC<OrderSetsPanelProps> = ({ orders, onOrderClick }) => {
    const [orderedIds, setOrderedIds] = useState<Set<string>>(new Set());

    const handleOrder = (id: string) => {
        setOrderedIds(prev => new Set([...prev, id]));
        onOrderClick?.(id);
    };

    if (orders.length === 0) {
        return (
            <div className="p-4 text-center">
                <div className="text-slate-400 text-[11px] font-medium">
                    Order suggestions will appear as clinical context is gathered...
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    Smart Order Sets
                </h3>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {orders.length} suggested
                </span>
            </div>

            <div className="space-y-2">
                {orders.map((order, index) => {
                    const isOrdered = orderedIds.has(order.id);
                    const style = typeStyles[order.type];
                    const priority = priorityStyles[order.priority];

                    return (
                        <div
                            key={order.id}
                            className={`
                relative overflow-hidden rounded-lg border ${style.border}
                bg-gradient-to-r ${style.bg}
                transform transition-all duration-500 ease-out
                hover:scale-[1.02] hover:shadow-lg
                ${isOrdered ? 'opacity-60' : ''}
              `}
                            style={{
                                animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`,
                            }}
                        >
                            <div className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-lg">{style.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-slate-800 truncate">
                                                    {order.name}
                                                </span>
                                                <span className={`
                          px-1.5 py-0.5 rounded text-[8px] font-black uppercase
                          ${priority.badge}
                          ${priority.pulse ? 'animate-pulse' : ''}
                        `}>
                                                    {order.priority}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">
                                                {order.details}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOrder(order.id)}
                                        disabled={isOrdered}
                                        className={`
                      px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider
                      transition-all duration-300 transform
                      ${isOrdered
                                                ? 'bg-emerald-500 text-white scale-95'
                                                : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm'
                                            }
                    `}
                                    >
                                        {isOrdered ? '✓ Ordered' : 'Order'}
                                    </button>
                                </div>

                                {order.rationale && (
                                    <div className="mt-2 pt-2 border-t border-slate-200/50">
                                        <p className="text-[9px] text-slate-600 italic">
                                            💡 {order.rationale}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Shimmer effect */}
                            {!isOrdered && (
                                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default OrderSetsPanel;
