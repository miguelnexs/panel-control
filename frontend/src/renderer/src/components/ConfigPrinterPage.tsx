import React from 'react';
import ConfigPage from './ConfigPage';

interface ConfigPrinterPageProps {
  token: string | null;
  apiBase: string;
}

const ConfigPrinterPage: React.FC<ConfigPrinterPageProps> = ({ token, apiBase }) => {
  if (!token) return null;
  return (
    <ConfigPage
      token={token}
      apiBase={apiBase}
      forcedTab="impresora"
      hideTabs
      title="Configuración / Impresora"
      subtitle="Configura impresión automática, formato del recibo y ajustes de papel"
    />
  );
};

export default ConfigPrinterPage;
