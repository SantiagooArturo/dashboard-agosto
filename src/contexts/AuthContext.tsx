import React, { createContext, useContext, useState, ReactNode } from 'react';

// Credenciales hardcodeadas para admin
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  name: 'Administrador',
  email: 'admin@worky.com'
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: typeof ADMIN_CREDENTIALS | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('admin_auth') === 'true'
  );
  const [user, setUser] = useState<typeof ADMIN_CREDENTIALS | null>(
    localStorage.getItem('admin_auth') === 'true' ? ADMIN_CREDENTIALS : null
  );

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setUser(ADMIN_CREDENTIALS);
      localStorage.setItem('admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('admin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
