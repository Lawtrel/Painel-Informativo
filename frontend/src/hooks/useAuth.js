import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { User } from '../model/userModel.js';

export function useAuth() {
  const [user, setUser] = useState(User.createGuest());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const navigate = useNavigate();

  const login = async (username, password) => {
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        setUser(result.user);
        navigate('/dashboard');
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch {
      const message = 'Erro ao conectar com o servidor';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(User.createGuest());
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setUser(User.createGuest());
      navigate('/login');
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const result = await authService.checkAuth();
      
      if (result.success) {
        setUser(result.user);
        setShowExpiredModal(false);
      } else if (result.expired) {
        setUser(User.createGuest());
        setShowExpiredModal(true);
      } else {
        setUser(User.createGuest());
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(User.createGuest());
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleSessionExpire = () => {
    setShowExpiredModal(true);
  };

  useEffect(() => {
    checkAuth();
    
    // Verificar autenticação a cada 30 segundos
    const interval = setInterval(checkAuth, 30000);
    
    return () => clearInterval(interval);
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: user.isAuthenticated,
    remainingTime: user.getRemainingTime(),
    loading,
    error,
    showExpiredModal,
    login,
    logout,
    checkAuth,
    handleSessionExpire
  };
} 