import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TitleBar from './components/TitleBar';
import { API_BASE_URL, buildAuthHeaders } from './config/api.config';

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface Employee {
  id: number;
  username: string;
}

const SignOut = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} className="text-xs text-gray-400 hover:text-white underline">
    Cerrar sesión
  </button>
);

const App = () => {
  const [message, setMessage] = useState<Msg | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | number | null>(null);

  const apiBase = API_BASE_URL;
  const authHeaders = buildAuthHeaders;

  // Removed auto-login from localStorage to force login screen on startup as requested
  // useEffect(() => {
  //   try {
  //     const a = localStorage.getItem('globetrek_access_token');
  //     const r = localStorage.getItem('globetrek_refresh_token');
  //     if (a) setToken(a);
  //     if (r) setRefresh(r);
  //   } catch {}
  // }, []);

  useEffect(() => {
    const ping = () => {
      fetch(`${apiBase}/health/`).catch(() => {});
    };
    ping();
    const id = setInterval(ping, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    const doRefresh = async () => {
      if (!refresh) return;
      try {
        const res = await fetch(`${apiBase}/users/api/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        const data = await res.json();
        if (res.ok && data.access) {
          setToken(data.access);
          try { localStorage.setItem('globetrek_access_token', data.access); } catch {}
          if (data.refresh) {
            setRefresh(data.refresh);
            try { localStorage.setItem('globetrek_refresh_token', data.refresh); } catch {}
          }
        }
      } catch {}
    };
    if (refresh) {
      id = setInterval(doRefresh, 25 * 60 * 1000);
    }
    return () => { if (id) clearInterval(id); };
  }, [refresh]);

  const handleLoginSuccess = (accessToken: string, refreshToken: string | null, userRole: string | null, uid: string | number | null) => {
    setToken(accessToken);
    setRefresh(refreshToken);
    setRole(userRole);
    setUserId(uid);
    setMessage({ type: 'success', text: 'Inicio de sesión exitoso' });
    try {
      localStorage.setItem('globetrek_access_token', accessToken);
      if (refreshToken) localStorage.setItem('globetrek_refresh_token', refreshToken);
    } catch {}
  };

  const handleSignOut = () => {
    setToken(null);
    setRole(null);
    setRefresh(null);
    setMessage({ type: 'success', text: 'Sesión cerrada' });
    try {
      localStorage.removeItem('globetrek_access_token');
      localStorage.removeItem('globetrek_refresh_token');
    } catch {}
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex-1 overflow-hidden bg-gray-900">
        {token ? (
          <Dashboard token={token} role={role!} userId={Number(userId)} onSignOut={handleSignOut} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default App;
