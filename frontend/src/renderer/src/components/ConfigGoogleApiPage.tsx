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
      title="Configuración / Google API"
      subtitle="Configura credenciales y pruebas de conexión para servicios de Google"
    />
  );
};

export default ConfigGoogleApiPage;
