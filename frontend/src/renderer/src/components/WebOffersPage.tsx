import React from 'react';
import WebPageManager from './WebPageManager';

interface WebOffersPageProps {
  token: string | null;
  apiBase: string;
  adminId?: string | number;
  role?: string;
  setView?: (v: string) => void;
  setProductEditing?: (p: any) => void;
}

const WebOffersPage: React.FC<WebOffersPageProps> = ({ token, apiBase, adminId, role, setView, setProductEditing }) => {
  if (!token) return null;
  return (
    <WebPageManager
      token={token}
      apiBase={apiBase}
      adminId={adminId}
      role={role}
      setView={setView}
      setProductEditing={setProductEditing}
      forcedTab="ofertas"
      hideTabs
    />
  );
};

export default WebOffersPage;

