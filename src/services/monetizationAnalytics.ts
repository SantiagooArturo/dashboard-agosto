import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ⚠️ IMPORTANTE: ESTE SERVICIO ES SOLO LECTURA - NO MODIFICA DATOS
// Only reads data for monetization and value realization analytics

// =============================================================================
// INTERFACES Y TIPOS
// =============================================================================

export interface ConversionMetrics {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
  conversionRate: number;
  averageDaysToConversion: number;
  conversionsByMonth: Array<{
    month: string;
    conversions: number;
    rate: number;
  }>;
}

export interface CreditAnalytics {
  totalCreditsDistributed: number;
  totalCreditsSpent: number;
  averageCreditsPerUser: number;
  creditUtilizationRate: number;
  usersOutOfCredits: number;
  usersWithUnusedCredits: number;
  averageCreditsConsumedPerSession: number;
  creditDistribution: Array<{
    range: string;
    userCount: number;
    percentage: number;
  }>;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  averageRevenuePerPaidUser: number;
  estimatedLifetimeValue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  revenueByPackage: Array<{
    packageId: string;
    packageName: string;
    totalRevenue: number;
    transactionCount: number;
    averageValue: number;
  }>;
}

export interface PurchasePatterns {
  mostPopularPackage: string;
  averageTransactionValue: number;
  repurchaseRate: number;
  averageDaysBetweenPurchases: number;
  purchaseTimeDistribution: Array<{
    hour: number;
    purchases: number;
  }>;
  packagePopularity: Array<{
    packageId: string;
    packageName: string;
    purchases: number;
    revenue: number;
    popularity: number;
  }>;
}

export interface ValueRealization {
  usersWhoSeePaidValue: number;
  toolUsageBeforePurchase: number;
  averageToolsUsedBeforeConversion: number;
  valueDrivers: Array<{
    tool: string;
    preConversionUsage: number;
    postConversionUsage: number;
    conversionCorrelation: number;
  }>;
  creditExhaustionToConversion: {
    usersWhoRanOut: number;
    conversionAfterExhaustion: number;
    rate: number;
  };
}

export interface MonetizationAnalytics {
  overview: {
    totalRevenue: number;
    paidUsers: number;
    conversionRate: number;
    averageRevenuePerUser: number;
    monthlyGrowthRate: number;
  };
  conversion: ConversionMetrics;
  credits: CreditAnalytics;
  revenue: RevenueMetrics;
  purchases: PurchasePatterns;
  valueRealization: ValueRealization;
  generatedAt: Date;
}

// =============================================================================
// SERVICIO DE ANALYTICS DE MONETIZACIÓN
// =============================================================================

class MonetizationAnalyticsService {

  // SOLO LECTURA: Analizar métricas de conversión freemium a premium
  async getConversionMetrics(): Promise<ConversionMetrics> {
    try {
      console.log('💳 Analizando métricas de conversión...');
      
      // Obtener todos los usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Obtener transacciones de compra
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const allTransactions = transactionsSnapshot.docs.map(doc => doc.data() as any);
      
      // Filtrar solo transacciones de compra (no bonus)
      const purchaseTransactions = allTransactions.filter(tx => 
        tx.type === 'purchase' || tx.packageId || tx.paymentAmount
      );

      // Identificar usuarios que han pagado
      const paidUserIds = new Set(purchaseTransactions.map(tx => tx.userId));
      
      const totalUsers = users.length;
      const paidUsers = paidUserIds.size;
      const freeUsers = totalUsers - paidUsers;
      const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

      // Calcular tiempo promedio hasta conversión
      let totalDaysToConversion = 0;
      let conversionsWithValidDates = 0;

      paidUserIds.forEach(userId => {
        const user = users.find(u => u.id === userId);
        const firstPurchase = purchaseTransactions
          .filter(tx => tx.userId === userId)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateA.getTime() - dateB.getTime();
          })[0];

        if (user?.createdAt && firstPurchase?.createdAt) {
          const userCreatedAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          const purchaseDate = firstPurchase.createdAt?.toDate ? firstPurchase.createdAt.toDate() : new Date(firstPurchase.createdAt);
          
          const daysDiff = Math.floor((purchaseDate.getTime() - userCreatedAt.getTime()) / (24 * 60 * 60 * 1000));
          if (daysDiff >= 0) {
            totalDaysToConversion += daysDiff;
            conversionsWithValidDates++;
          }
        }
      });

      const averageDaysToConversion = conversionsWithValidDates > 0 ? 
        totalDaysToConversion / conversionsWithValidDates : 0;

      // Conversiones por mes (últimos 12 meses)
      const now = new Date();
      const conversionsByMonth = [];
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthlyConversions = purchaseTransactions.filter(tx => {
          const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
          return txDate >= monthDate && txDate < nextMonthDate;
        });

        const monthlyNewUsers = users.filter(user => {
          const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return userDate >= monthDate && userDate < nextMonthDate;
        });

        conversionsByMonth.push({
          month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          conversions: new Set(monthlyConversions.map(tx => tx.userId)).size,
          rate: monthlyNewUsers.length > 0 ? 
            (new Set(monthlyConversions.map(tx => tx.userId)).size / monthlyNewUsers.length) * 100 : 0
        });
      }

      return {
        totalUsers,
        freeUsers,
        paidUsers,
        conversionRate,
        averageDaysToConversion,
        conversionsByMonth
      };

    } catch (error) {
      console.error('Error analizando conversión:', error);
      return {
        totalUsers: 0,
        freeUsers: 0,
        paidUsers: 0,
        conversionRate: 0,
        averageDaysToConversion: 0,
        conversionsByMonth: []
      };
    }
  }

  // SOLO LECTURA: Analizar patrones de créditos y consumo
  async getCreditAnalytics(): Promise<CreditAnalytics> {
    try {
      console.log('🎯 Analizando analytics de créditos...');
      
      const creditAccountsSnapshot = await getDocs(collection(db, 'creditAccounts'));
      const creditAccounts = creditAccountsSnapshot.docs.map(doc => doc.data() as any);
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as any);

      // Calcular métricas básicas
      const totalCreditsDistributed = creditAccounts.reduce((sum, account) => sum + (account.totalEarned || 0), 0);
      const totalCreditsSpent = creditAccounts.reduce((sum, account) => sum + (account.totalSpent || 0), 0);
      const averageCreditsPerUser = creditAccounts.length > 0 ? 
        totalCreditsDistributed / creditAccounts.length : 0;
      
      const creditUtilizationRate = totalCreditsDistributed > 0 ? 
        (totalCreditsSpent / totalCreditsDistributed) * 100 : 0;

      // Usuarios sin créditos vs con créditos no usados
      const usersOutOfCredits = creditAccounts.filter(account => (account.credits || 0) === 0).length;
      const usersWithUnusedCredits = creditAccounts.filter(account => (account.credits || 0) > 0).length;

      // Promedio de créditos consumidos por sesión
      const consumptionTransactions = transactions.filter(tx => 
        tx.type === 'reserve' || tx.type === 'spend'
      );
      const averageCreditsConsumedPerSession = consumptionTransactions.length > 0 ? 
        consumptionTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / consumptionTransactions.length : 0;

      // Distribución de créditos por rangos
      const creditDistribution = [
        { range: '0 créditos', userCount: 0, percentage: 0 },
        { range: '1-5 créditos', userCount: 0, percentage: 0 },
        { range: '6-10 créditos', userCount: 0, percentage: 0 },
        { range: '11-20 créditos', userCount: 0, percentage: 0 },
        { range: '21+ créditos', userCount: 0, percentage: 0 }
      ];

      creditAccounts.forEach(account => {
        const credits = account.credits || 0;
        if (credits === 0) creditDistribution[0].userCount++;
        else if (credits <= 5) creditDistribution[1].userCount++;
        else if (credits <= 10) creditDistribution[2].userCount++;
        else if (credits <= 20) creditDistribution[3].userCount++;
        else creditDistribution[4].userCount++;
      });

      // Calcular porcentajes
      creditDistribution.forEach(range => {
        range.percentage = creditAccounts.length > 0 ? 
          (range.userCount / creditAccounts.length) * 100 : 0;
      });

      return {
        totalCreditsDistributed,
        totalCreditsSpent,
        averageCreditsPerUser,
        creditUtilizationRate,
        usersOutOfCredits,
        usersWithUnusedCredits,
        averageCreditsConsumedPerSession,
        creditDistribution
      };

    } catch (error) {
      console.error('Error analizando créditos:', error);
      return {
        totalCreditsDistributed: 0,
        totalCreditsSpent: 0,
        averageCreditsPerUser: 0,
        creditUtilizationRate: 0,
        usersOutOfCredits: 0,
        usersWithUnusedCredits: 0,
        averageCreditsConsumedPerSession: 0,
        creditDistribution: []
      };
    }
  }

  // SOLO LECTURA: Calcular métricas de revenue y LTV
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    try {
      console.log('💰 Calculando métricas de revenue...');
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const allTransactions = transactionsSnapshot.docs.map(doc => doc.data() as any);
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Filtrar transacciones de compra
      const purchaseTransactions = allTransactions.filter(tx => 
        tx.type === 'purchase' && tx.paymentAmount && tx.paymentAmount > 0
      );

      // Calcular revenue total
      const totalRevenue = purchaseTransactions.reduce((sum, tx) => sum + (tx.paymentAmount || 0), 0);
      
      // Revenue por usuario (todos los usuarios)
      const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
      
      // Revenue por usuario pagador
      const paidUsers = new Set(purchaseTransactions.map(tx => tx.userId)).size;
      const averageRevenuePerPaidUser = paidUsers > 0 ? totalRevenue / paidUsers : 0;

      // Estimado de LTV (simplificado: revenue promedio * factor de retención estimado)
      const estimatedLifetimeValue = averageRevenuePerPaidUser * 2.5; // Factor conservador

      // Revenue por mes (últimos 12 meses)
      const now = new Date();
      const revenueByMonth = [];
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthlyTransactions = purchaseTransactions.filter(tx => {
          const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
          return txDate >= monthDate && txDate < nextMonthDate;
        });

        const monthlyRevenue = monthlyTransactions.reduce((sum, tx) => sum + (tx.paymentAmount || 0), 0);

        revenueByMonth.push({
          month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          revenue: monthlyRevenue,
          transactions: monthlyTransactions.length
        });
      }

      // Revenue por paquete
      const packageStats: { [key: string]: { revenue: number; count: number; name: string } } = {};
      
      purchaseTransactions.forEach(tx => {
        const packageId = tx.packageId || 'unknown';
        const packageName = tx.packageName || 'Paquete Desconocido';
        const amount = tx.paymentAmount || 0;

        if (!packageStats[packageId]) {
          packageStats[packageId] = { revenue: 0, count: 0, name: packageName };
        }
        
        packageStats[packageId].revenue += amount;
        packageStats[packageId].count++;
      });

      const revenueByPackage = Object.entries(packageStats).map(([packageId, stats]) => ({
        packageId,
        packageName: stats.name,
        totalRevenue: stats.revenue,
        transactionCount: stats.count,
        averageValue: stats.count > 0 ? stats.revenue / stats.count : 0
      })).sort((a, b) => b.totalRevenue - a.totalRevenue);

      // MRR simplificado (revenue del último mes)
      const lastMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?.revenue || 0;
      const monthlyRecurringRevenue = lastMonthRevenue;

      return {
        totalRevenue,
        monthlyRecurringRevenue,
        averageRevenuePerUser,
        averageRevenuePerPaidUser,
        estimatedLifetimeValue,
        revenueByMonth,
        revenueByPackage
      };

    } catch (error) {
      console.error('Error calculando revenue:', error);
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        averageRevenuePerUser: 0,
        averageRevenuePerPaidUser: 0,
        estimatedLifetimeValue: 0,
        revenueByMonth: [],
        revenueByPackage: []
      };
    }
  }

  // SOLO LECTURA: Analizar patrones de compra
  async getPurchasePatterns(): Promise<PurchasePatterns> {
    try {
      console.log('🔄 Analizando patrones de compra...');
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const allTransactions = transactionsSnapshot.docs.map(doc => doc.data() as any);
      
      const purchaseTransactions = allTransactions.filter(tx => 
        tx.type === 'purchase' && tx.paymentAmount && tx.paymentAmount > 0
      );

      if (purchaseTransactions.length === 0) {
        return {
          mostPopularPackage: 'N/A',
          averageTransactionValue: 0,
          repurchaseRate: 0,
          averageDaysBetweenPurchases: 0,
          purchaseTimeDistribution: [],
          packagePopularity: []
        };
      }

      // Valor promedio de transacción
      const averageTransactionValue = purchaseTransactions.reduce((sum, tx) => 
        sum + (tx.paymentAmount || 0), 0) / purchaseTransactions.length;

      // Análisis de paquetes
      const packageStats: { [key: string]: { count: number; revenue: number; name: string } } = {};
      
      purchaseTransactions.forEach(tx => {
        const packageId = tx.packageId || 'unknown';
        const packageName = tx.packageName || 'Paquete Desconocido';
        const amount = tx.paymentAmount || 0;

        if (!packageStats[packageId]) {
          packageStats[packageId] = { count: 0, revenue: 0, name: packageName };
        }
        
        packageStats[packageId].count++;
        packageStats[packageId].revenue += amount;
      });

      const packagePopularity = Object.entries(packageStats).map(([packageId, stats]) => ({
        packageId,
        packageName: stats.name,
        purchases: stats.count,
        revenue: stats.revenue,
        popularity: (stats.count / purchaseTransactions.length) * 100
      })).sort((a, b) => b.purchases - a.purchases);

      const mostPopularPackage = packagePopularity.length > 0 ? 
        packagePopularity[0].packageName : 'N/A';

      // Tasa de recompra
      const userPurchaseCounts: { [userId: string]: number } = {};
      purchaseTransactions.forEach(tx => {
        userPurchaseCounts[tx.userId] = (userPurchaseCounts[tx.userId] || 0) + 1;
      });

      const usersWithMultiplePurchases = Object.values(userPurchaseCounts).filter(count => count > 1).length;
      const totalPurchasingUsers = Object.keys(userPurchaseCounts).length;
      const repurchaseRate = totalPurchasingUsers > 0 ? 
        (usersWithMultiplePurchases / totalPurchasingUsers) * 100 : 0;

      // Distribución por hora de compra
      const purchaseTimeDistribution = Array(24).fill(0).map((_, hour) => ({ hour, purchases: 0 }));
      
      purchaseTransactions.forEach(tx => {
        const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
        const hour = txDate.getHours();
        purchaseTimeDistribution[hour].purchases++;
      });

      // Promedio de días entre compras (para usuarios con múltiples compras)
      let totalDaysBetweenPurchases = 0;
      let purchaseGapsCount = 0;

      Object.entries(userPurchaseCounts).forEach(([userId, count]) => {
        if (count > 1) {
          const userPurchases = purchaseTransactions
            .filter(tx => tx.userId === userId)
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
              return dateA.getTime() - dateB.getTime();
            });

          for (let i = 1; i < userPurchases.length; i++) {
            const prevDate = userPurchases[i-1].createdAt?.toDate ? 
              userPurchases[i-1].createdAt.toDate() : new Date(userPurchases[i-1].createdAt);
            const currDate = userPurchases[i].createdAt?.toDate ? 
              userPurchases[i].createdAt.toDate() : new Date(userPurchases[i].createdAt);
            
            const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
            totalDaysBetweenPurchases += daysDiff;
            purchaseGapsCount++;
          }
        }
      });

      const averageDaysBetweenPurchases = purchaseGapsCount > 0 ? 
        totalDaysBetweenPurchases / purchaseGapsCount : 0;

      return {
        mostPopularPackage,
        averageTransactionValue,
        repurchaseRate,
        averageDaysBetweenPurchases,
        purchaseTimeDistribution,
        packagePopularity
      };

    } catch (error) {
      console.error('Error analizando patrones de compra:', error);
      return {
        mostPopularPackage: 'N/A',
        averageTransactionValue: 0,
        repurchaseRate: 0,
        averageDaysBetweenPurchases: 0,
        purchaseTimeDistribution: [],
        packagePopularity: []
      };
    }
  }

  // SOLO LECTURA: Analizar value realization
  async getValueRealization(): Promise<ValueRealization> {
    try {
      console.log('🎯 Analizando value realization...');
      
      const transactionsSnapshot = await getDocs(collection(db, 'creditTransactions'));
      const allTransactions = transactionsSnapshot.docs.map(doc => doc.data() as any);
      
      const creditAccountsSnapshot = await getDocs(collection(db, 'creditAccounts'));
      const creditAccounts = creditAccountsSnapshot.docs.map(doc => doc.data() as any);

      const purchaseTransactions = allTransactions.filter(tx => 
        tx.type === 'purchase' && tx.paymentAmount && tx.paymentAmount > 0
      );

      const toolUsageTransactions = allTransactions.filter(tx => 
        tx.tool && (tx.type === 'reserve' || tx.type === 'spend')
      );

      // Usuarios que compraron vs que solo usan gratis
      const paidUserIds = new Set(purchaseTransactions.map(tx => tx.userId));
      const usersWhoSeePaidValue = paidUserIds.size;

      // Uso de herramientas antes de la primera compra
      let totalToolUsageBeforeConversion = 0;
      let conversionsAnalyzed = 0;

      paidUserIds.forEach(userId => {
        const firstPurchase = purchaseTransactions
          .filter(tx => tx.userId === userId)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateA.getTime() - dateB.getTime();
          })[0];

        if (firstPurchase) {
          const firstPurchaseDate = firstPurchase.createdAt?.toDate ? 
            firstPurchase.createdAt.toDate() : new Date(firstPurchase.createdAt);
          
          const toolUsageBeforePurchase = toolUsageTransactions.filter(tx => {
            if (tx.userId !== userId) return false;
            const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
            return txDate < firstPurchaseDate;
          }).length;

          totalToolUsageBeforeConversion += toolUsageBeforePurchase;
          conversionsAnalyzed++;
        }
      });

      const averageToolsUsedBeforeConversion = conversionsAnalyzed > 0 ? 
        totalToolUsageBeforeConversion / conversionsAnalyzed : 0;

      // Análisis de agotamiento de créditos
      const usersWhoRanOutOfCredits = creditAccounts.filter(account => 
        (account.credits || 0) === 0 && (account.totalSpent || 0) > 0
      ).length;

      const usersWhoConvertedAfterExhaustion = creditAccounts.filter(account => {
        if ((account.credits || 0) > 0) return false;
        return paidUserIds.has(account.id);
      }).length;

      const creditExhaustionToConversionRate = usersWhoRanOutOfCredits > 0 ? 
        (usersWhoConvertedAfterExhaustion / usersWhoRanOutOfCredits) * 100 : 0;

      // Value drivers por herramienta
      const toolStats: { [tool: string]: { preConversion: number; postConversion: number } } = {};

      toolUsageTransactions.forEach(tx => {
        const tool = tx.tool;
        const userId = tx.userId;
        const isPaidUser = paidUserIds.has(userId);

        if (!toolStats[tool]) {
          toolStats[tool] = { preConversion: 0, postConversion: 0 };
        }

        if (isPaidUser) {
          // Determinar si fue antes o después de la conversión
          const firstPurchase = purchaseTransactions
            .filter(ptx => ptx.userId === userId)
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
              return dateA.getTime() - dateB.getTime();
            })[0];

          if (firstPurchase) {
            const purchaseDate = firstPurchase.createdAt?.toDate ? 
              firstPurchase.createdAt.toDate() : new Date(firstPurchase.createdAt);
            const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);

            if (txDate < purchaseDate) {
              toolStats[tool].preConversion++;
            } else {
              toolStats[tool].postConversion++;
            }
          }
        }
      });

      const valueDrivers = Object.entries(toolStats).map(([tool, stats]) => ({
        tool: tool === 'cv-review' ? 'Análisis CV' : 
              tool === 'job-match' ? 'Búsqueda Empleos' :
              tool === 'interview-simulation' ? 'Simulación Entrevista' : tool,
        preConversionUsage: stats.preConversion,
        postConversionUsage: stats.postConversion,
        conversionCorrelation: stats.preConversion + stats.postConversion > 0 ? 
          (stats.preConversion / (stats.preConversion + stats.postConversion)) * 100 : 0
      })).sort((a, b) => b.conversionCorrelation - a.conversionCorrelation);

      return {
        usersWhoSeePaidValue,
        toolUsageBeforePurchase: totalToolUsageBeforeConversion,
        averageToolsUsedBeforeConversion,
        valueDrivers,
        creditExhaustionToConversion: {
          usersWhoRanOut: usersWhoRanOutOfCredits,
          conversionAfterExhaustion: usersWhoConvertedAfterExhaustion,
          rate: creditExhaustionToConversionRate
        }
      };

    } catch (error) {
      console.error('Error analizando value realization:', error);
      return {
        usersWhoSeePaidValue: 0,
        toolUsageBeforePurchase: 0,
        averageToolsUsedBeforeConversion: 0,
        valueDrivers: [],
        creditExhaustionToConversion: {
          usersWhoRanOut: 0,
          conversionAfterExhaustion: 0,
          rate: 0
        }
      };
    }
  }

  // MÉTODO PRINCIPAL: Ejecutar análisis completo de monetización
  async getCompleteMonetizationAnalytics(): Promise<MonetizationAnalytics> {
    try {
      console.log('🚀 Iniciando análisis completo de monetización...');
      
      const [
        conversion,
        credits,
        revenue,
        purchases,
        valueRealization
      ] = await Promise.all([
        this.getConversionMetrics(),
        this.getCreditAnalytics(),
        this.getRevenueMetrics(),
        this.getPurchasePatterns(),
        this.getValueRealization()
      ]);

      // Calcular overview
      const lastMonth = revenue.revenueByMonth[revenue.revenueByMonth.length - 1];
      const secondLastMonth = revenue.revenueByMonth[revenue.revenueByMonth.length - 2];
      
      const monthlyGrowthRate = lastMonth && secondLastMonth && secondLastMonth.revenue > 0 ? 
        ((lastMonth.revenue - secondLastMonth.revenue) / secondLastMonth.revenue) * 100 : 0;

      const analytics: MonetizationAnalytics = {
        overview: {
          totalRevenue: revenue.totalRevenue,
          paidUsers: conversion.paidUsers,
          conversionRate: conversion.conversionRate,
          averageRevenuePerUser: revenue.averageRevenuePerUser,
          monthlyGrowthRate
        },
        conversion,
        credits,
        revenue,
        purchases,
        valueRealization,
        generatedAt: new Date()
      };

      console.log('✅ Análisis de monetización completado');
      return analytics;
      
    } catch (error) {
      console.error('❌ Error en análisis de monetización:', error);
      throw error;
    }
  }
}

export const monetizationAnalyticsService = new MonetizationAnalyticsService(); 