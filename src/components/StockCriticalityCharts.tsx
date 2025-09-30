import React from "react";
import { InventoryItem } from "../types/inventory";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export const StockCriticalityCharts = ({ items }: { items: InventoryItem[] }) => {
  const data = [
    { name: "Stock Crítico", value: items.filter(i => i.stock <= (i.puntoPedido || 5) / 2 && i.stock > 0).length },
    { name: "Stock Bajo", value: items.filter(i => i.stock <= (i.puntoPedido || 5) && i.stock > (i.puntoPedido || 5) / 2).length },
    { name: "Stock Cero", value: items.filter(i => i.stock === 0).length },
    { name: "Normal", value: items.filter(i => i.stock > (i.puntoPedido || 5)).length }
  ];

  const COLORS = ["#f87171", "#fbbf24", "#9ca3af", "#34d399"];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado de Stock</h3>
      <PieChart width={400} height={300}>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};
