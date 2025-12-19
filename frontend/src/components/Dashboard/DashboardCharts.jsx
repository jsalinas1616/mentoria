import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const COLORS = ['#059669', '#10B981', '#16A34A', '#22C55E', '#34D399'];

const DashboardCharts = ({ stats }) => (
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
);

export default DashboardCharts;
