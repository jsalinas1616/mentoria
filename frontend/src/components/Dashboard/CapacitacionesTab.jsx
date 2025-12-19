import React from 'react';
import { Download, Search, Eye, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const CapacitacionesTab = ({
  capacitaciones,
  capacitacionesFiltradas,
  capacitacionesPaginaActual,
  busquedaCapacitaciones,
  onBusquedaChange,
  onExportar,
  onVerCapacitacion,
  paginaActual,
  totalPaginas,
  onCambiarPagina,
}) => (
  <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
          <Users className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Capacitaciones Recientes</h2>
          <p className="text-sm text-gray-600">
            {capacitacionesFiltradas.length} de {capacitaciones.length} capacitaciones
          </p>
        </div>
      </div>
      <button
        onClick={() => onExportar('excel')}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Exportar Excel</span>
      </button>
    </div>

    {/* Buscador */}
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por tema, capacitador, lugar..."
          value={busquedaCapacitaciones}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Tema</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Capacitadores</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Invitados</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Asistentes</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Duración</th>
            <th className="text-center text-gray-700 font-semibold pb-4 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(capacitacionesPaginaActual) && capacitacionesPaginaActual.map((capacitacion) => (
            <tr
              key={capacitacion.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 px-4">
                <span className="text-gray-900 font-medium">
                  {formatearFecha(capacitacion.fecha)}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-900 font-medium">{capacitacion.tema}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700">
                  {capacitacion.capacitadores.length === 1 
                    ? capacitacion.capacitadores[0]
                    : `${capacitacion.capacitadores[0]} +${capacitacion.capacitadores.length - 1}`
                  }
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700">{capacitacion.numeroPersonasInvitadas}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700">{capacitacion.asistentes?.length || 0}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700">{capacitacion.lugar}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700">{capacitacion.duracion}</span>
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onVerCapacitacion(capacitacion)}
                  className="bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-primary/20 hover:border-primary/40"
                >
                  <Eye size={16} />
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Paginación para Capacitaciones */}
    {capacitacionesFiltradas.length > 0 && totalPaginas > 1 && (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        {[...Array(totalPaginas)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => onCambiarPagina(index + 1)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              paginaActual === index + 1
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
        
        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    )}

    {capacitaciones.length === 0 && (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-50 rounded-2xl inline-block">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay capacitaciones registradas</p>
          <p className="text-gray-400 text-sm">Las capacitaciones aparecerán aquí cuando se registren</p>
        </div>
      </div>
    )}
  </div>
);

export default CapacitacionesTab;
