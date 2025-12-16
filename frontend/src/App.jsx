import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import FormularioConsulta from './components/FormularioConsulta/FormularioConsulta';
import FormularioCapacitacion from './components/FormularioCapacitacion/FormularioCapacitacion';
import FormularioEntrevista from './components/FormularioEntrevista/FormularioEntrevista';
import FormularioSesion from './components/FormualrioSesion/FormularioSesion';
import { authService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa y válida
    const token = localStorage.getItem('authToken');
    const userData = authService.getCurrentUser();
    
    if (token && userData && authService.isTokenValid()) {
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      // Si el token expiró, limpiar datos
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
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

  return (
    <Router>
      <Routes>
        {/* Ruta raíz - Redirigir al login */}
        <Route 
          path="/" 
          element={<Navigate to="/login" />} 
        />

        {/* Ruta de login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Ruta protegida - Dashboard (Admin y Mentor) */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <Dashboard 
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Ruta protegida - Nueva Consulta (Admin y Mentor) */}
        <Route 
          path="/dashboard/consultas/nueva" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <FormularioConsulta
                onSuccess={() => window.location.href = '/#/dashboard'}
                onCancel={() => window.location.href = '/#/dashboard'}
                userMode={user?.rol}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Ruta protegida - Nueva Capacitación (Admin y Mentor) */}
        <Route 
          path="/dashboard/capacitaciones/nueva" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <FormularioCapacitacion
                onSuccess={() => window.location.href = '/#/dashboard'}
                onCancel={() => window.location.href = '/#/dashboard'}
                userMode={user?.rol}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Ruta protegida - Nueva Entrevista (Admin y Mentor) */}
        <Route 
          path="/dashboard/entrevistas/nueva" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <FormularioEntrevista
                onSuccess={() => window.location.href = '/#/dashboard'}
                onCancel={() => window.location.href = '/#/dashboard'}
                userMode={user?.rol}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Ruta protegida - Nuevo Tipo de sesión (Admin y Mentor) */}
        <Route 
          path="/dashboard/sesion/nueva" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <FormularioSesion
                onSuccess={() => window.location.href = '/#/dashboard'}
                onCancel={() => window.location.href = '/#/dashboard'}
                userMode={user?.rol}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Redirigir cualquier otra ruta al login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;