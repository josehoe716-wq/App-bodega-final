import React from 'react';
import { 
  Home, 
  Package, 
  History, 
  BarChart3, 
  Upload, 
  Settings, 
  ShoppingCart,
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'Tecnico' | 'administrador';
  onLogout: () => void;
  cartItemsCount?: number;
  onOpenCart?: () => void;
}

export function Sidebar({ activeTab, onTabChange, userRole, onLogout, cartItemsCount = 0, onOpenCart }: SidebarProps) {
  const adminTabs = [
    { id: 'dashboard', label: 'Panel Principal', icon: Home },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'movements', label: 'Movimientos', icon: History },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'import-export', label: 'Importar/Exportar', icon: Upload },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const technicianTabs = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'cart', label: 'Carrito', icon: ShoppingCart },
    { id: 'cart-history', label: 'Historial de Salidas', icon: History },
  ];

  const tabs = userRole === 'administrador' ? adminTabs : technicianTabs;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-slate-200">
            <img
              src="https://ecuajugos.com/wp-content/uploads/2019/06/ecuajugos-color@2xv1.png"
              alt="Ecuajugos Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="bg-blue-600 p-2 rounded-lg hidden">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Mi bodega EJ-TEC</h1>
            <p className="text-sm text-slate-600">
              {userRole === 'administrador' ? 'Administrador' : 'Técnico'}
            </p>
          </div>
        </div>
      </div>

      {/* Botón flotante del carrito para técnicos */}
      {userRole === 'Tecnico' && onOpenCart && (
        <div className="p-4">
          <button
            onClick={onOpenCart}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Ver Carrito</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'cart' && cartItemsCount > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}