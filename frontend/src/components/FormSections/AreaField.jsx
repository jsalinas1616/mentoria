import React from 'react'

const AreaField = ({ value, onChange, options = [], searchValue, onSearch, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Área <span className="text-rose">*</span>
    </label>

    <input
      type="text"
      placeholder="Buscar área..."
      value={searchValue}
      onChange={e => onSearch(e.target.value)}
      className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 mb-2 focus:outline-none focus:ring-primary/20"
    />

    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      size={5}
      className={`w-full bg-white border-2 rounded-xl px-4 py-2 focus:outline-none transition-all ${
        error ? 'border-rose focus:ring-rose/20' : 'border-gray-300 focus:ring-primary/20'
      }`}
    >
      <option value="">Selecciona un área</option>
      {options.map(area => (
        <option key={area} value={area}>{area}</option>
      ))}
    </select>

    {error && <p className="text-rose text-sm mt-1">{error}</p>}
  </div>
)

export default AreaField
