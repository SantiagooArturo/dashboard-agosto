import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface CollectionAnalysis {
  name: string;
  totalDocuments: number;
  sampleDocuments: any[];
  fieldAnalysis: {
    [fieldName: string]: {
      type: string;
      frequency: number;
      sampleValues: any[];
    };
  };
  documentStructures: string[];
}

interface FirebaseAnalysisReport {
  collections: CollectionAnalysis[];
  totalCollections: number;
  totalDocuments: number;
  generatedAt: Date;
}

export class FirebaseAnalyzer {
  private async analyzeCollection(collectionName: string, sampleLimit: number = 100): Promise<CollectionAnalysis> {
    console.log(`🔍 Analizando colección: ${collectionName}`);
    
    try {
      // Obtener todos los documentos para el conteo total
      const allDocsSnapshot = await getDocs(collection(db, collectionName));
      const totalDocuments = allDocsSnapshot.size;
      
      // Obtener muestra para análisis
      const sampleQuery = query(collection(db, collectionName), limit(sampleLimit));
      const sampleSnapshot = await getDocs(sampleQuery);
      const sampleDocuments = sampleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Analizar campos
      const fieldAnalysis: { [key: string]: any } = {};
      const documentStructures = new Set<string>();

      sampleDocuments.forEach(doc => {
        const fields = Object.keys(doc);
        documentStructures.add(JSON.stringify(fields.sort()));

        fields.forEach(field => {
          if (!fieldAnalysis[field]) {
            fieldAnalysis[field] = {
              type: this.getFieldType(doc[field]),
              frequency: 0,
              sampleValues: []
            };
          }
          
          fieldAnalysis[field].frequency++;
          
          // Agregar valores de muestra (máximo 5)
          if (fieldAnalysis[field].sampleValues.length < 5) {
            fieldAnalysis[field].sampleValues.push(doc[field]);
          }
        });
      });

      return {
        name: collectionName,
        totalDocuments,
        sampleDocuments: sampleDocuments.slice(0, 5), // Solo los primeros 5 para el reporte
        fieldAnalysis,
        documentStructures: Array.from(documentStructures)
      };

    } catch (error) {
      console.error(`❌ Error analizando colección ${collectionName}:`, error);
      return {
        name: collectionName,
        totalDocuments: 0,
        sampleDocuments: [],
        fieldAnalysis: {},
        documentStructures: []
      };
    }
  }

  private getFieldType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (value && typeof value === 'object') {
      if (value.toDate && typeof value.toDate === 'function') return 'timestamp';
      if (value.seconds !== undefined && value.nanoseconds !== undefined) return 'timestamp';
      return 'object';
    }
    return typeof value;
  }

  async analyzeFirebaseStructure(): Promise<FirebaseAnalysisReport> {
    console.log('🚀 Iniciando análisis completo de Firebase...');
    
    // Lista de colecciones conocidas basadas en el código
    const knownCollections = [
      'users',
      'creditAccounts', 
      'creditTransactions',
      'cvReviews',
      'cv-analysis', // Colección alternativa vista en el código
      'jobs',
      'interviews'
    ];

    // También buscar colecciones adicionales que puedan existir
    const additionalCollections = [
      'companies',
      'applications',
      'payments',
      'feedback',
      'notifications',
      'userProfiles',
      'subscriptions',
      'analytics',
      'adminLogs',
      'settings'
    ];

    const allCollectionsToCheck = [...knownCollections, ...additionalCollections];
    const analyses: CollectionAnalysis[] = [];
    let totalDocuments = 0;

    for (const collectionName of allCollectionsToCheck) {
      try {
        const analysis = await this.analyzeCollection(collectionName);
        if (analysis.totalDocuments > 0) {
          analyses.push(analysis);
          totalDocuments += analysis.totalDocuments;
          console.log(`✅ ${collectionName}: ${analysis.totalDocuments} documentos`);
        } else {
          console.log(`⚪ ${collectionName}: colección vacía o no existe`);
        }
      } catch (error) {
        console.log(`❌ ${collectionName}: no se pudo acceder`);
      }

      // Pequeña pausa para evitar saturar Firebase
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      collections: analyses,
      totalCollections: analyses.length,
      totalDocuments,
      generatedAt: new Date()
    };
  }

  generateReport(analysis: FirebaseAnalysisReport): string {
    let report = `
📊 REPORTE DE ANÁLISIS DE FIREBASE - MyWorkIn
Generated: ${analysis.generatedAt.toLocaleString()}
=================================================

📈 RESUMEN GENERAL:
- Total de colecciones: ${analysis.totalCollections}
- Total de documentos: ${analysis.totalDocuments}

`;

    analysis.collections.forEach(collection => {
      report += `
🗂️  COLECCIÓN: ${collection.name.toUpperCase()}
----------------------------------------
📊 Total documentos: ${collection.totalDocuments}
🔍 Estructuras diferentes: ${collection.documentStructures.length}

📝 CAMPOS ENCONTRADOS:
`;

      Object.entries(collection.fieldAnalysis).forEach(([field, data]) => {
        const percentage = ((data.frequency / collection.sampleDocuments.length) * 100).toFixed(1);
        report += `  • ${field} (${data.type}) - Presente en ${data.frequency}/${collection.sampleDocuments.length} docs (${percentage}%)\n`;
        
        if (data.sampleValues.length > 0) {
          report += `    Valores ejemplo: ${data.sampleValues.slice(0, 3).map(v => 
            typeof v === 'object' ? JSON.stringify(v).substring(0, 50) + '...' : String(v)
          ).join(', ')}\n`;
        }
      });

      if (collection.sampleDocuments.length > 0) {
        report += `
📋 DOCUMENTO EJEMPLO:
${JSON.stringify(collection.sampleDocuments[0], null, 2).substring(0, 500)}...

`;
      }
    });

    return report;
  }

  async runCompleteAnalysis(): Promise<string> {
    try {
      const analysis = await this.analyzeFirebaseStructure();
      const report = this.generateReport(analysis);
      
      console.log(report);
      
      // También devolver el análisis en formato JSON para usar programáticamente
      const jsonAnalysis = JSON.stringify(analysis, null, 2);
      
      return `${report}

📋 DATOS COMPLETOS EN JSON:
${jsonAnalysis}`;
      
    } catch (error) {
      console.error('❌ Error en análisis completo:', error);
      return `Error durante el análisis: ${error}`;
    }
  }
}

// Función helper para ejecutar desde consola
export const analyzeFirebase = async () => {
  const analyzer = new FirebaseAnalyzer();
  return await analyzer.runCompleteAnalysis();
}; 