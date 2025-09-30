import React, { useState, useEffect } from 'react';
import { X, Package, User, Building, Calendar, Edit3, Save, Trash2, Eye } from 'lucide-react';
import { CartExit } from '../types/materialExit';
import { cartExitApi } from '../services/materialExitApi';

interface CartExitManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartExitManagementModal({ isOpen, onClose }: CartExitManagementModalProps) {
  const [cartExits, setCartExits] = useState<CartExit[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingExit, setEditingExit] = useState<CartExit | null>(null);
  const [expandedExit, setExpandedExit] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCartExits();
    }
  }, [isOpen]);

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

  const handleDeleteExit = async (exitId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro de salida?')) {
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

  const toggleExpandExit = (exitId: number) => {
    setExpandedExit(expandedExit === exitId ? null : exitId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gestión de Salidas del Carrito</h2>
              <p className="text-sm text-slate-600">Visualizar y editar registros de salidas múltiples</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-slate-600">Cargando registros...</span>
            </div>
          ) : cartExits.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay registros de salidas</h3>
              <p className="text-slate-600">No se han registrado salidas del carrito aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartExits.map((exit) => (
                <div key={exit.id} className="bg-slate-50 border border-slate-200 rounded-lg p-6">
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
                    <div className="mb-4 text-sm text-slate-600 bg-white p-3 rounded-lg">
                      {exit.ceco && <span className="mr-4">CECO: <strong>{exit.ceco}</strong></span>}
                      {exit.sapCode && <span className="mr-4">SAP: <strong>{exit.sapCode}</strong></span>}
                      {exit.workOrder && <span>OT: <strong>{exit.workOrder}</strong></span>}
                    </div>
                  )}

                  {/* Detalles expandibles */}
                  {expandedExit === exit.id && (
                    <div className="mt-4 bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-3">Materiales incluidos:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {exit.materials.map((material, index) => (
                          <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                material.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {material.materialType}
                              </span>
                              <span className="text-xs text-slate-500">#{material.materialCode}</span>
                            </div>
                            <h5 className="font-medium text-slate-900 mb-1 text-sm">{material.materialName}</h5>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Ubicación: {material.materialLocation}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold text-slate-900 mt-2">
                              <span>Cantidad: {material.quantity}</span>
                              <span>Stock restante: {material.remainingStock}</span>
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

        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}