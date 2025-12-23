import React from 'react';
import { Users, FileText, Calendar, MessageSquare, User, X } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const AcercamientoModal = ({ isOpen, acercamiento, onClose }) => {
  if (!isOpen || !acercamiento) {
    return null;
  }

  const haMejoradoValor = (acercamiento.haMejorado || '').toString().toLowerCase();
  const haMejoradoEsSi = haMejoradoValor.startsWith('s');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl">
              <MessageSquare className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Acercamiento</h2>
              <p className="text-sm text-gray-600">Información completa del acercamiento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-6">
          {/* Mentores */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 rounded-2xl p-6 border border-emerald-600/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-emerald-600/10 rounded-lg">
                <Users className="text-emerald-600" size={20} />
              </div>
              Mentores ({acercamiento.mentores?.length || 0})
            </h3>
            <div className="space-y-2">
              {acercamiento.mentores && acercamiento.mentores.length > 0 ? (
                acercamiento.mentores.map((mentor, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-3 border border-emerald-600/10"
                  >
                    <div className="w-8 h-8 bg-emerald-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-900 font-medium">{mentor}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay mentores asignados</p>
              )}
            </div>
          </div>

          {/* Datos demográficos */}
          <div className="bg-gradient-to-r from-accent/5 to-accent-light/5 rounded-2xl p-6 border border-accent/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="text-accent" size={20} />
              </div>
              Datos Demográficos (Confidencial)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Rango de Edad</label>
                <p className="text-gray-900 font-medium">{acercamiento.rangoEdad || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Sexo</label>
                <p className="text-gray-900 font-medium">{acercamiento.sexo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Número de Acercamiento</label>
                <p className="text-gray-900 font-medium">{acercamiento.numeroAcercamiento || 'N/A'}</p>
              </div>
              {acercamiento.numeroAcercamiento && parseInt(acercamiento.numeroAcercamiento, 10) > 1 && acercamiento.haMejorado && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">¿Ha mejorado?</label>
                  <p className={`font-bold ${haMejoradoEsSi ? 'text-green-600' : 'text-orange-600'}`}>
                    {acercamiento.haMejorado}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Acercamiento */}
          <div className="bg-gradient-to-r from-success/5 to-success-light/5 rounded-2xl p-6 border border-success/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Calendar className="text-success" size={20} />
              </div>
              Información del Acercamiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Fecha del Acercamiento</label>
                <p className="text-gray-900 font-medium">{formatearFecha(acercamiento.fecha)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Lugar de Trabajo</label>
                <p className="text-gray-900 font-medium">{acercamiento.lugarTrabajo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Área</label>
                <p className="text-gray-900 font-medium">{acercamiento.area || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Lugar del Acercamiento</label>
                <p className="text-gray-900 font-medium">{acercamiento.lugarAcercamiento || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-600">Seguimiento</label>
                <p className="text-gray-900 font-medium">{acercamiento.seguimiento || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Estado de ánimo */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 rounded-2xl p-6 border border-emerald-600/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-emerald-600/10 rounded-lg">
                <MessageSquare className="text-emerald-600" size={20} />
              </div>
              Estados de Ánimo
            </h3>
            <div className="flex flex-wrap gap-2">
              {acercamiento.estadosAnimo && acercamiento.estadosAnimo.length > 0 ? (
                acercamiento.estadosAnimo.map((estado, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-600/20"
                  >
                    {estado}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay estados de ánimo registrados</p>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {acercamiento.observaciones && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <FileText className="text-gray-600" size={20} />
                </div>
                Observaciones
              </h3>
              <p className="text-gray-700 leading-relaxed">{acercamiento.observaciones}</p>
            </div>
          )}

          {/* Fechas de Creación */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Acercamiento creado el {formatearFecha(acercamiento.createdAt)}</p>
            {acercamiento.updatedAt !== acercamiento.createdAt && (
              <p>Última actualización: {formatearFecha(acercamiento.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcercamientoModal;
