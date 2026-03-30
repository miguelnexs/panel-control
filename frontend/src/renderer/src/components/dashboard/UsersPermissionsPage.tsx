import React from 'react';
import EmployeePermissionsManager from './EmployeePermissionsManager';

interface UsersPermissionsPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

const UsersPermissionsPage: React.FC<UsersPermissionsPageProps> = ({ token, apiBase, role }) => {
  return <EmployeePermissionsManager token={token} apiBase={apiBase} role={role} />;
};

export default UsersPermissionsPage;

