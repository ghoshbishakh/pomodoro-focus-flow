"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Coffee, BrainCircuit } from 'lucide-react';
import { SettingsDialog, type PomodoroSettings } from './SettingsDialog';
import { Card, CardContent } from './ui/card';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onSettingsChange: (newSettings: PomodoroSettings) => void;
  onSessionComplete: () => void;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerStateChange: (isActive: boolean) => void;
}

type SessionType = 'work' | 'shortBreak';

export function PomodoroTimer({ settings, onSettingsChange, onSessionComplete, onTimerStart, onTimerPause, onTimerStateChange }: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [time, setTime] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    onTimerStateChange(isActive);
  }, [isActive, onTimerStateChange]);

  useEffect(() => {
    setIsActive(false);
    setSessionType('work');
    setTime(settings.work * 60);
  }, [settings]);

  const switchSession = useCallback((type: SessionType, autoStart = false) => {
    setSessionType(type);
    setIsActive(autoStart);
    setTime(type === 'work' ? settings.work * 60 : settings.shortBreak * 60);
    if (autoStart) {
      onTimerStart();
    }
  }, [settings, onTimerStart]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      if (sessionType === 'work') {
        onSessionComplete();
        new Notification('FocusFlow', { body: "Work session complete! Time for a break." });
        switchSession('shortBreak', true); 
      } else {
        new Notification('FocusFlow', { body: "Break's over! Let's get back to work." });
        switchSession('work', false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, onSessionComplete, sessionType, settings, switchSession]);
  
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => {
    if (!isActive) {
      onTimerStart();
    } else {
      onTimerPause();
    }
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    if (isActive) {
      onTimerPause();
    }
    setIsActive(false);
    setTime(sessionType === 'work' ? settings.work * 60 : settings.shortBreak * 60);
  }, [sessionType, settings, isActive, onTimerPause]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const SessionIndicator = () => {
      if (sessionType === 'work') {
          return (
            <div className="flex items-center gap-2 text-primary">
              <BrainCircuit className="h-5 w-5" />
              <span className="font-semibold">Focus Time</span>
            </div>
          )
      }
      return (
        <div className="flex items-center gap-2 text-primary">
          <Coffee className="h-5 w-5" />
          <span className="font-semibold">Break Time</span>
        </div>
      );
  }

  return (
    <Card className="relative">
      <div className="absolute top-2 right-2">
        <SettingsDialog settings={settings} onSave={onSettingsChange} />
      </div>
      <CardContent className="flex flex-col items-center gap-4 p-6 pt-12">
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
        <SessionIndicator />
        <div className="font-bold text-8xl text-primary tabular-nums">
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
      </CardContent>
    </Card>
  );
}
