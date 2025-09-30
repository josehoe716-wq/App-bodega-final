import React, { useState } from 'react';
import { Settings, Lock, Key, Save, Eye, EyeOff } from 'lucide-react';

export function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (currentPassword !== 'admin123') {
      setMessage({ type: 'error', text: 'La contraseña actual es incorrecta' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (newPassword === currentPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual' });
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // Simular cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una implementación real, aquí se haría la llamada al API
      // Por ahora solo simulamos el éxito
      setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
      
      // Limpiar formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Configuración</h2>
        <p className="text-slate-600">Configuración del sistema y cuenta de administrador</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cambiar contraseña */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cambiar Contraseña</h3>
              <p className="text-sm text-slate-600">Actualizar contraseña de administrador</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Contraseña actual */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña actual *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Nueva contraseña *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres</p>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirmar nueva contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Mensaje */}
            {message && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isChangingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cambiando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Cambiar Contraseña</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Información del sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-slate-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Información del Sistema</h3>
              <p className="text-sm text-slate-600">Detalles de la aplicación</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Nombre del Sistema</span>
              <span className="text-sm text-slate-900">Mi bodega EJ-TEC</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Empresa</span>
              <span className="text-sm text-slate-900">Ecuajugos S.A.</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Versión</span>
              <span className="text-sm text-slate-900">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Desarrollado por</span>
              <span className="text-sm text-slate-900">Dennis Quinche</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-slate-700">Última actualización</span>
              <span className="text-sm text-slate-900">{new Date().toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuraciones adicionales */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Key className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Configuraciones de Seguridad</h3>
            <p className="text-sm text-slate-600">Configuraciones de acceso y seguridad</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Credenciales actuales:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Administrador:</strong> admin123</p>
            <p>• <strong>Técnico:</strong> Acceso directo (sin contraseña)</p>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Nota: Las credenciales se almacenan localmente. En un entorno de producción, 
            estas deberían estar cifradas y gestionadas por un sistema de autenticación seguro.
          </p>
        </div>
      </div>
    </div>
  );
}