import React, { useState } from 'react';
import { X, Lock, User, Shield, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: 'Tecnico' | 'administrador') => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<'Tecnico' | 'administrador'>('Tecnico');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTechnicianLogin = () => {
    onLogin('Tecnico');
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si es técnico, no necesita contraseña
    if (selectedRole === 'Tecnico') {
      handleTechnicianLogin();
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Simular validación de contraseña
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'admin123') {
      onLogin(selectedRole);
      setPassword('');
      onClose();
    } else {
      setError('Contraseña incorrecta');
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Iniciar Sesión</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Seleccionar Rol
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('Tecnico');
                  setPassword('');
                  setError('');
                }}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors ${
                  selectedRole === 'Tecnico'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <User className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-slate-900">Tecnico</div>
                  <div className="text-sm text-slate-600">Acceso directo - Sin contraseña</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('administrador');
                  setError('');
                }}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors ${
                  selectedRole === 'administrador'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Shield className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-slate-900">Administrador</div>
                  <div className="text-sm text-slate-600">Acceso completo al sistema</div>
                </div>
              </button>
            </div>
          </div>

          {selectedRole === 'administrador' && (
            <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Contraseña de administrador"
              required={selectedRole === 'administrador'}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (selectedRole === 'administrador' && !password)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verificando...</span>
              </>
            ) : (
              <>
                {selectedRole === 'Tecnico' ? <LogIn className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span>{selectedRole === 'Tecnico' ? 'Acceder como Técnico' : 'Iniciar Sesión'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}