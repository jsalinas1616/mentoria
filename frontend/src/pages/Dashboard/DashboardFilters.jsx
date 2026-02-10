import React from 'react';
import DatePicker from 'react-datepicker';
import { Filter } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import { parseFechaLocal } from '../../utils/validation';

const DashboardFilters = ({
  filtros,
  mostrarFiltros,
  onToggleFiltros,
  onFiltroChange,
  onLimpiarFiltros,
  onFechaInicioChange,
  onFechaFinChange,
}) => (
  <div className="mb-8">
    <button
      onClick={onToggleFiltros}
      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 mb-4 shadow-sm hover:shadow-md border border-gray-300"
    >
      <Filter size={18} />
      {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
    </button>

    {mostrarFiltros && (
      <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Fecha Inicio</label>
            <DatePicker
              selected={filtros.fechaInicio ? parseFechaLocal(filtros.fechaInicio) : null}
              onChange={onFechaInicioChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/AAAA"
              isClearable
              className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
              wrapperClassName="w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Fecha Fin</label>
            <DatePicker
              selected={filtros.fechaFin ? parseFechaLocal(filtros.fechaFin) : null}
              onChange={onFechaFinChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/AAAA"
              isClearable
              className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
              wrapperClassName="w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Lugar de Trabajo</label>
            <input
              type="text"
              name="lugarTrabajo"
              value={filtros.lugarTrabajo}
              onChange={onFiltroChange}
              placeholder="Filtrar..."
              className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={onLimpiarFiltros}
              className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl font-semibold shadow-lg"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default DashboardFilters;
