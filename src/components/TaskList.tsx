"use client";

import type { Task } from '@/lib/types';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Plus, Trash2, Radio, Zap } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  activeTaskId: string | null;
  onSetActiveTaskId: (id: string | null) => void;
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask, activeTaskId, onSetActiveTaskId }: TaskListProps) {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <Card className="flex-grow flex flex-col h-full mt-4">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-grow min-h-0">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
          />
          <Button type="submit" size="icon" aria-label="Add task">
            <Plus />
          </Button>
        </form>
        <ScrollArea className="flex-grow">
          <div className="space-y-2 pr-4">
            {tasks.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No tasks yet. Add one to get started!</p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md transition-colors",
                  activeTaskId === task.id ? 'bg-primary/10' : 'hover:bg-muted/50',
                )}
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                  aria-label={`Mark task ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <label htmlFor={`task-${task.id}`} className={cn("flex-grow", task.completed && "line-through text-muted-foreground")}>
                  {task.text}
                </label>
                 {task.pomodoros > 0 && <Badge variant="secondary">{task.pomodoros}</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSetActiveTaskId(activeTaskId === task.id ? null : task.id)}
                  aria-label={`Select task ${task.text} for tracking`}
                >
                  {activeTaskId === task.id ? <Zap className="text-primary" /> : <Zap className="text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDeleteTask(task.id)} aria-label={`Delete task ${task.text}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
