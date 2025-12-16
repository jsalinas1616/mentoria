import { Check, X } from "lucide-react"

const SuccessModal = ({
  open = false,
  title = "¡Operación exitosa!",
  message = "La información se ha guardado correctamente.",
  description,
  actionLabel = "Cerrar",
  onClose,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-primary/10 max-w-lg w-full overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-success/15 to-primary/15 rounded-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-success to-primary rounded-full animate-pulse opacity-15"></div>
          <Check size={36} className="text-success relative z-10" strokeWidth={3} />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-success to-primary rounded-full mb-4"></div>

        <p className="text-gray-700 text-base mb-2">{message}</p>
        {description && (
          <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        )}

        {onClose && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-3 rounded-2xl shadow-md hover:from-primary-dark hover:to-primary transition-all"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuccessModal
