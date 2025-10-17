const errorHandler = (err, req, res, next) => {
  // Log seguro sin información sensible
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  
  // Mensaje seguro para producción
  let message = 'Error interno del servidor';
  
  // Solo mostrar mensajes específicos para errores conocidos y seguros
  if (statusCode === 400 || statusCode === 401 || statusCode === 404) {
    message = err.message || message;
  }

  const response = {
    error: true,
    message,
    timestamp: new Date().toISOString()
  };

  // Solo incluir stack trace en desarrollo y si está disponible
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;



