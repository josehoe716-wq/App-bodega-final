import React, { useState } from 'react';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import { InventoryItem, NewInventoryItem } from '../types/inventory';
import { InventoryCard } from './InventoryCard';
import { EditItemModal } from './EditItemModal';
import { AddItemModal } from './AddItemModal';
import { ImportExcelModal } from './ImportExcelModal';
import { ClearAllModal } from './ClearAllModal';
import { CriticalStockNotification } from './CriticalStockNotification';
import { CategoryView } from './CategoryView';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { inventoryApi } from '../services/api';
import { searchInventoryItem } from '../utils/search';
import * as XLSX from 'xlsx';

interface InventoryTabProps {
  items: InventoryItem[];
  onReloadInventory: () => void;
  userRole: 'Tecnico' | 'administrador' | null;
  onAddToCart?: (item: InventoryItem) => void;
}

export function InventoryTab({ items, onReloadInventory, userRole, onAddToCart }: InventoryTabProps) {
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
  const [nameFilter, setNameFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'critical' | 'zero'>('all');
  const [currentView, setCurrentView] = useState<'list' | 'categories'>('list');

  const handleAddItem = async (newItem: NewInventoryItem) => {
    try {
      setIsAdding(true);
      await inventoryApi.create(newItem);
      await onReloadInventory();
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
      await onReloadInventory();
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
        await onReloadInventory();
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
        await onReloadInventory();
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
          await onReloadInventory();
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
        await onReloadInventory();
        setIsClearAllModalOpen(false);
      }
    } catch (error) {
      console.error('Error clearing inventory:', error);
    } finally {
      setIsClearing(false);
    }
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

  const filteredItems = items.filter(item => {
    const matchesSearch = searchInventoryItem(item, searchTerm);
    const matchesName = !nameFilter || item.nombre.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesLocation = !locationFilter || item.ubicacion.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCode = !codeFilter || item.codigo.toLowerCase().includes(codeFilter.toLowerCase());
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    const matchesFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stock <= puntoPedido && item.stock > criticalThreshold && item.stock > 0) ||
      (stockFilter === 'critical' && item.stock <= criticalThreshold && item.stock > 0) ||
      (stockFilter === 'zero' && item.stock === 0);
    
    return matchesSearch && matchesName && matchesLocation && matchesCode && matchesFilter;
  });

  const isAdmin = userRole === 'administrador';

  return (
    <div className="space-y-6">
      <CriticalStockNotification items={items} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventario Completo</h2>
          <p className="text-slate-600">
            Gestión completa de materiales y suministros
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Borrar Todo</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Material</span>
            </button>
          </div>
        )}
      </div>

      <AdvancedSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        codeFilter={codeFilter}
        onCodeFilterChange={setCodeFilter}
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
              isViewerMode={userRole === 'Tecnico' ? false : !isAdmin}
              userRole={userRole}
              onAddToCart={onAddToCart}
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
    </div>
  );
}