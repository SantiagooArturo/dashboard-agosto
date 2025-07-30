import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';

import { Button } from '@heroui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Users,

  Activity,
  TrendingUp,
  TrendingDown,
  Heart,
  Zap,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';
import { engagementAnalyticsService } from '@/services/engagementAnalytics';
import type { EngagementAnalytics } from '@/services/engagementAnalytics';

const EngagementAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<EngagementAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await engagementAnalyticsService.getCompleteEngagementAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando analytics de engagement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analizando Engagement y Retención
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Calculando métricas de comportamiento de usuarios...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardBody className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-600">Error al cargar analytics</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button color="primary" onClick={loadAnalytics}>
                Reintentar
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📈 Engagement y Retención
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis de comportamiento y retención de usuarios
            </p>
          </div>
          <Button color="primary" onClick={loadAnalytics} disabled={isLoading}>
            Actualizar
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos (Mensual)</p>
                <p className="text-2xl font-bold">{analytics.overview.monthlyActiveUsers}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos (Semanal)</p>
                <p className="text-2xl font-bold">{analytics.overview.weeklyActiveUsers}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sesiones Promedio</p>
                <p className="text-2xl font-bold">{analytics.overview.averageSessionsPerUser.toFixed(1)}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Churn</p>
                <p className="text-2xl font-bold">{analytics.overview.churnRate.toFixed(1)}%</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Retention Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold">Métricas de Retención</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.retention.totalCohort}</div>
                <div className="text-sm text-gray-600">Cohorte Total</div>
                <div className="text-xs text-gray-500">Usuarios registrados 30+ días</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analytics.retention.day1.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Retención Día 1</div>
                <div className="text-xs text-gray-500">Volvieron al día siguiente</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{analytics.retention.day7.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Retención Día 7</div>
                <div className="text-xs text-gray-500">Activos en la primera semana</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{analytics.retention.day30.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Retención Día 30</div>
                <div className="text-xs text-gray-500">Activos después de un mes</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tool Popularity */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Popularidad de Herramientas</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.toolPopularity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="tool" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'usageCount' ? `${value} usos` : 
                      name === 'uniqueUsers' ? `${value} usuarios` : value,
                      name === 'usageCount' ? 'Total Usos' : 
                      name === 'uniqueUsers' ? 'Usuarios Únicos' : name
                    ]}
                  />
                  <Bar dataKey="usageCount" fill="#3b82f6" name="usageCount" />
                  <Bar dataKey="uniqueUsers" fill="#10b981" name="uniqueUsers" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* User Segments */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Segmentación de Usuarios</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.userSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, percentage }) => `${segment}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="userCount"
                  >
                    {analytics.userSegments.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} usuarios`, 'Cantidad']} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Session Patterns */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Patrones de Actividad</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.sessionPatterns.map((pattern, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{pattern.activeUsers}</div>
                  <div className="text-sm font-medium">{pattern.timeRange}</div>
                  <div className="text-xs text-gray-500">{pattern.frequency}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Tendencias de Engagement (Últimos 30 días)</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analytics.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                  formatter={(value, name) => [
                    value,
                    name === 'activeUsers' ? 'Usuarios Activos' :
                    name === 'newUsers' ? 'Nuevos Usuarios' :
                    name === 'returningUsers' ? 'Usuarios Recurrentes' :
                    name === 'toolUsage' ? 'Uso de Herramientas' : name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="newUsers" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                />
                <Line 
                  type="monotone" 
                  dataKey="toolUsage" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* User Segments Detail */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Detalle de Segmentos</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {analytics.userSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <div>
                      <div className="font-medium">{segment.segment}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{segment.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{segment.userCount}</div>
                    <div className="text-sm text-gray-600">({segment.percentage.toFixed(1)}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold">Insights Clave</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">🎯 Retención</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  La retención D1 de {analytics.retention.day1.toFixed(1)}% indica qué tan exitoso es el onboarding inicial.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">🔧 Herramientas</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {analytics.toolPopularity.length > 0 && analytics.toolPopularity[0].tool} es la herramienta más popular con {analytics.toolPopularity[0]?.usageCount} usos.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">👥 Usuarios</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {analytics.overview.churnRate.toFixed(1)}% de churn rate sugiere {analytics.overview.churnRate > 15 ? 'alto' : 'moderado'} riesgo de abandono.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">📊 Engagement</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Promedio de {analytics.overview.averageSessionsPerUser.toFixed(1)} sesiones por usuario indica nivel de engagement.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Análisis generado el {analytics.generatedAt.toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
};

export default EngagementAnalyticsPage; 