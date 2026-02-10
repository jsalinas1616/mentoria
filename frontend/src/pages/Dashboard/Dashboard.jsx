import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, MessageSquare, Users } from 'lucide-react';
import { consultasService, capacitacionesService, authService, entrevistasService, acercamientosService, dashboardService } from '../../services/api';
import { calcularStatsEntrevistas, calcularStatsCapacitaciones, calcularStatsAcercamientos } from '../../utils/dashboardStats';
import MentorEmptyState from './MentorEmptyState';
import DashboardHeader from './DashboardHeader';
import MentorHeader from './MentorHeader';
import DashboardFilters from './DashboardFilters';
import DashboardKpis from './DashboardKpis';
import DashboardCharts from './DashboardCharts';
import DashboardTabs from './DashboardTabs';
import CapacitacionesTab from './CapacitacionesTab';
import EntrevistasTab from './EntrevistasTab';
import AcercamientosTab from './AcercamientosTab';
import ConsultaModal from './ConsultaModal';
import CapacitacionModal from './CapacitacionModal';
import EntrevistaModal from './EntrevistaModal';
import AcercamientoModal from './AcercamientoModal';

const Dashboard = ({ onNuevaConsulta, onLogout }) => {
  const [consultas, setConsultas] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [entrevistas, setEntrevistas] = useState([]);
  const [acercamientos, setAcercamientos] = useState([]);
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
  const [acercamientoSeleccionado, setAcercamientoSeleccionado] = useState(null);
  const [mostrarModalAcercamiento, setMostrarModalAcercamiento] = useState(false);
  const [busquedaCapacitaciones, setBusquedaCapacitaciones] = useState('');
  const [busquedaEntrevistas, setBusquedaEntrevistas] = useState('');
  const [busquedaAcercamientos, setBusquedaAcercamientos] = useState('');
  const [paginaActualCapacitaciones, setPaginaActualCapacitaciones] = useState(1);
  const [paginaActualEntrevistas, setPaginaActualEntrevistas] = useState(1);
  const [paginaActualAcercamientos, setPaginaActualAcercamientos] = useState(1);
  const [capacitacionesPorPagina] = useState(10);
  const [entrevistasPorPagina] = useState(10);
  const [acercamientosPorPagina] = useState(10);
  const [tabActivo, setTabActivo] = useState('entrevistas');
  const user = authService.getCurrentUser();

  const isAdmin = user?.roles?.includes('admin') || user?.rol === 'admin' || false;
  const isMentor = user?.roles?.includes('mentor') || user?.rol === 'mentor' || false;

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [consultasData, capacitacionesData, entrevistasData, acercamientosData] = await Promise.all([
        consultasService.listar(filtros),
        capacitacionesService.listar(filtros),
        entrevistasService.listar(filtros),
        acercamientosService.listar(filtros),
      ]);

      setConsultas(consultasData);
      setCapacitaciones(Array.isArray(capacitacionesData) ? capacitacionesData : []);
      setEntrevistas(entrevistasData);
      setAcercamientos(Array.isArray(acercamientosData) ? acercamientosData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setCapacitaciones([]);
      setAcercamientos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Calcular estadísticas dinámicamente según el tab activo
  const statsActuales = useMemo(() => {
    const todasEntrevistas = [...consultas, ...entrevistas];
    
    switch (tabActivo) {
      case 'entrevistas':
        return calcularStatsEntrevistas(todasEntrevistas);
      case 'capacitaciones':
        return calcularStatsCapacitaciones(capacitaciones);
      case 'acercamientos':
        return calcularStatsAcercamientos(acercamientos);
      default:
        return calcularStatsEntrevistas(todasEntrevistas);
    }
  }, [tabActivo, consultas, entrevistas, capacitaciones, acercamientos]);

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

  const abrirModalAcercamiento = (acercamiento) => {
    setAcercamientoSeleccionado(acercamiento);
    setMostrarModalAcercamiento(true);
  };

  const cerrarModalAcercamiento = () => {
    setMostrarModalAcercamiento(false);
    setAcercamientoSeleccionado(null);
  };

  // Combinar consultas y entrevistas en un solo array
  const todasEntrevistas = [...consultas, ...entrevistas];

  const entrevistasCombinadas = todasEntrevistas.filter((item) => {
    if (!busquedaEntrevistas) return true;

    const terminoBusqueda = busquedaEntrevistas.toLowerCase();
    return (
      item.mentores?.some((mentor) => mentor.toLowerCase().includes(terminoBusqueda)) ||
      item.entrevistadores?.some((entrevistador) => entrevistador.toLowerCase().includes(terminoBusqueda)) ||
      item.rangoEdad?.toLowerCase().includes(terminoBusqueda) ||
      item.sexo?.toLowerCase().includes(terminoBusqueda) ||
      item.lugarTrabajo?.toLowerCase().includes(terminoBusqueda) ||
      item.area?.toLowerCase().includes(terminoBusqueda)
    );
  });

  const indiceUltimaEntrevistaCombinada = paginaActualEntrevistas * entrevistasPorPagina;
  const indicePrimeraEntrevistaCombinada = indiceUltimaEntrevistaCombinada - entrevistasPorPagina;
  const entrevistasCombinadasPaginaActual = entrevistasCombinadas.slice(indicePrimeraEntrevistaCombinada, indiceUltimaEntrevistaCombinada);
  const totalPaginasEntrevistasCombinadas = Math.ceil(entrevistasCombinadas.length / entrevistasPorPagina);

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

  const cambiarPaginaEntrevista = (numeroPagina) => {
    setPaginaActualEntrevistas(numeroPagina);
  };

  const acercamientosFiltrados = acercamientos.filter((acercamiento) => {
    if (!busquedaAcercamientos) return true;

    const terminoBusqueda = busquedaAcercamientos.toLowerCase();
    return (
      acercamiento.mentores?.some((mentor) => mentor.toLowerCase().includes(terminoBusqueda)) ||
      acercamiento.rangoEdad?.toLowerCase().includes(terminoBusqueda) ||
      acercamiento.sexo?.toLowerCase().includes(terminoBusqueda) ||
      acercamiento.lugarTrabajo?.toLowerCase().includes(terminoBusqueda) ||
      acercamiento.area?.toLowerCase().includes(terminoBusqueda) ||
      acercamiento.lugarAcercamiento?.toLowerCase().includes(terminoBusqueda) ||
      acercamiento.seguimiento?.toLowerCase().includes(terminoBusqueda) ||
      acercamiento.estadosAnimo?.some((estado) => estado.toLowerCase().includes(terminoBusqueda)) ||
      String(acercamiento.numeroAcercamiento || '').toLowerCase().includes(terminoBusqueda)
    );
  });

  const indiceUltimoAcercamiento = paginaActualAcercamientos * acercamientosPorPagina;
  const indicePrimeroAcercamiento = indiceUltimoAcercamiento - acercamientosPorPagina;
  const acercamientosPaginaActual = acercamientosFiltrados.slice(indicePrimeroAcercamiento, indiceUltimoAcercamiento);
  const totalPaginasAcercamientos = Math.ceil(acercamientosFiltrados.length / acercamientosPorPagina);

  const cambiarPaginaAcercamientos = (numeroPagina) => {
    setPaginaActualAcercamientos(numeroPagina);
  };

  useEffect(() => {
    setPaginaActualEntrevistas(1);
  }, [busquedaEntrevistas]);

  useEffect(() => {
    setPaginaActualAcercamientos(1);
  }, [busquedaAcercamientos]);

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
      id: 'entrevistas',
      label: `Entrevistas (${todasEntrevistas.length})`,
      icon: FileText,
      activeClassName: 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg',
      content: (
        <EntrevistasTab
          entrevistas={todasEntrevistas}
          entrevistasFiltradas={entrevistasCombinadas}
          entrevistasPaginaActual={entrevistasCombinadasPaginaActual}
          busquedaEntrevistas={busquedaEntrevistas}
          onBusquedaChange={setBusquedaEntrevistas}
          onExportar={handleExportar}
          onVerEntrevista={abrirModalEntrevista}
          paginaActual={paginaActualEntrevistas}
          totalPaginas={totalPaginasEntrevistasCombinadas}
          indicePrimeraEntrevista={indicePrimeraEntrevistaCombinada}
          indiceUltimaEntrevista={indiceUltimaEntrevistaCombinada}
          onCambiarPagina={cambiarPaginaEntrevista}
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
      id: 'acercamientos',
      label: `Contacto de vida (${acercamientos.length})`,
      icon: MessageSquare,
      activeClassName: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg',
      content: (
        <AcercamientosTab
          acercamientos={acercamientos}
          acercamientosFiltrados={acercamientosFiltrados}
          acercamientosPaginaActual={acercamientosPaginaActual}
          busquedaAcercamientos={busquedaAcercamientos}
          onBusquedaChange={setBusquedaAcercamientos}
          onExportar={handleExportar}
          onVerAcercamiento={abrirModalAcercamiento}
          paginaActual={paginaActualAcercamientos}
          totalPaginas={totalPaginasAcercamientos}
          indicePrimeraAcercamiento={indicePrimeroAcercamiento}
          indiceUltimaAcercamiento={indiceUltimoAcercamiento}
          onCambiarPagina={cambiarPaginaAcercamientos}
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

        <DashboardKpis stats={statsActuales} tabActivo={tabActivo} />
        <DashboardCharts stats={statsActuales} tabActivo={tabActivo} />
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
      <AcercamientoModal
        isOpen={mostrarModalAcercamiento}
        acercamiento={acercamientoSeleccionado}
        onClose={cerrarModalAcercamiento}
      />
    </div>
  );
};

export default Dashboard;
