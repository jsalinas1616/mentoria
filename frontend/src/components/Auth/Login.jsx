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
  
  // Estado para cambio de contraseña
  const [needNewPassword, setNeedNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cognitoUserTemp, setCognitoUserTemp] = useState(null);
  const [userAttributesTemp, setUserAttributesTemp] = useState(null);

  // Estado para recuperación de contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email' | 'code'
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir email a minúsculas automáticamente
    const finalValue = value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
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

  const validateNewPasswordForm = () => {
    const newErrors = {};

    if (!validarRequerido(newPassword)) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      newErrors.newPassword = 'Debe incluir mayúsculas, minúsculas, números y símbolos';
    }

    if (!validarRequerido(confirmPassword)) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      console.log('🔐 Intentando login con:', formData.email);
      const response = await authService.login(formData.email.toLocaleLowerCase(), formData.password);
      console.log('✅ Respuesta de login:', response);
      
      // Verificar si necesita cambiar contraseña
      if (response.newPasswordRequired) {
        console.log('⚠️ Requiere cambio de contraseña');
        setCognitoUserTemp(response.cognitoUser);
        setUserAttributesTemp(response.userAttributes);
        setNeedNewPassword(true);
        setErrorMessage('');
      } else if (response.success) {
        console.log('✅ Login exitoso, llamando onLoginSuccess');
        onLoginSuccess(response.user);
      } else {
        console.warn('⚠️ Respuesta inesperada:', response);
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Mensajes de error específicos de Cognito
      let message = 'Error al iniciar sesión. Verifica tus credenciales.';
      if (error.code === 'NoRoleAssignedException') {
        message = 'Tu cuenta no tiene un rol asignado. Contacta al administrador del sistema para que te asigne un rol (admin o mentor).';
      } else if (error.code === 'NotAuthorizedException') {
        message = 'Usuario o contraseña incorrectos';
      } else if (error.code === 'UserNotFoundException') {
        message = 'Usuario no encontrado';
      } else if (error.code === 'UserNotConfirmedException') {
        message = 'Usuario no confirmado. Contacta al administrador.';
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateNewPasswordForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.completeNewPassword(cognitoUserTemp, newPassword, userAttributesTemp || {});
      
      if (response.success) {
        onLoginSuccess(response.user);
      }
    } catch (error) {
      
      let message = 'Error al cambiar la contraseña. Intenta nuevamente.';
      if (error.code === 'InvalidPasswordException') {
        message = 'La contraseña no cumple con los requisitos de seguridad';
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para recuperación de contraseña
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep('email');
    setErrorMessage('');
    setErrors({});
    setForgotPasswordEmail('');
    setVerificationCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setErrorMessage('');
    setErrors({});
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!forgotPasswordEmail) {
      setErrors({ email: 'El correo electrónico es requerido' });
      return;
    }

    if (!validarEmail(forgotPasswordEmail)) {
      setErrors({ email: 'Ingresa un correo electrónico válido' });
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(forgotPasswordEmail.toLowerCase());
      setForgotPasswordStep('code');
      setErrorMessage('');
    } catch (error) {
      let message = 'Error al enviar el código de verificación.';
      if (error.code === 'UserNotFoundException') {
        message = 'Usuario no encontrado';
      } else if (error.code === 'LimitExceededException') {
        message = 'Demasiados intentos. Intenta más tarde.';
      } else if (error.message) {
        message = error.message;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const newErrors = {};

    if (!verificationCode) {
      newErrors.code = 'El código de verificación es requerido';
    }

    if (!resetNewPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (resetNewPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(resetNewPassword)) {
      newErrors.newPassword = 'Debe incluir mayúsculas, minúsculas, números y símbolos';
    }

    if (!resetConfirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (resetNewPassword !== resetConfirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await authService.confirmPassword(forgotPasswordEmail.toLowerCase(), verificationCode, resetNewPassword);
      setErrorMessage('');
      // Mostrar mensaje de éxito y volver al login
      alert('Contraseña restablecida exitosamente. Por favor inicia sesión con tu nueva contraseña.');
      handleBackToLogin();
    } catch (error) {
      let message = 'Error al restablecer la contraseña.';
      if (error.code === 'CodeMismatchException') {
        message = 'Código de verificación incorrecto';
      } else if (error.code === 'ExpiredCodeException') {
        message = 'El código de verificación ha expirado. Solicita uno nuevo.';
      } else if (error.code === 'InvalidPasswordException') {
        message = 'La contraseña no cumple con los requisitos de seguridad';
      } else if (error.message) {
        message = error.message;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Si necesita cambiar contraseña, mostrar formulario de cambio
  if (needNewPassword) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header con Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
              <img 
                src="/LOGO_Blanco.png" 
                alt="Nadro Mentoría" 
                className="h-16 w-auto"
              />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">Cambio de Contraseña Obligatorio</h1>
              <p className="text-xs text-gray-500 mt-2">
                Debes establecer una contraseña permanente para continuar
              </p>
            </div>
          </div>

          {/* Card de Cambio de Contraseña */}
          <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
            <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/30 text-gray-700 px-5 py-4 rounded-2xl text-sm">
                <strong className="block mb-1">Requisitos de contraseña:</strong>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un símbolo (@$!%*?&)</li>
                </ul>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors((prev) => ({ ...prev, newPassword: '' }));
                      }
                    }}
                    placeholder="Ingresa tu nueva contraseña"
                    className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                      errors.newPassword ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-rose text-sm mt-1.5">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Confirma tu nueva contraseña"
                    className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                      errors.confirmPassword ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose text-sm mt-1.5">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-5 py-4 rounded-2xl text-sm font-medium shadow-lg">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative z-10 text-lg tracking-wide">
                  {loading ? 'CAMBIANDO CONTRASEÑA...' : 'CAMBIAR CONTRASEÑA'}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Lock size={16} />
            <span>Autenticación segura con AWS Cognito</span>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de recuperación de contraseña
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header con Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
              <img 
                src="/LOGO_Blanco.png" 
                alt="Nadro Mentoría" 
                className="h-16 w-auto"
              />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">
                {forgotPasswordStep === 'email' ? 'Recuperar Contraseña' : 'Restablecer Contraseña'}
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                {forgotPasswordStep === 'email' 
                  ? 'Te enviaremos un código de verificación a tu correo' 
                  : 'Ingresa el código que recibiste por correo'}
              </p>
            </div>
          </div>

          {/* Card de Recuperación */}
          <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
            {forgotPasswordStep === 'email' ? (
              // Paso 1: Solicitar email
              <form onSubmit={handleSendVerificationCode} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => {
                      setForgotPasswordEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="Ingresa tu email"
                    className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                      errors.email ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-rose text-sm mt-1.5">{errors.email}</p>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-5 py-4 rounded-2xl text-sm font-medium shadow-lg">
                    {errorMessage}
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="relative z-10 text-lg tracking-wide">
                      {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-2xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            ) : (
              // Paso 2: Código + Nueva contraseña
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/30 text-gray-700 px-5 py-4 rounded-2xl text-sm">
                  <strong className="block mb-1">Revisa tu correo electrónico</strong>
                  <p className="text-xs">
                    Enviamos un código de 6 dígitos a <strong>{forgotPasswordEmail}</strong>
                  </p>
                </div>

                {/* Código de Verificación */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Código de Verificación
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value);
                      if (errors.code) {
                        setErrors((prev) => ({ ...prev, code: '' }));
                      }
                    }}
                    placeholder="Ingresa el código de 6 dígitos"
                    maxLength={6}
                    className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md text-center text-2xl tracking-widest font-mono ${
                      errors.code ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                    }`}
                  />
                  {errors.code && (
                    <p className="text-rose text-sm mt-1.5">{errors.code}</p>
                  )}
                </div>

                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => {
                        setResetNewPassword(e.target.value);
                        if (errors.newPassword) {
                          setErrors((prev) => ({ ...prev, newPassword: '' }));
                        }
                      }}
                      placeholder="Ingresa tu nueva contraseña"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.newPassword ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                      {showResetNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-rose text-sm mt-1.5">{errors.newPassword}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    Mínimo 8 caracteres, incluye mayúsculas, minúsculas, números y símbolos
                  </p>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => {
                        setResetConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      placeholder="Confirma tu nueva contraseña"
                      className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                        errors.confirmPassword ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                      {showResetConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-rose text-sm mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-5 py-4 rounded-2xl text-sm font-medium shadow-lg">
                    {errorMessage}
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="relative z-10 text-lg tracking-wide">
                      {loading ? 'RESTABLECIENDO...' : 'RESTABLECER CONTRASEÑA'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-2xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Lock size={16} />
            <span>Autenticación segura con AWS Cognito</span>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de login normal
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="mb-4">
            <img 
              src="/LOGO_Blanco.png" 
              alt="Nadro Mentoría" 
              className="h-16 w-auto"
            />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">Mentoria de vida</h1>
            <p className="text-xs text-gray-500">Panel de control</p>
          </div>
        </div>

        {/* Card de Login Premium */}
        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                Correo Electrónico
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu email"
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
                onClick={handleForgotPasswordClick}
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
          <span>Autenticación segura con AWS Cognito</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

