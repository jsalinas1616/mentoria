import React, { useState } from 'react';
import { Save, Check, AlertCircle, LogOut, User, Mail, Calendar, MapPin, Building2, Briefcase, MessageSquare, FileText, Sparkles, Users, ArrowLeft, RotateCcw, Plus, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { consultasService, authService } from '../../services/api';
import motivosConsultaData from '../../data/motivosConsulta.json';
import lugaresTrabajoData from '../../data/lugaresTrabajo.json';
import areasData from '../../data/areas.json';
import lugaresConsultaData from '../../data/lugaresConsulta.json';
import { validarEmail, validarRequerido, validarArray } from '../../utils/validation';

const FormularioConsulta = ({ onSuccess, onCancel, userMode = 'publico' }) => {
  // const user = userMode !== 'publico' ? authService.getCurrentUser() : null;
  const [formData, setFormData] = useState({
    // Datos del Mentor (ahora es array)
    mentores: [],
    // Datos de la Consulta
    fecha: new Date().toISOString().split('T')[0],
    // Datos Demográficos (Anónimos)
    rangoEdad: '',
    sexo: '',
    numeroSesion: '',
    haMejorado: '',
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
  const [newMentor, setNewMentor] = useState('');

  // Función para mostrar toast
  const showToast = (message, type = 'error') => {
    // Crear toast
    const toast = document.createElement('div');
    toast.className = `fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 -translate-y-full ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    
    // Crear estructura segura sin innerHTML
    const container = document.createElement('div');
    container.className = 'flex items-center gap-3';
    
    const icon = document.createElement('div');
    icon.className = 'flex-shrink-0';
    icon.textContent = type === 'error' ? '⚠️' : '✅';
    
    const content = document.createElement('div');
    content.className = 'flex-1';
    
    const paragraph = document.createElement('p');
    paragraph.className = 'font-medium';
    paragraph.textContent = message; // textContent es seguro, no ejecuta HTML
    
    content.appendChild(paragraph);
    container.appendChild(icon);
    container.appendChild(content);
    toast.appendChild(container);
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.remove('-translate-y-full'), 100);
    
    // Auto-remove
    setTimeout(() => {
      toast.classList.add('-translate-y-full');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Función para scroll automático al primer error
  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector('.border-rose');
      if (firstError) {
        firstError.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Sincronizar searchArea con el área seleccionada
    if (name === 'area') {
      setSearchArea(value);
    }
    
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

  // Funciones para manejar múltiples mentores
  const handleAddMentor = () => {
    if (newMentor.trim() === '') {
      return;
    }
    
    // Verificar que no esté duplicado
    if (formData.mentores.includes(newMentor.trim())) {
      showToast('Este mentor ya fue agregado', 'error');
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      mentores: [...prev.mentores, newMentor.trim()],
    }));
    
    setNewMentor('');
    
    // Limpiar error si existía
    if (errors.mentores) {
      setErrors((prev) => ({
        ...prev,
        mentores: '',
      }));
    }
  };

  const handleRemoveMentor = (mentorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      mentores: prev.mentores.filter(m => m !== mentorToRemove),
    }));
  };

  const handleNewMentorKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMentor();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar que haya al menos un mentor
    if (!formData.mentores || formData.mentores.length === 0) {
      newErrors.mentores = 'Debes agregar al menos un mentor';
    }

    if (!validarRequerido(formData.fecha)) {
      newErrors.fecha = 'La fecha es requerida';
    }

    // Validaciones de datos demográficos
    if (!validarRequerido(formData.rangoEdad)) {
      newErrors.rangoEdad = 'El rango de edad es requerido';
    }

    if (!validarRequerido(formData.sexo)) {
      newErrors.sexo = 'El sexo es requerido';
    }

    if (!validarRequerido(formData.numeroSesion)) {
      newErrors.numeroSesion = 'El número de sesión es requerido';
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
      // Mostrar toast y scroll al primer error
      const errorCount = Object.keys(errors).length;
      showToast(`Por favor, corrige ${errorCount} error${errorCount > 1 ? 'es' : ''} en el formulario`);
      scrollToFirstError();
      return;
    }

    setLoading(true);

    try {
      // Enviar datos con el array de mentores directamente
      const dataToSend = {
        ...formData,
      };

      await consultasService.crear(dataToSend);
      setSuccess(true);
      showToast('¡Consulta guardada exitosamente!', 'success');
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          mentores: [],
          fecha: new Date().toISOString().split('T')[0],
          rangoEdad: '',
          sexo: '',
          numeroSesion: '',
          haMejorado: '',
          lugarTrabajo: '',
          area: '',
          lugarConsulta: '',
          motivosConsulta: [],
          observaciones: '',
        });
        setNewMentor('');
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

  const limpiarFormulario = () => {
    // Confirmar antes de limpiar
    if (window.confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos ingresados.')) {
      setFormData({
        mentores: [],
        fecha: new Date().toISOString().split('T')[0],
        rangoEdad: '',
        sexo: '',
        numeroSesion: '',
        haMejorado: '',
        lugarTrabajo: '',
        area: '',
        lugarConsulta: '',
        motivosConsulta: [],
        observaciones: '',
      });
      setNewMentor('');
      setErrors({});
      setSearchArea('');
      showToast('Formulario limpiado correctamente', 'success');
      // Scroll al inicio del formulario
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const areasFiltradas = areasData.filter((area) =>
    area.toLowerCase().includes(searchArea.toLowerCase())
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-soft p-12 md:p-16 border border-primary-100 text-center max-w-md transform animate-in">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-success/20 to-primary/20 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-success to-primary rounded-full animate-pulse opacity-20"></div>
            <Check size={48} className="text-success relative z-10" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">¡Consulta Guardada!</h2>
          <div className="h-1 w-24 bg-gradient-primary mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg">La información se ha registrado correctamente en el sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header con Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="/LOGO_Blanco.png" 
              alt="Nadro Mentoría" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mentoria Integral</h1>
              {/* <p className="text-xs text-gray-500">Reporte de mentoría</p> */}
            </div>
          </div>
          
          {userMode === 'admin' && (
            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md border border-gray-300"
                  title="Regresar al dashboard"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline text-sm font-medium">Regresar</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  authService.logout();
                  window.location.reload();
                }}
                className="bg-white hover:bg-gray-50 text-rose px-3 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md border border-gray-300"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          )}
        </div>

        {/* Formulario Premium */}
        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección 1: Datos del Mentor */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Datos del Mentor</h2>
                  <p className="text-sm text-gray-600">Nombre</p>
                </div>
              </div>
              
              {/* Múltiples Mentores */}
              <div className="space-y-4">
                <label className="block text-gray-700 text-sm font-semibold">
                  Mentores <span className="text-rose">*</span>
                </label>
                
                {/* Input para agregar mentor */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={newMentor}
                      onChange={(e) => setNewMentor(e.target.value)}
                      onKeyPress={handleNewMentorKeyPress}
                      placeholder="Nombre del mentor"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.mentores ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMentor}
                    className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Agregar
                  </button>
                </div>

                {/* Lista de mentores agregados */}
                {formData.mentores.length > 0 && (
                  <div className="space-y-2">
                    {formData.mentores.map((mentor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl px-4 py-3 group hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-gray-700 font-medium">{mentor}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMentor(mentor)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                        >
                          <X size={18} className="text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.mentores && (
                  <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.mentores}
                  </p>
                )}
              </div>
            </div>

            {/* Sección 2: Datos de la Consulta */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Datos de la Consulta</h2>
                  <p className="text-sm text-gray-600">Información sobre la mentoría</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha de Consulta */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Fecha de Consulta <span className="text-rose">*</span>
                  </label>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <DatePicker
                      selected={formData.fecha ? new Date(formData.fecha) : null}
                      onChange={(date) => {
                        const fechaISO = date ? date.toISOString().split('T')[0] : '';
                        setFormData(prev => ({ ...prev, fecha: fechaISO }));
                        if (errors.fecha) {
                          setErrors(prev => ({ ...prev, fecha: '' }));
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/AAAA"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.fecha ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                      wrapperClassName="w-full"
                      calendarClassName="bg-white shadow-lg rounded-xl border border-gray-200"
                    />
                  </div>
                  {errors.fecha && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.fecha}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Datos Demográficos (Anónimos) */}
            <div className="space-y-6 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Datos Demográficos</h2>
                  <p className="text-sm text-gray-500">Información con fin estadístico</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rango de Edad */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Rango de Edad <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="rangoEdad"
                      value={formData.rangoEdad}
                      onChange={handleChange}
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.rangoEdad ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona un rango</option>
                      <option value="18-25">18 - 25 años</option>
                      <option value="26-35">26 - 35 años</option>
                      <option value="36-45">36 - 45 años</option>
                      <option value="46-55">46 - 55 años</option>
                      <option value="56-65">56 - 65 años</option>
                      <option value="66-75">66 - 75 años</option>
                      <option value="76-80">76 - 80 años</option>
                      <option value="80+">80+ años</option>
                    </select>
                  </div>
                  {errors.rangoEdad && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.rangoEdad}
                    </p>
                  )}
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Sexo <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.sexo ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                      <option value="Diversidad">Diversidad</option>
                    </select>
                  </div>
                  {errors.sexo && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.sexo}
                    </p>
                  )}
                </div>

                {/* Número de Sesión */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Número de Sesión <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="numeroSesion"
                      value={formData.numeroSesion}
                      onChange={handleChange}
                      placeholder="Ej: 1, 2, 3..."
                      min="1"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.numeroSesion ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.numeroSesion && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.numeroSesion}
                    </p>
                  )}
                </div>

                {/* ¿Ha mejorado? - Solo se muestra si numeroSesion > 1 */}
                {formData.numeroSesion && parseInt(formData.numeroSesion) > 1 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                    <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                      ¿Ha mejorado?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="haMejorado"
                          value="Sí"
                          checked={formData.haMejorado === 'Sí'}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">Sí</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="haMejorado"
                          value="No"
                          checked={formData.haMejorado === 'No'}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">No</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Lugar de Trabajo */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Lugar de Trabajo <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="lugarTrabajo"
                      value={formData.lugarTrabajo}
                      onChange={handleChange}
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer ${
                        errors.lugarTrabajo ? 'border-rose focus:border-rose focus:ring-maple/10' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona un lugar</option>
                      {lugaresTrabajoData.map((lugar) => (
                        <option key={lugar} value={lugar}>
                          {lugar}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.lugarTrabajo && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.lugarTrabajo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Área <span className="text-rose">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar área..."
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    onFocus={() => setSearchArea(formData.area)}
                    className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md mb-2"
                  />
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    size="5"
                    className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                      errors.area ? 'border-rose focus:border-rose focus:ring-maple/10' : 'border-gray-300'
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
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.area}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Detalles de la Consulta */}
            <div className="space-y-6 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Detalles de la Consulta</h2>
                  <p className="text-sm text-gray-500">Lugar y motivos de la consulta (confidencial)</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                  Lugar de Consulta <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="lugarConsulta"
                    value={formData.lugarConsulta}
                    onChange={handleChange}
                    className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer ${
                      errors.lugarConsulta ? 'border-rose focus:border-rose focus:ring-maple/10' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un lugar</option>
                    {lugaresConsultaData.map((lugar) => (
                      <option key={lugar} value={lugar}>
                        {lugar}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.lugarConsulta && (
                  <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.lugarConsulta}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-4">
                  Motivo(s) de Consulta <span className="text-rose">*</span>
                  <span className="text-gray-500 font-normal ml-2 text-xs">(Puedes seleccionar varios)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-cream rounded-2xl border-2 border-gray-100">
                  {motivosConsultaData.map((motivo) => (
                    <label
                      key={motivo}
                      className={`flex items-start space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        formData.motivosConsulta.includes(motivo)
                          ? 'bg-gradient-to-br from-primary/10 to-leaf/10 border-2 border-primary shadow-md'
                          : 'bg-white border-2 border-gray-300 hover:border-primary/50 hover:shadow'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.motivosConsulta.includes(motivo)}
                        onChange={() => handleMotivoToggle(motivo)}
                        className="w-5 h-5 accent-primary rounded-md mt-0.5 cursor-pointer"
                      />
                      <span className={`text-sm leading-tight ${
                        formData.motivosConsulta.includes(motivo) ? 'text-primary font-semibold' : 'text-gray-700'
                      }`}>
                        {motivo}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.motivosConsulta && (
                  <p className="text-rose text-sm mt-3 flex items-center gap-1.5 bg-maple/5 p-3 rounded-xl">
                    <AlertCircle size={16} />
                    {errors.motivosConsulta}
                  </p>
                )}
              </div>
            </div>

            {/* Sección 5: Observaciones */}
            <div className="space-y-4 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Observaciones</h2>
                  <p className="text-sm text-gray-500">Comentarios o detalles adicionales (opcional)</p>
                </div>
              </div>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Agrega comentarios, observaciones o detalles adicionales sobre la consulta..."
                rows="6"
                className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-5 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-sm hover:shadow-md"
              />
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg">
                <div className="p-2 bg-maple/20 rounded-full">
                  <AlertCircle size={20} />
                </div>
                <span className="font-medium">{errors.submit}</span>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={limpiarFormulario}
                disabled={loading}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md border-2 border-gray-300"
              >
                <RotateCcw size={22} />
                <span className="text-lg tracking-wide">
                  LIMPIAR FORMULARIO
                </span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <Save size={22} className="relative z-10" />
                <span className="relative z-10 text-lg tracking-wide">
                  {loading ? 'GUARDANDO...' : 'GUARDAR CONSULTA'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioConsulta;

