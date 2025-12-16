import React from 'react'

const GenderField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Sexo <span className="text-rose">*</span>
    </label>

    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-white border-2 rounded-xl px-4 py-3 focus:outline-none transition-all ${
        error ? 'border-rose focus:ring-rose/20' : 'border-gray-300 focus:ring-primary/20'
      }`}
    >
        <option value="">Selecciona una opción</option>
        <option value="Hombre">Hombre</option>
        <option value="Mujer">Mujer</option>
        <option value="Diversidad">Diversidad</option>
    </select>

    {error && <p className="text-rose text-sm mt-1">{error}</p>}
  </div>
)

export default GenderField
