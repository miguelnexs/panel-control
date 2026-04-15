import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface SyncStatusBannerProps {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  lastError: string | null;
  onSync?: () => void;
}

const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  isOnline,
  pendingCount,
  syncing,
  lastError,
  onSync,
}) => {
  // Nothing to show if online with no pending items
  if (isOnline && pendingCount === 0 && !lastError) return null;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm border transition-all ${
        !isOnline
          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
          : lastError
          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
          : syncing
          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
          : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      }`}
    >
      {/* Icon */}
      {!isOnline ? (
        <CloudOff className="w-4 h-4 flex-shrink-0" />
      ) : syncing ? (
        <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
      ) : lastError ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      )}

      {/* Message */}
      <span className="flex-1">
        {!isOnline ? (
          <>
            <strong>Sin conexión</strong>
            {pendingCount > 0
              ? ` — ${pendingCount} cambio${pendingCount > 1 ? 's' : ''} guardado${pendingCount > 1 ? 's' : ''} localmente. Se sincronizarán al reconectar.`
              : ' — Trabajando con datos locales.'}
          </>
        ) : syncing ? (
          <>Sincronizando {pendingCount} cambio{pendingCount > 1 ? 's' : ''} con el servidor...</>
        ) : lastError ? (
          <>
            <strong>Error de sincronización:</strong> {lastError}.{' '}
            {pendingCount > 0 && `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}.`}
          </>
        ) : (
          <>{pendingCount} cambio{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} de sincronizar.</>
        )}
      </span>

      {/* Manual sync button */}
      {isOnline && pendingCount > 0 && !syncing && onSync && (
        <button
          onClick={onSync}
          className="px-3 py-1 rounded-lg bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-current/20 text-xs font-medium transition-colors"
        >
          Sincronizar ahora
        </button>
      )}
    </div>
  );
};

export default SyncStatusBanner;
