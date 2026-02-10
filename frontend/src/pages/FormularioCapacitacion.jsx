import React, { useState } from 'react';
import { Save, Check, AlertCircle, LogOut, Calendar, Users, BookOpen, ArrowLeft, RotateCcw, Plus, X, UserPlus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { capacitacionesService, authService } from '../services/api';
import lugaresTrabajoData from '../data/lugaresTrabajo.json';
import areasData from '../data/areas.json';
import rangosEdadData from '../data/rangosEdad.json';

const FormularioCapacitacion = ({ onSuccess, onCancel, capacitacionInicial = null, userMode = 'admin' }) => {
  const [formData, setFormData] = useState(capacitacionInicial || {
    tema: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    duracionHoras: '',
    duracionMinutos: '',
    lugar: '',
    capacitadores: [],
    numeroPersonasInvitadas: '',
    asistentes: [],
    numeroMentoriasAgendadas: '',
    observaciones: '',
  });

  const [newCapacitador, setNewCapacitador] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchAreas, setSearchAreas] = useState({}); // Para búsqueda de área por asistente

  // Función para mostrar toast
  const showToast = (message, type = 'error') => {
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
    setTimeout(() => toast.classList.remove('-translate-y-full'), 100);
    setTimeout(() => {
      toast.classList.add('-translate-y-full');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddCapacitador = () => {
    if (newCapacitador.trim() === '') return;
    
    if (formData.capacitadores.includes(newCapacitador.trim())) {
      showToast('Este capacitador ya fue agregado', 'error');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      capacitadores: [...prev.capacitadores, newCapacitador.trim()]
    }));
    setNewCapacitador('');
    
    if (errors.capacitadores) {
      setErrors(prev => ({ ...prev, capacitadores: '' }));
    }
  };

  const handleRemoveCapacitador = (capacitadorToRemove) => {
    setFormData(prev => ({
      ...prev,
      capacitadores: prev.capacitadores.filter(c => c !== capacitadorToRemove)
    }));
  };

  const handleAddAsistente = () => {
    setFormData(prev => ({
      ...prev,
      asistentes: [{
        rangoEdad: '',
        sexo: '',
        lugarTrabajo: '',
        area: ''
      }, ...prev.asistentes]
    }));
    
    // Actualizar los índices de searchAreas al agregar al inicio
    setSearchAreas(prev => {
      const newSearchAreas = { 0: '' }; // Nuevo asistente en índice 0 con búsqueda vacía
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key, 10);
        newSearchAreas[oldIndex + 1] = prev[oldIndex]; // Desplazar índices
      });
      return newSearchAreas;
    });
  };

  const handleRemoveAsistente = (index) => {
    setFormData(prev => ({
      ...prev,
      asistentes: prev.asistentes.filter((_, i) => i !== index)
    }));
    
    // Actualizar los índices de searchAreas al eliminar
    setSearchAreas(prev => {
      const newSearchAreas = {};
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key, 10);
        if (oldIndex < index) {
          // Mantener índices anteriores al eliminado
          newSearchAreas[oldIndex] = prev[oldIndex];
        } else if (oldIndex > index) {
          // Desplazar índices posteriores hacia abajo
          newSearchAreas[oldIndex - 1] = prev[oldIndex];
        }
        // Omitir el índice eliminado
      });
      return newSearchAreas;
    });
  };

  const handleAsistenteChange = (index, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      asistentes: prev.asistentes.map((asistente, i) => 
        i === index ? { ...asistente, [campo]: valor } : asistente
      )
    }));
    
    // Sincronizar searchArea con el área seleccionada
    if (campo === 'area') {
      setSearchAreas(prev => ({ ...prev, [index]: valor }));
    }
  };

  const handleSearchAreaChange = (index, valor) => {
    setSearchAreas(prev => ({ ...prev, [index]: valor }));
  };

  const getAreasFiltradas = (index) => {
    const searchTerm = searchAreas[index] || '';
    return areasData.filter((area) =>
      area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validaciones
    const newErrors = {};
    
    if (formData.capacitadores.length === 0) {
      newErrors.capacitadores = 'Debe agregar al menos un capacitador';
    }
    
    if (!formData.tema.trim()) {
      newErrors.tema = 'El tema es requerido';
    }
    
    if (!formData.numeroPersonasInvitadas || formData.numeroPersonasInvitadas < 1) {
      newErrors.numeroPersonasInvitadas = 'Debe ingresar un número válido';
    }
    
    // Validaciones de asistentes deshabilitadas porque la sección está oculta
    // if (formData.asistentes.length === 0) {
    //   newErrors.asistentes = 'Debe agregar al menos un asistente';
    // }

    // // Validar que todos los asistentes tengan datos completos
    // const asistenteIncompleto = formData.asistentes.some(a => 
    //   !a.rangoEdad || !a.sexo || !a.lugarTrabajo || !a.area
    // );

    // if (asistenteIncompleto) {
    //   newErrors.asistentes = 'Todos los asistentes deben tener datos completos';
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    try {
      // Construir duración en formato "X horas Y minutos"
      const horas = parseInt(formData.duracionHoras || 0, 10);
      const minutos = parseInt(formData.duracionMinutos || 0, 10);
      let duracion = '';
      if (horas > 0) duracion += `${horas} hora${horas !== 1 ? 's' : ''}`;
      if (horas > 0 && minutos > 0) duracion += ' ';
      if (minutos > 0) duracion += `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
      
      const dataToSend = {
        ...formData,
        duracion,
        numeroPersonasInvitadas: parseInt(formData.numeroPersonasInvitadas, 10),
        numeroMentoriasAgendadas: parseInt(formData.numeroMentoriasAgendadas, 10) || 0
      };
      
      // Eliminar campos temporales
      delete dataToSend.duracionHoras;
      delete dataToSend.duracionMinutos;

      if (capacitacionInicial) {
        await capacitacionesService.actualizar(capacitacionInicial.id, dataToSend);
      } else {
        await capacitacionesService.crear(dataToSend);
      }

      setSuccess(true);
      showToast('Capacitación guardada exitosamente', 'success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error al guardar capacitación:', err);
      showToast(err.response?.data?.message || 'Error al guardar la capacitación', 'error');
      setErrors({ submit: err.response?.data?.message || 'Error al guardar la capacitación' });
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos ingresados.')) {
      setFormData({
        tema: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        duracionHoras: '',
        duracionMinutos: '',
        lugar: '',
        capacitadores: [],
        numeroPersonasInvitadas: '',
        asistentes: [],
        numeroMentoriasAgendadas: '',
        observaciones: '',
      });
      setNewCapacitador('');
      setSearchAreas({});
      setErrors({});
      showToast('Formulario limpiado correctamente', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-soft p-12 md:p-16 border border-primary-100 text-center max-w-md transform animate-in">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-success/20 to-primary/20 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-success to-primary rounded-full animate-pulse opacity-20"></div>
            <Check size={48} className="text-success relative z-10" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">¡Capacitación Guardada!</h2>
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
            </div>
          </div>
          
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
        </div>

        {/* Formulario Premium */}
        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección 1: Capacitadores */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Capacitadores</h2>
                  <p className="text-sm text-gray-600">Personas que impartirán la capacitación</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-gray-700 text-sm font-semibold">
                  Capacitadores <span className="text-rose">*</span>
                </label>
                
                {/* Input para agregar capacitador */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCapacitador}
                    onChange={(e) => setNewCapacitador(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCapacitador();
                      }
                    }}
                    placeholder="Nombre del capacitador"
                    className={`flex-1 px-4 py-3 bg-gray-50 border-2 ${
                      errors.capacitadores ? 'border-rose' : 'border-gray-300'
                    } text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={handleAddCapacitador}
                    className="px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                </div>
                
                {errors.capacitadores && (
                  <p className="text-rose text-sm flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {errors.capacitadores}
                  </p>
                )}
                
                {/* Lista de capacitadores */}
                {formData.capacitadores.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.capacitadores.map((capacitador, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-primary-50 border-2 border-primary-100 rounded-xl px-4 py-3"
                      >
                        <span className="text-gray-900 font-medium">{capacitador}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCapacitador(capacitador)}
                          className="text-rose hover:bg-rose-50 rounded-lg p-1 transition-colors"
                          title="Eliminar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sección 2: Información General */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Información de la Capacitación</h2>
                  <p className="text-sm text-gray-600">Datos generales del evento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tema */}
                <div className="md:col-span-3">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Tema de Capacitación <span className="text-rose">*</span>
                  </label>
                  <input
                    type="text"
                    name="tema"
                    value={formData.tema}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 ${
                      errors.tema ? 'border-rose' : 'border-gray-300'
                    } text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all`}
                    placeholder="Ej: Seguridad en el Trabajo"
                    required
                  />
                  {errors.tema && (
                    <p className="text-rose text-sm flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {errors.tema}
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Fecha <span className="text-rose">*</span>
                  </label>
                  <DatePicker
                    selected={formData.fecha ? new Date(formData.fecha + 'T00:00:00') : null}
                    onChange={(date) => {
                      const fechaISO = date ? date.toISOString().split('T')[0] : '';
                      setFormData(prev => ({ ...prev, fecha: fechaISO }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/AAAA"
                    maxDate={new Date()}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    wrapperClassName="w-full"
                    required
                  />
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Hora <span className="text-rose">*</span>
                  </label>
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>

                {/* Duración */}
                <div className="md:col-span-3">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Duración <span className="text-rose">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">Horas</label>
                      <input
                        type="number"
                        name="duracionHoras"
                        value={formData.duracionHoras}
                        onChange={handleChange}
                        min="0"
                        max="12"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">Minutos</label>
                      <input
                        type="number"
                        name="duracionMinutos"
                        value={formData.duracionMinutos}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Número de Asistentes */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Número de asistentes <span className="text-rose">*</span>
                  </label>
                  <input
                    type="number"
                    name="numeroPersonasInvitadas"
                    value={formData.numeroPersonasInvitadas}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 ${
                      errors.numeroPersonasInvitadas ? 'border-rose' : 'border-gray-300'
                    } text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all`}
                    placeholder="Número total de invitados"
                    required
                  />
                  {errors.numeroPersonasInvitadas && (
                    <p className="text-rose text-sm flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {errors.numeroPersonasInvitadas}
                    </p>
                  )}
                </div>

                {/* Lugar (CDR) */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Lugar (CDR) <span className="text-rose">*</span>
                  </label>
                  <select
                    name="lugar"
                    value={formData.lugar}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  >
                    <option value="">Selecciona un CDR</option>
                    <option value="Bajío">Bajío</option>
                    <option value="Chihuahua">Chihuahua</option>
                    <option value="Culiacán">Culiacán</option>
                    <option value="Guadalajara">Guadalajara</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Mérida">Mérida</option>
                    <option value="México Norte">México Norte</option>
                    <option value="México Sur">México Sur</option>
                    <option value="Monterrey">Monterrey</option>
                    <option value="Morelia">Morelia</option>
                    <option value="Puebla">Puebla</option>
                    <option value="Tijuana">Tijuana</option>
                    <option value="Tuxtla">Tuxtla</option>
                    <option value="Veracruz">Veracruz</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 3: Asistentes - OCULTA */}
            {false && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
                    <UserPlus className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Asistentes (Datos Demográficos)</h2>
                    <p className="text-sm text-gray-600">Personas que realmente asistieron</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddAsistente}
                  className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Agregar Asistente</span>
                </button>
              </div>

              {errors.asistentes && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose flex-shrink-0" />
                  <p className="text-rose text-sm">{errors.asistentes}</p>
                </div>
              )}

              {formData.asistentes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <UserPlus size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No hay asistentes agregados. Haz clic en "Agregar Asistente" para comenzar.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.asistentes.map((asistente, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveAsistente(index)}
                        className="absolute top-4 right-4 text-rose hover:bg-rose-50 rounded-lg p-2 transition-colors"
                        title="Eliminar asistente"
                      >
                        <X size={20} />
                      </button>

                      <h3 className="text-lg font-bold text-gray-900 mb-4">Asistente {formData.asistentes.length - index}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Rango de Edad */}
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Rango de Edad <span className="text-rose">*</span>
                          </label>
                          <select
                            value={asistente.rangoEdad}
                            onChange={(e) => handleAsistenteChange(index, 'rangoEdad', e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            required
                          >
                            <option value="">Selecciona un rango</option>
                            {rangosEdadData.map((rango) => (
                              <option key={rango} value={rango}>{rango}</option>
                            ))}
                          </select>
                        </div>

                        {/* Sexo */}
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Sexo <span className="text-rose">*</span>
                          </label>
                          <select
                            value={asistente.sexo}
                            onChange={(e) => handleAsistenteChange(index, 'sexo', e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            required
                          >
                            <option value="">Selecciona una opción</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Diversidad">Diversidad</option>
                          </select>
                        </div>

                        {/* Lugar de Trabajo */}
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Lugar de Trabajo <span className="text-rose">*</span>
                          </label>
                          <select
                            value={asistente.lugarTrabajo}
                            onChange={(e) => handleAsistenteChange(index, 'lugarTrabajo', e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            required
                          >
                            <option value="">Selecciona un lugar</option>
                            {lugaresTrabajoData.map((lugar) => (
                              <option key={lugar} value={lugar}>{lugar}</option>
                            ))}
                          </select>
                        </div>

                        {/* Área */}
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Área <span className="text-rose">*</span>
                          </label>
                          <input
                            type="text"
                            value={searchAreas[index] || ''}
                            onChange={(e) => handleSearchAreaChange(index, e.target.value)}
                            placeholder="Buscar área..."
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all mb-2"
                          />
                          <select
                            value={asistente.area}
                            onChange={(e) => handleAsistenteChange(index, 'area', e.target.value)}
                            size="5"
                            className="w-full px-4 py-2 bg-white border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            required
                          >
                            <option value="">-- Selecciona un área --</option>
                            {getAreasFiltradas(index).map((area) => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Sección 4: Número de Mentorías Agendadas - OCULTA */}
            {false && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Número de Mentorías Agendadas</h2>
                  <p className="text-sm text-gray-600">Mentorías programadas a partir de esta capacitación</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Número de Mentorías Agendadas <span className="text-rose">*</span>
                </label>
                <input
                  type="number"
                  name="numeroMentoriasAgendadas"
                  value={formData.numeroMentoriasAgendadas}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="Número de mentorías agendadas"
                  required
                />
              </div>
            </div>
            )}

            {/* Sección 5: Observaciones */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Observaciones</h2>
                  <p className="text-sm text-gray-600">Comentarios adicionales (opcional)</p>
                </div>
              </div>

              <div>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                  placeholder="Agregar comentarios, observaciones o detalles adicionales (opcional)"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={limpiarFormulario}
                className="flex-1 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <RotateCcw size={20} />
                Limpiar Formulario
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {capacitacionInicial ? 'Actualizar Capacitación' : 'Guardar Capacitación'}
                  </>
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose flex-shrink-0" />
                <p className="text-rose text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioCapacitacion;
