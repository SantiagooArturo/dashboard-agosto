import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ⚠️ IMPORTANTE: ESTE SERVICIO ES SOLO LECTURA - NO MODIFICA DATOS
// Only reads data for analytics purposes

export interface ActivationFunnelStep {
  step: string;
  users: number;
  percentage: number;
  dropOff: number;
}

export interface UniversityActivation {
  university: string;
  totalUsers: number;
  activatedUsers: number;
  activationRate: number;
  avgTimeToActivation?: number;
}

export interface TimeToActivation {
  userId: string;
  registrationDate: Date;
  activationDate?: Date;
  daysToActivation?: number;
  activated: boolean;
}

export interface OnboardingAnalysis {
  totalUsers: number;
  completedOnboarding: number;
  skippedOnboarding: number;
  skipRate: number;
  avgCompletionTime?: number;
}

export interface ActivationAnalytics {
  funnelSteps: ActivationFunnelStep[];
  universityBreakdown: UniversityActivation[];
  timeToActivationData: TimeToActivation[];
  onboardingAnalysis: OnboardingAnalysis;
  criticalMetrics: {
    totalUsers: number;
    activatedUsers: number;
    overallActivationRate: number;
    avgDaysToActivation: number;
    verificationRate: number;
  };
}

class ActivationAnalyticsService {
  
  // SOLO LECTURA: Analizar funnel de activación completo
  async getActivationFunnel(): Promise<ActivationFunnelStep[]> {
    try {
      console.log('📊 Analizando funnel de activación...');
      
      // Obtener todos los usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Analizar cada paso del funnel
      let verifiedUsers = 0;
      let onboardingCompleted = 0;
      let cvUploaded = 0;
      let firstAnalysis = 0;
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        
        // Paso 1: Verificación
        if (userData.verified === true) {
          verifiedUsers++;
        }
        
        // Paso 2: Onboarding completado
        if (userData.onboarding?.completed === true) {
          onboardingCompleted++;
        }
        
        // Paso 3: CV subido
        if (userData.hasCV === true || userData.cvFileName) {
          cvUploaded++;
        }
      });
      
      // Obtener análisis de CV realizados
      const cvAnalysisSnapshot = await getDocs(collection(db, 'cvReviews'));
      firstAnalysis = cvAnalysisSnapshot.size;
      
      // Construir steps del funnel
      const funnelSteps: ActivationFunnelStep[] = [
        {
          step: 'Registrados',
          users: totalUsers,
          percentage: 100,
          dropOff: 0
        },
        {
          step: 'Verificados',
          users: verifiedUsers,
          percentage: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
          dropOff: totalUsers - verifiedUsers
        },
        {
          step: 'Onboarding Completo',
          users: onboardingCompleted,
          percentage: totalUsers > 0 ? (onboardingCompleted / totalUsers) * 100 : 0,
          dropOff: totalUsers - onboardingCompleted
        },
        {
          step: 'CV Subido',
          users: cvUploaded,
          percentage: totalUsers > 0 ? (cvUploaded / totalUsers) * 100 : 0,
          dropOff: totalUsers - cvUploaded
        },
        {
          step: 'Primer Análisis',
          users: firstAnalysis,
          percentage: totalUsers > 0 ? (firstAnalysis / totalUsers) * 100 : 0,
          dropOff: totalUsers - firstAnalysis
        }
      ];
      
      console.log('✅ Funnel de activación calculado:', funnelSteps);
      return funnelSteps;
      
    } catch (error) {
      console.error('❌ Error calculando funnel de activación:', error);
      return [];
    }
  }

  // SOLO LECTURA: Análisis por universidad
  async getUniversityActivation(): Promise<UniversityActivation[]> {
    try {
      console.log('🎓 Analizando activación por universidad...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const universityMap = new Map<string, {
        total: number;
        activated: number;
        activationTimes: number[];
      }>();
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const university = userData.university || 'Sin especificar';
        const isActivated = userData.hasCV === true || userData.cvFileName;
        
        if (!universityMap.has(university)) {
          universityMap.set(university, {
            total: 0,
            activated: 0,
            activationTimes: []
          });
        }
        
        const uniData = universityMap.get(university)!;
        uniData.total++;
        
        if (isActivated) {
          uniData.activated++;
          
          // Calcular tiempo de activación si tenemos datos
          if (userData.createdAt && userData.cvUploadedAt) {
            const registrationTime = userData.createdAt.toDate();
            const activationTime = userData.cvUploadedAt.toDate();
            const daysDiff = Math.floor((activationTime.getTime() - registrationTime.getTime()) / (1000 * 60 * 60 * 24));
            uniData.activationTimes.push(daysDiff);
          }
        }
      });
      
      // Convertir a array y calcular métricas
      const result: UniversityActivation[] = Array.from(universityMap.entries())
        .map(([university, data]) => ({
          university,
          totalUsers: data.total,
          activatedUsers: data.activated,
          activationRate: data.total > 0 ? (data.activated / data.total) * 100 : 0,
          avgTimeToActivation: data.activationTimes.length > 0 
            ? data.activationTimes.reduce((sum, time) => sum + time, 0) / data.activationTimes.length 
            : undefined
        }))
        .sort((a, b) => b.totalUsers - a.totalUsers); // Ordenar por total de usuarios
      
      console.log('✅ Análisis por universidad completado:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error analizando universidades:', error);
      return [];
    }
  }

  // SOLO LECTURA: Análisis de tiempo hasta activación
  async getTimeToActivationData(): Promise<TimeToActivation[]> {
    try {
      console.log('⏱️ Analizando tiempo hasta activación...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const timeToActivationData: TimeToActivation[] = [];
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        
        const registrationDate = userData.createdAt?.toDate();
        const activationDate = userData.cvUploadedAt?.toDate();
        const activated = userData.hasCV === true || userData.cvFileName;
        
        let daysToActivation: number | undefined;
        if (registrationDate && activationDate) {
          daysToActivation = Math.floor((activationDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        timeToActivationData.push({
          userId,
          registrationDate: registrationDate || new Date(),
          activationDate,
          daysToActivation,
          activated
        });
      });
      
      console.log('✅ Datos de tiempo de activación obtenidos:', timeToActivationData.length);
      return timeToActivationData;
      
    } catch (error) {
      console.error('❌ Error analizando tiempo de activación:', error);
      return [];
    }
  }

  // SOLO LECTURA: Análisis de onboarding
  async getOnboardingAnalysis(): Promise<OnboardingAnalysis> {
    try {
      console.log('📝 Analizando onboarding...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalUsers = 0;
      let completedOnboarding = 0;
      let skippedOnboarding = 0;
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        totalUsers++;
        
        if (userData.onboarding) {
          if (userData.onboarding.completed === true) {
            completedOnboarding++;
          }
          if (userData.onboarding.skipped === true) {
            skippedOnboarding++;
          }
        }
      });
      
      const skipRate = totalUsers > 0 ? (skippedOnboarding / totalUsers) * 100 : 0;
      
      const analysis: OnboardingAnalysis = {
        totalUsers,
        completedOnboarding,
        skippedOnboarding,
        skipRate
      };
      
      console.log('✅ Análisis de onboarding completado:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analizando onboarding:', error);
      return {
        totalUsers: 0,
        completedOnboarding: 0,
        skippedOnboarding: 0,
        skipRate: 0
      };
    }
  }

  // SOLO LECTURA: Obtener todas las métricas de activación
  async getCompleteActivationAnalytics(): Promise<ActivationAnalytics> {
    try {
      console.log('🚀 Iniciando análisis completo de activación...');
      
      const [
        funnelSteps,
        universityBreakdown,
        timeToActivationData,
        onboardingAnalysis
      ] = await Promise.all([
        this.getActivationFunnel(),
        this.getUniversityActivation(),
        this.getTimeToActivationData(),
        this.getOnboardingAnalysis()
      ]);
      
      // Calcular métricas críticas
      const totalUsers = funnelSteps[0]?.users || 0;
      const activatedUsers = funnelSteps[3]?.users || 0; // CV subido
      const overallActivationRate = totalUsers > 0 ? (activatedUsers / totalUsers) * 100 : 0;
      const verificationRate = funnelSteps[1]?.percentage || 0;
      
      // Calcular promedio de días hasta activación
      const activationTimes = timeToActivationData
        .filter(data => data.daysToActivation !== undefined)
        .map(data => data.daysToActivation!);
      const avgDaysToActivation = activationTimes.length > 0 
        ? activationTimes.reduce((sum, days) => sum + days, 0) / activationTimes.length 
        : 0;
      
      const criticalMetrics = {
        totalUsers,
        activatedUsers,
        overallActivationRate,
        avgDaysToActivation,
        verificationRate
      };
      
      const completeAnalytics: ActivationAnalytics = {
        funnelSteps,
        universityBreakdown,
        timeToActivationData,
        onboardingAnalysis,
        criticalMetrics
      };
      
      console.log('✅ Análisis completo de activación terminado:', criticalMetrics);
      return completeAnalytics;
      
    } catch (error) {
      console.error('❌ Error en análisis completo de activación:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const activationAnalyticsService = new ActivationAnalyticsService(); 