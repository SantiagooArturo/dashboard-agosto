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
  Plus, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  User,
  Calendar
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { mockCVs } from "@/data/mockData";
import type { CV } from "@/types/admin";

const statusColorMap = {
  active: "success",
  pending: "warning",
  rejected: "danger",
} as const;

export default function CVsPage() {
  const [cvs] = useState<CV[]>(mockCVs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter CVs based on search and filters
  const filteredCVs = cvs.filter(cv => {
    const matchesSearch = cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cv.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCVs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCVs = filteredCVs.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderActions = (_cv: CV) => (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="CV actions">
        <DropdownItem key="view" startContent={<Eye size={16} />}>
          Ver CV
        </DropdownItem>
        <DropdownItem key="download" startContent={<Download size={16} />}>
          Descargar PDF
        </DropdownItem>
        <DropdownItem key="edit" startContent={<Edit size={16} />}>
          Editar estado
        </DropdownItem>
        <DropdownItem 
          key="delete" 
          color="danger" 
          startContent={<Trash2 size={16} />}
        >
          Eliminar CV
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CVs</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los currículums de la plataforma
          </p>
        </div>
        <Button 
          color="primary" 
          startContent={<Plus size={18} />}
        >
          Crear CV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-primary">{cvs.length}</p>
            <p className="text-sm text-gray-600">Total CVs</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-success">
              {cvs.filter(cv => cv.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Activos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-warning">
              {cvs.filter(cv => cv.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {cvs.reduce((acc, cv) => acc + cv.views, 0)}
            </p>
            <p className="text-sm text-gray-600">Visualizaciones</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar CVs..."
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
              <SelectItem key="pending">Pendiente</SelectItem>
              <SelectItem key="rejected">Rechazado</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* CVs Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Lista de CVs ({filteredCVs.length})
          </h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="CVs table">
            <TableHeader>
              <TableColumn>CV</TableColumn>
              <TableColumn>USUARIO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>VISUALIZACIONES</TableColumn>
              <TableColumn>DESCARGAS</TableColumn>
              <TableColumn>CREADO</TableColumn>
              <TableColumn>ACTUALIZADO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {currentCVs.map((cv) => (
                <TableRow key={cv.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cv.title}</p>
                      <p className="text-sm text-gray-500">ID: {cv.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={cv.userName}
                        size="sm"
                        showFallback
                      />
                      <div>
                        <p className="font-medium">{cv.userName}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User size={12} />
                          Usuario ID: {cv.userId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[cv.status]}
                      variant="flat"
                      size="sm"
                    >
                      {cv.status === 'active' ? 'Activo' : 
                       cv.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye size={14} className="text-gray-400" />
                      <span className="font-medium">{cv.views}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download size={14} className="text-gray-400" />
                      <span className="font-medium">{cv.downloads}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar size={12} className="text-gray-400" />
                      {formatDate(cv.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar size={12} className="text-gray-400" />
                      {formatDate(cv.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderActions(cv)}
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
