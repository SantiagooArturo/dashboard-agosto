import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';
import { activationAnalyticsService } from '@/services/activationAnalytics';
import type { ActivationAnalytics } from '@/services/activationAnalytics';

const ActivationAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<ActivationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de activación
  const loadActivationData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Cargando analytics de activación...');
      
      const data = await activationAnalyticsService.getCompleteActivationAnalytics();
      setAnalytics(data);
      
    } catch (err) {
      console.error('❌ Error cargando analytics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivationData();
  }, []);

  // Componente de métrica crítica
  const CriticalMetric = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    suffix = '', 
    description 
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    suffix?: string;
    description?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-800 dark:text-gray-700">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-900">
              {loading ? '...' : `${value.toFixed(1)}${suffix}`}
            </p>
            {description && (
              <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Colores para el funnel


  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-800 dark:text-gray-700">Analizando datos de activación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-white p-6">
        <Card className="max-w-md mx-auto border-l-4 border-l-red-500">
          <CardBody>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-500" size={24} />
              <div>
                <h3 className="font-semibold text-red-700">Error cargando analytics</h3>
                <p className="text-red-600">{error}</p>
                <Button size="sm" onClick={loadActivationData} className="mt-2">
                  Reintentar
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900">
                Analytics: Crisis de Activación
              </h1>
              <p className="text-gray-800 dark:text-gray-700 mt-1">
                Análisis del funnel de activación de usuarios
              </p>
            </div>
            <Button onClick={loadActivationData} disabled={loading}>
              🔄 Actualizar Datos
            </Button>
          </div>
          
          {/* Alerta crítica */}
          <Card className="border-l-4 border-l-red-500 mb-6">
            <CardBody>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-red-500" size={24} />
                <div>
                  <h3 className="font-semibold text-red-700">⚠️ CRISIS DE ACTIVACIÓN DETECTADA</h3>
                  <p className="text-red-600">
                    Solo {analytics.criticalMetrics.overallActivationRate.toFixed(1)}% de usuarios activan el producto. 
                    Esto es crítico para el product-market fit.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Métricas Críticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CriticalMetric
            title="Tasa de Activación"
            value={analytics.criticalMetrics.overallActivationRate}
            icon={Target}
            color={analytics.criticalMetrics.overallActivationRate < 10 ? "bg-red-500" : "bg-green-500"}
            suffix="%"
            description={`${analytics.criticalMetrics.activatedUsers} de ${analytics.criticalMetrics.totalUsers} usuarios`}
          />
          
          <CriticalMetric
            title="Tasa de Verificación"
            value={analytics.criticalMetrics.verificationRate}
            icon={CheckCircle}
            color={analytics.criticalMetrics.verificationRate < 5 ? "bg-red-500" : "bg-yellow-500"}
            suffix="%"
            description="Usuarios que verifican email"
          />
          
          <CriticalMetric
            title="Días hasta Activación"
            value={analytics.criticalMetrics.avgDaysToActivation}
            icon={Clock}
            color="bg-blue-500"
            description="Promedio de usuarios activados"
          />
          
          <CriticalMetric
            title="Skip Rate Onboarding"
            value={analytics.onboardingAnalysis.skipRate}
            icon={XCircle}
            color={analytics.onboardingAnalysis.skipRate > 80 ? "bg-red-500" : "bg-yellow-500"}
            suffix="%"
            description={`${analytics.onboardingAnalysis.skippedOnboarding} usuarios saltaron`}
          />
        </div>

        {/* Funnel de Activación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                🔥 Funnel de Activación Crítico
              </h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.funnelSteps} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="step" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'users' ? `${value} usuarios` : `${value.toFixed(1)}%`,
                      name === 'users' ? 'Usuarios' : 'Porcentaje'
                    ]}
                  />
                  <Bar dataKey="users" fill="#3B82F6" name="users" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Detalles del funnel */}
              <div className="mt-4 space-y-2">
                {analytics.funnelSteps.map((step) => (
                  <div key={step.step} className="flex items-center justify-between p-2 bg-white border border-gray-200 shadow-sm rounded">
                    <span className="font-medium">{step.step}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{step.users} usuarios</span>
                      <Chip 
                        size="sm" 
                        color={step.percentage < 10 ? "danger" : step.percentage < 50 ? "warning" : "success"}
                      >
                        {step.percentage.toFixed(1)}%
                      </Chip>
                      {step.dropOff > 0 && (
                        <span className="text-xs text-red-500">-{step.dropOff}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Distribución por Universidad (n y %) */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                🎓 Distribución por Universidad
              </h3>
            </CardHeader>
            <CardBody>
              <div className="overflow-auto max-h-[420px]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b-2 border-gray-200 z-10">
                    <tr>
                      <th className="text-left px-3 py-2">Universidad</th>
                      <th className="text-right px-3 py-2">Estudiantes</th>
                      <th className="text-right px-3 py-2">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.universityDistribution.slice(0, 50).map(row => (
                      <tr key={row.university} className="border-b border-gray-100/10">
                        <td className="px-3 py-2">{row.university}</td>
                        <td className="px-3 py-2 text-right">{row.users.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">
                          <Chip size="sm" color="primary" variant="flat">
                            {row.percentage.toFixed(1)}%
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Análisis Detallado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Universidades */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                🏆 Top Universidades por Activación
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {analytics.universityBreakdown
                  .filter(uni => uni.totalUsers >= 3) // Solo universidades con al menos 3 usuarios
                  .sort((a, b) => b.activationRate - a.activationRate)
                  .slice(0, 10)
                  .map((uni, index) => (
                    <div key={uni.university} className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded">
                      <div>
                        <p className="font-medium">#{index + 1} {uni.university || 'Sin especificar'}</p>
                        <p className="text-sm text-gray-600">{uni.totalUsers} usuarios total</p>
                      </div>
                      <div className="text-right">
                        <Chip 
                          size="sm" 
                          color={uni.activationRate > 10 ? "success" : uni.activationRate > 5 ? "warning" : "danger"}
                        >
                          {uni.activationRate.toFixed(1)}%
                        </Chip>
                        <p className="text-xs text-gray-700">{uni.activatedUsers} activados</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>

          {/* Análisis de Onboarding */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                📝 Análisis de Onboarding
              </h3>
            </CardHeader>
            <CardBody>
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completaron', value: analytics.onboardingAnalysis.completedOnboarding, color: '#10B981' },
                        { name: 'Saltaron', value: analytics.onboardingAnalysis.skippedOnboarding, color: '#EF4444' },
                        { 
                          name: 'Sin datos', 
                          value: analytics.onboardingAnalysis.totalUsers - analytics.onboardingAnalysis.completedOnboarding - analytics.onboardingAnalysis.skippedOnboarding,
                          color: '#94A3B8'
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#EF4444' : '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total usuarios:</span>
                  <span className="font-medium">{analytics.onboardingAnalysis.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completaron onboarding:</span>
                  <span className="font-medium text-green-600">{analytics.onboardingAnalysis.completedOnboarding}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saltaron onboarding:</span>
                  <span className="font-medium text-red-600">{analytics.onboardingAnalysis.skippedOnboarding}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Skip rate:</span>
                  <Chip 
                    size="sm" 
                    color={analytics.onboardingAnalysis.skipRate > 80 ? "danger" : "warning"}
                  >
                    {analytics.onboardingAnalysis.skipRate.toFixed(1)}%
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Insights y Recomendaciones */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
              💡 Insights Críticos para Product-Market Fit
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-700 mb-2">🚨 Crisis de Verificación</h4>
                <p className="text-red-600 text-sm">
                  {analytics.criticalMetrics.verificationRate.toFixed(1)}% tasa de verificación indica un problema crítico 
                  en el flujo de registro. Los usuarios no ven valor inmediato.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-700 mb-2">⚠️ Onboarding Problemático</h4>
                <p className="text-orange-600 text-sm">
                  {analytics.onboardingAnalysis.skipRate.toFixed(1)}% skip rate sugiere que el onboarding no está 
                  comunicando valor efectivamente.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-700 mb-2">🎯 Oportunidad Universitaria</h4>
                <p className="text-blue-600 text-sm">
                  Grandes diferencias de activación entre universidades sugieren 
                  oportunidades de segmentación y estrategias específicas.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default ActivationAnalyticsPage; 