import React from "react"

const SectionContainer = ({ icon, title, subtitle, children }) => {
  return (
    <div className="space-y-6 pt-6 border-t-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  )
}

export default SectionContainer