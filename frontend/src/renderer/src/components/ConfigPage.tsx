import React, { useEffect, useState } from 'react';
import { 
  User, Building, Printer, Save, RefreshCw, 
  MapPin, Globe, Smartphone, FileText, Palette, 
  Image as ImageIcon, Mail, Phone, Briefcase, 
  CreditCard, Layout, Type, AlignCenter, Maximize, 
  Minimize, QrCode, CheckCircle2, AlertCircle, X
} from 'lucide-react';

interface UserProfile {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

interface CompanySettings {
  company_name: string;
  company_nit: string;
  company_phone: string;
  company_whatsapp: string;
  company_email: string;
  company_address: string;
  company_description: string;
  primary_color: string;
  secondary_color: string;
  logo: string | null;
  printer_type?: string;
  printer_name?: string;
  paper_width_mm?: number;
  auto_print?: boolean;
  receipt_footer?: string;
}

interface PrinterOptions {
  show_logo: boolean;
  header1: string;
  header2: string;
  align: string;
  font_size: number;
  margin_top: number;
  margin_bottom: number;
  show_qr: boolean;
  logo_mode: string;
  logo_url: string;
  logo_width_mm: number;
}

interface Msg {
  type: 'success' | 'error';
  text: string;
}

interface ConfigPageProps {
  token: string;
  apiBase: string;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ token, apiBase }) => {
  const headers = (tkn: string, json = true) => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [tab, setTab] = useState('datos');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [me, setMe] = useState<UserProfile>({ username: '', first_name: '', last_name: '', email: '', phone: '', department: '', position: '' });
  const [settings, setSettings] = useState<CompanySettings>({ company_name: '', company_nit: '', company_phone: '', company_whatsapp: '', company_email: '', company_address: '', company_description: '', primary_color: '#0ea5e9', secondary_color: '#1f2937', logo: null });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [printerOpts, setPrinterOpts] = useState<PrinterOptions>({
    show_logo: true,
    header1: '',
    header2: '',
    align: 'center',
    font_size: 11,
    margin_top: 10,
    margin_bottom: 10,
    show_qr: false,
    logo_mode: 'company',
    logo_url: '',
    logo_width_mm: 45,
  });

  const loadMe = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/auth/me/`, { headers: headers(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo cargar el perfil');
      setMe({
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || '',
      });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadMe(); }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMe((m) => ({ ...m, [name]: value }));
  };

  const saveMe = async (e?: React.FormEvent) => {
    e && e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload = { first_name: me.first_name, last_name: me.last_name, email: me.email, phone: me.phone, department: me.department, position: me.position };
      const res = await fetch(`${apiBase}/users/api/auth/me/`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo guardar');
      setMsg({ type: 'success', text: 'Datos personales actualizados correctamente' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const absUrl = (path: string | null) => {
    try {
      if (!path) return '';
      if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) return path;
      if (typeof path === 'string' && path.startsWith('/')) return `${apiBase}${path}`;
      return `${apiBase}/${path}`;
    } catch { return path; }
  };

  const loadSettings = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, { headers: headers(token) });
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
        primary_color: data.primary_color || '#0ea5e9',
        secondary_color: data.secondary_color || '#1f2937',
        logo: data.logo || null,
        printer_type: data.printer_type || 'system',
        printer_name: data.printer_name || '',
        paper_width_mm: data.paper_width_mm || 58,
        auto_print: !!data.auto_print,
        receipt_footer: data.receipt_footer || '',
      });
      try {
        const raw = data.receipt_footer || '';
        const obj = typeof raw === 'string' ? JSON.parse(raw) : null;
        if (obj && typeof obj === 'object') {
          setPrinterOpts({
            show_logo: obj.show_logo !== false,
            header1: obj.header1 || '',
            header2: obj.header2 || '',
            align: obj.align || 'center',
            font_size: Number(obj.font_size || 11),
            margin_top: Number((obj.margins && obj.margins.top) || obj.margin_top || 10),
            margin_bottom: Number((obj.margins && obj.margins.bottom) || obj.margin_bottom || 10),
            show_qr: !!obj.show_qr,
            logo_mode: obj.logo_mode || 'company',
            logo_url: obj.logo_url || '',
            logo_width_mm: Number(obj.logo_width_mm || 45),
          });
          setSettings((s) => ({ ...s, receipt_footer: obj.message || s.receipt_footer || '' }));
        } else {
          setPrinterOpts((p) => ({ ...p }));
        }
      } catch {
        setPrinterOpts((p) => ({ ...p }));
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token && (tab === 'empresa' || tab === 'impresora')) loadSettings(); }, [token, tab]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, [name]: value }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setLogoFile(file || null);
  };

  const saveSettings = async (e?: React.FormEvent) => {
    e && e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (tab === 'impresora') {
        const payloadBase = {
          printer_type: settings.printer_type || 'system',
          printer_name: settings.printer_name || '',
          paper_width_mm: Number(settings.paper_width_mm || 58),
          auto_print: !!settings.auto_print,
        };
        const receiptPayload = {
          message: settings.receipt_footer || '',
          show_logo: !!printerOpts.show_logo,
          header1: printerOpts.header1 || '',
          header2: printerOpts.header2 || '',
          align: printerOpts.align || 'center',
          font_size: Number(printerOpts.font_size || 11),
          margins: { top: Number(printerOpts.margin_top || 10), bottom: Number(printerOpts.margin_bottom || 10) },
          show_qr: !!printerOpts.show_qr,
          logo_mode: printerOpts.logo_mode || 'company',
          logo_url: printerOpts.logo_url || '',
          logo_width_mm: Number(printerOpts.logo_width_mm || 45),
        };
        const payload = { ...payloadBase, receipt_footer: JSON.stringify(receiptPayload) };
        const res = await fetch(`${apiBase}/webconfig/settings/`, { method: 'PUT', headers: headers(token, true), body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudieron guardar cambios');
        setMsg({ type: 'success', text: 'Configuración de impresora guardada' });
        setSettings((s) => ({
          ...s,
          printer_type: data.printer_type ?? s.printer_type,
          printer_name: data.printer_name ?? s.printer_name,
          paper_width_mm: data.paper_width_mm ?? s.paper_width_mm,
          auto_print: data.auto_print ?? s.auto_print,
          receipt_footer: (() => {
            try {
              const raw = data.receipt_footer;
              const obj = typeof raw === 'string' ? JSON.parse(raw) : null;
              return obj && obj.message ? obj.message : s.receipt_footer;
            } catch { return s.receipt_footer; }
          })(),
        }));
        setSaving(false);
        return;
      }
      const fd = new FormData();
      fd.append('company_name', settings.company_name || '');
      fd.append('company_nit', settings.company_nit || '');
      fd.append('company_phone', settings.company_phone || '');
      fd.append('company_whatsapp', settings.company_whatsapp || '');
      fd.append('company_email', settings.company_email || '');
      fd.append('company_address', settings.company_address || '');
      fd.append('company_description', settings.company_description || '');
      fd.append('primary_color', settings.primary_color || '');
      fd.append('secondary_color', settings.secondary_color || '');
      if (logoFile) fd.append('logo', logoFile);
      const res = await fetch(`${apiBase}/webconfig/settings/`, { method: 'PUT', headers: headers(token, false), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron guardar cambios');
      setMsg({ type: 'success', text: 'Identidad de empresa guardada' });
      setLogoFile(null);
      setSettings((s) => ({
        ...s,
        logo: data.logo || s.logo,
        company_name: data.company_name || s.company_name,
        company_nit: data.company_nit || s.company_nit,
        company_phone: data.company_phone || s.company_phone,
        company_whatsapp: data.company_whatsapp || s.company_whatsapp,
        company_email: data.company_email || s.company_email,
        company_address: data.company_address || s.company_address,
        company_description: data.company_description || s.company_description,
        primary_color: data.primary_color || s.primary_color,
        secondary_color: data.secondary_color || s.secondary_color,
      }));
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const previewPosSample = () => {
    try {
      const paperW = Number(settings.paper_width_mm || 58);
      const primary = settings.primary_color || '#000';
      const brand = (settings.company_name || 'Mi Empresa');
      const nit = (settings.company_nit || '900.000.000');
      const addr = (settings.company_address || 'Dirección Principal');
      const phone = (settings.company_phone || '300 000 0000');
      const logo = settings.logo || '';
      const absUrlFn = (path: string | null) => { try { if (!path) return ''; if (String(path).startsWith('http://') || String(path).startsWith('https://')) return path; if (String(path).startsWith('/')) return `${apiBase}${path}`; return `${apiBase}/${path}`; } catch { return path; } };
      const logoSrc = printerOpts.logo_mode === 'custom' && printerOpts.logo_url ? printerOpts.logo_url : logo;
      const logoTag = printerOpts.show_logo && logoSrc ? `<div class="c"><img src="${logoSrc.startsWith('http') ? logoSrc : absUrlFn(logoSrc)}" style="width:${Number(printerOpts.logo_width_mm || 45)}mm;height:auto;object-fit:contain"/></div>` : '';
      const alignCls = printerOpts.align === 'left' ? 'l' : printerOpts.align === 'right' ? 'r' : 'c';
      const css = `*{box-sizing:border-box} body{font-family:Arial, sans-serif;margin:0;padding:${Number(printerOpts.margin_top || 10)}px 10px ${Number(printerOpts.margin_bottom || 10)}px;width:${paperW}mm} .c{text-align:center} .l{text-align:left} .r{text-align:right} .t{font-weight:600} .hr{height:1px;background:linear-gradient(90deg, ${primary}, transparent);margin:6px 0} .row{display:flex;justify-content:space-between;gap:6px} .tab{width:100%;border-collapse:collapse} .tab th,.tab td{padding:4px 0;font-size:${Number(printerOpts.font_size || 11)}px} .tab thead th{border-bottom:1px dashed #999;text-align:left} .tab tfoot td{border-top:1px dashed #999} .small{font-size:${Math.max(9, Number(printerOpts.font_size || 11) - 2)}px}`;
      const header = `
        ${logoTag}
        <div class="${alignCls}">
          <div class="t">${brand}</div>
          <div class="small">${nit}</div>
          <div class="small">${addr}</div>
          <div class="small">${phone}</div>
          ${printerOpts.header1 ? `<div class="small">${printerOpts.header1}</div>` : ''}
          ${printerOpts.header2 ? `<div class="small">${printerOpts.header2}</div>` : ''}
        </div>
        <div class="hr"></div>
        <div class="row small"><div>Orden: DEMO-0001</div><div>${new Date().toLocaleString()}</div></div>
        <div class="row small"><div>Cliente: Juan Pérez</div><div></div></div>
      `;
      const itemsHtml = [
        { name: 'Producto A', qty: 2, unit: 15000, line: 30000 },
        { name: 'Producto B', qty: 1, unit: 45000, line: 45000 },
      ].map((it) => `<tr><td>${it.name}</td><td class="c">${it.qty}</td><td class="r">${it.unit.toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td><td class="r">${it.line.toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td></tr>`).join('');
      const table = `
        <table class="tab">
          <thead><tr><th>Producto</th><th class="c">Cant</th><th class="r">Unit</th><th class="r">Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot><tr><td colspan="3" class="t">Total</td><td class="r t">${(75000).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td></tr></tfoot>
        </table>
      `;
      const qr = printerOpts.show_qr ? `<div class="c"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('DEMO-0001')}" style="width:35mm;height:35mm;object-fit:contain"/></div>` : '';
      const footer = `<div class="hr"></div><div class="${alignCls} small">${settings.receipt_footer || ''}</div>${qr}`;
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Recibo</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
      
      setPreviewHtml(html);
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Configuración del Sistema</h1>
          <p className="text-gray-400 text-sm">Gestiona tu perfil, la identidad de tu empresa y preferencias de impresión</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={tab==='datos'?() => loadMe():loadSettings} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">{loading?'Cargando...':'Recargar'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-900/60 rounded-xl border border-gray-800 w-full md:w-fit overflow-x-auto">
        {[
          { id: 'datos', label: 'Datos Personales', icon: User },
          { id: 'empresa', label: 'Empresa', icon: Building },
          { id: 'impresora', label: 'Impresora', icon: Printer },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{msg.text}</span>
        </div>
      )}

      {/* Content Areas */}
      <div className="relative">
        {/* Datos Personales */}
        {tab === 'datos' && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Información de Perfil</h3>
                <p className="text-sm text-gray-400">Actualiza tus datos personales y de contacto</p>
              </div>
            </div>

            <form onSubmit={saveMe} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <User size={14} /> Usuario
                  </label>
                  <input 
                    name="username" 
                    value={me.username} 
                    disabled 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 text-gray-500 border border-gray-800 cursor-not-allowed" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Mail size={14} /> Correo Electrónico
                  </label>
                  <input 
                    name="email" 
                    value={me.email} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nombre</label>
                  <input 
                    name="first_name" 
                    value={me.first_name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Apellido</label>
                  <input 
                    name="last_name" 
                    value={me.last_name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Phone size={14} /> Teléfono
                  </label>
                  <input 
                    name="phone" 
                    value={me.phone || ''} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Building size={14} /> Departamento
                  </label>
                  <input 
                    name="department" 
                    value={me.department || ''} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Briefcase size={14} /> Cargo
                  </label>
                  <input 
                    name="position" 
                    value={me.position || ''} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empresa */}
        {tab === 'empresa' && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                <Building size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Identidad Corporativa</h3>
                <p className="text-sm text-gray-400">Personaliza la información pública de tu negocio</p>
              </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nombre de la Empresa</label>
                  <input 
                    name="company_name" 
                    value={settings.company_name} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                    placeholder="Mi Empresa S.A.S"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">NIT / Identificación</label>
                  <input 
                    name="company_nit" 
                    value={settings.company_nit} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                    placeholder="900.000.000-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Phone size={14} /> Teléfono
                  </label>
                  <input 
                    name="company_phone" 
                    value={settings.company_phone} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Smartphone size={14} /> WhatsApp
                  </label>
                  <input 
                    name="company_whatsapp" 
                    value={settings.company_whatsapp} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Mail size={14} /> Correo Corporativo
                  </label>
                  <input 
                    type="email" 
                    name="company_email" 
                    value={settings.company_email} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <MapPin size={14} /> Dirección Principal
                  </label>
                  <input 
                    name="company_address" 
                    value={settings.company_address} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Descripción del Negocio</label>
                <textarea 
                  name="company_description" 
                  value={settings.company_description} 
                  onChange={handleSettingsChange} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600 min-h-[100px] resize-none"
                  placeholder="Una breve descripción que aparecerá en tu perfil público..."
                />
              </div>

              <div className="pt-6 border-t border-gray-800">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Palette size={18} className="text-blue-400" /> Branding y Marca
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Colores de Marca</label>
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                          <span className="text-xs text-gray-500">Primario</span>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 border border-gray-700">
                            <input 
                              type="color" 
                              name="primary_color" 
                              value={settings.primary_color} 
                              onChange={handleSettingsChange} 
                              className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" 
                            />
                            <span className="text-sm text-gray-300 font-mono">{settings.primary_color}</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-xs text-gray-500">Secundario</span>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 border border-gray-700">
                            <input 
                              type="color" 
                              name="secondary_color" 
                              value={settings.secondary_color} 
                              onChange={handleSettingsChange} 
                              className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" 
                            />
                            <span className="text-sm text-gray-300 font-mono">{settings.secondary_color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <ImageIcon size={14} /> Logo
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                        {logoFile ? (
                          <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-contain" />
                        ) : settings.logo ? (
                          <img src={absUrl(settings.logo)} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="text-gray-600" size={32} />
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogo} 
                          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Recomendado: PNG con fondo transparente, mín. 200x200px.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : 'Actualizar Empresa'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Impresora */}
        {tab === 'impresora' && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                <Printer size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Configuración de Impresión</h3>
                <p className="text-sm text-gray-400">Personaliza el formato de tus recibos y facturas POS</p>
              </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Tipo de Impresión</label>
                  <select 
                    name="printer_type" 
                    value={settings.printer_type || 'system'} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  >
                    <option value="system">Impresora del Sistema (Predeterminada)</option>
                    <option value="pos">Impresora POS Directa</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nombre del Dispositivo</label>
                  <input 
                    name="printer_name" 
                    value={settings.printer_name || ''} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                    placeholder="Ej: EPSON TM-T20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Ancho del Papel (mm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="paper_width_mm" 
                      value={settings.paper_width_mm || 58} 
                      onChange={handleSettingsChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 text-sm">mm</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox" 
                    id="auto_print"
                    name="auto_print" 
                    checked={!!settings.auto_print} 
                    onChange={(e) => setSettings((s) => ({ ...s, auto_print: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
                  />
                  <label htmlFor="auto_print" className="text-sm text-gray-300 cursor-pointer">
                    Imprimir automáticamente al registrar venta
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <h4 className="text-white font-medium mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" /> Diseño del Recibo
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <input 
                      type="checkbox" 
                      id="show_logo"
                      checked={!!printerOpts.show_logo} 
                      onChange={(e) => setPrinterOpts((p) => ({ ...p, show_logo: e.target.checked }))} 
                      className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
                    />
                    <label htmlFor="show_logo" className="text-sm font-medium text-white cursor-pointer flex-1">
                      Incluir Logo en el Encabezado
                    </label>
                  </div>

                  {printerOpts.show_logo && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Fuente del Logo</label>
                        <select 
                          value={printerOpts.logo_mode} 
                          onChange={(e) => setPrinterOpts((p) => ({ ...p, logo_mode: e.target.value }))} 
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
                        >
                          <option value="company">Usar Logo de la Empresa</option>
                          <option value="custom">URL Personalizada</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-400">Ancho del Logo (mm)</label>
                         <input 
                           type="number" 
                           value={printerOpts.logo_width_mm} 
                           onChange={(e) => setPrinterOpts((p) => ({ ...p, logo_width_mm: Number(e.target.value || 45) }))} 
                           className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
                         />
                      </div>

                      {printerOpts.logo_mode === 'custom' && (
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-400">URL de la Imagen</label>
                          <input 
                            value={printerOpts.logo_url} 
                            onChange={(e) => setPrinterOpts((p) => ({ ...p, logo_url: e.target.value }))} 
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
                            placeholder="https://ejemplo.com/logo-ticket.png" 
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Encabezado Línea 1</label>
                    <input 
                      value={printerOpts.header1} 
                      onChange={(e) => setPrinterOpts((p) => ({ ...p, header1: e.target.value }))} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
                      placeholder="Ej: Régimen Común" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Encabezado Línea 2</label>
                    <input 
                      value={printerOpts.header2} 
                      onChange={(e) => setPrinterOpts((p) => ({ ...p, header2: e.target.value }))} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
                      placeholder="Ej: Resolución DIAN No..." 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Alineación de Texto</label>
                    <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700">
                      {[
                        { val: 'left', icon: <Type size={16} /> }, // Using generic Type icon for left (conceptually) or I need specific Align icons
                        { val: 'center', icon: <AlignCenter size={16} /> },
                        { val: 'right', icon: <Type size={16} /> }
                      ].map((opt, i) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setPrinterOpts((p) => ({ ...p, align: opt.val }))}
                          className={`flex-1 flex justify-center items-center py-2 rounded-lg transition-all ${printerOpts.align === opt.val ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Tamaño Fuente (px)</label>
                    <input 
                      type="number" 
                      value={printerOpts.font_size} 
                      onChange={(e) => setPrinterOpts((p) => ({ ...p, font_size: Number(e.target.value || 11) }))} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-400">Pie de Página</label>
                    <textarea 
                      name="receipt_footer" 
                      value={settings.receipt_footer || ''} 
                      onChange={handleSettingsChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none min-h-[80px] resize-none" 
                      placeholder="Gracias por su compra. Vuelva pronto." 
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      id="show_qr"
                      checked={!!printerOpts.show_qr} 
                      onChange={(e) => setPrinterOpts((p) => ({ ...p, show_qr: e.target.checked }))} 
                      className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
                    />
                    <label htmlFor="show_qr" className="text-sm text-gray-300 cursor-pointer flex items-center gap-2">
                      <QrCode size={16} /> Incluir Código QR al final
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
                <button 
                  type="button" 
                  onClick={previewPosSample} 
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-700 transition-colors w-full md:w-auto"
                >
                  Vista Previa (Ticket)
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Print Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             {/* Preview Header */}
             <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Vista Previa de Configuración</h3>
                <button onClick={() => setPreviewHtml(null)} className="text-gray-500 hover:text-gray-800">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Receipt Content - Iframe */}
             <div className="flex-1 overflow-hidden bg-gray-200 flex justify-center p-4">
                <div className="shadow-lg bg-white overflow-hidden" style={{ width: `${settings.paper_width_mm || 58}mm`, maxHeight: '100%', overflowY: 'auto' }}>
                  <iframe 
                    srcDoc={previewHtml} 
                    className="w-full h-full border-none bg-white"
                    title="Config Preview"
                    style={{ minHeight: '400px' }}
                  />
                </div>
             </div>
             
             {/* Actions */}
             <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button 
                   onClick={() => setPreviewHtml(null)}
                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                   Cerrar
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPage;
