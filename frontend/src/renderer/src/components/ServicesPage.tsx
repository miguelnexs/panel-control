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
  worker?: number;
  worker_name?: string;
  status: 'recibido' | 'entregado';
  active?: boolean;
  created_at: string;
}

interface ServiceDefinition {
  id: number;
  name: string;
  description: string;
  image: string | null;
  price: number;
  estimated_duration: string;
  active: boolean;
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
  initialOpen?: boolean;
  onClose?: () => void;
  onCreate?: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ token, apiBase, initialOpen = false, onClose, onCreate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [catalog, setCatalog] = useState<ServiceDefinition[]>([]);
  const [viewMode, setViewMode] = useState<'tickets' | 'catalog'>('tickets');
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(initialOpen);
  
  useEffect(() => {
    if (initialOpen) setIsModalOpen(true);
  }, [initialOpen]);
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
    worker: '',
    status: 'recibido' as 'recibido' | 'entregado'
  });
  const [printReceipt, setPrintReceipt] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Catalog Form State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogEditingId, setCatalogEditingId] = useState<number | null>(null);
  const [catalogFormData, setCatalogFormData] = useState({
    name: '',
    description: '',
    price: '',
    estimated_duration: '',
    image: null as File | null
  });

  // Client Form State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    full_name: '',
    cedula: '',
    email: '',
    address: ''
  });

  // Multiple Services State
  const [serviceItems, setServiceItems] = useState<Array<{ id: string, name: string, description: string, value: string, third_party_provider: string, third_party_cost: string, worker: string }>>([]);
  
  const addServiceItem = () => {
    setServiceItems(prev => [...prev, { id: String(Date.now()), name: '', description: '', value: '', third_party_provider: '', third_party_cost: '', worker: '' }]);
  };

  const removeServiceItem = (id: string) => {
    if (serviceItems.length > 1) {
      setServiceItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateServiceItem = (id: string, field: string, value: string) => {
    setServiceItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

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
    // Show preview modal instead of silent printing
    setPrintingService(service);
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

  // Intake (Entrada) Receipt - No prices, multiple services for one client
  const [printingIntake, setPrintingIntake] = useState<null | { clientName: string; items: Array<{ name: string; description: string; employee?: string }> }>(null);
  
  const generateIntakeReceiptHtml = (clientName: string, items: Array<{ name: string; description: string; employee?: string }>) => {
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
    const css = `*{box-sizing:border-box} body{font-family:Arial, sans-serif;margin:0;padding:${Number(printerOpts.margin_top || 10)}px 10px ${Number(printerOpts.margin_bottom || 10)}px;width:${paperW}mm} .c{text-align:center} .l{text-align:left} .r{text-align:right} .t{font-weight:600} .hr{height:1px;background:linear-gradient(90deg, ${primary}, transparent);margin:6px 0} .row{display:flex;justify-content:space-between;gap:6px} .tab{width:100%;border-collapse:collapse} .tab th,.tab td{padding:4px 0;font-size:${Number(printerOpts.font_size || 11)}px} .tab thead th{border-bottom:1px dashed #999;text-align:left} .small{font-size:${Math.max(9, Number(printerOpts.font_size || 11) - 2)}px}`;
    
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
      <div class="${alignCls} t">Recibo de Entrada</div>
      <div class="row small"><div>Cliente: ${clientName}</div><div>${new Date().toLocaleString()}</div></div>
      <div class="small ${alignCls}">Confirmación de recepción de servicios. Sin valores.</div>
    `;
    
    const combined = items.map((it, idx) => {
      const who = it.employee ? ` (${it.employee})` : '';
      const desc = it.description ? ` — ${it.description}` : '';
      return `${idx + 1}. ${it.name}${who}${desc}`;
    }).join(' • ');
    
    const table = `
      <table class="tab">
        <thead><tr><th>Servicios Ofrecidos</th></tr></thead>
        <tbody><tr><td><div class="small">${combined}</div></td></tr></tbody>
      </table>
    `;
    
    const qr = printerOpts.show_qr ? `<div class="c"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`INTAKE-${clientName}-${Date.now()}`)}" style="width:35mm;height:35mm;object-fit:contain"/></div>` : '';
    const footer = `<div class="hr"></div><div class="${alignCls} small">${settings.receipt_footer || ''}</div>${qr}`;
    
    return `<!doctype html><html><head><meta charset="utf-8"><title>Recibo de Entrada - ${clientName}</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
  };
  
  const openIntakePreview = () => {
    const client = clients.find(c => String(c.id) === String(formData.clientId));
    if (!client) {
      showToast('Selecciona un cliente antes de imprimir el recibo de entrada', 'error');
      return;
    }
    if (serviceItems.length === 0) {
      showToast('Agrega al menos un servicio para el recibo de entrada', 'error');
      return;
    }
    const items = serviceItems.map(it => {
      const emp = employees.find(e => String(e.id) === String(it.third_party_provider));
      const empName = emp ? ((emp.first_name || emp.last_name) ? `${emp.first_name} ${emp.last_name}`.trim() : emp.username) : undefined;
      return { name: it.name, description: it.description, employee: empName };
    });
    setPrintingIntake({ clientName: client.full_name, items });
  };
  
  const printIntakeReceiptDirectly = (clientName: string, items: Array<{ name: string; description: string; employee?: string }>) => {
    const html = generateIntakeReceiptHtml(clientName, items);
    const win = window.open('', '', 'height=600,width=400');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handlePrintIntake = () => {
    if (!printingIntake) return;
    printIntakeReceiptDirectly(printingIntake.clientName, printingIntake.items);
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

  const loadEmployees = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/users/api/users/?scope=tenant`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  useEffect(() => {
    loadClients();
    loadEmployees();
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

  const loadCatalog = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/services/definitions/`, { headers: authHeaders(token) });
      const data = await res.json();
      if (res.ok) {
        const arr = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setCatalog(arr);
      }
    } catch (e) {
      console.error("Error loading catalog", e);
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

  useEffect(() => { loadServices(); loadCatalog(); loadStats(); loadSettings(); }, [token]); 
  useEffect(() => { const t = setTimeout(() => { if (viewMode === 'tickets') loadServices(); else loadCatalog(); }, 300); return () => clearTimeout(t); }, [searchTerm, ordering, viewMode]);

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

    if (!token) return;

    // Bulk Create Mode
    if (!editingId) {
      if (!formData.clientId) {
        showToast("Seleccione un cliente", 'error');
        return;
      }
      for (const item of serviceItems) {
        if (!item.name || !item.description) {
          showToast("Complete los campos obligatorios de todos los servicios", 'error');
          return;
        }
      }

      showToast('Creando servicios...', 'loading');

      try {
        const promises = serviceItems.map(item => {
          const payload = {
            name: item.name,
            description: item.description,
            third_party_provider: item.third_party_provider || '',
            third_party_cost: item.third_party_cost ? Number(item.third_party_cost) : 0,
            value: Number(item.value),
            client: Number(formData.clientId),
            worker: item.worker ? Number(item.worker) : null,
            status: 'recibido',
            entry_date: new Date().toISOString().split('T')[0],
          };
          return fetch(`${apiBase}/services/`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(payload),
          }).then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Error creando servicio');
            return data;
          });
        });

        const results = await Promise.all(promises);
        
        setIsModalOpen(false);
        setFormData({ name: '', description: '', third_party_provider: '', third_party_cost: '', value: '', clientId: '', worker: '', status: 'recibido' });
        setEditingId(null);
        if (onClose) onClose();
        
        loadServices();
        loadStats();
        
        if (results.length > 0) {
           const clientName = clients.find(c => String(c.id) === String(formData.clientId))?.full_name || 'Cliente';
           const intakeItems = serviceItems.map(it => {
             const emp = employees.find(e => String(e.id) === String(it.worker));
             const empName = emp ? ((emp.first_name || emp.last_name) ? `${emp.first_name} ${emp.last_name}`.trim() : emp.username) : undefined;
             return { name: it.name, description: it.description, employee: empName };
           });
           setPrintingIntake({ clientName, items: intakeItems });
           
           if (printReceipt) {
             printIntakeReceiptDirectly(clientName, intakeItems);
           }
        }
        showToast('Servicios creados correctamente', 'success');
        
      } catch (error: any) {
        showToast(error.message || 'Error al crear servicios', 'error');
      }
      return;
    }

    // Edit Mode (Single Service)
    if (!formData.name || !formData.description || !formData.clientId) {
      showToast("Por favor complete los campos obligatorios", 'error');
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        third_party_provider: formData.third_party_provider || '',
        third_party_cost: formData.third_party_cost ? Number(formData.third_party_cost) : 0,
        value: Number(formData.value),
        client: Number(formData.clientId),
        worker: formData.worker ? Number(formData.worker) : null,
        status: formData.status,
        entry_date: new Date().toISOString().split('T')[0],
      };
      
      const res = await fetch(`${apiBase}/services/${editingId}/`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo actualizar el servicio');
      
      setIsModalOpen(false);
      setFormData({ name: '', description: '', third_party_provider: '', third_party_cost: '', value: '', clientId: '', worker: '', status: 'recibido' });
      setEditingId(null);
      if (onClose) onClose();
      
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
      showToast(error.message || 'Error al actualizar servicio', 'error');
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
      value: Number(service.value) === 0 ? '' : String(service.value),
      clientId: String(service.client),
      worker: service.worker ? String(service.worker) : '',
      status: service.status,
    });
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (!catalogFormData.name || !catalogFormData.description || !catalogFormData.price) {
      showToast('Complete los campos obligatorios', 'error');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', catalogFormData.name);
      fd.append('description', catalogFormData.description);
      fd.append('price', catalogFormData.price);
      fd.append('estimated_duration', catalogFormData.estimated_duration);
      if (catalogFormData.image) {
        fd.append('image', catalogFormData.image);
      }

      let res;
      if (catalogEditingId) {
        res = await fetch(`${apiBase}/services/definitions/${catalogEditingId}/`, {
          method: 'PATCH',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: fd
        });
      } else {
        res = await fetch(`${apiBase}/services/definitions/`, {
          method: 'POST',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: fd
        });
      }

      if (!res.ok) throw new Error('Error al guardar servicio en catálogo');
      
      showToast('Servicio guardado en catálogo', 'success');
      setIsCatalogModalOpen(false);
      setCatalogFormData({ name: '', description: '', price: '', estimated_duration: '', image: null });
      setCatalogEditingId(null);
      loadCatalog();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleCatalogDelete = async (id: number) => {
    if (!token || !window.confirm('¿Eliminar del catálogo?')) return;
    try {
      const res = await fetch(`${apiBase}/services/definitions/${id}/`, {
        method: 'DELETE',
        headers: authHeaders(token)
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      showToast('Eliminado del catálogo', 'success');
      loadCatalog();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleCatalogEdit = (item: ServiceDefinition) => {
    setCatalogFormData({
      name: item.name,
      description: item.description,
      price: String(item.price),
      estimated_duration: item.estimated_duration,
      image: null
    });
    setCatalogEditingId(item.id);
    setIsCatalogModalOpen(true);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCatalog = catalog.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex bg-gray-800 p-1 rounded-lg mr-2">
              <button
                onClick={() => setViewMode('tickets')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'tickets' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Servicios Activos
              </button>
              <button
                onClick={() => setViewMode('catalog')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'catalog' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Catálogo
              </button>
            </div>

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
                if (viewMode === 'tickets') {
                  if (onCreate) {
                    onCreate();
                  } else {
                    setFormData({ name: '', description: '', third_party_provider: '', third_party_cost: '', value: '', clientId: '', status: 'recibido' });
                    setEditingId(null);
                    setServiceItems([{ id: String(Date.now()), name: '', description: '', value: '', third_party_provider: '', third_party_cost: '' }]);
                    setIsModalOpen(true);
                  }
                } else {
                  setCatalogFormData({ name: '', description: '', price: '', estimated_duration: '', image: null });
                  setCatalogEditingId(null);
                  setIsCatalogModalOpen(true);
                }
              }}
              className="btn-brand px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{viewMode === 'tickets' ? 'Nuevo Servicio' : 'Agregar al Catálogo'}</span>
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
                {viewMode === 'tickets' ? (
                  <>
                    <th className="px-6 py-3 font-medium tracking-wider">Servicio</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Cliente</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Asignado</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Prov. Externo</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Valor</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Estado</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 font-medium tracking-wider">Nombre</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Descripción</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Precio Base</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Duración Est.</th>
                    <th className="px-6 py-3 font-medium tracking-wider">Imagen</th>
                  </>
                )}
                <th className="px-6 py-3 font-medium tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {viewMode === 'tickets' ? (
                (services.length > 0 ? services : []).length > 0 ? (
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
                        {service.worker_name || '-'}
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
              )
            ) : (
              // Catalog View
              filteredCatalog.length > 0 ? (
                filteredCatalog.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        ${Number(item.price || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">{item.estimated_duration || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-600">
                          <Briefcase className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleCatalogEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleCatalogDelete(item.id)}
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
                      <p className="text-lg font-medium text-gray-400">El catálogo está vacío</p>
                      <p className="text-sm mt-1">Agrega servicios predefinidos para agilizar tus tickets.</p>
                    </div>
                  </td>
                </tr>
              )
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
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', description: '', third_party_provider: '', value: '', clientId: '', status: 'recibido' }); if (onClose) onClose(); }} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Client Selection (Always Global) */}
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

              {!editingId ? (
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {serviceItems.map((item, index) => (
                      <div key={item.id} className="p-4 border border-gray-700 rounded-xl bg-gray-800/50 relative">
                         {serviceItems.length > 1 && (
                            <button type="button" onClick={() => removeServiceItem(item.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400">
                               <Trash className="w-4 h-4" />
                            </button>
                         )}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-400 mb-1">Servicio #{index + 1} - Cargar desde Catálogo</label>
                                <select 
                                  onChange={(e) => {
                                    const catItem = catalog.find(c => String(c.id) === e.target.value);
                                    if (catItem) {
                                      updateServiceItem(item.id, 'name', catItem.name);
                                      updateServiceItem(item.id, 'description', catItem.description);
                                      updateServiceItem(item.id, 'value', String(catItem.price));
                                    }
                                  }}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                                >
                                  <option value="">Seleccionar...</option>
                                  {catalog.map(c => <option key={c.id} value={c.id}>{c.name} - ${Number(c.price).toLocaleString()}</option>)}
                                </select>
                             </div>
                             
                             <div className="col-span-2">
                               <input type="text" placeholder="Nombre del Servicio" value={item.name} onChange={(e) => updateServiceItem(item.id, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" required />
                             </div>
                             
                             <div className="col-span-2">
                               <textarea placeholder="Descripción" value={item.description} onChange={(e) => updateServiceItem(item.id, 'description', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none" rows={2} required />
                             </div>
                             
                             <div>
                               <input type="number" placeholder="Valor (Opcional)" value={item.value} onChange={(e) => updateServiceItem(item.id, 'value', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" min="0" />
                             </div>

                             <div>
                                <select value={item.worker} onChange={(e) => updateServiceItem(item.id, 'worker', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                                  <option value="">Asignar Empleado (Opcional)</option>
                                  {employees.map(emp => {
                                    const name = emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.username;
                                    return <option key={emp.id} value={emp.id}>{name}</option>;
                                  })}
                                </select>
                             </div>

                             <div>
                                <input type="text" placeholder="Proveedor Externo (Opcional)" value={item.third_party_provider} onChange={(e) => updateServiceItem(item.id, 'third_party_provider', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                             </div>
                             
                             {item.third_party_provider && (
                                 <div>
                                    <input type="number" placeholder="Costo Tercero (Opcional)" value={item.third_party_cost} onChange={(e) => updateServiceItem(item.id, 'third_party_cost', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" min="0" />
                                 </div>
                             )}
                         </div>
                      </div>
                   ))}
                  </div>
                  <button type="button" onClick={addServiceItem} className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all flex items-center justify-center gap-2 mt-4">
                    <Plus className="w-4 h-4" /> Agregar otro servicio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Catalog Selection */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Cargar desde Catálogo (Opcional)</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select 
                        onChange={(e) => {
                          const item = catalog.find(c => String(c.id) === e.target.value);
                          if (item) {
                            setFormData(prev => ({
                              ...prev,
                              name: item.name,
                              description: item.description,
                              value: String(item.price)
                            }));
                          }
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none appearance-none transition-all"
                      >
                        <option value="">Seleccionar del Catálogo...</option>
                        {catalog.map(item => (
                          <option key={item.id} value={item.id}>{item.name} - ${Number(item.price).toLocaleString()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Valor</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="number" 
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        placeholder="0.00 (Opcional)"
                        min="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Asignar a</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select 
                        name="worker"
                        value={formData.worker}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none appearance-none transition-all"
                      >
                        <option value="">Sin Asignar</option>
                        {employees.map(emp => {
                          const name = emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.username;
                          return (
                            <option key={emp.id} value={emp.id}>{name}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Proveedor Externo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text"
                        name="third_party_provider"
                        value={formData.third_party_provider}
                        onChange={handleInputChange}
                        placeholder="Opcional"
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
                  
                   <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Estado</label>
                      <select 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none appearance-none transition-all"
                      >
                        <option value="recibido">Recibido</option>
                        <option value="entregado">Entregado</option>
                      </select>
                   </div>
                </div>
              )}

              {!editingId && (
                <div className="flex items-center gap-2 px-1">
                  <input 
                    type="checkbox" 
                    id="printReceipt" 
                    checked={printReceipt} 
                    onChange={(e) => setPrintReceipt(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500/40"
                  />
                  <label htmlFor="printReceipt" className="text-sm text-gray-400 select-none cursor-pointer flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir recibo de entrada
                  </label>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', description: '', third_party_provider: '', value: '', clientId: '', status: 'recibido' }); if (onClose) onClose(); }}
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
      {/* Catalog Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h2 className="text-xl font-bold text-white">{catalogEditingId ? 'Editar Item Catálogo' : 'Nuevo Item Catálogo'}</h2>
              <button onClick={() => { setIsCatalogModalOpen(false); setCatalogEditingId(null); setCatalogFormData({ name: '', description: '', price: '', estimated_duration: '', image: null }); }} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCatalogSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Nombre del Servicio</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="name"
                      value={catalogFormData.name}
                      onChange={(e) => setCatalogFormData({...catalogFormData, name: e.target.value})}
                      placeholder="Ej. Formateo Windows"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Descripción</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea 
                      name="description"
                      value={catalogFormData.description}
                      onChange={(e) => setCatalogFormData({...catalogFormData, description: e.target.value})}
                      placeholder="Detalles del servicio predefinido..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Precio Base</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="number" 
                        name="price"
                        value={catalogFormData.price}
                        onChange={(e) => setCatalogFormData({...catalogFormData, price: e.target.value})}
                        placeholder="0.00"
                        min="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Duración Estimada</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        name="estimated_duration"
                        value={catalogFormData.estimated_duration}
                        onChange={(e) => setCatalogFormData({...catalogFormData, estimated_duration: e.target.value})}
                        placeholder="Ej. 2 horas"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Imagen (Opcional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCatalogFormData({...catalogFormData, image: e.target.files[0]});
                      }
                    }}
                    accept="image/*"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  />
                </div>

              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsCatalogModalOpen(false); setCatalogEditingId(null); setCatalogFormData({ name: '', description: '', price: '', estimated_duration: '', image: null }); }}
                  className="flex-1 px-4 py-2.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 btn-brand rounded-lg text-sm font-medium text-white transition-all"
                >
                  {catalogEditingId ? 'Actualizar' : 'Guardar'}
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

      {/* Intake Receipt Preview Modal */}
      {printingIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg h-[80vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                   <Printer className="w-5 h-5 text-indigo-400" />
                   Recibo de Entrada (Sin Precios)
                </h3>
                <button onClick={() => setPrintingIntake(null)} className="text-gray-500 hover:text-gray-800 transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex-1 overflow-hidden bg-gray-200 flex justify-center p-4">
                <div className="shadow-lg bg-white overflow-hidden" style={{ width: `${settings.paper_width_mm || 58}mm`, maxHeight: '100%', overflowY: 'auto' }}>
                  <iframe 
                    srcDoc={generateIntakeReceiptHtml(printingIntake.clientName, printingIntake.items)} 
                    className="w-full h-full border-none bg-white"
                    title="Intake Receipt Preview"
                    style={{ minHeight: '400px' }}
                  />
                </div>
             </div>
             
             <div className="p-4 border-t border-gray-800 bg-gray-900 flex gap-3">
                <button 
                   onClick={handlePrintIntake}
                   className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                >
                   <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button 
                   onClick={() => setPrintingIntake(null)}
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
