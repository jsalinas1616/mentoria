import React from "react"
import { MessageSquare } from "lucide-react"
import SectionContainer from "./SectionContainer"

const DetailsSection = ({ subtitle, children, label }) => {
  return (
    <SectionContainer
      label={label}
      icon={<MessageSquare className="w-6 h-6 text-primary" />}
      title="Detalles"
      subtitle={subtitle}
    >
      {children}
    </SectionContainer>
  )
}

export default DetailsSection
