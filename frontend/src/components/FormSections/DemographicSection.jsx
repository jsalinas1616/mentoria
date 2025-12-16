import React from "react"
import { Users } from "lucide-react"
import SectionContainer from "./SectionContainer"

const DemographicSection = ({ children }) => {
  return (
    <SectionContainer
      icon={<Users className="w-6 h-6 text-primary" />}
      title="Datos Demográficos"
      subtitle="Información con fin estadístico"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {children}
      </div>
    </SectionContainer>
  )
}

export default DemographicSection
