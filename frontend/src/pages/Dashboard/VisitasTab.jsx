import React from 'react';
import { Download, Search, Eye, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const VisitasTab = ({
  visitas,
  visitasFiltradas,
  visitasPaginaActual,
  busquedaVisitas,
  onBusquedaChange,
  onExportar,
  onVerVisita,
  paginaActual,
  totalPaginas,
  indicePrimeraVisita,
  indiceUltimaVisita,
  onCambiarPagina,
}) => (
  <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
          <Home className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Visitas Recientes</h2>
          <p className="text-sm text-gray-600">
            {visitasFiltradas.length} de {visitas.length} visitas
          </p>
        </div>
      </div>
      <button
        onClick={() => onExportar('excel')}
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 font-semibold shadow-lg"
      >
        <Download size={18} />
        Exportar Excel
      </button>
    </div>

    {/* Buscador */}
    <div className="mb-6">
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por mentor, lugar, parentesco..."
          value={busquedaVisitas}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm hover:shadow-md"
        />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Mentor</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar Visita</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Parentesco</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Edad</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sexo</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Área Personal</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visitasPaginaActual.map((visita) => (
            <tr
              key={visita.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 px-4 text-gray-900 text-sm font-medium">
                {formatearFecha(visita.fecha)}
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-900 text-sm font-medium">
                  {Array.isArray(visita.mentores) ? visita.mentores.join(', ') : visita.mentores || 'Sin asignar'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {visita.lugarVisita || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-900 text-sm">
                  {visita.parentesco || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-900 text-sm">
                  {visita.rangoEdad || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-900 text-sm">
                  {visita.sexo || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-gray-700 text-sm">
                  {visita.areaPersonal || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onVerVisita(visita)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center gap-2 text-sm font-semibold"
                >
                  <Eye size={16} />
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visitasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Home className="text-gray-400" size={48} />
            </div>
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {busquedaVisitas ? 'No se encontraron resultados' : 'No hay visitas registradas'}
          </p>
          <p className="text-gray-400 text-sm">
            {busquedaVisitas ? 'Intenta con otros términos de búsqueda' : 'Las visitas aparecerán aquí una vez registradas'}
          </p>
        </div>
      )}
    </div>

    {/* Paginación */}
    {visitasFiltradas.length > 0 && totalPaginas > 1 && (
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-semibold">{indicePrimeraVisita}</span> a{' '}
            <span className="font-semibold">{indiceUltimaVisita}</span> de{' '}
            <span className="font-semibold">{visitasFiltradas.length}</span> resultados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <div className="flex gap-1">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                onClick={() => onCambiarPagina(i + 1)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  paginaActual === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )}
  </div>
);

export default VisitasTab;
