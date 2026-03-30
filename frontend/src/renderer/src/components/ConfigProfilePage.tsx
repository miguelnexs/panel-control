import React from 'react';
import ConfigPage from './ConfigPage';

interface ConfigProfilePageProps {
  token: string | null;
  apiBase: string;
}

const ConfigProfilePage: React.FC<ConfigProfilePageProps> = ({ token, apiBase }) => {
  if (!token) return null;
  return (
    <ConfigPage
      token={token}
      apiBase={apiBase}
      forcedTab="datos"
      hideTabs
      title="Configuración / Perfil"
      subtitle="Actualiza tus datos personales y credenciales de acceso"
    />
  );
};

export default ConfigProfilePage;
