import React from "react"
import { MessageSquare } from "lucide-react"
import SectionContainer from "./SectionContainer"

const DetailsSection = ({ subtitle, children, label, title }) => {
  return (
    <SectionContainer
      // label={label}
      icon={<MessageSquare className="w-6 h-6 text-primary" />}
      title={title}
      subtitle={subtitle}
    >
      {children}
    </SectionContainer>
  )
}

export default DetailsSection
