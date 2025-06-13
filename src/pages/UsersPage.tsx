import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  Clock
} from 'lucide-react';
import { firebaseService } from '../services/adminFirebaseService';
import type { UserWithCredits } from '../services/adminFirebaseService';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithCredits[]>([]);

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

  const UserCard = ({ user }: { user: UserWithCredits }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user.displayName || 'Usuario Anónimo'}
                </h3>
                {user.disabled && (
                  <Chip size="sm" color="danger" variant="flat">
                    Deshabilitado
                  </Chip>
                )}
                {user.customClaims?.role === 'admin' && (
                  <Chip size="sm" color="warning" variant="flat">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Chip>
                )}
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>Registro: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => console.log('Ver detalles:', user.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Información de créditos */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Créditos</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                {user.creditAccount?.credits || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Ganados</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {user.creditAccount?.totalEarned || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Gastados</p>
              <p className="font-semibold text-orange-600 dark:text-orange-400">
                {user.creditAccount?.totalSpent || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Transacciones</p>
              <p className="font-semibold text-purple-600 dark:text-purple-400">
                {user.totalTransactions}
              </p>
            </div>
          </div>
        </div>
        
        {/* Actividad de servicios */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Análisis CV</p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                {user.totalCVAnalysis}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Job Matches</p>
              <p className="font-semibold text-teal-600 dark:text-teal-400">
                {user.totalJobMatches}
              </p>
            </div>
          </div>
        </div>
        
        {/* Última transacción */}
        {user.lastTransaction && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Última actividad:</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {formatDate(user.lastTransaction.createdAt)}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <Chip 
                size="sm" 
                color={user.lastTransaction.type === 'purchase' ? 'success' : 'primary'}
                variant="flat"
              >
                {user.lastTransaction.description}
              </Chip>
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
              startContent={<Filter className="w-4 h-4" />}
            >
              Filtros
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

      {/* Lista de usuarios */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
      
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron usuarios que coincidan con la búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
