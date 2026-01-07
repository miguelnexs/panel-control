import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './Toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  CheckCircle, 
  Clock,
  User,
  DollarSign,
  FileText,
  MapPin,
  Mail,
  CreditCard,
  Briefcase,
  X,
  Printer
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  third_party_provider?: string;
  third_party_cost?: number;
  value: number;
  client: number;
  client_name?: string;
  status: 'recibido' | 'entregado';
  active?: boolean;
  created_at: string;
}

interface Client {
  id: number;
  full_name: string;
  cedula: string;
}

interface CompanySettings {
  company_name: string;
  company_nit: string;
  company_phone: string;
  company_address: string;
  logo: string | null;
  printer_type?: string;
  printer_name?: string;
  paper_width_mm?: number;
  receipt_footer?: string;
  primary_color?: string;
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

interface ServicesPageProps {
  token: string | null;
  apiBase: string;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ token, apiBase }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<{ total: number; delivered: number; received: number; total_value: number }>({ total: 0, delivered: 0, received: 0, total_value: 0 });
  const [pageSize] = useState(20);
  const [ordering, setOrdering] = useState('-created_at');

  const [toast, setToast] = useState<{message: string, type: ToastType, isVisible: boolean}>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };
  
  // Printing State
  const [printingService, setPrintingService] = useState<Service | null>(null);
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '', company_nit: '', company_phone: '', company_address: '', logo: null,
    printer_type: 'system', paper_width_mm: 58, receipt_footer: '', primary_color: '#0ea5e9'
  });
  const [printerOpts, setPrinterOpts] = useState<PrinterOptions>({
    show_logo: true, header1: '', header2: '', align: 'center', font_size: 11,
    margin_top: 10, margin_bottom: 10, show_qr: false, logo_mode: 'company', logo_url: '', logo_width_mm: 45
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    third_party_provider: '',
    third_party_cost: '',
    value: '',
    clientId: '',
    status: 'recibido' as 'recibido' | 'entregado'
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Client Form State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    full_name: '',
    cedula: '',
    email: '',
    address: ''
  });

  const authHeaders = (tkn: string | null) => ({ 'Content-Type': 'application/json', ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/webconfig/settings/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) return;

      const newSettings: CompanySettings = {
        company_name: data.company_name || '',
        company_nit: data.company_nit || '',
        company_phone: data.company_phone || '',
        company_address: data.company_address || '',
        logo: data.logo || null,
        printer_type: data.printer_type || 'system',
        paper_width_mm: data.paper_width_mm || 58,
        receipt_footer: data.receipt_footer || '',
        primary_color: data.primary_color || '#0ea5e9'
      };

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
          newSettings.receipt_footer = obj.message !== undefined ? obj.message : '';
        }
      } catch {}

      setSettings(newSettings);
    } catch (e) {
      console.error('Error loading settings', e);
    }
  };

  const generateReceiptHtml = (service: Service) => {
    const paperW = settings.paper_width_mm || 58;
    const primary = settings.primary_color || '#000';
    const brand = (settings.company_name || 'Mi Empresa de Servicios');
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
      <div class="row small"><div>Servicio: #${service.id}</div><div>${new Date(service.created_at).toLocaleString()}</div></div>
      <div class="row small"><div>Cliente: ${service.client_name || 'Cliente'}</div><div></div></div>
    `;
    
    const table = `
      <table class="tab">
        <thead><tr><th>Descripción</th><th class="r">Valor</th></tr></thead>
        <tbody>
          <tr>
            <td>
              <div class="t">${service.name}</div>
              <div class="small">${service.description}</div>
            </td>
            <td class="r">${Number(service.value).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td>
          </tr>
        </tbody>
        <tfoot><tr><td class="t">Total</td><td class="r t">${Number(service.value).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td></tr></tfoot>
      </table>
    `;
    
    const qr = printerOpts.show_qr ? `<div class="c"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SVC-${service.id}`)}" style="width:35mm;height:35mm;object-fit:contain"/></div>` : '';
    const footer = `<div class="hr"></div><div class="${alignCls} small">${settings.receipt_footer || ''}</div>${qr}`;
    
    return `<!doctype html><html><head><meta charset="utf-8"><title>Recibo Servicio #${service.id}</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
  };

  const handleSilentPrint = async (service: Service) => {
    showToast('Iniciando servicio de impresión...', 'loading');
    
    try {
      const html = generateReceiptHtml(service);
      const printerName = settings.printer_name || '';
      
      // @ts-ignore
      if (window.electron && window.electron.ipcRenderer) {
         // @ts-ignore
         const result = await window.electron.ipcRenderer.invoke('print-silent', { 
           content: html,
           printerName: printerName
         });
         
         if (!result.success) {
           throw new Error(result.error);
         }
         showToast('Impresión enviada correctamente', 'success');
      } else {
        showToast('Abriendo diálogo de impresión...', 'info');
        setPrintingService(service);
      }
    } catch (error: any) {
      console.error('Error printing:', error);
      showToast('Error al imprimir: ' + (error.message || 'Error desconocido'), 'error');
    }
  };

  const handlePrint = () => {
    if (!printingService) return;
    const html = generateReceiptHtml(printingService);
    const win = window.open('', '', 'height=600,width=400');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  // Load clients for the dropdown
  const loadClients = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/clients/?page_size=100`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok && Array.isArray(data.results)) {
        setClients(data.results);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  useEffect(() => {
    loadClients();
  }, [token, apiBase]);

  const loadServices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL(`${apiBase}/services/`);
      if (searchTerm) url.searchParams.set('search', searchTerm);
      url.searchParams.set('page_size', String(pageSize));
      url.searchParams.set('ordering', ordering);
      const res = await fetch(url.toString(), { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) {
        const arr = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setServices(arr);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/services/stats/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) setStats({ 
        total: Number(data.total || 0), 
        delivered: Number(data.delivered || 0), 
        received: Number(data.received || 0), 
        total_value: Number(data.total_value || 0) 
      });
    } catch (e) {}
  };

  useEffect(() => { loadServices(); loadStats(); loadSettings(); }, [token]); 
  useEffect(() => { const t = setTimeout(() => loadServices(), 300); return () => clearTimeout(t); }, [searchTerm, ordering]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    // Basic validation
    if (!clientFormData.full_name || !clientFormData.cedula) {
      showToast("Nombre y Cédula son obligatorios", 'error');
      return;
    }

    showToast('Registrando cliente...', 'loading');

    try {
      const fd = new FormData();
      fd.append('full_name', clientFormData.full_name);
      fd.append('cedula', clientFormData.cedula);
      fd.append('email', clientFormData.email);
      fd.append('address', clientFormData.address);

      const res = await fetch(`${apiBase}/clients/`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, // FormData doesn't need Content-Type header, fetch adds boundary
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo registrar el cliente');
      
      // Success
      await loadClients(); // Reload list
      setFormData(prev => ({ ...prev, clientId: String(data.id) })); // Auto-select new client
      setIsClientModalOpen(false);
      setClientFormData({ full_name: '', cedula: '', email: '', address: '' });
      
      showToast('Cliente registrado exitosamente', 'success');
      
    } catch (error: any) {
      showToast(error.message || 'Error al crear cliente', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.value || !formData.clientId) {
      showToast("Por favor complete los campos obligatorios", 'error');
      return;
    }
    if (!token) return;
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        third_party_provider: formData.third_party_provider || '',
        third_party_cost: formData.third_party_cost ? Number(formData.third_party_cost) : 0,
        value: Number(formData.value),
        client: Number(formData.clientId),
        status: formData.status,
        entry_date: new Date().toISOString().split('T')[0],
      };
      
      let res;
      if (editingId) {
        res = await fetch(`${apiBase}/services/${editingId}/`, {
          method: 'PUT',
          headers: authHeaders(token),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiBase}/services/`, {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (editingId ? 'No se pudo actualizar el servicio' : 'No se pudo crear el servicio'));
      
      setIsModalOpen(false);
      setFormData({ name: '', description: '', third_party_provider: '', third_party_cost: '', value: '', clientId: '', status: 'recibido' });
      setEditingId(null);
      
      // Refresh and Open Print Modal
      loadServices();
      loadStats();
      
      // If we have the created object (data), use it. We need to attach client_name for the receipt.
      const createdService: Service = {
        ...data,
        client_name: clients.find(c => String(c.id) === String(payload.client))?.full_name || 'Cliente'
      };
      setPrintingService(createdService);
      
    } catch (error: any) {
      alert(error.message || 'Error al crear el servicio');
    }
  };

  const toggleStatus = async (id: number, current: 'recibido' | 'entregado') => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/services/${id}/`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status: current === 'recibido' ? 'entregado' : 'recibido' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'No se pudo actualizar el estado');
      }
      await loadServices();
      await loadStats();
      showToast('Estado actualizado correctamente', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error al actualizar estado', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;
    
    showToast('Eliminando servicio...', 'loading');
    
    try {
      const res = await fetch(`${apiBase}/services/${id}/`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error('No se pudo eliminar el servicio');
      await loadServices();
      await loadStats();
      showToast('Servicio eliminado correctamente', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar el servicio', 'error');
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      third_party_provider: service.third_party_provider || '',
      third_party_cost: service.third_party_cost ? String(service.third_party_cost) : '',
      value: String(service.value),
      clientId: String(service.client),
      status: service.status,
    });
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </span>
              Gestión de Servicios
            </h1>
            <p className="text-gray-400 text-sm mt-1">Administra los servicios ofrecidos a tus clientes</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar servicio..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none placeholder:text-gray-600"
              />
            </div>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="bg-gray-800 border-none text-xs text-gray-400 rounded-lg focus:ring-0 px-3 py-2"
            >
              <option value="-created_at">Más recientes</option>
              <option value="created_at">Más antiguos</option>
              <option value="name">Nombre A-Z</option>
              <option value="-value">Mayor valor</option>
              <option value="value">Menor valor</option>
            </select>
            <button 
              onClick={() => {
                setFormData({ name: '', description: '', third_party_provider: '', value: '', clientId: '', status: 'recibido' });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="btn-brand px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Servicio</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-black/50 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-blue-400">
              <Briefcase className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gray-800 text-blue-400 bg-opacity-10">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-400">Total Servicios</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-black/50 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-emerald-400">
              <CheckCircle className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gray-800 text-emerald-400 bg-opacity-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-400">Entregados</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.delivered}</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-black/50 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-amber-400">
              <Clock className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gray-800 text-amber-400 bg-opacity-10">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-400">Recibidos</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.received}</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-black/50 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-purple-400">
              <DollarSign className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gray-800 text-purple-400 bg-opacity-10">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-400">Valor Total</h3>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.total_value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-400">
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 font-medium tracking-wider">Servicio</th>
                <th className="px-6 py-3 font-medium tracking-wider">Cliente</th>
                <th className="px-6 py-3 font-medium tracking-wider">Tercero</th>
                <th className="px-6 py-3 font-medium tracking-wider">Valor</th>
                <th className="px-6 py-3 font-medium tracking-wider">Estado</th>
                <th className="px-6 py-3 font-medium tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                {(services.length > 0 ? services : []).length > 0 ? (
                (services || []).filter(s => 
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (s.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
                ).map((service) => (
                  <tr key={service.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{service.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-3 h-3 text-gray-500" />
                        {service.client_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-400 text-sm">
                        {service.third_party_provider || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        ${Number(service.value || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(service.id, service.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          service.status === 'entregado' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {service.status === 'entregado' ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Entregado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Recibido
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleSilentPrint(service)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Imprimir Recibo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(service)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
              <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="bg-gray-800 p-4 rounded-full mb-3">
                        <Briefcase className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-lg font-medium text-gray-400">No hay servicios registrados</p>
                      <p className="text-sm mt-1">Comienza agregando un nuevo servicio para tus clientes.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', description: '', third_party_provider: '', value: '', clientId: '', status: 'recibido' }); }} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Nombre del Servicio</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej. Reparación de PC"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Descripción</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detalles del servicio..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all resize-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Cliente</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select 
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none appearance-none transition-all"
                        required
                      >
                        <option value="">Seleccionar Cliente</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsClientModalOpen(true)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                      title="Crear nuevo cliente"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Valor</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="number" 
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Tercero (Opcional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="third_party_provider"
                      value={formData.third_party_provider}
                      onChange={handleInputChange}
                      placeholder="Nombre técnico/empresa"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Costo Tercero</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="number" 
                      name="third_party_cost"
                      value={formData.third_party_cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', description: '', third_party_provider: '', value: '', clientId: '', status: 'recibido' }); }}
                  className="flex-1 px-4 py-2.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 btn-brand rounded-lg text-sm font-medium text-white transition-all"
                >
                  {editingId ? 'Actualizar Servicio' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Client Modal (Nested) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h2 className="text-xl font-bold text-white">Registrar Nuevo Cliente</h2>
              <button onClick={() => setIsClientModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    name="full_name"
                    value={clientFormData.full_name}
                    onChange={handleClientInputChange}
                    placeholder="Nombre del cliente"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Cédula / NIT</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    name="cedula"
                    value={clientFormData.cedula}
                    onChange={handleClientInputChange}
                    placeholder="Número de identificación"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    name="email"
                    value={clientFormData.email}
                    onChange={handleClientInputChange}
                    placeholder="cliente@ejemplo.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    name="address"
                    value={clientFormData.address}
                    onChange={handleClientInputChange}
                    placeholder="Dirección de residencia"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-indigo-900/20 transition-all"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
      {/* Print Preview Modal */}
      {printingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg h-[80vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                   <Printer className="w-5 h-5 text-indigo-400" />
                   Imprimir Recibo de Servicio
                </h3>
                <button onClick={() => setPrintingService(null)} className="text-gray-500 hover:text-gray-800 transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Receipt Content - Iframe */}
             <div className="flex-1 overflow-hidden bg-gray-200 flex justify-center p-4">
                <div className="shadow-lg bg-white overflow-hidden" style={{ width: `${settings.paper_width_mm || 58}mm`, maxHeight: '100%', overflowY: 'auto' }}>
                  <iframe 
                    srcDoc={generateReceiptHtml(printingService)} 
                    className="w-full h-full border-none bg-white"
                    title="Receipt Preview"
                    style={{ minHeight: '400px' }}
                  />
                </div>
             </div>
             
             {/* Actions */}
             <div className="p-4 border-t border-gray-800 bg-gray-900 flex gap-3">
                <button 
                   onClick={handlePrint}
                   className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                >
                   <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button 
                   onClick={() => setPrintingService(null)}
                   className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
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

export default ServicesPage;
