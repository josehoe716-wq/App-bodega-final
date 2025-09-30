import React, { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Eye, Settings, Trash2, LogOut } from 'lucide-react';
import { Layout } from './components/Layout';
import { InventoryCard } from './components/InventoryCard';
import { EditItemModal } from './components/EditItemModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { ClearAllModal } from './components/ClearAllModal';
import { CriticalStockNotification } from './components/CriticalStockNotification';
import { CategoryView } from './components/CategoryView';
import { SearchBar } from './components/SearchBar';
import { StatsGrid } from './components/StatsGrid';
import { StockCriticalityCharts } from './components/StockCriticalityCharts';
import { InventoryItem, NewInventoryItem } from './types/inventory';
import { AddItemModal } from './components/AddItemModal';
import { AuthModal } from './components/AuthModal';
import { inventoryApi } from './services/api';
import { searchInventoryItem } from './utils/search';
import * as XLSX from 'xlsx';
import { CartModal } from "./components/CartModal";

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'Tecnico' | 'administrador' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'critical' | 'zero'>('all');
  const [currentView, setCurrentView] = useState<'list' | 'categories'>('list');

  // 👇 Estados del carrito
  const [cartItems, setCartItems] = useState<InventoryItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (userRole) {
      loadInventory();
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
      setIsModalOpen(false);
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
      setIsImportModalOpen(false);
    } catch (error) {
      console.error('Error importing items:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateStock = async (id: number, stock: number) => {
    try {
      setUpdatingItems(prev => new Set([...prev, id]));
      const updatedItem = await inventoryApi.updateStock(id, stock);
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    try {
      setIsSaving(true);
      const savedItem = await inventoryApi.update(updatedItem.id, updatedItem);
      if (savedItem) {
        setItems(prev => prev.map(item => 
          item.id === updatedItem.id ? savedItem : item
        ));
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este material?')) {
      try {
        setDeletingItems(prev => new Set([...prev, id]));
        const deleted = await inventoryApi.delete(id);
        if (deleted) {
          await loadInventory();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setDeletingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      const cleared = await inventoryApi.clearAll();
      if (cleared) {
        await loadInventory();
        setIsClearAllModalOpen(false);
      }
    } catch (error) {
      console.error('Error clearing inventory:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogin = (role: 'Tecnico' | 'administrador') => {
    setUserRole(role);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthModalOpen(true);
    setItems([]);
    setSearchTerm('');
    setStockFilter('all');
  };

  const handleExportZeroStock = () => {
    const zeroStockItems = items.filter(item => item.stock === 0);
    if (zeroStockItems.length === 0) {
      alert('No hay materiales con stock cero para exportar');
      return;
    }

    const exportData = zeroStockItems.map(item => ({
      'Tipo': item.tipo,
      'Nombre': item.nombre,
      'Código': item.codigo,
      'Ubicación': item.ubicacion,
      'Stock': item.stock,
      'Unidad': item.unidad,
      'Punto Pedido': item.puntoPedido || 5,
      'Punto Máximo': item.puntoMaximo || 0,
      'Categoría': item.categoria || 'Sin categoría'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiales Sin Stock');
    XLSX.writeFile(wb, `materiales_sin_stock_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 👇 Funciones del carrito
  const handleAddToCart = (item: InventoryItem) => {
    setCartItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchInventoryItem(item, searchTerm);
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    const matchesFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stock <= puntoPedido && item.stock > criticalThreshold && item.stock > 0) ||
      (stockFilter === 'critical' && item.stock <= criticalThreshold && item.stock > 0) ||
      (stockFilter === 'zero' && item.stock === 0);
    
    return matchesSearch && matchesFilter;
  });

  if (!userRole) {
    return (
      <>
        <Layout>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Iniciando sistema...</p>
            </div>
          </div>
        </Layout>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {}}
          onLogin={handleLogin}
        />
      </>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const isAdmin = userRole === 'administrador';

  return (
    <Layout>
      <CriticalStockNotification items={items} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Inventario Industrial</h2>
            <p className="text-slate-600">
              Gestión completa de materiales y suministros - {userRole === 'administrador' ? 'Administrador' : 'Tecnico'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>

            {/* 👇 Botón del carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              <span>🛒 Carrito ({cartItems.length})</span>
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Borrar Todo</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Importar Excel</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Material</span>
                </button>
              </>
            )}
          </div>
        </div>

        <StatsGrid items={items} />

        {isAdmin && <StockCriticalityCharts items={items} />}

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          stockFilter={stockFilter}
          onFilterChange={setStockFilter}
          onExportZeroStock={handleExportZeroStock}
        />

        {currentView === 'categories' ? (
          <CategoryView
            items={filteredItems}
            onUpdateStock={handleUpdateStock}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={isAdmin ? handleAddItem : undefined}
            updatingItems={updatingItems}
            deletingItems={deletingItems}
            isAdding={isAdding}
            userRole={userRole}
          />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="max-w-sm mx-auto">
              <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Plus className="h-8 w-8 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm || stockFilter !== 'all' ? 'No se encontraron materiales' : 'No hay materiales'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || stockFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : isAdmin ? 'Comienza agregando tu primer material al inventario' : 'No hay materiales disponibles'
                }
              </p>
              {!searchTerm && stockFilter === 'all' && isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Material</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onUpdateStock={handleUpdateStock}
                onEditItem={isAdmin ? handleEditItem : undefined}
                onDeleteItem={isAdmin ? handleDeleteItem : undefined}
                isUpdating={updatingItems.has(item.id)}
                isDeleting={deletingItems.has(item.id)}
                isViewerMode={!isAdmin}
                userRole={userRole}
                onAddToCart={handleAddToCart}   // 👈 NUEVO
              />
            ))}
          </div>
        )}

        {isAdmin && (
          <>
            <AddItemModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddItem}
              isAdding={isAdding}
            />

            {editingItem && (
              <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                onSave={handleSaveItem}
                item={editingItem}
                isSaving={isSaving}
              />
            )}

            <ImportExcelModal
              isOpen={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              onImport={handleImportItems}
              isImporting={isImporting}
            />

            <ClearAllModal
              isOpen={isClearAllModalOpen}
              onClose={() => setIsClearAllModalOpen(false)}
              onConfirm={handleClearAll}
              isClearing={isClearing}
              totalItems={items.length}
            />
          </>
        )}

        {/* 👇 Aquí renderizamos el modal del carrito */}
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onRemoveItem={handleRemoveFromCart}
        />
      </div>
    </Layout>
  );
}

export default App;