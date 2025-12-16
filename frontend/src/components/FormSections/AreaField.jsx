import React, { useMemo, useState } from "react"
import { AlertCircle, Search } from "lucide-react"

const AreaField = ({ value, onChange, options = [], error }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return options.filter((area) => area.toLowerCase().includes(term))
  }, [options, searchTerm])

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Area <span className="text-rose">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 rounded-xl pl-11 pr-4 py-3 mb-2 focus:outline-none focus:ring-primary/20"
        />
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={5}
        className={`w-full bg-white border-2 rounded-xl px-4 py-2 focus:outline-none transition-all ${
          error ? "border-rose focus:ring-rose/20" : "border-gray-300 focus:ring-primary/20"
        }`}
      >
        <option value="">Selecciona un area</option>
        {filteredOptions.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-rose text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  )
}

export default AreaField
