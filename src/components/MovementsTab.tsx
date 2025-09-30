import React, { useState, useEffect } from 'react';
import { History, Download, Filter, Calendar, Search, Trash2, User, Building, Package, Settings } from 'lucide-react';
import { MaterialExit } from '../types/materialExit';
import { materialExitApi } from '../services/materialExitApi';
import { CartExitManagementModal } from './CartExitManagementModal';
import * as XLSX from 'xlsx';

export function MovementsTab() {
  const [exits, setExits] = useState<MaterialExit[]>([]);
  const [filteredExits, setFilteredExits] = useState<MaterialExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCartManagementOpen, setIsCartManagementOpen] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState<'all' | 'ERSA' | 'UNBW'>('all');
  const [personFilter, setPersonFilter] = useState('');

  useEffect(() => {
    loadExits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exits, searchTerm, dateFrom, dateTo, materialTypeFilter, personFilter]);

  const loadExits = async () => {
    try {
      setLoading(true);
      const data = await materialExitApi.getAll();
      setExits(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading exits:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exits];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(exit =>
        exit.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.personLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por fechas
    if (dateFrom) {
      filtered = filtered.filter(exit => exit.exitDate >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(exit => exit.exitDate <= dateTo);
    }

    // Filtro por tipo de material
    if (materialTypeFilter !== 'all') {
      filtered = filtered.filter(exit => exit.materialType === materialTypeFilter);
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
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro de movimiento?')) {
      return;
    }

    try {
      setDeletingId(exitId);
      await materialExitApi.delete(exitId);
      await loadExits();
    } catch (error) {
      console.error('Error deleting exit:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportToExcel = () => {
    if (filteredExits.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const exportData = filteredExits.map(exit => ({
      'Fecha': exit.exitDate,
      'Hora': exit.exitTime,
      'Tipo Material': exit.materialType,
      'Nombre Material': exit.materialName,
      'Código': exit.materialCode,
      'Ubicación': exit.materialLocation,
      'Cantidad': exit.quantity,
      'Stock Restante': exit.remainingStock,
      'Persona': `${exit.personName} ${exit.personLastName}`,
      'Área': exit.area,
      'CECO': exit.ceco || '',
      'Código SAP': exit.sapCode || '',
      'Orden de Trabajo': exit.workOrder || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial de Movimientos');
    
    const fileName = `historial_movimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setMaterialTypeFilter('all');
    setPersonFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historial de Movimientos</h2>
          <p className="text-slate-600">Registro completo de salidas de materiales</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCartManagementOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Gestionar Salidas del Carrito</span>
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={filteredExits.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                placeholder="Material, persona, área..."
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

          {/* Tipo de material */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de material
            </label>
            <select
              value={materialTypeFilter}
              onChange={(e) => setMaterialTypeFilter(e.target.value as 'all' | 'ERSA' | 'UNBW')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="ERSA">ERSA</option>
              <option value="UNBW">UNBW</option>
            </select>
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
            Mostrando {filteredExits.length} de {exits.length} registros
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Cargando movimientos...</span>
          </div>
        ) : filteredExits.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay movimientos</h3>
            <p className="text-slate-600">
              {exits.length === 0 
                ? 'No se han registrado movimientos aún'
                : 'No hay movimientos que coincidan con los filtros aplicados'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Persona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredExits.map((exit) => (
                  <tr key={exit.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{exit.exitDate}</div>
                          <div className="text-sm text-slate-500">{exit.exitTime}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Package className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              exit.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {exit.materialType}
                            </span>
                            <span className="text-sm font-medium text-slate-900">{exit.materialName}</span>
                          </div>
                          <div className="text-sm text-slate-500">
                            Código: {exit.materialCode} • {exit.materialLocation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600">-{exit.quantity}</div>
                      <div className="text-sm text-slate-500">Stock: {exit.remainingStock}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {exit.personName} {exit.personLastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{exit.area}</div>
                          <div className="text-sm text-slate-500">
                            {exit.ceco && `CECO: ${exit.ceco}`}
                            {exit.workOrder && ` • OT: ${exit.workOrder}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CartExitManagementModal
        isOpen={isCartManagementOpen}
        onClose={() => setIsCartManagementOpen(false)}
      />
    </div>
  );
}