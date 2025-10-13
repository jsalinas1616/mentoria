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
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">NADRO MENTORÍA</h1>
          <p className="text-white/80 text-sm">Sistema de Consulta Integral</p>
        </div>

        {/* Card de Login */}
        <div className="bg-dark-card rounded-2xl shadow-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Correo Electrónico o Usuario
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu email o usuario"
                className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full bg-dark-input text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                    errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-accent hover:text-accent-hover text-sm transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
          <Lock size={16} />
          <span>Autenticación segura</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

