import React, { useState, useEffect } from 'react';
import { History, Download, Filter, Calendar, Search, Trash2, User, Building, Package, Eye } from 'lucide-react';
import { CartExit } from '../types/materialExit';
import { cartExitApi } from '../services/materialExitApi';
import * as XLSX from 'xlsx';

export function CartHistoryTab() {
  const [cartExits, setCartExits] = useState<CartExit[]>([]);
  const [filteredExits, setFilteredExits] = useState<CartExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedExit, setExpandedExit] = useState<number | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [personFilter, setPersonFilter] = useState('');

  useEffect(() => {
    loadCartExits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cartExits, searchTerm, dateFrom, dateTo, personFilter]);

  const loadCartExits = async () => {
    try {
      setLoading(true);
      const data = await cartExitApi.getAll();
      setCartExits(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading cart exits:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cartExits];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(exit =>
        exit.registryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.personLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.materials.some(material => 
          material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.materialCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtro por fechas
    if (dateFrom) {
      filtered = filtered.filter(exit => exit.exitDate >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(exit => exit.exitDate <= dateTo);
    }

    // Filtro por persona
    if (personFilter) {
      filtered = filtered.filter(exit =>
        `${exit.personName} ${exit.personLastName}`.toLowerCase().includes(personFilter.toLowerCase())
      );
    }

    setFilteredExits(filtered);
  };

  const handleDeleteExit = async (exitId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro de salida del carrito?')) {
      return;
    }

    try {
      setDeletingId(exitId);
      await cartExitApi.delete(exitId);
      await loadCartExits();
    } catch (error) {
      console.error('Error deleting cart exit:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportToExcel = () => {
    if (filteredExits.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const exportData: any[] = [];
    
    filteredExits.forEach(exit => {
      exit.materials.forEach(material => {
        exportData.push({
          'Código de Registro': exit.registryCode,
          'Fecha': exit.exitDate,
          'Hora': exit.exitTime,
          'Tipo Material': material.materialType,
          'Nombre Material': material.materialName,
          'Código Material': material.materialCode,
          'Ubicación': material.materialLocation,
          'Cantidad': material.quantity,
          'Stock Restante': material.remainingStock,
          'Persona': `${exit.personName} ${exit.personLastName}`,
          'Área': exit.area,
          'CECO': exit.ceco || '',
          'Código SAP': exit.sapCode || '',
          'Orden de Trabajo': exit.workOrder || ''
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial Salidas Carrito');
    
    const fileName = `historial_salidas_carrito_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setPersonFilter('');
  };

  const toggleExpandExit = (exitId: number) => {
    setExpandedExit(expandedExit === exitId ? null : exitId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historial de Salidas del Carrito</h2>
          <p className="text-slate-600">Registro completo de salidas múltiples de materiales</p>
        </div>
        <button
          onClick={handleExportToExcel}
          disabled={filteredExits.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Exportar Excel</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda general */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Búsqueda general
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Código, material, persona..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Persona */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Persona
            </label>
            <input
              type="text"
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              placeholder="Nombre o apellido"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-slate-600">
            Mostrando {filteredExits.length} de {cartExits.length} registros
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de salidas del carrito */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Cargando historial...</span>
          </div>
        ) : filteredExits.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay salidas del carrito</h3>
            <p className="text-slate-600">
              {cartExits.length === 0 
                ? 'No se han registrado salidas del carrito aún'
                : 'No hay salidas que coincidan con los filtros aplicados'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredExits.map((exit) => (
              <div key={exit.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-lg font-bold text-purple-600">#{exit.registryCode}</span>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                          CARRITO
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{exit.exitDate} - {exit.exitTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{exit.personName} {exit.personLastName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{exit.area}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">{exit.totalItems} tipos</div>
                      <div className="text-sm text-slate-600">{exit.totalQuantity} unidades</div>
                    </div>
                    
                    <button
                      onClick={() => toggleExpandExit(exit.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteExit(exit.id)}
                      disabled={deletingId === exit.id}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar registro"
                    >
                      {deletingId === exit.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Información adicional */}
                {(exit.ceco || exit.sapCode || exit.workOrder) && (
                  <div className="mb-4 text-sm text-slate-600">
                    {exit.ceco && <span>CECO: {exit.ceco} • </span>}
                    {exit.sapCode && <span>SAP: {exit.sapCode} • </span>}
                    {exit.workOrder && <span>OT: {exit.workOrder}</span>}
                  </div>
                )}

                {/* Detalles expandibles */}
                {expandedExit === exit.id && (
                  <div className="mt-4 bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Materiales incluidos:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exit.materials.map((material, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              material.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {material.materialType}
                            </span>
                            <span className="text-xs text-slate-500">#{material.materialCode}</span>
                          </div>
                          <h5 className="font-medium text-slate-900 mb-1">{material.materialName}</h5>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Ubicación: {material.materialLocation}</span>
                            <span className="font-semibold">Cantidad: {material.quantity}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Stock restante: {material.remainingStock}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}