import React, { useState, useEffect } from 'react';
import { History, Download, Filter, Calendar, Search, Trash2, User, Building, Package, Settings, Edit } from 'lucide-react';
import { MaterialExit, CartExit } from '../types/materialExit';
import { materialExitApi, cartExitApi } from '../services/materialExitApi';
import { CartExitManagementModal } from './CartExitManagementModal';
import { EditMovementModal } from './EditMovementModal';
import * as XLSX from 'xlsx';

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

export function MovementsTab() {
  const [exits, setExits] = useState<MaterialExit[]>([]);
  const [cartExits, setCartExits] = useState<CartExit[]>([]);
  const [unifiedMovements, setUnifiedMovements] = useState<UnifiedMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<UnifiedMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingType, setDeletingType] = useState<'single' | 'cart' | null>(null);
  const [isCartManagementOpen, setIsCartManagementOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<UnifiedMovement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'single' | 'cart'>('all');
  const [personFilter, setPersonFilter] = useState('');

  useEffect(() => {
    loadAllMovements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [unifiedMovements, searchTerm, dateFrom, dateTo, movementTypeFilter, personFilter]);

  const loadAllMovements = async () => {
    try {
      setLoading(true);
      const [singleExits, cartExitsData] = await Promise.all([
        materialExitApi.getAll(),
        cartExitApi.getAll()
      ]);
      
      setExits(singleExits);
      setCartExits(cartExitsData);
      
      // Convertir a formato unificado
      const unifiedSingle: UnifiedMovement[] = singleExits.map(exit => ({
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
      
      const unifiedCart: UnifiedMovement[] = cartExitsData.map(exit => ({
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
      
      const allMovements = [...unifiedSingle, ...unifiedCart];
      allMovements.sort((a, b) => {
        const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
        return dateTimeB - dateTimeA;
      });
      
      setUnifiedMovements(allMovements);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...unifiedMovements];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(exit =>
        (exit.materialName && exit.materialName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exit.materialCode && exit.materialCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exit.registryCode && exit.registryCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exit.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.personLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por fechas
    if (dateFrom) {
      filtered = filtered.filter(exit => exit.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(exit => exit.date <= dateTo);
    }

    // Filtro por tipo de movimiento
    if (movementTypeFilter !== 'all') {
      filtered = filtered.filter(exit => exit.type === movementTypeFilter);
    }

    // Filtro por persona
    if (personFilter) {
      filtered = filtered.filter(exit =>
        `${exit.personName} ${exit.personLastName}`.toLowerCase().includes(personFilter.toLowerCase())
      );
    }

    setFilteredMovements(filtered);
  };

  const handleEditMovement = (movement: UnifiedMovement) => {
    setEditingMovement(movement);
    setIsEditModalOpen(true);
  };

  const handleSaveMovement = async (updatedMovement: any) => {
    try {
      setIsSaving(true);

      if (updatedMovement.type === 'single') {
        await materialExitApi.update(updatedMovement.originalId, {
          personName: updatedMovement.personName,
          personLastName: updatedMovement.personLastName,
          area: updatedMovement.area,
          ceco: updatedMovement.ceco,
          sapCode: updatedMovement.sapCode,
          workOrder: updatedMovement.workOrder,
          quantity: updatedMovement.quantity,
        });
      } else {
        await cartExitApi.update(updatedMovement.originalId, {
          personName: updatedMovement.personName,
          personLastName: updatedMovement.personLastName,
          area: updatedMovement.area,
          ceco: updatedMovement.ceco,
          sapCode: updatedMovement.sapCode,
          workOrder: updatedMovement.workOrder,
        });
      }

      await loadAllMovements();
      setIsEditModalOpen(false);
      setEditingMovement(null);
    } catch (error) {
      console.error('Error updating movement:', error);
      alert('Error al actualizar el movimiento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMovement = async (movement: UnifiedMovement) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return;
    }

    try {
      setDeletingId(movement.originalId);
      setDeletingType(movement.type);

      if (movement.type === 'single') {
        await materialExitApi.delete(movement.originalId);
      } else {
        await cartExitApi.delete(movement.originalId);
      }

      await loadAllMovements();
    } catch (error) {
      console.error('Error deleting movement:', error);
    } finally {
      setDeletingId(null);
      setDeletingType(null);
    }
  };

  const handleExportToExcel = () => {
    if (filteredMovements.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const exportData: any[] = [];
    
    filteredMovements.forEach(movement => {
      if (movement.type === 'single') {
        exportData.push({
          'Tipo Movimiento': 'Individual',
          'Código Registro': '',
          'Fecha': movement.date,
          'Hora': movement.time,
          'Tipo Material': movement.materialType,
          'Nombre Material': movement.materialName,
          'Código Material': movement.materialCode,
          'Ubicación': movement.materialLocation,
          'Cantidad': movement.quantity,
          'Stock Restante': movement.remainingStock,
          'Persona': `${movement.personName} ${movement.personLastName}`,
          'Área': movement.area,
          'CECO': movement.ceco || '',
          'Código SAP': movement.sapCode || '',
          'Orden de Trabajo': movement.workOrder || ''
        });
      } else {
        // Para movimientos del carrito, crear una fila por cada material
        movement.materials?.forEach(material => {
          exportData.push({
            'Tipo Movimiento': 'Carrito',
            'Código Registro': movement.registryCode,
            'Fecha': movement.date,
            'Hora': movement.time,
            'Tipo Material': material.materialType,
            'Nombre Material': material.materialName,
            'Código Material': material.materialCode,
            'Ubicación': material.materialLocation,
            'Cantidad': material.quantity,
            'Stock Restante': material.remainingStock,
            'Persona': `${movement.personName} ${movement.personLastName}`,
            'Área': movement.area,
            'CECO': movement.ceco || '',
            'Código SAP': movement.sapCode || '',
            'Orden de Trabajo': movement.workOrder || ''
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Todos los Movimientos');
    
    const fileName = `historial_completo_movimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setMovementTypeFilter('all');
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
            disabled={filteredMovements.length === 0}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                placeholder="Material, código, persona..."
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

          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de movimiento
            </label>
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value as 'all' | 'single' | 'cart')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="single">Individual</option>
              <option value="cart">Carrito</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-slate-600">
            Mostrando {filteredMovements.length} de {unifiedMovements.length} registros
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Cargando movimientos...</span>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay movimientos</h3>
            <p className="text-slate-600">
              {unifiedMovements.length === 0 
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
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Detalles
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
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        movement.type === 'single' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {movement.type === 'single' ? 'Individual' : 'Carrito'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{movement.date}</div>
                          <div className="text-sm text-slate-500">{movement.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {movement.type === 'single' ? (
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                movement.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {movement.materialType}
                              </span>
                              <span className="text-sm font-medium text-slate-900">{movement.materialName}</span>
                            </div>
                            <div className="text-sm text-slate-500">
                              Código: {movement.materialCode} • {movement.materialLocation}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-purple-400" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              Código: #{movement.registryCode}
                            </div>
                            <div className="text-sm text-slate-500">
                              {movement.totalItems} tipos de materiales
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.type === 'single' ? (
                        <div>
                          <div className="text-sm font-semibold text-red-600">-{movement.quantity}</div>
                          <div className="text-sm text-slate-500">Stock: {movement.remainingStock}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-semibold text-purple-600">{movement.totalQuantity} unidades</div>
                          <div className="text-sm text-slate-500">{movement.totalItems} tipos</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {movement.personName} {movement.personLastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{movement.area}</div>
                          <div className="text-sm text-slate-500">
                            {movement.ceco && `CECO: ${movement.ceco}`}
                            {movement.workOrder && ` • OT: ${movement.workOrder}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMovement(movement)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar registro"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovement(movement)}
                          disabled={deletingId === movement.originalId && deletingType === movement.type}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar registro"
                        >
                          {deletingId === movement.originalId && deletingType === movement.type ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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

      <EditMovementModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMovement(null);
        }}
        onSave={handleSaveMovement}
        movement={editingMovement}
        isSaving={isSaving}
      />
    </div>
  );
}