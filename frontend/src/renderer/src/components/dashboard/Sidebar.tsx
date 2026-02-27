import React, { useEffect, useState } from 'react'
import Icon from './Icon'
import asentingLogo from '../../assets/logo.png'
import { ModeToggle } from '../ModeToggle'
import pkg from '../../../../../package.json'

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
  onSignOut: () => void;
  role: string;
  orderNotif?: number;
  token?: string | null;
  apiBase: string;
  setUpdateMsg?: (msg: any) => void;
  subscription?: any;
}

interface MenuPos {
  top: number;
  left: number;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onSignOut, role, orderNotif, token, apiBase, setUpdateMsg, subscription }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [clientsStats, setClientsStats] = useState(null)
  const [salesStats, setSalesStats] = useState(null)
  const [configMenuPos, setConfigMenuPos] = useState<MenuPos | null>(null)
  const [inventoryMenuPos, setInventoryMenuPos] = useState<MenuPos | null>(null)
  const [ventasMenuPos, setVentasMenuPos] = useState<MenuPos | null>(null)
  const [serviciosMenuPos, setServiciosMenuPos] = useState<MenuPos | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isVentasOpen, setIsVentasOpen] = useState(false)
  const [isServiciosOpen, setIsServiciosOpen] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const toggleConfigMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (collapsed) {
      if (configMenuPos) {
        setConfigMenuPos(null)
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        setConfigMenuPos({ top: rect.top, left: rect.right })
        setInventoryMenuPos(null)
        setVentasMenuPos(null)
        setServiciosMenuPos(null)
      }
    } else {
      setIsConfigOpen(!isConfigOpen)
      if (!isConfigOpen) {
        setIsInventoryOpen(false)
        setIsVentasOpen(false)
        setIsServiciosOpen(false)
      }
    }
  }

  const toggleInventoryMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (collapsed) {
      if (inventoryMenuPos) {
        setInventoryMenuPos(null)
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        setInventoryMenuPos({ top: rect.top, left: rect.right })
        setConfigMenuPos(null)
        setVentasMenuPos(null)
        setServiciosMenuPos(null)
      }
    } else {
      setIsInventoryOpen(!isInventoryOpen)
      if (!isInventoryOpen) {
        setIsConfigOpen(false)
        setIsVentasOpen(false)
        setIsServiciosOpen(false)
      }
    }
  }

  const toggleVentasMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (collapsed) {
      if (ventasMenuPos) {
        setVentasMenuPos(null)
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        setVentasMenuPos({ top: rect.top, left: rect.right })
        setConfigMenuPos(null)
        setInventoryMenuPos(null)
        setServiciosMenuPos(null)
      }
    } else {
      setIsVentasOpen(!isVentasOpen)
      if (!isVentasOpen) {
        setIsConfigOpen(false)
        setIsInventoryOpen(false)
        setIsServiciosOpen(false)
      }
    }
  }

  const toggleServiciosMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (collapsed) {
      if (serviciosMenuPos) {
        setServiciosMenuPos(null)
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        setServiciosMenuPos({ top: rect.top, left: rect.right })
        setConfigMenuPos(null)
        setInventoryMenuPos(null)
        setVentasMenuPos(null)
      }
    } else {
      setIsServiciosOpen(!isServiciosOpen)
      if (!isServiciosOpen) {
        setIsConfigOpen(false)
        setIsInventoryOpen(false)
        setIsVentasOpen(false)
      }
    }
  }

  // Listen for update messages from main process
  useEffect(() => {
    // @ts-ignore
    if (window.electron && window.electron.ipcRenderer) {
      // @ts-ignore
      const handleUpdate = (_: any, message: any) => {
        if (setUpdateMsg) setUpdateMsg(message);
      };
      // @ts-ignore
      window.electron.ipcRenderer.on('update-status', handleUpdate);
      return () => {
        // @ts-ignore
        if (window.electron && window.electron.ipcRenderer && window.electron.ipcRenderer.removeListener) {
          window.electron.ipcRenderer.removeListener('update-status', handleUpdate);
        }
      }
    }
  }, []);

  const absUrl = (path: string) => {
    try {
      if (!path) return ''
      if (path.startsWith('http://') || path.startsWith('https://')) return path
      if (path.startsWith('/')) return `${apiBase}${path}`
      return `${apiBase}/${path}`
    } catch { return path }
  }
  useEffect(() => {
    try {
      const s = localStorage.getItem('sidebar_collapsed')
      if (s === '1' || s === '0') setCollapsed(s === '1')
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0')
    } catch {}
  }, [collapsed])
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const headers: Record<string, string> = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
        const endpoint = token ? `${apiBase}/webconfig/settings/` : `${apiBase}/webconfig/public/settings/`
        const res = await fetch(endpoint, { headers })
        const data = await res.json()
        if (res.ok && data && typeof data.company_name === 'string') {
          setCompanyName(data.company_name || '')
          if (data.logo) setCompanyLogo(absUrl(data.logo))
        }
      } catch {}
    }
    loadSettings()
  }, [token, apiBase])
  useEffect(() => {
    const loadStats = async () => {
      try {
        const headers: Record<string, string> = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
        const [cRes, sRes] = await Promise.all([
          fetch(`${apiBase}/clients/stats/`, { headers }),
          fetch(`${apiBase}/sales/stats/`, { headers }),
        ])
        const cData = await cRes.json()
        const sData = await sRes.json()
        if (cRes.ok) setClientsStats(cData)
        if (sRes.ok) setSalesStats(sData)
      } catch {}
    }
    loadStats()
  }, [token, apiBase])

  const asideClass = collapsed ? 'w-24' : 'w-72'
  const textClass = `transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[240px] opacity-100'}`
  const tooltipClass = collapsed ? 'absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs shadow-xl border border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none z-50' : 'hidden'
  // Use padding transition for centering instead of justify-content change to avoid snapping
  const itemBase = `group relative w-full flex items-center ${collapsed ? 'px-7 gap-0' : 'px-3 gap-3'} py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium`
  const activeClass = 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10'
  const toneClasses = (key: string) => {
    if (key === 'dashboard') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300'
    if (key === 'users') return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
    if (key === 'inventory') return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
    if (key === 'productos') return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
    if (key === 'categorias') return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-700 dark:group-hover:text-violet-300'
    if (key === 'clientes') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300'
    if (key === 'ventas') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
    if (key === 'pedidos') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20 group-hover:text-rose-700 dark:group-hover:text-rose-300'
    if (key === 'web') return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
    if (key === 'servicios') return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500/20 group-hover:text-pink-700 dark:group-hover:text-pink-300'
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  }

  const ToggleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <aside className={`${asideClass} shrink-0 bg-blue-50/50 dark:bg-[#0B0D14] border-r border-blue-100 dark:border-white/5 text-gray-900 dark:text-gray-200 flex flex-col relative z-50 h-full transition-all duration-300 ease-in-out`}>
      <style>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        .dark .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
        .dark .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div className={`px-4 py-4 flex items-center ${collapsed ? 'justify-center flex-col gap-2' : 'justify-between'} shrink-0 h-auto min-h-[64px]`}>
        <div className={`flex items-center overflow-hidden transition-all duration-300 ${collapsed ? 'justify-center w-full gap-0' : 'gap-3'}`}>
          <img src={asentingLogo} alt="Asenting" className="w-10 h-10 object-contain drop-shadow-lg shrink-0" />
          <div className={`${textClass} flex flex-col`}>
             <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">Asenting</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono border border-blue-200 dark:border-blue-800">v{pkg.version}</span>
             </div>
             <span className="text-[10px] text-gray-500 dark:text-gray-500 font-semibold uppercase tracking-wider mt-1">{companyName || 'Panel'}</span>
           </div>
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${collapsed ? 'mt-1' : ''}`}
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <div className={`transform transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}>
            <ToggleIcon />
          </div>
        </button>
      </div>
      <div className="px-4 py-2 mb-2 shrink-0 overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'max-h-0 opacity-0 -translate-y-2' : 'max-h-40 opacity-100 translate-y-0'}`}>
          <div className={`text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1.5 bg-gray-100 dark:bg-white/5 p-2.5 rounded-xl border border-gray-200 dark:border-white/5`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-gray-200">Rol</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 dark:border-white/5 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wide`}>
                {role}
              </span>
            </div>
            {subscription && (
              <div className="flex items-center gap-2 mt-1">
                <span>Plan:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-medium ${
                  subscription.code === 'basic' ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300' :
                  subscription.code === 'medium' ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300' :
                  'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-300'
                }`}>
                  {subscription.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className={`p-2 space-y-1 flex-1 min-h-0 ${collapsed ? 'overflow-hidden' : 'sidebar-scrollbar overflow-y-auto'}`} role="navigation" aria-label="Secciones">
        <button className={`${itemBase} ${view === 'dashboard' ? activeClass : ''}`} onClick={() => setView('dashboard')} title="Dashboard" aria-current={view === 'dashboard' ? 'page' : undefined}>
          {view === 'dashboard' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('dashboard')} ${view === 'dashboard' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="dashboard" className="w-5 h-5" />
          </span>
          <span className={textClass}>Dashboard</span>
          <span className={tooltipClass}>Dashboard</span>
        </button>
        <div className="relative">
          <button className={`${itemBase} ${['ventas', 'caja'].includes(view) ? activeClass : ''}`} onClick={toggleVentasMenu} title="Ventas">
            {['ventas', 'caja'].includes(view) && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
            <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('ventas')} ${['ventas', 'caja'].includes(view) ? 'ring-1 ring-white/20' : ''}`}>
              <Icon name="sales" className="w-5 h-5" />
            </span>
            <span className={textClass}>Ventas</span>
            <span className={tooltipClass}>Ventas</span>
            {!collapsed && (
              <svg className={`w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 transition-transform ${ventasMenuPos || isVentasOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          {ventasMenuPos && collapsed && (
            <div 
              style={{ 
                position: 'fixed', 
                top: ventasMenuPos.top, 
                left: ventasMenuPos.left,
                zIndex: 9999
              }}
              className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 ml-2"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setView('ventas'); setVentasMenuPos(null); }} 
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'ventas' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="sales" className="w-4 h-4" />
                <span>Nueva Venta</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setView('caja'); setVentasMenuPos(null); }} 
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'caja' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="sales" className="w-4 h-4" />
                <span>Caja</span>
              </button>
            </div>
          )}

          {isVentasOpen && !collapsed && (
            <div className="mt-1 ml-1 space-y-1 bg-gray-50 dark:bg-black/20 rounded-md p-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setView('ventas'); }} 
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'ventas' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="sales" className="w-4 h-4" />
                <span>Nueva Venta</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setView('caja'); }} 
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'caja' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="sales" className="w-4 h-4" />
                <span>Caja</span>
              </button>
            </div>
          )}
        </div>
        <button className={`${itemBase} ${view === 'pedidos' ? activeClass : ''}`} onClick={() => setView('pedidos')} title="Pedidos" aria-current={view === 'pedidos' ? 'page' : undefined}>
          {view === 'pedidos' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('pedidos')} ${view === 'pedidos' ? 'ring-1 ring-white/20' : ''} relative`}>
            <Icon name="orders" className="w-5 h-5" />
            {Number(orderNotif || 0) > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center border border-white/20 notification-badge"
                aria-label={`${orderNotif} notificaciones de pedidos sin leer`}
              >
                {Number(orderNotif) > 99 ? '99+' : Number(orderNotif)}
              </span>
            )}
          </span>
          <span className={textClass}>Pedidos</span>
          <span className={tooltipClass}>Pedidos</span>
        </button>
        <button className={`${itemBase} ${view === 'clientes' ? activeClass : ''}`} onClick={() => setView('clientes')} title="Clientes" aria-current={view === 'clientes' ? 'page' : undefined}>
          {view === 'clientes' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('clientes')} ${view === 'clientes' ? 'ring-1 ring-white/20' : ''}`}>
            <Icon name="clients" className="w-5 h-5" />
          </span>
          <span className={textClass}>Clientes</span>
          <span className={tooltipClass}>Clientes</span>
        </button>
        <div className="relative">
          <button className={`${itemBase} ${['productos', 'categorias'].includes(view) ? activeClass : ''}`} onClick={toggleInventoryMenu} title="Inventario">
            {['productos', 'categorias'].includes(view) && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
            <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('inventory')} ${['productos', 'categorias'].includes(view) ? 'ring-1 ring-white/20' : ''}`}>
              <Icon name="inventory" className="w-5 h-5" />
            </span>
            <span className={textClass}>Inventario</span>
            <span className={tooltipClass}>Inventario</span>
            {!collapsed && (
              <svg className={`w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 transition-transform ${inventoryMenuPos || isInventoryOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          {inventoryMenuPos && collapsed && (
            <div 
              style={{ 
                position: 'fixed', 
                top: inventoryMenuPos.top, 
                left: inventoryMenuPos.left,
                zIndex: 9999
              }}
              className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 ml-2"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setView('productos'); setInventoryMenuPos(null); }} 
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'productos' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="products" className="w-4 h-4" />
                <span>Productos</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setView('categorias'); setInventoryMenuPos(null); }} 
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'categorias' ? 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="categories" className="w-4 h-4" />
                <span>Categorías</span>
              </button>
            </div>
          )}

          {isInventoryOpen && !collapsed && (
            <div className="mt-1 ml-1 space-y-1 bg-gray-50 dark:bg-black/20 rounded-md p-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setView('productos'); }} 
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'productos' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="products" className="w-4 h-4" />
                <span>Productos</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setView('categorias'); }} 
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'categorias' ? 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon name="categories" className="w-4 h-4" />
                <span>Categorías</span>
              </button>
            </div>
          )}
        </div>
        <button className={`${itemBase} ${view === 'servicios' ? activeClass : ''}`} onClick={() => setView('servicios')} title="Servicios" aria-current={view === 'servicios' ? 'page' : undefined}>
          {view === 'servicios' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
          <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('servicios')} ${view === 'servicios' ? 'ring-1 ring-gray-200 dark:ring-white/20' : ''}`}>
            <Icon name="services" className="w-5 h-5" />
          </span>
          <span className={textClass}>Servicios</span>
          <span className={tooltipClass}>Servicios</span>
        </button>
        {(role === 'super_admin' || role === 'admin') && (
          <button className={`${itemBase} ${view === 'users' ? activeClass : ''}`} onClick={() => setView('users')} title="Usuarios" aria-current={view === 'users' ? 'page' : undefined}>
            {view === 'users' && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
            <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('users')} ${view === 'users' ? 'ring-1 ring-gray-200 dark:ring-white/20' : ''}`}>
              <Icon name="users" className="w-5 h-5" />
            </span>
            <span className={textClass}>Usuarios</span>
            <span className={tooltipClass}>Usuarios</span>
          </button>
        )}
        {(role === 'admin' || role === 'super_admin') && (
          <div className="relative">
            <button className={`${itemBase} ${['web', 'planes', 'configuracion'].includes(view) ? activeClass : ''}`} onClick={toggleConfigMenu} title="Configuración">
              {(['web', 'planes', 'configuracion'].includes(view)) && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
              <span className={`w-10 h-10 rounded-md flex items-center justify-center ${toneClasses('web')} ${['web', 'planes', 'configuracion'].includes(view) ? 'ring-1 ring-gray-200 dark:ring-white/20' : ''}`}>
                <Icon name="settings" className="w-5 h-5" />
              </span>
              <span className={textClass}>Configuración</span>
              <span className={tooltipClass}>Configuración</span>
              {!collapsed && (
                <svg className={`w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 transition-transform ${configMenuPos || isConfigOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {configMenuPos && collapsed && (
              <div 
                style={{ 
                  position: 'fixed', 
                  top: configMenuPos.top, 
                  left: configMenuPos.left,
                  zIndex: 9999
                }}
                className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 ml-2"
              >
                {(role === 'super_admin' || (role === 'admin' && (subscription?.features?.web_store || subscription?.code === 'advanced'))) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('web'); setConfigMenuPos(null); }} 
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'web' ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <Icon name="web" className="w-4 h-4" />
                    <span>Página web</span>
                  </button>
                )}

                {role === 'super_admin' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('planes'); setConfigMenuPos(null); }} 
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'planes' ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <Icon name="plans" className="w-4 h-4" />
                    <span>Planes</span>
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setView('configuracion'); setConfigMenuPos(null); }} 
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors ${view === 'configuracion' ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-600/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <Icon name="settings" className="w-4 h-4" />
                  <span>General</span>
                </button>
              </div>
            )}

            {isConfigOpen && !collapsed && (
              <div className="mt-1 ml-1 space-y-1 bg-gray-50 dark:bg-black/20 rounded-md p-1">
                {(role === 'super_admin' || (role === 'admin' && (subscription?.features?.web_store || subscription?.code === 'advanced'))) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('web'); }} 
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'web' ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <Icon name="web" className="w-4 h-4" />
                    <span>Página web</span>
                  </button>
                )}
                {role === 'super_admin' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('planes'); }} 
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'planes' ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <Icon name="plans" className="w-4 h-4" />
                    <span>Planes</span>
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setView('configuracion'); }} 
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm ${view === 'configuracion' ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-600/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <Icon name="settings" className="w-4 h-4" />
                  <span>General</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
      <div className="p-2 border-t border-gray-200 dark:border-white/5 shrink-0 space-y-2">
        <ModeToggle collapsed={collapsed} />
        <button 
          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-white/5 hover:border-red-500/20 transition-all duration-200 group relative`} 
          onClick={onSignOut} 
          title="Cerrar sesión"
        >
          <Icon name="logout" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className={`${textClass} font-medium`}>Cerrar sesión</span>
          <span className={tooltipClass}>Cerrar sesión</span>
        </button>
      </div>
      {showUpdateModal && <UpdateModal onClose={() => setShowUpdateModal(false)} />}
    </aside>
  )
}

export default Sidebar
