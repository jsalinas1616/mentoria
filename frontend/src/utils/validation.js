// Utilidades de validación

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarRequerido = (valor) => {
  if (typeof valor === 'string') {
    return valor.trim().length > 0;
  }
  return valor !== null && valor !== undefined;
};

export const validarArray = (arr, minLength = 1) => {
  return Array.isArray(arr) && arr.length >= minLength;
};

export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatearFechaISO = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toISOString().split('T')[0];
};


