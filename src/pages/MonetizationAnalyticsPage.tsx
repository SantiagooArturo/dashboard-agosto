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
  AreaChart,
  ComposedChart
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,

  Target,
  Zap,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,

  Star,
  Coins
} from 'lucide-react';
import { monetizationAnalyticsService } from '@/services/monetizationAnalytics';
import type { MonetizationAnalytics } from '@/services/monetizationAnalytics';

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

const MonetizationAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<MonetizationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await monetizationAnalyticsService.getCompleteMonetizationAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando analytics de monetización:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Colores para gráficos
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // =============================================================================
  // ESTADOS DE CARGA Y ERROR
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analizando Monetización
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Calculando métricas de conversión y revenue...
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
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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

  // =============================================================================
  // FUNCIONES HELPER PARA FORMATEO
  // =============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // =============================================================================
  // RENDER PRINCIPAL
  // =============================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              💰 Monetización y Value Realization
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis completo de conversión, revenue y realización de valor
            </p>
          </div>
          <Button color="primary" onClick={loadAnalytics} disabled={isLoading}>
            Actualizar
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Total</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Pagadores</p>
                <p className="text-2xl font-bold">{analytics.overview.paidUsers}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasa Conversión</p>
                <p className="text-2xl font-bold">{formatPercentage(analytics.overview.conversionRate)}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ARPU</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.overview.averageRevenuePerUser)}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${analytics.overview.monthlyGrowthRate >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <TrendingUp className={`w-6 h-6 ${analytics.overview.monthlyGrowthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(analytics.overview.monthlyGrowthRate)}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Conversion Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold">Análisis de Conversión</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Conversion Funnel */}
              <div>
                <h3 className="text-lg font-medium mb-4">Funnel de Conversión</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-medium">Total Usuarios</div>
                      <div className="text-sm text-gray-600">Base completa</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{analytics.conversion.totalUsers}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Usuarios Gratuitos</div>
                      <div className="text-sm text-gray-600">Solo usan free tier</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">{analytics.conversion.freeUsers}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="font-medium">Usuarios Pagadores</div>
                      <div className="text-sm text-gray-600">Han comprado créditos</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{analytics.conversion.paidUsers}</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{formatPercentage(analytics.conversion.conversionRate)}</div>
                    <div className="text-sm text-gray-600">Tasa de Conversión Total</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Promedio {analytics.conversion.averageDaysToConversion.toFixed(0)} días hasta conversión
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Trends */}
              <div>
                <h3 className="text-lg font-medium mb-4">Tendencia de Conversiones</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.conversion.conversionsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="conversions" fill="#3b82f6" name="Conversiones" />
                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} name="Tasa %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Credit Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Credit Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Distribución de Créditos</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.credits.creditDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="userCount"
                  >
                    {analytics.credits.creditDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} usuarios`, 'Cantidad']} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Credit Metrics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold">Métricas de Créditos</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.credits.totalCreditsDistributed}</div>
                  <div className="text-sm text-gray-600">Total Distribuidos</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.credits.totalCreditsSpent}</div>
                  <div className="text-sm text-gray-600">Total Consumidos</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analytics.credits.averageCreditsPerUser.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Promedio por Usuario</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatPercentage(analytics.credits.creditUtilizationRate)}</div>
                  <div className="text-sm text-gray-600">Tasa de Utilización</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{analytics.credits.usersOutOfCredits}</div>
                  <div className="text-xs text-gray-600">Sin Créditos</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{analytics.credits.usersWithUnusedCredits}</div>
                  <div className="text-xs text-gray-600">Con Créditos</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Revenue Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Tendencia de Revenue</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenue.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Transacciones'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Package Performance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Performance de Paquetes</h2>
              </div>
            </CardHeader>
            <CardBody>
              {analytics.revenue.revenueByPackage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenue.revenueByPackage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="packageName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalRevenue' ? formatCurrency(value as number) : value,
                        name === 'totalRevenue' ? 'Revenue Total' : 'Transacciones'
                      ]}
                    />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay datos de paquetes disponibles</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Value Realization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Value Realization</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Value Metrics */}
              <div>
                <h3 className="text-lg font-medium mb-4">Métricas de Valor</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.valueRealization.usersWhoSeePaidValue}</div>
                    <div className="text-sm text-gray-600">Usuarios que Ven Valor Pagado</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.valueRealization.averageToolsUsedBeforeConversion.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Herramientas Usadas Pre-Conversión</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatPercentage(analytics.valueRealization.creditExhaustionToConversion.rate)}</div>
                    <div className="text-sm text-gray-600">Conversión tras Agotamiento</div>
                  </div>
                </div>
              </div>

              {/* Value Drivers */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium mb-4">Value Drivers por Herramienta</h3>
                {analytics.valueRealization.valueDrivers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.valueRealization.valueDrivers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tool" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="preConversionUsage" fill="#3b82f6" name="Pre-Conversión" />
                      <Bar dataKey="postConversionUsage" fill="#10b981" name="Post-Conversión" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay datos de value drivers disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Insights Clave de Monetización</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💳 Conversión</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {analytics.conversion.conversionRate < 5 ? 
                    `Tasa de conversión del ${formatPercentage(analytics.conversion.conversionRate)} indica oportunidad de mejora en value proposition.` :
                    `Tasa de conversión del ${formatPercentage(analytics.conversion.conversionRate)} está en buen rango.`
                  }
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">💰 Revenue</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ARPU de {formatCurrency(analytics.overview.averageRevenuePerUser)} con {analytics.conversion.paidUsers} usuarios pagadores.
                  {analytics.overview.monthlyGrowthRate > 0 ? ' Crecimiento positivo.' : ' Necesita impulso de crecimiento.'}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">🎯 Créditos</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formatPercentage(analytics.credits.creditUtilizationRate)} de utilización de créditos.
                  {analytics.credits.usersOutOfCredits} usuarios sin créditos.
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">⏰ Time to Value</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Promedio {analytics.conversion.averageDaysToConversion.toFixed(0)} días hasta conversión.
                  {analytics.conversion.averageDaysToConversion > 30 ? ' Considera reducir friction.' : ' Tiempo aceptable.'}
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">🔥 Oportunidades</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {analytics.credits.usersOutOfCredits > 0 ? 
                    `${analytics.credits.usersOutOfCredits} usuarios sin créditos son oportunidad de conversión.` :
                    'Considera estrategias para incrementar engagement.'
                  }
                </p>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">📊 Siguiente Paso</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {analytics.revenue.revenueByPackage.length > 0 ? 
                    `Paquete "${analytics.purchases.mostPopularPackage}" es el más popular.` :
                    'Implementa tracking de paquetes para optimizar pricing.'
                  }
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

export default MonetizationAnalyticsPage; 