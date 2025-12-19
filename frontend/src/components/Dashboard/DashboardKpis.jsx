import React from 'react';
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react';

const DashboardKpis = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
          <FileText className="text-primary" size={24} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalConsultas}</h3>
      <p className="text-gray-600 text-sm font-medium">Total de Consultas</p>
    </div>

    <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-success/10 to-success-light/10 rounded-xl">
          <Calendar className="text-success" size={24} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.consultasMes}</h3>
      <p className="text-gray-600 text-sm font-medium">Consultas Este Mes</p>
    </div>

    <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-accent/10 to-accent-light/10 rounded-xl">
          <Users className="text-accent" size={24} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">
        {stats.motivosMasFrecuentes[0]?.count || 0}
      </h3>
      <p className="text-gray-600 text-sm font-medium">
        {stats.motivosMasFrecuentes[0]?.motivo || 'Motivo Principal'}
      </p>
    </div>

    <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl">
          <TrendingUp className="text-primary-light" size={24} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">
        {stats.lugaresTrabajo.length}
      </h3>
      <p className="text-gray-600 text-sm font-medium">Lugares de Trabajo Activos</p>
    </div>
  </div>
);

export default DashboardKpis;
