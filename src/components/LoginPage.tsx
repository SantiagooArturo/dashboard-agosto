import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');  const [isEmailValid, setIsEmailValid] = useState(false);
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
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-500 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="flex flex-col mx-auto items-center space-y-4">
            {/* Logo */}
            <div className="p-2 rounded-xl flex items-center justify-center">
              <img 
                src="/MyWorkIn-web.png" 
                alt="MyWorkIn Logo" 
                className="w-full h-10 object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<span class="text-white font-bold text-lg">MW</span>';
                }}
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-gray-600 dark:text-gray-400 text-xl font-bold">
                Panel de Administración
              </h1>
            </div>
          </div>
        </CardHeader>        <CardBody className="px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@myworkin.com"
              value={email}
              onChange={handleEmailChange}
              required
              variant="bordered"
              endContent={
                email && isEmailValid && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )
              }
            />
            
            <Input
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={handlePasswordChange}
              required
              variant="bordered"
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
              disabled={!email || !password}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            {/* Credenciales de prueba */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Credenciales de prueba:
              </p>
              <div className="space-y-1 text-xs">
                <p className="font-mono">📧 admin@myworkin.com</p>
                <p className="font-mono">🔐 admin123456</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="flat"
                className="w-full mt-2"
                onClick={fillCredentials}
              >
                Usar credenciales
              </Button>
            </div>
          </form>
        </CardBody>      </Card>
    </div>
  );
};

export default LoginPage;
