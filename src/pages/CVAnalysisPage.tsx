import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { 
  FileText, 
  Search,
  Download,
  Eye,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Briefcase
} from 'lucide-react';
import { firebaseService } from '../services/adminFirebaseService';
import type { CVAnalysisData } from '../services/adminFirebaseService';

const CVAnalysisPage: React.FC = () => {
  const [cvAnalysis, setCVAnalysis] = useState<CVAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCVs, setFilteredCVs] = useState<CVAnalysisData[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchCVAnalysis = async () => {
    try {
      setLoading(true);
      console.log('📄 Cargando análisis de CV...');
      const cvData = await firebaseService.getCVAnalysis(150);
      setCVAnalysis(cvData);
      setFilteredCVs(cvData);
      console.log('✅ Análisis de CV cargados:', cvData.length);
    } catch (error) {
      console.error('❌ Error cargando análisis de CV:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVAnalysis();
  }, []);

  useEffect(() => {
    let filtered = cvAnalysis;
    
    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(cv => cv.status === selectedStatus);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(cv => 
        cv.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCVs(filtered);
  }, [searchTerm, selectedStatus, cvAnalysis]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Chip size="sm" color="success" variant="flat">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completado
          </Chip>
        );
      case 'pending':
        return (
          <Chip size="sm" color="warning" variant="flat">
            <Clock className="w-3 h-3 mr-1" />
            Procesando
          </Chip>
        );
      case 'error':
        return (
          <Chip size="sm" color="danger" variant="flat">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Chip>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Estadísticas
  const completedAnalysis = cvAnalysis.filter(cv => cv.status === 'completed').length;
  const pendingAnalysis = cvAnalysis.filter(cv => cv.status === 'pending').length;
  const errorAnalysis = cvAnalysis.filter(cv => cv.status === 'error').length;
  const averageScore = cvAnalysis
    .filter(cv => cv.score && cv.status === 'completed')
    .reduce((sum, cv, _, arr) => sum + (cv.score || 0) / arr.length, 0);

  const CVCard = ({ cv }: { cv: CVAnalysisData }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getStatusIcon(cv.status)}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {cv.fileName}
                </h3>
                {getStatusChip(cv.status)}
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <User className="w-4 h-4" />
                <span className="truncate">{cv.userEmail}</span>
              </div>
              
              {cv.position && (
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{cv.position}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(cv.createdAt)}</span>
                </div>
                {cv.completedAt && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completado: {formatDate(cv.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {cv.score && (
              <div className="text-center">
                <div className={`text-xl font-bold ${getScoreColor(cv.score)}`}>
                  {cv.score}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <Star className="w-3 h-3 inline mr-1" />
                  Score
                </div>
              </div>
            )}
            
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={() => console.log('Ver análisis:', cv.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Información adicional para CVs completados */}
        {cv.status === 'completed' && cv.result && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              {cv.result.strengths && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fortalezas</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {Array.isArray(cv.result.strengths) ? cv.result.strengths.length : 'N/A'}
                  </p>
                </div>
              )}
              {cv.result.improvements && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mejoras</p>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {Array.isArray(cv.result.improvements) ? cv.result.improvements.length : 'N/A'}
                  </p>
                </div>
              )}
              {cv.result.overall_rating && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Calificación</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {cv.result.overall_rating}/10
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Análisis de CVs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Historial de todos los análisis de CV realizados
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="bordered"
              startContent={<Download className="w-4 h-4" />}
              onClick={() => console.log('Exportar análisis')}
            >
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros y búsqueda */}
        <div className="flex items-center space-x-4">
          <div className="max-w-md flex-1">
            <Input
              placeholder="Buscar por archivo, email o posición..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              variant="bordered"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="pending">Procesando</option>
            <option value="error">Con error</option>
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedAnalysis}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completados
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingAnalysis}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Procesando
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {errorAnalysis}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Con Errores
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore ? averageScore.toFixed(1) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Score Promedio
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Lista de análisis */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCVs.map((cv) => (
            <CVCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}
      
      {filteredCVs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron análisis que coincidan con los filtros.
          </p>
        </div>
      )}
    </div>
  );
};

export default CVAnalysisPage;
