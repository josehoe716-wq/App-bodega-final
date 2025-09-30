import React, { useState } from "react";
import { X, Trash2, Check, Plus, Minus, ShoppingCart } from "lucide-react";
import { InventoryItem } from "../types/inventory";

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: InventoryItem[];
  onRemoveItem: (id: number) => void;
  onConfirmExit?: (items: CartItem[]) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onConfirmExit,
}) => {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar cantidades cuando se abra el modal
  React.useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      const initialQuantities: { [key: number]: number } = {};
      cartItems.forEach(item => {
        if (!quantities[item.id]) {
          initialQuantities[item.id] = 1;
        }
      });
      setQuantities(prev => ({ ...prev, ...initialQuantities }));
    }
  }, [isOpen, cartItems]);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item && newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    }
  };

  const handleConfirm = async () => {
    if (!onConfirmExit) return;
    
    setIsProcessing(true);
    const cartItemsWithQuantities: CartItem[] = cartItems.map(item => ({
      item,
      quantity: quantities[item.id] || 1
    }));
    
    try {
      await onConfirmExit(cartItemsWithQuantities);
      setQuantities({});
      onClose();
    } catch (error) {
      console.error('Error processing cart:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setQuantities({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Carrito de Materiales ({cartItems.length})
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Carrito vacío
              </h3>
              <p className="text-slate-600">
                Agrega materiales al carrito para registrar una salida
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const quantity = quantities[item.id] || 1;
                const maxQuantity = item.stock;
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          item.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.tipo}
                        </span>
                        <span className="text-xs text-slate-500">#{item.codigo}</span>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-1">{item.nombre}</h4>
                      <p className="text-sm text-slate-600">
                        Ubicación: {item.ubicacion} | Stock disponible: {item.stock} {item.unidad}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Control de cantidad */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          disabled={quantity <= 1}
                          className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          disabled={quantity >= maxQuantity}
                          className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
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
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-800 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          {cartItems.length > 0 && onConfirmExit && (
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
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
          )}
        </div>
      </div>
    </div>
  );
};