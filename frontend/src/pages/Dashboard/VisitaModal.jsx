import React from 'react';
import { X, Calendar, Users, FileText, Home } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const VisitaModal = ({ open, onClose, visita }) => {
  if (!open || !visita) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-t-3xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Detalles de la Visita</h2>
            <p className="text-blue-100 text-sm">ID: {visita.id}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Información Básica
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha de la visita</p>
                <p className="text-gray-900 font-semibold">{formatearFecha(visita.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Mentores</p>
                <p className="text-gray-900 font-semibold">
                  {Array.isArray(visita.mentores) ? visita.mentores.join(', ') : visita.mentores || 'Sin asignar'}
                </p>
              </div>
            </div>
          </div>

          {/* Lugar y Tipo de Visita */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="text-blue-600" size={20} />
              Lugar de la Visita
            </h3>
            <div>
              <span className="inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {visita.lugarVisita || 'No especificado'}
              </span>
            </div>
          </div>

          {/* Datos Demográficos */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-purple-600" size={20} />
              Datos Demográficos
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rango de edad</p>
                <p className="text-gray-900 font-semibold">{visita.rangoEdad || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Sexo</p>
                <p className="text-gray-900 font-semibold">{visita.sexo || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Parentesco con colaborador</p>
                <p className="text-gray-900 font-semibold">{visita.parentesco || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Área de personal</p>
                <p className="text-gray-900 font-semibold">{visita.areaPersonal || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {visita.observaciones && (
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-yellow-600" size={20} />
                Observaciones
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">{visita.observaciones}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <p>Fecha de creación: {formatearFecha(visita.createdAt)}</p>
              </div>
              <div>
                <p>Última actualización: {formatearFecha(visita.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Botón Cerrar */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitaModal;
