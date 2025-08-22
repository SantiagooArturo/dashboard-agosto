import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Pagination } from '@heroui/pagination';
import { FileText, Download, Users, TrendingUp, Target, Activity, Search, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { universityReportsService, UniversityMetrics, StudentDetail } from '../services/universityReportsService';
import StudentDetailModal from '../components/StudentDetailModal';

const UniversityReportsPage: React.FC = () => {
  const [selectedUniversity, setSelectedUniversity] = useState<string>('UPC');
  const [metrics, setMetrics] = useState<UniversityMetrics | null>(null);
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Estados para la lista de estudiantes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const studentsPerPage = 10;

  const universities = [
    { key: 'UPC', label: 'UPC - Universidad Peruana de Ciencias Aplicadas' },
    { key: 'ULIMA', label: 'ULIMA - Universidad de Lima' },
    { key: 'UTP', label: 'UTP - Universidad Tecnológica del Perú' },
    { key: 'UPN', label: 'UPN - Universidad Privada del Norte' }
  ];

  useEffect(() => {
    if (selectedUniversity) {
      loadMetrics();
      loadStudents();
    }
  }, [selectedUniversity]);

  const loadMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await universityReportsService.getUniversityMetrics(selectedUniversity);
      setMetrics(data);
    } catch (err) {
      console.error('Error loading university metrics:', err);
      setError('Error al cargar las métricas de la universidad');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const studentData = await universityReportsService.getStudentsByUniversity(selectedUniversity);
      setStudents(studentData);
      setCurrentPage(1); // Reset pagination
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Error al cargar la lista de estudiantes');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Filtrar estudiantes por búsqueda
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  // Funciones del modal
  const openStudentModal = (student: StudentDetail) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeStudentModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const navigateStudent = (direction: 'prev' | 'next') => {
    if (!selectedStudent) return;
    
    const currentIndex = filteredStudents.findIndex(s => s.id === selectedStudent.id);
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < filteredStudents.length) {
      setSelectedStudent(filteredStudents[newIndex]);
    }
  };

  const getNavigationState = () => {
    if (!selectedStudent) return { prev: false, next: false };
    
    const currentIndex = filteredStudents.findIndex(s => s.id === selectedStudent.id);
    return {
      prev: currentIndex > 0,
      next: currentIndex < filteredStudents.length - 1
    };
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'power': return 'success';
      case 'active': return 'primary';
      case 'new': return 'warning';
      case 'inactive': return 'danger';
      default: return 'default';
    }
  };

  const getActivityLevelLabel = (level: string) => {
    switch (level) {
      case 'power': return 'Power User';
      case 'active': return 'Activo';
      case 'new': return 'Nuevo';
      case 'inactive': return 'Inactivo';
      default: return 'Desconocido';
    }
  };

  const downloadReport = () => {
    if (!metrics) return;
    
    const reportText = universityReportsService.generateTextReport(metrics);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${selectedUniversity}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Datos para gráficos
  const activityData = metrics ? [
    { name: 'Power Users', value: metrics.activityLevel.powerUsers, color: '#3B82F6' },
    { name: 'Usuarios Activos', value: metrics.activityLevel.activeUsers, color: '#10B981' },
    { name: 'Usuarios Inactivos', value: metrics.activityLevel.inactiveUsers, color: '#EF4444' }
  ] : [];

  const preparationData = metrics ? [
    { indicator: 'CV Ideal', percentage: metrics.preparationIndicators.cvAlignedPercentage },
    { indicator: 'Entrevistas Alto Desempeño', percentage: metrics.preparationIndicators.highPerformanceInterviewsPercentage },
    { indicator: 'Match con Vacantes', percentage: metrics.preparationIndicators.jobMatchPercentage }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Analizando datos de la universidad...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📊 Reportes por Universidad
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Análisis detallado de empleabilidad y preparación laboral por universidad
              </p>
            </div>
            
            {metrics && (
              <Button
                onClick={downloadReport}
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Descargar Reporte TXT
              </Button>
            )}
          </div>
        </div>

        {/* Selector de Universidad */}
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Seleccionar Universidad
                </h3>
                <Select
                  selectedKeys={[selectedUniversity]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedUniversity(selected);
                  }}
                  placeholder="Selecciona una universidad"
                  className="max-w-md"
                >
                  {universities.map((university) => (
                    <SelectItem key={university.key} value={university.key}>
                      {university.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200 dark:border-red-800">
            <CardBody className="p-6">
              <div className="text-red-600 dark:text-red-400">
                ❌ {error}
              </div>
            </CardBody>
          </Card>
        )}

        {metrics && (
          <>
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Estudiantes Evaluados
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {metrics.studentsEvaluated}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Búsquedas de Trabajo
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        +{metrics.jobSearches}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        CVs Analizados con IA
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        +{metrics.cvAnalyzed}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Entrevistas Simuladas
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        +{metrics.interviewsSimulated}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Principales Hallazgos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top 3 Áreas */}
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Top 3 Áreas Más Demandadas
                  </h3>
                  <div className="space-y-4">
                    {metrics.topAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {area.area}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {area.count}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {area.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Nivel de Actividad */}
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Distribución de Actividad
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {activityData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={activityData[index].color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Indicadores de Preparación Laboral */}
            <Card className="mb-8">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Indicadores de Preparación Laboral
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.preparationIndicators.cvAlignedPercentage}%
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">CV Alineado al Formato Ideal</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {metrics.preparationIndicators.highPerformanceInterviewsPercentage}%
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Entrevistas con Alto Desempeño</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.preparationIndicators.jobMatchPercentage}%
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Match con Vacantes Disponibles</p>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={preparationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="indicator" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Estadísticas Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardBody className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Estudiantes con CV</h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {metrics.studentsWithCV}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((metrics.studentsWithCV / metrics.studentsEvaluated) * 100)}% del total
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Perfiles Completados</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {metrics.profileCompleted}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((metrics.profileCompleted / metrics.studentsEvaluated) * 100)}% del total
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Onboarding Completado</h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {metrics.onboardingCompleted}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((metrics.onboardingCompleted / metrics.studentsEvaluated) * 100)}% del total
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Lista de Estudiantes */}
            <Card className="mt-8">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Lista de Estudiantes ({filteredStudents.length})
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      startContent={<Search className="w-4 h-4 text-gray-400" />}
                      className="w-64"
                    />
                  </div>
                </div>

                {studentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando estudiantes...</p>
                  </div>
                ) : (
                  <>
                    {/* Tabla de Estudiantes */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium">Estudiante</th>
                            <th className="text-center px-4 py-3 font-medium">CV</th>
                            <th className="text-center px-4 py-3 font-medium">Análisis CV</th>
                            <th className="text-center px-4 py-3 font-medium">Job Match</th>
                            <th className="text-center px-4 py-3 font-medium">Entrevistas</th>
                            <th className="text-center px-4 py-3 font-medium">Actividad</th>
                            <th className="text-center px-4 py-3 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStudents.map((student) => (
                            <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                              </td>
                              <td className="text-center px-4 py-3">
                                <Chip 
                                  color={student.hasCV ? 'success' : 'danger'}
                                  variant="flat"
                                  size="sm"
                                >
                                  {student.hasCV ? 'Sí' : 'No'}
                                </Chip>
                              </td>
                              <td className="text-center px-4 py-3">
                                <span className="font-medium">{student.toolUsage.cvAnalysis}</span>
                              </td>
                              <td className="text-center px-4 py-3">
                                <span className="font-medium">{student.toolUsage.jobMatches}</span>
                              </td>
                              <td className="text-center px-4 py-3">
                                <span className="font-medium">{student.toolUsage.interviews}</span>
                              </td>
                              <td className="text-center px-4 py-3">
                                <Chip 
                                  color={getActivityLevelColor(student.activityLevel)}
                                  variant="flat"
                                  size="sm"
                                >
                                  {getActivityLevelLabel(student.activityLevel)}
                                </Chip>
                              </td>
                              <td className="text-center px-4 py-3">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  onPress={() => openStudentModal(student)}
                                  startContent={<Eye className="w-4 h-4" />}
                                >
                                  Ver Detalle
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          total={totalPages}
                          page={currentPage}
                          onChange={setCurrentPage}
                          showControls
                          showShadow
                          color="primary"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </>
        )}

        {/* Modal de Detalle del Estudiante */}
        <StudentDetailModal
          isOpen={isModalOpen}
          onClose={closeStudentModal}
          student={selectedStudent}
          onNavigate={navigateStudent}
          canNavigate={getNavigationState()}
        />
      </div>
    </div>
  );
};

export default UniversityReportsPage;
