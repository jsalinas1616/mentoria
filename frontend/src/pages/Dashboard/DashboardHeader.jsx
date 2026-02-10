import React from 'react';
import { LogOut } from 'lucide-react';
import DropdownActions from '../../components/Dropdown/Dropdown';

const DashboardHeader = ({ user, onLogout }) => (
  <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-soft">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img 
              src="/LOGO_Blanco.png" 
              alt="Nadro Mentoría" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500">Panel de consultas</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right mr-4">
            <p className="text-gray-900 text-sm font-medium">{user?.nombre || 'Usuario'}</p>
            <p className="text-gray-500 text-xs">{user?.email || ''}</p>
          </div>
          
          <DropdownActions />
          
          <button
            onClick={onLogout}
            className="bg-white hover:bg-gray-50 text-rose px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md border border-gray-300"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm font-medium">Salir</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
