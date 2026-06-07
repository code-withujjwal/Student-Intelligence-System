import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Trophy, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../api/axios';

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

export default function NotificationsFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mocking the feed for now. In reality, fetch from /api/notifications
    setNotifications([
      { id: 1, title: 'Achievement Unlocked', message: 'You completed your first quiz!', createdAt: new Date().toISOString() },
      { id: 2, title: 'Quiz Published', message: 'A new DBMS quiz is available.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    ]);
  }, []);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Live Activity Feed
      </h3>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {notifications.map((notif) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="mt-1">
              {notif.title.includes('Achievement') ? (
                <Trophy className="w-5 h-5 text-yellow-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">{notif.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
