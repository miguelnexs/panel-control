import React, { useEffect, useState } from 'react';
import { 
  User, Building, Printer, Save, RefreshCw, 
  MapPin, Globe, Smartphone, FileText, Palette, 
  Image as ImageIcon, Mail, Phone, Briefcase, 
  CreditCard, Layout, Type, AlignCenter, Maximize, 
  Minimize, QrCode, CheckCircle2, AlertCircle, X, Key,
  ShieldCheck, Instagram, Landmark, Sparkles, BadgeCheck,
  Building2, Hash, FileCheck
} from 'lucide-react';

import GoogleConfig from './GoogleConfig';

interface UserProfile {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role?: string;
  tenant_name?: string;
  subscription_name?: string;
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
  // Campos corporativos adicionales
  tax_regime?: string;
  city_dept?: string;
  merchant_register?: string;
  legal_representative?: string;
  website_url?: string;
  social_instagram?: string;
  bank_info?: string;
  raw_page_content?: any;
  // Ventas
  printer_type?: string;
  printer_name?: string;
  paper_width_mm?: number;
  auto_print?: boolean;
  receipt_footer?: string;
  // Servicios
  service_printer_type?: string;
  service_printer_name?: string;
  service_paper_width_mm?: number;
  service_auto_print?: boolean;
  service_receipt_footer?: string;
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
  forcedTab?: 'datos' | 'empresa' | 'impresora' | 'google';
  hideTabs?: boolean;
  title?: string;
  subtitle?: string;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ token, apiBase: rawApiBase, forcedTab, hideTabs, title, subtitle }) => {
  const apiBase = rawApiBase.replace(/\/$/, '');
  const headers = (tkn: string, json = true) => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });
  const [tab, setTab] = useState<'datos' | 'empresa' | 'impresora' | 'google'>(forcedTab || 'datos');
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
  const [servicePrinterOpts, setServicePrinterOpts] = useState<PrinterOptions>({
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
  const [printerTab, setPrinterTab] = useState<'venta' | 'servicio'>('venta');
  const hasElectronIpc = Boolean((window as any)?.electron?.ipcRenderer?.invoke);
  const [uiIpcAvailable, setUiIpcAvailable] = useState(true);
  const [uiPreset, setUiPreset] = useState<'default' | 'compact' | 'normal' | 'large' | 'fullhd' | 'maximized'>('default');
  const [uiZoom, setUiZoom] = useState<number>(0.9);
  
  // Modal Preview Helpers
  const modalMaxWidth = Number(printerOpts.font_size || 11) >= 16 ? 'max-w-4xl' : Number(printerOpts.font_size || 11) >= 13 ? 'max-w-2xl' : 'max-w-xl';
  const previewWidth = `${(Number(settings.paper_width_mm) || 58) + Math.max(0, (Number(printerOpts.font_size || 11) - 11) * 5)}mm`;
  const iframeMinHeight = `${Math.max(400, 400 + (Number(printerOpts.font_size || 11) - 11) * 30)}px`;

  useEffect(() => {
    if (forcedTab) setTab(forcedTab);
  }, [forcedTab]);

  useEffect(() => {
    if (!hasElectronIpc || !uiIpcAvailable) return;
    (window as any).electron.ipcRenderer.invoke('ui:get-settings').then((s: any) => {
      const preset = String(s?.preset || 'default');
      const zoom = Number(s?.zoom || 1);
      if (['default', 'compact', 'normal', 'large', 'fullhd', 'maximized'].includes(preset)) setUiPreset(preset as any);
      if (Number.isFinite(zoom)) setUiZoom(zoom);
    }).catch((e: any) => {
      const msg = String(e?.message || '');
      if (msg.includes('No handler registered')) setUiIpcAvailable(false);
    });
  }, [hasElectronIpc, uiIpcAvailable]);

  const applyUi = async () => {
    if (!hasElectronIpc || !uiIpcAvailable) return;
    setMsg(null);
    try {
      await (window as any).electron.ipcRenderer.invoke('ui:apply-settings', { preset: uiPreset, zoom: uiZoom });
      setMsg({ type: 'success', text: 'Resolución aplicada.' });
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('No handler registered')) setUiIpcAvailable(false);
      setMsg({ type: 'error', text: msg || 'No se pudo aplicar la resolución.' });
    }
  };

  const resetUi = async () => {
    if (!hasElectronIpc || !uiIpcAvailable) return;
    setMsg(null);
    try {
      await (window as any).electron.ipcRenderer.invoke('ui:reset-settings');
      setUiPreset('default');
      setUiZoom(1);
      setMsg({ type: 'success', text: 'Resolución restablecida.' });
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('No handler registered')) setUiIpcAvailable(false);
      setMsg({ type: 'error', text: msg || 'No se pudo restablecer la resolución.' });
    }
  };

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
        role: data.role || 'employee',
        tenant_name: data.tenant?.name || data.tenant_name || 'Mi Empresa',
        subscription_name: data.subscription?.name || (data.role === 'super_admin' ? 'Super Admin' : 'Plan Profesional')
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
      const pageContent = data.page_content || {};
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
        tax_regime: pageContent.tax_regime || 'no_responsable',
        city_dept: pageContent.city_dept || '',
        merchant_register: pageContent.merchant_register || '',
        legal_representative: pageContent.legal_representative || '',
        website_url: pageContent.website_url || '',
        social_instagram: pageContent.social_instagram || '',
        bank_info: pageContent.bank_info || '',
        raw_page_content: pageContent,
        // Ventas
        printer_type: data.printer_type || 'system',
        printer_name: data.printer_name || '',
        paper_width_mm: data.paper_width_mm || 58,
        auto_print: !!data.auto_print,
        receipt_footer: data.receipt_footer || '',
        // Servicios
        service_printer_type: data.service_printer_type || 'system',
        service_printer_name: data.service_printer_name || '',
        service_paper_width_mm: data.service_paper_width_mm || 58,
        service_auto_print: !!data.service_auto_print,
        service_receipt_footer: data.service_receipt_footer || '',
      });
      // Parse Ventas Options
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
          setSettings((s) => ({ ...s, receipt_footer: obj.message ?? '' }));
        }
      } catch {}

      // Parse Servicios Options
      try {
        const raw = data.service_receipt_footer || '';
        const obj = typeof raw === 'string' ? JSON.parse(raw) : null;
        if (obj && typeof obj === 'object') {
          setServicePrinterOpts({
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
          setSettings((s) => ({ ...s, service_receipt_footer: obj.message ?? '' }));
        }
      } catch {}
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
          // Ventas
          printer_type: settings.printer_type || 'system',
          printer_name: settings.printer_name || '',
          paper_width_mm: Number(settings.paper_width_mm || 58),
          auto_print: !!settings.auto_print,
          // Servicios
          service_printer_type: settings.service_printer_type || 'system',
          service_printer_name: settings.service_printer_name || '',
          service_paper_width_mm: Number(settings.service_paper_width_mm || 58),
          service_auto_print: !!settings.service_auto_print,
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

        const serviceReceiptPayload = {
          message: settings.service_receipt_footer || '',
          show_logo: !!servicePrinterOpts.show_logo,
          header1: servicePrinterOpts.header1 || '',
          header2: servicePrinterOpts.header2 || '',
          align: servicePrinterOpts.align || 'center',
          font_size: Number(servicePrinterOpts.font_size || 11),
          margins: { top: Number(servicePrinterOpts.margin_top || 10), bottom: Number(servicePrinterOpts.margin_bottom || 10) },
          show_qr: !!servicePrinterOpts.show_qr,
          logo_mode: servicePrinterOpts.logo_mode || 'company',
          logo_url: servicePrinterOpts.logo_url || '',
          logo_width_mm: Number(servicePrinterOpts.logo_width_mm || 45),
        };

        const payload = { 
          ...payloadBase, 
          receipt_footer: JSON.stringify(receiptPayload),
          service_receipt_footer: JSON.stringify(serviceReceiptPayload)
        };

        const res = await fetch(`${apiBase}/webconfig/settings/`, { method: 'PUT', headers: headers(token, true), body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudieron guardar cambios');
        setMsg({ type: 'success', text: 'Configuraciones de impresora guardadas' });
        
        // Reload all to be sure
        loadSettings();
        setSaving(false);
        return;
      }
      const pageContentPayload = {
        ...(settings.raw_page_content || {}),
        tax_regime: settings.tax_regime || '',
        city_dept: settings.city_dept || '',
        merchant_register: settings.merchant_register || '',
        legal_representative: settings.legal_representative || '',
        website_url: settings.website_url || '',
        social_instagram: settings.social_instagram || '',
        bank_info: settings.bank_info || '',
      };

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
      fd.append('page_content', JSON.stringify(pageContentPayload));

      if (logoFile) fd.append('logo', logoFile);
      const res = await fetch(`${apiBase}/webconfig/settings/`, { method: 'PUT', headers: headers(token, false), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron guardar cambios');
      setMsg({ type: 'success', text: 'Identidad corporativa guardada exitosamente' });
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
      const css = `@page{size:${paperW}mm auto;margin:0} *{box-sizing:border-box} html{background:#fff} html,body{margin:0;padding:0} body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;font-family:Arial, sans-serif;width:${paperW}mm;margin:0 auto;padding:${Number(printerOpts.margin_top || 10)}px 10px ${Number(printerOpts.margin_bottom || 10)}px} img{max-width:100%;height:auto} .c{text-align:center} .l{text-align:left} .r{text-align:right} .t{font-weight:600} .hr{height:1px;background:linear-gradient(90deg, ${primary}, transparent);margin:6px 0} .row{display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap} .tab{width:100%;border-collapse:collapse;table-layout:fixed} .tab th,.tab td{padding:4px 0;font-size:${Number(printerOpts.font_size || 11)}px;vertical-align:top} .tab td{word-break:break-word} .tab thead th{border-bottom:1px dashed #999;text-align:left} .tab tfoot td{border-top:1px dashed #999} .small{font-size:${Math.max(9, Number(printerOpts.font_size || 11) - 2)}px}`;
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
        <div class="row small"><div>CÓDIGO VENTA: #VEN-2026-0220</div><div>${new Date().toLocaleString()}</div></div>
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
      const sampleSaleCode = '#VEN-2026-0220';
      const qr = printerOpts.show_qr ? `<div class="c" style="margin-top: 6px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(sampleSaleCode)}" style="width:36mm;height:36mm;object-fit:contain"/><div class="small" style="font-weight:700;font-family:monospace;margin-top:2px;">${sampleSaleCode}</div></div>` : '';
      const footer = `<div class="hr"></div>${qr}<div class="${alignCls} small">${settings.receipt_footer || ''}</div>`;
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Recibo</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
      
      setPreviewHtml(html);
    } catch {}
  };

  const previewServiceSample = () => {
    try {
      const paperW = Number(settings.service_paper_width_mm || 58);
      const primary = settings.primary_color || '#000';
      const brand = (settings.company_name || 'Mi Empresa de Servicios');
      const nit = (settings.company_nit || '900.000.000');
      const addr = (settings.company_address || 'Dirección Principal');
      const phone = (settings.company_phone || '300 000 0000');
      const logo = settings.logo || '';
      
      const absUrlFn = (path: string | null) => { try { if (!path) return ''; if (String(path).startsWith('http://') || String(path).startsWith('https://')) return path; if (String(path).startsWith('/')) return `${apiBase}${path}`; return `${apiBase}/${path}`; } catch { return path; } };
      const logoSrc = servicePrinterOpts.logo_mode === 'custom' && servicePrinterOpts.logo_url ? servicePrinterOpts.logo_url : logo;
      const logoTag = servicePrinterOpts.show_logo && logoSrc ? `<div class="c"><img src="${logoSrc.startsWith('http') ? logoSrc : absUrlFn(logoSrc)}" style="width:${Number(servicePrinterOpts.logo_width_mm || 45)}mm;height:auto;object-fit:contain"/></div>` : '';
      
      const alignCls = servicePrinterOpts.align === 'left' ? 'l' : servicePrinterOpts.align === 'right' ? 'r' : 'c';
      
      const css = `@page{size:${paperW}mm auto;margin:0} *{box-sizing:border-box} html{background:#fff} html,body{margin:0;padding:0} body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;font-family:Arial, sans-serif;width:${paperW}mm;margin:0 auto;padding:${Number(servicePrinterOpts.margin_top || 10)}px 10px ${Number(servicePrinterOpts.margin_bottom || 10)}px} img{max-width:100%;height:auto} .c{text-align:center} .l{text-align:left} .r{text-align:right} .t{font-weight:600} .hr{height:1px;background:linear-gradient(90deg, ${primary}, transparent);margin:6px 0} .row{display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap} .tab{width:100%;border-collapse:collapse;table-layout:fixed} .tab th,.tab td{padding:4px 0;font-size:${Number(servicePrinterOpts.font_size || 11)}px;vertical-align:top} .tab td{word-break:break-word} .tab thead th{border-bottom:1px dashed #999;text-align:left} .tab tfoot td{border-top:1px dashed #999} .small{font-size:${Math.max(9, Number(servicePrinterOpts.font_size || 11) - 2)}px}`;
      
      const header = `
        ${logoTag}
        <div class="${alignCls}">
          <div class="t">${brand}</div>
          <div class="small">${nit}</div>
          <div class="small">${addr}</div>
          <div class="small">${phone}</div>
          ${servicePrinterOpts.header1 ? `<div class="small">${servicePrinterOpts.header1}</div>` : ''}
          ${servicePrinterOpts.header2 ? `<div class="small">${servicePrinterOpts.header2}</div>` : ''}
        </div>
        <div class="hr"></div>
        <div class="row small"><div>Servicio: #12345</div><div>${new Date().toLocaleString()}</div></div>
        <div class="row small"><div>Cliente: María González</div><div></div></div>
      `;
      
      const table = `
        <table class="tab">
          <thead><tr><th>Descripción</th><th class="r">Valor</th></tr></thead>
          <tbody>
            <tr>
              <td>
                <div class="t">Mantenimiento General</div>
                <div class="small">Limpieza, ajuste y lubricación de componentes.</div>
              </td>
              <td class="r">${(85000).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td>
            </tr>
          </tbody>
          <tfoot><tr><td class="t">Total</td><td class="r t">${(85000).toLocaleString('es-CO',{style:'currency',currency:'COP'})}</td></tr></tfoot>
        </table>
      `;
      
      const qr = servicePrinterOpts.show_qr ? `<div class="c"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('SVC-12345')}" style="width:35mm;height:35mm;object-fit:contain"/></div>` : '';
      const footer = `<div class="hr"></div><div class="${alignCls} small">${settings.service_receipt_footer || ''}</div>${qr}`;
      
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Recibo Servicio</title><style>${css}</style></head><body>${header}${table}${footer}</body></html>`;
      
      setPreviewHtml(html);
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {title || 'Configuración del Sistema'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {subtitle || 'Gestiona tu perfil, la identidad de tu empresa y preferencias de impresión'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={tab==='datos'?() => loadMe():loadSettings} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">{loading?'Cargando...':'Recargar'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!hideTabs && (
        <div className="flex p-1 bg-gray-100 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 w-full md:w-fit overflow-x-auto">
          {[
            { id: 'datos', label: 'Datos Personales', icon: User },
            { id: 'empresa', label: 'Empresa', icon: Building },
            { id: 'impresora', label: 'Impresora', icon: Printer },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                ${tab === t.id 
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700 font-bold' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/40'
                }
              `}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{msg.text}</span>
        </div>
      )}

      {/* Content Areas */}
      <div className="relative">
        {/* Datos Personales */}
        {tab === 'datos' && (
          <div className="space-y-6 animate-fade-in w-full">
            {/* Hero Card del Perfil Profesional - Estilo Sutil y Sobrio */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 text-gray-900 dark:text-white shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-inner shrink-0 text-gray-700 dark:text-gray-200 uppercase">
                  {(me.first_name?.[0] || me.username?.[0] || 'U')}
                  {(me.last_name?.[0] || '')}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-gray-300/50 dark:border-gray-700">
                      <BadgeCheck size={14} className="text-gray-500 dark:text-gray-400" />
                      <span>{me.role === 'super_admin' ? 'Super Administrador' : me.role === 'admin' ? 'Administrador' : 'Empleado'}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-200/60 dark:bg-gray-800/60 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      {me.subscription_name || 'Plan Profesional'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {me.first_name || me.last_name ? `${me.first_name} ${me.last_name}` : me.username}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><User size={14} /> @{me.username}</span>
                    <span className="flex items-center gap-1"><Building size={14} /> {me.tenant_name || 'Mi Empresa'}</span>
                    {me.email && <span className="flex items-center gap-1"><Mail size={14} /> {me.email}</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Información de Perfil</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Actualiza tus datos personales y de contacto administrativo</p>
                </div>
              </div>

              <form onSubmit={saveMe} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} /> Usuario de Acceso
                    </label>
                    <input 
                      name="username" 
                      value={me.username} 
                      disabled 
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 text-gray-500 border border-gray-200 dark:border-gray-800 cursor-not-allowed text-sm font-medium" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={13} /> Correo Electrónico
                    </label>
                    <input 
                      name="email" 
                      value={me.email} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nombre</label>
                    <input 
                      name="first_name" 
                      value={me.first_name} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Apellido</label>
                    <input 
                      name="last_name" 
                      value={me.last_name} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="Ingresa tu apellido"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={13} /> Teléfono Directo / WhatsApp
                    </label>
                    <input 
                      name="phone" 
                      value={me.phone || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="ej: +57 300 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={13} /> Departamento / Área
                    </label>
                    <input 
                      name="department" 
                      value={me.department || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="ej: Ventas, Administración"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-3">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase size={13} /> Cargo / Puesto de Trabajo
                    </label>
                    <input 
                      name="position" 
                      value={me.position || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="ej: Gerente Comercial / Administrador POS"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                  >
                    <Save size={16} />
                    {saving ? 'Guardando...' : 'Guardar Cambios de Perfil'}
                  </button>
                </div>
              </form>

              <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Layout size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Ajustes de Pantalla del Dashboard</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Personaliza la resolución y escala visual de tu aplicación</div>
                  </div>
                </div>

                {!hasElectronIpc ? (
                  <div className="text-xs text-gray-500">Ajuste exclusivo para la aplicación instalada.</div>
                ) : !uiIpcAvailable ? (
                  <div className="text-xs text-gray-500">Reinicia la aplicación para habilitar este ajuste.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Maximize size={13} /> Tamaño de Ventana
                      </label>
                      <select
                        value={uiPreset}
                        onChange={(e) => setUiPreset(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-medium cursor-pointer"
                      >
                        <option value="default">Automático</option>
                        <option value="compact">Compacto (1280×720)</option>
                        <option value="normal">Normal (1400×900)</option>
                        <option value="large">Grande (1600×1000)</option>
                        <option value="fullhd">Full HD (1920×1080)</option>
                        <option value="maximized">Pantalla Completa</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Type size={13} /> Nivel de Zoom
                      </label>
                      <select
                        value={String(uiZoom)}
                        onChange={(e) => setUiZoom(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-medium cursor-pointer"
                      >
                        <option value="0.75">75% (Más pequeño)</option>
                        <option value="0.8">80%</option>
                        <option value="0.85">85%</option>
                        <option value="0.9">90% (Recomendado)</option>
                        <option value="1">100% (Normal)</option>
                        <option value="1.1">110%</option>
                        <option value="1.25">125% (Más grande)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={resetUi}
                        className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Minimize size={14} />
                        Restablecer
                      </button>
                      <button
                        type="button"
                        onClick={applyUi}
                        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/20"
                      >
                        <Maximize size={14} />
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empresa */}
        {tab === 'empresa' && (
          <div className="space-y-6 animate-fade-in w-full">
            {/* Brand Showcase Card - Estilo Sobrio y Tranquilo */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 text-gray-900 dark:text-white shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {logoFile ? (
                      <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : settings.logo ? (
                      <img src={absUrl(settings.logo)} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-gray-200/80 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1 border border-gray-300/50 dark:border-gray-700">
                        <Sparkles size={12} />
                        <span>Identidad Corporativa</span>
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {settings.company_name || 'Nombre de tu Empresa'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {settings.company_nit && <span>NIT / Cédula: <strong>{settings.company_nit}</strong></span>}
                      {settings.company_address && <span className="flex items-center gap-1"><MapPin size={12} /> {settings.company_address}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <form onSubmit={saveSettings} className="space-y-8">
                {/* Bloque 1: Datos Legales e Identificación Fiscal */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">1. Información Legal y Fiscal</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Nombre Comercial / Razón Social *
                      </label>
                      <input 
                        name="company_name" 
                        value={settings.company_name} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm font-medium placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: Comercializadora El Sol S.A.S"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Hash size={13} /> NIT / Número de Identificación *
                      </label>
                      <input 
                        name="company_nit" 
                        value={settings.company_nit} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm font-medium placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: 900.123.456-1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <FileCheck size={13} /> Régimen Tributario
                      </label>
                      <select
                        name="tax_regime"
                        value={settings.tax_regime || 'no_responsable'}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm font-medium cursor-pointer"
                      >
                        <option value="no_responsable">No Responsable de IVA (Régimen Simplificado)</option>
                        <option value="responsable_iva">Responsable de IVA (Régimen Común)</option>
                        <option value="rst">Régimen Simple de Tributación (RST)</option>
                        <option value="gran_contribuyente">Gran Contribuyente</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <FileText size={13} /> Matrícula Mercantil (Cámara de Comercio)
                      </label>
                      <input 
                        name="merchant_register" 
                        value={settings.merchant_register || ''} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: N° 123456-16"
                      />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <User size={13} /> Representante Legal
                      </label>
                      <input 
                        name="legal_representative" 
                        value={settings.legal_representative || ''} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="Nombre completo del representante legal"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Contacto y Ubicación */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">2. Canales de Contacto Directo y Ubicación</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone size={13} /> Teléfono Fijo / Móvil
                      </label>
                      <input 
                        name="company_phone" 
                        value={settings.company_phone} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: (606) 345 6789"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone size={13} /> WhatsApp Corporativo
                      </label>
                      <input 
                        name="company_whatsapp" 
                        value={settings.company_whatsapp} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: +57 300 987 6543"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={13} /> Correo Electrónico Oficial
                      </label>
                      <input 
                        type="email" 
                        name="company_email" 
                        value={settings.company_email} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="contacto@empresa.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} /> Ciudad y Departamento
                      </label>
                      <input 
                        name="city_dept" 
                        value={settings.city_dept || ''} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: Pereira, Risaralda"
                      />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} /> Dirección Sede Principal
                      </label>
                      <input 
                        name="company_address" 
                        value={settings.company_address} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ej: Cra 7 # 19-28, Centro"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Presencia Digital y Datos Bancarios */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">3. Presencia Digital y Cuentas de Pago</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe size={13} /> Sitio Web Oficial / Tienda
                      </label>
                      <input 
                        name="website_url" 
                        value={settings.website_url || ''} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="https://www.miempresa.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Instagram size={13} /> Instagram Corporativo
                      </label>
                      <input 
                        name="social_instagram" 
                        value={settings.social_instagram || ''} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="@miempresa_oficial"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark size={13} /> Datos Bancarios para Transferencias de Clientes
                      </label>
                      <textarea 
                        name="bank_info" 
                        value={settings.bank_info || ''} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600 min-h-[70px] resize-none"
                        placeholder="ej: Bancolombia Ahorros 123-456789-00 / Nequi 3001234567 (Titular: Mi Empresa SAS)"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloque 4: Logo e Imagen Institucional */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <ImageIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">4. Logo e Imagen Institucional</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Descripción Comercial del Negocio</label>
                      <textarea 
                        name="company_description" 
                        value={settings.company_description} 
                        onChange={handleSettingsChange} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-gray-400 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600 min-h-[90px] resize-none"
                        placeholder="Breve reseña comercial de tu empresa que aparecerá en tus cotizaciones y portal web..."
                      />
                    </div>

                    {/* Logo upload */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-4">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={14} /> Logo Oficial de la Empresa
                      </label>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-sm p-2">
                          {logoFile ? (
                            <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-contain" />
                          ) : settings.logo ? (
                            <img src={absUrl(settings.logo)} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="text-gray-400 dark:text-gray-600 w-10 h-10" />
                          )}
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogo} 
                            className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white dark:file:bg-gray-800 hover:file:bg-black cursor-pointer" 
                          />
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Formatos soportados: PNG o JPG con fondo transparente. Tamaño recomendado: mínimo 300x300px.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                  >
                    <Save size={16} />
                    {saving ? 'Guardando...' : 'Guardar Identidad Corporativa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Impresora */}
        {tab === 'impresora' && (
          <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in shadow-sm dark:shadow-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Printer size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuración de Impresión</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza el formato de tus recibos y facturas POS</p>
                </div>
              </div>
              
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setPrinterTab('venta')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${printerTab === 'venta' ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  Ventas
                </button>
                <button 
                  onClick={() => setPrinterTab('servicio')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${printerTab === 'servicio' ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  Servicios
                </button>
              </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-8">
              {/* Common Printer Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Tipo de Impresión</label>
                  <select 
                    name={printerTab === 'venta' ? "printer_type" : "service_printer_type"} 
                    value={(printerTab === 'venta' ? settings.printer_type : settings.service_printer_type) || 'system'} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  >
                    <option value="system">Impresora del Sistema (Predeterminada)</option>
                    <option value="pos">Impresora POS Directa</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Nombre del Dispositivo</label>
                  <input 
                    name={printerTab === 'venta' ? "printer_name" : "service_printer_name"} 
                    value={(printerTab === 'venta' ? settings.printer_name : settings.service_printer_name) || ''} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Ej: EPSON TM-T20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Ancho del Papel (mm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name={printerTab === 'venta' ? "paper_width_mm" : "service_paper_width_mm"} 
                      value={(printerTab === 'venta' ? settings.paper_width_mm : settings.service_paper_width_mm) ?? ''} 
                      onChange={handleSettingsChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 dark:text-gray-500 text-sm">mm</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox" 
                    id="auto_print_toggle"
                    name={printerTab === 'venta' ? "auto_print" : "service_auto_print"} 
                    checked={!!(printerTab === 'venta' ? settings.auto_print : settings.service_auto_print)} 
                    onChange={(e) => setSettings((s) => ({ ...s, [printerTab === 'venta' ? "auto_print" : "service_auto_print"]: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 bg-white dark:bg-gray-800"
                  />
                  <label htmlFor="auto_print_toggle" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    Imprimir automáticamente al registrar {printerTab === 'venta' ? 'venta' : 'servicio'}
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <h4 className="text-gray-900 dark:text-white font-medium mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-purple-600 dark:text-purple-400" /> Diseño del Recibo ({printerTab === 'venta' ? 'Ventas' : 'Servicios'})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <input 
                      type="checkbox" 
                      id="show_logo_toggle"
                      checked={!!(printerTab === 'venta' ? printerOpts.show_logo : servicePrinterOpts.show_logo)} 
                      onChange={(e) => {
                        const val = e.target.checked;
                        if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, show_logo: val }));
                        else setServicePrinterOpts(p => ({ ...p, show_logo: val }));
                      }} 
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 bg-white dark:bg-gray-800"
                    />
                    <label htmlFor="show_logo_toggle" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer flex-1">
                      Incluir Logo en el Encabezado
                    </label>
                  </div>

                  {(printerTab === 'venta' ? printerOpts.show_logo : servicePrinterOpts.show_logo) && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Fuente del Logo</label>
                        <select 
                          value={printerTab === 'venta' ? printerOpts.logo_mode : servicePrinterOpts.logo_mode} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, logo_mode: val }));
                            else setServicePrinterOpts(p => ({ ...p, logo_mode: val }));
                          }} 
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none"
                        >
                          <option value="company">Usar Logo de la Empresa</option>
                          <option value="custom">URL Personalizada</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Ancho del Logo (mm)</label>
                         <input 
                           type="number" 
                           value={printerTab === 'venta' ? printerOpts.logo_width_mm : servicePrinterOpts.logo_width_mm} 
                           onChange={(e) => {
                             const val = e.target.value === '' ? 0 : Number(e.target.value);
                             if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, logo_width_mm: val }));
                             else setServicePrinterOpts(p => ({ ...p, logo_width_mm: val }));
                           }} 
                           className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none"
                         />
                      </div>

                      {(printerTab === 'venta' ? printerOpts.logo_mode : servicePrinterOpts.logo_mode) === 'custom' && (
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">URL de la Imagen</label>
                          <input 
                            value={printerTab === 'venta' ? printerOpts.logo_url : servicePrinterOpts.logo_url} 
                            onChange={(e) => {
                              const val = e.target.value;
                              if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, logo_url: val }));
                              else setServicePrinterOpts(p => ({ ...p, logo_url: val }));
                            }} 
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none"
                            placeholder="https://ejemplo.com/logo-ticket.png" 
                          />
                        </div>
                      )}

                      {/* Logo Preview */}
                      <div className="md:col-span-2 mt-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2 block">Vista Previa del Logo</label>
                        <div className="flex justify-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                          {(printerTab === 'venta' ? printerOpts.logo_mode : servicePrinterOpts.logo_mode) === 'company' ? (
                            settings.logo ? (
                               <img src={absUrl(settings.logo)} alt="Logo Preview" className="h-24 object-contain" />
                            ) : (
                               <div className="text-gray-500 dark:text-gray-500 text-sm italic">Sin logo de empresa configurado (ve a la pestaña Empresa)</div>
                            )
                          ) : (
                            (printerTab === 'venta' ? printerOpts.logo_url : servicePrinterOpts.logo_url) ? (
                               <img src={printerTab === 'venta' ? printerOpts.logo_url : servicePrinterOpts.logo_url} alt="Logo Preview" className="h-24 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            ) : (
                               <div className="text-gray-500 dark:text-gray-500 text-sm italic">Ingrese una URL válida</div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Encabezado Línea 1</label>
                    <input 
                      value={printerTab === 'venta' ? printerOpts.header1 : servicePrinterOpts.header1} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, header1: val }));
                        else setServicePrinterOpts(p => ({ ...p, header1: val }));
                      }} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none"
                      placeholder="Ej: Régimen Común" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Encabezado Línea 2</label>
                    <input 
                      value={printerTab === 'venta' ? printerOpts.header2 : servicePrinterOpts.header2} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, header2: val }));
                        else setServicePrinterOpts(p => ({ ...p, header2: val }));
                      }} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none"
                      placeholder="Ej: Resolución DIAN No..." 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Alineación de Texto</label>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                      {[
                        { val: 'left', icon: <Type size={16} /> },
                        { val: 'center', icon: <AlignCenter size={16} /> },
                        { val: 'right', icon: <Type size={16} /> }
                      ].map((opt, i) => {
                        const currentAlign = printerTab === 'venta' ? printerOpts.align : servicePrinterOpts.align;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => {
                              if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, align: opt.val }));
                              else setServicePrinterOpts(p => ({ ...p, align: opt.val }));
                            }}
                            className={`flex-1 flex justify-center items-center py-2 rounded-lg transition-all ${currentAlign === opt.val ? 'bg-purple-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            {opt.icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Tamaño Fuente (px)</label>
                    <input 
                      type="number" 
                      value={printerTab === 'venta' ? printerOpts.font_size : servicePrinterOpts.font_size} 
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, font_size: val }));
                        else setServicePrinterOpts(p => ({ ...p, font_size: val }));
                      }} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Pie de Página</label>
                    <textarea 
                      name={printerTab === 'venta' ? "receipt_footer" : "service_receipt_footer"} 
                      value={(printerTab === 'venta' ? settings.receipt_footer : settings.service_receipt_footer) || ''} 
                      onChange={handleSettingsChange} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none min-h-[80px] resize-none" 
                      placeholder="Gracias por su compra. Vuelva pronto." 
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      id="show_qr_toggle"
                      checked={!!(printerTab === 'venta' ? printerOpts.show_qr : servicePrinterOpts.show_qr)} 
                      onChange={(e) => {
                        const val = e.target.checked;
                        if (printerTab === 'venta') setPrinterOpts(p => ({ ...p, show_qr: val }));
                        else setServicePrinterOpts(p => ({ ...p, show_qr: val }));
                      }} 
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 bg-white dark:bg-gray-800"
                    />
                    <label htmlFor="show_qr_toggle" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                      <QrCode size={16} /> Incluir Código QR al final
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={() => {
                      setMsg(null);
                      if (printerTab === 'venta') {
                        setSettings((s) => ({
                          ...s,
                          printer_type: 'system',
                          printer_name: '',
                          paper_width_mm: 58,
                          auto_print: true,
                          receipt_footer: '',
                        }));
                        setPrinterOpts({
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
                      } else {
                        setSettings((s) => ({
                          ...s,
                          service_printer_type: 'system',
                          service_printer_name: '',
                          service_paper_width_mm: 58,
                          service_auto_print: true,
                          service_receipt_footer: '',
                        }));
                        setServicePrinterOpts({
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
                      }
                      setPreviewHtml(null);
                      setMsg({ type: 'success', text: `Configuración de ${printerTab} restablecida.` });
                    }} 
                    className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-white font-medium border border-gray-200 dark:border-gray-700 transition-colors text-sm"
                  >
                    Restablecer {printerTab === 'venta' ? 'Venta' : 'Servicio'}
                  </button>
                  <button 
                    type="button" 
                    onClick={previewPosSample} 
                    className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium border border-gray-200 dark:border-gray-700 transition-colors text-sm"
                  >
                    Vista Previa (Venta)
                  </button>
                  <button 
                    type="button" 
                    onClick={previewServiceSample} 
                    className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium border border-gray-200 dark:border-gray-700 transition-colors text-sm"
                  >
                    Vista Previa (Servicio)
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : 'Guardar Configuraciones'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Google / Email — Moved to Extensions */}
        {tab === 'google' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Correo Electrónico SMTP</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                La configuración de correo electrónico ahora es una extensión instalable. Ve a la sección de <strong className="text-gray-700 dark:text-gray-200">Extensiones</strong> en el menú de Configuración para instalar y configurar el módulo de correo.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl text-xs font-medium text-violet-700 dark:text-violet-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Configuración → Extensiones → Correo Electrónico SMTP</span>
            </div>
          </div>
        )}
      </div>

      {previewHtml && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${modalMaxWidth}`}>
             {/* Preview Header */}
             <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Vista Previa de Configuración</h3>
                <button onClick={() => setPreviewHtml(null)} className="text-gray-500 hover:text-gray-800">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Receipt Content - Iframe */}
             <div className="flex-1 overflow-hidden bg-gray-200 flex justify-center p-4">
                <div className="shadow-lg bg-white overflow-hidden" style={{ width: previewWidth, maxHeight: '100%', overflowY: 'auto' }}>
                  <iframe 
                    srcDoc={previewHtml} 
                    className="w-full h-full border-none bg-white"
                    title="Config Preview"
                    style={{ minHeight: iframeMinHeight }}
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
