import React, { useState } from 'react';
import { Search, Filter, Zap, X, ChevronDown } from 'lucide-react';

interface AdvancedSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  stockFilter: 'all' | 'low' | 'critical' | 'zero';
  onFilterChange: (filter: 'all' | 'low' | 'critical' | 'zero') => void;
  onExportZeroStock?: () => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  codeFilter: string;
  onCodeFilterChange: (value: string) => void;
}

export function AdvancedSearchBar({ 
  searchTerm, 
  onSearchChange, 
  stockFilter, 
  onFilterChange, 
  onExportZeroStock,
  nameFilter,
  onNameFilterChange,
  locationFilter,
  onLocationFilterChange,
  codeFilter,
  onCodeFilterChange
}: AdvancedSearchBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const clearAllFilters = () => {
    onSearchChange('');
    onNameFilterChange('');
    onLocationFilterChange('');
    onCodeFilterChange('');
    onFilterChange('all');
  };

  const hasActiveFilters = searchTerm || nameFilter || locationFilter || codeFilter || stockFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Búsqueda principal */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Búsqueda general... (usa * para búsqueda avanzada, ej: *Tuerca*M8*)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        {searchTerm.includes('*') && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Zap className="h-4 w-4 text-yellow-500" title="Búsqueda con comodines activa" />
          </div>
        )}
      </div>

      {/* Controles de filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Filter className="h-4 w-4 text-slate-600" />
          
          {/* Filtro de stock */}
          <select
            value={stockFilter}
            onChange={(e) => onFilterChange(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
          >
            <option value="all">Todos los niveles</option>
            <option value="low">Stock bajo (≤ Punto Pedido)</option>
            <option value="critical">Stock crítico (≤ 50% Punto Pedido)</option>
            <option value="zero">Sin stock (0)</option>
          </select>

          {/* Botón filtros avanzados */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>Filtros avanzados</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Botón exportar */}
        {stockFilter === 'zero' && onExportZeroStock && (
          <button
            onClick={onExportZeroStock}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>📊</span>
            <span>Exportar Excel</span>
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-slate-900 mb-3">Filtros Específicos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="nameFilter" className="block text-sm font-medium text-slate-700 mb-1">
                Filtrar por Nombre
              </label>
              <input
                type="text"
                id="nameFilter"
                value={nameFilter}
                onChange={(e) => onNameFilterChange(e.target.value)}
                placeholder="Ej: Perno, Tuerca..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="locationFilter" className="block text-sm font-medium text-slate-700 mb-1">
                Filtrar por Ubicación
              </label>
              <input
                type="text"
                id="locationFilter"
                value={locationFilter}
                onChange={(e) => onLocationFilterChange(e.target.value)}
                placeholder="Ej: AT1-A01, Estante B2..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="codeFilter" className="block text-sm font-medium text-slate-700 mb-1">
                Filtrar por Código
              </label>
              <input
                type="text"
                id="codeFilter"
                value={codeFilter}
                onChange={(e) => onCodeFilterChange(e.target.value)}
                placeholder="Ej: 101291876..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>
          
          <div className="text-xs text-slate-600">
            <p>💡 <strong>Tip:</strong> Los filtros específicos se combinan con la búsqueda general para resultados más precisos.</p>
          </div>
        </div>
      )}
    </div>
  );
}