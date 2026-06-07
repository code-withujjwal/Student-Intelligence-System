import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import axios from 'axios';

export default function SystemStatus() {
  const [status, setStatus] = useState<'UP' | 'DOWN'>('UP');

  useEffect(() => {
    // Ping backend health endpoint directly to avoid global axios error interceptors
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    const actuatorUrl = apiBase.replace(/\/api\/?$/, '/actuator/health');

    const checkHealth = async () => {
      try {
        await axios.get(actuatorUrl, { timeout: 5000 });
        setStatus('UP');
      } catch (err) {
        setStatus('DOWN');
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
      <div className="relative flex h-2.5 w-2.5">
        {status === 'UP' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`}></span>
      </div>
      <span className="text-xs font-mono text-white/80">
        SYS.{status}
      </span>
    </div>
  );
}
