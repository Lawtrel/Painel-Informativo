import { useState, useEffect } from 'react';

function SessionTimer({ remainingTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(remainingTime || 0);

  useEffect(() => {
    setTimeLeft(remainingTime || 0);
  }, [remainingTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (!timeLeft || timeLeft <= 0) return 'text-red-300';
    if (timeLeft <= 300) return 'text-red-300';
    if (timeLeft <= 600) return 'text-yellow-300';
    return 'text-white';
  };

  // Se não há tempo restante, não mostrar o timer
  if (!timeLeft || timeLeft <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span className={`font-mono tracking-wider ${getColorClass()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

export default SessionTimer; 