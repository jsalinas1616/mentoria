import { useEffect } from "react"
import { Check } from "lucide-react"

const SuccessScreen = ({
  title = "¡Operación exitosa!",
  message = "La información se ha registrado correctamente en el sistema",
  duration = 2000,
  onDone,
}) => {
  useEffect(() => {
    if (!duration) return undefined
    const timer = setTimeout(() => {
      if (onDone) onDone()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDone])

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-soft p-12 md:p-16 border border-primary-100 text-center max-w-md w-full transform animate-in">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-success/20 to-primary/20 rounded-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-success to-primary rounded-full animate-pulse opacity-20"></div>
          <Check size={48} className="text-success relative z-10" strokeWidth={3} />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-3">{title}</h2>
        <div className="h-1 w-24 bg-gradient-primary mx-auto rounded-full mb-4"></div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  )
}

export default SuccessScreen
