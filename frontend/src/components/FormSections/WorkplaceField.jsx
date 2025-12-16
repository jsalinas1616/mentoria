import React from "react"
import { Building2, AlertCircle } from "lucide-react"

const WorkplaceField = ({ value, onChange, options = [], error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Lugar de trabajo <span className="text-rose">*</span>
    </label>

    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Building2 className="h-5 w-5 text-gray-400" />
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border-2 rounded-xl pl-12 pr-4 py-3 focus:outline-none transition-all ${
          error
            ? "border-rose focus:ring-rose/20"
            : "border-gray-300 focus:ring-primary/20"
        }`}
      >
        <option value="">Selecciona un lugar</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>

    {error && (
      <p className="text-rose text-sm mt-1 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
)

export default WorkplaceField
