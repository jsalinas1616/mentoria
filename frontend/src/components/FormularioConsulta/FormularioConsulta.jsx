import React, { useState } from 'react';
import { Save, Check, AlertCircle, LogOut } from 'lucide-react';
import { consultasService, authService } from '../../services/api';
import motivosConsultaData from '../../data/motivosConsulta.json';
import lugaresTrabajoData from '../../data/lugaresTrabajo.json';
import areasData from '../../data/areas.json';
import lugaresConsultaData from '../../data/lugaresConsulta.json';
import { validarEmail, validarRequerido, validarArray } from '../../utils/validation';

const FormularioConsulta = ({ onSuccess, onCancel, userMode = 'publico' }) => {
  const user = userMode !== 'publico' ? authService.getCurrentUser() : null;
  const [formData, setFormData] = useState({
    nombreMentor: '',
    correoMentor: '',
    fecha: new Date().toISOString().split('T')[0],
    lugarTrabajo: '',
    area: '',
    lugarConsulta: '',
    motivosConsulta: [],
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchArea, setSearchArea] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleMotivoToggle = (motivo) => {
    setFormData((prev) => {
      const motivosActuales = prev.motivosConsulta;
      const existe = motivosActuales.includes(motivo);
      
      return {
        ...prev,
        motivosConsulta: existe
          ? motivosActuales.filter((m) => m !== motivo)
          : [...motivosActuales, motivo],
      };
    });
    
    if (errors.motivosConsulta) {
      setErrors((prev) => ({
        ...prev,
        motivosConsulta: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validarRequerido(formData.nombreMentor)) {
      newErrors.nombreMentor = 'El nombre completo es requerido';
    }

    if (!validarRequerido(formData.correoMentor)) {
      newErrors.correoMentor = 'El correo electrónico es requerido';
    } else if (!validarEmail(formData.correoMentor)) {
      newErrors.correoMentor = 'Ingresa un correo electrónico válido';
    }

    if (!validarRequerido(formData.fecha)) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!validarRequerido(formData.lugarTrabajo)) {
      newErrors.lugarTrabajo = 'El lugar de trabajo es requerido';
    }

    if (!validarRequerido(formData.area)) {
      newErrors.area = 'El área es requerida';
    }

    if (!validarRequerido(formData.lugarConsulta)) {
      newErrors.lugarConsulta = 'El lugar de consulta es requerido';
    }

    if (!validarArray(formData.motivosConsulta)) {
      newErrors.motivosConsulta = 'Selecciona al menos un motivo de consulta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await consultasService.crear(formData);
      setSuccess(true);
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          nombreMentor: '',
          correoMentor: '',
          fecha: new Date().toISOString().split('T')[0],
          lugarTrabajo: '',
          area: '',
          lugarConsulta: '',
          motivosConsulta: [],
          observaciones: '',
        });
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar la consulta',
      });
    } finally {
      setLoading(false);
    }
  };

  const areasFiltradas = areasData.filter((area) =>
    area.toLowerCase().includes(searchArea.toLowerCase())
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center p-4">
        <div className="bg-dark-card rounded-2xl shadow-2xl p-12 border border-white/10 text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
            <Check size={40} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">¡Consulta Guardada!</h2>
          <p className="text-white/70">La información se ha registrado correctamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-white mb-2">NADRO MENTORÍA</h1>
              <p className="text-white/80">Reporte de Consulta Integral</p>
            </div>
            <div className="flex-1 flex justify-end">
              {userMode !== 'publico' && (
                <button
                  onClick={() => {
                    authService.logout();
                    window.location.reload();
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-dark-card rounded-2xl shadow-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección 1: Datos del Mentor */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-2 border-b border-white/10">
                Datos del Mentor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Nombre Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombreMentor"
                    value={formData.nombreMentor}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                    className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.nombreMentor ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.nombreMentor && (
                    <p className="text-red-400 text-sm mt-1">{errors.nombreMentor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Correo Electrónico <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="correoMentor"
                    value={formData.correoMentor}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.correoMentor ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.correoMentor && (
                    <p className="text-red-400 text-sm mt-1">{errors.correoMentor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Fecha de Consulta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.fecha ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.fecha && (
                    <p className="text-red-400 text-sm mt-1">{errors.fecha}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Información Laboral */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-2 border-b border-white/10">
                Información Laboral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Lugar de Trabajo <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="lugarTrabajo"
                    value={formData.lugarTrabajo}
                    onChange={handleChange}
                    className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.lugarTrabajo ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <option value="">Selecciona un lugar</option>
                    {lugaresTrabajoData.map((lugar) => (
                      <option key={lugar} value={lugar}>
                        {lugar}
                      </option>
                    ))}
                  </select>
                  {errors.lugarTrabajo && (
                    <p className="text-red-400 text-sm mt-1">{errors.lugarTrabajo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Área <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar área..."
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    onFocus={() => setSearchArea(formData.area)}
                    className="w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all mb-2"
                  />
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    size="5"
                    className={`w-full bg-dark-input text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.area ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <option value="">Selecciona un área</option>
                    {areasFiltradas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  {errors.area && (
                    <p className="text-red-400 text-sm mt-1">{errors.area}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Detalles de la Consulta */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-2 border-b border-white/10">
                Detalles de la Consulta
              </h2>
              
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Lugar de Consulta <span className="text-red-400">*</span>
                </label>
                <select
                  name="lugarConsulta"
                  value={formData.lugarConsulta}
                  onChange={handleChange}
                  className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                    errors.lugarConsulta ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  <option value="">Selecciona un lugar</option>
                  {lugaresConsultaData.map((lugar) => (
                    <option key={lugar} value={lugar}>
                      {lugar}
                    </option>
                  ))}
                </select>
                {errors.lugarConsulta && (
                  <p className="text-red-400 text-sm mt-1">{errors.lugarConsulta}</p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Motivo(s) de Consulta <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto bg-dark-input/50 p-4 rounded-lg">
                  {motivosConsultaData.map((motivo) => (
                    <label
                      key={motivo}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-dark-input ${
                        formData.motivosConsulta.includes(motivo)
                          ? 'bg-accent/20 border border-accent'
                          : 'border border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.motivosConsulta.includes(motivo)}
                        onChange={() => handleMotivoToggle(motivo)}
                        className="w-4 h-4 accent-accent"
                      />
                      <span className="text-white text-sm">{motivo}</span>
                    </label>
                  ))}
                </div>
                {errors.motivosConsulta && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.motivosConsulta}
                  </p>
                )}
              </div>
            </div>

            {/* Sección 4: Observaciones */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-2 border-b border-white/10">
                Observaciones
              </h2>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Agrega comentarios o detalles adicionales sobre la consulta..."
                rows="6"
                className="w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
              />
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {errors.submit}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {loading ? 'GUARDANDO...' : 'GUARDAR CONSULTA'}
              </button>
              
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 bg-dark-input hover:bg-dark-input/70 text-white font-semibold py-4 rounded-lg transition-all"
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioConsulta;

