import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  User
} from 'lucide-react';

interface UserInfo {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  apiBase: string;
  onLoginSuccess: (token: string, refresh: string | null, role: string | null, userId: string | number | null, remember: boolean) => void;
}

const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({ 
  isOpen, 
  onClose, 
  token, 
  apiBase, 
  onLoginSuccess 
}) => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [password, setPassword] = useState('');

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/users/api/users/?page_size=1000`, { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        } 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar usuarios');
      
      const list = (Array.isArray(data) ? data : data.results || data.items || []) as UserInfo[];
      setUsers(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUsername('');
      setManualUsername('');
      setUseManual(false);
      setPassword('');
      setError(null);
    }
  }, [isOpen]);

  const handleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = useManual ? manualUsername : selectedUsername;
    if (!username || !password) return;

    setSwitching(true);
    setError(null);

    try {
      // 1. Authenticate user
      const res = await fetch(`${apiBase}/users/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Contraseña incorrecta o error de autenticación');
      }

      // 2. Get profile for role and ID
      const meRes = await fetch(`${apiBase}/users/api/auth/me/`, {
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${data.access}` 
        },
      });
      const meData = await meRes.json();
      
      if (!meRes.ok) throw new Error('No se pudo verificar el perfil del usuario');

      // 3. Trigger success callback (updates App state)
      onLoginSuccess(
        data.access, 
        data.refresh || null, 
        meData.role, 
        meData.id, 
        true 
      );
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar de cuenta');
    } finally {
      setSwitching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cambiar Usuario</h3>
              <p className="text-xs text-gray-500">Cambia rápidamente el usuario de la terminal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSwitch} className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {useManual ? 'Ingresar Usuario' : 'Seleccionar Cuenta'}
                </label>
                <button 
                  type="button"
                  onClick={() => setUseManual(!useManual)}
                  className="text-[10px] text-blue-500 hover:underline font-bold uppercase tracking-widest"
                >
                  {useManual ? 'Ver Lista' : 'Ingresar Manual'}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                
                {useManual ? (
                  <input 
                    type="text"
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)}
                    required
                    disabled={switching}
                    placeholder="Nombre de usuario..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <>
                    <select 
                      value={selectedUsername}
                      onChange={(e) => setSelectedUsername(e.target.value)}
                      required
                      disabled={loading || switching}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none disabled:opacity-50"
                    >
                      <option value="">{loading ? 'Cargando usuarios...' : 'Elegir un usuario...'}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.username}>
                          {u.first_name} {u.last_name} (@{u.username}) - {u.role === 'admin' || u.role === 'super_admin' ? 'Admin' : 'Empleado'}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={switching}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={switching || !selectedUsername || !password}
                className="flex-[2] px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {switching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Cambiando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Verificar y Cambiar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
            Cambio de sesión con verificación de contraseña
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSwitcherModal;
