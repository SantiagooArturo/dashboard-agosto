import React, { useState, useEffect } from 'react';
import { HeroUIProvider } from '@heroui/system';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionsPage';
import CVAnalysisPage from './pages/CVAnalysisPage';
import FirebaseAnalysisPage from './pages/FirebaseAnalysisPage';
import ActivationAnalyticsPage from './pages/ActivationAnalyticsPage';
import EngagementAnalyticsPage from './pages/EngagementAnalyticsPage';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityReportsPage from './pages/UniversityReportsPage';
import Dashboard2Page from './pages/Dashboard2Page';
import MonetizationAnalyticsPage from './pages/MonetizationAnalyticsPage';
import AIChatPage from './pages/AIChatPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { 
  Home, 
  Users, 
  CreditCard, 
  FileText,
  Database,
  TrendingUp,
  Heart,
  GraduationCap,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  MessageCircle
} from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';

type Page = 'dashboard' | 'dashboard2' | 'users' | 'transactions' | 'cv-analysis' | 'firebase-analysis' | 'activation-analytics' | 'universities-analytics' | 'university-reports' | 'engagement-analytics' | 'monetization-analytics' | 'ai-chat' | 'jobs';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    setIsAuthenticated(authStatus === 'true');
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    // { id: 'dashboard2', label: 'Dashboard 2', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'transactions', label: 'Transacciones', icon: CreditCard },
    { id: 'cv-analysis', label: 'Análisis CV', icon: FileText },
    { id: 'firebase-analysis', label: 'Firebase DB', icon: Database },
    { id: 'activation-analytics', label: 'Analytics: Activación', icon: TrendingUp },
    { id: 'universities-analytics', label: 'Universidades', icon: GraduationCap },
    { id: 'university-reports', label: 'REPORTES UNI', icon: BarChart3 },
    { id: 'engagement-analytics', label: 'Analytics: Engagement', icon: Heart },
    { id: 'ai-chat', label: 'Chat AI', icon: MessageCircle },
    // { id: 'monetization-analytics', label: 'Analytics: Monetización', icon: DollarSign },
    // { id: 'jobs', label: 'Empleos', icon: Briefcase },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'dashboard2':
        return <Dashboard2Page />;
      case 'users':
        return <UsersPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'cv-analysis':
        return <CVAnalysisPage />;
      case 'firebase-analysis':
        return <FirebaseAnalysisPage />;
      case 'activation-analytics':
        return <ActivationAnalyticsPage />;
      case 'universities-analytics':
        return <UniversitiesPage />;
      case 'university-reports':
        return <UniversityReportsPage />;
      case 'engagement-analytics':
        return <EngagementAnalyticsPage />;
      case 'monetization-analytics':
        return <MonetizationAnalyticsPage />;
      case 'ai-chat':
        return <AIChatPage />;
      // case 'jobs':
      //   return (
      //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      //       <div className="text-center py-20">
      //         <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      //         <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 mb-2">
      //           Gestión de Empleos
      //         </h2>
      //         <p className="text-gray-800 dark:text-gray-700">
      //           Esta página estará disponible próximamente
      //         </p>
      //       </div>
      //     </div>
      //   );
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div>
              <img src='/MyWorkIn-web.png' alt="MyWorkIn Logo" className="h-10 w-auto" />
              <p className="text-sm text-center text-gray-800 dark:text-gray-700">
                Panel Admin
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 mb-1 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info y controles */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                  Admin
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-600">
                  admin@myworkin.com
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <AppContent />
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default App;
