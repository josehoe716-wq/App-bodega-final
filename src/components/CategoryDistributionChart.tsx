import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types/inventory';
import { Package } from 'lucide-react';

interface CategoryDistributionChartProps {
  items: InventoryItem[];
}

export function CategoryDistributionChart({ items }: CategoryDistributionChartProps) {
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

  // Agrupar por categorías y calcular estadísticas
  const categoryStats = items.reduce((acc, item) => {
    const category = item.categoria || determineCategory(item);
    if (!acc[category]) {
      acc[category] = {
        categoria: category,
        'Cantidad de Materiales': 0,
        'Stock Total': 0
      };
    }
    
    acc[category]['Cantidad de Materiales'] += 1;
    acc[category]['Stock Total'] += item.stock;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(categoryStats);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <Package className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Distribución por Categoría</h3>
          <p className="text-sm text-slate-600">Cantidad de materiales y stock por categoría</p>
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
              label={{ value: 'Categorías', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Categoría: ${label}`}
            />
            <Legend />
            <Bar dataKey="Cantidad de Materiales" fill="#3b82f6" name="Tipos de Materiales" />
            <Bar dataKey="Stock Total" fill="#10b981" name="Stock Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {chartData.reduce((sum, item) => sum + item['Cantidad de Materiales'], 0)}
          </div>
          <div className="text-sm text-blue-700">Tipos de Materiales</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {chartData.reduce((sum, item) => sum + item['Stock Total'], 0).toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Stock Total</div>
        </div>
      </div>
    </div>
  );
}