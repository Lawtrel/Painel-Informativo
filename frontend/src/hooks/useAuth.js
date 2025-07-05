import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { User } from '../model/userModel.js';

export function useAuth() {
  const [user, setUser] = useState(User.createGuest());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        return result;
      } else if (result.expired) {
        setUser(User.createGuest());
        navigate('/login', { 
          state: { message: 'Sua sessão expirou por inatividade. Por favor, faça login novamente.' }
        });
        return result;
      } else {
        setUser(User.createGuest());
        navigate('/login');
        return result;
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(User.createGuest());
      navigate('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleSessionExpire = () => {
    setUser(User.createGuest());
    navigate('/login', { 
      state: { message: 'Sua sessão expirou por inatividade. Por favor, faça login novamente.' }
    });
  };

  useEffect(() => {
    let timeoutId;

    const checkAndSchedule = async () => {
      const result = await checkAuth();

      if (result?.remaining_time) {
        const buffer = 15 * 1000;
        const delay = result.remaining_time * 1000 - buffer;
        timeoutId = setTimeout(checkAndSchedule, Math.max(delay, 5000));
      } else {
        timeoutId = setTimeout(checkAndSchedule, 30000);
      }
    };

    checkAndSchedule();

    return () => clearTimeout(timeoutId);
  }, [checkAuth]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkAuth();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: user.isAuthenticated,
    remainingTime: user.getRemainingTime(),
    loading,
    error,
    login,
    logout,
    checkAuth,
    handleSessionExpire
  };
} 