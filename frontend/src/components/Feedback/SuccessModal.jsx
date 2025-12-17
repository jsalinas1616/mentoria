import { useEffect, useState } from "react"

const SuccessModal = ({
  open = false,
  title = "¡Operación exitosa!",
  message = "La información se ha guardado correctamente.",
  description,
  type = "success",
  onClose,
}) => {
  const [shouldRender, setShouldRender] = useState(open)
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    let showTimer
    let hideTimer
    let closeTimer

    if (open) {
      setShouldRender(true)
      showTimer = setTimeout(() => setVisible(true), 50)
      hideTimer = setTimeout(() => setVisible(false), 3700)
      closeTimer = setTimeout(() => {
        if (onClose) onClose()
        setShouldRender(false)
      }, 4000)
    } else {
      setVisible(false)
      closeTimer = setTimeout(() => setShouldRender(false), 300)
    }

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(closeTimer)
    }
  }, [open, onClose])

  if (!shouldRender) return null

  const isError = type === "error"
  const bgClass = isError ? "bg-red-500 text-white" : "bg-green-500 text-white"
  const icon = isError ? "⚠️" : "✅"

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } ${bgClass}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-lg">{icon}</div>
        <div className="flex-1">
          {title && <p className="font-semibold leading-tight">{title}</p>}
          {message && <p className="font-medium leading-tight">{message}</p>}
          {description && (
            <p className="text-sm opacity-90 leading-snug">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
