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
  DollarSign,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  Gift
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { mockTransactions } from "@/data/mockData";
import type { Transaction } from "@/types/admin";

const statusColorMap = {
  completed: "success",
  pending: "warning",
  failed: "danger",
} as const;

const typeColorMap = {
  purchase: "primary",
  refund: "danger",
  bonus: "success",
} as const;

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.status === 'completed' && t.type === 'purchase')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp size={14} className="text-primary" />;
      case 'refund':
        return <TrendingDown size={14} className="text-danger" />;
      case 'bonus':
        return <Gift size={14} className="text-success" />;
      default:
        return <DollarSign size={14} className="text-gray-400" />;
    }
  };
  const renderActions = (transaction: Transaction) => {
    const menuItems = [
      <DropdownItem key="view" startContent={<Eye size={16} />}>
        Ver detalles
      </DropdownItem>,
      <DropdownItem key="edit" startContent={<Edit size={16} />}>
        Editar estado
      </DropdownItem>
    ];

    if (transaction.status === 'pending') {
      menuItems.push(
        <DropdownItem key="approve" color="success">
          Aprobar transacción
        </DropdownItem>
      );
    }

    menuItems.push(
      <DropdownItem 
        key="delete" 
        color="danger" 
        startContent={<Trash2 size={16} />}
      >
        Cancelar transacción
      </DropdownItem>
    );

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light" size="sm">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Transaction actions">
          {menuItems}
        </DropdownMenu>
      </Dropdown>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las transacciones financieras de la plataforma
          </p>
        </div>
        <Button 
          color="primary" 
          startContent={<Plus size={18} />}
        >
          Nueva Transacción
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-primary">{transactions.length}</p>
            <p className="text-sm text-gray-600">Total Transacciones</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-success">
              €{totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Ingresos Completados</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-warning">
              €{pendingAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {transactions.reduce((acc, t) => acc + t.credits, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Créditos Totales</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar transacciones..."
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
              <SelectItem key="completed">Completada</SelectItem>
              <SelectItem key="pending">Pendiente</SelectItem>
              <SelectItem key="failed">Fallida</SelectItem>
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
              <SelectItem key="purchase">Compra</SelectItem>
              <SelectItem key="refund">Reembolso</SelectItem>
              <SelectItem key="bonus">Bonificación</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Lista de Transacciones ({filteredTransactions.length})
          </h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Transactions table">
            <TableHeader>
              <TableColumn>USUARIO</TableColumn>
              <TableColumn>TIPO</TableColumn>
              <TableColumn>MONTO</TableColumn>
              <TableColumn>CRÉDITOS</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>MÉTODO PAGO</TableColumn>
              <TableColumn>FECHA</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {currentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={transaction.userName}
                        size="sm"
                        showFallback
                      />
                      <div>
                        <p className="font-medium">{transaction.userName}</p>
                        <p className="text-sm text-gray-500">ID: {transaction.userId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderTypeIcon(transaction.type)}
                      <Chip
                        color={typeColorMap[transaction.type]}
                        variant="flat"
                        size="sm"
                      >
                        {transaction.type === 'purchase' ? 'Compra' : 
                         transaction.type === 'refund' ? 'Reembolso' : 'Bonificación'}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="font-semibold">
                        €{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard size={14} className="text-gray-400" />
                      <span className="font-medium">{transaction.credits}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[transaction.status]}
                      variant="flat"
                      size="sm"
                    >
                      {transaction.status === 'completed' ? 'Completada' : 
                       transaction.status === 'pending' ? 'Pendiente' : 'Fallida'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {transaction.paymentMethod || 'No especificado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar size={12} className="text-gray-400" />
                      {formatDate(transaction.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderActions(transaction)}
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {transactions
                .filter(t => t.status === 'completed')
                .slice(0, 5)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {renderTypeIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">{transaction.userName}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.type === 'purchase' ? 'Compra' : 
                           transaction.type === 'refund' ? 'Reembolso' : 'Bonificación'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">€{transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{transaction.credits} créditos</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Pendientes de Aprobación</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {transactions
                .filter(t => t.status === 'pending')
                .slice(0, 5)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-warning-600" />
                      <div>
                        <p className="font-medium text-sm">{transaction.userName}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.paymentMethod || 'Método no especificado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">€{transaction.amount.toFixed(2)}</p>
                      <Button size="sm" color="warning" variant="flat">
                        Revisar
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
