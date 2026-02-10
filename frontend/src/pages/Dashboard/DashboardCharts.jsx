import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { PieChart as PieChartIcon, Activity, Heart, BookOpen, TrendingUp } from 'lucide-react';

const COLORS = ['#059669', '#10B981', '#16A34A', '#22C55E', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

const DashboardCharts = ({ stats, tabActivo }) => {
  // Configuración de gráficas por tab
  const getChartsConfig = () => {
    switch (tabActivo) {
      case 'entrevistas':
        return {
          chart1: {
            icon: Heart,
            iconColor: 'text-rose',
            bgColor: 'from-rose/10 to-rose-light/10',
            title: 'Motivos de Entrevista',
            subtitle: 'Motivos más frecuentes',
            data: stats.motivosMasFrecuentes || [],
            dataKey: 'motivo',
            valueKey: 'count',
            type: 'bar'
          },
          chart2: {
            icon: PieChartIcon,
            iconColor: 'text-accent',
            bgColor: 'from-accent/10 to-accent-light/10',
            title: 'Lugares de Trabajo',
            subtitle: 'Distribución por ubicación',
            data: stats.lugaresTrabajo || [],
            dataKey: 'lugar',
            valueKey: 'count',
            type: 'pie'
          },
          chart3: {
            icon: Activity,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            title: 'Tendencia Mensual',
            subtitle: 'Entrevistas en el tiempo',
            data: stats.tendenciaMensual || [],
            dataKey: 'mes',
            valueKey: 'count',
            type: 'line'
          }
        };

      case 'capacitaciones':
        return {
          chart1: {
            icon: BookOpen,
            iconColor: 'text-blue-600',
            bgColor: 'from-blue-500/10 to-blue-600/10',
            title: 'Temas Impartidos',
            subtitle: 'Temas más frecuentes',
            data: stats.temasMasImpartidos || [],
            dataKey: 'tema',
            valueKey: 'count',
            type: 'bar'
          },
          chart2: {
            icon: PieChartIcon,
            iconColor: 'text-purple-600',
            bgColor: 'from-purple-500/10 to-purple-600/10',
            title: 'Distribución por CDR',
            subtitle: 'Capacitaciones por región',
            data: stats.distribucionCDR || [],
            dataKey: 'cdr',
            valueKey: 'count',
            type: 'pie'
          },
          chart3: {
            icon: Activity,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            title: 'Tendencia Mensual',
            subtitle: 'Capacitaciones en el tiempo',
            data: stats.tendenciaMensual || [],
            dataKey: 'mes',
            valueKey: 'count',
            type: 'line'
          }
        };

      case 'acercamientos':
        return {
          chart1: {
            icon: Heart,
            iconColor: 'text-rose',
            bgColor: 'from-rose/10 to-rose-light/10',
            title: 'Estados de Ánimo',
            subtitle: 'Estados más frecuentes',
            data: stats.estadosMasFrecuentes || [],
            dataKey: 'estado',
            valueKey: 'count',
            type: 'bar'
          },
          chart2: {
            icon: PieChartIcon,
            iconColor: 'text-accent',
            bgColor: 'from-accent/10 to-accent-light/10',
            title: 'Lugares de Contacto',
            subtitle: 'Distribución por ubicación',
            data: stats.lugaresAcercamiento || [],
            dataKey: 'lugar',
            valueKey: 'count',
            type: 'pie'
          },
          chart3: {
            icon: Activity,
            iconColor: 'text-success',
            bgColor: 'from-success/10 to-success-light/10',
            title: 'Tendencia Mensual',
            subtitle: 'Contactos en el tiempo',
            data: stats.tendenciaMensual || [],
            dataKey: 'mes',
            valueKey: 'count',
            type: 'line'
          }
        };

      default:
        return null;
    }
  };

  const config = getChartsConfig();
  if (!config) return null;

  const renderChart = (chartConfig) => {
    const Icon = chartConfig.icon;

    if (chartConfig.type === 'bar') {
      return (
        <div key={chartConfig.title} className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 bg-gradient-to-br ${chartConfig.bgColor} rounded-xl`}>
              <Icon className={chartConfig.iconColor} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{chartConfig.title}</h2>
              <p className="text-sm text-gray-600">{chartConfig.subtitle}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartConfig.data.slice(0, 8)} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey={chartConfig.dataKey}
                stroke="#6B7280" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
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
              <Bar dataKey={chartConfig.valueKey} fill="#059669" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartConfig.type === 'pie') {
      return (
        <div key={chartConfig.title} className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 bg-gradient-to-br ${chartConfig.bgColor} rounded-xl`}>
              <Icon className={chartConfig.iconColor} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{chartConfig.title}</h2>
              <p className="text-sm text-gray-600">{chartConfig.subtitle}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartConfig.data.slice(0, 6)}
                dataKey={chartConfig.valueKey}
                nameKey={chartConfig.dataKey}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={false}
              >
                {chartConfig.data.slice(0, 6).map((entry, index) => (
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
      );
    }

    if (chartConfig.type === 'line') {
      return (
        <div key={chartConfig.title} className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-soft lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 bg-gradient-to-br ${chartConfig.bgColor} rounded-xl`}>
              <Icon className={chartConfig.iconColor} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{chartConfig.title}</h2>
              <p className="text-sm text-gray-600">{chartConfig.subtitle}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartConfig.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey={chartConfig.dataKey} stroke="#6B7280" />
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
              <Line
                type="monotone"
                dataKey={chartConfig.valueKey}
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {renderChart(config.chart1)}
      {renderChart(config.chart2)}
      {renderChart(config.chart3)}
    </div>
  );
};

export default DashboardCharts;
