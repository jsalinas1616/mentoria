import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Users, FileText, Calendar, TrendingUp, Download, Filter,
  Plus, LogOut, Menu, Sparkles, BarChart3, PieChart as PieChartIcon, Activity,
  Eye, X, Search, ChevronLeft, ChevronRight, MessageSquare, User, BookOpen,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { dashboardService, consultasService, capacitacionesService, authService, entrevistasService } from '../../services/api';
import { formatearFecha } from '../../utils/validation';
import MentorEmptyState from './MentorEmptyState';
import DropdownActions from '../Dropdown/Dropdown';

const COLORS = ['#059669', '#10B981', '#16A34A', '#22C55E', '#34D399'];

const Dashboard = ({ onNuevaConsulta, onLogout }) => {
  const [stats, setStats] = useState({
    totalConsultas: 0,
    consultasMes: 0,
    motivosMasFrecuentes: [],
    lugaresTrabajo: [],
    consultasPorFecha: [],
  });
  const [consultas, setConsultas] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [entrevistas, setEntrevistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    lugarTrabajo: '',
    area: '',
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Nuevos estados para funcionalidades
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);
  const [mostrarModalCapacitacion, setMostrarModalCapacitacion] = useState(false);
  const [entrevistaSeleccionada, setEntrevistaSeleccionada] = useState(null);
  const [mostrarModalEntrevista, setMostrarModalEntrevista] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaCapacitaciones, setBusquedaCapacitaciones] = useState('');
  const [busquedaEntrevistas, setBusquedaEntrevistas] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginaActualCapacitaciones, setPaginaActualCapacitaciones] = useState(1);
  const [paginaActualEntrevistas, setPaginaActualEntrevistas] = useState(1);
  const [consultasPorPagina] = useState(10);
  const [capacitacionesPorPagina] = useState(10);
  const [entrevistasPorPagina] = useState(10);
  const [tabActivo, setTabActivo] = useState('consultas'); // 'consultas ,capacitaciones o entrevistas'
  const user = authService.getCurrentUser();
  
  // Detectar si el usuario es admin o mentor
  // Los grupos en Cognito se guardan en el campo 'roles'
  const isAdmin = user?.roles?.includes('admin') || user?.rol === 'admin' || false;
  const isMentor = user?.roles?.includes('mentor') || user?.rol === 'mentor' || false;

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [statsData, consultasData, capacitacionesData, entrevistasData] = await Promise.all([
        dashboardService.obtenerEstadisticas(filtros),
        consultasService.listar(filtros),
        capacitacionesService.listar(filtros),
        entrevistasService.listar(filtros)
      ]);
      setStats(statsData);
      setConsultas(consultasData);
      setCapacitaciones(Array.isArray(capacitacionesData) ? capacitacionesData : []);
      setEntrevistas(entrevistasData)
    } catch (error) {
      console.error('Error al cargar datos:', error);
      console.error('Error detallado capacitaciones:', error);
      setCapacitaciones([]);
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
      a.download = `consultas_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  // Funciones para el modal
  const abrirModal = (consulta) => {
    setConsultaSeleccionada(consulta);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setConsultaSeleccionada(null);
  };

  const abrirModalCapacitacion = (capacitacion) => {
    setCapacitacionSeleccionada(capacitacion);
    setMostrarModalCapacitacion(true);
  };

  const cerrarModalCapacitacion = () => {
    setMostrarModalCapacitacion(false);
    setCapacitacionSeleccionada(null);
  };

  const abrirModalEntrevista = (entrevista) => {
    setEntrevistaSeleccionada(entrevista);
    setMostrarModalEntrevista(true);
  };

  const cerrarModalEntrevista = () => {
    setMostrarModalEntrevista(false);
    setEntrevistaSeleccionada(null);
  }; 

  // Función para filtrar consultas por búsqueda
  const consultasFiltradas = consultas.filter(consulta => {
    if (!busqueda) return true;
    
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      consulta.mentores?.some(mentor => mentor.toLowerCase().includes(terminoBusqueda)) ||
      consulta.rangoEdad?.toLowerCase().includes(terminoBusqueda) ||
      consulta.sexo?.toLowerCase().includes(terminoBusqueda) ||
      consulta.lugarTrabajo?.toLowerCase().includes(terminoBusqueda) ||
      consulta.area?.toLowerCase().includes(terminoBusqueda)
    );
  });

  // Paginación
  const indiceUltimaConsulta = paginaActual * consultasPorPagina;
  const indicePrimeraConsulta = indiceUltimaConsulta - consultasPorPagina;
  const consultasPaginaActual = consultasFiltradas.slice(indicePrimeraConsulta, indiceUltimaConsulta);
  const totalPaginas = Math.ceil(consultasFiltradas.length / consultasPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // Función para filtrar capacitaciones por búsqueda
  const capacitacionesFiltradas = capacitaciones.filter(capacitacion => {
    if (!busquedaCapacitaciones) return true;
    
    const terminoBusqueda = busquedaCapacitaciones.toLowerCase();
    return (
      capacitacion.tema?.toLowerCase().includes(terminoBusqueda) ||
      capacitacion.lugar?.toLowerCase().includes(terminoBusqueda) ||
      capacitacion.capacitadores?.some(cap => cap.toLowerCase().includes(terminoBusqueda)) ||
      capacitacion.asistentes?.some(asistente => 
        asistente.area?.toLowerCase().includes(terminoBusqueda) ||
        asistente.lugarTrabajo?.toLowerCase().includes(terminoBusqueda)
      )
    );
  });

  // Paginación para capacitaciones
  const indiceUltimaCapacitacion = paginaActualCapacitaciones * capacitacionesPorPagina;
  const indicePrimeraCapacitacion = indiceUltimaCapacitacion - capacitacionesPorPagina;
  const capacitacionesPaginaActual = capacitacionesFiltradas.slice(indicePrimeraCapacitacion, indiceUltimaCapacitacion);
  const totalPaginasCapacitaciones = Math.ceil(capacitacionesFiltradas.length / capacitacionesPorPagina);

  const cambiarPaginaCapacitaciones = (numeroPagina) => {
    setPaginaActualCapacitaciones(numeroPagina);
  };

  // Función para filtrar entrevistas por búsqueda

    const entrevistasFiltradas = entrevistas.filter(entrevista => {
    if (!busquedaEntrevistas) return true;
    
    const terminoBusquedaEntrevista = busquedaEntrevistas.toLowerCase();
    return (
      entrevista.entrevistadores?.some(entrevistador => entrevistador.toLowerCase().includes(terminoBusquedaEntrevista)) ||
      entrevista.rangoEdad?.toLowerCase().includes(terminoBusquedaEntrevista) ||
      entrevista.sexo?.toLowerCase().includes(terminoBusquedaEntrevista) ||
      entrevista.lugarTrabajo?.toLowerCase().includes(terminoBusquedaEntrevista) ||
      entrevista.area?.toLowerCase().includes(terminoBusquedaEntrevista)
    );
  });

    //Paginación entrevistas
    const indiceUltimaEntrevista = paginaActualEntrevistas * entrevistasPorPagina;
    const indicePrimeraEntrevista = indiceUltimaEntrevista - entrevistasPorPagina;
    const entrevistasPaginaActual = entrevistasFiltradas.slice(indicePrimeraEntrevista, indiceUltimaEntrevista);
    const totalPaginasEntrevistas = Math.ceil(entrevistasFiltradas.length / entrevistasPorPagina);

    const cambiarPaginaEntrevista = (numeroPagina) => {
      setPaginaActualEntrevistas(numeroPagina);
    };

    // Resetear página cuando cambia la búsqueda entrevistas
    useEffect(() => {
      setPaginaActualEntrevistas(1);
    }, [busquedaEntrevistas]);

  // Resetear página cuando cambia la búsqueda de capacitaciones
  useEffect(() => {
    setPaginaActualCapacitaciones(1);
  }, [busquedaCapacitaciones]);

  if (loading && consultas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-gray-600 text-xl">Cargando datos...</div>
      </div>
    );
  }

  // Si es mentor (no admin), mostrar vista de bienvenida
  if (isMentor && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-mesh">
        {/* Header simplificado para mentores */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-soft">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/LOGO_Blanco.png" 
                  alt="Nadro Mentoría" 
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-500">Panel de consultas</p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Usuario
                  <br />
                  <span className="font-medium text-primary">{user?.email}</span>
                </span>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-rose hover:bg-rose/10 rounded-xl transition-all duration-300"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Vista de Bienvenida para Mentores */}
        <MentorEmptyState
          onNuevaMentoria={() => window.location.href = '/#/dashboard/consultas/nueva'}
          onNuevaCapacitacion={() => window.location.href = '/#/dashboard/capacitaciones/nueva'}
          userName={user?.name || user?.email?.split('@')[0] || 'Mentor'}
        />
      </div>
    );
  }

  // Vista completa para Administradores
  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header Moderno */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/LOGO_Blanco.png" 
                  alt="Nadro Mentoría" 
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-500">Panel de consultas</p>
                </div>
              </div>
            </div>


            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right mr-4">
                <p className="text-gray-900 text-sm font-medium">{user?.nombre || 'Usuario'}</p>
                <p className="text-gray-500 text-xs">{user?.email || ''}</p>
              </div>
              
              <DropdownActions />
              
              <button
                onClick={onLogout}
                className="bg-white hover:bg-gray-50 text-rose px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md border border-gray-300"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros Modernos */}
        <div className="mb-8">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 mb-4 shadow-sm hover:shadow-md border border-gray-300"
          >
            <Filter size={18} />
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>

          {mostrarFiltros && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Fecha Inicio</label>
                  <DatePicker
                    selected={filtros.fechaInicio ? new Date(filtros.fechaInicio) : null}
                    onChange={(date) => {
                      const fechaISO = date ? date.toISOString().split('T')[0] : '';
                      setFiltros(prev => ({ ...prev, fechaInicio: fechaISO }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/AAAA"
                    isClearable
                    className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Fecha Fin</label>
                  <DatePicker
                    selected={filtros.fechaFin ? new Date(filtros.fechaFin) : null}
                    onChange={(date) => {
                      const fechaISO = date ? date.toISOString().split('T')[0] : '';
                      setFiltros(prev => ({ ...prev, fechaFin: fechaISO }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/AAAA"
                    isClearable
                    className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Lugar de Trabajo</label>
                  <input
                    type="text"
                    name="lugarTrabajo"
                    value={filtros.lugarTrabajo}
                    onChange={handleFiltroChange}
                    placeholder="Filtrar..."
                    className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={limpiarFiltros}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl font-semibold shadow-lg"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KPIs Modernos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                <FileText className="text-primary" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalConsultas}</h3>
            <p className="text-gray-600 text-sm font-medium">Total de Consultas</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-success/10 to-success-light/10 rounded-xl">
                <Calendar className="text-success" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.consultasMes}</h3>
            <p className="text-gray-600 text-sm font-medium">Consultas Este Mes</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-accent/10 to-accent-light/10 rounded-xl">
                <Users className="text-accent" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stats.motivosMasFrecuentes[0]?.count || 0}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {stats.motivosMasFrecuentes[0]?.motivo || 'Motivo Principal'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl">
                <TrendingUp className="text-primary-light" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stats.lugaresTrabajo.length}
            </h3>
            <p className="text-gray-600 text-sm font-medium">Lugares de Trabajo Activos</p>
          </div>
        </div>

        {/* Gráficos Modernos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras: Motivos más frecuentes */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Motivos Más Frecuentes</h2>
                <p className="text-sm text-gray-600">Distribución de motivos de consulta</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.motivosMasFrecuentes.slice(0, 5)} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="motivo" 
                  stroke="#6B7280" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                  tick={{ fontSize: 13 }}
                />
                <YAxis stroke="#6B7280" domain={[0, 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Bar dataKey="count" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pastel: Lugares de trabajo */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-accent/10 to-accent-light/10 rounded-xl">
                <PieChartIcon className="text-accent" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Distribución por Lugar</h2>
                <p className="text-sm text-gray-600">Consultas por lugar de trabajo</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stats.lugaresTrabajo.slice(0, 6)}
                  dataKey="count"
                  nameKey="lugar"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={false}
                >
                  {stats.lugaresTrabajo.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`${value} consultas`, name]}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '11px',
                    lineHeight: '1.4'
                  }}
                  formatter={(value) => {
                    if (value.length > 15) {
                      return value.substring(0, 15) + '...';
                    }
                    return value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Línea: Consultas por fecha */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-success/10 to-success-light/10 rounded-xl">
                <Activity className="text-success" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tendencia de Consultas</h2>
                <p className="text-sm text-gray-600">Evolución de consultas en el tiempo</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.consultasPorFecha}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="fecha" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: '#059669', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs para Consultas y Capacitaciones */}
        <div className="bg-white rounded-t-3xl border-b-2 border-gray-200">
          <div className="flex gap-2 p-2">
            <button
              onClick={() => setTabActivo('consultas')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                tabActivo === 'consultas'
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              Mentorías ({consultas.length})
            </button>
            <button
              onClick={() => setTabActivo('capacitaciones')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                tabActivo === 'capacitaciones'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              Capacitaciones ({capacitaciones.length})
            </button>
            <button
              onClick={() => setTabActivo('entrevistas')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                tabActivo === 'entrevistas'
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              Entrevistas ({entrevistas.length})
            </button>
          </div>
        </div>

        {/* Tabla de Consultas Recientes Moderna */}
        {tabActivo === 'consultas' && (
          <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mentorías Recientes</h2>
                  <p className="text-sm text-gray-600">
                    {consultasFiltradas.length} de {consultas.length} mentorías
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExportar('excel')}
                className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 font-semibold shadow-lg"
              >
                <Download size={18} />
                Exportar Excel
              </button>
            </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, correo, lugar de trabajo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Mentor</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sesión #</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Edad</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sexo</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Área</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Motivos</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultasPaginaActual.map((consulta) => (
                  <tr
                    key={consulta.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-900 text-sm font-medium">
                      {formatearFecha(consulta.fecha)}
                    </td>
                    <td className="py-4 px-4">
                      {consulta.mentores && consulta.mentores.length > 0 ? (
                        consulta.mentores.length === 1 ? (
                          <p className="text-gray-900 text-sm font-semibold">{consulta.mentores[0]}</p>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-gray-900 text-sm font-semibold">{consulta.mentores[0]}</p>
                            <p className="text-gray-500 text-xs">+{consulta.mentores.length - 1} más</p>
                          </div>
                        )
                      ) : (
                        <p className="text-gray-400 text-sm italic">Sin mentores</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-bold rounded-full">
                        {consulta.numeroSesion || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm">{consulta.rangoEdad || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700 text-sm">{consulta.sexo || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700 text-sm">{consulta.lugarTrabajo}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm truncate max-w-xs">
                      {consulta.area}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {consulta.motivosConsulta.slice(0, 2).map((motivo, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20"
                          >
                            {motivo}
                          </span>
                        ))}
                        {consulta.motivosConsulta.length > 2 && (
                          <span className="text-gray-500 text-xs px-3 py-1">
                            +{consulta.motivosConsulta.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => abrirModal(consulta)}
                        className="bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-primary/20 hover:border-primary/40"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {indicePrimeraConsulta + 1} a {Math.min(indiceUltimaConsulta, consultasFiltradas.length)} de {consultasFiltradas.length} consultas
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="p-2 rounded-xl border border-gray-300 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let numeroPagina;
                  if (totalPaginas <= 5) {
                    numeroPagina = i + 1;
                  } else if (paginaActual <= 3) {
                    numeroPagina = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    numeroPagina = totalPaginas - 4 + i;
                  } else {
                    numeroPagina = paginaActual - 2 + i;
                  }
                  
                  return (
                    <button
                      key={numeroPagina}
                      onClick={() => cambiarPagina(numeroPagina)}
                      className={`px-3 py-2 rounded-xl font-medium transition-all ${
                        paginaActual === numeroPagina
                          ? 'bg-primary text-white shadow-lg'
                          : 'border border-gray-300 hover:border-primary hover:bg-primary/10 text-gray-700'
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="p-2 rounded-xl border border-gray-300 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {consultas.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-50 rounded-2xl inline-block">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No hay mentorías registradas</p>
                <p className="text-gray-400 text-sm">Las mentorías aparecerán aquí cuando se registren</p>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Tabla de Capacitaciones */}
        {tabActivo === 'capacitaciones' && (
          <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Capacitaciones Recientes</h2>
                  <p className="text-sm text-gray-600">
                    {capacitacionesFiltradas.length} de {capacitaciones.length} capacitaciones
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExportar('excel')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            </div>

            {/* Buscador */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por tema, capacitador, lugar..."
                  value={busquedaCapacitaciones}
                  onChange={(e) => setBusquedaCapacitaciones(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Tema</th>
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Capacitadores</th>
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Invitados</th>
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Asistentes</th>
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar</th>
                    <th className="text-left text-gray-700 font-semibold pb-4 px-4">Duración</th>
                    <th className="text-center text-gray-700 font-semibold pb-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(capacitacionesPaginaActual) && capacitacionesPaginaActual.map((capacitacion) => (
                    <tr
                      key={capacitacion.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="text-gray-900 font-medium">
                          {formatearFecha(capacitacion.fecha)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 font-medium">{capacitacion.tema}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">
                          {capacitacion.capacitadores.length === 1 
                            ? capacitacion.capacitadores[0]
                            : `${capacitacion.capacitadores[0]} +${capacitacion.capacitadores.length - 1}`
                          }
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{capacitacion.numeroPersonasInvitadas}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{capacitacion.asistentes?.length || 0}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{capacitacion.lugar}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{capacitacion.duracion}</span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => abrirModalCapacitacion(capacitacion)}
                          className="bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-primary/20 hover:border-primary/40"
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación para Capacitaciones */}
            {capacitacionesFiltradas.length > 0 && totalPaginasCapacitaciones > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => cambiarPaginaCapacitaciones(paginaActualCapacitaciones - 1)}
                  disabled={paginaActualCapacitaciones === 1}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(totalPaginasCapacitaciones)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => cambiarPaginaCapacitaciones(index + 1)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      paginaActualCapacitaciones === index + 1
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => cambiarPaginaCapacitaciones(paginaActualCapacitaciones + 1)}
                  disabled={paginaActualCapacitaciones === totalPaginasCapacitaciones}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {capacitaciones.length === 0 && (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-50 rounded-2xl inline-block">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay capacitaciones registradas</p>
                  <p className="text-gray-400 text-sm">Las capacitaciones aparecerán aquí cuando se registren</p>
                </div>
              </div>
            )}
          </div>
        )}

         {/* Tabla de Entrevistas */}

        {tabActivo === 'entrevistas' && (
          <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-gray-200/50 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Entrevistas Recientes</h2>
                  <p className="text-sm text-gray-600">
                    {entrevistasFiltradas.length} de {entrevistas.length} entrevistas
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExportar('excel')}
                className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 font-semibold shadow-lg"
              >
                <Download size={18} />
                Exportar Excel
              </button>
            </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, correo, lugar de trabajo..."
                value={busquedaEntrevistas}
                onChange={(e) => setBusquedaEntrevistas(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Fecha</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Entrevistador</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sesión #</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Edad</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Sexo</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Lugar</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Área</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Motivos</th>
                  <th className="text-left text-gray-700 font-semibold pb-4 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entrevistasPaginaActual.map((entrevista) => (
                  <tr
                    key={entrevista.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-900 text-sm font-medium">
                      {formatearFecha(entrevista.fecha)}
                    </td>
                    <td className="py-4 px-4">
                      {entrevista.entrevistadores && entrevista.entrevistadores.length > 0 ? (
                        entrevista.entrevistadores.length === 1 ? (
                          <p className="text-gray-900 text-sm font-semibold">{entrevista.entrevistadores[0]}</p>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-gray-900 text-sm font-semibold">{entrevista.entrevistadores[0]}</p>
                            <p className="text-gray-500 text-xs">+{entrevista.entrevistadores.length - 1} más</p>
                          </div>
                        )
                      ) : (
                        <p className="text-gray-400 text-sm italic">Sin entrevistadores</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-bold rounded-full">
                        {entrevista.numeroSesion || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm">{entrevista.rangoEdad || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700 text-sm">{entrevista.sexo || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700 text-sm">{entrevista.lugarTrabajo}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm truncate max-w-xs">
                      {entrevista.area}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {entrevista.motivosEntrevista?.slice(0, 2).map((motivo, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20"
                          >
                            {motivo}
                          </span>
                        ))}
                        {entrevista.motivosEntrevista?.length > 2 && (
                          <span className="text-gray-500 text-xs px-3 py-1">
                            +{entrevista.motivosEntrevista.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => abrirModalEntrevista(entrevista)}
                        className="bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-primary/20 hover:border-primary/40"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          {totalPaginasEntrevistas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {indicePrimeraEntrevista + 1} a {Math.min(indiceUltimaEntrevista, entrevistasFiltradas.length)} de {entrevistasFiltradas.length} entrevistas
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarPagina(paginaActualEntrevistas - 1)}
                  disabled={paginaActualEntrevistas === 1}
                  className="p-2 rounded-xl border border-gray-300 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPaginasEntrevistas) }, (_, i) => {
                  let numeroPaginaEntrevista;
                  if (totalPaginasEntrevistas <= 5) {
                    numeroPaginaEntrevista = i + 1;
                  } else if (paginaActualEntrevistas <= 3) {
                    numeroPaginaEntrevista = i + 1;
                  } else if (paginaActualEntrevistas >= totalPaginasEntrevistas - 2) {
                    numeroPaginaEntrevista = totalPaginasEntrevistas - 4 + i;
                  } else {
                    numeroPaginaEntrevista = paginaActualEntrevistas - 2 + i;
                  }
                  
                  return (
                    <button
                      key={numeroPaginaEntrevista}
                      onClick={() => cambiarPaginaEntrevista(numeroPaginaEntrevista)}
                      className={`px-3 py-2 rounded-xl font-medium transition-all ${
                        paginaActualEntrevistas === numeroPaginaEntrevista
                          ? 'bg-primary text-white shadow-lg'
                          : 'border border-gray-300 hover:border-primary hover:bg-primary/10 text-gray-700'
                      }`}
                    >
                      {numeroPaginaEntrevista}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => cambiarPaginaEntrevista(paginaActualEntrevistas + 1)}
                  disabled={paginaActualEntrevistas === totalPaginasEntrevistas}
                  className="p-2 rounded-xl border border-gray-300 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {entrevistas.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-50 rounded-2xl inline-block">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No hay entrevistas registradas</p>
                <p className="text-gray-400 text-sm">Las entrevistas aparecerán aquí cuando se registren</p>
              </div>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Modal de Detalles de Consulta */}
      {mostrarModal && consultaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalles de la Consulta</h2>
                  <p className="text-sm text-gray-600">Información completa de la consulta</p>
                </div>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Información del Mentor */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="text-primary" size={20} />
                  </div>
                  Mentores ({consultaSeleccionada.mentores?.length || 0})
                </h3>
                <div className="space-y-2">
                  {consultaSeleccionada.mentores && consultaSeleccionada.mentores.length > 0 ? (
                    consultaSeleccionada.mentores.map((mentor, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-3 border border-primary/10"
                      >
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-gray-900 font-medium">{mentor}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No hay mentores asignados</p>
                  )}
                </div>
              </div>

              {/* Información del Mentee */}
              <div className="bg-gradient-to-r from-accent/5 to-accent-light/5 rounded-2xl p-6 border border-accent/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Users className="text-accent" size={20} />
                  </div>
                  Datos Demográficos (Confidencial)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Rango de Edad</label>
                    <p className="text-gray-900 font-medium">{consultaSeleccionada.rangoEdad || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Sexo</label>
                    <p className="text-gray-900 font-medium">{consultaSeleccionada.sexo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Número de Sesión</label>
                    <p className="text-gray-900 font-medium">{consultaSeleccionada.numeroSesion || 'N/A'}</p>
                  </div>
                  {consultaSeleccionada.numeroSesion && parseInt(consultaSeleccionada.numeroSesion) > 1 && consultaSeleccionada.haMejorado && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">¿Ha mejorado?</label>
                      <p className={`font-bold ${consultaSeleccionada.haMejorado === 'Sí' ? 'text-green-600' : 'text-orange-600'}`}>
                        {consultaSeleccionada.haMejorado}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Consulta */}
              <div className="bg-gradient-to-r from-success/5 to-success-light/5 rounded-2xl p-6 border border-success/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Calendar className="text-success" size={20} />
                  </div>
                  Información de la Consulta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Fecha de Consulta</label>
                    <p className="text-gray-900 font-medium">{formatearFecha(consultaSeleccionada.fecha)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Lugar de Trabajo</label>
                    <p className="text-gray-900 font-medium">{consultaSeleccionada.lugarTrabajo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Área</label>
                    <p className="text-gray-900 font-medium">{consultaSeleccionada.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Lugar de Consulta</label>
                    <p className="text-gray-900 font-medium">{consultaSeleccionada.lugarConsulta}</p>
                  </div>
                </div>
              </div>

              {/* Motivos de Consulta */}
              <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="text-primary" size={20} />
                  </div>
                  Motivos de Consulta
                </h3>
                <div className="flex flex-wrap gap-2">
                  {consultaSeleccionada.motivosConsulta?.map((motivo, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                    >
                      {motivo}
                    </span>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              {consultaSeleccionada.observaciones && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    Observaciones
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{consultaSeleccionada.observaciones}</p>
                </div>
              )}

              {/* Fechas de Creación */}
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                <p>Consulta creada el {formatearFecha(consultaSeleccionada.createdAt)}</p>
                {consultaSeleccionada.updatedAt !== consultaSeleccionada.createdAt && (
                  <p>Última actualización: {formatearFecha(consultaSeleccionada.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Capacitación */}
      {mostrarModalCapacitacion && capacitacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalles de la Capacitación</h2>
                  <p className="text-sm text-gray-600">Información completa del evento</p>
                </div>
              </div>
              <button
                onClick={cerrarModalCapacitacion}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="text-primary" size={20} />
                  </div>
                  Información de la Capacitación
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tema</p>
                    <p className="text-gray-900 font-medium">{capacitacionSeleccionada.tema || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fecha</p>
                    <p className="text-gray-900 font-medium">{formatearFecha(capacitacionSeleccionada.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hora</p>
                    <p className="text-gray-900 font-medium">{capacitacionSeleccionada.hora || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duración</p>
                    <p className="text-gray-900 font-medium">{capacitacionSeleccionada.duracion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lugar</p>
                    <p className="text-gray-900 font-medium">{capacitacionSeleccionada.lugar || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Personas Invitadas</p>
                    <p className="text-gray-900 font-medium">{capacitacionSeleccionada.numeroPersonasInvitadas || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mentorías Agendadas</p>
                    <p className="text-gray-900 font-medium">{capacitacionSeleccionada.numeroMentoriasAgendadas || 0}</p>
                  </div>
                </div>
              </div>

              {/* Capacitadores */}
              <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6 border border-accent/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Users className="text-accent" size={20} />
                  </div>
                  Capacitadores ({capacitacionSeleccionada.capacitadores?.length || 0})
                </h3>
                <div className="space-y-2">
                  {capacitacionSeleccionada.capacitadores && capacitacionSeleccionada.capacitadores.length > 0 ? (
                    capacitacionSeleccionada.capacitadores.map((capacitador, index) => (
                      <div 
                        key={index}
                        className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3"
                      >
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <User className="text-accent" size={16} />
                        </div>
                        <span className="text-gray-900 font-medium">{capacitador}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No hay capacitadores registrados</p>
                  )}
                </div>
              </div>

              {/* Asistentes */}
              <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Users className="text-secondary" size={20} />
                  </div>
                  Asistentes ({capacitacionSeleccionada.asistentes?.length || 0})
                </h3>
                <div className="space-y-3">
                  {capacitacionSeleccionada.asistentes && capacitacionSeleccionada.asistentes.length > 0 ? (
                    capacitacionSeleccionada.asistentes.map((asistente, index) => (
                      <div 
                        key={index}
                        className="bg-white p-4 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-secondary/10 rounded-lg">
                            <User className="text-secondary" size={16} />
                          </div>
                          <h4 className="font-semibold text-gray-900">Asistente {index + 1}</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Rango de Edad:</span>
                            <span className="ml-2 text-gray-900 font-medium">{asistente.rangoEdad || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sexo:</span>
                            <span className="ml-2 text-gray-900 font-medium">{asistente.sexo || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lugar de Trabajo:</span>
                            <span className="ml-2 text-gray-900 font-medium">{asistente.lugarTrabajo || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Área:</span>
                            <span className="ml-2 text-gray-900 font-medium">{asistente.area || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No hay asistentes registrados</p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              {capacitacionSeleccionada.observaciones && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    Observaciones
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{capacitacionSeleccionada.observaciones}</p>
                </div>
              )}

              {/* Fechas de Creación */}
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                <p>Capacitación creada el {formatearFecha(capacitacionSeleccionada.createdAt)}</p>
                {capacitacionSeleccionada.updatedAt !== capacitacionSeleccionada.createdAt && (
                  <p>Última actualización: {formatearFecha(capacitacionSeleccionada.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entrevista */}
      {mostrarModalEntrevista && entrevistaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalles de la Entrevista</h2>
                  <p className="text-sm text-gray-600">Información completa de la entrevista</p>
                </div>
              </div>
              <button
                onClick={cerrarModalEntrevista}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Entrevistadores */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="text-primary" size={20} />
                  </div>
                  Entrevistadores ({entrevistaSeleccionada.entrevistadores?.length || 0})
                </h3>
                <div className="space-y-2">
                  {entrevistaSeleccionada.entrevistadores && entrevistaSeleccionada.entrevistadores.length > 0 ? (
                    entrevistaSeleccionada.entrevistadores.map((entrevistador, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-3 border border-primary/10"
                      >
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-gray-900 font-medium">{entrevistador}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No hay entrevistadores asignados</p>
                  )}
                </div>
              </div>

              {/* Datos demogrÇ­ficos */}
              <div className="bg-gradient-to-r from-accent/5 to-accent-light/5 rounded-2xl p-6 border border-accent/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Users className="text-accent" size={20} />
                  </div>
                  Datos Demográ­ficos (Confidencial)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Rango de Edad</label>
                    <p className="text-gray-900 font-medium">{entrevistaSeleccionada.rangoEdad || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Sexo</label>
                    <p className="text-gray-900 font-medium">{entrevistaSeleccionada.sexo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Número de Sesión</label>
                    <p className="text-gray-900 font-medium">{entrevistaSeleccionada.numeroSesion || 'N/A'}</p>
                  </div>
                  {entrevistaSeleccionada.numeroSesion && parseInt(entrevistaSeleccionada.numeroSesion, 10) > 1 && entrevistaSeleccionada.haMejorado && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">¿Ha mejorado?</label>
                      <p className={`font-bold ${entrevistaSeleccionada.haMejorado === 'SÍ' ? 'text-green-600' : 'text-orange-600'}`}>
                        {entrevistaSeleccionada.haMejorado}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Entrevista */}
              <div className="bg-gradient-to-r from-success/5 to-success-light/5 rounded-2xl p-6 border border-success/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Calendar className="text-success" size={20} />
                  </div>
                  Información de la Entrevista
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Fecha de Entrevista</label>
                    <p className="text-gray-900 font-medium">{formatearFecha(entrevistaSeleccionada.fecha)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Lugar de Trabajo</label>
                    <p className="text-gray-900 font-medium">{entrevistaSeleccionada.lugarTrabajo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Área</label>
                    <p className="text-gray-900 font-medium">{entrevistaSeleccionada.area || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Lugar de Entrevista</label>
                    <p className="text-gray-900 font-medium">{entrevistaSeleccionada.lugarConsulta || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Motivos de Entrevista */}
              <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="text-primary" size={20} />
                  </div>
                  Motivos de Entrevista
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entrevistaSeleccionada.motivosEntrevista?.map((motivo, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                    >
                      {motivo}
                    </span>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              {entrevistaSeleccionada.observaciones && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    Observaciones
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{entrevistaSeleccionada.observaciones}</p>
                </div>
              )}

              {/* Fechas de CreaciÇün */}
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                <p>Entrevista creada el {formatearFecha(entrevistaSeleccionada.createdAt)}</p>
                {entrevistaSeleccionada.updatedAt !== entrevistaSeleccionada.createdAt && (
                  <p>Çsltima actualizaciÇün: {formatearFecha(entrevistaSeleccionada.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
