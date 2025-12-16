import React from 'react'

const ImprovementField = ({ value, onChange }) => (
  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      ¿Ha mejorado?
    </label>

    <div className="flex gap-6">
      {['Sí', 'No'].map(option => (
        <label key={option} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value={option}
            checked={value === option}
            onChange={e => onChange(e.target.value)}
            className="accent-primary"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
)

export default ImprovementField
