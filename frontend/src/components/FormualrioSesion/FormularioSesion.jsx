import React, { useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import FormShell from "../FormSections/FormShell"

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

import { entrevistasService, consultasService } from "../../services/api"
import { validarRequerido, validarArray } from "../../utils/validation"
import lugaresTrabajoData from "../../data/lugaresTrabajo.json"
import areasData from "../../data/areas.json"

const FormularioSesion = ({ onSuccess, onCancel, userMode = "publico" }) => {
  const initialFormData = () => ({
    sessionType: "", // entrevista | consulta

    facilitators: [],

    fecha: new Date().toISOString().split("T")[0],

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

  const [formData, setFormData] = useState(initialFormData())

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!validarRequerido(formData.sessionType)) {
      newErrors.sessionType = "Selecciona el tipo de sesion"
    }

    if (!validarArray(formData.facilitators)) {
      newErrors.facilitators = "Agrega al menos una persona"
    }

    if (!validarRequerido(formData.fecha)) {
      newErrors.fecha = "La fecha es requerida"
    }

    if (!validarRequerido(formData.rangoEdad)) {
      newErrors.rangoEdad = "El rango de edad es requerido"
    }

    if (!validarRequerido(formData.sexo)) {
      newErrors.sexo = "El sexo es requerido"
    }

    if (!validarRequerido(formData.numeroSesion)) {
      newErrors.numeroSesion = "El numero de sesion es requerido"
    }

    if (!validarRequerido(formData.lugarTrabajo)) {
      newErrors.lugarTrabajo = "El lugar de trabajo es requerido"
    }

    if (!validarRequerido(formData.area)) {
      newErrors.area = "El area es requerida"
    }

    if (!validarRequerido(formData.lugarSesion)) {
      newErrors.lugarSesion = "El lugar de la sesion es requerido"
    }

    if (!validarArray(formData.motivos)) {
      newErrors.motivos = "Selecciona al menos un motivo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildEntrevistaPayload = () => ({
    entrevistadores: formData.facilitators,
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

  const buildConsultaPayload = () => ({
    mentores: formData.facilitators,
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    const sessionTypeNormalized = (formData.sessionType || "").toLowerCase()
    const isEntrevista =
      sessionTypeNormalized === "entrevista" ||
      sessionTypeNormalized === "interview"
    const isConsulta =
      sessionTypeNormalized === "consulta" ||
      sessionTypeNormalized === "consultation"

    try {
      if (isEntrevista) {
        await entrevistasService.crear(buildEntrevistaPayload())
      }

      if (isConsulta) {
        await consultasService.crear(buildConsultaPayload())
      }

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error al guardar sesion:", error)
    } finally {
      setLoading(false)
    }
  }

  const isEntrevistaLabel =
    (formData.sessionType || "").toLowerCase() === "entrevista" ||
    (formData.sessionType || "").toLowerCase() === "interview"

  const handleClear = () => {
    setFormData(initialFormData())
    setErrors({})
  }

  return (
    <FormShell
      title="Mentoria Integral"
      logoAlt="Nadro Sesion"
      userMode={userMode}
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-10">

        <SessionTypeField
          value={formData.sessionType}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, sessionType: v }))
          }
          error={errors.sessionType}
        />

        <FacilitatorsSection
          value={formData.facilitators}
          onChange={(list) =>
            setFormData(prev => ({ ...prev, facilitators: list }))
          }
          label={
            isEntrevistaLabel
              ? "Entrevistadores"
              : "Mentores"
          }
          error={errors.facilitators}
        />

        <SessionDateSection
          value={formData.fecha}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, fecha: v }))
          }
          error={errors.fecha}
        />

        <AgeRangeField
          value={formData.rangoEdad}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, rangoEdad: v }))
          }
          error={errors.rangoEdad}
        />

        <GenderField
          value={formData.sexo}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, sexo: v }))
          }
          error={errors.sexo}
        />

        <SessionNumberField
          value={formData.numeroSesion}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, numeroSesion: v }))
          }
          error={errors.numeroSesion}
        />

        <ImprovementField
          visible={Number(formData.numeroSesion) > 1}
          value={formData.haMejorado}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, haMejorado: v }))
          }
        />

        <WorkplaceField
          value={formData.lugarTrabajo}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, lugarTrabajo: v }))
          }
          options={lugaresTrabajoData}
          error={errors.lugarTrabajo}
        />

        <AreaField
          value={formData.area}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, area: v }))
          }
          options={areasData}
          error={errors.area}
        />

        <SessionLocationField
          value={formData.lugarSesion}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, lugarSesion: v }))
          }
          error={errors.lugarSesion}
        />

        <ReasonsField
          value={formData.motivos}
          onChange={(list) =>
            setFormData(prev => ({ ...prev, motivos: list }))
          }
          error={errors.motivos}
        />

        <NotesField
          value={formData.observaciones}
          onChange={(v) =>
            setFormData(prev => ({ ...prev, observaciones: v }))
          }
        />

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md border-2 border-gray-300"
          >
            <RotateCcw size={20} />
            LIMPIAR FORMULARIO
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{loading ? "GUARDANDO..." : "GUARDAR SESION"}</span>
          </button>
        </div>
      </form>
    </FormShell>
  )
}

export default FormularioSesion
