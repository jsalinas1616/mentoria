import React from 'react';
import { Download, Search, Eye, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const AcercamientosTab = ({
  acercamientos,
  acercamientosFiltrados,
  acercamientosPaginaActual,
  busquedaAcercamientos,
  onBusquedaChange,
  onExportar,
  onVerAcercamiento,
  paginaActual,
  totalPaginas,
  indicePrimeraAcercamiento,
  indiceUltimaAcercamiento,
  onCambiarPagina,
}) => (
  <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl">
          <MessageSquare className="text-emerald-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Acercamientos Recientes</h2>
          <p className="text-sm text-gray-600">
            {acercamientosFiltrados.length} de {acercamientos.length} acercamientos
          </p>
        </div>
      </div>
      <button
        onClick={() => onExportar('excel')}
        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 font-semibold shadow-lg"
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
          placeholder="Buscar por mentor, lugar, área..."
          value={busquedaAcercamientos}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-sm hover:shadow-md"
        />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Mentor</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Acercamiento #</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Edad</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sexo</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Área</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Estado de ánimo</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {acercamientosPaginaActual.map((acercamiento) => (
            <tr
              key={acercamiento.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 px-4 text-gray-900 text-sm font-medium">
                {formatearFecha(acercamiento.fecha)}
              </td>
              <td className="py-4 px-4">
                {acercamiento.mentores && acercamiento.mentores.length > 0 ? (
                  acercamiento.mentores.length === 1 ? (
                    <p className="text-gray-900 text-sm font-semibold">{acercamiento.mentores[0]}</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-900 text-sm font-semibold">{acercamiento.mentores[0]}</p>
                      <p className="text-gray-500 text-xs">+{acercamiento.mentores.length - 1} más</p>
                    </div>
                  )
                ) : (
                  <p className="text-gray-400 text-sm italic">Sin mentores</p>
                )}
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-700 font-bold rounded-full">
                  {acercamiento.numeroAcercamiento || '-'}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-700 text-sm">{acercamiento.rangoEdad || 'N/A'}</td>
              <td className="py-4 px-4 text-gray-700 text-sm">{acercamiento.sexo || 'N/A'}</td>
              <td className="py-4 px-4 text-gray-700 text-sm">{acercamiento.lugarTrabajo}</td>
              <td className="py-4 px-4 text-gray-600 text-sm truncate max-w-xs">
                {acercamiento.area}
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                  {acercamiento.estadosAnimo?.slice(0, 2).map((estado, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-600/20"
                    >
                      {estado}
                    </span>
                  ))}
                  {acercamiento.estadosAnimo?.length > 2 && (
                    <span className="text-gray-500 text-xs px-3 py-1">
                      +{acercamiento.estadosAnimo.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onVerAcercamiento(acercamiento)}
                  className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 text-emerald-700 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-emerald-600/20 hover:border-emerald-600/40"
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

    {/* Paginador */}
    {totalPaginas > 1 && (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Mostrando {indicePrimeraAcercamiento + 1} a {Math.min(indiceUltimaAcercamiento, acercamientosFiltrados.length)} de {acercamientosFiltrados.length} acercamientos
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-2 rounded-xl border border-gray-300 hover:border-emerald-600 hover:bg-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            let numeroPagina;
            if (totalPaginas <= 5) {
              numeroPagina = i + 1;
            } else if (paginaActual <= 3) {
              numeroPagina = i + 1;
            } else if (paginaActual >= totalPaginas - 2) {
              numeroPagina = totalPaginas - 4 + i;
            } else {
              numeroPagina = paginaActual - 2 + i;
            }
            
            return (
              <button
                key={numeroPagina}
                onClick={() => onCambiarPagina(numeroPagina)}
                className={`px-3 py-2 rounded-xl font-medium transition-all ${
                  paginaActual === numeroPagina
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'border border-gray-300 hover:border-emerald-600 hover:bg-emerald-600/10 text-gray-700'
                }`}
              >
                {numeroPagina}
              </button>
            );
          })}
          
          <button
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-2 rounded-xl border border-gray-300 hover:border-emerald-600 hover:bg-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )}

    {acercamientos.length === 0 && (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-50 rounded-2xl inline-block">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay acercamientos registrados</p>
          <p className="text-gray-400 text-sm">Los acercamientos aparecerán aquí cuando se registren</p>
        </div>
      </div>
    )}
  </div>
);

export default AcercamientosTab;
