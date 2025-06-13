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
import { Pagination } from "@heroui/pagination";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Users
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { mockJobs } from "@/data/mockData";
import type { Job } from "@/types/admin";

const statusColorMap = {
  active: "success",
  closed: "danger",
  draft: "warning",
} as const;

const typeColorMap = {
  "full-time": "primary",
  "part-time": "secondary",
  "contract": "warning",
  "internship": "default",
} as const;

export default function JobsPage() {
  const [jobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderActions = (_job: Job) => (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Job actions">
        <DropdownItem key="view" startContent={<Eye size={16} />}>
          Ver detalles
        </DropdownItem>
        <DropdownItem key="edit" startContent={<Edit size={16} />}>
          Editar empleo
        </DropdownItem>
        <DropdownItem 
          key="delete" 
          color="danger" 
          startContent={<Trash2 size={16} />}
        >
          Eliminar empleo
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empleos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las ofertas de empleo de la plataforma
          </p>
        </div>
        <Button 
          color="primary" 
          startContent={<Plus size={18} />}
        >
          Crear Empleo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-primary">{jobs.length}</p>
            <p className="text-sm text-gray-600">Total Empleos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-success">
              {jobs.filter(j => j.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Activos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-warning">
              {jobs.filter(j => j.status === 'draft').length}
            </p>
            <p className="text-sm text-gray-600">Borradores</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {jobs.reduce((acc, job) => acc + job.applications, 0)}
            </p>
            <p className="text-sm text-gray-600">Aplicaciones</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar empleos..."
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
              <SelectItem key="active">Activo</SelectItem>
              <SelectItem key="closed">Cerrado</SelectItem>
              <SelectItem key="draft">Borrador</SelectItem>
            </Select>
            <Select
              placeholder="Tipo"
              selectedKeys={typeFilter === "all" ? [] : [typeFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setTypeFilter(selected || "all");
              }}
              className="w-full sm:w-48"
            >
              <SelectItem key="all">Todos los tipos</SelectItem>
              <SelectItem key="full-time">Tiempo completo</SelectItem>
              <SelectItem key="part-time">Tiempo parcial</SelectItem>
              <SelectItem key="contract">Contrato</SelectItem>
              <SelectItem key="internship">Prácticas</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Lista de Empleos ({filteredJobs.length})
          </h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Jobs table">
            <TableHeader>
              <TableColumn>EMPLEO</TableColumn>
              <TableColumn>EMPRESA</TableColumn>
              <TableColumn>TIPO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>APLICACIONES</TableColumn>
              <TableColumn>SALARIO</TableColumn>
              <TableColumn>CREADO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {currentJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={typeColorMap[job.type]}
                      variant="flat"
                      size="sm"
                    >
                      {job.type === 'full-time' ? 'T. Completo' : 
                       job.type === 'part-time' ? 'T. Parcial' : 
                       job.type === 'contract' ? 'Contrato' : 'Prácticas'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[job.status]}
                      variant="flat"
                      size="sm"
                    >
                      {job.status === 'active' ? 'Activo' : 
                       job.status === 'closed' ? 'Cerrado' : 'Borrador'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      <span className="font-medium">{job.applications}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{job.salary || 'No especificado'}</span>
                  </TableCell>
                  <TableCell>
                    {formatDate(job.createdAt)}
                  </TableCell>
                  <TableCell>
                    {renderActions(job)}
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
