import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  TrendingUp,
  DollarSign,
  UserCheck,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { mockDashboardStats, mockChartData } from "@/data/mockData";

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const chartData = mockChartData;

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "primary" as const,
      trend: "+12% vs mes anterior"
    },
    {
      title: "Usuarios Activos",
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: "success" as const,
      trend: "+8% vs mes anterior"
    },
    {
      title: "Empleos Activos",
      value: stats.activeJobs.toLocaleString(),
      icon: Briefcase,
      color: "warning" as const,
      trend: "+15% vs mes anterior"
    },
    {
      title: "Total CVs",
      value: stats.totalCVs.toLocaleString(),
      icon: FileText,
      color: "secondary" as const,
      trend: "+22% vs mes anterior"
    },
    {
      title: "Entrevistas",
      value: stats.totalInterviews.toLocaleString(),
      icon: Calendar,
      color: "primary" as const,
      trend: "+18% vs mes anterior"
    },
    {
      title: "Ingresos Mensuales",
      value: `€${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "success" as const,
      trend: "+25% vs mes anterior"
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Actividad del Usuario</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Usuarios Activos</span>
              <span className="text-sm font-bold">{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={(stats.activeUsers / stats.totalUsers) * 100} 
              color="success"
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              {stats.activeUsers} de {stats.totalUsers} usuarios han estado activos este mes
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Empleos Activos</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tasa de Actividad</span>
              <span className="text-sm font-bold">{((stats.activeJobs / stats.totalJobs) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={(stats.activeJobs / stats.totalJobs) * 100} 
              color="warning"
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              {stats.activeJobs} empleos activos de {stats.totalJobs} totales
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Ingresos Totales</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-success-600">
                €{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Ingresos acumulados
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Este mes:</span>
              <span className="font-semibold">€{stats.monthlyRevenue.toLocaleString()}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
