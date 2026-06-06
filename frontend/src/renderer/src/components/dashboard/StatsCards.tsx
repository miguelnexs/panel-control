import React from 'react'
import Icon from './Icon'

interface KPIProps {
  label: string;
  value: string | number;
  delta?: number;
  positive?: boolean;
}

export const KPI: React.FC<KPIProps> = ({ label, value, delta, positive }) => (
  <div className="bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-xl p-5 shadow-lg">
    <div className="text-sm font-black text-black dark:text-gray-400 uppercase tracking-wide">{label}</div>
    <div className="text-3xl font-black text-black dark:text-white mt-2">{value}</div>
    {typeof delta !== 'undefined' && (
      <div className={`text-sm mt-2 font-black ${positive ? 'text-emerald-700 dark:text-green-300' : 'text-rose-700 dark:text-red-300'}`}>{positive ? '▲' : '▼'} {delta}%</div>
    )}
  </div>
)

interface StatCardProps extends KPIProps {
  icon: string;
  tone?: 'blue' | 'emerald' | 'indigo' | 'violet' | 'rose' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, delta, positive, icon, tone = 'blue' }) => {
  const toneBg = tone === 'emerald'
    ? 'bg-emerald-600 text-white dark:bg-emerald-600/20 dark:text-emerald-300 shadow-emerald-500/40'
    : tone === 'indigo'
    ? 'bg-indigo-600 text-white dark:bg-indigo-600/20 dark:text-indigo-300 shadow-indigo-500/40'
    : tone === 'violet'
    ? 'bg-violet-600 text-white dark:bg-violet-600/20 dark:text-violet-300 shadow-violet-500/40'
    : tone === 'rose'
    ? 'bg-rose-600 text-white dark:bg-rose-600/20 dark:text-rose-300 shadow-rose-500/40'
    : tone === 'cyan'
    ? 'bg-cyan-600 text-white dark:bg-cyan-600/20 dark:text-cyan-300 shadow-cyan-500/40'
    : 'bg-blue-600 text-white dark:bg-blue-600/20 dark:text-blue-300 shadow-blue-500/40'

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 overflow-hidden transition-all shadow-lg hover:shadow-2xl hover:border-gray-400 dark:hover:shadow-md">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-gray-100 dark:from-white/10 to-transparent transition" />
      <div className="p-5 flex items-center gap-4 relative">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${toneBg}`}>
          <Icon name={icon} className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-black text-black dark:text-gray-400 uppercase tracking-widest">{label}</div>
          <div className="text-3xl font-black text-black dark:text-white mt-1">{value}</div>
          {typeof delta !== 'undefined' && (
            <div className={`text-xs mt-1 font-black ${positive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{positive ? '▲' : '▼'} {delta}%</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
