const NotesField = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Observaciones
      </label>

      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Agrega comentarios u observaciones adicionales (opcional)"
        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 resize-none"
      />
    </div>
  )
}

export default NotesField
