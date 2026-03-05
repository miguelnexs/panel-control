import { useState, useEffect } from 'react';

export interface UpdateData {
  status: 'checking' | 'available' | 'not-available' | 'progress' | 'downloaded' | 'error';
  message: string;
  percent?: number;
  version?: string;
  error?: any;
}

export const useAutoUpdater = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateData['status'] | null>(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateMessage, setUpdateMessage] = useState('');
  const [version, setVersion] = useState<string | undefined>(undefined);

  useEffect(() => {
    // @ts-ignore
    if (window.electron && window.electron.ipcRenderer) {
      // @ts-ignore
      const handleUpdateStatus = (_event, data: UpdateData | string) => {
        console.log('Update status:', data);
        if (typeof data === 'string') {
          setUpdateMessage(data);
        } else {
          setUpdateStatus(data.status);
          setUpdateMessage(data.message);
          if (data.percent) {
            setUpdateProgress(data.percent);
          }
          if (data.version) {
            setVersion(data.version);
          }
        }
      };

      // @ts-ignore
      window.electron.ipcRenderer.on('update-status', handleUpdateStatus);

      // Check for updates immediately when hook mounts
      // @ts-ignore
      // window.electron.ipcRenderer.send('check-for-updates');

      return () => {
        // @ts-ignore
        window.electron.ipcRenderer.removeListener('update-status', handleUpdateStatus);
      };
    }
  }, []);

  return {
    status: updateStatus,
    progress: updateProgress,
    message: updateMessage,
    version
  };
};
