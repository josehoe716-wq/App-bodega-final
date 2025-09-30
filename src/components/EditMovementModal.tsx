import React, { useState } from 'react';
import { X, Save, Package, User, Building, Calendar } from 'lucide-react';
import { MaterialExit, CartExit } from '../types/materialExit';

interface EditMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMovement: any) => void;
  movement: any | null;
  isSaving: boolean;
}

export function EditMovementModal({ isOpen, onClose, onSave, movement, isSaving }: EditMovementModalProps) {
  const [formData, setFormData] = useState({
    personName: movement?.personName || '',
    personLastName: movement?.personLastName || '',
    area: movement?.area || '',
    ceco: movement?.ceco || '',
    sapCode: movement?.sapCode || '',
    workOrder: movement?.workOrder || '',
    quantity: movement?.quantity || movement?.totalQuantity || 0,
  });

  const [errors, setErrors] = useState<any>({});

  React.useEffect(() => {
    if (movement) {
      setFormData({
        personName: movement.personName || '',
        personLastName: movement.personLastName || '',
        area: movement.area || '',
        ceco: movement.ceco || '',
        sapCode: movement.sapCode || '',
        workOrder: movement.workOrder || '',
        quantity: movement.quantity || movement.totalQuantity || 0,
      });
    }
  }, [movement]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.personName.trim()) {
      newErrors.personName = 'El nombre es requerido';
    }

    if (!formData.personLastName.trim()) {
      newErrors.personLastName = 'El apellido es requerido';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'El área es requerida';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedMovement = {
      ...movement,
      ...formData,
    };

    onSave(updatedMovement);
  };

  const handleInputChange = (field: string, value: string | number) => {
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
      quantity: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !movement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Editar Movimiento</h2>
              <p className="text-sm text-slate-600">
                {movement.type === 'single' ? 'Movimiento Individual' : `Carrito #${movement.registryCode}`}
              </p>
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
          {/* Información del material/carrito (solo lectura) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Información del {movement.type === 'single' ? 'Material' : 'Carrito'}</span>
            </h3>
            {movement.type === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Material:</span>
                  <p className="text-slate-900">{movement.materialName}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Código:</span>
                  <p className="text-slate-900">{movement.materialCode}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Ubicación:</span>
                  <p className="text-slate-900">{movement.materialLocation}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Tipo:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    movement.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {movement.materialType}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Código de Registro:</span>
                  <p className="text-slate-900">#{movement.registryCode}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Tipos de Materiales:</span>
                  <p className="text-slate-900">{movement.totalItems}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Cantidad Total:</span>
                  <p className="text-slate-900">{movement.totalQuantity} unidades</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Fecha:</span>
                  <p className="text-slate-900">{movement.date} - {movement.time}</p>
                </div>
              </div>
            )}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Ej: SAP123456"
                />
              </div>

              <div>
                <label htmlFor="workOrder" className="block text-sm font-medium text-slate-700 mb-2">
                  OT (Orden de Trabajo)
                </label>
                <input
                  type="text"
                  id="workOrder"
                  value={formData.workOrder}
                  onChange={(e) => handleInputChange('workOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Ej: OT202401001"
                />
              </div>
            </div>
          </div>

          {/* Cantidad (solo para movimientos individuales) */}
          {movement.type === 'single' && (
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Cantidad</span>
              </h3>
              <div className="max-w-xs">
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.quantity ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}