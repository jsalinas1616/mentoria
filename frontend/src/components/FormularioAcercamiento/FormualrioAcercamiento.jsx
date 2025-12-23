import React, { useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import FormShell from "../FormSections/FormShell"

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

import DemographicSection from "../FormSections/DemographicSection"
import DetailsSection from "../FormSections/DetailsSection"
import Outcome from "../FormSections/Outcome"
import SuccessModal from "../Feedback/SuccessModal"
import SuccessScreen from "../Feedback/SuccessScreen"

import { validarRequerido, validarArray } from "../../utils/validation"

import lugaresTrabajoData from "../../data/lugaresTrabajo.json"
import areasData from "../../data/areas.json"
import estadosAnimo from "../../data/estadosAnimo.json"
import { acercamientosService } from "../../services/api"

const FormularioAcercamiento = ({ onSuccess, onCancel, userMode = "publico" }) => {
  const initialFormData = () => ({
    mentores: [],
    fecha: new Date().toISOString().split("T")[0],

    rangoEdad: "",
    sexo: "",
    numeroAcercamiento: "",
    haMejorado: "",

    lugarTrabajo: "",
    area: "",
    lugarAcercamiento: "",

    seguimiento:"",

    estadosAnimo: [],
    observaciones: "",
  })

  const [formData, setFormData] = useState(initialFormData())
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!validarArray(formData.mentores))
      newErrors.mentores = "Agrega al menos una persona"

    if (!validarRequerido(formData.fecha))
      newErrors.fecha = "La fecha es requerida"

    if (!validarRequerido(formData.rangoEdad))
      newErrors.rangoEdad = "El rango de edad es requerido"

    if (!validarRequerido(formData.sexo))
      newErrors.sexo = "El sexo es requerido"

    if (!validarRequerido(formData.numeroAcercamiento))
      newErrors.numeroAcercamiento = "El número de acercamiento es requerido"

    if (!validarRequerido(formData.lugarTrabajo))
      newErrors.lugarTrabajo = "El lugar de trabajo es requerido"

    if (!validarRequerido(formData.area))
      newErrors.area = "El área es requerida"

    if (!validarRequerido(formData.lugarAcercamiento))
      newErrors.lugarAcercamiento = "El lugar del acercamiento es requerido"

    if (!validarRequerido(formData.seguimiento))
      newErrors.seguimiento = "El seguimiento es requerido"

    if (!validarArray(formData.estadosAnimo))
      newErrors.estadosAnimo = "Selecciona al menos un estado de ánimo"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildAcercamientoPayload = () => ({
    mentores: formData.mentores,
    fecha: formData.fecha,
    rangoEdad: formData.rangoEdad,
    sexo: formData.sexo,
    numeroAcercamiento: formData.numeroAcercamiento,
    haMejorado: formData.haMejorado,
    lugarTrabajo: formData.lugarTrabajo,
    area: formData.area,
    lugarAcercamiento: formData.lugarAcercamiento,
    seguimiento: formData.seguimiento,
    estadosAnimo: formData.estadosAnimo,
    observaciones: formData.observaciones,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    try {
      //aqui va el servicio de los acercamientos
        await acercamientosService.crear(buildAcercamientoPayload())


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

        <FacilitatorsSection
          label="Mentores"
          value={formData.mentores}
          onChange={(list) => setFormData((p) => ({ ...p, mentores: list }))}
          error={errors.mentores}
        />

        <SessionDateSection
          label="Datos del acercamiento"
          value={formData.fecha}
          onChange={(v) => setFormData((p) => ({ ...p, fecha: v }))}
          error={errors.fecha}
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
            value={formData.numeroAcercamiento}
            onChange={(v) => setFormData((p) => ({ ...p, numeroAcercamiento: v }))}
            error={errors.numeroAcercamiento}
          />

          {Number(formData.numeroAcercamiento) > 1 && (
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
            value={formData.lugarAcercamiento}
            onChange={(v) => setFormData((p) => ({ ...p, lugarAcercamiento: v }))}
            error={errors.lugarAcercamiento}
          />

          <ReasonsField
            title="Estado de ánimo"
            value={formData.estadosAnimo}
            onChange={(list) => setFormData((p) => ({ ...p, estadosAnimo: list }))}
            error={errors.estadosAnimo}
            options={estadosAnimo}
          />

          <Outcome
            value={formData.seguimiento}
            onChange={(v) => setFormData((p) => ({ ...p, seguimiento: v }))}
            error={errors.seguimiento}
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
