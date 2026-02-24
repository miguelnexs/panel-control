import React, { useEffect, useState, useMemo } from 'react';
import { buildMediaUrl } from '../utils/api';

interface Settings {
  company_name: string;
  company_nit: string;
  company_phone: string;
  company_whatsapp: string;
  company_email: string;
  company_address: string;
  company_description: string;
  site_url: string;
  logo: string | null;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface SettingsPageProps {
  token: string;
  apiBase: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ token, apiBase }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [settings, setSettings] = useState<Settings>({
    company_name: '',
    company_nit: '',
    company_phone: '',
    company_whatsapp: '',
    company_email: '',
    company_address: '',
    company_description: '',
    site_url: '',
    logo: null,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const headersAuth = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadSettings = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, { headers: headersAuth });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar configuraciones');
      setSettings({
        company_name: data.company_name || '',
        company_nit: data.company_nit || '',
        company_phone: data.company_phone || '',
        company_whatsapp: data.company_whatsapp || '',
        company_email: data.company_email || '',
        company_address: data.company_address || '',
        company_description: data.company_description || '',
        site_url: data.site_url || '',
        logo: data.logo || null,
      });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadSettings(); }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, [name]: value }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setLogoFile(file || null);
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      const u = new URL(url);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };

  const saveSettings = async (e?: React.FormEvent) => {
    e && e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (!validateUrl(settings.site_url)) {
        throw new Error('La URL del sitio no es válida');
      }
      const fd = new FormData();
      fd.append('company_name', settings.company_name || '');
      fd.append('company_nit', settings.company_nit || '');
      fd.append('company_phone', settings.company_phone || '');
      fd.append('company_whatsapp', settings.company_whatsapp || '');
      fd.append('company_email', settings.company_email || '');
      fd.append('company_address', settings.company_address || '');
      fd.append('company_description', settings.company_description || '');
      fd.append('site_url', settings.site_url || '');
      if (logoFile) fd.append('logo', logoFile);
      const res = await fetch(`${apiBase}/webconfig/settings/`, {
        method: 'PUT',
        headers: headersAuth,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron guardar cambios');
      setMsg({ type: 'success', text: 'Configuraciones guardadas' });
      setLogoFile(null);
      setSettings((s) => ({
        ...s,
        logo: data.logo || s.logo,
        site_url: data.site_url || s.site_url,
        company_name: data.company_name || s.company_name,
        company_nit: data.company_nit || s.company_nit,
        company_phone: data.company_phone || s.company_phone,
        company_whatsapp: data.company_whatsapp || s.company_whatsapp,
        company_email: data.company_email || s.company_email,
        company_address: data.company_address || s.company_address,
        company_description: data.company_description || s.company_description,
      }));
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>{msg.text}</div>
      )}
      <div className="bg-white/5 border border-white/10 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium">Configuraciones de la tienda</div>
          <button onClick={loadSettings} className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white" disabled={loading}>{loading ? 'Cargando...' : 'Recargar'}</button>
        </div>
        <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">Nombre de la empresa</span>
            <input name="company_name" value={settings.company_name} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Mi Empresa" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">NIT</span>
            <input name="company_nit" value={settings.company_nit} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="123456789-0" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">Teléfono</span>
            <input name="company_phone" value={settings.company_phone} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="3018645967" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">WhatsApp</span>
            <input name="company_whatsapp" value={settings.company_whatsapp} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="3018645967" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">Correo</span>
            <input type="email" name="company_email" value={settings.company_email} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="correo@empresa.com" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">Dirección</span>
            <input name="company_address" value={settings.company_address} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Calle 123 #45-67" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-gray-300">Descripción</span>
            <textarea name="company_description" value={settings.company_description} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="Breve descripción de la empresa" rows={3} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-gray-300">URL de la página web</span>
            <input name="site_url" value={settings.site_url} onChange={handleChange} className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="https://mi-tienda.com" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-300">Foto de perfil (logo)</span>
            <input type="file" accept="image/*" onChange={handleLogo} className="text-white" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded overflow-hidden bg-gray-800 flex items-center justify-center">
              {logoFile ? (
                <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="w-full h-full object-cover" />
              ) : settings.logo ? (
                <img src={buildMediaUrl(settings.logo, apiBase)} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">Sin imagen</span>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
            <button type="button" onClick={loadSettings} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
