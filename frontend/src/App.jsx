import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import { authService } from './services/api';
import FormularioCapacitacion from './pages/FormularioCapacitacion';
import FormularioSesion from './pages/FormularioSesion';
import FormularioAcercamiento from './pages/FormularioAcercamiento';
import FormularioVisita from './pages/FormularioVisita';

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

        {/* Ruta protegida - Nuevo Tipo de sesión (Admin y Mentor) */}
        <Route 
          path="/dashboard/sesiones/nueva" 
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

        <Route 
          path="/dashboard/acercamientos/nueva" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <FormularioAcercamiento
                onSuccess={() => window.location.href = '/#/dashboard'}
                onCancel={() => window.location.href = '/#/dashboard'}
                userMode={user?.rol}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/dashboard/visitas/nueva" 
          element={
            isAuthenticated && (user?.rol === 'admin' || user?.rol === 'mentor') ? (
              <FormularioVisita
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
