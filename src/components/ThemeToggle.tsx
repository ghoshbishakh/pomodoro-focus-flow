"use client";

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';

export function ThemeToggle() {
  const [theme, setTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    const savedTheme = localStorage.getItem('theme');
    // Default to dark mode if nothing is saved
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === undefined) return;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  if (theme === undefined) {
      return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
