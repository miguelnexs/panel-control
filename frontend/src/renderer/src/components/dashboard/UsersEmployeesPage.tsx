import React from 'react';
import UsersManager from './UsersManager';

interface UsersEmployeesPageProps {
  token: string | null;
  apiBase: string;
  role: string;
}

const UsersEmployeesPage: React.FC<UsersEmployeesPageProps> = ({ token, apiBase, role }) => {
  return <UsersManager token={token} apiBase={apiBase} role={role} />;
};

export default UsersEmployeesPage;

