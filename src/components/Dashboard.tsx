import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingUp, Clock, Eye } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { MaterialExit, CartExit } from '../types/materialExit';
import { materialExitApi, cartExitApi } from '../services/materialExitApi';
import { StatsGrid } from './StatsGrid';
import { StockCriticalityCharts } from './StockCriticalityCharts';
import { CategoryDistributionChart } from './CategoryDistributionChart';

interface DashboardProps {
  items: InventoryItem[];
}

export function Dashboard({ items }: DashboardProps) {
  const [recentExits, setRecentExits] = useState<MaterialExit[]>([]);
  const [recentCartExits, setRecentCartExits] = useState<CartExit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentExits();
  }, []);

  const loadRecentExits = async () => {
    try {
      setLoading(true);
      const [exits, cartExits] = await Promise.all([
        materialExitApi.getAll(),
        cartExitApi.getAll()
      ]);
      
      // Obtener los últimos 10 movimientos
      const sortedExits = exits
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentExits(sortedExits);
      
      // Obtener las últimas 5 salidas del carrito
      const sortedCartExits = cartExits
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentCartExits(sortedCartExits);
    } catch (error) {
      console.error('Error loading recent exits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Materiales con stock cero
  const zeroStockItems = items.filter(item => item.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Panel Principal</h2>
        <p className="text-slate-600">Resumen general del sistema de inventario</p>
      </div>

      {/* Estadísticas */}
      <StatsGrid items={items} />

      {/* Gráficas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StockCriticalityCharts items={items} />
        <CategoryDistributionChart items={items} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Últimos 10 movimientos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Últimos Movimientos</h3>
              <p className="text-sm text-slate-600">Últimas 10 salidas de materiales</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : recentExits.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentExits.map((exit) => (
                <div key={exit.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        exit.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {exit.materialType}
                      </span>
                      <span className="text-sm font-medium text-slate-900">{exit.materialName}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span>{exit.personName} {exit.personLastName}</span>
                      <span className="mx-2">•</span>
                      <span>{exit.area}</span>
                      <span className="mx-2">•</span>
                      <span>{exit.exitDate} {exit.exitTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">-{exit.quantity}</div>
                    <div className="text-xs text-slate-500">Stock: {exit.remainingStock}</div>
                  </div>
                </div>
              ))}
              {recentCartExits.map((cartExit) => (
                <div key={`cart-${cartExit.id}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                        CARRITO
                      </span>
                      <span className="text-sm font-medium text-slate-900">#{cartExit.registryCode}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span>{cartExit.personName} {cartExit.personLastName}</span>
                      <span className="mx-2">•</span>
                      <span>{cartExit.area}</span>
                      <span className="mx-2">•</span>
                      <span>{cartExit.exitDate} {cartExit.exitTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{cartExit.totalItems} items</div>
                    <div className="text-xs text-slate-500">{cartExit.totalQuantity} unidades</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas del sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Alertas del Sistema</h3>
              <p className="text-sm text-slate-600">Materiales que requieren atención</p>
            </div>
          </div>

          {zeroStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-green-600 font-medium">¡Todo en orden!</p>
              <p className="text-slate-600 text-sm">No hay materiales sin stock</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">
                    {zeroStockItems.length} material{zeroStockItems.length > 1 ? 'es' : ''} sin stock
                  </span>
                </div>
              </div>
              
              {zeroStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        item.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.tipo}
                      </span>
                      <span className="text-sm font-medium text-slate-900">{item.nombre}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span>Código: {item.codigo}</span>
                      <span className="mx-2">•</span>
                      <span>Ubicación: {item.ubicacion}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">0 {item.unidad}</div>
                    <div className="text-xs text-red-500">¡Reabastecer!</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}