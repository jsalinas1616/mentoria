import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import FormularioConsulta from './components/FormularioConsulta/FormularioConsulta';
import { authService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa
    const token = localStorage.getItem('authToken');
    const userData = authService.getCurrentUser();
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si es admin, mostrar dashboard con opción de formulario
  if (user?.rol === 'admin') {
    return (
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                onNuevaConsulta={() => window.location.href = '/nueva-consulta'}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/nueva-consulta" 
            element={
              <FormularioConsulta
                onSuccess={() => window.location.href = '/'}
                onCancel={() => window.location.href = '/'}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  // Si es mentor/empleado, solo mostrar formulario
  return (
    <div>
      <FormularioConsulta
        onSuccess={() => {
          alert('¡Consulta guardada exitosamente!');
          window.location.reload();
        }}
        onCancel={handleLogout}
        userMode="empleado"
      />
    </div>
  );
}

export default App;
