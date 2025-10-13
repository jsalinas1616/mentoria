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
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 border border-leaf/10 text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-leaf/10 rounded-full">
            <Check size={40} className="text-leaf" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">¡Consulta Guardada!</h2>
          <p className="text-gray-600">La información se ha registrado correctamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-primary mb-2">NADRO MENTORÍA</h1>
              <p className="text-gray-700">Reporte de Consulta Integral</p>
            </div>
            <div className="flex-1 flex justify-end">
              {userMode !== 'publico' && (
                <button
                  onClick={() => {
                    authService.logout();
                    window.location.reload();
                  }}
                  className="bg-maple/10 hover:bg-maple/20 text-maple px-4 py-2 rounded-lg transition-all flex items-center gap-2"
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
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección 1: Datos del Mentor */}
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6 pb-2 border-b border-gray-200">
                Datos del Mentor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Nombre Completo <span className="text-maple">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombreMentor"
                    value={formData.nombreMentor}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                    className={`w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.nombreMentor ? 'border-maple focus:border-maple' : ''
                    }`}
                  />
                  {errors.nombreMentor && (
                    <p className="text-maple text-sm mt-1">{errors.nombreMentor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Correo Electrónico <span className="text-maple">*</span>
                  </label>
                  <input
                    type="email"
                    name="correoMentor"
                    value={formData.correoMentor}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={`w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.correoMentor ? 'border-maple focus:border-maple' : ''
                    }`}
                  />
                  {errors.correoMentor && (
                    <p className="text-maple text-sm mt-1">{errors.correoMentor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Fecha de Consulta <span className="text-maple">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={`w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.fecha ? 'border-maple focus:border-maple' : ''
                    }`}
                  />
                  {errors.fecha && (
                    <p className="text-maple text-sm mt-1">{errors.fecha}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Información Laboral */}
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6 pb-2 border-b border-gray-200">
                Información Laboral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Lugar de Trabajo <span className="text-maple">*</span>
                  </label>
                  <select
                    name="lugarTrabajo"
                    value={formData.lugarTrabajo}
                    onChange={handleChange}
                    className={`w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.lugarTrabajo ? 'border-maple focus:border-maple' : ''
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
                    <p className="text-maple text-sm mt-1">{errors.lugarTrabajo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Área <span className="text-maple">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar área..."
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    onFocus={() => setSearchArea(formData.area)}
                    className="w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-2"
                  />
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    size="5"
                    className={`w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.area ? 'border-maple focus:border-maple' : ''
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
                    <p className="text-maple text-sm mt-1">{errors.area}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Detalles de la Consulta */}
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6 pb-2 border-b border-gray-200">
                Detalles de la Consulta
              </h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Lugar de Consulta <span className="text-maple">*</span>
                </label>
                <select
                  name="lugarConsulta"
                  value={formData.lugarConsulta}
                  onChange={handleChange}
                  className={`w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.lugarConsulta ? 'border-maple focus:border-maple' : ''
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
                  <p className="text-maple text-sm mt-1">{errors.lugarConsulta}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  Motivo(s) de Consulta <span className="text-maple">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto bg-cream/50 p-4 rounded-lg border border-gray-200">
                  {motivosConsultaData.map((motivo) => (
                    <label
                      key={motivo}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                        formData.motivosConsulta.includes(motivo)
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-white border-2 border-gray-300 hover:border-leaf'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.motivosConsulta.includes(motivo)}
                        onChange={() => handleMotivoToggle(motivo)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-gray-800 text-sm">{motivo}</span>
                    </label>
                  ))}
                </div>
                {errors.motivosConsulta && (
                  <p className="text-maple text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.motivosConsulta}
                  </p>
                )}
              </div>
            </div>

            {/* Sección 4: Observaciones */}
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6 pb-2 border-b border-gray-200">
                Observaciones
              </h2>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Agrega comentarios o detalles adicionales sobre la consulta..."
                rows="6"
                className="w-full bg-cream border-2 border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="bg-maple/10 border-2 border-maple text-maple px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {errors.submit}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
              >
                <Save size={20} />
                {loading ? 'GUARDANDO...' : 'GUARDAR CONSULTA'}
              </button>
              
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 rounded-lg transition-all"
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

