import React from 'react';
import ConfigPage from './ConfigPage';

interface ConfigCompanyPageProps {
  token: string | null;
  apiBase: string;
}

const ConfigCompanyPage: React.FC<ConfigCompanyPageProps> = ({ token, apiBase }) => {
  if (!token) return null;
  return (
    <ConfigPage
      token={token}
      apiBase={apiBase}
      forcedTab="empresa"
      hideTabs
      title="Configuración / Empresa"
      subtitle="Gestiona la identidad visual y los datos de tu empresa"
    />
  );
};

export default ConfigCompanyPage;
