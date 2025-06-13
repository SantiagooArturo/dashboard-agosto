import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Pagination } from '@heroui/pagination';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/modal';
import { 
  Mail, 
  Calendar, 
  CreditCard, 
  Search,
  Download,
  Eye,
  Shield,
  UserPlus
} from 'lucide-react';
import { firebaseService } from '../services/adminFirebaseService';
import type { UserWithCredits } from '../services/adminFirebaseService';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithCredits[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithCredits | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 Cargando usuarios...');
      const usersData = await firebaseService.getUsersWithCredits(100);
      setUsers(usersData);
      setFilteredUsers(usersData);
      console.log('✅ Usuarios cargados:', usersData.length);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES');
    } catch {
      return 'N/A';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);  const renderActions = (user: UserWithCredits) => (
    <Button
      size="sm"
      variant="flat"
      color="primary"
      startContent={<Eye size={16} />}
      onClick={() => {
        setSelectedUser(user);
        onOpen();
      }}
    >
      Ver detalles
    </Button>
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra usuarios y sus cuentas de créditos
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="bordered"
              startContent={<Download className="w-4 h-4" />}
              onClick={() => console.log('Exportar usuarios')}
            >
              Exportar
            </Button>
            <Button
              color="primary"
              startContent={<UserPlus className="w-4 h-4" />}
            >
              Añadir Usuario
            </Button>
          </div>
        </div>
        
        {/* Búsqueda */}
        <div className="max-w-md">
          <Input
            placeholder="Buscar por email o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            variant="bordered"
          />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Usuarios
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {users.filter(u => u.creditAccount && u.creditAccount.credits > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Con Créditos
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {users.reduce((sum, u) => sum + u.totalTransactions, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Transacciones
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {users.filter(u => u.disabled).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Deshabilitados
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Lista de Usuarios ({filteredUsers.length})
          </h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>USUARIO</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>REGISTRO</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.photoURL}
                            name={user.displayName || 'Usuario'}
                            size="sm"
                            showFallback
                          />
                          <div>
                            <p className="font-medium">
                              {user.displayName || 'Usuario Anónimo'}
                            </p>
                            <div className="flex items-center gap-1">
                              {user.customClaims?.role === 'admin' && (
                                <Chip size="sm" color="warning" variant="flat">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </Chip>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={user.disabled ? 'danger' : 'success'}
                          variant="flat"
                          size="sm"
                        >
                          {user.disabled ? 'Deshabilitado' : 'Activo'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderActions(user)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    color="primary"
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
        {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron usuarios que coincidan con la búsqueda.
          </p>
        </div>
      )}

      {/* Modal de detalles del usuario */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Avatar
                src={selectedUser?.photoURL}
                name={selectedUser?.displayName || 'Usuario'}
                size="md"
                showFallback
              />
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedUser?.displayName || 'Usuario Anónimo'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUser?.email}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-6">
                {/* Información básica */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Información Básica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</label>
                      <div className="mt-1">
                        <Chip
                          color={selectedUser.disabled ? 'danger' : 'success'}
                          variant="flat"
                          size="sm"
                        >
                          {selectedUser.disabled ? 'Deshabilitado' : 'Activo'}
                        </Chip>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Registro</label>
                      <p className="mt-1 font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">UID</label>
                      <p className="mt-1 font-mono text-xs">{selectedUser.id}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Rol</label>
                      <div className="mt-1">
                        {selectedUser.customClaims?.role === 'admin' ? (
                          <Chip size="sm" color="warning" variant="flat">
                            <Shield className="w-3 h-3 mr-1" />
                            Administrador
                          </Chip>
                        ) : (
                          <Chip size="sm" color="primary" variant="flat">
                            Usuario
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de créditos */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Información de Créditos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Créditos Actuales</label>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedUser.creditAccount?.credits || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <label className="text-sm font-medium text-green-700 dark:text-green-300">Total Ganados</label>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedUser.creditAccount?.totalEarned || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <label className="text-sm font-medium text-red-700 dark:text-red-300">Total Gastados</label>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {selectedUser.creditAccount?.totalSpent || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de uso */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Estadísticas de Uso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Transacciones</label>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedUser.totalTransactions}
                      </p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <label className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Análisis de CV</label>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedUser.totalCVAnalysis}
                      </p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                      <label className="text-sm font-medium text-teal-700 dark:text-teal-300">Job Matches</label>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {selectedUser.totalJobMatches}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Última transacción */}
                {selectedUser.lastTransaction && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Última Transacción</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Chip 
                            size="sm" 
                            color={selectedUser.lastTransaction.type === 'purchase' ? 'success' : 'primary'}
                            variant="flat"
                          >
                            {selectedUser.lastTransaction.description}
                          </Chip>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedUser.lastTransaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              variant="light" 
              onClick={onClose}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UsersPage;
