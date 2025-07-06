import { createContext } from 'react';
import { useAuth } from '../hooks/useAuth.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useAuth();
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export { AuthContext }; 