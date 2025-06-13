import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Eye, EyeOff, Shield, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showCredentials, setShowCredentials] = useState(true);
  // Credenciales hardcodeadas para el admin
  const ADMIN_CREDENTIALS = {
    email: 'admin@myworkin.com',
    password: 'admin123456'
  };

  // Validar email en tiempo real
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
    if (error) setError(''); // Limpiar error al escribir
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(''); // Limpiar error al escribir
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones antes de enviar
    if (!validateEmail(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminUser', JSON.stringify({
        email: ADMIN_CREDENTIALS.email,
        name: 'Administrador MyWorkIn',
        role: 'admin'
      }));
      
      // Animación de éxito antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin();
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    }

    setLoading(false);
  };

  const fillCredentials = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setIsEmailValid(true);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-0 relative z-10 transform transition-all duration-300 hover:scale-[1.02] fade-in-up card-hover">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo mejorado */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:rotate-3">
                <img 
                  src="/MyWorkIn-web.png" 
                  alt="MyWorkIn Logo" 
                  className="w-12 h-12 object-contain filter brightness-0 invert"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="text-white font-bold text-xl">MW</span>';
                  }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                MyWorkIn Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                Panel de Administración Seguro
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                label="Email Administrativo"
                placeholder="admin@myworkin.com"
                value={email}
                onChange={handleEmailChange}
                required
                variant="bordered"
                className="w-full"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500 transition-colors duration-200",
                }}
                endContent={
                  email && isEmailValid && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )
                }
              />
              
              <Input
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="Ingresa tu contraseña segura"
                value={password}
                onChange={handlePasswordChange}
                required
                variant="bordered"
                className="w-full"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500 transition-colors duration-200",
                }}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                }
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              isLoading={loading}
              size="lg"
              disabled={!email || !password}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando credenciales...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Acceder al Panel</span>
                </span>
              )}
            </Button>

            {/* Credenciales de prueba mejoradas */}
            {showCredentials && (
              <div className="relative">
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Credenciales de Desarrollo:
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCredentials(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      📧 admin@myworkin.com
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      🔐 admin123456
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="w-full mt-3 text-xs"
                    onClick={fillCredentials}
                  >
                    Usar credenciales de prueba
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Indicador de seguridad */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <Shield className="w-4 h-4" />
        <span>Conexión segura SSL</span>
      </div>
    </div>
  );
};

export default LoginPage;
