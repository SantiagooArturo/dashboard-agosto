// 🎭 SERVICIO DE DASHBOARD MOCK PARA DEMO/BROMA
// Genera datos coherentes y realistas basados en 39,817 usuarios

export interface MockDashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalCreditsDistributed: number;
  totalCreditsSpent: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingTransactions: number;
  totalCVAnalysis: number;
  monthlyCVAnalysis: number;
  totalJobMatches: number;
  monthlyJobMatches: number;
  totalInterviews: number;
  totalJobs: number;
  activeJobs: number;
  monthlyJobApplications: number;
}

class MockDashboardService {
  
  // Generar estadísticas mock coherentes
  async getMockDashboardStats(): Promise<MockDashboardStats> {
    // Simular delay de carga para realismo
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const baseUsers = 39817;
    
    return {
      // Usuarios
      totalUsers: baseUsers,
      activeUsers: Math.floor(baseUsers * 0.75), // 75% activos = 29,863
      newUsersThisMonth: Math.floor(baseUsers * 0.10), // 10% nuevos = 3,982
      
      // Créditos
      totalCreditsDistributed: Math.floor(baseUsers * 3), // 3x usuarios = 119,451
      totalCreditsSpent: Math.floor(baseUsers * 2.25), // 75% utilización = 89,588
      
      // Revenue (broma)
      totalRevenue: Math.floor(baseUsers * 10), // S/ 10 promedio = 398,170
      monthlyRevenue: Math.floor(baseUsers * 1), // S/ 1 mensual = 39,817
      
      // Operaciones
      pendingTransactions: Math.floor(baseUsers * 0.005), // 0.5% = 199
      
      // Servicios
      totalCVAnalysis: Math.floor(baseUsers * 0.60), // 60% = 23,890
      monthlyCVAnalysis: Math.floor(baseUsers * 0.08), // 8% mensual = 3,185
      totalJobMatches: Math.floor(baseUsers * 0.30), // 30% = 11,945
      monthlyJobMatches: Math.floor(baseUsers * 0.05), // 5% mensual = 1,991
      totalInterviews: Math.floor(baseUsers * 0.20), // 20% = 7,963
      
      // Jobs
      totalJobs: 1247, // Número fijo realista
      activeJobs: 892, // ~70% activos
      monthlyJobApplications: Math.floor(baseUsers * 0.15) // 15% = 5,973
    };
  }

  // Generar datos de gráficos mock
  async getMockChartData() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Últimos 6 meses con tendencia ascendente
    return [
      { month: 'Jul', usuarios: 4200, cvs: 2520, empleos: 1260 },
      { month: 'Ago', usuarios: 4800, cvs: 2880, empleos: 1440 },
      { month: 'Sep', usuarios: 5500, cvs: 3300, empleos: 1650 },
      { month: 'Oct', usuarios: 6200, cvs: 3720, empleos: 1860 },
      { month: 'Nov', usuarios: 6900, cvs: 4140, empleos: 2070 },
      { month: 'Dic', usuarios: 7400, cvs: 4440, empleos: 2220 }
    ];
  }

  // Datos para gráfico de pie (distribución de servicios)
  getPieData(stats: MockDashboardStats) {
    return [
      { name: 'Análisis CV', value: stats.totalCVAnalysis, color: '#3B82F6' },
      { name: 'Job Matches', value: stats.totalJobMatches, color: '#10B981' },
      { name: 'Entrevistas', value: stats.totalInterviews, color: '#F59E0B' }
    ];
  }
}

export const mockDashboardService = new MockDashboardService();
