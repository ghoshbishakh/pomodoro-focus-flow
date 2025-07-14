"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { type PomodoroSettings } from './SettingsDialog';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onSessionComplete: () => void;
  isTaskActive: boolean;
}

type SessionType = 'work' | 'shortBreak';

export function PomodoroTimer({ settings, onSessionComplete, isTaskActive }: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [time, setTime] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Reset timer when settings change
    setIsActive(false);
    setSessionType('work');
    setTime(settings.work * 60);
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      if (sessionType === 'work') {
        onSessionComplete();
        setSessionType('shortBreak');
        setTime(settings.shortBreak * 60);
        new Notification('FocusFlow', { body: "Work session complete! Time for a break." });
      } else {
        setSessionType('work');
        setTime(settings.work * 60);
        new Notification('FocusFlow', { body: "Break's over! Let's get back to work." });
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, onSessionComplete, sessionType, settings]);
  
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    const newTime = sessionType === 'work' ? settings.work * 60 : settings.shortBreak * 60;
    setTime(newTime);
  }, [sessionType, settings]);

  const switchSession = (type: SessionType) => {
    setSessionType(type);
    setIsActive(false);
    setTime(type === 'work' ? settings.work * 60 : settings.shortBreak * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-card/10 backdrop-blur-sm border border-white/10">
      <div className="flex gap-2">
        <Button 
          variant={sessionType === 'work' ? 'secondary' : 'ghost'} 
          onClick={() => switchSession('work')}
          size="sm"
        >
          Pomodoro
        </Button>
        <Button 
          variant={sessionType === 'shortBreak' ? 'secondary' : 'ghost'} 
          onClick={() => switchSession('shortBreak')}
          size="sm"
        >
          Break
        </Button>
      </div>
      <div className="font-headline font-bold text-7xl md:text-8xl text-primary tabular-nums">
        {formatTime(time)}
      </div>
      <div className="flex gap-4">
        <Button onClick={toggleTimer} size="lg" className="w-32">
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="icon" aria-label="Reset timer">
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}
