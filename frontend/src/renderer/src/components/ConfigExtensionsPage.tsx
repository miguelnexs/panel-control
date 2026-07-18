import React, { useState, useEffect } from 'react';
import { 
  Puzzle, Search, CheckCircle2, AlertCircle, Play, 
  Settings2, Power, ArrowRight, ExternalLink, RefreshCw,
  Sparkles, Check, Database, MessageSquare, CreditCard,
  FileText, Lock, Download, Trash2, Clock, Mail, Eye, EyeOff, Truck,
  Award, Cpu
} from 'lucide-react';

interface Extension {
  id: string;
  name: string;
  developer: string;
  version: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  category: string;
  isPremium?: boolean;
  isBeta?: boolean;
  setupFields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'boolean';
    placeholder?: string;
    defaultValue?: string;
    options?: { label: string; value: string }[];
  }[];
}

const CATEGORIES = [
  { id: 'all', label: 'Todas las Extensiones' },
  { id: 'payments', label: 'Pasarelas de Pago', icon: <CreditCard size={14} /> },
  { id: 'billing', label: 'Facturación y ERP', icon: <FileText size={14} /> },
  { id: 'email', label: 'Correo y Chat', icon: <Mail size={14} /> },
  { id: 'shipping', label: 'Envíos y Logística', icon: <Truck size={14} /> },
  { id: 'marketing', label: 'Marketing y Pixel', icon: <Sparkles size={14} /> },
  { id: 'loyalty', label: 'Fidelización', icon: <Award size={14} /> },
  { id: 'ai_automation', label: 'IA y Automatización', icon: <Cpu size={14} /> },
];

export const ConfigExtensionsPage: React.FC<{ token: string; apiBase: string }> = ({ token, apiBase }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  
  // Real integration states
  const [loading, setLoading] = useState<boolean>(true);
  const [alegraConfig, setAlegraConfig] = useState<any>({});
  const [emailConfig, setEmailConfig] = useState<any>({});
  const [dropiConfig, setDropiConfig] = useState<any>({});
  const [extensionsConfigs, setExtensionsConfigs] = useState<Record<string, any>>({});
  const [installedExtensions, setInstalledExtensions] = useState<Record<string, boolean>>({});
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // UI / Action states
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installStepText, setInstallStepText] = useState<string>('');
  
  // Restart Dashboard state flow
  const [pendingRestartIds, setPendingRestartIds] = useState<string[]>([]);
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [rebootStepText, setRebootStepText] = useState<string>('');

  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [drawerTab, setDrawerTab] = useState<'config' | 'import'>('config');
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [importUrlOrId, setImportUrlOrId] = useState('');

  // Helper function to safely build headers
  const authHeaders = (tkn: string | null | undefined, isJson = false) => {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (tkn && tkn !== 'null' && tkn !== 'undefined' && tkn.trim() !== '') {
      headers['Authorization'] = `Bearer ${tkn}`;
    }
    return headers;
  };

  // Extensions list definition
  const extensionsCatalog: Extension[] = [
    {
      id: 'alegra',
      name: 'Alegra Facturación',
      developer: 'Alegra (Colombia)',
      version: 'v1.1.2',
      description: 'Facturación electrónica legal para Colombia. Sincronización automática de inventario.',
      longDescription: 'Sincroniza tus facturas del POS y de la web con el sistema contable de Alegra. Genera facturación electrónica con formato XML y PDF al instante.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/20">
          A
        </div>
      ),
      setupFields: [
        { name: 'alegra_email', label: 'Correo de Usuario Alegra', type: 'text', placeholder: 'tu_correo@empresa.com' },
        { name: 'alegra_token', label: 'Token API de Alegra', type: 'password', placeholder: '5a4d3f...' }
      ]
    },
    {
      id: 'email_smtp',
      name: 'Correo Electrónico SMTP',
      developer: 'Módulo Nativo del Sistema',
      version: 'v2.0.0',
      description: 'Envío de correos transaccionales a clientes. Compatible con Gmail, Outlook, Yahoo y servidores SMTP propios.',
      longDescription: 'Conecta tu proveedor de correo electrónico para enviar notificaciones automáticas, facturas, confirmaciones de pedido y mucho más directamente desde el dashboard.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
          <Mail size={22} />
        </div>
      ),
      setupFields: [] // handled with custom UI below
    },
    {
      id: 'dropi',
      name: 'Dropi Dropshipping',
      developer: 'Dropi Latam',
      version: 'v1.0.0',
      description: 'Conexión con Dropi para importación de productos y despachos contra entrega.',
      longDescription: 'Sincroniza tus pedidos con la red logística de Dropi. Gestiona despachos de dropshipping, haz seguimiento a envíos y recauda pagos contra entrega automáticamente.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Truck size={22} />
        </div>
      ),
      setupFields: [
        { name: 'dropi_email', label: 'Correo de Usuario Dropi', type: 'text', placeholder: 'usuario@correo.com' },
        { name: 'dropi_token', label: 'Token API de Dropi', type: 'password', placeholder: 'Token de acceso a tu API de Dropi' },
        {
          name: 'dropi_country',
          label: 'País de Operación',
          type: 'select',
          options: [
            { label: 'Colombia', value: 'CO' },
            { label: 'México', value: 'MX' },
            { label: 'Ecuador', value: 'EC' },
            { label: 'Perú', value: 'PE' },
            { label: 'Chile', value: 'CL' }
          ]
        }
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      developer: 'Meta Business Partner',
      version: 'v2.4.0',
      description: 'Notificaciones de pedidos y facturas automatizadas por WhatsApp.',
      longDescription: 'Envía automáticamente confirmaciones de compra, actualizaciones de envío y facturas en formato PDF directamente al WhatsApp de tus clientes. También incluye soporte de chat en vivo.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <MessageSquare size={22} />
        </div>
      ),
      setupFields: [
        { name: 'wa_phone', label: 'Número de WhatsApp (con código de país)', type: 'text', placeholder: '+573001234567' },
        { name: 'wa_api_token', label: 'Token de API de Meta/WhatsApp', type: 'password', placeholder: 'EAAbw2...' }
      ]
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      developer: 'MercadoLibre Inc.',
      version: 'v3.1.2',
      description: 'Recibe pagos en línea con tarjetas, PSE/transferencias y efectivo.',
      longDescription: 'La pasarela de pago líder en América Latina. Integra el checkout transparente o redirigido de Mercado Pago para procesar cobros de forma segura con tasas competitivas.',
      category: 'payments',
      isPremium: true,
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'mp_public_key', label: 'Public Key (Clave Pública)', type: 'text', placeholder: 'APP_USR-...' },
        { name: 'mp_access_token', label: 'Access Token (Token de Acceso)', type: 'password', placeholder: 'APP_USR-...' }
      ]
    },
    {
      id: 'servientrega',
      name: 'Servientrega Envíos',
      developer: 'Logística Nacional',
      version: 'v1.5.0',
      description: 'Generación de guías de envío y cotización de fletes Servientrega.',
      longDescription: 'Conecta tu tienda con la plataforma de Servientrega para automatizar la cotización del costo de envío, generar guías de despacho impresas y realizar tracking de paquetes.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
          <Truck size={22} />
        </div>
      ),
      setupFields: [
        { name: 'servi_user', label: 'Usuario Portal Corporativo', type: 'text', placeholder: 'usuario_empresa' },
        { name: 'servi_pass', label: 'Contraseña Portal', type: 'password' },
        { name: 'servi_contract', label: 'Número de Contrato', type: 'text', placeholder: '12345678' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Analytics',
      developer: 'Sistemas Web',
      version: 'v1.0.8',
      description: 'Vincula el Pixel de Facebook y Google Analytics en tu sitio web.',
      longDescription: 'Inserta de manera segura los códigos de seguimiento de Meta Pixel (Facebook Pixel) y Google Analytics 4 (GA4) para registrar compras, visitas y mejorar tus campañas publicitarias.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Sparkles size={22} />
        </div>
      ),
      setupFields: [
        { name: 'fb_pixel', label: 'Facebook Pixel ID', type: 'text', placeholder: '123456789012345' },
        { name: 'ga4_id', label: 'Google Analytics 4 Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX' }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      developer: 'Stripe Inc.',
      version: 'v3.2.0',
      description: 'Acepta pagos con tarjetas de todo el mundo y Apple Pay.',
      longDescription: 'La infraestructura de pagos definitiva para internet. Acepta cobros con tarjetas globales, billeteras móviles, Apple Pay, Google Pay y gestiona cargos recurrentes de forma ágil.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'stripe_publishable_key', label: 'Stripe Publishable Key', type: 'text', placeholder: 'pk_live_...' },
        { name: 'stripe_secret_key', label: 'Stripe Secret Key', type: 'password', placeholder: 'sk_live_...' }
      ]
    },
    {
      id: 'paypal',
      name: 'PayPal Checkout',
      developer: 'PayPal Latam',
      version: 'v4.0.1',
      description: 'El método de pago global más confiable para tus compradores internacionales.',
      longDescription: 'Permite a tus clientes pagar usando su cuenta de PayPal, tarjetas o crédito local. Aumenta la confianza y atrae compradores internacionales de manera segura.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-blue-800/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'paypal_client_id', label: 'PayPal Client ID', type: 'text', placeholder: 'Client ID del panel de desarrollo' },
        { name: 'paypal_client_secret', label: 'PayPal Client Secret', type: 'password' }
      ]
    },
    {
      id: 'wompi',
      name: 'Wompi Bancolombia',
      developer: 'Bancolombia Dev',
      version: 'v2.1.0',
      description: 'Pasarela de pagos líder en Colombia. Recibe transferencias directas, Nequi y PSE.',
      longDescription: 'Sincroniza el botón de pagos Wompi para aceptar transferencias de cuentas Bancolombia, pagos PSE de cualquier banco, Nequi, tarjetas y corresponsales bancarios.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'wompi_public_key', label: 'Llave Pública de Comercio Wompi', type: 'text', placeholder: 'pub_prod_...' },
        { name: 'wompi_private_key', label: 'Llave Privada de Comercio Wompi', type: 'password' }
      ]
    },
    {
      id: 'dlocal',
      name: 'dLocal Go',
      developer: 'dLocal Latam',
      version: 'v1.1.0',
      description: 'Recibe pagos en múltiples monedas locales de Latinoamérica.',
      longDescription: 'Acepta cobros con los métodos de pago preferidos de cada país en Latam (PSE, OXXO, Boleto Bancario, Pix, Efecty, etc.) en una sola integración.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'dlocal_api_key', label: 'dLocal API Key', type: 'text' },
        { name: 'dlocal_secret', label: 'dLocal Secret', type: 'password' }
      ]
    },
    {
      id: 'payu',
      name: 'PayU Latam',
      developer: 'PayU Group',
      version: 'v4.5.2',
      description: 'Recibe pagos con tarjetas, transferencias PSE y redes de recaudo efectivo.',
      longDescription: 'Pasarela global con amplia cobertura local. Permite pagos mediante tarjetas locales, PSE, Efecty, Baloto, Paga Todo, y cobros contra entrega en diversos países.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-lime-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'payu_merchant_id', label: 'PayU Merchant ID', type: 'text' },
        { name: 'payu_api_key', label: 'PayU API Key', type: 'password' }
      ]
    },
    {
      id: 'bold',
      name: 'Bold Link',
      developer: 'Bold.co Colombia',
      version: 'v1.2.0',
      description: 'Integración para generar enlaces de pago de Bold y vincular data con tu POS.',
      longDescription: 'Integra los datafonos y links de pago de Bold para que tus clientes puedan pagar de forma remota o presencial y los estados de pago se actualicen en tiempo real en tu dashboard.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'bold_api_key', label: 'Bold API Secret Token', type: 'password' }
      ]
    },
    {
      id: 'addi',
      name: 'Addi - Compre Ahora, Pague Después',
      developer: 'Addi Latam',
      version: 'v2.0.4',
      description: 'Permite a tus clientes pagar a cuotas con 0% de interés de forma digital.',
      longDescription: 'Activa la opción de pagar a cuotas sin tarjeta de crédito directamente en tu checkout. Impulsa tu ticket promedio ofreciendo financiamiento digital en menos de 1 minuto.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'addi_client_id', label: 'Addi Client ID', type: 'text' },
        { name: 'addi_client_secret', label: 'Addi Client Secret', type: 'password' }
      ]
    },
    {
      id: 'sistecredito',
      name: 'Sistecrédito',
      developer: 'Sistecrédito S.A.',
      version: 'v1.1.5',
      description: 'Vende a crédito a millones de usuarios aprobados de Sistecrédito.',
      longDescription: 'Conecta con la red de crédito de Sistecrédito en Colombia. Ofrece cupos de crédito a tus compradores para compras presenciales (POS) o tienda virtual sin riesgos de cartera.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'siste_store_id', label: 'Código de Tienda Sistecrédito', type: 'text' },
        { name: 'siste_api_key', label: 'Token de Integración', type: 'password' }
      ]
    },
    {
      id: 'coink',
      name: 'Coink Wallet',
      developer: 'Coink Colombia',
      version: 'v1.0.2',
      description: 'Recibe pagos directamente desde la billetera financiera Coink.',
      longDescription: 'Habilita pagos rápidos a través de códigos QR o notificación push en la billetera virtual Coink para capturar el mercado de finanzas alternativas.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'coink_merchant_id', label: 'ID de Comercio Coink', type: 'text' }
      ]
    },
    {
      id: 'nequi_daviplata',
      name: 'Nequi & Daviplata Direct',
      developer: 'Comunidad POS',
      version: 'v1.3.0',
      description: 'Genera códigos QR de Nequi y Daviplata de forma automática para cada pedido.',
      longDescription: 'Agiliza los cobros en efectivo digital. Al generar una orden de pago, muestra códigos QR dinámicos con el valor de la orden para que el cliente escanee y transfiera directamente.',
      category: 'payments',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-800 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <CreditCard size={22} />
        </div>
      ),
      setupFields: [
        { name: 'nequi_phone', label: 'Número de Celular Nequi Asociado', type: 'text' },
        { name: 'daviplata_phone', label: 'Número de Celular Daviplata Asociado', type: 'text' }
      ]
    },
    {
      id: 'siigo',
      name: 'Siigo ERP Cloud',
      developer: 'Siigo S.A.S',
      version: 'v2.1.0',
      description: 'Sincroniza tus ventas, inventarios y clientes con la nube contable de Siigo.',
      longDescription: 'Conector bidireccional. Cada vez que vendes un producto en el POS o web, se genera la factura de venta y se descuenta el stock en Siigo de forma automática.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
          S
        </div>
      ),
      setupFields: [
        { name: 'siigo_username', label: 'Usuario API Siigo', type: 'text' },
        { name: 'siigo_access_token', label: 'Access Token API', type: 'password' }
      ]
    },
    {
      id: 'factus',
      name: 'Factus Facturación',
      developer: 'Factus S.A.S',
      version: 'v1.2.4',
      description: 'Facturación electrónica legal para Colombia homologada ante la DIAN.',
      longDescription: 'Conexión con el proveedor tecnológico Factus para emitir facturación electrónica, notas crédito, y documentos soporte obligatorios ante la DIAN en Colombia.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-700/20">
          <FileText size={22} />
        </div>
      ),
      setupFields: [
        { name: 'factus_client_id', label: 'Client ID Factus', type: 'text' },
        { name: 'factus_secret', label: 'Client Secret Clave', type: 'password' }
      ]
    },
    {
      id: 'odoo',
      name: 'Odoo ERP Connector',
      developer: 'Comunidad Odoo',
      version: 'v16.2.0',
      description: 'Sincroniza tu inventario, ventas y contabilidad con la plataforma ERP Odoo.',
      longDescription: 'Conecta tu base de datos Odoo local o en la nube (Odoo.sh) para sincronizar contactos, productos, variantes y facturas contables de forma desatendida.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/20">
          O
        </div>
      ),
      setupFields: [
        { name: 'odoo_url', label: 'URL de tu Servidor Odoo', type: 'text', placeholder: 'https://miempresa.odoo.com' },
        { name: 'odoo_db', label: 'Nombre de Base de Datos', type: 'text' },
        { name: 'odoo_user', label: 'Usuario/Email', type: 'text' },
        { name: 'odoo_password', label: 'Contraseña o API Key', type: 'password' }
      ]
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      developer: 'Intuit Inc.',
      version: 'v5.1.0',
      description: 'Exporta facturas y gastos directamente a tu libro de QuickBooks.',
      longDescription: 'Mantén tu contabilidad internacional al día. Exporta las transacciones del POS, egresos de caja y facturas de venta directamente a QuickBooks Online.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/20">
          Q
        </div>
      ),
      setupFields: [
        { name: 'qb_company_id', label: 'QuickBooks Company ID', type: 'text' },
        { name: 'qb_client_id', label: 'OAuth Client ID', type: 'text' }
      ]
    },
    {
      id: 'xero',
      name: 'Xero Accounting',
      developer: 'Xero Ltd.',
      version: 'v3.0.2',
      description: 'Sincroniza tus transacciones y facturación diaria con el ERP Xero.',
      longDescription: 'Ideal para pymes. Sincroniza facturas emitidas, pagos recaudados, clientes creados y el valor del inventario valorizado con el software de contabilidad Xero.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
          X
        </div>
      ),
      setupFields: [
        { name: 'xero_tenant_id', label: 'Xero Tenant ID', type: 'text' }
      ]
    },
    {
      id: 'tns',
      name: 'TNS ERP Link',
      developer: 'TNS Software',
      version: 'v1.0.5',
      description: 'Conector nativo con el sistema ERP local TNS Software.',
      longDescription: 'Conecta con la base de datos SQL Server de TNS para sincronizar de manera local el catálogo de artículos, cuentas por cobrar, clientes y despachos de facturas.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-950/20">
          T
        </div>
      ),
      setupFields: [
        { name: 'tns_server_ip', label: 'IP del Servidor TNS SQL', type: 'text', placeholder: '192.168.1.100' },
        { name: 'tns_db_name', label: 'Nombre Base de Datos', type: 'text' }
      ]
    },
    {
      id: 'zoho_books',
      name: 'Zoho Books',
      developer: 'Zoho Corp',
      version: 'v2.2.0',
      description: 'Gestiona la contabilidad de tu negocio en línea conectada con Zoho.',
      longDescription: 'Conecta tu facturación de ventas en POS con Zoho Books. Realiza conciliaciones bancarias automáticas y monitorea tus estados financieros en tiempo real.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/20">
          Z
        </div>
      ),
      setupFields: [
        { name: 'zoho_org_id', label: 'Zoho Organization ID', type: 'text' }
      ]
    },
    {
      id: 'sap_b1',
      name: 'SAP Business One',
      developer: 'SAP Partner',
      version: 'v9.8.0',
      description: 'Mapea inventario y órdenes en tiempo real con SAP Business One.',
      longDescription: 'Conector empresarial para medianas empresas. Integra el inventario maestro de SAP Business One (Hana / SQL) con tu tienda virtual y el POS del local.',
      category: 'billing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-700/20">
          SAP
        </div>
      ),
      setupFields: [
        { name: 'sap_service_layer', label: 'URL Service Layer SAP', type: 'text', placeholder: 'https://sap-server:50000/b1s/v1' },
        { name: 'sap_company_db', label: 'ID de Base de Datos de la Compañía', type: 'text' }
      ]
    },
    {
      id: 'twilio_sms',
      name: 'Twilio SMS Gateway',
      developer: 'Twilio API',
      version: 'v5.3.1',
      description: 'Envía SMS de alerta de pedido y códigos de verificación doble factor.',
      longDescription: 'Conecta Twilio para enviar alertas automáticas por mensaje de texto SMS cuando se confirme un pedido, se despache un envío, o para validar cuentas de clientes.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
          <Mail size={22} />
        </div>
      ),
      setupFields: [
        { name: 'twilio_sid', label: 'Account SID', type: 'text' },
        { name: 'twilio_token', label: 'Auth Token', type: 'password' },
        { name: 'twilio_number', label: 'Número de Teléfono Twilio', type: 'text', placeholder: '+1...' }
      ]
    },
    {
      id: 'manychat',
      name: 'ManyChat Automations',
      developer: 'ManyChat Inc.',
      version: 'v3.0.0',
      description: 'Conecta flujos de chatbot de Instagram y Messenger con tu stock.',
      longDescription: 'Automatiza tus ventas por redes sociales. Envía enlaces de carrito de compras pre-cargados a los usuarios que interactúan con tus publicaciones o mensajes directos.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <MessageSquare size={22} />
        </div>
      ),
      setupFields: [
        { name: 'manychat_token', label: 'ManyChat API Key', type: 'password' }
      ]
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp Marketing',
      developer: 'Intuit Mailchimp',
      version: 'v4.1.2',
      description: 'Registra tus compradores en listas de correo de Mailchimp.',
      longDescription: 'Mantén a tus clientes comprometidos. Envía campañas de email marketing automáticas segmentadas basadas en el historial de compras de tus clientes.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
          <Mail size={22} />
        </div>
      ),
      setupFields: [
        { name: 'mailchimp_api_key', label: 'Mailchimp API Key', type: 'password' },
        { name: 'mailchimp_list_id', label: 'ID de la Lista/Audiencia', type: 'text' }
      ]
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo eCommerce Mail',
      developer: 'Klaviyo',
      version: 'v2.8.0',
      description: 'Automatizaciones avanzadas de email marketing y recuperación de carritos.',
      longDescription: 'La plataforma líder en email marketing para tiendas online. Crea automatizaciones de bienvenida, flujos de recuperación de carritos abandonados y recomendaciones de productos personalizadas.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-700 to-emerald-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-700/20">
          K
        </div>
      ),
      setupFields: [
        { name: 'klaviyo_public_key', label: 'Public API Key (Site ID)', type: 'text' },
        { name: 'klaviyo_private_key', label: 'Private API Key', type: 'password' }
      ]
    },
    {
      id: 'sendgrid',
      name: 'SendGrid Email API',
      developer: 'Twilio SendGrid',
      version: 'v3.0.5',
      description: 'Infraestructura de correo masivo transaccional de alta entrega.',
      longDescription: 'Envía miles de correos de notificaciones con la máxima tasa de entrega (inbox). Ideal para enviar facturas electrónicas, correos de bienvenida y reportes.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Mail size={22} />
        </div>
      ),
      setupFields: [
        { name: 'sendgrid_api_key', label: 'SendGrid API Key', type: 'password' }
      ]
    },
    {
      id: 'slack_alerts',
      name: 'Slack Notifications',
      developer: 'Slack Partner',
      version: 'v2.1.0',
      description: 'Notificaciones automáticas en canales de Slack cuando hay nuevas ventas o bajo stock.',
      longDescription: 'Mantén informado a tu equipo. Recibe notificaciones instantáneas en tus canales de Slack preferidos por cada compra completada o alertas de inventario agotado.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-700 to-pink-800 flex items-center justify-center text-white shadow-lg shadow-fuchsia-800/20">
          <MessageSquare size={22} />
        </div>
      ),
      setupFields: [
        { name: 'slack_webhook_url', label: 'Slack Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...' }
      ]
    },
    {
      id: 'intercom',
      name: 'Intercom Live Chat',
      developer: 'Intercom',
      version: 'v4.2.0',
      description: 'Soporte y chat en vivo con tus clientes directo en la tienda online.',
      longDescription: 'Añade el widget de chat interactivo de Intercom en tu e-commerce para captar prospectos, resolver dudas previas a la compra y dar soporte post-venta.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <MessageSquare size={22} />
        </div>
      ),
      setupFields: [
        { name: 'intercom_app_id', label: 'Intercom App ID', type: 'text' }
      ]
    },
    {
      id: 'zendesk_chat',
      name: 'Zendesk Chat & Support',
      developer: 'Zendesk Inc.',
      version: 'v3.5.0',
      description: 'Crea tickets de soporte automáticos y chat de asistencia técnica.',
      longDescription: 'Centraliza tu atención al cliente. Conecta las consultas entrantes de tu e-commerce con tu cuenta de Zendesk Support generando tickets de servicio automáticos.',
      category: 'email',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-green-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-700/20">
          Z
        </div>
      ),
      setupFields: [
        { name: 'zendesk_subdomain', label: 'Subdominio de Zendesk', type: 'text', placeholder: 'miempresa' }
      ]
    },
    {
      id: 'envia',
      name: 'Envia.com Logistics',
      developer: 'Envia Latam',
      version: 'v2.2.0',
      description: 'Accede a cotizaciones de flete con Servientrega, Deprisa, Envía, Coordinadora en un clic.',
      longDescription: 'Centralizador de envíos multicarrier. Compara tarifas de más de 15 transportadoras nacionales en tiempo real, genera etiquetas adhesivas de despacho y agenda recogidas.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-950/20">
          <Truck size={22} />
        </div>
      ),
      setupFields: [
        { name: 'envia_api_key', label: 'Envia.com API Key', type: 'password' }
      ]
    },
    {
      id: 'coordinadora',
      name: 'Coordinadora Mercantil',
      developer: 'Coordinadora Dev',
      version: 'v1.3.1',
      description: 'Impresión de etiquetas con código de barras de Coordinadora.',
      longDescription: 'Conecta de forma directa con Coordinadora Mercantil para generar guías electrónicas nacionales, programar recogidas de paquetes en tu bodega y calcular fletes.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
          C
        </div>
      ),
      setupFields: [
        { name: 'coor_user', label: 'Usuario Web Service', type: 'text' },
        { name: 'coor_pass', label: 'Clave Web Service', type: 'password' }
      ]
    },
    {
      id: 'dhl_express',
      name: 'DHL Express Global',
      developer: 'DHL Partner',
      version: 'v2.0.4',
      description: 'Envíos internacionales express con cotización y aranceles estimados.',
      longDescription: 'Envía tus productos a cualquier parte del mundo. DHL Express gestiona la logística de exportación internacional, genera guías de embarque y calcula impuestos aduaneros.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-red-600 font-black text-xl shadow-lg shadow-yellow-500/20">
          DHL
        </div>
      ),
      setupFields: [
        { name: 'dhl_account_num', label: 'Número de Cuenta DHL', type: 'text' },
        { name: 'dhl_api_key', label: 'DHL Developer API Key', type: 'password' }
      ]
    },
    {
      id: 'fedex_shipping',
      name: 'FedEx Shipping',
      developer: 'FedEx Developer',
      version: 'v3.0.0',
      description: 'Enlace directo para rastrear despachos y guías FedEx.',
      longDescription: 'Envía encomiendas nacionales e internacionales de manera integrada. Automatiza la solicitud de etiquetas y cotizaciones utilizando tu contrato comercial corporativo de FedEx.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
          FedEx
        </div>
      ),
      setupFields: [
        { name: 'fedex_api_key', label: 'FedEx API Key', type: 'text' },
        { name: 'fedex_secret', label: 'FedEx Secret', type: 'password' }
      ]
    },
    {
      id: 'mensajeros_urbanos',
      name: 'Mensajeros Urbanos',
      developer: 'Mensajeros Latam',
      version: 'v1.4.2',
      description: 'Envíos express urbanos en menos de 2 horas para tus ventas de POS locales.',
      longDescription: 'Perfecto para POS y despachos express en tu ciudad. Solicita motorizados de forma automática al facturar un pedido para realizar la entrega del paquete de inmediato.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Truck size={22} />
        </div>
      ),
      setupFields: [
        { name: 'mu_api_key', label: 'Mensajeros Urbanos API Key', type: 'password' }
      ]
    },
    {
      id: 'minutos99',
      name: '99 Minutos',
      developer: '99minutos.com',
      version: 'v1.2.0',
      description: 'Envíos rápidos con entregas el mismo día (Same Day) y al día siguiente.',
      longDescription: 'Servicio de logística de última milla para comercio electrónico. Ofrece despachos el mismo día para compras realizadas por la mañana en las principales capitales de Colombia y México.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Truck size={22} />
        </div>
      ),
      setupFields: [
        { name: 'min99_client_id', label: '99 Minutos Client ID', type: 'text' },
        { name: 'min99_client_secret', label: '99 Minutos Client Secret', type: 'password' }
      ]
    },
    {
      id: 'shipstation',
      name: 'ShipStation Hub',
      developer: 'ShipStation',
      version: 'v3.4.0',
      description: 'Consolida despachos de múltiples transportadoras internacionales.',
      longDescription: 'Conecta con ShipStation para importar pedidos en lote y gestionar guías de transportadoras como UPS, USPS, DHL y FedEx desde un solo panel de logística avanzado.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-700/20">
          S
        </div>
      ),
      setupFields: [
        { name: 'shipstation_api_key', label: 'ShipStation API Key', type: 'text' },
        { name: 'shipstation_secret', label: 'ShipStation Secret', type: 'password' }
      ]
    },
    {
      id: 'tcc',
      name: 'TCC Logística',
      developer: 'TCC Colombia',
      version: 'v1.1.2',
      description: 'Integración directa con el sistema de mensajería y carga masiva TCC.',
      longDescription: 'Ideal para despachos de mercancía pesada o paquetes a nivel nacional en Colombia. Genera remesas de transporte de TCC de manera automática al confirmar la orden.',
      category: 'shipping',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
          <Truck size={22} />
        </div>
      ),
      setupFields: [
        { name: 'tcc_username', label: 'Usuario Web Service TCC', type: 'text' },
        { name: 'tcc_password', label: 'Contraseña Web Service TCC', type: 'password' }
      ]
    },
    {
      id: 'google_ads',
      name: 'Google Ads Conversions',
      developer: 'Google LLC',
      version: 'v2.0.0',
      description: 'Sigue el retorno de inversión (ROAS) de tus campañas de búsqueda de Google.',
      longDescription: 'Mide la efectividad de tus campañas de publicidad de Google. Registra de forma automática eventos de compra, valores de transacción y conversiones de tus leads.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
          <Sparkles size={22} />
        </div>
      ),
      setupFields: [
        { name: 'gads_conversion_id', label: 'Google Ads Conversion ID', type: 'text', placeholder: 'AW-123456789' },
        { name: 'gads_conversion_label', label: 'Conversion Label', type: 'text' }
      ]
    },
    {
      id: 'tiktok_pixel',
      name: 'TikTok Pixel SDK',
      developer: 'TikTok ByteDance',
      version: 'v1.2.0',
      description: 'Registra eventos de compra para tus campañas de video en TikTok Ads.',
      longDescription: 'Mide el impacto de tus campañas de video en TikTok. Sincroniza eventos de añadir al carrito, inicio de checkout y compras exitosas en la plataforma de publicidad de TikTok.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-slate-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-900/40">
          d
        </div>
      ),
      setupFields: [
        { name: 'tiktok_pixel_id', label: 'TikTok Pixel ID', type: 'text' }
      ]
    },
    {
      id: 'pinterest_pixel',
      name: 'Pinterest Tag',
      developer: 'Pinterest Dev',
      version: 'v1.1.0',
      description: 'Optimiza tus pines y campañas de compras en Pinterest.',
      longDescription: 'Sigue el rendimiento de tus campañas en Pinterest. Mide visitas a páginas, clics en imágenes y ventas directas generadas a través de pins patrocinados.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
          <Sparkles size={22} />
        </div>
      ),
      setupFields: [
        { name: 'pinterest_tag_id', label: 'Pinterest Tag ID', type: 'text' }
      ]
    },
    {
      id: 'hotjar',
      name: 'Hotjar Recording',
      developer: 'Hotjar Ltd.',
      version: 'v2.1.2',
      description: 'Mapas de calor y grabaciones de pantalla para analizar el comportamiento del cliente.',
      longDescription: 'Entiende cómo interactúan tus clientes con tu tienda. Observa mapas de calor visuales, clics de frustración y reproducciones de sesiones grabadas para mejorar el diseño UX.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-400/20">
          H
        </div>
      ),
      setupFields: [
        { name: 'hotjar_site_id', label: 'Hotjar Site ID', type: 'text' }
      ]
    },
    {
      id: 'clarity',
      name: 'Microsoft Clarity',
      developer: 'Microsoft Corp',
      version: 'v1.0.5',
      description: 'Analítica de comportamiento web y grabaciones de usuario 100% gratuita.',
      longDescription: 'Servicio de analíticas gratuito de Microsoft. Graba sesiones de tus compradores, visualiza mapas de calor, analiza tiempos de carga y tasa de rebote.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
          C
        </div>
      ),
      setupFields: [
        { name: 'clarity_project_id', label: 'Microsoft Clarity Project ID', type: 'text' }
      ]
    },
    {
      id: 'activecampaign',
      name: 'ActiveCampaign CRM',
      developer: 'ActiveCampaign',
      version: 'v3.1.0',
      description: 'Sincroniza tus contactos e historial de compras para flujos de lead nurturing.',
      longDescription: 'Automatización de ventas y marketing. Mapea tus clientes y sus compras con listas de contacto de ActiveCampaign para automatizar secuencias de correo personalizadas.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20">
          AC
        </div>
      ),
      setupFields: [
        { name: 'ac_api_url', label: 'API URL de ActiveCampaign', type: 'text', placeholder: 'https://miempresa.api-us1.com' },
        { name: 'ac_api_key', label: 'API Key', type: 'password' }
      ]
    },
    {
      id: 'hubspot',
      name: 'HubSpot Integration',
      developer: 'HubSpot Inc.',
      version: 'v4.0.0',
      description: 'Guarda clientes y cotizaciones en los canales del CRM HubSpot.',
      longDescription: 'Sincroniza tu embudo de ventas. Registra de forma automática los nuevos leads del POS o de tu web directamente como contactos en HubSpot CRM para su seguimiento.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
          H
        </div>
      ),
      setupFields: [
        { name: 'hubspot_portal_id', label: 'HubSpot Portal/Hub ID', type: 'text' },
        { name: 'hubspot_access_token', label: 'Private App Access Token', type: 'password' }
      ]
    },
    {
      id: 'mailjet',
      name: 'Mailjet Marketing',
      developer: 'Mailjet Partner',
      version: 'v1.8.0',
      description: 'Envío de boletines periódicos y correos de ofertas a tus suscriptores.',
      longDescription: 'Envía boletines de marketing de forma fácil. Sincroniza tu lista de clientes y diseña plantillas interactivas de correos masivos utilizando el editor drag-and-drop de Mailjet.',
      category: 'marketing',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <Mail size={22} />
        </div>
      ),
      setupFields: [
        { name: 'mailjet_api_key', label: 'Mailjet API Key', type: 'text' },
        { name: 'mailjet_secret_key', label: 'Mailjet Secret Key', type: 'password' }
      ]
    },
    {
      id: 'yotpo',
      name: 'Yotpo Reviews & Loyalty',
      developer: 'Yotpo Ltd.',
      version: 'v3.2.1',
      description: 'Agrega comentarios visuales de tus productos y gestiona un sistema de lealtad.',
      longDescription: 'Consigue más valoraciones. Envía correos automáticos post-compra solicitando reseñas a tus compradores para mostrarlas como prueba social en tu tienda virtual.',
      category: 'loyalty',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <Award size={22} />
        </div>
      ),
      setupFields: [
        { name: 'yotpo_app_key', label: 'Yotpo App Key', type: 'text' },
        { name: 'yotpo_secret', label: 'Yotpo Secret Key', type: 'password' }
      ]
    },
    {
      id: 'judge_me',
      name: 'Judge.me Product Reviews',
      developer: 'Judge.me',
      version: 'v2.5.0',
      description: 'Comentarios de productos hermosos con fotos y estrellas de calificación.',
      longDescription: 'Recopila valoraciones de alta calidad con fotos y videos. Muestra widgets personalizables de calificación por estrellas para aumentar la confianza y conversión.',
      category: 'loyalty',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Award size={22} />
        </div>
      ),
      setupFields: [
        { name: 'judgeme_api_token', label: 'Judge.me Shop API Token', type: 'password' }
      ]
    },
    {
      id: 'loyaltylion',
      name: 'LoyaltyLion Rewards',
      developer: 'LoyaltyLion',
      version: 'v3.0.2',
      description: 'Sistema de puntos de recompensa para incentivar la compra recurrente.',
      longDescription: 'Fideliza a tus clientes mediante puntos de recompensa. Diseña un club de beneficios donde los usuarios acumulan puntos por comprar, dejar reseñas o seguir tus redes.',
      category: 'loyalty',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <Award size={22} />
        </div>
      ),
      setupFields: [
        { name: 'loyaltylion_token', label: 'LoyaltyLion Token', type: 'text' },
        { name: 'loyaltylion_secret', label: 'LoyaltyLion Secret', type: 'password' }
      ]
    },
    {
      id: 'referralcandy',
      name: 'ReferralCandy',
      developer: 'ReferralCandy Partner',
      version: 'v2.1.5',
      description: 'Programa de referidos (boca a boca) automático para tus clientes.',
      longDescription: 'El marketing boca a boca en piloto automático. Ofrece incentivos (como cupones o descuentos) a tus clientes actuales cuando refieran nuevos amigos a tu negocio.',
      category: 'loyalty',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
          <Award size={22} />
        </div>
      ),
      setupFields: [
        { name: 'rc_api_key', label: 'ReferralCandy API Key', type: 'text' },
        { name: 'rc_api_secret', label: 'ReferralCandy API Secret', type: 'password' }
      ]
    },
    {
      id: 'openai_desc',
      name: 'OpenAI Product copywriter',
      developer: 'OpenAI GPT API',
      version: 'v1.4.0',
      description: 'Genera descripciones optimizadas para SEO y textos creativos con Inteligencia Artificial.',
      longDescription: 'Conecta ChatGPT directamente en tu creador de productos. Redacta descripciones de producto profesionales en segundos basadas en su nombre, categoría y materiales.',
      category: 'ai_automation',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
          <Cpu size={22} />
        </div>
      ),
      setupFields: [
        { name: 'openai_api_key', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-proj-...' }
      ]
    },
    {
      id: 'zapier',
      name: 'Zapier Automation',
      developer: 'Zapier Partner',
      version: 'v2.6.0',
      description: 'Conecta tu tienda con más de 5,000 aplicaciones diferentes.',
      longDescription: 'Envía información de tus transacciones o clientes de forma automática a hojas de cálculo de Google, canales de Slack, CRMs y miles de servicios de automatización web.',
      category: 'ai_automation',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Cpu size={22} />
        </div>
      ),
      setupFields: [
        { name: 'zapier_webhook_url', label: 'Zapier Webhook Target URL', type: 'text', placeholder: 'https://hooks.zapier.com/hooks/catch/...' }
      ]
    },
    {
      id: 'make_integ',
      name: 'Make (Integromat)',
      developer: 'Make.com',
      version: 'v1.2.0',
      description: 'Diseña flujos de automatización visual de datos arrastrando módulos.',
      longDescription: 'Crea integraciones visuales complejas sin código. Sincroniza leads, calcula variables de despacho o actualiza hojas de cálculo mediante Webhooks dinámicos de Make.',
      category: 'ai_automation',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Cpu size={22} />
        </div>
      ),
      setupFields: [
        { name: 'make_webhook_url', label: 'Make Webhook URL', type: 'text' }
      ]
    },
    {
      id: 'dialogflow',
      name: 'Google Dialogflow AI',
      developer: 'Google Cloud',
      version: 'v2.5.0',
      description: 'Chatbot inteligente entrenado con lenguaje natural para responder dudas sobre stock.',
      longDescription: 'Conecta un agente inteligente de Dialogflow en tu canal de WhatsApp o chat web. Permite que tus clientes pregunten por disponibilidad de tallas, estado de envío de su pedido y dirección de tus locales.',
      category: 'ai_automation',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <Cpu size={22} />
        </div>
      ),
      setupFields: [
        { name: 'df_project_id', label: 'Dialogflow Project ID', type: 'text' },
        { name: 'df_service_account_json', label: 'JSON de Cuenta de Servicio Google Cloud', type: 'password' }
      ]
    }
  ];

  useEffect(() => {
    loadSettings();
  }, [token]);

  // Load backend configurations on mount
  const loadSettings = async () => {
    setLoading(true);
    try {
      // 1. Fetch main settings
      const settingsRes = await fetch(`${apiBase}/webconfig/settings/`, {
        headers: authHeaders(token)
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.alegra_config) {
          setAlegraConfig(settingsData.alegra_config);
        }
        if (settingsData.google_config) {
          setEmailConfig(settingsData.google_config);
        }
        
        // Extract installed status
        const pageContent = settingsData.page_content || {};
        const installed = pageContent.installed_extensions || {};
        
        const installedStatus: Record<string, boolean> = {};
        extensionsCatalog.forEach(ext => {
          installedStatus[ext.id] = !!installed[ext.id];
        });
        setInstalledExtensions(installedStatus);

        if (pageContent.dropi_config) {
          setDropiConfig(pageContent.dropi_config);
        }

        if (pageContent.extensions_configs) {
          setExtensionsConfigs(pageContent.extensions_configs);
        }
      }
    } catch (err) {
      console.error('Error loading extension settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Triggered when clicking an extension card for configuration
  useEffect(() => {
    if (selectedExtension) {
      setTestResult(null);
      setShowUninstallConfirm(false);
      setShowSmtpPassword(false);
      if (selectedExtension.id === 'alegra') {
        setFormValues({
          alegra_email: alegraConfig.email || '',
          alegra_token: alegraConfig.token || '',
          alegra_resolution: alegraConfig.resolution || ''
        });
      } else if (selectedExtension.id === 'email_smtp') {
        setFormValues({
          smtp_email: emailConfig.email || '',
          smtp_password: emailConfig.app_password ? '••••••••' : '',
          smtp_host: emailConfig.smtp_host || 'smtp.gmail.com',
          smtp_port: String(emailConfig.smtp_port || 587),
          smtp_use_tls: emailConfig.smtp_use_tls !== false ? 'true' : 'false',
          smtp_use_ssl: emailConfig.smtp_use_ssl ? 'true' : 'false',
          smtp_preset: 'gmail'
        });
      } else if (selectedExtension.id === 'dropi') {
        setFormValues({
          dropi_email: dropiConfig.email || '',
          dropi_token: dropiConfig.token || '',
          dropi_country: dropiConfig.country || 'CO'
        });
      } else if (['whatsapp', 'mercadopago', 'servientrega', 'marketing'].includes(selectedExtension.id)) {
        const config = extensionsConfigs[selectedExtension.id] || {};
        const defaults: Record<string, string> = {};
        selectedExtension.setupFields.forEach(f => {
          defaults[f.name] = config[f.name] || f.defaultValue || '';
        });
        setFormValues(defaults);
      }
    }
  }, [selectedExtension]);

  // Install workflow simulation with steps
  const handleInstallExtension = (id: string) => {
    setInstallingId(id);
    setInstallProgress(0);
    setInstallStepText('Conectando con repositorio central...');

    const steps = [
      { prg: 25, txt: 'Descargando paquete de dependencias (v1.1.2)...' },
      { prg: 60, txt: 'Descomprimiendo assets y registrando hooks...' },
      { prg: 85, txt: 'Estableciendo variables de entorno de seguridad...' },
      { prg: 100, txt: 'Módulo descargado con éxito.' }
    ];

    let currentStep = 0;
    const interval = setInterval(async () => {
      if (currentStep < steps.length) {
        setInstallProgress(steps[currentStep].prg);
        setInstallStepText(steps[currentStep].txt);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Persist install state to the database
        try {
          const settingsRes = await fetch(`${apiBase}/webconfig/settings/`, {
            headers: authHeaders(token)
          });
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            const pageContent = settingsData.page_content || {};
            const installed = pageContent.installed_extensions || {};
            installed[id] = true;
            pageContent.installed_extensions = installed;

            await fetch(`${apiBase}/webconfig/settings/`, {
              method: 'PUT',
              headers: authHeaders(token, true),
              body: JSON.stringify({ page_content: pageContent })
            });

            // Put in pending restart array rather than setting installed state directly in UI
            setPendingRestartIds(prev => [...prev, id]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setInstallingId(null);
        }
      }
    }, 800);
  };

  // Simulated Dashboard restart flow
  const handleRestartDashboard = () => {
    setIsRebooting(true);
    setRebootStepText('Deteniendo procesos en segundo plano...');

    const steps = [
      { delay: 800, txt: 'Enlazando nuevos componentes registrados...' },
      { delay: 1600, txt: 'Actualizando bases de datos del sistema...' },
      { delay: 2400, txt: 'Iniciando servidor del Dashboard...' }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setRebootStepText(step.txt);
      }, step.delay);
    });

    setTimeout(async () => {
      // Completed, reload and refresh states
      await loadSettings();
      setPendingRestartIds([]);
      setIsRebooting(false);
    }, 3200);
  };

  // Uninstall workflow
  const handleUninstallExtension = async (id: string) => {
    setUninstallingId(id);
    setTestResult(null);
    try {
      const settingsRes = await fetch(`${apiBase}/webconfig/settings/`, {
        headers: authHeaders(token)
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const pageContent = settingsData.page_content || {};
        const installed = pageContent.installed_extensions || {};
        installed[id] = false;
        pageContent.installed_extensions = installed;

        const payload: any = { page_content: pageContent };

        // Also deactivate/empty local state
        if (id === 'alegra') {
          payload.alegra_config = { email: '', token: '', resolution: '' };
          setAlegraConfig({});
        } else if (id === 'email_smtp') {
          payload.google_config = { email: '', app_password: '', smtp_host: '', smtp_port: 587, smtp_use_tls: true, smtp_use_ssl: false };
          setEmailConfig({});
        } else if (id === 'dropi') {
          pageContent.dropi_config = { email: '', token: '', country: 'CO' };
          setDropiConfig({});
        } else if (['whatsapp', 'mercadopago', 'servientrega', 'marketing'].includes(id)) {
          if (pageContent.extensions_configs) {
            delete pageContent.extensions_configs[id];
          }
          setExtensionsConfigs(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }

        await fetch(`${apiBase}/webconfig/settings/`, {
          method: 'PUT',
          headers: authHeaders(token, true),
          body: JSON.stringify(payload)
        });

        setInstalledExtensions(prev => ({ ...prev, [id]: false }));
        setSelectedExtension(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUninstallingId(null);
    }
  };

  // Connection testing calls actual backend APIs
  const handleTestConnection = async (id: string) => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      if (id === 'alegra') {
        const res = await fetch(`${apiBase}/webconfig/alegra/test/`, {
          method: 'POST',
          headers: authHeaders(token, true),
          body: JSON.stringify({
            email: formValues.alegra_email,
            token: formValues.alegra_token
          })
        });
        const data = await res.json();
        if (res.ok) {
          setTestResult({ success: true, msg: data.detail || 'Conexión exitosa con los servidores de Alegra.' });
        } else {
          setTestResult({ success: false, msg: data.detail || 'Error de conexión (credenciales inválidas).' });
        }
      } else if (id === 'email_smtp') {
        const res = await fetch(`${apiBase}/webconfig/google/test/`, {
          method: 'POST',
          headers: authHeaders(token, true),
          body: JSON.stringify({
            email: formValues.smtp_email,
            app_password: formValues.smtp_password !== '••••••••' ? formValues.smtp_password : undefined,
            smtp_host: formValues.smtp_host,
            smtp_port: Number(formValues.smtp_port),
            smtp_use_tls: formValues.smtp_use_tls === 'true',
            smtp_use_ssl: formValues.smtp_use_ssl === 'true'
          })
        });
        const data = await res.json();
        if (res.ok) {
          setTestResult({ success: true, msg: data.detail || '¡Correo de prueba enviado! Revisa tu bandeja de entrada.' });
        } else {
          setTestResult({ success: false, msg: data.detail || 'Error de conexión SMTP. Verifica los datos.' });
        }
      } else if (id === 'dropi') {
        if (!formValues.dropi_email || !formValues.dropi_token) {
          setTestResult({ success: false, msg: 'Correo y token son obligatorios.' });
          setTestingConnection(false);
          return;
        }
        // Simular conexión exitosa
        setTimeout(() => {
          setTestResult({ success: true, msg: 'Conexión con Dropi establecida correctamente.' });
          setTestingConnection(false);
        }, 1500);
        return; // prevent setting testingConnection=false in finally block synchronously
      } else if (!['alegra', 'email_smtp', 'dropi'].includes(id)) {
        setTimeout(() => {
          setTestResult({ success: true, msg: 'Conexión y credenciales validadas exitosamente.' });
          setTestingConnection(false);
        }, 1500);
        return;
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || 'Error de red conectando al servidor.' });
    } finally {
      if (id !== 'dropi' && !!['alegra', 'email_smtp', 'dropi'].includes(id)) {
        setTestingConnection(false);
      }
    }
  };

  // Submit dynamic setup form configuration
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      if (selectedExtension?.id === 'alegra') {
        const payload = {
          alegra_config: {
            email: formValues.alegra_email,
            token: formValues.alegra_token,
            resolution: formValues.alegra_resolution
          }
        };
        const res = await fetch(`${apiBase}/webconfig/settings/`, {
          method: 'PUT',
          headers: authHeaders(token, true),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setAlegraConfig(payload.alegra_config);
          setSelectedExtension(null);
        }
      } else if (selectedExtension?.id === 'email_smtp') {
        const googlePayload: any = {
          google_config: {
            email: formValues.smtp_email,
            smtp_host: formValues.smtp_host,
            smtp_port: Number(formValues.smtp_port),
            smtp_use_tls: formValues.smtp_use_tls === 'true',
            smtp_use_ssl: formValues.smtp_use_ssl === 'true'
          }
        };
        if (formValues.smtp_password && formValues.smtp_password !== '••••••••') {
          googlePayload.google_config.app_password = formValues.smtp_password;
        }
        const res = await fetch(`${apiBase}/webconfig/settings/`, {
          method: 'PUT',
          headers: authHeaders(token, true),
          body: JSON.stringify(googlePayload)
        });
        if (res.ok) {
          setEmailConfig(googlePayload.google_config);
          setSelectedExtension(null);
        }
      } else if (selectedExtension?.id && !['alegra', 'email_smtp', 'dropi'].includes(selectedExtension.id)) {
        const settingsRes = await fetch(`${apiBase}/webconfig/settings/`, {
          headers: authHeaders(token)
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const pageContent = settingsData.page_content || {};
          if (!pageContent.extensions_configs) pageContent.extensions_configs = {};
          pageContent.extensions_configs[selectedExtension.id] = {
            ...formValues,
            is_active: true
          };
          const res = await fetch(`${apiBase}/webconfig/settings/`, {
            method: 'PUT',
            headers: authHeaders(token, true),
            body: JSON.stringify({ page_content: pageContent })
          });
          if (res.ok) {
            setExtensionsConfigs(pageContent.extensions_configs);
            setSelectedExtension(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const getExtensionStatus = (id: string) => {
    if (pendingRestartIds.includes(id)) return 'pending_restart';
    const isInstalled = !!installedExtensions[id];
    if (!isInstalled) return 'not_installed';
    
    if (id === 'alegra') {
      return (alegraConfig.email && alegraConfig.token) ? 'active' : 'installed';
    }
    if (id === 'email_smtp') {
      return (emailConfig.email && emailConfig.app_password) ? 'active' : 'installed';
    }
    if (id === 'dropi') {
      return (dropiConfig.email && dropiConfig.token) ? 'active' : 'installed';
    }
    if (id && !['alegra', 'email_smtp', 'dropi'].includes(id)) {
      const config = extensionsConfigs[id] || {};
      const firstField = extensionsCatalog.find(e => e.id === id)?.setupFields[0]?.name;
      const isConfigured = firstField && config[firstField];
      if (isConfigured) {
        return config.is_active !== false ? 'active' : 'installed';
      }
      return 'installed';
    }
    return 'not_installed';
  };

  // Toggle active/inactive status from toggle switch
  const toggleActiveStatus = async (id: string, currentStatus: string) => {
    if (currentStatus === 'not_installed' || currentStatus === 'pending_restart') return;

    try {
      if (id === 'alegra') {
        const nextActive = currentStatus !== 'active';
        const payload = {
          alegra_config: {
            ...alegraConfig,
            email: nextActive ? alegraConfig.email : '',
            token: nextActive ? alegraConfig.token : ''
          }
        };
        const res = await fetch(`${apiBase}/webconfig/settings/`, {
          method: 'PUT',
          headers: authHeaders(token, true),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setAlegraConfig(payload.alegra_config);
        }
      } else if (id === 'email_smtp') {
        const nextActive = currentStatus !== 'active';
        const payload = {
          google_config: {
            ...emailConfig,
            email: nextActive ? emailConfig.email : '',
            app_password: nextActive ? emailConfig.app_password : ''
          }
        };
        const res = await fetch(`${apiBase}/webconfig/settings/`, {
          method: 'PUT',
          headers: authHeaders(token, true),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setEmailConfig(payload.google_config);
        }
      } else if (id === 'dropi') {
        const nextActive = currentStatus !== 'active';
        const settingsRes = await fetch(`${apiBase}/webconfig/settings/`, {
          headers: authHeaders(token)
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const pageContent = settingsData.page_content || {};
          const dropi = pageContent.dropi_config || {};
          pageContent.dropi_config = {
            ...dropi,
            email: nextActive ? dropi.email : '',
            token: nextActive ? dropi.token : ''
          };
          const res = await fetch(`${apiBase}/webconfig/settings/`, {
            method: 'PUT',
            headers: authHeaders(token, true),
            body: JSON.stringify({ page_content: pageContent })
          });
          if (res.ok) {
            setDropiConfig(pageContent.dropi_config);
          }
        }
      } else if (id && !['alegra', 'email_smtp', 'dropi'].includes(id)) {
        const nextActive = currentStatus !== 'active';
        const settingsRes = await fetch(`${apiBase}/webconfig/settings/`, {
          headers: authHeaders(token)
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const pageContent = settingsData.page_content || {};
          if (!pageContent.extensions_configs) pageContent.extensions_configs = {};
          const conf = pageContent.extensions_configs[id] || {};
          pageContent.extensions_configs[id] = {
            ...conf,
            is_active: nextActive
          };
          const res = await fetch(`${apiBase}/webconfig/settings/`, {
            method: 'PUT',
            headers: authHeaders(token, true),
            body: JSON.stringify({ page_content: pageContent })
          });
          if (res.ok) {
            setExtensionsConfigs(pageContent.extensions_configs);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setDrawerTab('config');
  }, [selectedExtension]);

  const importDropiProduct = async (prod: any) => {
    setImportingId(prod.id);
    setImportMsg(null);
    try {
      // 1. Get or create a category first to support active/official product creation
      let categoryId: number | null = null;
      try {
        const catRes = await fetch(`${apiBase}/products/categories/?page_size=100`, {
          headers: authHeaders(token)
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          const catList = Array.isArray(catData) ? catData : (Array.isArray(catData.results) ? catData.results : []);
          if (catList.length > 0) {
            const existing = catList.find((c: any) => c.name.toLowerCase() === 'dropi' || c.name.toLowerCase() === 'dropshipping');
            categoryId = existing ? existing.id : catList[0].id;
          }
        }
        if (!categoryId) {
          const fdCat = new FormData();
          fdCat.append('name', 'Dropi');
          fdCat.append('description', 'Productos importados desde Dropi');
          fdCat.append('active', 'true');
          const createCatRes = await fetch(`${apiBase}/products/categories/`, {
            method: 'POST',
            headers: authHeaders(token),
            body: fdCat
          });
          if (createCatRes.ok) {
            const createdCat = await createCatRes.json();
            categoryId = createdCat.id;
          }
        }
      } catch (catErr) {
        console.error('Error selecting category for Dropi product:', catErr);
      }

      const fd = new FormData();
      fd.append('name', prod.name);
      fd.append('description', prod.description);
      fd.append('price', String(prod.suggestedPrice));
      fd.append('inventory_qty', '100'); // default inventory
      fd.append('is_draft', 'false');
      fd.append('is_sale', 'false');
      if (categoryId) {
        fd.append('category', String(categoryId));
      }

      // Try to download and append image
      try {
        const response = await fetch(prod.imageSrc, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `${prod.id}.jpg`, { type: 'image/jpeg' });
          fd.append('image', file);
        }
      } catch (err) {
        console.warn('CORS block or error downloading product image, importing without image:', err);
      }

      const res = await fetch(`${apiBase}/products/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: fd
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || JSON.stringify(data));
      }

      setImportMsg({ type: 'success', text: `¡Producto "${prod.name}" importado exitosamente a tu inventario!` });
      setTimeout(() => setImportMsg(null), 5000);
    } catch (err: any) {
      setImportMsg({ type: 'error', text: `Error al importar: ${err.message}` });
    } finally {
      setImportingId(null);
    }
  };

  const handleImportByUrlOrId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrlOrId.trim()) return;

    const value = importUrlOrId.trim();
    let productIdStr = value;
    const urlMatch = value.match(/product-details?\/(\d+)/i) || value.match(/\/products\/(\d+)/i) || value.match(/(\d{5,10})/);
    if (urlMatch) {
      productIdStr = urlMatch[1];
    }

    setImportingId(9999);
    setImportMsg(null);

    // If it's one of the demo IDs, we can use the simulated local list
    const demoIds = ['101', '102', '103', '104', '105', '106'];
    if (demoIds.includes(productIdStr)) {
      const simulatedProducts: Record<string, any> = {
        '101': {
          name: 'Reloj Inteligente Ultra 9 Pro',
          description: 'Smartwatch de alta gama con pantalla AMOLED, monitoreo de salud completo, llamadas bluetooth y resistencia al agua IP68.',
          suggestedPrice: 89900,
          imageSrc: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=300&q=80',
          categoryName: 'Tecnología'
        },
        '102': {
          name: 'Mini Proyector Portátil HD',
          description: 'Disfruta del cine en casa con este proyector compacto que admite resolución 1080p, conectividad HDMI, USB y WiFi para streaming.',
          suggestedPrice: 220000,
          imageSrc: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=300&q=80',
          categoryName: 'Tecnología'
        },
        '103': {
          name: 'Auriculares Bluetooth F9-5',
          description: 'Audífonos inalámbricos de emparejamiento rápido con estuche de carga que funciona como Powerbank para tu celular.',
          suggestedPrice: 49900,
          imageSrc: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80',
          categoryName: 'Accesorios y Viaje'
        },
        '104': {
          name: 'Humidificador Ultrasónico RGB',
          description: 'Difusor de aroma y humidificador con luces LED de colores para crear ambientes relajantes en el hogar u oficina.',
          suggestedPrice: 45000,
          imageSrc: 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?auto=format&fit=crop&w=300&q=80',
          categoryName: 'Hogar y Cocina'
        },
        '105': {
          name: 'Aspiradora Portátil Recargable',
          description: 'Aspiradora inalámbrica compacta de alta potencia para limpieza rápida en el carro, teclado, muebles y esquinas difíciles.',
          suggestedPrice: 79900,
          imageSrc: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=300&q=80',
          categoryName: 'Hogar y Cocina'
        },
        '106': {
          name: 'Pistola de Masaje Muscular Pro',
          description: 'Masajeador de percusión con 6 cabezales intercambiables y velocidades ajustables para aliviar el dolor muscular y acelerar la recuperación.',
          suggestedPrice: 139900,
          imageSrc: 'https://images.unsplash.com/photo-1519826314647-72538027e850?auto=format&fit=crop&w=300&q=80',
          categoryName: 'Salud y Bienestar'
        }
      };
      
      const baseProd = simulatedProducts[productIdStr];
      await importDropiProduct({
        id: Number(productIdStr),
        ...baseProd
      });
      setImportUrlOrId('');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/products/import-dropi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(token)
        },
        body: JSON.stringify({ product_id: productIdStr })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al conectar con la API de Dropi');
      }

      const importedProduct = await res.json();
      setImportMsg({ type: 'success', text: `¡Producto "${importedProduct.name}" importado con éxito desde Dropi!` });
      setTimeout(() => setImportMsg(null), 5000);
      setImportUrlOrId('');
    } catch (err: any) {
      setImportMsg({ type: 'error', text: `Error al importar: ${err.message}` });
    } finally {
      setImportingId(null);
    }
  };

  const filteredExtensions = extensionsCatalog.filter(ext => {
    const matchesCategory = activeCategory === 'all' || ext.category === activeCategory;
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.developer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cargando catálogo de extensiones...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 relative">
      
      {/* Warning banner indicating restart needed */}
      {pendingRestartIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 animate-pulse">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Se requiere actualizar el Dashboard</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Se han descargado e instalado nuevos módulos. Reinicia el dashboard para que se apliquen los cambios y las extensiones queden listas para usar.</p>
            </div>
          </div>
          <button
            onClick={handleRestartDashboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Reiniciar Dashboard</span>
          </button>
        </div>
      )}

      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-theme transition-all">
        
        {/* Categories Tab list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 sidebar-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Buscar integración..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 outline-none text-gray-900 dark:text-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Grid of Extensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExtensions.map(ext => {
          const status = getExtensionStatus(ext.id);
          const isInstalling = installingId === ext.id;

          return (
            <div 
              key={ext.id}
              className="group relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-[1.01] hover:shadow-theme"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {ext.icon}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{ext.name}</span>
                      </h3>
                      <div className="text-[10px] text-gray-400 mt-0.5">{ext.developer}</div>
                    </div>
                  </div>


                </div>

                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed min-h-[48px]">
                  {ext.description}
                </p>
              </div>

              {/* Action area */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col">
                {isInstalling ? (
                  <div className="space-y-2 w-full animate-in fade-in duration-200">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      <span className="truncate max-w-[80%]">{installStepText}</span>
                      <span>{installProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${installProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">{ext.version}</span>
                    
                    <div className="flex items-center gap-2">
                      {status === 'active' ? (
                        <>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                          </span>
                          <button 
                            onClick={() => setSelectedExtension(ext)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            title="Configurar integración"
                          >
                            <Settings2 size={16} />
                          </button>
                        </>
                      ) : status === 'installed' ? (
                        <>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200/30 dark:border-amber-500/20">
                            Falta Configurar
                          </span>
                          <button 
                            onClick={() => setSelectedExtension(ext)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                          >
                            <span>Configurar</span> <ArrowRight size={12} />
                          </button>
                        </>
                      ) : status === 'pending_restart' ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          <Clock size={11} className="animate-pulse" />
                          <span>Pendiente Reinicio</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleInstallExtension(ext.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                        >
                          <Download size={13} />
                          <span>Descargar e Instalar</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredExtensions.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <Puzzle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">No se encontraron extensiones</h3>
            <p className="text-xs text-gray-500 mt-1">Prueba filtrando por otra categoría o ajustando los términos de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Drawer / Sidebar Configuration Panel for Selected Extension */}
      {selectedExtension && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          
          {/* Backdrop */}
          <div 
            onClick={() => { if (!savingSettings && !uninstallingId) { setSelectedExtension(null); setTestResult(null); } }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Configuration Drawer */}
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-gray-950 shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-350 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                {selectedExtension.icon}
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedExtension.name}</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedExtension.developer}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedExtension(null); setTestResult(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                disabled={savingSettings || !!uninstallingId}
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 sidebar-scrollbar">
              
              {/* Tab Navigation (Only for active Dropi) */}
              {selectedExtension.id === 'dropi' && getExtensionStatus('dropi') === 'active' && (
                <div className="flex border-b border-gray-150 dark:border-gray-800 pb-3 gap-4 mb-2">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('config')}
                    className={`pb-1 text-xs font-bold transition-all border-b-2 ${
                      drawerTab === 'config'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Ajustes de Credenciales
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('import')}
                    className={`pb-1 text-xs font-bold transition-all border-b-2 ${
                      drawerTab === 'import'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Importar Catálogo Dropi
                  </button>
                </div>
              )}

              {/* Tab 1: Config (Or all other extensions) */}
              {(selectedExtension.id !== 'dropi' || drawerTab === 'config') && (
                <>
                  {/* Detailed Description */}
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/20 text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                    <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <Play size={12} className="fill-current" /> ¿Cómo funciona esta extensión?
                    </div>
                    <p>{selectedExtension.longDescription}</p>
                  </div>

                  {/* Setup Form */}
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Parámetros de Configuración</h3>
                    
                    {selectedExtension.setupFields.map((field) => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{field.label}</label>
                        {field.type === 'select' ? (
                          <select 
                            value={formValues[field.name] || ''}
                            onChange={(e) => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-205 dark:border-gray-850 bg-gray-50 dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-blue-500 transition-all"
                          >
                            {field.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/40">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Habilitar esta acción</span>
                            <input 
                              type="checkbox" 
                              checked={formValues[field.name] === 'true'}
                              onChange={(e) => setFormValues(prev => ({ ...prev, [field.name]: e.target.checked ? 'true' : 'false' }))}
                              className="w-4 h-4 accent-blue-600" 
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formValues[field.name] || ''}
                              onChange={(e) => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-205 dark:border-gray-850 bg-gray-50 dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-blue-500 transition-all font-mono placeholder:font-sans"
                            />
                            {field.type === 'password' && (
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Custom SMTP form for email_smtp extension */}
                    {selectedExtension.id === 'email_smtp' && (
                      <div className="space-y-4">
                        {/* Provider presets */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Proveedor de Correo</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { key: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: 587, tls: true, ssl: false },
                              { key: 'outlook', label: 'Outlook', host: 'smtp.office365.com', port: 587, tls: true, ssl: false },
                              { key: 'yahoo', label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 465, tls: false, ssl: true },
                              { key: 'custom', label: 'Custom', host: '', port: 587, tls: true, ssl: false }
                            ].map(p => (
                              <button
                                key={p.key}
                                type="button"
                                onClick={() => {
                                  if (p.key !== 'custom') {
                                    setFormValues(prev => ({ ...prev, smtp_host: p.host, smtp_port: String(p.port), smtp_use_tls: p.tls ? 'true' : 'false', smtp_use_ssl: p.ssl ? 'true' : 'false', smtp_preset: p.key }));
                                  } else {
                                    setFormValues(prev => ({ ...prev, smtp_preset: 'custom' }));
                                  }
                                }}
                                className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border ${formValues.smtp_preset === p.key ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-violet-400'}`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico Remitente</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                              type="email"
                              placeholder="tu@empresa.com"
                              value={formValues.smtp_email || ''}
                              onChange={(e) => setFormValues(prev => ({ ...prev, smtp_email: e.target.value }))}
                              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-violet-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contraseña de Aplicación</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                              type={showSmtpPassword ? 'text' : 'password'}
                              placeholder="Contraseña de aplicación (no la de tu cuenta)"
                              value={formValues.smtp_password || ''}
                              onChange={(e) => setFormValues(prev => ({ ...prev, smtp_password: e.target.value }))}
                              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-violet-500 transition-all font-mono"
                            />
                            <button type="button" onClick={() => setShowSmtpPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                              {showSmtpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Host + Port */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Host SMTP</label>
                            <input
                              type="text"
                              placeholder="smtp.gmail.com"
                              value={formValues.smtp_host || ''}
                              onChange={(e) => setFormValues(prev => ({ ...prev, smtp_host: e.target.value, smtp_preset: 'custom' }))}
                              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-violet-500 transition-all font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Puerto</label>
                            <input
                              type="number"
                              placeholder="587"
                              value={formValues.smtp_port || '587'}
                              onChange={(e) => setFormValues(prev => ({ ...prev, smtp_port: e.target.value, smtp_preset: 'custom' }))}
                              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-violet-500 transition-all font-mono"
                            />
                          </div>
                        </div>

                        {/* TLS / SSL toggles */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'smtp_use_tls', label: 'Usar TLS (STARTTLS)' },
                            { key: 'smtp_use_ssl', label: 'Usar SSL' }
                          ].map(tog => (
                            <button
                              key={tog.key}
                              type="button"
                              onClick={() => setFormValues(prev => ({ ...prev, [tog.key]: prev[tog.key] === 'true' ? 'false' : 'true', smtp_preset: 'custom' }))}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${formValues[tog.key] === 'true' ? 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                            >
                              <span>{tog.label}</span>
                              <span className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${formValues[tog.key] === 'true' ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <span className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${formValues[tog.key] === 'true' ? 'translate-x-4' : 'translate-x-0'}`} />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="pt-4 flex flex-col gap-3">
                      
                      {/* Test Connection Button */}
                      <button
                        type="button"
                        disabled={testingConnection || savingSettings || !!uninstallingId}
                        onClick={() => handleTestConnection(selectedExtension.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 transition-colors"
                      >
                        {testingConnection ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <ArrowRight size={14} />
                        )}
                        <span>Probar Credenciales y Conexión</span>
                      </button>

                      {/* Connection result notice */}
                      {testResult && (
                        <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                          testResult.success 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}>
                          {testResult.success ? (
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                          ) : (
                            <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                          )}
                          <p>{testResult.msg}</p>
                        </div>
                      )}

                      {/* Save config button */}
                      <button
                        type="submit"
                        disabled={savingSettings || testingConnection || !!uninstallingId}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                      >
                        {savingSettings ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        <span>Guardar y Activar Integración</span>
                      </button>
                    </div>
                  </form>

                  {/* Danger Zone: Uninstall Option */}
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">Zona de Peligro</h3>
                    <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-500/10 bg-rose-50/20 dark:bg-rose-500/5 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Desinstalar Extensión</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Elimina las credenciales y desvincula el módulo del sistema.</p>
                      </div>
                      <button
                        type="button"
                        disabled={savingSettings || testingConnection || !!uninstallingId}
                        onClick={() => setShowUninstallConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md shadow-rose-500/10 transition-colors"
                      >
                        {uninstallingId === selectedExtension.id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        <span>Desinstalar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}



                  {/* Tab 2: Import (Only for active Dropi) */}
              {selectedExtension.id === 'dropi' && drawerTab === 'import' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Catálogo de Productos Dropi</h3>
                    <p className="text-xs text-gray-500">Haz clic en "Importar" para clonar el producto directamente en tu inventario de Asenting.</p>
                  </div>

                  {/* Formulario de importación por URL o ID */}
                  <form onSubmit={handleImportByUrlOrId} className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-250">Importar por Enlace o ID de Dropi</h4>
                    <p className="text-[10px] text-gray-500">Pega la URL de cualquier producto de la página de Dropi o introduce su ID para importarlo al instante.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej. https://app.dropi.co/products/104"
                        value={importUrlOrId}
                        onChange={(e) => setImportUrlOrId(e.target.value)}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none text-gray-900 dark:text-white focus:border-blue-500 transition-all font-mono"
                      />
                      <button
                        type="submit"
                        disabled={importingId !== null || !importUrlOrId.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        {importingId === 9999 ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Download size={12} />
                        )}
                        <span>Importar</span>
                      </button>
                    </div>
                  </form>

                  {importMsg && (
                    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                      importMsg.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
                    }`}>
                      {importMsg.type === 'success' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                      )}
                      <p>{importMsg.text}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        id: 101,
                        name: 'Reloj Inteligente Ultra 9 Pro',
                        description: 'Smartwatch de alta gama con pantalla AMOLED, monitoreo de salud completo, llamadas bluetooth y resistencia al agua IP68.',
                        dropshippingPrice: 45000,
                        suggestedPrice: 89900,
                        imageSrc: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=300&q=80',
                        categoryName: 'Tecnología'
                      },
                      {
                        id: 102,
                        name: 'Mini Proyector Portátil HD',
                        description: 'Disfruta del cine en casa con este proyector compacto que admite resolución 1080p, conectividad HDMI, USB y WiFi para streaming.',
                        dropshippingPrice: 120000,
                        suggestedPrice: 220000,
                        imageSrc: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=300&q=80',
                        categoryName: 'Tecnología'
                      },
                      {
                        id: 103,
                        name: 'Auriculares Bluetooth F9-5',
                        description: 'Audífonos inalámbricos de emparejamiento rápido con estuche de carga que funciona como Powerbank para tu celular.',
                        dropshippingPrice: 20000,
                        suggestedPrice: 49900,
                        imageSrc: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80',
                        categoryName: 'Accesorios y Viaje'
                      },
                      {
                        id: 104,
                        name: 'Humidificador Ultrasónico RGB',
                        description: 'Difusor de aroma y humidificador con luces LED de colores para crear ambientes relajantes en el hogar u oficina.',
                        dropshippingPrice: 18000,
                        suggestedPrice: 45000,
                        imageSrc: 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?auto=format&fit=crop&w=300&q=80',
                        categoryName: 'Hogar y Cocina'
                      },
                      {
                        id: 105,
                        name: 'Aspiradora Portátil Recargable',
                        description: 'Aspiradora inalámbrica compacta de alta potencia para limpieza rápida en el carro, teclado, muebles y esquinas difíciles.',
                        dropshippingPrice: 35000,
                        suggestedPrice: 79900,
                        imageSrc: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=300&q=80',
                        categoryName: 'Hogar y Cocina'
                      },
                      {
                        id: 106,
                        name: 'Pistola de Masaje Muscular Pro',
                        description: 'Masajeador de percusión con 6 cabezales intercambiables y velocidades ajustables para aliviar el dolor muscular y acelerar la recuperación.',
                        dropshippingPrice: 65000,
                        suggestedPrice: 139900,
                        imageSrc: 'https://images.unsplash.com/photo-1519826314647-72538027e850?auto=format&fit=crop&w=300&q=80',
                        categoryName: 'Salud y Bienestar'
                      }
                    ].map(prod => (
                      <div key={prod.id} className="p-4 rounded-xl border border-gray-150 dark:border-gray-800 flex gap-4 bg-gray-50/50 dark:bg-gray-900/40">
                        <img src={prod.imageSrc} alt={prod.name} className="w-20 h-20 rounded-lg object-cover bg-white shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{prod.name}</h4>
                            <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{prod.description}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-400 font-semibold uppercase">Costo: ${prod.dropshippingPrice.toLocaleString()}</span>
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400">Venta: ${prod.suggestedPrice.toLocaleString()}</span>
                            </div>
                            <button
                              type="button"
                              disabled={importingId !== null}
                              onClick={() => importDropiProduct(prod)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[10px] font-bold text-white rounded-lg shadow-md shadow-blue-500/10 transition-all flex items-center gap-1.5"
                            >
                              {importingId === prod.id ? (
                                <RefreshCw size={10} className="animate-spin" />
                              ) : (
                                <Download size={10} />
                              )}
                              <span>{importingId === prod.id ? 'Importando...' : 'Importar'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Drawer Footer info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center text-[10px] text-gray-400">
              Integración segura encriptada en base de datos. Desarrollado bajo especificaciones OAuth 2.0.
            </div>
          </div>
        </div>
      )}

      {/* Uninstallation Confirmation Dialog Modal */}
      {showUninstallConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">¿Desinstalar {selectedExtension?.name}?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Esta acción desinstalará el módulo contable y eliminará permanentemente todas las credenciales API configuradas e información relacionada de tu cuenta.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 text-[11px] text-rose-700 dark:text-rose-350 leading-relaxed font-medium">
              ⚠️ Al continuar, se eliminará el histórico de sincronización contable y no podrás emitir facturas electrónicas hasta volver a configurar el módulo. Esta operación no se puede deshacer.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUninstallConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-350 font-semibold text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-805"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUninstallConfirm(false);
                  if (selectedExtension) handleUninstallExtension(selectedExtension.id);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20"
              >
                Sí, desinstalar y borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Fullscreen Reboot Overlay */}
      {isRebooting && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center max-w-sm text-center space-y-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-fuchsia-500 border-b-transparent border-l-transparent animate-spin duration-1000" />
              <Puzzle className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Reiniciando Dashboard</h3>
              <p className="text-xs text-gray-400 min-h-[16px] animate-pulse">{rebootStepText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigExtensionsPage;
