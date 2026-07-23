import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowUpRight, Users } from 'lucide-react';
import PurchasesPage from './PurchasesPage';
import StockExitsPage from './StockExitsPage';
import SuppliersPage from './SuppliersPage';

interface StockOperationsPageProps {
  token: string | null;
  apiBase: string;
  role?: string;
  initialTab?: 'compras' | 'salidas' | 'proveedores';
}

const StockOperationsPage: React.FC<StockOperationsPageProps> = ({
  token,
  apiBase,
  role,
  initialTab = 'compras'
}) => {
  const [activeTab, setActiveTab] = useState<'compras' | 'salidas' | 'proveedores'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Top Tabs Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('compras')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'compras'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Compras y Entradas</span>
          </button>

          <button
            onClick={() => setActiveTab('salidas')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'salidas'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Salidas de Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('proveedores')}
            className={`flex-1 min-w-[160px] py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'proveedores'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Proveedores</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'compras' && (
          <PurchasesPage token={token} apiBase={apiBase} />
        )}
        {activeTab === 'salidas' && (
          <StockExitsPage token={token} apiBase={apiBase} role={role} />
        )}
        {activeTab === 'proveedores' && (
          <SuppliersPage token={token || ''} apiBase={apiBase} />
        )}
      </div>
    </div>
  );
};

export default StockOperationsPage;
