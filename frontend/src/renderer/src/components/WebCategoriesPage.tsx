import React from 'react';
import WebPageManager from './WebPageManager';

interface WebCategoriesPageProps {
  token: string | null;
  apiBase: string;
  adminId?: string | number;
  role?: string;
  setView?: (v: string) => void;
  setProductEditing?: (p: any) => void;
}

const WebCategoriesPage: React.FC<WebCategoriesPageProps> = ({ token, apiBase, adminId, role, setView, setProductEditing }) => {
  if (!token) return null;
  return (
    <WebPageManager
      token={token}
      apiBase={apiBase}
      adminId={adminId}
      role={role}
      setView={setView}
      setProductEditing={setProductEditing}
      forcedTab="categorias"
      hideTabs
    />
  );
};

export default WebCategoriesPage;

