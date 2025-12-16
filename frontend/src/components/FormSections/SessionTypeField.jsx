const SessionTypeField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Tipo de sesión <span className="text-rose">*</span>
    </label>

    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border-2 rounded-xl px-4 py-3 ${
        error ? 'border-rose' : 'border-gray-300'
      }`}
    >
      <option value="">Selecciona una opción</option>
      <option value="entrevista">Entrevista</option>
      <option value="consulta">Consulta</option>
    </select>

    {error && <p className="text-rose text-sm mt-1">{error}</p>}
  </div>
)

export default SessionTypeField
