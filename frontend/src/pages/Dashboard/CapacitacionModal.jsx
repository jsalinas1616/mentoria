import React from 'react';
import { Users, FileText, BookOpen, User, X } from 'lucide-react';
import { formatearFecha } from '../../utils/validation';

const CapacitacionModal = ({ isOpen, capacitacion, onClose }) => {
  if (!isOpen || !capacitacion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detalles de la Capacitación</h2>
              <p className="text-sm text-gray-600">Información completa del evento</p>
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
          {/* Información Básica */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="text-primary" size={20} />
              </div>
              Información de la Capacitación
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tema</p>
                <p className="text-gray-900 font-medium">{capacitacion.tema || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha</p>
                <p className="text-gray-900 font-medium">{formatearFecha(capacitacion.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Hora</p>
                <p className="text-gray-900 font-medium">{capacitacion.hora || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Duración</p>
                <p className="text-gray-900 font-medium">{capacitacion.duracion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Lugar</p>
                <p className="text-gray-900 font-medium">{capacitacion.lugar || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Personas Invitadas</p>
                <p className="text-gray-900 font-medium">{capacitacion.numeroPersonasInvitadas || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Mentorías Agendadas</p>
                <p className="text-gray-900 font-medium">{capacitacion.numeroMentoriasAgendadas || 0}</p>
              </div>
            </div>
          </div>

          {/* Capacitadores */}
          <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6 border border-accent/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="text-accent" size={20} />
              </div>
              Capacitadores ({capacitacion.capacitadores?.length || 0})
            </h3>
            <div className="space-y-2">
              {capacitacion.capacitadores && capacitacion.capacitadores.length > 0 ? (
                capacitacion.capacitadores.map((capacitador, index) => (
                  <div 
                    key={index}
                    className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3"
                  >
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <User className="text-accent" size={16} />
                    </div>
                    <span className="text-gray-900 font-medium">{capacitador}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay capacitadores registrados</p>
              )}
            </div>
          </div>

          {/* Asistentes */}
          <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="text-secondary" size={20} />
              </div>
              Asistentes ({capacitacion.asistentes?.length || 0})
            </h3>
            <div className="space-y-3">
              {capacitacion.asistentes && capacitacion.asistentes.length > 0 ? (
                capacitacion.asistentes.map((asistente, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <User className="text-secondary" size={16} />
                      </div>
                      <h4 className="font-semibold text-gray-900">Asistente {index + 1}</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Rango de Edad:</span>
                        <span className="ml-2 text-gray-900 font-medium">{asistente.rangoEdad || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Sexo:</span>
                        <span className="ml-2 text-gray-900 font-medium">{asistente.sexo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Lugar de Trabajo:</span>
                        <span className="ml-2 text-gray-900 font-medium">{asistente.lugarTrabajo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Área:</span>
                        <span className="ml-2 text-gray-900 font-medium">{asistente.area || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay asistentes registrados</p>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {capacitacion.observaciones && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <FileText className="text-gray-600" size={20} />
                </div>
                Observaciones
              </h3>
              <p className="text-gray-700 leading-relaxed">{capacitacion.observaciones}</p>
            </div>
          )}

          {/* Fechas de Creación */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Capacitación creada el {formatearFecha(capacitacion.createdAt)}</p>
            {capacitacion.updatedAt !== capacitacion.createdAt && (
              <p>Última actualización: {formatearFecha(capacitacion.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitacionModal;
