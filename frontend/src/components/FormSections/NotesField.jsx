import { FileText } from "lucide-react"

const NotesField = ({ value, onChange }) => {


  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Obervaciones
          </h2>
        </div>
      </div>

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
