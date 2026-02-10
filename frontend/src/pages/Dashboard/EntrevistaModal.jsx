import React from 'react';
import { Users, FileText, Calendar, MessageSquare, User, X } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const EntrevistaModal = ({ isOpen, entrevista, onClose }) => {
  if (!isOpen || !entrevista) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
              <FileText className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detalles de la Entrevista</h2>
              <p className="text-sm text-gray-600">Información completa de la entrevista</p>
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
          {/* Entrevistadores */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="text-primary" size={20} />
              </div>
              Entrevistadores ({entrevista.entrevistadores?.length || 0})
            </h3>
            <div className="space-y-2">
              {entrevista.entrevistadores && entrevista.entrevistadores.length > 0 ? (
                entrevista.entrevistadores.map((entrevistador, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-3 border border-primary/10"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-gray-900 font-medium">{entrevistador}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay entrevistadores asignados</p>
              )}
            </div>
          </div>

          {/* Datos demogrÇ­ficos */}
          <div className="bg-gradient-to-r from-accent/5 to-accent-light/5 rounded-2xl p-6 border border-accent/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="text-accent" size={20} />
              </div>
              Datos Demográ­ficos (Confidencial)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Rango de Edad</label>
                <p className="text-gray-900 font-medium">{entrevista.rangoEdad || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Sexo</label>
                <p className="text-gray-900 font-medium">{entrevista.sexo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Número de Sesión</label>
                <p className="text-gray-900 font-medium">{entrevista.numeroSesion || 'N/A'}</p>
              </div>
              {entrevista.numeroSesion && parseInt(entrevista.numeroSesion, 10) > 1 && entrevista.haMejorado && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">¿Ha mejorado?</label>
                  <p className={`font-bold ${entrevista.haMejorado === 'SÍ' ? 'text-green-600' : 'text-orange-600'}`}>
                    {entrevista.haMejorado}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información de la Entrevista */}
          <div className="bg-gradient-to-r from-success/5 to-success-light/5 rounded-2xl p-6 border border-success/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Calendar className="text-success" size={20} />
              </div>
              Información de la Entrevista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Fecha de Entrevista</label>
                <p className="text-gray-900 font-medium">{formatearFecha(entrevista.fecha)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Lugar de Trabajo</label>
                <p className="text-gray-900 font-medium">{entrevista.lugarTrabajo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Área</label>
                <p className="text-gray-900 font-medium">{entrevista.area || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Lugar de Entrevista</label>
                <p className="text-gray-900 font-medium">{entrevista.lugarConsulta || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Motivos de Entrevista */}
          <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="text-primary" size={20} />
              </div>
              Motivos de Entrevista
            </h3>
            <div className="flex flex-wrap gap-2">
              {entrevista.motivosEntrevista?.map((motivo, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                >
                  {motivo}
                </span>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          {entrevista.observaciones && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <FileText className="text-gray-600" size={20} />
                </div>
                Observaciones
              </h3>
              <p className="text-gray-700 leading-relaxed">{entrevista.observaciones}</p>
            </div>
          )}

          {/* Fechas de CreaciÇün */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Entrevista creada el {formatearFecha(entrevista.createdAt)}</p>
            {entrevista.updatedAt !== entrevista.createdAt && (
              <p>Çsltima actualizaciÇün: {formatearFecha(entrevista.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrevistaModal;
