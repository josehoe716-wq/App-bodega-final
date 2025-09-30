import React, { useState } from 'react';
import { X, ShoppingCart, Package, User, Building, Hash, Calendar } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { NewCartExit } from '../types/materialExit';

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface MultiMaterialExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (exitData: NewCartExit, items: CartItem[]) => void;
  cartItems: CartItem[];
  isProcessing: boolean;
}

export function MultiMaterialExitModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cartItems, 
  isProcessing,
}: MultiMaterialExitModalProps) {
  const [formData, setFormData] = useState<NewCartExit>({
    personName: '',
    personLastName: '',
    area: '',
    ceco: '',
    sapCode: '',
    workOrder: '',
    materials: []
  });

  const [errors, setErrors] = useState<Partial<NewCartExit>>({});

  const validateForm = () => {
    const newErrors: Partial<NewCartExit> = {};

    if (!formData.personName.trim()) {
      newErrors.personName = 'El nombre es requerido';
    }

    if (!formData.personLastName.trim()) {
      newErrors.personLastName = 'El apellido es requerido';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'El área es requerida';
    }

    // Verificar si hay materiales ERSA que requieren OT
    const hasERSAMaterials = cartItems.some(item => item.item.tipo === 'ERSA');
    if (hasERSAMaterials && !formData.workOrder?.trim()) {
      newErrors.workOrder = 'La Orden de Trabajo es obligatoria cuando hay materiales ERSA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onConfirm(formData, cartItems);
  };

  const handleInputChange = (field: keyof NewCartExit, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setFormData({
      personName: '',
      personLastName: '',
      area: '',
      ceco: '',
      sapCode: '',
      workOrder: '',
      materials: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('es-ES');
  const currentTime = new Date().toLocaleTimeString('es-ES');
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasERSAMaterials = cartItems.some(item => item.item.tipo === 'ERSA');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Registrar Salida Múltiple</h2>
              <p className="text-sm text-slate-600">Se generará un código de registro automáticamente</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resumen de materiales */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Materiales a Retirar ({cartItems.length} tipos, {totalItems} unidades)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {cartItems.map((cartItem) => (
                <div key={cartItem.item.id} className="bg-white border border-slate-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      cartItem.item.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {cartItem.item.tipo}
                    </span>
                    <span className="text-xs text-slate-500">#{cartItem.item.codigo}</span>
                  </div>
                  <h4 className="font-medium text-slate-900 text-sm mb-1">{cartItem.item.nombre}</h4>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Ubicación: {cartItem.item.ubicacion}</span>
                    <span className="font-semibold">Cantidad: {cartItem.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-slate-600">
              <span>Fecha y Hora: {currentDate} - {currentTime}</span>
            </div>
          </div>

          {/* Datos de la Persona */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Datos de la Persona</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="personName" className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="personName"
                  value={formData.personName}
                  onChange={(e) => handleInputChange('personName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.personName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Juan"
                />
                {errors.personName && <p className="mt-1 text-sm text-red-600">{errors.personName}</p>}
              </div>

              <div>
                <label htmlFor="personLastName" className="block text-sm font-medium text-slate-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="personLastName"
                  value={formData.personLastName}
                  onChange={(e) => handleInputChange('personLastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.personLastName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Pérez"
                />
                {errors.personLastName && <p className="mt-1 text-sm text-red-600">{errors.personLastName}</p>}
              </div>
            </div>
          </div>

          {/* Datos del Destino */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Datos del Destino</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-2">
                  Área *
                </label>
                <input
                  type="text"
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.area ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Producción, Mantenimiento"
                />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
              </div>

              <div>
                <label htmlFor="ceco" className="block text-sm font-medium text-slate-700 mb-2">
                  CECO (Centro de Costos)
                </label>
                <input
                  type="text"
                  id="ceco"
                  value={formData.ceco}
                  onChange={(e) => handleInputChange('ceco', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Ej: CC001"
                />
              </div>

              <div>
                <label htmlFor="sapCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Código SAP
                </label>
                <input
                  type="text"
                  id="sapCode"
                  value={formData.sapCode}
                  onChange={(e) => handleInputChange('sapCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Ej: SAP123456"
                />
              </div>

              <div>
                <label htmlFor="workOrder" className="block text-sm font-medium text-slate-700 mb-2">
                  OT (Orden de Trabajo) {hasERSAMaterials && '*'}
                </label>
                <input
                  type="text"
                  id="workOrder"
                  value={formData.workOrder}
                  onChange={(e) => handleInputChange('workOrder', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.workOrder ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: OT202401001"
                />
                {hasERSAMaterials && (
                  <p className="mt-1 text-xs text-orange-600">
                    * Obligatorio para materiales ERSA
                  </p>
                )}
                {errors.workOrder && <p className="mt-1 text-sm text-red-600">{errors.workOrder}</p>}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Registrar Salida</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}