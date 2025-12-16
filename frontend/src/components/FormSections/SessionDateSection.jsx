import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar, AlertCircle } from "lucide-react"

const SessionDateSection = ({
  value,
  onChange,
  error,
  label = "Datos de la sesion",
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
          <Calendar className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {label}
          </h2>
          <p className="text-sm text-gray-600">Informacion general</p>
        </div>
      </div>

      <label className="block text-sm font-semibold text-gray-700">
        {label} <span className="text-rose">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>

        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={(date) => {
            const isoDate = date ? date.toISOString().split("T")[0] : ""
            onChange(isoDate)
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText="DD/MM/AAAA"
          className={`w-full bg-white border-2 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all
            ${
              error
                ? "border-rose focus:border-rose"
                : "border-gray-300 focus:border-primary"
            }`}
          wrapperClassName="w-full"
          calendarClassName="bg-white shadow-lg rounded-xl border border-gray-200"
        />
      </div>

      {error && (
        <p className="text-rose text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </section>
  )
}

export default SessionDateSection
