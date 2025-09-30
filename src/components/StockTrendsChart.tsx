import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types/inventory';
import { TrendingUp } from 'lucide-react';

interface StockTrendsChartProps {
  items: InventoryItem[];
}

export function StockTrendsChart({ items }: StockTrendsChartProps) {
  // Función para determinar la categoría automáticamente
  const determineCategory = (item: InventoryItem): string => {
    const nombre = item.nombre.toLowerCase();
    const tipo = item.tipo.toLowerCase();
    
    if (nombre.includes('perno') || nombre.includes('tornillo') || nombre.includes('tuerca') || 
        nombre.includes('arandela') || nombre.includes('allen')) {
      return 'Tornillería';
    }
    
    if (nombre.includes('correa') || nombre.includes('banda') || nombre.includes('cadena')) {
      return 'Transmisión';
    }
    
    if (nombre.includes('aceite') || nombre.includes('grasa') || nombre.includes('lubricante') ||
        nombre.includes('fluido') || nombre.includes('hidraulico')) {
      return 'Lubricantes';
    }
    
    if (nombre.includes('rodamiento') || nombre.includes('cojinete') || nombre.includes('bearing')) {
      return 'Rodamientos';
    }
    
    if (nombre.includes('sello') || nombre.includes('empaque') || nombre.includes('junta') ||
        nombre.includes('o-ring') || nombre.includes('gasket')) {
      return 'Sellos';
    }
    
    if (nombre.includes('filtro') || nombre.includes('filter')) {
      return 'Filtros';
    }
    
    if (nombre.includes('valvula') || nombre.includes('valve') || nombre.includes('conexion') ||
        nombre.includes('fitting') || nombre.includes('acople')) {
      return 'Válvulas';
    }
    
    if (nombre.includes('motor') || nombre.includes('bomba') || nombre.includes('compresor')) {
      return 'Equipos Rotativos';
    }
    
    if (nombre.includes('cable') || nombre.includes('alambre') || nombre.includes('conductor') ||
        nombre.includes('electrico')) {
      return 'Eléctricos';
    }
    
    if (nombre.includes('manguera') || nombre.includes('tubo') || nombre.includes('tuberia') ||
        nombre.includes('pipe') || nombre.includes('hose')) {
      return 'Tuberías';
    }
    
    if (tipo === 'ersa') {
      return 'Repuestos ERSA';
    }
    
    if (tipo === 'unbw') {
      return 'Materiales UNBW';
    }
    
    return 'Otros';
  };

  // Agrupar por categorías y calcular niveles de stock
  const categoryStats = items.reduce((acc, item) => {
    const category = item.categoria || determineCategory(item);
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    
    if (!acc[category]) {
      acc[category] = {
        categoria: category,
        'Stock Normal': 0,
        'Stock Bajo': 0,
        'Stock Crítico': 0,
        'Sin Stock': 0
      };
    }
    
    if (item.stock === 0) {
      acc[category]['Sin Stock'] += 1;
    } else if (item.stock <= criticalThreshold) {
      acc[category]['Stock Crítico'] += 1;
    } else if (item.stock <= puntoPedido) {
      acc[category]['Stock Bajo'] += 1;
    } else {
      acc[category]['Stock Normal'] += 1;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(categoryStats);

  // Calcular totales
  const totals = chartData.reduce((acc, item) => ({
    normal: acc.normal + item['Stock Normal'],
    bajo: acc.bajo + item['Stock Bajo'],
    critico: acc.critico + item['Stock Crítico'],
    sinStock: acc.sinStock + item['Sin Stock']
  }), { normal: 0, bajo: 0, critico: 0, sinStock: 0 });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tendencias de Stock por Categoría</h3>
          <p className="text-sm text-slate-600">Distribución de niveles de stock en cada categoría</p>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="categoria" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              label={{ value: 'Cantidad de Materiales', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Categoría: ${label}`}
            />
            <Legend />
            <Bar dataKey="Stock Normal" stackId="a" fill="#10b981" name="Stock Normal" />
            <Bar dataKey="Stock Bajo" stackId="a" fill="#f59e0b" name="Stock Bajo" />
            <Bar dataKey="Stock Crítico" stackId="a" fill="#ef4444" name="Stock Crítico" />
            <Bar dataKey="Sin Stock" stackId="a" fill="#6b7280" name="Sin Stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">{totals.normal}</div>
          <div className="text-sm text-green-700">Stock Normal</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">{totals.bajo}</div>
          <div className="text-sm text-yellow-700">Stock Bajo</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-600">{totals.critico}</div>
          <div className="text-sm text-red-700">Stock Crítico</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-gray-600">{totals.sinStock}</div>
          <div className="text-sm text-gray-700">Sin Stock</div>
        </div>
      </div>
    </div>
  );
}