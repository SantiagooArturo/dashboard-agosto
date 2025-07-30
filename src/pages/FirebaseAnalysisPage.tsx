import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Code } from '@heroui/code';
import { FirebaseAnalyzer } from '@/scripts/firebaseAnalyzer';

export const FirebaseAnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const analyzer = new FirebaseAnalyzer();
      const result = await analyzer.runCompleteAnalysis();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error durante el análisis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis de Firebase</h1>
          <p className="text-gray-600 mt-2">
            Análisis completo de la estructura de datos de MyWorkIn
          </p>
        </div>
        
        <Button
          color="primary"
          onClick={runAnalysis}
          disabled={isAnalyzing}
          startContent={isAnalyzing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : '🔍'}
        >
          {isAnalyzing ? 'Analizando...' : 'Ejecutar Análisis'}
        </Button>
      </div>

      {error && (
        <Card className="border-l-4 border-l-red-500">
          <CardBody>
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-700">Error durante el análisis</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analizando Firebase...</h3>
            <p className="text-gray-600">
              Esto puede tomar unos minutos dependiendo del tamaño de la base de datos
            </p>
          </CardBody>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              📊 Resultados del Análisis
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Análisis completado exitosamente. Aquí están los detalles de tu estructura de Firebase:
                </p>
              </div>
              
              <Code
                className="w-full max-h-96 overflow-auto text-xs"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {analysisResult}
              </Code>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(analysisResult);
                    // Aquí podrías agregar una notificación de éxito
                  }}
                >
                  📋 Copiar Resultados
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([analysisResult], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `firebase-analysis-${new Date().toISOString().split('T')[0]}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  💾 Descargar Reporte
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">ℹ️ Información del Análisis</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3 text-sm">
            <p>
              <strong>🎯 Propósito:</strong> Este análisis examina todas las colecciones de Firebase 
              para entender la estructura de datos actual de MyWorkIn.
            </p>
            <p>
              <strong>🔍 Qué analiza:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Todas las colecciones existentes</li>
              <li>Cantidad total de documentos por colección</li>
              <li>Estructura de campos en cada documento</li>
              <li>Tipos de datos utilizados</li>
              <li>Frecuencia de aparición de cada campo</li>
              <li>Ejemplos de valores reales</li>
            </ul>
            <p>
              <strong>🔒 Seguridad:</strong> Este análisis es de solo lectura y no modifica ningún dato.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FirebaseAnalysisPage; 