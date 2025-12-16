import { AlertCircle } from "lucide-react"

const ReasonsField = ({
  options = [],
  value = [],
  onChange,
  label = "Motivo(s)",
  helper,
  error,
}) => {
  const toggle = (reason) => {
    if (value.includes(reason)) {
      onChange(value.filter((r) => r !== reason))
    } else {
      onChange([...value, reason])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label} <span className="text-rose">*</span>
        </label>
        {helper && (
          <span className="text-xs text-gray-500">{helper}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-cream rounded-2xl border-2 border-gray-100">
        {options.map((reason) => {
          const selected = value.includes(reason)
          return (
            <label
              key={reason}
              className={`flex items-start space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selected
                  ? "bg-gradient-to-br from-primary/10 to-leaf/10 border-2 border-primary shadow-md"
                  : "bg-white border-2 border-gray-300 hover:border-primary/50 hover:shadow"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(reason)}
                className="w-5 h-5 accent-primary rounded-md mt-0.5 cursor-pointer"
              />
              <span
                className={`text-sm leading-tight ${
                  selected ? "text-primary font-semibold" : "text-gray-700"
                }`}
              >
                {reason}
              </span>
            </label>
          )
        })}
      </div>

      {error && (
        <p className="text-rose text-sm mt-1.5 flex items-center gap-1.5 bg-maple/5 p-3 rounded-xl">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  )
}

export default ReasonsField
