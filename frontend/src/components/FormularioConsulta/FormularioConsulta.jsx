import React, { useState } from 'react';
import { Save, Check, AlertCircle, LogOut, User, Mail, Calendar, MapPin, Building2, Briefcase, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { consultasService, authService } from '../../services/api';
import motivosConsultaData from '../../data/motivosConsulta.json';
import lugaresTrabajoData from '../../data/lugaresTrabajo.json';
import areasData from '../../data/areas.json';
import lugaresConsultaData from '../../data/lugaresConsulta.json';
import { validarEmail, validarRequerido, validarArray } from '../../utils/validation';

const FormularioConsulta = ({ onSuccess, onCancel, userMode = 'publico' }) => {
  // const user = userMode !== 'publico' ? authService.getCurrentUser() : null;
  const [formData, setFormData] = useState({
    // Datos del Mentor
    nombreMentor: '',
    correoMentor: '',
    // Datos del Mentee
    nombreMentee: '',
    correoMentee: '',
    // Datos de la Consulta
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

    // Validar datos del mentee
    if (!validarRequerido(formData.nombreMentee)) {
      newErrors.nombreMentee = 'El nombre del mentee es requerido';
    }

    if (!validarRequerido(formData.correoMentee)) {
      newErrors.correoMentee = 'El correo del mentee es requerido';
    } else if (!validarEmail(formData.correoMentee)) {
      newErrors.correoMentee = 'Ingresa un correo electrónico válido';
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
              <h1 className="text-lg font-bold text-gray-900">Formulario de Consulta</h1>
              <p className="text-xs text-gray-500">Reporte de mentoría</p>
            </div>
          </div>
          
          {userMode !== 'publico' && (
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
                  <p className="text-sm text-gray-600">Información personal del mentor</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Nombre Completo <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nombreMentor"
                      value={formData.nombreMentor}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre completo"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.nombreMentor ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.nombreMentor && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.nombreMentor}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Correo Electrónico <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="correoMentor"
                      value={formData.correoMentor}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.correoMentor ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.correoMentor && (
                    <p className="text-rose text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.correoMentor}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Fecha de Consulta <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.fecha ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
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

            {/* Sección 2: Datos del Mentee */}
            <div className="space-y-6 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-accent/10 to-accent-light/10 rounded-xl">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Datos del Mentee</h2>
                  <p className="text-sm text-gray-600">Información de la persona que recibe la mentoría</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre del Mentee */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Nombre Completo del Mentee *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nombreMentee"
                      value={formData.nombreMentee}
                      onChange={handleChange}
                      placeholder="Ingresa el nombre completo del mentee"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.nombreMentee ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.nombreMentee && (
                    <p className="text-rose text-sm mt-1.5">{errors.nombreMentee}</p>
                  )}
                </div>

                {/* Correo del Mentee */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Correo Electrónico del Mentee *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="correoMentee"
                      value={formData.correoMentee}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.correoMentee ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.correoMentee && (
                    <p className="text-rose text-sm mt-1.5">{errors.correoMentee}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Sección 3: Información Laboral */}
            <div className="space-y-6 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Información Laboral del Mentee</h2>
                  <p className="text-sm text-gray-500">Detalles del lugar y área de trabajo del mentee</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Sección 4: Detalles de la Consulta */}
            <div className="space-y-6 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Detalles de la Consulta del Mentee</h2>
                  <p className="text-sm text-gray-500">Lugar y motivos de la consulta del mentee</p>
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

            {/* Botones Premium */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <Save size={22} className="relative z-10" />
                <span className="relative z-10 text-lg tracking-wide">
                  {loading ? 'GUARDANDO...' : 'GUARDAR CONSULTA'}
                </span>
              </button>
              
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-10 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg"
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

