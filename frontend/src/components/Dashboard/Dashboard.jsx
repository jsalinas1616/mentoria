import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Users } from 'lucide-react';
import { dashboardService, consultasService, capacitacionesService, authService, entrevistasService } from '../../services/api';
import MentorEmptyState from './MentorEmptyState';
import DashboardHeader from './DashboardHeader';
import MentorHeader from './MentorHeader';
import DashboardFilters from './DashboardFilters';
import DashboardKpis from './DashboardKpis';
import DashboardCharts from './DashboardCharts';
import DashboardTabs from './DashboardTabs';
import ConsultasTab from './ConsultasTab';
import CapacitacionesTab from './CapacitacionesTab';
import EntrevistasTab from './EntrevistasTab';
import ConsultaModal from './ConsultaModal';
import CapacitacionModal from './CapacitacionModal';
import EntrevistaModal from './EntrevistaModal';

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
  const [tabActivo, setTabActivo] = useState('consultas');
  const user = authService.getCurrentUser();

  const isAdmin = user?.roles?.includes('admin') || user?.rol === 'admin' || false;
  const isMentor = user?.roles?.includes('mentor') || user?.rol === 'mentor' || false;

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, consultasData, capacitacionesData, entrevistasData] = await Promise.all([
        dashboardService.obtenerEstadisticas(filtros),
        consultasService.listar(filtros),
        capacitacionesService.listar(filtros),
        entrevistasService.listar(filtros),
      ]);
      setStats(statsData);
      setConsultas(consultasData);
      setCapacitaciones(Array.isArray(capacitacionesData) ? capacitacionesData : []);
      setEntrevistas(entrevistasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      console.error('Error detallado capacitaciones:', error);
      setCapacitaciones([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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

  const handleFechaInicioChange = (date) => {
    const fechaISO = date ? date.toISOString().split('T')[0] : '';
    setFiltros((prev) => ({ ...prev, fechaInicio: fechaISO }));
  };

  const handleFechaFinChange = (date) => {
    const fechaISO = date ? date.toISOString().split('T')[0] : '';
    setFiltros((prev) => ({ ...prev, fechaFin: fechaISO }));
  };

  const toggleFiltros = () => {
    setMostrarFiltros((prev) => !prev);
  };

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

  const consultasFiltradas = consultas.filter((consulta) => {
    if (!busqueda) return true;

    const terminoBusqueda = busqueda.toLowerCase();
    return (
      consulta.mentores?.some((mentor) => mentor.toLowerCase().includes(terminoBusqueda)) ||
      consulta.rangoEdad?.toLowerCase().includes(terminoBusqueda) ||
      consulta.sexo?.toLowerCase().includes(terminoBusqueda) ||
      consulta.lugarTrabajo?.toLowerCase().includes(terminoBusqueda) ||
      consulta.area?.toLowerCase().includes(terminoBusqueda)
    );
  });

  const indiceUltimaConsulta = paginaActual * consultasPorPagina;
  const indicePrimeraConsulta = indiceUltimaConsulta - consultasPorPagina;
  const consultasPaginaActual = consultasFiltradas.slice(indicePrimeraConsulta, indiceUltimaConsulta);
  const totalPaginas = Math.ceil(consultasFiltradas.length / consultasPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const capacitacionesFiltradas = capacitaciones.filter((capacitacion) => {
    if (!busquedaCapacitaciones) return true;

    const terminoBusqueda = busquedaCapacitaciones.toLowerCase();
    return (
      capacitacion.tema?.toLowerCase().includes(terminoBusqueda) ||
      capacitacion.lugar?.toLowerCase().includes(terminoBusqueda) ||
      capacitacion.capacitadores?.some((cap) => cap.toLowerCase().includes(terminoBusqueda)) ||
      capacitacion.asistentes?.some(
        (asistente) =>
          asistente.area?.toLowerCase().includes(terminoBusqueda) ||
          asistente.lugarTrabajo?.toLowerCase().includes(terminoBusqueda)
      )
    );
  });

  const indiceUltimaCapacitacion = paginaActualCapacitaciones * capacitacionesPorPagina;
  const indicePrimeraCapacitacion = indiceUltimaCapacitacion - capacitacionesPorPagina;
  const capacitacionesPaginaActual = capacitacionesFiltradas.slice(indicePrimeraCapacitacion, indiceUltimaCapacitacion);
  const totalPaginasCapacitaciones = Math.ceil(capacitacionesFiltradas.length / capacitacionesPorPagina);

  const cambiarPaginaCapacitaciones = (numeroPagina) => {
    setPaginaActualCapacitaciones(numeroPagina);
  };

  const entrevistasFiltradas = entrevistas.filter((entrevista) => {
    if (!busquedaEntrevistas) return true;

    const terminoBusquedaEntrevista = busquedaEntrevistas.toLowerCase();
    return (
      entrevista.entrevistadores?.some((entrevistador) => entrevistador.toLowerCase().includes(terminoBusquedaEntrevista)) ||
      entrevista.rangoEdad?.toLowerCase().includes(terminoBusquedaEntrevista) ||
      entrevista.sexo?.toLowerCase().includes(terminoBusquedaEntrevista) ||
      entrevista.lugarTrabajo?.toLowerCase().includes(terminoBusquedaEntrevista) ||
      entrevista.area?.toLowerCase().includes(terminoBusquedaEntrevista)
    );
  });

  const indiceUltimaEntrevista = paginaActualEntrevistas * entrevistasPorPagina;
  const indicePrimeraEntrevista = indiceUltimaEntrevista - entrevistasPorPagina;
  const entrevistasPaginaActual = entrevistasFiltradas.slice(indicePrimeraEntrevista, indiceUltimaEntrevista);
  const totalPaginasEntrevistas = Math.ceil(entrevistasFiltradas.length / entrevistasPorPagina);

  const cambiarPaginaEntrevista = (numeroPagina) => {
    setPaginaActualEntrevistas(numeroPagina);
  };

  useEffect(() => {
    setPaginaActualEntrevistas(1);
  }, [busquedaEntrevistas]);

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

  if (isMentor && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-mesh">
        <MentorHeader user={user} onLogout={onLogout} />
        <MentorEmptyState
          onNuevaMentoria={() => (window.location.href = '/#/dashboard/sesion/nueva')}
          onNuevaCapacitacion={() => (window.location.href = '/#/dashboard/capacitaciones/nueva')}
          userName={user?.name || user?.email?.split('@')[0] || 'Mentor'}
        />
      </div>
    );
  }

  const tabs = [
    {
      id: 'consultas',
      label: `Mentorías (${consultas.length})`,
      icon: FileText,
      activeClassName: 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg',
      content: (
        <ConsultasTab
          consultas={consultas}
          consultasFiltradas={consultasFiltradas}
          consultasPaginaActual={consultasPaginaActual}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          onExportar={handleExportar}
          onVerConsulta={abrirModal}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          indicePrimeraConsulta={indicePrimeraConsulta}
          indiceUltimaConsulta={indiceUltimaConsulta}
          onCambiarPagina={cambiarPagina}
        />
      ),
    },
    {
      id: 'capacitaciones',
      label: `Capacitaciones (${capacitaciones.length})`,
      icon: Users,
      activeClassName: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg',
      content: (
        <CapacitacionesTab
          capacitaciones={capacitaciones}
          capacitacionesFiltradas={capacitacionesFiltradas}
          capacitacionesPaginaActual={capacitacionesPaginaActual}
          busquedaCapacitaciones={busquedaCapacitaciones}
          onBusquedaChange={setBusquedaCapacitaciones}
          onExportar={handleExportar}
          onVerCapacitacion={abrirModalCapacitacion}
          paginaActual={paginaActualCapacitaciones}
          totalPaginas={totalPaginasCapacitaciones}
          onCambiarPagina={cambiarPaginaCapacitaciones}
        />
      ),
    },
    {
      id: 'entrevistas',
      label: `Entrevistas (${entrevistas.length})`,
      icon: FileText,
      activeClassName: 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg',
      content: (
        <EntrevistasTab
          entrevistas={entrevistas}
          entrevistasFiltradas={entrevistasFiltradas}
          entrevistasPaginaActual={entrevistasPaginaActual}
          busquedaEntrevistas={busquedaEntrevistas}
          onBusquedaChange={setBusquedaEntrevistas}
          onExportar={handleExportar}
          onVerEntrevista={abrirModalEntrevista}
          paginaActual={paginaActualEntrevistas}
          totalPaginas={totalPaginasEntrevistas}
          indicePrimeraEntrevista={indicePrimeraEntrevista}
          indiceUltimaEntrevista={indiceUltimaEntrevista}
          onCambiarPagina={cambiarPaginaEntrevista}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <DashboardHeader user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardFilters
          filtros={filtros}
          mostrarFiltros={mostrarFiltros}
          onToggleFiltros={toggleFiltros}
          onFiltroChange={handleFiltroChange}
          onLimpiarFiltros={limpiarFiltros}
          onFechaInicioChange={handleFechaInicioChange}
          onFechaFinChange={handleFechaFinChange}
        />

        <DashboardKpis stats={stats} />
        <DashboardCharts stats={stats} />
        <DashboardTabs tabs={tabs} activeTab={tabActivo} onTabChange={setTabActivo} />
      </div>

      <ConsultaModal isOpen={mostrarModal} consulta={consultaSeleccionada} onClose={cerrarModal} />
      <CapacitacionModal
        isOpen={mostrarModalCapacitacion}
        capacitacion={capacitacionSeleccionada}
        onClose={cerrarModalCapacitacion}
      />
      <EntrevistaModal
        isOpen={mostrarModalEntrevista}
        entrevista={entrevistaSeleccionada}
        onClose={cerrarModalEntrevista}
      />
    </div>
  );
};

export default Dashboard;
