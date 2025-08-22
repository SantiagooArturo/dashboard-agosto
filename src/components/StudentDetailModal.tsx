import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Card, CardBody } from '@heroui/card';
import { Tabs, Tab } from '@heroui/tabs';
import { 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Activity, 
  Target, 
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import type { StudentDetail } from '../services/universityReportsService';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetail | null;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigate?: { prev: boolean; next: boolean };
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onNavigate,
  canNavigate
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('info');
  
  if (!student) return null;

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-sm text-gray-600">{student.university}</p>
              </div>
            </div>
            <Chip 
              color={getActivityLevelColor(student.activityLevel)}
              variant="flat"
              size="sm"
            >
              {getActivityLevelLabel(student.activityLevel)}
            </Chip>
          </div>
        </ModalHeader>

        <ModalBody>
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key as string)}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab key="info" title={
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Información</span>
              </div>
            }>
              <div className="space-y-6 mt-6">
            
            {/* Información Personal */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Registro: {formatDate(student.registrationDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.lastActivity ? (
                      <>
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Última actividad: {formatDate(student.lastActivity)}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Sin actividad reciente</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip 
                      color={student.status === 'active' ? 'success' : 'danger'}
                      size="sm"
                      variant="flat"
                    >
                      {student.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Estado del Perfil */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Estado del Perfil
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    {student.hasCV ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      CV Subido {student.hasCV ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.profileCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Perfil Completo {student.profileCompleted ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.onboardingCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Onboarding {student.onboardingCompleted ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {student.hasCV && student.cvFileName && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">CV: {student.cvFileName}</span>
                      </div>
                      {student.cvFileUrl && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => window.open(student.cvFileUrl, '_blank')}
                          startContent={<ExternalLink className="w-3 h-3" />}
                        >
                          Abrir CV
                        </Button>
                      )}
                    </div>
                    {student.cvUploadedAt && (
                      <p className="text-xs text-gray-600 mt-1">
                        Subido el {formatDate(student.cvUploadedAt)}
                      </p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Uso de Herramientas */}
            <Card>
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Uso de Herramientas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {student.toolUsage.cvAnalysis}
                    </div>
                    <div className="text-sm text-gray-600">Análisis CV</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {student.toolUsage.jobMatches}
                    </div>
                    <div className="text-sm text-gray-600">Job Matches</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {student.toolUsage.interviews}
                    </div>
                    <div className="text-sm text-gray-600">Entrevistas</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {student.toolUsage.totalActivities}
                    </div>
                    <div className="text-sm text-gray-600">Total Actividades</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Resultados de Análisis CV */}
            {student.cvAnalysisResults && student.cvAnalysisResults.length > 0 && (
              <Card>
                <CardBody className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Historial de Análisis CV
                  </h3>
                  <div className="space-y-4">
                    {student.cvAnalysisResults.map((result, index) => (
                      <Card key={index} className="border">
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{result.position}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(result.date)} - Estado: {result.status}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.score && (
                                <Chip 
                                  color={result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'danger'}
                                  variant="flat"
                                  size="sm"
                                >
                                  {result.score}%
                                </Chip>
                              )}
                            </div>
                          </div>

                          {/* Análisis Detallado */}
                          {result.fullResult && (
                            <div className="space-y-3">
                              {/* Análisis Principal */}
                              {result.fullResult.mainly_analysis && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                                    📊 Análisis Principal
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Estado:</strong> {result.fullResult.mainly_analysis.estado} 
                                    ({result.fullResult.mainly_analysis.porcentaje}%)
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                    {result.fullResult.mainly_analysis.analisis}
                                  </p>
                                </div>
                              )}

                              {/* Ajuste al Puesto */}
                              {result.fullResult.ajuste_puesto && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                                    🎯 Ajuste al Puesto
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(result.fullResult.ajuste_puesto).map(([key, value]: [string, any]) => (
                                      <div key={key}>
                                        <strong>{key.replace(/_/g, ' ')}:</strong> {value.nivel} - {value.accion}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Errores de Ortografía */}
                              {result.fullResult.spelling && result.fullResult.spelling.errores > 0 && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                  <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">
                                    ✏️ Ortografía
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {result.fullResult.spelling.errores} errores detectados
                                  </p>
                                  {result.fullResult.spelling.detalle_errores && (
                                    <div className="mt-2 text-xs">
                                      {result.fullResult.spelling.detalle_errores.slice(0, 3).map((error: any, i: number) => (
                                        <div key={i} className="text-gray-600">
                                          "{error.original}" → "{error.sugerencia}"
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Verbos de Impacto */}
                              {result.fullResult.verbos_impact && (
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                                    💪 Verbos de Impacto
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Nivel: {result.fullResult.verbos_impact.nivel}/10
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {result.fullResult.verbos_impact.comentario}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
              </div>
            </Tab>

            {/* Tab de Progreso e Impacto */}
            <Tab key="progress" title={
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Progreso e Impacto</span>
              </div>
            }>
              <div className="space-y-6 mt-6">

                {/* Evolución del CV */}
                {student.cvEvolution && (
                  <Card>
                    <CardBody className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Evolución del CV
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CV Original */}
                        {student.cvEvolution.original && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📄 CV Original</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Score:</strong> {student.cvEvolution.original.score ?? 'N/A'}%</p>
                              <p><strong>Errores:</strong> {student.cvEvolution.original.errors ?? 0}</p>
                              <p><strong>Verbos:</strong> Nivel {student.cvEvolution.original.verbLevel ?? 0}</p>
                              <p className="text-xs text-gray-500">
                                {student.cvEvolution.original.uploadDate ? formatDate(student.cvEvolution.original.uploadDate) : 'Fecha no disponible'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Flecha de mejora */}
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <ArrowRight className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-sm font-medium">
                              {student.cvEvolution.improvement.overallProgress > 0 ? (
                                <span className="text-green-600">+{student.cvEvolution.improvement.overallProgress}% mejora</span>
                              ) : (
                                <span className="text-gray-600">Sin mejora detectada</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CV Mejorado */}
                        {student.cvEvolution.improved && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">📄 CV Mejorado</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Score:</strong> {student.cvEvolution.improved.score ?? 'N/A'}%</p>
                              <p><strong>Errores:</strong> {student.cvEvolution.improved.errors ?? 0}</p>
                              <p><strong>Verbos:</strong> Nivel {student.cvEvolution.improved.verbLevel ?? 0}</p>
                              <p className="text-xs text-gray-500">
                                {student.cvEvolution.improved.uploadDate ? formatDate(student.cvEvolution.improved.uploadDate) : 'Fecha no disponible'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Métricas de mejora */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {student.cvEvolution.improvement?.scoreChange !== undefined && student.cvEvolution.improvement.scoreChange !== null ? 
                              (student.cvEvolution.improvement.scoreChange > 0 ? '+' : '') + student.cvEvolution.improvement.scoreChange + '%' : 
                              'N/A'
                            }
                          </div>
                          <div className="text-xs text-gray-600">Cambio en Score</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {student.cvEvolution.improvement?.errorReduction !== undefined && student.cvEvolution.improvement.errorReduction !== null ? 
                              '-' + student.cvEvolution.improvement.errorReduction : 
                              'N/A'
                            }
                          </div>
                          <div className="text-xs text-gray-600">Errores Reducidos</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {student.cvEvolution.improvement?.verbImprovement !== undefined && student.cvEvolution.improvement.verbImprovement !== null ? 
                              '+' + student.cvEvolution.improvement.verbImprovement : 
                              'N/A'
                            }
                          </div>
                          <div className="text-xs text-gray-600">Niveles de Verbos</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Progresión de Habilidades */}
                {student.skillsProgression && (
                  <Card>
                    <CardBody className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Progresión de Habilidades
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Habilidades Antes */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">🔹 Antes</h4>
                          <div className="space-y-1">
                            {student.skillsProgression.before.length > 0 ? (
                              student.skillsProgression.before.map((skill, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                  • {skill}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500 italic">Sin habilidades registradas</div>
                            )}
                          </div>
                        </div>

                        {/* Habilidades Después */}
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-700 dark:text-green-300 mb-3">🔹 Después</h4>
                          <div className="space-y-1">
                            {student.skillsProgression.after.length > 0 ? (
                              student.skillsProgression.after.map((skill, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                  • {skill}
                                  {student.skillsProgression?.added.includes(skill) && (
                                    <span className="ml-2 text-xs text-green-600 font-medium">NUEVO</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500 italic">Sin habilidades detectadas</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Habilidades agregadas destacadas */}
                      {student.skillsProgression.added.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                            ✨ Nuevas Habilidades Agregadas ({student.skillsProgression.added.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {student.skillsProgression.added.map((skill, index) => (
                              <Chip key={index} color="success" variant="flat" size="sm">
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Métricas de Impacto */}
                <Card>
                  <CardBody className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Métricas de Impacto
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Completitud del Perfil */}
                      <div className="space-y-3">
                        <h4 className="font-medium">📊 Completitud del Perfil</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Antes:</span>
                          <span className="font-medium">{student.impactMetrics.profileCompleteness.before}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Después:</span>
                          <span className="font-medium">{student.impactMetrics.profileCompleteness.after}%</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm font-medium">Mejora:</span>
                          <Chip 
                            color={student.impactMetrics.profileCompleteness.improvement > 0 ? 'success' : 'default'}
                            variant="flat"
                            size="sm"
                          >
                            {student.impactMetrics.profileCompleteness.improvement > 0 ? '+' : ''}{student.impactMetrics.profileCompleteness.improvement}%
                          </Chip>
                        </div>
                      </div>

                      {/* Patrón de Engagement */}
                      <div className="space-y-3">
                        <h4 className="font-medium">📈 Patrón de Engagement</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Semana 1:</span>
                            <span className="font-medium">{student.impactMetrics.engagementPattern.firstWeek} actividades</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Semana 2:</span>
                            <span className="font-medium">{student.impactMetrics.engagementPattern.secondWeek} actividades</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Semana 3:</span>
                            <span className="font-medium">{student.impactMetrics.engagementPattern.thirdWeek} actividades</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Semana 4:</span>
                            <span className="font-medium">{student.impactMetrics.engagementPattern.fourthWeek} actividades</span>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2">
                            <span className="text-sm font-medium">Tendencia:</span>
                            <div className="flex items-center gap-1">
                              {student.impactMetrics.engagementPattern.trend === 'increasing' ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : student.impactMetrics.engagementPattern.trend === 'decreasing' ? (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              ) : (
                                <BarChart3 className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-sm capitalize">{student.impactMetrics.engagementPattern.trend}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Tab de Timeline */}
            <Tab key="timeline" title={
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Timeline</span>
              </div>
            }>
              <div className="space-y-6 mt-6">
                <Card>
                  <CardBody className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      Timeline de Actividad
                    </h3>
                    
                    <div className="space-y-4">
                      {student.activityTimeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              event.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                              event.type === 'cv_upload' ? 'bg-green-100 text-green-600' :
                              event.type === 'analysis' ? 'bg-purple-100 text-purple-600' :
                              event.type === 'tool_use' ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {event.type === 'registration' ? <User className="w-4 h-4" /> :
                               event.type === 'cv_upload' ? <FileText className="w-4 h-4" /> :
                               event.type === 'analysis' ? <Award className="w-4 h-4" /> :
                               event.type === 'tool_use' ? <Target className="w-4 h-4" /> :
                               <Activity className="w-4 h-4" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {event.activity}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDate(event.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {event.details}
                            </p>
                            {event.impact && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                💡 {event.impact}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Tab de Análisis CV (existente mejorado) */}
            <Tab key="analysis" title={
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Análisis CV</span>
              </div>
            }>
              <div className="space-y-6 mt-6">
                {student.cvAnalysisResults && student.cvAnalysisResults.length > 0 ? (
                  <div className="space-y-4">
                    {student.cvAnalysisResults.map((result, index) => (
                      <Card key={index} className="border">
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{result.position}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(result.date)} - Estado: {result.status}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.score && (
                                <Chip 
                                  color={result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'danger'}
                                  variant="flat"
                                  size="sm"
                                >
                                  {result.score}%
                                </Chip>
                              )}
                            </div>
                          </div>

                          {/* Análisis Detallado */}
                          {result.fullResult && (
                            <div className="space-y-3">
                              {/* Análisis Principal */}
                              {result.fullResult.mainly_analysis && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                                    📊 Análisis Principal
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Estado:</strong> {result.fullResult.mainly_analysis.estado} 
                                    ({result.fullResult.mainly_analysis.porcentaje}%)
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                    {result.fullResult.mainly_analysis.analisis}
                                  </p>
                                </div>
                              )}

                              {/* Ajuste al Puesto */}
                              {result.fullResult.ajuste_puesto && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                                    🎯 Ajuste al Puesto
                                  </h4>
                                  <div className="grid grid-cols-1 gap-2 text-xs">
                                    {Object.entries(result.fullResult.ajuste_puesto).map(([key, value]: [string, any]) => (
                                      <div key={key} className="p-2 bg-white dark:bg-gray-700 rounded">
                                        <strong>{key.replace(/_/g, ' ')}:</strong> 
                                        <span className="ml-1">Nivel {value.nivel}</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">{value.accion}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Errores de Ortografía */}
                              {result.fullResult.spelling && result.fullResult.spelling.errores > 0 && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                  <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">
                                    ✏️ Ortografía
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {result.fullResult.spelling.errores} errores detectados
                                  </p>
                                  {result.fullResult.spelling.detalle_errores && (
                                    <div className="mt-2 text-xs space-y-1">
                                      {result.fullResult.spelling.detalle_errores.slice(0, 5).map((error: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                                          <span className="text-red-600">"{error.original}"</span>
                                          <ArrowRight className="w-3 h-3 text-gray-400" />
                                          <span className="text-green-600">"{error.sugerencia}"</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Verbos de Impacto */}
                              {result.fullResult.verbos_impact && (
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                                    💪 Verbos de Impacto
                                  </h4>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">Nivel:</span>
                                    <Chip 
                                      color={result.fullResult.verbos_impact.nivel >= 7 ? 'success' : 
                                             result.fullResult.verbos_impact.nivel >= 5 ? 'warning' : 'danger'}
                                      variant="flat"
                                      size="sm"
                                    >
                                      {result.fullResult.verbos_impact.nivel}/10
                                    </Chip>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {result.fullResult.verbos_impact.comentario}
                                  </p>
                                  {result.fullResult.verbos_impact.sugerencias && (
                                    <div className="mt-2 text-xs space-y-1">
                                      {result.fullResult.verbos_impact.sugerencias.slice(0, 3).map((sugerencia: string, i: number) => (
                                        <div key={i} className="p-2 bg-white dark:bg-gray-700 rounded text-gray-600">
                                          💡 {sugerencia}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay análisis de CV disponibles</p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              {onNavigate && canNavigate && (
                <>
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={() => onNavigate('prev')}
                    isDisabled={!canNavigate.prev}
                  >
                    ← Anterior
                  </Button>
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={() => onNavigate('next')}
                    isDisabled={!canNavigate.next}
                  >
                    Siguiente →
                  </Button>
                </>
              )}
            </div>
            <Button color="primary" onPress={onClose}>
              Cerrar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StudentDetailModal;
