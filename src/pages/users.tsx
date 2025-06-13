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
  UserPlus, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { mockUsers } from "@/data/mockData";
import type { User } from "@/types/admin";

const statusColorMap = {
  active: "success",
  inactive: "warning",
  suspended: "danger",
} as const;

const roleColorMap = {
  admin: "primary",
  recruiter: "secondary",
  student: "default",
} as const;

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderActions = (_user: User) => (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User actions">
        <DropdownItem key="view" startContent={<Eye size={16} />}>
          Ver detalles
        </DropdownItem>
        <DropdownItem key="edit" startContent={<Edit size={16} />}>
          Editar usuario
        </DropdownItem>
        <DropdownItem 
          key="delete" 
          color="danger" 
          startContent={<Trash2 size={16} />}
        >
          Eliminar usuario
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los usuarios de la plataforma
          </p>
        </div>
        <Button 
          color="primary" 
          startContent={<UserPlus size={18} />}
        >
          Añadir Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-primary">{users.length}</p>
            <p className="text-sm text-gray-600">Total Usuarios</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-success">
              {users.filter(u => u.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Activos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {users.filter(u => u.role === 'recruiter').length}
            </p>
            <p className="text-sm text-gray-600">Reclutadores</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-default">
              {users.filter(u => u.role === 'student').length}
            </p>
            <p className="text-sm text-gray-600">Estudiantes</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar usuarios..."
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
              <SelectItem key="inactive">Inactivo</SelectItem>
              <SelectItem key="suspended">Suspendido</SelectItem>
            </Select>
            <Select
              placeholder="Rol"
              selectedKeys={roleFilter === "all" ? [] : [roleFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setRoleFilter(selected || "all");
              }}
              className="w-full sm:w-48"
            >
              <SelectItem key="all">Todos los roles</SelectItem>
              <SelectItem key="student">Estudiante</SelectItem>
              <SelectItem key="recruiter">Reclutador</SelectItem>
              <SelectItem key="admin">Administrador</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Lista de Usuarios ({filteredUsers.length})
          </h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>USUARIO</TableColumn>
              <TableColumn>ROL</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>CRÉDITOS</TableColumn>
              <TableColumn>REGISTRO</TableColumn>
              <TableColumn>ÚLTIMO ACCESO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatar}
                        name={user.name}
                        size="sm"
                        showFallback
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={roleColorMap[user.role]}
                      variant="flat"
                      size="sm"
                    >
                      {user.role === 'student' ? 'Estudiante' : 
                       user.role === 'recruiter' ? 'Reclutador' : 'Admin'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[user.status]}
                      variant="flat"
                      size="sm"
                    >
                      {user.status === 'active' ? 'Activo' : 
                       user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.credits}</span>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.registrationDate)}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    {renderActions(user)}
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
