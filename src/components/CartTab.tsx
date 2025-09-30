import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Check, Package, Edit3 } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface CartTabProps {
  cartItems: InventoryItem[];
  onRemoveItem: (id: number) => void;
  onConfirmExit: (items: CartItem[]) => void;
  onClearCart: () => void;
}

export function CartTab({ cartItems, onRemoveItem, onConfirmExit, onClearCart }: CartTabProps) {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar cantidades
  React.useEffect(() => {
    const initialQuantities: { [key: number]: number } = {};
    cartItems.forEach(item => {
      if (!quantities[item.id]) {
        initialQuantities[item.id] = 1;
      }
    });
    setQuantities(prev => ({ ...prev, ...initialQuantities }));
  }, [cartItems]);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item && newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    const cartItemsWithQuantities: CartItem[] = cartItems.map(item => ({
      item,
      quantity: quantities[item.id] || 1
    }));
    
    try {
      await onConfirmExit(cartItemsWithQuantities);
    } catch (error) {
      console.error('Error processing cart:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (quantities[item.id] || 1), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Carrito de Materiales</h2>
          <p className="text-slate-600">
            {cartItems.length} tipo{cartItems.length !== 1 ? 's' : ''} de material{cartItems.length !== 1 ? 'es' : ''}, 
            {' '}{totalItems} unidad{totalItems !== 1 ? 'es' : ''} total{totalItems !== 1 ? 'es' : ''}
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Vaciar Carrito</span>
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Carrito vacío</h3>
          <p className="text-slate-600 mb-4">
            Agrega materiales al carrito desde el inventario para registrar una salida múltiple
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Ve al inventario y usa el botón "Carrito" en cada material 
              que quieras incluir en una salida múltiple.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lista de materiales en el carrito */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Materiales en el carrito</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {cartItems.map((item) => {
                const quantity = quantities[item.id] || 1;
                const maxQuantity = item.stock;
                
                return (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            item.tipo === 'ERSA' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <Package className={`h-5 w-5 ${
                              item.tipo === 'ERSA' ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                item.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.tipo}
                              </span>
                              <span className="text-xs text-slate-500">#{item.codigo}</span>
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-1">{item.nombre}</h4>
                            <p className="text-sm text-slate-600">
                              Ubicación: {item.ubicacion} | Stock disponible: {item.stock} {item.unidad}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Control de cantidad */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-slate-700">Cantidad:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              disabled={quantity <= 1}
                              className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="relative">
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                min="1"
                                max={maxQuantity}
                                className="w-16 text-center font-medium border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <button
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              disabled={quantity >= maxQuantity}
                              className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen y acciones */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Resumen del carrito</h3>
                <p className="text-slate-600">
                  {cartItems.length} tipo{cartItems.length !== 1 ? 's' : ''} de material{cartItems.length !== 1 ? 'es' : ''} • {totalItems} unidad{totalItems !== 1 ? 'es' : ''} total{totalItems !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{totalItems}</div>
                <div className="text-sm text-slate-600">Unidades totales</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClearCart}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors font-medium"
              >
                Vaciar Carrito
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirmar Salida</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}