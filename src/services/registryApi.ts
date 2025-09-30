// API para manejar códigos de registro de salidas
const REGISTRY_STORAGE_KEY = 'material_exit_registry';

interface RegistryData {
  lastCode: number;
}

const loadRegistryFromStorage = (): RegistryData => {
  try {
    const stored = localStorage.getItem(REGISTRY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { lastCode: 0 };
  } catch (error) {
    console.error('Error loading registry from localStorage:', error);
    return { lastCode: 0 };
  }
};

const saveRegistryToStorage = (data: RegistryData): void => {
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving registry to localStorage:', error);
  }
};

export const registryApi = {
  getNextRegistryCode(): string {
    const registry = loadRegistryFromStorage();
    const nextCode = registry.lastCode + 1;
    const formattedCode = nextCode.toString().padStart(4, '0');
    
    // Guardar el nuevo código
    saveRegistryToStorage({ lastCode: nextCode });
    
    return formattedCode;
  },

  getCurrentCode(): string {
    const registry = loadRegistryFromStorage();
    return registry.lastCode.toString().padStart(4, '0');
  }
};