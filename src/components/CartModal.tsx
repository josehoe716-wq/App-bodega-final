import React from "react";
import { X, Trash2, Check } from "lucide-react";
import { InventoryItem } from "../types/inventory";

interface CartItem {
  item: InventoryItem;
  cantidad: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: number) => void;
  onConfirm: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onRemove,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Carrito de Materiales
        </h2>

        {cart.length === 0 ? (
          <p className="text-slate-600 text-center py-6">
            No hay materiales en el carrito
          </p>
        ) : (
          <div className="space-y-4">
            {cart.map((ci) => (
              <div
                key={ci.item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium text-slate-800">{ci.item.nombre}</p>
                  <p className="text-sm text-slate-500">
                    Cantidad: {ci.cantidad}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(ci.item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
          >
            Cerrar
          </button>
          {cart.length > 0 && (
            <button
              onClick={onConfirm}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar salida</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
