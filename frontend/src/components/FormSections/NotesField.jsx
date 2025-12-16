import { FileText } from "lucide-react"

const NotesField = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
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
