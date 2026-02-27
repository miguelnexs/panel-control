import React, { useEffect, useState } from 'react';
import { RefreshCw, X, CheckCircle, AlertTriangle, Download } from 'lucide-react';

interface UpdateModalProps {
  onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState<string>('Iniciando búsqueda...');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdateStatus = (_event: any, message: string) => {
      console.log('Update status:', message);
      setStatus(message);
      
      if (message.includes('Error')) {
        setError(message);
        setIsDownloading(false);
      } else if (message.includes('Descargando')) {
        setIsDownloading(true);
        setError(null);
      } else if (message.includes('Actualización descargada')) {
        setIsDownloading(false);
        setIsDownloaded(true);
        setError(null);
      } else if (message.includes('actualizada')) {
         setIsDownloading(false);
         setIsDownloaded(false);
         setError(null);
      }
    };

    // @ts-ignore
    if (window.electron && window.electron.ipcRenderer) {
        // @ts-ignore
        window.electron.ipcRenderer.on('update-status', handleUpdateStatus);
        // @ts-ignore
        window.electron.ipcRenderer.send('check-for-updates');
    } else {
        setStatus('Error: Entorno Electron no detectado');
        setError('Electron API no disponible');
    }

    return () => {
      // @ts-ignore
      if (window.electron && window.electron.ipcRenderer) {
        // @ts-ignore
        window.electron.ipcRenderer.removeAllListeners('update-status');
      }
    };
  }, []);

  const handleInstall = () => {
    // @ts-ignore
    window.electron.ipcRenderer.send('quit-and-install');
  };

  const handleRetry = () => {
    setError(null);
    setStatus('Buscando actualizaciones...');
    setIsDownloading(false);
    // @ts-ignore
    window.electron.ipcRenderer.send('check-for-updates');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
        
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-500 ${
            error ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
            isDownloaded ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {error ? <AlertTriangle size={32} /> :
             isDownloaded ? <Download size={32} /> :
             <RefreshCw size={32} className={isDownloading || (!error && !isDownloaded && !status.includes('actualizada')) ? "animate-spin" : ""} />
            }
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Actualización de Software
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
            {status}
          </p>
          
          <div className="space-y-3">
            {isDownloaded ? (
              <button 
                onClick={handleInstall}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Reiniciar e Instalar
              </button>
            ) : error ? (
               <button 
                onClick={handleRetry}
                className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Reintentar
              </button>
            ) : (
               <div className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-medium rounded-xl flex items-center justify-center gap-2 cursor-wait">
                <RefreshCw size={18} className="animate-spin" />
                Procesando...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
