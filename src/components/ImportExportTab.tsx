import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Package, ShoppingCart } from 'lucide-react';
import { ImportExcelModal } from './ImportExcelModal';
import { NewInventoryItem } from '../types/inventory';
import * as XLSX from 'xlsx';

interface ImportExportTabProps {
  onImportItems: (items: NewInventoryItem[]) => void;
  isImporting: boolean;
  cartExits: any[]; // Aquí deberías definir el tipo correcto para las salidas del carrito
}

export function ImportExportTab({ onImportItems, isImporting, cartExits = [] }: ImportExportTabProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Tp.M': 'UNBW',
        'Texto breve mat.(idioma tr.)': 'Tornillo M8',
        'Material': '101290797',
        'Ubic.': 'AT1-A01-01',
        'Ctd.stock': 100,
        'UMB': 'UNI',
        'Punto pedi': 10,
        'Máx.nivel': 50,
        'Foto (URL opcional)': 'https://ejemplo.com/imagen.jpg'
      },
      {
        'Tp.M': 'ERSA',
        'Texto breve mat.(idioma tr.)': 'Correa Industrial',
        'Material': '101290798',
        'Ubic.': 'Estante B2',
        'Ctd.stock': 25,
        'UMB': 'M',
        'Punto pedi': 5,
        'Máx.nivel': 20,
        'Foto (URL opcional)': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Inventario');
    XLSX.writeFile(wb, 'plantilla_inventario.xlsx');
  };

  const exportCartExits = () => {
    if (cartExits.length === 0) {
      alert('No hay registros de salidas del carrito para exportar');
      return;
    }

    const exportData = cartExits.map(exit => ({
      'Código de Registro': exit.registryCode || '',
      'Fecha': exit.exitDate,
      'Hora': exit.exitTime,
      'Tipo Material': exit.materialType,
      'Nombre Material': exit.materialName,
      'Código': exit.materialCode,
      'Ubicación': exit.materialLocation,
      'Cantidad': exit.quantity,
      'Persona': `${exit.personName} ${exit.personLastName}`,
      'Área': exit.area,
      'CECO': exit.ceco || '',
      'Código SAP': exit.sapCode || '',
      'Orden de Trabajo': exit.workOrder || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salidas del Carrito');
    
    const fileName = `salidas_carrito_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Importar / Exportar</h2>
        <p className="text-slate-600">Gestión de datos del inventario y registros de salidas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Importar desde Excel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Importar desde Excel</h3>
              <p className="text-sm text-slate-600">Cargar materiales desde archivo Excel</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Formato del archivo Excel:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Tp.M:</strong> Tipo de material - ERSA o UNBW (obligatorio)</p>
                <p>• <strong>Texto breve mat.(idioma tr.):</strong> Nombre del material (obligatorio)</p>
                <p>• <strong>Material:</strong> Código del material (obligatorio)</p>
                <p>• <strong>Ubic.:</strong> Ubicación (obligatorio)</p>
                <p>• <strong>Ctd.stock:</strong> Cantidad inicial (obligatorio)</p>
                <p>• <strong>UMB:</strong> Unidad de medida (opcional, por defecto UNI)</p>
                <p>• <strong>Punto pedi:</strong> Stock mínimo (opcional, por defecto 5)</p>
                <p>• <strong>Máx.nivel:</strong> Stock máximo (opcional, por defecto 0)</p>
                <p>• <strong>Foto (URL opcional):</strong> URL de imagen (opcional)</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Plantilla</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Importar Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exportar registros del carrito */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Exportar Salidas del Carrito</h3>
              <p className="text-sm text-slate-600">Descargar registros de salidas múltiples</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Información incluida:</h4>
              <div className="text-sm text-orange-800 space-y-1">
                <p>• Código de registro único</p>
                <p>• Detalles completos de cada material</p>
                <p>• Información de la persona y destino</p>
                <p>• Fecha y hora de la salida</p>
                <p>• Códigos SAP y órdenes de trabajo</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{cartExits.length}</div>
                  <div className="text-sm text-slate-600">Registros de salidas del carrito</div>
                </div>
                <Package className="h-8 w-8 text-slate-400" />
              </div>
            </div>

            <button
              onClick={exportCartExits}
              disabled={cartExits.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Salidas del Carrito</span>
            </button>
          </div>
        </div>
      </div>

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImportItems}
        isImporting={isImporting}
      />
    </div>
  );
}