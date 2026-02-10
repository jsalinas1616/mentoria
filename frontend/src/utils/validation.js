// Utilidades de validación

/**
 * Parsea una fecha como fecha local para evitar problemas con zonas horarias
 * @param {string} fecha - Fecha en formato YYYY-MM-DD o ISO
 * @returns {Date} - Objeto Date en zona horaria local
 */
export const parseFechaLocal = (fecha) => {
  if (!fecha) return null;
  
  // Si la fecha ya tiene formato ISO con hora (incluye 'T'), usar directamente
  if (fecha.includes('T')) {
    return new Date(fecha);
  }
  
  // Para fechas en formato YYYY-MM-DD, parsear como fecha local
  const [year, month, day] = fecha.split('-').map(Number);
  return new Date(year, month - 1, day);
};

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
  const date = parseFechaLocal(fecha);
  if (!date) return '';
  
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


