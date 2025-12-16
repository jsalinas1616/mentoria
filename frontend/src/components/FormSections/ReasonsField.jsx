const ReasonsField = ({ options = [], value = [], onChange, label, error }) => {
  const toggle = (reason) => {
    if (value.includes(reason)) {
      onChange(value.filter((r) => r !== reason))
    } else {
      onChange([...value, reason])
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} <span className="text-rose">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((reason) => (
          <label
            key={reason}
            className={`flex items-start gap-2 p-3 border-2 rounded-xl cursor-pointer ${
              value.includes(reason)
                ? "border-primary bg-primary/5"
                : "border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={value.includes(reason)}
              onChange={() => toggle(reason)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">{reason}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-rose text-sm mt-2">{error}</p>}
    </div>
  )
}

export default ReasonsField
