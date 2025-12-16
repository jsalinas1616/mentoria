import { useState } from "react"
import { User, Plus, X, AlertCircle } from "lucide-react"

const FacilitatorsSection = ({
  label = "Facilitadores",
  value = [],
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState("")

  const handleAdd = () => {
    const name = inputValue.trim()
    if (!name) return
    if (value.includes(name)) return

    onChange([...value, name])
    setInputValue("")
  }

  const handleRemove = (name) => {
    onChange(value.filter((item) => item !== name))
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Datos del mentor
          </h2>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>

      <label className="block text-sm font-semibold text-gray-700">
        {label} <span className="text-rose">*</span>
      </label>

      {/* Input + botón */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del mentor"
            className="w-full border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          Agregar
        </button>
      </div>

      {/* Lista */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-2"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <User size={16} />
                <span className="font-medium">{name}</span>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(name)}
                className="p-2 hover:bg-red-100 rounded-lg"
              >
                <X size={16} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-rose text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </section>
  )
}

export default FacilitatorsSection
