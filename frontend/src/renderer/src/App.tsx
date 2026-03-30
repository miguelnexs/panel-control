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

  const apiBase = API_BASE_URL.replace(/\/+$/,'');
  const authHeaders = buildAuthHeaders;

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      const get = (k: string) => {
        try {
          return sessionStorage.getItem(k) || localStorage.getItem(k);
        } catch {
          return null;
        }
      };
      const access = get('globetrek_access_token');
      const refreshToken = get('globetrek_refresh_token');
      if (!access) return;
      try {
        const meRes = await fetch(`${apiBase}/users/api/auth/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const meData = await meRes.json().catch(() => null);
        if (!meRes.ok) throw new Error(meData?.detail || 'Sesión inválida');
        if (!meData?.has_paid) throw new Error('No tienes un plan activo.');
        if (!mounted) return;
        setToken(access);
        setRefresh(refreshToken);
        setRole(meData.role || null);
        setUserId(meData.id ?? null);
      } catch {
        try {
          sessionStorage.removeItem('globetrek_access_token');
          sessionStorage.removeItem('globetrek_refresh_token');
          localStorage.removeItem('globetrek_access_token');
          localStorage.removeItem('globetrek_refresh_token');
          localStorage.removeItem('globetrek_role');
          localStorage.removeItem('globetrek_user_id');
          localStorage.removeItem('globetrek_remember_me');
        } catch {}
      }
    };
    if (apiBase) restore();
    return () => { mounted = false; };
  }, [apiBase]);

  useEffect(() => {
    const ping = () => { fetch(`${apiBase}/health/`).catch(() => {}); };
    const id = setInterval(ping, 5 * 60 * 1000);
    return () => { clearInterval(id); };
  }, [apiBase]);

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

  const handleLoginSuccess = (accessToken: string, refreshToken: string | null, userRole: string | null, uid: string | number | null, remember: boolean) => {
    setToken(accessToken);
    setRefresh(refreshToken);
    setRole(userRole);
    setUserId(uid);
    setMessage({ type: 'success', text: 'Inicio de sesión exitoso' });
    try {
      sessionStorage.removeItem('globetrek_access_token');
      sessionStorage.removeItem('globetrek_refresh_token');
      localStorage.removeItem('globetrek_access_token');
      localStorage.removeItem('globetrek_refresh_token');
      localStorage.removeItem('globetrek_role');
      localStorage.removeItem('globetrek_user_id');
      localStorage.removeItem('globetrek_remember_me');

      if (remember) {
        localStorage.setItem('globetrek_access_token', accessToken);
        if (refreshToken) localStorage.setItem('globetrek_refresh_token', refreshToken);
        if (userRole) localStorage.setItem('globetrek_role', userRole);
        if (uid != null) localStorage.setItem('globetrek_user_id', String(uid));
        localStorage.setItem('globetrek_remember_me', 'true');
      } else {
        sessionStorage.setItem('globetrek_access_token', accessToken);
        if (refreshToken) sessionStorage.setItem('globetrek_refresh_token', refreshToken);
      }
    } catch {}
  };

  const handleSignOut = () => {
    setToken(null);
    setRole(null);
    setRefresh(null);
    setMessage({ type: 'success', text: 'Sesión cerrada' });
    try {
      sessionStorage.removeItem('globetrek_access_token');
      sessionStorage.removeItem('globetrek_refresh_token');
      localStorage.removeItem('globetrek_access_token');
      localStorage.removeItem('globetrek_refresh_token');
      localStorage.removeItem('globetrek_role');
      localStorage.removeItem('globetrek_user_id');
      localStorage.removeItem('globetrek_remember_me');
    } catch {}
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {token ? (
          <Dashboard token={token} role={role!} userId={Number(userId)} onSignOut={handleSignOut} apiBase={apiBase} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} apiBase={apiBase} />
        )}
      </div>
    </div>
  );
};

export default App;
