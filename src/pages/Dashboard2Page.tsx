import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  FileText,
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { mockDashboardService } from '../services/mockDashboardService';
import type { MockDashboardStats } from '../services/mockDashboardService';

// Componente de Dashboard 2 (Mock/Broma) - Copia exacta del Dashboard original
const Dashboard2Page: React.FC = () => {
  const [stats, setStats] = useState<MockDashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalCreditsDistributed: 0,
    totalCreditsSpent: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingTransactions: 0,
    totalCVAnalysis: 0,
    monthlyCVAnalysis: 0,
    totalJobMatches: 0,
    monthlyJobMatches: 0,
    totalInterviews: 0,
    totalJobs: 0,
    activeJobs: 0,
    monthlyJobApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  // Función para obtener datos mock
  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando estadísticas mock desde servicio...');

      // Obtener estadísticas principales
      const dashboardStats = await mockDashboardService.getMockDashboardStats();
      setStats(dashboardStats);

      // Obtener datos de gráficos
      const chartStats = await mockDashboardService.getMockChartData();
      setChartData(chartStats);

      console.log('✅ Estadísticas mock cargadas:', dashboardStats);

    } catch (error) {
      console.error('❌ Error cargando estadísticas mock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Recargar datos cada 5 minutos (para mantener la ilusión)
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const pieData = mockDashboardService.getPieData(stats);

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    change?: string;
    subtitle?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-800 dark:text-gray-700">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-900">
              {loading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-700 dark:text-gray-600 mt-1">{subtitle}</p>
            )}
            {change && (
              <Chip size="sm" color="success" variant="flat" className="mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {change}
              </Chip>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900">
                Vista Panorámica 
              </h1>
              <p className="text-gray-800 dark:text-gray-700 mt-1">
                Resumen general del sistema y estadísticas principales (Versión Mejorada)
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            subtitle={`${stats.newUsersThisMonth.toLocaleString()} nuevos este mes`}
          />

          <StatCard
            title="Créditos Distribuidos"
            value={stats.totalCreditsDistributed}
            icon={Zap}
            color="bg-indigo-500"
            subtitle={`${stats.totalCreditsSpent.toLocaleString()} consumidos`}
          />
          
          <StatCard
            title="Transacciones Pendientes"
            value={stats.pendingTransactions}
            icon={Clock}
            color="bg-amber-500"
            subtitle="Procesamiento normal"
          />
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Análisis de CV"
            value={stats.totalCVAnalysis}
            icon={FileText}
            color="bg-green-500"
            subtitle={`${stats.monthlyCVAnalysis.toLocaleString()} este mes`}
          />
          
          <StatCard
            title="Job Matches"
            value={stats.totalJobMatches}
            icon={Target}
            color="bg-teal-500"
            subtitle={`${stats.monthlyJobMatches.toLocaleString()} este mes`}
          />
          
          <StatCard
            title="Entrevistas"
            value={stats.totalInterviews}
            icon={Award}
            color="bg-rose-500"
            subtitle="Simulaciones completadas"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                Tendencias de Servicios (Últimos 6 meses)
              </h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cvs"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    name="Análisis CV"
                  />
                  <Area
                    type="monotone"
                    dataKey="empleos"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    name="Job Matches"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                Distribución de Servicios Utilizados
              </h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Footer con disclaimer */}
        <div className="text-center text-sm text-gray-700 dark:text-gray-600 mt-8">
          📈 Dashboard Pro Version - Datos proyectados y optimizados
        </div>
      </main>
    </div>
  );
};

export default Dashboard2Page;
