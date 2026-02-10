import React, { useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import FormShell from "../components/FormSections/FormShell"

import FacilitatorsSection from "../components/FormSections/FacilitatorsSection"
import SessionDateSection from "../components/FormSections/SessionDateSection"

import AgeRangeField from "../components/FormSections/AgeRangeField"
import GenderField from "../components/FormSections/GenderField"
import AreaField from "../components/FormSections/AreaField"
import NotesField from "../components/FormSections/NotesField"

import DemographicSection from "../components/FormSections/DemographicSection"
import SuccessModal from "../components/Feedback/SuccessModal"
import SuccessScreen from "../components/Feedback/SuccessScreen"

import { validarRequerido, validarArray, obtenerFechaHoyLocal } from "../utils/validation"

import areasData from "../data/areas.json"
import { visitasService } from "../services/api"

const lugaresVisita = ["Domicilio", "Hospital", "Reclusorio", "Funeral"]
const parentescoOpciones = ["Madre", "Padre", "Hijos", "Pareja", "Otro"]

const FormularioVisita = ({ onSuccess, onCancel, userMode = "publico" }) => {
  const initialFormData = () => ({
    mentores: [],
    fecha: obtenerFechaHoyLocal(),
    lugarVisita: "",
    rangoEdad: "",
    sexo: "",
    parentesco: "",
    areaPersonal: "",
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

    if (!validarRequerido(formData.lugarVisita))
      newErrors.lugarVisita = "El lugar de visita es requerido"

    if (!validarRequerido(formData.rangoEdad))
      newErrors.rangoEdad = "El rango de edad es requerido"

    if (!validarRequerido(formData.sexo))
      newErrors.sexo = "El sexo es requerido"

    if (!validarRequerido(formData.parentesco))
      newErrors.parentesco = "El parentesco es requerido"

    if (!validarRequerido(formData.areaPersonal))
      newErrors.areaPersonal = "El área de personal es requerida"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildVisitaPayload = () => ({
    mentores: formData.mentores,
    fecha: formData.fecha,
    lugarVisita: formData.lugarVisita,
    rangoEdad: formData.rangoEdad,
    sexo: formData.sexo,
    parentesco: formData.parentesco,
    areaPersonal: formData.areaPersonal,
    observaciones: formData.observaciones,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await visitasService.crear(buildVisitaPayload())
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
          title="Visita Guardada"
          message="La información se registró correctamente en el sistema."
          onClose={() => setShowSuccessToast(false)}
        />
        <SuccessScreen
          title="Visita Guardada"
          message="La información se ha registrado correctamente en el sistema."
          onDone={handleSuccessDone}
        />
      </>
    )
  }

  return (
    <FormShell
      title="Visita"
      logoAlt="Nadro Visita"
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
          label="Datos de la visita"
          value={formData.fecha}
          onChange={(v) => setFormData((p) => ({ ...p, fecha: v }))}
          error={errors.fecha}
        />

        {/* Lugar de la visita */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Lugar de la visita</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Lugar de la visita *
            </label>
            
            {lugaresVisita.map((lugar) => (
              <label
                key={lugar}
                className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-all"
              >
                <input
                  type="radio"
                  name="lugarVisita"
                  value={lugar}
                  checked={formData.lugarVisita === lugar}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, lugarVisita: e.target.value }))
                  }
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <span className="text-gray-900 font-medium">{lugar}</span>
              </label>
            ))}
            
            {errors.lugarVisita && (
              <p className="text-sm text-red-600 mt-2">{errors.lugarVisita}</p>
            )}
          </div>
        </div>

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

          {/* Parentesco */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Parentesco con colaborador *
            </label>
            <select
              value={formData.parentesco}
              onChange={(e) =>
                setFormData((p) => ({ ...p, parentesco: e.target.value }))
              }
              className={`w-full border-2 ${
                errors.parentesco ? "border-red-500" : "border-gray-300"
              } rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors`}
            >
              <option value="">Selecciona una opción</option>
              {parentescoOpciones.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            {errors.parentesco && (
              <p className="text-sm text-red-600 mt-1">{errors.parentesco}</p>
            )}
          </div>

          {/* Área de personal */}
          <div className="md:col-span-1">
            <AreaField
              label="Área de personal"
              value={formData.areaPersonal}
              onChange={(v) => setFormData((p) => ({ ...p, areaPersonal: v }))}
              options={areasData}
              error={errors.areaPersonal}
            />
          </div>
        </DemographicSection>

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
            {loading ? "GUARDANDO..." : "GUARDAR VISITA"}
          </button>
        </div>
      </form>
    </FormShell>
  )
}

export default FormularioVisita
