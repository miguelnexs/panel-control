import React from 'react';
import { Loader2, CheckCircle2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UpdateProgressProps {
  status: 'checking' | 'available' | 'not-available' | 'progress' | 'downloaded' | 'error' | null;
  progress: number;
  message: string;
  className?: string;
}

export const UpdateProgress: React.FC<UpdateProgressProps> = ({ 
  status, 
  progress, 
  message,
  className 
}) => {
  if (!status || status === 'not-available') return null;

  const isError = status === 'error';
  const isComplete = status === 'downloaded';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-4 transition-all duration-500 animate-in fade-in slide-in-from-top-4",
      isError 
        ? "bg-red-500/10 border-red-500/20 text-red-200" 
        : isComplete
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
          : "bg-blue-500/10 border-blue-500/20 text-blue-200",
      className
    )}>
      {/* Background Progress Bar (Optional effect) */}
      {status === 'progress' && (
        <div 
          className="absolute inset-0 bg-blue-500/5 transition-all duration-300 ease-linear z-0"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full shadow-sm",
            isError ? "bg-red-500/20 text-red-400" : 
            isComplete ? "bg-emerald-500/20 text-emerald-400" :
            "bg-blue-500/20 text-blue-400"
          )}>
            {status === 'checking' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {status === 'available' && <AlertCircle className="h-4 w-4 animate-pulse" />}
            {status === 'progress' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'downloaded' && <CheckCircle2 className="h-4 w-4" />}
            {status === 'error' && <AlertCircle className="h-4 w-4" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">
              {isError ? 'Error de actualización' : 
               isComplete ? 'Actualización lista' : 
               'Actualización de sistema'}
            </h4>
            <p className="text-xs opacity-80 truncate">{message}</p>
          </div>
          
          {status === 'progress' && (
            <span className="text-xs font-bold font-mono bg-blue-500/20 px-2 py-1 rounded">
              {Math.round(progress)}%
            </span>
          )}
        </div>

        {status === 'progress' && (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-blue-950/50 rounded-full overflow-hidden border border-blue-500/10">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] opacity-60 font-medium tracking-wide uppercase">
              <span>Descargando paquetes...</span>
              <span>{progress < 100 ? 'En curso' : 'Completado'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
