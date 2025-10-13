import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { authService } from '../../services/api';
import { validarEmail, validarRequerido } from '../../utils/validation';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validarRequerido(formData.email)) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validarEmail(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!validarRequerido(formData.password)) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Mostrar mensaje según el rol
      if (response.user.rol === 'admin') {
        console.log('Acceso administrador - Dashboard disponible');
      } else {
        console.log('Acceso empleado - Solo formulario');
      }
      
      onLoginSuccess(response.user);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrorMessage(
        error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Premium */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3 tracking-tight">NADRO MENTORÍA</h1>
          <div className="h-1 w-32 bg-gradient-primary mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-sm font-medium">Sistema de Consulta Integral · Acceso Administrativo</p>
        </div>

        {/* Card de Login Premium */}
        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                Correo Electrónico o Usuario
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu email o usuario"
                className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                  errors.email ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-rose text-sm mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                    errors.password ? 'border-rose focus:border-rose focus:ring-maple/10' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose text-sm mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-5 py-4 rounded-2xl text-sm font-medium shadow-lg">
                {errorMessage}
              </div>
            )}

            {/* Submit Button Premium */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="relative z-10 text-lg tracking-wide">
                {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
              </span>
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-primary hover:text-primary-light text-sm font-medium transition-colors underline decoration-primary/30 hover:decoration-primary"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-600 text-sm">
          <Lock size={16} />
          <span>Autenticación segura</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

