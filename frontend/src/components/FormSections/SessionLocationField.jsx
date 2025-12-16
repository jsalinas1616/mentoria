import { MapPin, AlertCircle } from "lucide-react"
import lugaresConsultaData from "../../data/lugaresConsulta.json"

const SessionLocationField = ({
  value,
  onChange,
  label = "Lugar de sesion",
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} <span className="text-rose">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border-2 rounded-xl pl-12 pr-4 py-3 ${
            error
              ? "border-rose focus:border-rose"
              : "border-gray-300 focus:border-primary"
          }`}
        >
          <option value="">Selecciona un lugar</option>
          {lugaresConsultaData.map((lugar) => (
            <option key={lugar} value={lugar}>
              {lugar}
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
}

export default SessionLocationField
