import React from 'react';
import { Download, Search, Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const EntrevistasTab = ({
  entrevistas,
  entrevistasFiltradas,
  entrevistasPaginaActual,
  busquedaEntrevistas,
  onBusquedaChange,
  onExportar,
  onVerEntrevista,
  paginaActual,
  totalPaginas,
  indicePrimeraEntrevista,
  indiceUltimaEntrevista,
  onCambiarPagina,
}) => (
  <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
          <FileText className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Entrevistas Recientes</h2>
          <p className="text-sm text-gray-600">
            {entrevistasFiltradas.length} de {entrevistas.length} entrevistas
          </p>
        </div>
      </div>
      <button
        onClick={() => onExportar('excel')}
        className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 font-semibold shadow-lg"
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
          placeholder="Buscar por nombre, correo, lugar de trabajo..."
          value={busquedaEntrevistas}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
        />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Entrevistador</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sesión #</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Edad</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sexo</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Área</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Motivos</th>
            <th className="text-left text-gray-700 font-semibold pb-4 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entrevistasPaginaActual.map((entrevista) => (
            <tr
              key={entrevista.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 px-4 text-gray-900 text-sm font-medium">
                {formatearFecha(entrevista.fecha)}
              </td>
              <td className="py-4 px-4">
                {entrevista.entrevistadores && entrevista.entrevistadores.length > 0 ? (
                  entrevista.entrevistadores.length === 1 ? (
                    <p className="text-gray-900 text-sm font-semibold">{entrevista.entrevistadores[0]}</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-900 text-sm font-semibold">{entrevista.entrevistadores[0]}</p>
                      <p className="text-gray-500 text-xs">+{entrevista.entrevistadores.length - 1} más</p>
                    </div>
                  )
                ) : (
                  <p className="text-gray-400 text-sm italic">Sin entrevistadores</p>
                )}
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-bold rounded-full">
                  {entrevista.numeroSesion || '-'}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-700 text-sm">{entrevista.rangoEdad || 'N/A'}</td>
              <td className="py-4 px-4 text-gray-700 text-sm">{entrevista.sexo || 'N/A'}</td>
              <td className="py-4 px-4 text-gray-700 text-sm">{entrevista.lugarTrabajo}</td>
              <td className="py-4 px-4 text-gray-600 text-sm truncate max-w-xs">
                {entrevista.area}
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                  {entrevista.motivosEntrevista?.slice(0, 2).map((motivo, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20"
                    >
                      {motivo}
                    </span>
                  ))}
                  {entrevista.motivosEntrevista?.length > 2 && (
                    <span className="text-gray-500 text-xs px-3 py-1">
                      +{entrevista.motivosEntrevista.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onVerEntrevista(entrevista)}
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

    {/* Paginador */}
    {totalPaginas > 1 && (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Mostrando {indicePrimeraEntrevista + 1} a {Math.min(indiceUltimaEntrevista, entrevistasFiltradas.length)} de {entrevistasFiltradas.length} entrevistas
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-2 rounded-xl border border-gray-300 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            let numeroPaginaEntrevista;
            if (totalPaginas <= 5) {
              numeroPaginaEntrevista = i + 1;
            } else if (paginaActual <= 3) {
              numeroPaginaEntrevista = i + 1;
            } else if (paginaActual >= totalPaginas - 2) {
              numeroPaginaEntrevista = totalPaginas - 4 + i;
            } else {
              numeroPaginaEntrevista = paginaActual - 2 + i;
            }
            
            return (
              <button
                key={numeroPaginaEntrevista}
                onClick={() => onCambiarPagina(numeroPaginaEntrevista)}
                className={`px-3 py-2 rounded-xl font-medium transition-all ${
                  paginaActual === numeroPaginaEntrevista
                    ? 'bg-primary text-white shadow-lg'
                    : 'border border-gray-300 hover:border-primary hover:bg-primary/10 text-gray-700'
                }`}
              >
                {numeroPaginaEntrevista}
              </button>
            );
          })}
          
          <button
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-2 rounded-xl border border-gray-300 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )}

    {entrevistas.length === 0 && (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-50 rounded-2xl inline-block">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay entrevistas registradas</p>
          <p className="text-gray-400 text-sm">Las entrevistas aparecerán aquí cuando se registren</p>
        </div>
      </div>
    )}
  </div>
);

export default EntrevistasTab;
