import React, { useEffect, useState } from 'react';

export interface OutcomeMetric {
    id: string;
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'stable';
    severity: 'good' | 'warning' | 'critical';
}

interface OutcomesWidgetProps {
    riskScore: number; // 0-100
    riskLabel: string;
    metrics: OutcomeMetric[];
}

const OutcomesWidget: React.FC<OutcomesWidgetProps> = ({ riskScore, riskLabel, metrics }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = riskScore / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= riskScore) {
                setAnimatedScore(riskScore);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [riskScore]);

    const getScoreColor = (score: number) => {
        if (score < 30) return { stroke: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600' };
        if (score < 60) return { stroke: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-600' };
        return { stroke: '#ef4444', bg: 'bg-rose-500', text: 'text-rose-600' };
    };

    const scoreColor = getScoreColor(animatedScore);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    const trendIcons = {
        up: '↑',
        down: '↓',
        stable: '→',
    };

    const severityStyles = {
        good: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-100 text-amber-700 border-amber-200',
        critical: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    return (
        <div className="p-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Predictive Outcomes
            </h3>

            {/* Risk Gauge */}
            <div className="flex items-center justify-center mb-4">
                <div className="relative">
                    <svg width="120" height="120" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                        />
                        {/* Animated progress circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke={scoreColor.stroke}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-300 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-black ${scoreColor.text}`}>
                            {animatedScore}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Risk Score
                        </span>
                    </div>
                </div>
            </div>

            {/* Risk Label */}
            <div className={`text-center mb-4 py-2 px-3 rounded-lg ${scoreColor.bg} bg-opacity-10`}>
                <span className={`text-[11px] font-bold ${scoreColor.text}`}>
                    {riskLabel}
                </span>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-2">
                {metrics.map((metric, index) => (
                    <div
                        key={metric.id}
                        className={`
              flex items-center justify-between p-2 rounded-lg border
              ${severityStyles[metric.severity]}
              transform transition-all duration-300
              hover:scale-[1.02]
            `}
                        style={{
                            animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
                        }}
                    >
                        <span className="text-[10px] font-medium">{metric.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold">{metric.value}</span>
                            <span className={`text-[12px] ${metric.trend === 'up' ? 'text-rose-500' :
                                    metric.trend === 'down' ? 'text-emerald-500' :
                                        'text-slate-400'
                                }`}>
                                {trendIcons[metric.trend]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default OutcomesWidget;
