import { Users, FileText, Calendar, TrendingUp, Heart, BookOpen, MapPin, Home } from 'lucide-react';

const DashboardKpis = ({ stats, tabActivo }) => {
  // KPIs dinámicos según el tab activo
  const getKpis = () => {
    switch (tabActivo) {
      case 'entrevistas':
        return [
          {
            icon: FileText,
            iconColor: 'text-primary',
            bgColor: 'from-primary/10 to-accent/10',
            value: stats.total || 0,
            label: 'Total de Entrevistas'
          },
          {
            icon: Calendar,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            value: stats.esteMes || 0,
            label: 'Entrevistas Este Mes'
          },
          {
            icon: Heart,
            iconColor: 'text-rose',
            bgColor: 'from-rose/10 to-rose-light/10',
            value: stats.motivosCount || 0,
            label: stats.motivoPrincipal || 'Motivo Principal'
          },
          {
            icon: MapPin,
            iconColor: 'text-primary-light',
            bgColor: 'from-primary/10 to-primary-light/10',
            value: stats.lugaresActivos || 0,
            label: 'Lugares de Trabajo'
          }
        ];

      case 'capacitaciones':
        return [
          {
            icon: BookOpen,
            iconColor: 'text-blue-600',
            bgColor: 'from-blue-500/10 to-blue-600/10',
            value: stats.total || 0,
            label: 'Total de Capacitaciones'
          },
          {
            icon: Calendar,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            value: stats.esteMes || 0,
            label: 'Capacitaciones Este Mes'
          },
          {
            icon: Users,
            iconColor: 'text-purple-600',
            bgColor: 'from-purple-500/10 to-purple-600/10',
            value: stats.totalAsistentes || 0,
            label: 'Total de Asistentes'
          },
          {
            icon: TrendingUp,
            iconColor: 'text-primary-light',
            bgColor: 'from-primary/10 to-primary-light/10',
            value: stats.promedioAsistentes || 0,
            label: 'Promedio por Sesión'
          }
        ];

      case 'acercamientos':
        return [
          {
            icon: Heart,
            iconColor: 'text-emerald-600',
            bgColor: 'from-emerald-500/10 to-emerald-600/10',
            value: stats.total || 0,
            label: 'Total de Contactos'
          },
          {
            icon: Calendar,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            value: stats.esteMes || 0,
            label: 'Contactos Este Mes'
          },
          {
            icon: Heart,
            iconColor: 'text-rose',
            bgColor: 'from-rose/10 to-rose-light/10',
            value: stats.estadoCount || 0,
            label: stats.estadoPrincipal || 'Estado Principal'
          },
          {
            icon: MapPin,
            iconColor: 'text-primary-light',
            bgColor: 'from-primary/10 to-primary-light/10',
            value: (stats.lugaresAcercamiento || []).length,
            label: 'Lugares de Contacto'
          }
        ];

      case 'visitas':
        return [
          {
            icon: Home,
            iconColor: 'text-blue-600',
            bgColor: 'from-blue-500/10 to-blue-600/10',
            value: stats.total || 0,
            label: 'Total de Visitas'
          },
          {
            icon: Calendar,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            value: stats.esteMes || 0,
            label: 'Visitas Este Mes'
          },
          {
            icon: MapPin,
            iconColor: 'text-purple-600',
            bgColor: 'from-purple-500/10 to-purple-600/10',
            value: stats.lugarCount || 0,
            label: stats.lugarPrincipal || 'Lugar Principal'
          },
          {
            icon: Users,
            iconColor: 'text-primary-light',
            bgColor: 'from-primary/10 to-primary-light/10',
            value: stats.parentescoCount || 0,
            label: stats.parentescoPrincipal || 'Parentesco Principal'
          }
        ];

      default:
        return [];
    }
  };

  const kpis = getKpis();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br ${kpi.bgColor} rounded-xl`}>
                <Icon className={kpi.iconColor} size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</h3>
            <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardKpis;
