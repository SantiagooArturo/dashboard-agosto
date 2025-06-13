import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  FileText, 
  Briefcase, 
  CreditCard, 
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { firebaseService } from '../services/adminFirebaseService';
import type { DashboardStats } from '../services/adminFirebaseService';

// Datos dinámicos que se cargarán desde Firebase
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
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
  const [periodData, setPeriodData] = useState<any[]>([]);

  // Función para obtener datos reales de Firebase
  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando estadísticas desde Firebase...');
      
      // Obtener estadísticas principales
      const dashboardStats = await firebaseService.getDashboardStats();
      setStats(dashboardStats);
      
      // Obtener datos del período (últimos 30 días)
      const periodStats = await firebaseService.getStatsForPeriod(30);
      setPeriodData(periodStats);
      
      console.log('✅ Estadísticas cargadas:', dashboardStats);
      
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // Mantener datos mock en caso de error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
    // Recargar datos cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    window.location.reload();
  };

  // Datos mock para gráficos (se mantendrán hasta tener datos históricos reales)
  const monthlyData = periodData.length > 0 ? periodData.slice(-6).map(day => ({
    month: new Date(day.date).toLocaleDateString('es', { month: 'short' }),
    usuarios: Math.floor(Math.random() * 50) + 20, // Simulado por ahora
    cvs: day.cvAnalysis || 0,
    empleos: day.jobMatches || 0,
    ingresos: day.revenue || 0
  })) : [
    { month: 'Ene', usuarios: 45, cvs: 67, empleos: 12, ingresos: 890 },
    { month: 'Feb', usuarios: 52, cvs: 78, empleos: 15, ingresos: 1200 },
    { month: 'Mar', usuarios: 48, cvs: 65, empleos: 18, ingresos: 950 },
    { month: 'Abr', usuarios: 61, cvs: 89, empleos: 22, ingresos: 1450 },
    { month: 'May', usuarios: 55, cvs: 76, empleos: 19, ingresos: 1100 },
    { month: 'Jun', usuarios: 67, cvs: 94, empleos: 25, ingresos: 1680 }
  ];

  const pieData = [
    { name: 'Análisis CV', value: stats.totalCVAnalysis, color: '#3B82F6' },
    { name: 'Job Matches', value: stats.totalJobMatches, color: '#10B981' },
    { name: 'Entrevistas', value: stats.totalInterviews, color: '#F59E0B' }
  ];

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
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            change="+12%"
            subtitle={`${stats.newUsersThisMonth} nuevos este mes`}
          />
          <StatCard
            title="Análisis de CV"
            value={stats.totalCVAnalysis}
            icon={FileText}
            color="bg-green-500"
            change="+8%"
            subtitle={`${stats.monthlyCVAnalysis} este mes`}
          />
          <StatCard
            title="Empleos Activos"
            value={stats.activeJobs}
            icon={Briefcase}
            color="bg-purple-500"
            change="+15%"
            subtitle={`${stats.totalJobs} total`}
          />
          <StatCard
            title="Ingresos"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={CreditCard}
            color="bg-orange-500"
            change="+22%"
            subtitle={`$${stats.monthlyRevenue.toFixed(2)} este mes`}
          />
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Créditos Distribuidos"
            value={stats.totalCreditsDistributed}
            icon={Zap}
            color="bg-indigo-500"
            subtitle={`${stats.totalCreditsSpent} consumidos`}
          />
          <StatCard
            title="Job Matches"
            value={stats.totalJobMatches}
            icon={Target}
            color="bg-teal-500"
            change="+18%"
            subtitle={`${stats.monthlyJobMatches} este mes`}
          />
          <StatCard
            title="Entrevistas"
            value={stats.totalInterviews}
            icon={Award}
            color="bg-rose-500"
          />
          <StatCard
            title="Transacciones Pendientes"
            value={stats.pendingTransactions}
            icon={Clock}
            color="bg-amber-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tendencias de Servicios (Últimos 6 meses)
              </h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
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
                  <Area 
                    type="monotone" 
                    dataKey="ingresos" 
                    stackId="2" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    name="Ingresos ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
        </div>        {/* Revenue Performance */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rendimiento de Ingresos (Últimos 6 meses)
              </h3>
              <Chip color="success" variant="flat">
                ${stats.monthlyRevenue.toFixed(2)} este mes
              </Chip>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value}`, 'Ingresos']} />
                <Bar dataKey="ingresos" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
