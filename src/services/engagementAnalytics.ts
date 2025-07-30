import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ⚠️ IMPORTANTE: ESTE SERVICIO ES SOLO LECTURA - NO MODIFICA DATOS
// Only reads data for engagement and retention analytics

export interface RetentionMetrics {
  day1: number;
  day7: number;
  day30: number;
  totalCohort: number;
}

export interface ToolUsage {
  tool: string;
  usageCount: number;
  uniqueUsers: number;
  averageUsagePerUser: number;
  percentage: number;
}

export interface UserSegment {
  segment: string;
  userCount: number;
  percentage: number;
  description: string;
}

export interface SessionPattern {
  timeRange: string;
  activeUsers: number;
  averageSessionGap: number;
  frequency: string;
}

export interface EngagementTrend {
  date: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  toolUsage: number;
}

export interface EngagementAnalytics {
  overview: {
    totalActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionsPerUser: number;
    churningUsers: number;
    churnRate: number;
  };
  retention: RetentionMetrics;
  toolPopularity: ToolUsage[];
  userSegments: UserSegment[];
  sessionPatterns: SessionPattern[];
  trends: EngagementTrend[];
  generatedAt: Date;
}

class EngagementAnalyticsService {

  // SOLO LECTURA: Calcular métricas de retención D1, D7, D30
  async getRetentionMetrics(): Promise<RetentionMetrics> {
    try {
      console.log('📈 Calculando métricas de retención...');
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Obtener usuarios registrados en los últimos 30 días
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrar usuarios del cohort (registrados hace 30+ días)
      const cohortUsers = users.filter(user => {
        const createdAt = (user as any).createdAt?.toDate ? (user as any).createdAt.toDate() : new Date((user as any).createdAt);
        return createdAt <= thirtyDaysAgo;
      });

      let day1Retained = 0;
      let day7Retained = 0;
      let day30Retained = 0;

      cohortUsers.forEach(user => {
        const createdAt = (user as any).createdAt?.toDate ? (user as any).createdAt.toDate() : new Date((user as any).createdAt);
        const lastLogin = (user as any).updatedAt?.toDate ? (user as any).updatedAt.toDate() : (user as any).lastLogin?.toDate ? (user as any).lastLogin.toDate() : null;
        
        if (lastLogin) {
          const daysSinceCreation = Math.floor((lastLogin.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
          
          if (daysSinceCreation >= 1) day1Retained++;
          if (daysSinceCreation >= 7) day7Retained++;
          if (daysSinceCreation >= 30) day30Retained++;
        }
      });

      return {
        day1: cohortUsers.length > 0 ? (day1Retained / cohortUsers.length) * 100 : 0,
        day7: cohortUsers.length > 0 ? (day7Retained / cohortUsers.length) * 100 : 0,
        day30: cohortUsers.length > 0 ? (day30Retained / cohortUsers.length) * 100 : 0,
        totalCohort: cohortUsers.length
      };
    } catch (error) {
      console.error('Error calculando retención:', error);
      return { day1: 0, day7: 0, day30: 0, totalCohort: 0 };
    }
  }

  // SOLO LECTURA: Analizar popularidad de herramientas
  async getToolUsageAnalytics(): Promise<ToolUsage[]> {
    try {
      console.log('🔧 Analizando uso de herramientas...');
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as any);

      // Contar uso por herramienta
      const toolStats: { [key: string]: { count: number; users: Set<string> } } = {};
      
      transactions.forEach(transaction => {
        const tool = transaction.tool || 'unknown';
        if (!toolStats[tool]) {
          toolStats[tool] = { count: 0, users: new Set() };
        }
        toolStats[tool].count++;
        toolStats[tool].users.add(transaction.userId);
      });

      const totalUsage = Object.values(toolStats).reduce((sum, stat) => sum + stat.count, 0);

      return Object.entries(toolStats).map(([tool, stats]) => ({
        tool: tool === 'cv-review' ? 'Análisis CV' : 
              tool === 'job-match' ? 'Búsqueda Empleos' :
              tool === 'interview-simulation' ? 'Simulación Entrevista' : tool,
        usageCount: stats.count,
        uniqueUsers: stats.users.size,
        averageUsagePerUser: stats.users.size > 0 ? stats.count / stats.users.size : 0,
        percentage: totalUsage > 0 ? (stats.count / totalUsage) * 100 : 0
      })).sort((a, b) => b.usageCount - a.usageCount);
      
    } catch (error) {
      console.error('Error analizando herramientas:', error);
      return [];
    }
  }

  // SOLO LECTURA: Segmentar usuarios por comportamiento
  async getUserSegments(): Promise<UserSegment[]> {
    try {
      console.log('👥 Segmentando usuarios por comportamiento...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as any);

      // Crear mapa de actividad por usuario
      const userActivity: { [userId: string]: number } = {};
      transactions.forEach(transaction => {
        userActivity[transaction.userId] = (userActivity[transaction.userId] || 0) + 1;
      });

      let newUsers = 0;
      let activeUsers = 0;
      let powerUsers = 0;
      let inactiveUsers = 0;
      let cvUploaders = 0;

      users.forEach(user => {
        const activity = userActivity[user.id] || 0;
        const hasCV = user.hasCV || user.cvFileName;
        
        if (hasCV) cvUploaders++;
        
        if (activity === 0) {
          inactiveUsers++;
        } else if (activity >= 10) {
          powerUsers++;
        } else if (activity >= 3) {
          activeUsers++;
        } else {
          newUsers++;
        }
      });

      const totalUsers = users.length;

      return [
        {
          segment: 'Power Users',
          userCount: powerUsers,
          percentage: (powerUsers / totalUsers) * 100,
          description: '10+ interacciones con herramientas'
        },
        {
          segment: 'Usuarios Activos',
          userCount: activeUsers,
          percentage: (activeUsers / totalUsers) * 100,
          description: '3-9 interacciones con herramientas'
        },
        {
          segment: 'Usuarios Nuevos',
          userCount: newUsers,
          percentage: (newUsers / totalUsers) * 100,
          description: '1-2 interacciones con herramientas'
        },
        {
          segment: 'Con CV Subido',
          userCount: cvUploaders,
          percentage: (cvUploaders / totalUsers) * 100,
          description: 'Usuarios que subieron CV'
        },
        {
          segment: 'Inactivos',
          userCount: inactiveUsers,
          percentage: (inactiveUsers / totalUsers) * 100,
          description: 'Sin usar herramientas'
        }
      ];
      
    } catch (error) {
      console.error('Error segmentando usuarios:', error);
      return [];
    }
  }

  // SOLO LECTURA: Analizar patrones de sesión
  async getSessionPatterns(): Promise<SessionPattern[]> {
    try {
      console.log('⏰ Analizando patrones de sesión...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let dailyActive = 0;
      let weeklyActive = 0;
      let monthlyActive = 0;

      users.forEach(user => {
        const lastActivity = (user as any).updatedAt?.toDate ? (user as any).updatedAt.toDate() : 
                           (user as any).lastLogin?.toDate ? (user as any).lastLogin.toDate() : null;
        
        if (lastActivity) {
          if (lastActivity >= oneDayAgo) dailyActive++;
          if (lastActivity >= oneWeekAgo) weeklyActive++;
          if (lastActivity >= oneMonthAgo) monthlyActive++;
        }
      });

      return [
        {
          timeRange: 'Últimas 24 horas',
          activeUsers: dailyActive,
          averageSessionGap: 0,
          frequency: 'Diario'
        },
        {
          timeRange: 'Últimos 7 días',
          activeUsers: weeklyActive,
          averageSessionGap: 0,
          frequency: 'Semanal'
        },
        {
          timeRange: 'Últimos 30 días',
          activeUsers: monthlyActive,
          averageSessionGap: 0,
          frequency: 'Mensual'
        }
      ];
      
    } catch (error) {
      console.error('Error analizando patrones de sesión:', error);
      return [];
    }
  }

  // SOLO LECTURA: Calcular tendencias de engagement
  async getEngagementTrends(): Promise<EngagementTrend[]> {
    try {
      console.log('📊 Calculando tendencias de engagement...');
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as any);
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data() as any);

      // Agrupar por día los últimos 30 días
      const trends: { [date: string]: { users: Set<string>, newUsers: number, toolUsage: number } } = {};
      const now = new Date();
      
      // Inicializar últimos 30 días
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        trends[dateStr] = { users: new Set(), newUsers: 0, toolUsage: 0 };
      }

      // Contar actividad por día
      transactions.forEach(transaction => {
        const createdAt = transaction.createdAt?.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
        const dateStr = createdAt.toISOString().split('T')[0];
        
        if (trends[dateStr]) {
          trends[dateStr].users.add(transaction.userId);
          trends[dateStr].toolUsage++;
        }
      });

      // Contar nuevos usuarios por día
      users.forEach(user => {
        const createdAt = (user as any).createdAt?.toDate ? (user as any).createdAt.toDate() : new Date((user as any).createdAt);
        const dateStr = createdAt.toISOString().split('T')[0];
        
        if (trends[dateStr]) {
          trends[dateStr].newUsers++;
        }
      });

      return Object.entries(trends).map(([date, data]) => ({
        date,
        activeUsers: data.users.size,
        newUsers: data.newUsers,
        returningUsers: data.users.size - data.newUsers,
        toolUsage: data.toolUsage
      })).sort((a, b) => a.date.localeCompare(b.date));
      
    } catch (error) {
      console.error('Error calculando tendencias:', error);
      return [];
    }
  }

  // SOLO LECTURA: Obtener métricas generales de engagement
  async getEngagementOverview() {
    try {
      console.log('📋 Calculando overview de engagement...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as any);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calcular usuarios activos
      let weeklyActive = 0;
      let monthlyActive = 0;
      let churning = 0;

      users.forEach(user => {
        const lastActivity = (user as any).updatedAt?.toDate ? (user as any).updatedAt.toDate() : 
                           (user as any).lastLogin?.toDate ? (user as any).lastLogin.toDate() : null;
        
        if (lastActivity) {
          if (lastActivity >= oneWeekAgo) weeklyActive++;
          if (lastActivity >= oneMonthAgo) monthlyActive++;
          
          // Usuarios que no han estado activos en 14+ días pero estuvieron activos en el último mes
          const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          if (lastActivity < fourteenDaysAgo && lastActivity >= oneMonthAgo) {
            churning++;
          }
        }
      });

      // Calcular sesiones promedio por usuario
      const userSessionCount: { [userId: string]: number } = {};
      transactions.forEach(transaction => {
        userSessionCount[transaction.userId] = (userSessionCount[transaction.userId] || 0) + 1;
      });

      const totalSessions = Object.values(userSessionCount).reduce((sum, count) => sum + count, 0);
      const activeUsersWithSessions = Object.keys(userSessionCount).length;

      return {
        totalActiveUsers: users.length,
        weeklyActiveUsers: weeklyActive,
        monthlyActiveUsers: monthlyActive,
        averageSessionsPerUser: activeUsersWithSessions > 0 ? totalSessions / activeUsersWithSessions : 0,
        churningUsers: churning,
        churnRate: users.length > 0 ? (churning / users.length) * 100 : 0
      };
      
    } catch (error) {
      console.error('Error calculando overview:', error);
      return {
        totalActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        averageSessionsPerUser: 0,
        churningUsers: 0,
        churnRate: 0
      };
    }
  }

  // MÉTODO PRINCIPAL: Ejecutar análisis completo de engagement
  async getCompleteEngagementAnalytics(): Promise<EngagementAnalytics> {
    try {
      console.log('🚀 Iniciando análisis completo de engagement y retención...');
      
      const [
        overview,
        retention,
        toolPopularity,
        userSegments,
        sessionPatterns,
        trends
      ] = await Promise.all([
        this.getEngagementOverview(),
        this.getRetentionMetrics(),
        this.getToolUsageAnalytics(),
        this.getUserSegments(),
        this.getSessionPatterns(),
        this.getEngagementTrends()
      ]);

      const analytics: EngagementAnalytics = {
        overview,
        retention,
        toolPopularity,
        userSegments,
        sessionPatterns,
        trends,
        generatedAt: new Date()
      };

      console.log('✅ Análisis de engagement completado');
      return analytics;
      
    } catch (error) {
      console.error('❌ Error en análisis de engagement:', error);
      throw error;
    }
  }
}

export const engagementAnalyticsService = new EngagementAnalyticsService(); 