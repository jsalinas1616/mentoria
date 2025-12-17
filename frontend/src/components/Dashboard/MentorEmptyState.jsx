import React from 'react';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import MentoriaIllustration from './MentoriaIllustration';

const MentorEmptyState = ({ onNuevaMentoria, onNuevaCapacitacion, userName }) => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Ilustración */}
        <div className="mb-8 animate-fade-in">
          <MentoriaIllustration />
        </div>

        {/* Mensaje de Bienvenida */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-primary w-8 h-8" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ¡Bienvenido a Nadro Mentoría!
          </h1>
          
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Hola <span className="font-semibold text-primary">{userName}</span>, 
            comienza registrando tus sesiones de mentoría y capacitación
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>Registra tus mentorías</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75"></div>
              <span>Organiza capacitaciones</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
              <span>Consulta tu historial</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Botón Nueva Mentoría */}
          <button
            onClick={onNuevaMentoria}
            className="group relative w-full sm:w-auto bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-5 px-10 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Plus className="w-6 h-6" />
              <span className="text-lg">Nueva Sesión</span>
            </div>
          </button>

          {/* Botón Nueva Capacitación */}
          <button
            onClick={onNuevaCapacitacion}
            className="group relative w-full sm:w-auto bg-white hover:bg-gray-50 text-primary font-bold py-5 px-10 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] shadow-lg border-2 border-primary/20 hover:border-primary/40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-center gap-3">
              <BookOpen className="w-6 h-6" />
              <span className="text-lg">Nueva Capacitación</span>
            </div>
          </button>
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Registra Mentorías</h3>
            <p className="text-sm text-gray-600">
              Documenta tus sesiones individuales con empleados y da seguimiento a su progreso
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Organiza Capacitaciones</h3>
            <p className="text-sm text-gray-600">
              Programa y gestiona sesiones grupales de formación y desarrollo
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 border border-amber-200/50 hover:border-amber-300/50 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Crea Impacto Real</h3>
            <p className="text-sm text-gray-600">
              Una conversación puede cambiar una vida. Comienza tu próxima mentoría ahora
            </p>
          </div>
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default MentorEmptyState;

