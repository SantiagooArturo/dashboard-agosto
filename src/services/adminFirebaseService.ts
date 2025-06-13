import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Interfaces actualizadas basadas en el proyecto real
export interface UserData {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  lastLoginAt?: any;
  disabled?: boolean;
  customClaims?: {
    role?: 'admin' | 'user';
  };
}

export interface CreditAccountData {
  userId: string;
  credits: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: any;
  updatedAt: any;
}

export interface CreditTransactionData {
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund' | 'reserve' | 'confirm' | 'revert';
  amount: number;
  tool?: 'cv-review' | 'cv-creation' | 'job-match' | 'interview-simulation';
  description: string;
  paymentId?: string;
  packageId?: string;
  packageName?: string;
  status?: 'pending' | 'confirmed' | 'reverted' | 'completed';
  reservationId?: string;
  paymentAmount?: number;
  createdAt: any;
}

export interface CVAnalysisData {
  id: string;
  userId: string;
  userEmail: string;
  fileName: string;
  fileUrl?: string;
  position?: string;
  status: 'pending' | 'completed' | 'error';
  score?: number;
  createdAt: any;
  completedAt?: any;
  result?: any;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'freelance';
  description?: string;
  requirements?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'active' | 'closed' | 'draft';
  applications: number;
  createdAt: any;
  updatedAt?: any;
}

export interface InterviewData {
  id: string;
  userId: string;
  userEmail: string;
  position: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  score?: number;
  feedback?: string;
  createdAt: any;
  scheduledDate?: any;
}

export interface DashboardStats {
  // Usuarios
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  
  // Créditos y Transacciones
  totalCreditsDistributed: number;
  totalCreditsSpent: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingTransactions: number;
  
  // Servicios
  totalCVAnalysis: number;
  monthlyCVAnalysis: number;
  totalJobMatches: number;
  monthlyJobMatches: number;
  totalInterviews: number;
  
  // Empleos
  totalJobs: number;
  activeJobs: number;
  monthlyJobApplications: number;
}

export interface UserWithCredits extends UserData {
  creditAccount?: CreditAccountData;
  totalTransactions: number;
  lastTransaction?: CreditTransactionData;
  totalCVAnalysis: number;
  totalJobMatches: number;
}

class FirebaseService {
  // Obtener estadísticas completas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

      // Ejecutar consultas en paralelo para mejor performance
      const [
        // Usuarios
        usersSnapshot,
        
        // Cuentas de créditos
        creditAccountsSnapshot,
        
        // Transacciones de créditos
        allTransactionsSnapshot,
        monthlyTransactionsSnapshot,
        pendingTransactionsSnapshot,
        
        // Análisis de CV
        cvAnalysisSnapshot,
        monthlyCVSnapshot,
        
        // Jobs y matches
        jobsSnapshot,
        activeJobsSnapshot,
        
        // Interviews
        interviewsSnapshot
      ] = await Promise.all([
        // Usuarios
        getDocs(collection(db, 'users')),
        
        // Cuentas de créditos
        getDocs(collection(db, 'creditAccounts')),
        
        // Todas las transacciones
        getDocs(collection(db, 'creditTransactions')),
        
        // Transacciones de este mes
        getDocs(query(
          collection(db, 'creditTransactions'),
          where('createdAt', '>=', startOfMonthTimestamp)
        )),
        
        // Transacciones pendientes
        getDocs(query(
          collection(db, 'creditTransactions'),
          where('status', '==', 'pending')
        )),
        
        // Análisis de CV
        getDocs(collection(db, 'cvReviews')),
        
        // CV de este mes
        getDocs(query(
          collection(db, 'cvReviews'),
          where('createdAt', '>=', startOfMonthTimestamp)
        )),
        
        // Jobs
        getDocs(collection(db, 'jobs')),
        
        // Jobs activos
        getDocs(query(
          collection(db, 'jobs'),
          where('status', '==', 'active')
        )),
        
        // Interviews
        getDocs(collection(db, 'interviews'))
      ]);

      // Calcular estadísticas de usuarios
      const totalUsers = usersSnapshot.size;
      const newUsersThisMonth = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        const createdAt = userData.createdAt?.toDate() || userData.metadata?.creationTime?.toDate();
        return createdAt >= startOfMonth;
      }).length;

      // Calcular estadísticas de créditos
      let totalCreditsDistributed = 0;
      let totalCreditsSpent = 0;
      
      creditAccountsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalCreditsDistributed += data.totalEarned || 0;
        totalCreditsSpent += data.totalSpent || 0;
      });

      // Calcular ingresos
      const purchaseTransactions = allTransactionsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.type === 'purchase' && data.status === 'completed';
      });

      const totalRevenue = purchaseTransactions.reduce((sum, doc) => {
        return sum + (doc.data().paymentAmount || 0);
      }, 0);

      const monthlyRevenue = monthlyTransactionsSnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.type === 'purchase' && data.status === 'completed';
        })
        .reduce((sum, doc) => {
          return sum + (doc.data().paymentAmount || 0);
        }, 0);

      // Estadísticas de servicios
      const monthlyCVAnalysis = monthlyCVSnapshot.size;
      
      // Contar job matches desde transacciones
      const jobMatchTransactions = allTransactionsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.tool === 'job-match' && (data.type === 'spend' || data.type === 'confirm');
      });

      const monthlyJobMatches = monthlyTransactionsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.tool === 'job-match' && (data.type === 'spend' || data.type === 'confirm');
      }).length;

      return {
        // Usuarios
        totalUsers,
        activeUsers: totalUsers, // Simplificado por ahora
        newUsersThisMonth,
        
        // Créditos y Transacciones
        totalCreditsDistributed,
        totalCreditsSpent,
        totalRevenue,
        monthlyRevenue,
        pendingTransactions: pendingTransactionsSnapshot.size,
        
        // Servicios
        totalCVAnalysis: cvAnalysisSnapshot.size,
        monthlyCVAnalysis,
        totalJobMatches: jobMatchTransactions.length,
        monthlyJobMatches,
        totalInterviews: interviewsSnapshot.size,
        
        // Empleos
        totalJobs: jobsSnapshot.size,
        activeJobs: activeJobsSnapshot.size,
        monthlyJobApplications: 0 // Se calculará cuando tengamos datos de aplicaciones
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      // Retornar datos mock en caso de error
      return this.getMockStats();
    }
  }

  // Obtener usuarios con información de créditos
  async getUsersWithCredits(limitCount: number = 50): Promise<UserWithCredits[]> {
    try {
      console.log('👥 Obteniendo usuarios con información de créditos...');
      
      const [usersSnapshot, creditAccountsSnapshot, transactionsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), limit(limitCount))),
        getDocs(collection(db, 'creditAccounts')),
        getDocs(collection(db, 'creditTransactions'))
      ]);

      // Crear mapas para búsqueda eficiente
      const creditAccountsMap = new Map();
      creditAccountsSnapshot.docs.forEach(doc => {
        creditAccountsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const userTransactionsMap = new Map();
      const userCVAnalysisMap = new Map();
      const userJobMatchesMap = new Map();

      transactionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        
        // Contar transacciones por usuario
        if (!userTransactionsMap.has(userId)) {
          userTransactionsMap.set(userId, []);
        }
        userTransactionsMap.get(userId).push({ id: doc.id, ...data });

        // Contar CV analysis
        if (data.tool === 'cv-review') {
          userCVAnalysisMap.set(userId, (userCVAnalysisMap.get(userId) || 0) + 1);
        }

        // Contar job matches
        if (data.tool === 'job-match') {
          userJobMatchesMap.set(userId, (userJobMatchesMap.get(userId) || 0) + 1);
        }
      });

      return usersSnapshot.docs.map(doc => {
        const userData = doc.data();
        const userId = doc.id;
        const transactions = userTransactionsMap.get(userId) || [];
        
        return {
          id: userId,
          email: userData.email || '',
          displayName: userData.displayName || userData.name || 'Usuario Anónimo',
          photoURL: userData.photoURL,
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,
          disabled: userData.disabled || false,
          customClaims: userData.customClaims,
          creditAccount: creditAccountsMap.get(userId),
          totalTransactions: transactions.length,          lastTransaction: transactions.length > 0 ? 
            transactions.sort((a: any, b: any) => {
              const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
              const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            })[0] : 
            undefined,
          totalCVAnalysis: userCVAnalysisMap.get(userId) || 0,
          totalJobMatches: userJobMatchesMap.get(userId) || 0,
        } as UserWithCredits;
      });

    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Obtener transacciones de créditos
  async getCreditTransactions(limitCount: number = 100): Promise<CreditTransactionData[]> {
    try {
      console.log('💳 Obteniendo transacciones de créditos...');
      
      const transactionsQuery = query(
        collection(db, 'creditTransactions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CreditTransactionData));

    } catch (error) {
      console.error('❌ Error obteniendo transacciones:', error);
      return [];
    }
  }

  // Obtener análisis de CV
  async getCVAnalysis(limitCount: number = 100): Promise<CVAnalysisData[]> {
    try {
      console.log('📄 Obteniendo análisis de CV...');
      
      const cvQuery = query(
        collection(db, 'cvReviews'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(cvQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CVAnalysisData));

    } catch (error) {
      console.error('❌ Error obteniendo análisis de CV:', error);
      return [];
    }
  }

  // Obtener empleos
  async getJobs(limitCount: number = 50): Promise<JobData[]> {
    try {
      console.log('💼 Obteniendo empleos...');
      
      const jobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(jobsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobData));

    } catch (error) {
      console.error('❌ Error obteniendo empleos:', error);
      return [];
    }
  }

  // Obtener entrevistas simuladas
  async getInterviews(limitCount: number = 50): Promise<InterviewData[]> {
    try {
      console.log('🎤 Obteniendo entrevistas...');
      
      const interviewsQuery = query(
        collection(db, 'interviews'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(interviewsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InterviewData));

    } catch (error) {
      console.error('❌ Error obteniendo entrevistas:', error);
      return [];
    }
  }

  // Obtener estadísticas por período
  async getStatsForPeriod(days: number = 30): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const transactionsQuery = query(
        collection(db, 'creditTransactions'),
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(transactionsQuery);
      
      // Agrupar por día
      const dailyStats = new Map();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.createdAt?.toDate();
        
        if (date) {
          const dayKey = date.toISOString().split('T')[0];
          
          if (!dailyStats.has(dayKey)) {
            dailyStats.set(dayKey, {
              date: dayKey,
              transactions: 0,
              revenue: 0,
              cvAnalysis: 0,
              jobMatches: 0,
              credits: 0
            });
          }
          
          const dayData = dailyStats.get(dayKey);
          dayData.transactions++;
          
          if (data.type === 'purchase' && data.status === 'completed') {
            dayData.revenue += data.paymentAmount || 0;
            dayData.credits += data.amount || 0;
          }
          
          if (data.tool === 'cv-review') {
            dayData.cvAnalysis++;
          }
          
          if (data.tool === 'job-match') {
            dayData.jobMatches++;
          }
        }
      });

      return Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas por período:', error);
      return [];
    }
  }

  // Stats mock para fallback
  private getMockStats(): DashboardStats {
    return {
      totalUsers: 245,
      activeUsers: 189,
      newUsersThisMonth: 45,
      totalCreditsDistributed: 1520,
      totalCreditsSpent: 892,
      totalRevenue: 2340.50,
      monthlyRevenue: 890.25,
      pendingTransactions: 12,
      totalCVAnalysis: 234,
      monthlyCVAnalysis: 67,
      totalJobMatches: 156,
      monthlyJobMatches: 34,
      totalInterviews: 89,
      totalJobs: 23,
      activeJobs: 18,
      monthlyJobApplications: 127
    };
  }
}

export const firebaseService = new FirebaseService();
