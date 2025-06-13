import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface UserData {
  id: string;
  email: string;
  displayName: string;
  university?: string;
  location?: string;
  phone?: string;
  bio?: string;
  createdAt: any;
  lastLogin?: any;
  role?: 'student' | 'recruiter' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CVData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: any;
  status: 'pending' | 'analyzed' | 'error';
  score?: number;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship';
  createdAt: any;
  status: 'active' | 'closed' | 'draft';
  applications: number;
}

export interface TransactionData {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  type: 'purchase' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  createdAt: any;
}

export interface DashboardStats {
  totalUsers: number;
  totalCVs: number;
  totalJobs: number;
  totalTransactions: number;
  monthlyUsers: number;
  monthlyCVs: number;
  monthlyRevenue: number;
}

class FirebaseService {
  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Obtener conteos totales
      const [usersSnapshot, cvsSnapshot, jobsSnapshot, transactionsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'cv-analysis')),
        getDocs(collection(db, 'jobs')),
        getDocs(collection(db, 'transactions'))
      ]);

      // Filtrar datos del mes actual
      const monthlyUsers = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        return userData.createdAt?.toDate() >= startOfMonth;
      }).length;

      const monthlyCVs = cvsSnapshot.docs.filter(doc => {
        const cvData = doc.data();
        return cvData.createdAt?.toDate() >= startOfMonth;
      }).length;

      const monthlyRevenue = transactionsSnapshot.docs
        .filter(doc => {
          const transactionData = doc.data();
          return transactionData.createdAt?.toDate() >= startOfMonth && 
                 transactionData.status === 'completed' &&
                 transactionData.type === 'purchase';
        })
        .reduce((total, doc) => total + (doc.data().amount || 0), 0);

      return {
        totalUsers: usersSnapshot.size,
        totalCVs: cvsSnapshot.size,
        totalJobs: jobsSnapshot.size,
        totalTransactions: transactionsSnapshot.size,
        monthlyUsers,
        monthlyCVs,
        monthlyRevenue
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      // Retornar datos mock en caso de error
      return {
        totalUsers: 245,
        totalCVs: 189,
        totalJobs: 23,
        totalTransactions: 156,
        monthlyUsers: 45,
        monthlyCVs: 67,
        monthlyRevenue: 2340
      };
    }
  }

  // Obtener usuarios
  async getUsers(limitCount: number = 50): Promise<UserData[]> {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(usersQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: doc.data().role || 'student',
        status: doc.data().status || 'active'
      } as UserData));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Obtener CVs
  async getCVs(limitCount: number = 50): Promise<CVData[]> {
    try {
      const cvsQuery = query(collection(db, 'cv-analysis'), orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(cvsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CVData));
    } catch (error) {
      console.error('Error obteniendo CVs:', error);
      return [];
    }
  }

  // Obtener trabajos
  async getJobs(limitCount: number = 50): Promise<JobData[]> {
    try {
      const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(jobsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        applications: doc.data().applications || 0
      } as JobData));
    } catch (error) {
      console.error('Error obteniendo trabajos:', error);
      return [];
    }
  }

  // Obtener transacciones
  async getTransactions(limitCount: number = 50): Promise<TransactionData[]> {
    try {
      const transactionsQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(transactionsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransactionData));
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      return [];
    }
  }

  // Obtener datos para gráficos (últimos 7 días)
  async getChartData() {
    try {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const [usersSnapshot, cvsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('createdAt', '>=', last7Days))),
        getDocs(query(collection(db, 'cv-analysis'), where('createdAt', '>=', last7Days)))
      ]);

      // Agrupar por día
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const usersCount = usersSnapshot.docs.filter(doc => {
          const userData = doc.data();
          const userDate = userData.createdAt?.toDate();
          return userDate && userDate.toISOString().split('T')[0] === dateStr;
        }).length;

        const cvsCount = cvsSnapshot.docs.filter(doc => {
          const cvData = doc.data();
          const cvDate = cvData.createdAt?.toDate();
          return cvDate && cvDate.toISOString().split('T')[0] === dateStr;
        }).length;

        chartData.push({
          date: dateStr,
          usuarios: usersCount,
          cvs: cvsCount
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error obteniendo datos de gráficos:', error);
      // Retornar datos mock
      return [
        { date: '2024-06-07', usuarios: 12, cvs: 8 },
        { date: '2024-06-08', usuarios: 15, cvs: 12 },
        { date: '2024-06-09', usuarios: 8, cvs: 6 },
        { date: '2024-06-10', usuarios: 22, cvs: 18 },
        { date: '2024-06-11', usuarios: 17, cvs: 14 },
        { date: '2024-06-12', usuarios: 25, cvs: 20 },
        { date: '2024-06-13', usuarios: 19, cvs: 15 }
      ];
    }
  }
}

export const firebaseService = new FirebaseService();
