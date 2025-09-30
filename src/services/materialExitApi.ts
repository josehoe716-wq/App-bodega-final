import { MaterialExit, NewMaterialExit, CartExit, NewCartExit, CartExitMaterial } from '../types/materialExit';
import { InventoryItem } from '../types/inventory';

// Local Storage key for material exits
const EXITS_STORAGE_KEY = 'material_exits_data';
const CART_EXITS_STORAGE_KEY = 'cart_exits_data';
const REGISTRY_COUNTER_KEY = 'registry_counter';

// Load exits from localStorage
const loadExitsFromStorage = (): MaterialExit[] => {
  try {
    const stored = localStorage.getItem(EXITS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading exits from localStorage:', error);
    return [];
  }
};

// Save exits to localStorage
const saveExitsToStorage = (data: MaterialExit[]): void => {
  try {
    localStorage.setItem(EXITS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving exits to localStorage:', error);
  }
};

// Load cart exits from localStorage
const loadCartExitsFromStorage = (): CartExit[] => {
  try {
    const stored = localStorage.getItem(CART_EXITS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cart exits from localStorage:', error);
    return [];
  }
};

// Save cart exits to localStorage
const saveCartExitsToStorage = (data: CartExit[]): void => {
  try {
    localStorage.setItem(CART_EXITS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cart exits to localStorage:', error);
  }
};

// Get next registry code
const getNextRegistryCode = (): string => {
  try {
    const stored = localStorage.getItem(REGISTRY_COUNTER_KEY);
    const currentCounter = stored ? parseInt(stored) : 0;
    const nextCounter = currentCounter + 1;
    localStorage.setItem(REGISTRY_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error getting next registry code:', error);
    return '0001';
  }
};

let currentExits = loadExitsFromStorage();
let currentCartExits = loadCartExitsFromStorage();

export const materialExitApi = {
  async getAll(): Promise<MaterialExit[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentExits = loadExitsFromStorage();
    return currentExits;
  },

  async create(exitData: NewMaterialExit, material: InventoryItem): Promise<MaterialExit> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    currentExits = loadExitsFromStorage();
    const maxId = currentExits.length > 0 ? Math.max(...currentExits.map(e => e.id)) : 0;
    
    const now = new Date();
    const newExit: MaterialExit = {
      id: maxId + 1,
      materialId: exitData.materialId,
      materialName: material.nombre,
      materialCode: material.codigo,
      materialLocation: material.ubicacion,
      materialType: material.tipo as 'ERSA' | 'UNBW',
      quantity: exitData.quantity,
      remainingStock: material.stock - exitData.quantity,
      personName: exitData.personName,
      personLastName: exitData.personLastName,
      area: exitData.area,
      ceco: exitData.ceco,
      sapCode: exitData.sapCode,
      workOrder: exitData.workOrder,
      exitDate: now.toISOString().split('T')[0],
      exitTime: now.toTimeString().split(' ')[0],
      createdAt: now.toISOString(),
    };
    
    currentExits.push(newExit);
    saveExitsToStorage(currentExits);
    return newExit;
  },

  async getByMaterial(materialId: number): Promise<MaterialExit[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentExits = loadExitsFromStorage();
    return currentExits.filter(exit => exit.materialId === materialId);
  },

  async delete(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentExits = loadExitsFromStorage();
    const initialLength = currentExits.length;
    currentExits = currentExits.filter(exit => exit.id !== id);
    if (currentExits.length < initialLength) {
      saveExitsToStorage(currentExits);
      return true;
    }
    return false;
  },

  async update(id: number, updatedData: Partial<MaterialExit>): Promise<MaterialExit | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    currentExits = loadExitsFromStorage();
    const exitIndex = currentExits.findIndex(exit => exit.id === id);
    if (exitIndex !== -1) {
      currentExits[exitIndex] = { ...currentExits[exitIndex], ...updatedData };
      saveExitsToStorage(currentExits);
      return currentExits[exitIndex];
    }
    return null;
  }
};

export const cartExitApi = {
  async getAll(): Promise<CartExit[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentCartExits = loadCartExitsFromStorage();
    return currentCartExits;
  },

  async create(exitData: NewCartExit, materials: InventoryItem[]): Promise<CartExit> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    currentCartExits = loadCartExitsFromStorage();
    const maxId = currentCartExits.length > 0 ? Math.max(...currentCartExits.map(e => e.id)) : 0;
    
    const now = new Date();
    const registryCode = getNextRegistryCode();
    
    // Crear los materiales de la salida del carrito
    const cartMaterials: CartExitMaterial[] = exitData.materials.map(materialData => {
      const material = materials.find(m => m.id === materialData.materialId);
      if (!material) throw new Error(`Material with id ${materialData.materialId} not found`);
      
      return {
        materialId: material.id,
        materialName: material.nombre,
        materialCode: material.codigo,
        materialLocation: material.ubicacion,
        materialType: material.tipo as 'ERSA' | 'UNBW',
        quantity: materialData.quantity,
        remainingStock: material.stock - materialData.quantity
      };
    });
    
    const newCartExit: CartExit = {
      id: maxId + 1,
      registryCode,
      personName: exitData.personName,
      personLastName: exitData.personLastName,
      area: exitData.area,
      ceco: exitData.ceco,
      sapCode: exitData.sapCode,
      workOrder: exitData.workOrder,
      materials: cartMaterials,
      totalItems: cartMaterials.length,
      totalQuantity: cartMaterials.reduce((sum, m) => sum + m.quantity, 0),
      exitDate: now.toISOString().split('T')[0],
      exitTime: now.toTimeString().split(' ')[0],
      createdAt: now.toISOString(),
    };
    
    currentCartExits.push(newCartExit);
    saveCartExitsToStorage(currentCartExits);
    return newCartExit;
  },

  async delete(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentCartExits = loadCartExitsFromStorage();
    const initialLength = currentCartExits.length;
    currentCartExits = currentCartExits.filter(exit => exit.id !== id);
    if (currentCartExits.length < initialLength) {
      saveCartExitsToStorage(currentCartExits);
      return true;
    }
    return false;
  },

  async update(id: number, updatedData: Partial<CartExit>): Promise<CartExit | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    currentCartExits = loadCartExitsFromStorage();
    const exitIndex = currentCartExits.findIndex(exit => exit.id === id);
    if (exitIndex !== -1) {
      currentCartExits[exitIndex] = { ...currentCartExits[exitIndex], ...updatedData };
      saveCartExitsToStorage(currentCartExits);
      return currentCartExits[exitIndex];
    }
    return null;
  }
};