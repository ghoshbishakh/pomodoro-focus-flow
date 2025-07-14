"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ThemeToggle } from './ThemeToggle';
import { SettingsDialog, type PomodoroSettings } from './SettingsDialog';
import { PomodoroTimer } from './PomodoroTimer';
import { TaskList } from './TaskList';
import { YouTubePlayer } from './YouTubePlayer';
import { Separator } from './ui/separator';

const MIN_PANEL_WIDTH = 350;
const MAX_PANEL_WIDTH = 800;

export default function FocusFlowApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('activeTaskId', null);
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', { work: 25, shortBreak: 5 });
  const [youtubeUrl, setYoutubeUrl] = useLocalStorage<string>('youtubeUrl', 'https://www.youtube.com/watch?v=jfKfPfyJRdk');
  const [panelWidth, setPanelWidth] = useLocalStorage<number>('panelWidth', 480);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const isResizing = useRef(false);

  // Initialize AudioContext on user interaction
  useEffect(() => {
    const initAudio = () => {
        if (!audioContext) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(context);
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
  
  // Ensure active task exists
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
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Subtle volume
    
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
      <header className="flex items-center justify-between p-2 px-4 border-b shrink-0 bg-background/50 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-headline text-primary">FocusFlow</h1>
        <div className="flex items-center gap-2">
          <SettingsDialog settings={settings} onSave={setSettings} />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-grow min-h-0">
        <div style={{ width: `${panelWidth}px` }} className="p-2 flex flex-col overflow-y-auto bg-background/50 backdrop-blur-sm">
          <PomodoroTimer 
            settings={settings} 
            onSessionComplete={handleSessionComplete}
            isTaskActive={!!activeTaskId} 
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
        
        <Separator
          orientation="vertical"
          onMouseDown={handleMouseDown}
          className="w-1 cursor-col-resize hover:bg-primary transition-colors"
        />

        <div className="flex-grow flex items-center justify-center">
          <YouTubePlayer initialUrl={youtubeUrl} onUrlChange={setYoutubeUrl} />
        </div>
      </main>
    </div>
  );
}
