import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { 
  CreditCard, 
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar
} from 'lucide-react';
import { firebaseService } from '../services/adminFirebaseService';
import type { CreditTransactionData } from '../services/adminFirebaseService';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<CreditTransactionData[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('💳 Cargando transacciones...');
      const transactionsData = await firebaseService.getCreditTransactions(200);
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      console.log('✅ Transacciones cargadas:', transactionsData.length);
    } catch (error) {
      console.error('❌ Error cargando transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;
    
    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, selectedType, transactions]);

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'spend':
      case 'confirm':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'bonus':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'reserve':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'revert':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusChip = (status?: string) => {
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
            Pendiente
          </Chip>
        );
      case 'reverted':
        return (
          <Chip size="sm" color="danger" variant="flat">
            <XCircle className="w-3 h-3 mr-1" />
            Revertido
          </Chip>
        );
      case 'confirmed':
        return (
          <Chip size="sm" color="primary" variant="flat">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmado
          </Chip>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'purchase': 'Compra',
      'spend': 'Gasto',
      'bonus': 'Bono',
      'refund': 'Reembolso',
      'reserve': 'Reserva',
      'confirm': 'Confirmación',
      'revert': 'Reversión'
    };
    return labels[type] || type;
  };

  const getToolLabel = (tool?: string) => {
    const labels: Record<string, string> = {
      'cv-review': 'Análisis CV',
      'cv-creation': 'Creación CV',
      'job-match': 'Job Match',
      'interview-simulation': 'Entrevista Simulada'
    };
    return tool ? labels[tool] || tool : 'N/A';
  };

  // Estadísticas
  const totalRevenue = transactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.paymentAmount || 0), 0);

  const totalCreditsDistributed = transactions
    .filter(t => t.type === 'purchase' || t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCreditsSpent = transactions
    .filter(t => t.type === 'spend' || t.type === 'confirm')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  const TransactionCard = ({ transaction }: { transaction: CreditTransactionData }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getTransactionIcon(transaction.type)}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getTypeLabel(transaction.type)}
                </h3>
                {transaction.status && getStatusChip(transaction.status)}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {transaction.description}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(transaction.createdAt)}</span>
                </div>
                {transaction.tool && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{getToolLabel(transaction.tool)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold ${
              transaction.type === 'purchase' || transaction.type === 'bonus' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {transaction.type === 'purchase' || transaction.type === 'bonus' ? '+' : '-'}
              {transaction.amount} créditos
            </div>
            
            {transaction.paymentAmount && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ${transaction.paymentAmount.toFixed(2)}
              </div>
            )}
            
            {transaction.paymentId && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                ID: {transaction.paymentId.slice(-8)}
              </div>
            )}
          </div>
        </div>
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
              Transacciones de Créditos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Historial completo de todas las transacciones
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="bordered"
              startContent={<Download className="w-4 h-4" />}
              onClick={() => console.log('Exportar transacciones')}
            >
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros y búsqueda */}
        <div className="flex items-center space-x-4">
          <div className="max-w-md flex-1">
            <Input
              placeholder="Buscar por descripción, usuario o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              variant="bordered"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="purchase">Compras</option>
            <option value="spend">Gastos</option>
            <option value="bonus">Bonos</option>
            <option value="reserve">Reservas</option>
            <option value="confirm">Confirmaciones</option>
            <option value="revert">Reversiones</option>
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ingresos Totales
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalCreditsDistributed.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Créditos Distribuidos
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalCreditsSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Créditos Consumidos
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {pendingTransactions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pendientes
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Lista de transacciones */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
      
      {filteredTransactions.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron transacciones que coincidan con los filtros.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
