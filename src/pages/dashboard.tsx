import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { firebaseService, type DashboardStats } from "@/services/firebaseService";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, chartDataResponse] = await Promise.all([
          firebaseService.getDashboardStats(),
          firebaseService.getChartData()
        ]);
        
        setStats(dashboardStats);
        setChartData(chartDataResponse);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;
  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "primary" as const,
      trend: `+${stats.monthlyUsers} este mes`
    },
    {
      title: "Total CVs",
      value: stats.totalCVs.toLocaleString(),
      icon: FileText,
      color: "success" as const,
      trend: `+${stats.monthlyCVs} este mes`
    },
    {
      title: "Empleos Activos",
      value: stats.totalJobs.toLocaleString(),
      icon: Briefcase,
      color: "warning" as const,
      trend: "Trabajos publicados"
    },
    {
      title: "Ingresos Mensuales",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "secondary" as const,
      trend: "Ingresos del mes"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido al panel de administración de MyWorkIn
          </p>
        </div>
        <Chip 
          color="success" 
          variant="flat"
          startContent={<Activity size={16} />}
        >
          Sistema Activo
        </Chip>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp size={14} className="text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.trend}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <Icon 
                      size={24} 
                      className={`text-${stat.color}-600`}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold">Tendencia de Ingresos</h3>
            <p className="text-sm text-gray-600">Ingresos mensuales en los últimos 6 meses</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />                <Tooltip 
                  formatter={(value) => [`€${value}`, 'Ingresos']}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0070f3" 
                  strokeWidth={2}
                  dot={{ fill: '#0070f3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Users Growth Chart */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold">Crecimiento de Usuarios</h3>
            <p className="text-sm text-gray-600">Nuevos usuarios registrados por mes</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />                <Tooltip 
                  formatter={(value) => [value, 'Usuarios']}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#17c964" 
                  strokeWidth={2}
                  dot={{ fill: '#17c964' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardBody className="p-4 text-center">
            <Users className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={24} />
            <h4 className="font-semibold dark:text-gray-50">Gestionar Usuarios</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ver y administrar usuarios</p>
          </CardBody>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardBody className="p-4 text-center">
            <FileText className="mx-auto mb-2 text-green-600 dark:text-green-400" size={24} />
            <h4 className="font-semibold dark:text-gray-50">Revisar CVs</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analizar CVs enviados</p>
          </CardBody>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardBody className="p-4 text-center">
            <Briefcase className="mx-auto mb-2 text-orange-600 dark:text-orange-400" size={24} />            <h4 className="font-semibold dark:text-gray-50">Empleos</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gestionar ofertas de trabajo</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
