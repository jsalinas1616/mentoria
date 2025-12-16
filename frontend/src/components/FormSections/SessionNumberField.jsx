import React from 'react'

const SessionNumberField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Número de sesión <span className="text-rose">*</span>
    </label>

    <input
      type="number"
      min="1"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Ej. 1, 2, 3..."
      className={`w-full bg-white border-2 rounded-xl px-4 py-3 focus:outline-none transition-all ${
        error ? 'border-rose focus:ring-rose/20' : 'border-gray-300 focus:ring-primary/20'
      }`}
    />

    {error && <p className="text-rose text-sm mt-1">{error}</p>}
  </div>
)

export default SessionNumberField
