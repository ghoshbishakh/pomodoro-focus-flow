"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ThemeToggle } from './ThemeToggle';
import { type PomodoroSettings } from './SettingsDialog';
import { PomodoroTimer } from './PomodoroTimer';
import { TaskList } from './TaskList';
import { YouTubePlayer } from './YouTubePlayer';
import type { YouTubePlayerRef } from './YouTubePlayer';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Play, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const MIN_PANEL_WIDTH = 350;
const MAX_PANEL_WIDTH = 800;

export default function FocusFlowApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('activeTaskId', null);
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', { work: 25, shortBreak: 5, syncVideo: true });
  const [youtubeUrl, setYoutubeUrl] = useLocalStorage<string>('youtubeUrl', 'https://www.youtube.com/watch?v=-Xh4BNbxpI8');
  const [panelWidth, setPanelWidth] = useLocalStorage<number>('panelWidth', 480);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [inputValue, setInputValue] = useState(youtubeUrl);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const hideHeaderTimeout = useRef<NodeJS.Timeout | null>(null);

  const playerRef = useRef<YouTubePlayerRef>(null);

  const handleTimerStart = () => {
    if (settings.syncVideo) {
      playerRef.current?.playVideo();
    }
  };

  const handleTimerPause = () => {
    if (settings.syncVideo) {
      playerRef.current?.pauseVideo();
    }
  };
  
  const handleToggleHeader = () => {
     if (hideHeaderTimeout.current) {
      clearTimeout(hideHeaderTimeout.current);
      hideHeaderTimeout.current = null;
    }
    setIsHeaderVisible(prev => !prev);
  }

  useEffect(() => {
    if (isTimerActive) {
       hideHeaderTimeout.current = setTimeout(() => setIsHeaderVisible(false), 2000);
    } else {
      if (hideHeaderTimeout.current) {
        clearTimeout(hideHeaderTimeout.current);
      }
      setIsHeaderVisible(true);
    }
    return () => {
      if (hideHeaderTimeout.current) {
        clearTimeout(hideHeaderTimeout.current);
      }
    };
  }, [isTimerActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeUrl(inputValue);
  };

  const isResizing = useRef(false);

  useEffect(() => {
    const initAudio = () => {
        if (!audioContext) {
            try {
              const context = new (window.AudioContext || (window as any).webkitAudioContext)();
              setAudioContext(context);
            } catch(e) {
                console.error("Web Audio API is not supported in this browser", e);
            }
        }
        document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => {
        document.removeEventListener('click', initAudio);
    };
  }, [audioContext]);


  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      let newWidth = e.clientX;
      if (newWidth < MIN_PANEL_WIDTH) newWidth = MIN_PANEL_WIDTH;
      if (newWidth > MAX_PANEL_WIDTH) newWidth = MAX_PANEL_WIDTH;
      setPanelWidth(newWidth);
    }
  }, [setPanelWidth]);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  useEffect(() => {
    if(activeTaskId && !tasks.find(t => t.id === activeTaskId)) {
      setActiveTaskId(null);
    }
  }, [tasks, activeTaskId, setActiveTaskId]);

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      pomodoros: 0,
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleRearrangeTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const playSound = () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleSessionComplete = () => {
    playSound();
    if (activeTaskId) {
      setTasks(tasks.map(task =>
        task.id === activeTaskId
          ? { ...task, pomodoros: task.pomodoros + 1 }
          : task
      ));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className={cn(
        "flex items-center justify-between p-2 px-4 border-b shrink-0 transition-transform duration-300",
        !isHeaderVisible && "-translate-y-full absolute top-0 w-full"
      )}>
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <h1 className="text-xl font-bold text-primary">FocusFlow</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter YouTube video or playlist URL"
          />
          <Button type="submit">
            <Play className="mr-2 h-4 w-4" /> Load
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <ThemeToggle />
           {isTimerActive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleHeader}
              aria-label={isHeaderVisible ? "Hide header" : "Show header"}
            >
              {isHeaderVisible ? <EyeOff /> : <Eye />}
            </Button>
          )}
        </div>
      </header>
       {!isHeaderVisible && (
        <div className="absolute top-2 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleHeader}
            aria-label="Show header"
          >
            <Eye />
          </Button>
        </div>
      )}
      <main className="flex flex-grow min-h-0">
        <div 
          style={{ width: `${panelWidth}px` }} 
          className="p-4 flex flex-col gap-4 overflow-y-auto border-r"
        >
          <PomodoroTimer 
            settings={settings} 
            onSettingsChange={setSettings}
            onSessionComplete={handleSessionComplete}
            onTimerStart={handleTimerStart}
            onTimerPause={handleTimerPause}
            onTimerStateChange={setIsTimerActive}
          />
          <TaskList
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onRearrangeTasks={handleRearrangeTasks}
            activeTaskId={activeTaskId}
            onSetActiveTaskId={setActiveTaskId}
          />
        </div>
        
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 cursor-col-resize hover:bg-primary/20 transition-colors shrink-0"
        />

        <div className="flex-grow flex items-center justify-center p-4">
          <YouTubePlayer ref={playerRef} initialUrl={youtubeUrl} />
        </div>
      </main>
    </div>
  );
}
