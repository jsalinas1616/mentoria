import { useState } from "react"

import FormShell from "../FormSections/FormShell"

// campos reutilizables
import SessionTypeField from "../FormSections/SessionTypeField"
import FacilitatorsSection from "../FormSections/FacilitatorsSection"
import SessionDateSection from "../FormSections/SessionDateSection"
import AgeRangeField from "../FormSections/AgeRangeField"
import GenderField from "../FormSections/GenderField"
import SessionNumberField from "../FormSections/SessionNumberField"
import ImprovementField from "../FormSections/ImprovementField"
import WorkplaceField from "../FormSections/WorkplaceField"
import AreaField from "../FormSections/AreaField"
import SessionLocationField from "../FormSections/SessionLocationField"
import ReasonsField from "../FormSections/ReasonsField"
import NotesField from "../FormSections/NotesField"

// data
import motivosConsultaData from "../../data/motivosConsulta.json"

// services (NO se tocan)
import { entrevistasService, consultasService } from "../../services/api"

const FormularioSesion = ({ onSuccess, onCancel, userMode = "publico" }) => {
  const [formData, setFormData] = useState({
    tipoSesion: "",
    facilitadores: [],
    fecha: "",
    rangoEdad: "",
    sexo: "",
    numeroSesion: "",
    haMejorado: "",
    lugarTrabajo: "",
    area: "",
    lugarSesion: "",
    motivos: [],
    observaciones: "",
  })

  const update = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 🔁 mapeo limpio hacia backend
    if (formData.tipoSesion === "ENTREVISTA") {
      await entrevistasService.crear({
        entrevistadores: formData.facilitadores,
        fecha: formData.fecha,
        rangoEdad: formData.rangoEdad,
        sexo: formData.sexo,
        numeroSesion: formData.numeroSesion,
        haMejorado: formData.haMejorado,
        lugarTrabajo: formData.lugarTrabajo,
        area: formData.area,
        lugarEntrevista: formData.lugarSesion,
        motivosEntrevista: formData.motivos,
        observaciones: formData.observaciones,
      })
    }

    if (formData.tipoSesion === "CONSULTA") {
      await consultasService.crear({
        mentores: formData.facilitadores,
        fecha: formData.fecha,
        rangoEdad: formData.rangoEdad,
        sexo: formData.sexo,
        numeroSesion: formData.numeroSesion,
        haMejorado: formData.haMejorado,
        lugarTrabajo: formData.lugarTrabajo,
        area: formData.area,
        lugarConsulta: formData.lugarSesion,
        motivosConsulta: formData.motivos,
        observaciones: formData.observaciones,
      })
    }

    if (onSuccess) onSuccess()
  }

  return (
    <FormShell
      title="Mentoría Integral"
      logoAlt="Nadro Sesión"
      userMode={userMode}
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Tipo de sesión */}
        <SessionTypeField
          value={formData.tipoSesion}
          onChange={(v) => update("tipoSesion", v)}
        />

        {/* Facilitadores */}
        <FacilitatorsSection
          label={
            formData.tipoSesion === "ENTREVISTA"
              ? "Entrevistadores"
              : "Mentores"
          }
          value={formData.facilitadores}
          onChange={(v) => update("facilitadores", v)}
        />

        {/* Fecha */}
        <SessionDateSection
          value={formData.fecha}
          onChange={(v) => update("fecha", v)}
        />

        {/* Demográficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AgeRangeField
            value={formData.rangoEdad}
            onChange={(v) => update("rangoEdad", v)}
          />

          <GenderField
            value={formData.sexo}
            onChange={(v) => update("sexo", v)}
          />

          <SessionNumberField
            value={formData.numeroSesion}
            onChange={(v) => update("numeroSesion", v)}
          />
        </div>

        {formData.numeroSesion > 1 && (
          <ImprovementField
            value={formData.haMejorado}
            onChange={(v) => update("haMejorado", v)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkplaceField
            value={formData.lugarTrabajo}
            onChange={(v) => update("lugarTrabajo", v)}
          />

          <AreaField
            value={formData.area}
            onChange={(v) => update("area", v)}
          />
        </div>

        <SessionLocationField
          value={formData.lugarSesion}
          onChange={(v) => update("lugarSesion", v)}
          label={
            formData.tipoSesion === "ENTREVISTA"
              ? "Lugar de entrevista"
              : "Lugar de consulta"
          }
        />

        <ReasonsField
          options={motivosConsultaData}
          value={formData.motivos}
          onChange={(v) => update("motivos", v)}
          label={
            formData.tipoSesion === "ENTREVISTA"
              ? "Motivos de entrevista"
              : "Motivos de consulta"
          }
        />

        <NotesField
          value={formData.observaciones}
          onChange={(v) => update("observaciones", v)}
        />

        <button
          type="submit"
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl"
        >
          Guardar sesión
        </button>
      </form>
    </FormShell>
  )
}

export default FormularioSesion
