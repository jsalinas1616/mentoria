import { ArrowLeft, LogOut } from 'lucide-react'
import { authService } from '../../services/api'

const FormShell = ({
  title,
  logoAlt = 'Formulario',
  userMode,
  onCancel,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-mesh py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src="/LOGO_Blanco.png"
              alt={logoAlt}
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            </div>
          </div>

          {userMode === 'admin' && (
            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md border border-gray-300"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline text-sm font-medium">
                    Regresar
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  authService.logout()
                  window.location.reload()
                }}
                className="bg-white hover:bg-gray-50 text-rose px-3 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md border border-gray-300"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  Salir
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Contenedor blanco */}
        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
          {children}
        </div>

      </div>
    </div>
  )
}

export default FormShell
