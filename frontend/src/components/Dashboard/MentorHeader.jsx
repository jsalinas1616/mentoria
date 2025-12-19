import React from 'react';
import { LogOut } from 'lucide-react';

const MentorHeader = ({ user, onLogout }) => (
  <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-soft">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">
            Usuario
            <br />
            <span className="font-medium text-primary">{user?.email}</span>
          </span>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-rose hover:bg-rose/10 rounded-xl transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default MentorHeader;
