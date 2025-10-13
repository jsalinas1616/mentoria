import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Users, FileText, Calendar, TrendingUp, Download, Filter,
  Plus, LogOut, Menu,
} from 'lucide-react';
import { dashboardService, consultasService, authService } from '../../services/api';
import { formatearFecha } from '../../utils/validation';

const COLORS = ['#8FB339', '#7A9B3C', '#6B8E23', '#5A7A1F', '#4A6A15'];

const Dashboard = ({ onNuevaConsulta, onLogout }) => {
  const [stats, setStats] = useState({
    totalConsultas: 0,
    consultasMes: 0,
    motivosMasFrecuentes: [],
    lugaresTrabajo: [],
    consultasPorFecha: [],
  });
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    lugarTrabajo: '',
    area: '',
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [statsData, consultasData] = await Promise.all([
        dashboardService.obtenerEstadisticas(filtros),
        consultasService.listar(filtros),
      ]);
      setStats(statsData);
      setConsultas(consultasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async (formato) => {
    try {
      const blob = await dashboardService.exportar(formato, filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consultas_${new Date().toISOString().split('T')[0]}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      lugarTrabajo: '',
      area: '',
    });
  };

  if (loading && consultas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
        <div className="text-white text-xl">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark">
      {/* Header */}
      <header className="bg-dark-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden text-white hover:text-accent"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">NADRO MENTORÍA</h1>
                <p className="text-white/60 text-sm">Dashboard de Consultas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right mr-4">
                <p className="text-white text-sm font-medium">{user?.nombre || 'Usuario'}</p>
                <p className="text-white/60 text-xs">{user?.email || ''}</p>
              </div>
              
              <button
                onClick={onNuevaConsulta}
                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Nueva Consulta</span>
              </button>
              
              <button
                onClick={onLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="bg-dark-card text-white px-4 py-2 rounded-lg hover:bg-dark-input transition-all flex items-center gap-2 mb-4"
          >
            <Filter size={20} />
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>

          {mostrarFiltros && (
            <div className="bg-dark-card rounded-xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={filtros.fechaInicio}
                    onChange={handleFiltroChange}
                    className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={filtros.fechaFin}
                    onChange={handleFiltroChange}
                    className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Lugar de Trabajo</label>
                  <input
                    type="text"
                    name="lugarTrabajo"
                    value={filtros.lugarTrabajo}
                    onChange={handleFiltroChange}
                    placeholder="Filtrar..."
                    className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={limpiarFiltros}
                    className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded-lg transition-all"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-accent/20 rounded-lg">
                <FileText className="text-accent" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalConsultas}</h3>
            <p className="text-white/60 text-sm">Total de Consultas</p>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Calendar className="text-green-400" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.consultasMes}</h3>
            <p className="text-white/60 text-sm">Consultas Este Mes</p>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="text-blue-400" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.motivosMasFrecuentes[0]?.count || 0}
            </h3>
            <p className="text-white/60 text-sm">
              {stats.motivosMasFrecuentes[0]?.motivo || 'Motivo Principal'}
            </p>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats.lugaresTrabajo.length}
            </h3>
            <p className="text-white/60 text-sm">Lugares de Trabajo Activos</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras: Motivos más frecuentes */}
          <div className="bg-dark-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Motivos Más Frecuentes</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.motivosMasFrecuentes.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="motivo" stroke="#B0B0B0" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#B0B0B0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8FB339" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pastel: Lugares de trabajo */}
          <div className="bg-dark-card rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Distribución por Lugar</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.lugaresTrabajo.slice(0, 5)}
                  dataKey="count"
                  nameKey="lugar"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.lugaresTrabajo.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Línea: Consultas por fecha */}
          <div className="bg-dark-card rounded-xl p-6 border border-white/10 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Tendencia de Consultas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.consultasPorFecha}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="fecha" stroke="#B0B0B0" />
                <YAxis stroke="#B0B0B0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8FB339"
                  strokeWidth={3}
                  dot={{ fill: '#8FB339', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Consultas Recientes */}
        <div className="bg-dark-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Consultas Recientes</h2>
            <button
              onClick={() => handleExportar('excel')}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/80 font-medium pb-3 px-4">Fecha</th>
                  <th className="text-left text-white/80 font-medium pb-3 px-4">Mentor</th>
                  <th className="text-left text-white/80 font-medium pb-3 px-4">Lugar Trabajo</th>
                  <th className="text-left text-white/80 font-medium pb-3 px-4">Área</th>
                  <th className="text-left text-white/80 font-medium pb-3 px-4">Motivos</th>
                </tr>
              </thead>
              <tbody>
                {consultas.slice(0, 10).map((consulta) => (
                  <tr
                    key={consulta.id}
                    className="border-b border-white/5 hover:bg-dark-input/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-white text-sm">
                      {formatearFecha(consulta.fecha)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white text-sm font-medium">{consulta.nombreMentor}</p>
                        <p className="text-white/60 text-xs">{consulta.correoMentor}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white text-sm">{consulta.lugarTrabajo}</td>
                    <td className="py-3 px-4 text-white/80 text-sm truncate max-w-xs">
                      {consulta.area}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {consulta.motivosConsulta.slice(0, 2).map((motivo, idx) => (
                          <span
                            key={idx}
                            className="bg-accent/20 text-accent px-2 py-1 rounded text-xs"
                          >
                            {motivo}
                          </span>
                        ))}
                        {consulta.motivosConsulta.length > 2 && (
                          <span className="text-white/60 text-xs px-2 py-1">
                            +{consulta.motivosConsulta.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {consultas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60">No hay consultas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


