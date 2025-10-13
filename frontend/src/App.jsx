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

  return (
    <Router>
      <Routes>
        {/* Ruta pública - Formulario sin login */}
        <Route 
          path="/" 
          element={
            <FormularioConsulta
              onSuccess={() => {
                // Recargar para limpiar el formulario
                window.location.reload();
              }}
              userMode="publico"
            />
          } 
        />

        {/* Ruta de login para administradores */}
        <Route 
          path="/admin/login" 
          element={
            isAuthenticated && user?.rol === 'admin' ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Ruta protegida - Dashboard para admins */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated && user?.rol === 'admin' ? (
              <Dashboard 
                onNuevaConsulta={() => window.location.href = '/admin/nueva-consulta'}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/admin/login" />
            )
          } 
        />

        {/* Ruta protegida - Formulario desde admin */}
        <Route 
          path="/admin/nueva-consulta" 
          element={
            isAuthenticated && user?.rol === 'admin' ? (
              <FormularioConsulta
                onSuccess={() => window.location.href = '/admin/dashboard'}
                onCancel={() => window.location.href = '/admin/dashboard'}
                userMode="admin"
              />
            ) : (
              <Navigate to="/admin/login" />
            )
          } 
        />

        {/* Redirigir cualquier otra ruta al formulario público */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
