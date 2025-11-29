import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import { API_BASE_URL, buildAuthHeaders } from './config/api.config';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [userId, setUserId] = useState(null);
  const [companyName, setCompanyName] = useState('');

  const apiBase = API_BASE_URL;
  const authHeaders = buildAuthHeaders;

  const roleLabel = (r) => {
    if (r === 'super_admin') return 'Super Administrador';
    if (r === 'admin') return 'Administrador';
    if (r === 'employee') return 'Empleado';
    return 'Desconocido';
  };

  useEffect(() => {
    try {
      const a = sessionStorage.getItem('globetrek_access_token');
      const r = sessionStorage.getItem('globetrek_refresh_token');
      if (a) setToken(a);
      if (r) setRefresh(r);
    } catch {}
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${apiBase}/webconfig/public/settings/`, { headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (res.ok && data && typeof data.company_name === 'string') {
          setCompanyName(data.company_name || '');
        }
      } catch {}
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const ping = () => {
      fetch(`${apiBase}/health/`).catch(() => {});
    };
    ping();
    const id = setInterval(ping, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let id = null;
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
          try { sessionStorage.setItem('globetrek_access_token', data.access); } catch {}
          if (data.refresh) {
            setRefresh(data.refresh);
            try { sessionStorage.setItem('globetrek_refresh_token', data.refresh); } catch {}
          }
        }
      } catch {}
    };
    if (refresh) {
      id = setInterval(doRefresh, 25 * 60 * 1000);
    }
    return () => { if (id) clearInterval(id); };
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiBase}/users/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Credenciales inválidas');
      }
      setToken(data.access);
      setRefresh(data.refresh || null);
      try {
        if (data.access) sessionStorage.setItem('globetrek_access_token', data.access);
        if (data.refresh) sessionStorage.setItem('globetrek_refresh_token', data.refresh);
      } catch {}
      setMessage({ type: 'success', text: 'Inicio de sesión exitoso' });
      // Obtener rol del usuario
      try {
        const meRes = await fetch(`${apiBase}/users/api/auth/me/`, {
          method: 'GET',
          headers: authHeaders(data.access),
        });
        const meData = await meRes.json();
        if (!meRes.ok) throw new Error(meData.detail || 'No se pudo obtener el perfil');
        setRole(meData.role);
        setUserId(meData.id);
      } catch (e) {
        setMessage({ type: 'error', text: e.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setToken(null);
    setRole(null);
    setRefresh(null);
    setUsername('');
    setPassword('');
    setMessage({ type: 'success', text: 'Sesión cerrada' });
    try {
      sessionStorage.removeItem('globetrek_access_token');
      sessionStorage.removeItem('globetrek_refresh_token');
    } catch {}
  };

  const AdminPanel = ({ token }) => {
    const [empUsername, setEmpUsername] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [empLoading, setEmpLoading] = useState(false);
    const [empMessage, setEmpMessage] = useState(null);
    const [employees, setEmployees] = useState([]);

    const loadEmployees = async () => {
      setEmpMessage(null);
      try {
        const res = await fetch(`${apiBase}/users/api/users/`, {
          method: 'GET',
          headers: authHeaders(token),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar empleados');
        setEmployees(data);
      } catch (err) {
        setEmpMessage({ type: 'error', text: err.message });
      }
    };

    useEffect(() => {
      if (token) loadEmployees();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleCreateEmployee = async (e) => {
      e.preventDefault();
      setEmpLoading(true);
      setEmpMessage(null);
      try {
        const res = await fetch(`${apiBase}/users/api/users/`, {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            username: empUsername,
            password: empPassword,
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            department,
            position,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudo crear el empleado');
        setEmpMessage({ type: 'success', text: `Empleado ${data.username} creado` });
        setEmpUsername('');
        setEmpPassword('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setDepartment('');
        setPosition('');
        loadEmployees();
      } catch (err) {
        setEmpMessage({ type: 'error', text: err.message });
      } finally {
        setEmpLoading(false);
      }
    };

    const handleDelete = async (id) => {
      setEmpMessage(null);
      try {
        const res = await fetch(`${apiBase}/users/api/users/${id}/`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || data.message || 'No se pudo eliminar');
        setEmpMessage({ type: 'success', text: 'Empleado eliminado' });
        loadEmployees();
      } catch (err) {
        setEmpMessage({ type: 'error', text: err.message });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Panel de Administrador</h2>
          <SignOut />
        </div>

        {empMessage && (
          <div className={`p-3 rounded text-sm ${empMessage.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
            {empMessage.text}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded p-4">
          <h3 className="text-white font-medium mb-3">Crear nuevo empleado</h3>
          <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={empUsername}
              onChange={(e) => setEmpUsername(e.target.value)}
              required
              minLength={4}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario"
            />
            <input
              type="password"
              value={empPassword}
              onChange={(e) => setEmpPassword(e.target.value)}
              required
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña"
            />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apellidos"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Correo"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Teléfono"
            />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Departamento"
            />
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cargo"
            />
            <button
              type="submit"
              disabled={empLoading}
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {empLoading ? 'Creando...' : 'Crear empleado'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">Solo se permite crear cuentas de tipo empleado.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Empleados</h3>
            <button
              onClick={loadEmployees}
              className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white"
            >
              Recargar
            </button>
          </div>
          <ul className="space-y-2">
            {employees.map((emp) => (
              <li key={emp.id} className="flex items-center justify-between bg-gray-700/50 border border-gray-600 rounded p-2 text-sm text-white">
                <span>{emp.username}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
            {employees.length === 0 && (
              <li className="text-gray-300 text-sm">No hay empleados registrados.</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const EmployeePanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Panel de Empleado</h2>
        <SignOut />
      </div>
      <div className="bg-white/5 border border-white/10 rounded p-4 text-gray-200">
        Acceso a funciones básicas del sistema. Para gestión de usuarios, contacte a un administrador.
      </div>
    </div>
  );

  const SuperAdminPanel = ({ token }) => {
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('admin'); // 'admin' | 'employer' | 'employee'
    const [creating, setCreating] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [targetTenantId, setTargetTenantId] = useState('');

    useEffect(() => {
      const loadTenants = async () => {
        try {
          const res = await fetch(`${apiBase}/users/api/admin/tenants/`, {
            headers: authHeaders(token),
          });
          const data = await res.json();
          if (res.ok && Array.isArray(data)) {
            setTenants(data);
          }
        } catch {}
      };
      if (token) loadTenants();
    }, [token]);

    const handleCreateUser = async (e) => {
      e.preventDefault();
      setCreating(true);
      setFeedback(null);
      try {
        const res = await fetch(`${apiBase}/users/api/users/`, {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            username: newUsername,
            password: newPassword,
            role: newRole,
            tenant_id: newRole === 'employee' ? (targetTenantId || undefined) : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudo crear el usuario');
        setFeedback({ type: 'success', text: `Usuario ${data.username} creado como ${newRole}.` });
        setNewUsername('');
        setNewPassword('');
        setNewRole('admin');
        setTargetTenantId('');
      } catch (err) {
        setFeedback({ type: 'error', text: err.message });
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Panel de Super Administrador</h2>
          <SignOut />
        </div>
        {feedback && (
          <div className={`p-3 rounded text-sm ${feedback.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
            {feedback.text}
          </div>
        )}
        <div className="bg-white/5 border border-white/10 rounded p-4">
          <h3 className="text-white font-medium mb-3">Crear Administrador o Empleador</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={4}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña"
            />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Administrador</option>
            <option value="employer">Empleador</option>
            <option value="employee">Empleado</option>
          </select>
          {newRole === 'employee' && (
            <select
              value={targetTenantId}
              onChange={(e) => setTargetTenantId(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione tenant (administrador)</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.admin_username} ({t.id})</option>
              ))}
            </select>
          )}
            <button
              type="submit"
              disabled={creating}
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">Los Super Administradores pueden crear cuentas de tipo Administrador o Empleador.</p>
        </div>
      </div>
    );
  };

  if (token) {
    return <Dashboard token={token} role={role} userId={userId} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-xl shadow-lg border border-white/20 p-8">
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">{`Acceso a ${companyName || 'Panel'}`}</h1>

        {message && (
          <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-200 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={4}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu usuario"
            />
          </div>
          <div>
            <label className="block text-gray-200 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu contraseña"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Accediendo...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} {companyName || 'Panel'}</p>
      </div>
    </div>
  );
};

export default App;
