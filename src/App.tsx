import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MovementsTab } from './components/MovementsTab';
import { ImportExportTab } from './components/ImportExportTab';
import { SettingsTab } from './components/SettingsTab';
import { CartTab } from './components/CartTab';
import { CartHistoryTab } from './components/CartHistoryTab';
import { InventoryTab } from './components/InventoryTab';
import { AuthModal } from './components/AuthModal';
import { MultiMaterialExitModal } from './components/MultiMaterialExitModal';
import { InventoryItem, NewInventoryItem } from './types/inventory';
import { inventoryApi } from './services/api';
import { cartExitApi } from './services/materialExitApi';
import { NewCartExit } from './types/materialExit';
import { registryApi } from "./services/registryApi";

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'Tecnico' | 'administrador' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Estados del carrito
  const [cartItems, setCartItems] = useState<InventoryItem[]>([]);
  const [isMultiExitModalOpen, setIsMultiExitModalOpen] = useState(false);
  const [isProcessingMultiExit, setIsProcessingMultiExit] = useState(false);

  useEffect(() => {
    if (userRole) {
      loadInventory();
      // Establecer pestaña inicial según el rol
      if (userRole === 'administrador') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('inventory');
      }
    }
  }, [userRole]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (newItem: NewInventoryItem) => {
    try {
      setIsAdding(true);
      await inventoryApi.create(newItem);
      await loadInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleImportItems = async (newItems: NewInventoryItem[]) => {
    try {
      setIsImporting(true);
      await inventoryApi.createBulk(newItems);
      await loadInventory();
    } catch (error) {
      console.error('Error importing items:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleLogin = (role: 'Tecnico' | 'administrador') => {
    setUserRole(role);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveTab('dashboard');
    setIsAuthModalOpen(true);
    setItems([]);
    setCartItems([]);
  };

  // Funciones del carrito
  const handleAddToCart = (item: InventoryItem) => {
    setCartItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCartConfirm = (items: CartItem[]) => {
    setIsMultiExitModalOpen(true);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleMultiMaterialExit = async (exitData: NewCartExit, cartItemsWithQuantities: CartItem[]) => {
    try {
      setIsProcessingMultiExit(true);
      
      // Crear la salida del carrito
      const materials = cartItemsWithQuantities.map(cartItem => ({
        materialId: cartItem.item.id,
        quantity: cartItem.quantity
      }));
      
      const newCartExit = await cartExitApi.create({
        ...exitData,
        materials
      }, cartItemsWithQuantities.map(ci => ci.item));
      
      // Procesar cada material del carrito
      for (const cartItem of cartItemsWithQuantities) {
        // Actualizar el stock del material
        const newStock = cartItem.item.stock - cartItem.quantity;
        await inventoryApi.updateStock(cartItem.item.id, newStock);
      }
      
      // Recargar inventario
      await loadInventory();
      
      // Limpiar carrito y cerrar modales
      setCartItems([]);
      setIsMultiExitModalOpen(false);
      
      // Mostrar mensaje de éxito
      alert(`Salida registrada exitosamente con código: ${newCartExit.registryCode}`);
      
    } catch (error) {
      console.error('Error processing multi-material exit:', error);
      alert('Error al procesar la salida de materiales');
    } finally {
      setIsProcessingMultiExit(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard items={items} />;
      case 'inventory':
        return (
          <InventoryTab 
            items={items}
            onReloadInventory={loadInventory}
            userRole={userRole}
            onAddToCart={userRole === 'Tecnico' ? handleAddToCart : undefined}
          />
        );
      case 'movements':
        return <MovementsTab />;
      case 'reports':
        return <div>Reportes - En desarrollo</div>;
      case 'import-export':
        return (
          <ImportExportTab 
            onImportItems={handleImportItems}
            isImporting={isImporting}
            cartExits={[]} // Aquí deberías pasar los datos reales de salidas del carrito
          />
        );
      case 'settings':
        return <SettingsTab />;
      case 'cart':
        return (
          <CartTab
            cartItems={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onConfirmExit={handleCartConfirm}
            onClearCart={clearCart}
          />
        );
      case 'cart-history':
        return <CartHistoryTab />;
      default:
        return <Dashboard items={items} />;
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {}}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        onLogout={handleLogout}
        cartItemsCount={cartItems.length}
      />
      
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Modal de salida múltiple */}
      <MultiMaterialExitModal
        isOpen={isMultiExitModalOpen}
        onClose={() => setIsMultiExitModalOpen(false)}
        onConfirm={handleMultiMaterialExit}
        cartItems={cartItems.map(item => ({ item, quantity: 1 }))}
        isProcessing={isProcessingMultiExit}
        registryCode={registryApi.getNextRegistryCode()}
      />
    </div>
  );
}

export default App;