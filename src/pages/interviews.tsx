import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Pagination } from "@heroui/pagination";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  Star,
  User,
  Briefcase
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { mockInterviews } from "@/data/mockData";
import type { Interview } from "@/types/admin";

const statusColorMap = {
  scheduled: "primary",
  completed: "success",
  cancelled: "danger",
  "no-show": "warning",
} as const;

export default function InterviewsPage() {
  const [interviews] = useState<Interview[]>(mockInterviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter interviews based on search and filters
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterviews = filteredInterviews.slice(startIndex, endIndex);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const renderScore = (score?: number) => {
    if (!score) return '-';
    
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-success-600';
      if (score >= 60) return 'text-warning-600';
      return 'text-danger-600';
    };

    return (
      <div className={`flex items-center gap-1 ${getScoreColor(score)}`}>
        <Star size={14} />
        <span className="font-semibold">{score}</span>
      </div>
    );
  };

  const renderActions = (_interview: Interview) => (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Interview actions">
        <DropdownItem key="view" startContent={<Eye size={16} />}>
          Ver detalles
        </DropdownItem>
        <DropdownItem key="edit" startContent={<Edit size={16} />}>
          Editar entrevista
        </DropdownItem>
        <DropdownItem 
          key="delete" 
          color="danger" 
          startContent={<Trash2 size={16} />}
        >
          Cancelar entrevista
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entrevistas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las entrevistas de la plataforma
          </p>
        </div>
        <Button 
          color="primary" 
          startContent={<CalendarIcon size={18} />}
        >
          Programar Entrevista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-primary">{interviews.length}</p>
            <p className="text-sm text-gray-600">Total Entrevistas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {interviews.filter(i => i.status === 'scheduled').length}
            </p>
            <p className="text-sm text-gray-600">Programadas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-success">
              {interviews.filter(i => i.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {interviews.filter(i => i.status === 'completed' && i.score).length > 0 
                ? Math.round(
                    interviews
                      .filter(i => i.status === 'completed' && i.score)
                      .reduce((acc, i) => acc + (i.score || 0), 0) /
                    interviews.filter(i => i.status === 'completed' && i.score).length
                  )
                : 0
              }
            </p>
            <p className="text-sm text-gray-600">Puntuación Media</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar entrevistas..."
              startContent={<Search size={18} />}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex-1"
            />
            <Select
              placeholder="Estado"
              startContent={<Filter size={18} />}
              selectedKeys={statusFilter === "all" ? [] : [statusFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setStatusFilter(selected || "all");
              }}
              className="w-full sm:w-48"
            >
              <SelectItem key="all">Todos los estados</SelectItem>
              <SelectItem key="scheduled">Programada</SelectItem>
              <SelectItem key="completed">Completada</SelectItem>
              <SelectItem key="cancelled">Cancelada</SelectItem>
              <SelectItem key="no-show">No se presentó</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Interviews Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Lista de Entrevistas ({filteredInterviews.length})
          </h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Interviews table">
            <TableHeader>
              <TableColumn>CANDIDATO</TableColumn>
              <TableColumn>EMPLEO</TableColumn>
              <TableColumn>FECHA Y HORA</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>DURACIÓN</TableColumn>
              <TableColumn>PUNTUACIÓN</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {currentInterviews.map((interview) => {
                const dateTime = formatDateTime(interview.scheduledAt);
                return (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={interview.candidateName}
                          size="sm"
                          showFallback
                        />
                        <div>
                          <p className="font-medium">{interview.candidateName}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <User size={12} />
                            ID: {interview.candidateId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{interview.jobTitle}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Briefcase size={12} />
                          Job ID: {interview.jobId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon size={12} className="text-gray-400" />
                          {dateTime.date}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={12} />
                          {dateTime.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={statusColorMap[interview.status]}
                        variant="flat"
                        size="sm"
                      >
                        {interview.status === 'scheduled' ? 'Programada' : 
                         interview.status === 'completed' ? 'Completada' : 
                         interview.status === 'cancelled' ? 'Cancelada' : 'No se presentó'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {interview.duration ? (
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          <span>{interview.duration} min</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {renderScore(interview.score)}
                    </TableCell>
                    <TableCell>
                      {renderActions(interview)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={(page) => setCurrentPage(page)}
                showControls
                showShadow
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Feedback Section for Completed Interviews */}
      {interviews.filter(i => i.status === 'completed' && i.feedback).length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Comentarios Recientes</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {interviews
                .filter(i => i.status === 'completed' && i.feedback)
                .slice(0, 3)
                .map((interview) => (
                  <div key={interview.id} className="border-l-4 border-success-300 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{interview.candidateName}</p>
                      <div className="flex items-center gap-2">
                        {renderScore(interview.score)}
                        <span className="text-sm text-gray-500">
                          {interview.jobTitle}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{interview.feedback}</p>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
