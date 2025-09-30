import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types/inventory';
import { TrendingUp } from 'lucide-react';

interface StockTrendsChartProps {
  items: InventoryItem[];
}

export function StockTrendsChart({ items }: StockTrendsChartProps) {
  // Agrupar por categorías y calcular estadísticas
  const categoryStats = items.reduce((acc, item) => {
    const category = item.categoria || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = {
        name: category,
        total: 0,
        critico: 0,
        bajo: 0,
        normal: 0,
        items: 0
      };
    }
    
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    
    acc[category].total += item.stock;
    acc[category].items += 1;
    
    if (item.stock <= criticalThreshold) {
      acc[category].critico += 1;
    } else if (item.stock <= puntoPedido) {
      acc[category].bajo += 1;
    } else {
      acc[category].normal += 1;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(categoryStats).map((cat: any) => ({
    categoria: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
    'Stock Normal': cat.normal,
    'Stock Bajo': cat.bajo,
    'Stock Crítico': cat.critico,
    'Total Items': cat.items
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tendencias de Stock por Categoría</h3>
          <p className="text-sm text-slate-600">Distribución de niveles de stock por categoría</p>
        </div>
      </div>
      
      <div className="h-80">
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
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Categoría: ${label}`}
            />
            <Legend />
            <Bar dataKey="Stock Normal" stackId="a" fill="#10b981" />
            <Bar dataKey="Stock Bajo" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Stock Crítico" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {chartData.reduce((sum, item) => sum + item['Stock Normal'], 0)}
          </div>
          <div className="text-sm text-green-700">Stock Normal</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">
            {chartData.reduce((sum, item) => sum + item['Stock Bajo'], 0)}
          </div>
          <div className="text-sm text-yellow-700">Stock Bajo</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {chartData.reduce((sum, item) => sum + item['Stock Crítico'], 0)}
          </div>
          <div className="text-sm text-red-700">Stock Crítico</div>
        </div>
      </div>
    </div>
  );
}