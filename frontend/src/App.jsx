import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import FormularioConsulta from './components/FormularioConsulta/FormularioConsulta';
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
            isAuthenticated && user?.rol === 'admin' ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Ruta protegida - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated && user?.rol === 'admin' ? (
              <Dashboard 
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Ruta protegida - Nueva Consulta */}
        <Route 
          path="/dashboard/consultas/nueva" 
          element={
            isAuthenticated && user?.rol === 'admin' ? (
              <FormularioConsulta
                onSuccess={() => window.location.href = '/#/dashboard'}
                onCancel={() => window.location.href = '/#/dashboard'}
                userMode="admin"
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