import React from 'react'
import Icon from './Icon'

interface KPIProps {
  label: string;
  value: string | number;
  delta?: number;
  positive?: boolean;
}

export const KPI: React.FC<KPIProps> = ({ label, value, delta, positive }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-2xl font-semibold text-white mt-1">{value}</div>
    {typeof delta !== 'undefined' && (
      <div className={`text-xs mt-1 ${positive ? 'text-green-300' : 'text-red-300'}`}>{positive ? '▲' : '▼'} {delta}%</div>
    )}
  </div>
)

interface StatCardProps extends KPIProps {
  icon: string;
  tone?: 'blue' | 'emerald' | 'indigo' | 'violet' | 'rose' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, delta, positive, icon, tone = 'blue' }) => {
  const toneBg = tone === 'emerald'
    ? 'bg-emerald-600/20 text-emerald-300'
    : tone === 'indigo'
    ? 'bg-indigo-600/20 text-indigo-300'
    : tone === 'violet'
    ? 'bg-violet-600/20 text-violet-300'
    : tone === 'rose'
    ? 'bg-rose-600/20 text-rose-300'
    : tone === 'cyan'
    ? 'bg-cyan-600/20 text-cyan-300'
    : 'bg-blue-600/20 text-blue-300'
  return (
    <div className="group relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition shadow-sm hover:shadow-md">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 to-transparent transition" />
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneBg}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
          {typeof delta !== 'undefined' && (
            <div className={`text-xs mt-1 ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>{positive ? '▲' : '▼'} {delta}%</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
