import React from 'react';
import ConfigPage from './ConfigPage';

interface ConfigGoogleApiPageProps {
  token: string | null;
  apiBase: string;
}

const ConfigGoogleApiPage: React.FC<ConfigGoogleApiPageProps> = ({ token, apiBase }) => {
  if (!token) return null;
  return (
    <ConfigPage
      token={token}
      apiBase={apiBase}
      forcedTab="google"
      hideTabs
      title="Configuración / Correo Electrónico"
      subtitle="Configura la cuenta de correo global para el envío de notificaciones y alertas automáticas"
    />
  );
};

export default ConfigGoogleApiPage;
