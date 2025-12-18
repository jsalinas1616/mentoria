import React, { useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import FormShell from "../components/FormSections/FormShell"

import FacilitatorsSection from "../components/FormSections/FacilitatorsSection"
import SessionDateSection from "../components/FormSections/SessionDateSection"

import AgeRangeField from "../components/FormSections/AgeRangeField"
import GenderField from "../components/FormSections/GenderField"
import SessionNumberField from "../components/FormSections/SessionNumberField"
import ImprovementField from "../components/FormSections/ImprovementField"

import WorkplaceField from "../components/FormSections/WorkplaceField"
import AreaField from "../components/FormSections/AreaField"
import SessionLocationField from "../components/FormSections/SessionLocationField"
import ReasonsField from "../components/FormSections/ReasonsField"
import NotesField from "../components/FormSections/NotesField"

import DemographicSection from "../components/FormSections/DemographicSection"
import DetailsSection from "../components/FormSections/DetailsSection"
import SuccessModal from "../components/Feedback/SuccessModal"
import SuccessScreen from "../components/Feedback/SuccessScreen"

import { entrevistasService, consultasService } from "../services/api"
import { validarRequerido, validarArray } from "../utils/validation"

import lugaresTrabajoData from "../data/lugaresTrabajo.json"
import areasData from "../data/areas.json"
import estadosAnimo from "../data/estadosAnimo.json"

const FormularioAcercamiento = ({ onSuccess, onCancel, userMode = "publico" }) => {
  const initialFormData = () => ({
    sessionType: "mentoria",
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const isEntrevista = (formData.sessionType || "").toLowerCase() === "entrevista"

  const validateForm = () => {
    const newErrors = {}

    if (!validarRequerido(formData.sessionType))
      newErrors.sessionType = "Selecciona el tipo de sesión"

    if (!validarArray(formData.facilitators))
      newErrors.facilitators = "Agrega al menos una persona"

    if (!validarRequerido(formData.fecha))
      newErrors.fecha = "La fecha es requerida"

    if (!validarRequerido(formData.rangoEdad))
      newErrors.rangoEdad = "El rango de edad es requerido"

    if (!validarRequerido(formData.sexo))
      newErrors.sexo = "El sexo es requerido"

    if (!validarRequerido(formData.numeroSesion))
      newErrors.numeroSesion = "El número de sesión es requerido"

    if (!validarRequerido(formData.lugarTrabajo))
      newErrors.lugarTrabajo = "El lugar de trabajo es requerido"

    if (!validarRequerido(formData.area))
      newErrors.area = "El área es requerida"

    if (!validarRequerido(formData.lugarSesion))
      newErrors.lugarSesion = "El lugar de la sesión es requerido"

    if (!validarArray(formData.motivos))
      newErrors.motivos = "Selecciona al menos un motivo"

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
    try {
      if (isEntrevista) {
        await entrevistasService.crear(buildEntrevistaPayload())
      } else {
        await consultasService.crear(buildConsultaPayload())
      }
      setShowSuccessScreen(true)
      setShowSuccessToast(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessDone = () => {
    setShowSuccessScreen(false)
    setShowSuccessToast(false)
    if (onSuccess) onSuccess()
  }

  const handleClear = () => {
    setFormData(initialFormData())
    setErrors({})
    setShowSuccessScreen(false)
    setShowSuccessToast(false)
  }

  if (showSuccessScreen) {
    return (
      <>
        <SuccessModal
          open={showSuccessToast}
          title="Acercamiento Guardado"
          message="La información se registró correctamente en el sistema."
          onClose={() => setShowSuccessToast(false)}
        />
        <SuccessScreen
          title="Acercamiento Guardado"
          message="La información se ha registrado correctamente en el sistema."
          onDone={handleSuccessDone}
        />
      </>
    )
  }

  return (
    <FormShell
      title="Mentoría Integral"
      logoAlt="Nadro Sesión"
      userMode={userMode}
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* <SessionTypeField
          value={formData.sessionType}
          onChange={(v) => setFormData((p) => ({ ...p, sessionType: v }))}
          error={errors.sessionType}
        /> */}

        <FacilitatorsSection
          value={formData.facilitators}
          onChange={(list) => setFormData((p) => ({ ...p, facilitators: list }))}
          label={isEntrevista ? "Entrevistadores" : "Mentores"}
          error={errors.facilitators}
        />

        <SessionDateSection
          value={formData.fecha}
          onChange={(v) => setFormData((p) => ({ ...p, fecha: v }))}
          error={errors.fecha}
          label="Datos del acercamiento"
        />

        <DemographicSection>
          <AgeRangeField
            value={formData.rangoEdad}
            onChange={(v) => setFormData((p) => ({ ...p, rangoEdad: v }))}
            error={errors.rangoEdad}
          />

          <GenderField
            value={formData.sexo}
            onChange={(v) => setFormData((p) => ({ ...p, sexo: v }))}
            error={errors.sexo}
          />

          <SessionNumberField
            label="Número de acercamietos"
            value={formData.numeroSesion}
            onChange={(v) => setFormData((p) => ({ ...p, numeroSesion: v }))}
            error={errors.numeroSesion}
          />

          {Number(formData.numeroSesion) > 1 && (
            <div className="md:col-span-1">
              <ImprovementField
                value={formData.haMejorado}
                onChange={(v) => setFormData((p) => ({ ...p, haMejorado: v }))}
              />
            </div>
          )}

          <div className="md:col-span-1">
            <WorkplaceField
              value={formData.lugarTrabajo}
              onChange={(v) => setFormData((p) => ({ ...p, lugarTrabajo: v }))}
              options={lugaresTrabajoData}
              error={errors.lugarTrabajo}
            />
          </div>

          <div className="md:col-span-1">
            <AreaField
              value={formData.area}
              onChange={(v) => setFormData((p) => ({ ...p, area: v }))}
              options={areasData}
              error={errors.area}
            />
          </div>
        </DemographicSection>

        <DetailsSection
          title="Detalles del acercamiento"
          subtitle="lugar del acercamiento"
        >
          <SessionLocationField
            label="Lugar del acercamiento"
            value={formData.lugarSesion}
            onChange={(v) => setFormData((p) => ({ ...p, lugarSesion: v }))}
            error={errors.lugarSesion}
          />

          <ReasonsField
            title="Estado de ánimo"
            value={formData.motivos}
            onChange={(list) => setFormData((p) => ({ ...p, motivos: list }))}
            error={errors.motivos}
            options={estadosAnimo}
          />
        </DetailsSection>

        <NotesField
          value={formData.observaciones}
          onChange={(v) => setFormData((p) => ({ ...p, observaciones: v }))}
        />

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="flex-1 bg-white border-2 border-gray-300 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            LIMPIAR FORMULARIO
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? "GUARDANDO..." : "GUARDAR ACERCAMIENTO"}
          </button>
        </div>
      </form>
    </FormShell>
  )
}

export default FormularioAcercamiento
