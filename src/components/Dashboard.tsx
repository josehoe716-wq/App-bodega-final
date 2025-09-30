import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingUp, Clock, Eye } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { MaterialExit, CartExit } from '../types/materialExit';
import { materialExitApi, cartExitApi } from '../services/materialExitApi';
import { StatsGrid } from './StatsGrid';
import { StockCriticalityCharts } from './StockCriticalityCharts';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { StockTrendsChart } from './StockTrendsChart';

// Tipo unificado para mostrar todos los movimientos
interface UnifiedMovement {
  id: string;
  type: 'single' | 'cart';
  date: string;
  time: string;
  personName: string;
  personLastName: string;
  area: string;
  ceco?: string;
  sapCode?: string;
  workOrder?: string;
  // Para movimientos individuales
  materialName?: string;
  materialCode?: string;
  materialLocation?: string;
  materialType?: 'ERSA' | 'UNBW';
  quantity?: number;
  remainingStock?: number;
  // Para movimientos del carrito
  registryCode?: string;
  totalItems?: number;
  totalQuantity?: number;
  materials?: any[];
  originalId: number;
}

interface DashboardProps {
  items: InventoryItem[];
}

export function Dashboard({ items }: DashboardProps) {
  const [recentMovements, setRecentMovements] = useState<UnifiedMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentMovements();
  }, []);

  const loadRecentMovements = async () => {
    try {
      setLoading(true);
      const [exits, cartExits] = await Promise.all([
        materialExitApi.getAll(),
        cartExitApi.getAll()
      ]);
      
      // Convertir a formato unificado
      const unifiedSingle: UnifiedMovement[] = exits.map(exit => ({
        id: `single-${exit.id}`,
        type: 'single' as const,
        date: exit.exitDate,
        time: exit.exitTime,
        personName: exit.personName,
        personLastName: exit.personLastName,
        area: exit.area,
        ceco: exit.ceco,
        sapCode: exit.sapCode,
        workOrder: exit.workOrder,
        materialName: exit.materialName,
        materialCode: exit.materialCode,
        materialLocation: exit.materialLocation,
        materialType: exit.materialType,
        quantity: exit.quantity,
        remainingStock: exit.remainingStock,
        originalId: exit.id
      }));
      
      const unifiedCart: UnifiedMovement[] = cartExits.map(exit => ({
        id: `cart-${exit.id}`,
        type: 'cart' as const,
        date: exit.exitDate,
        time: exit.exitTime,
        personName: exit.personName,
        personLastName: exit.personLastName,
        area: exit.area,
        ceco: exit.ceco,
        sapCode: exit.sapCode,
        workOrder: exit.workOrder,
        registryCode: exit.registryCode,
        totalItems: exit.totalItems,
        totalQuantity: exit.totalQuantity,
        materials: exit.materials,
        originalId: exit.id
      }));
      
      // Combinar y ordenar todos los movimientos
      const allMovements = [...unifiedSingle, ...unifiedCart];
      allMovements.sort((a, b) => {
        const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
        return dateTimeB - dateTimeA;
      });
      
      // Obtener los últimos 10 movimientos
      setRecentMovements(allMovements.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent movements:', error);
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

      {/* Gráfica de tendencias de stock */}
      <StockTrendsChart items={items} />

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
          ) : recentMovements.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentMovements.map((movement) => (
                <div 
                  key={movement.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    movement.type === 'single' 
                      ? 'bg-slate-50' 
                      : 'bg-purple-50 border border-purple-200'
                  }`}
                >
                  {movement.type === 'single' ? (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            movement.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {movement.materialType}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{movement.materialName}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span>{movement.personName} {movement.personLastName}</span>
                          <span className="mx-2">•</span>
                          <span>{movement.area}</span>
                          <span className="mx-2">•</span>
                          <span>{movement.date} {movement.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">-{movement.quantity}</div>
                        <div className="text-xs text-slate-500">Stock: {movement.remainingStock}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                            CARRITO
                          </span>
                          <span className="text-sm font-medium text-slate-900">#{movement.registryCode}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span>{movement.personName} {movement.personLastName}</span>
                          <span className="mx-2">•</span>
                          <span>{movement.area}</span>
                          <span className="mx-2">•</span>
                          <span>{movement.date} {movement.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">{movement.totalItems} tipos</div>
                        <div className="text-xs text-slate-500">{movement.totalQuantity} unidades</div>
                      </div>
                    </>
                  )}
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