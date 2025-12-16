import React from 'react'

const AgeRangeField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Rango de edad <span className="text-rose">*</span>
    </label>

    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-white border-2 rounded-xl px-4 py-3 focus:outline-none transition-all ${
        error ? 'border-rose focus:ring-rose/20' : 'border-gray-300 focus:ring-primary/20'
      }`}
    >
      <option value="">Selecciona un rango</option>
      <option value="18-25">18 - 25 años</option>
      <option value="26-35">26 - 35 años</option>
      <option value="36-45">36 - 45 años</option>
      <option value="46-55">46 - 55 años</option>
      <option value="56-65">56 - 65 años</option>
      <option value="66-75">66 - 75 años</option>
      <option value="76-80">76 - 80 años</option>
      <option value="80+">80+ años</option>
    </select>

    {error && <p className="text-rose text-sm mt-1">{error}</p>}
  </div>
)

export default AgeRangeField
