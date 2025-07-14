"use client";

import type { Task } from '@/lib/types';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Plus, Trash2, Zap, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onRearrangeTasks: (tasks: Task[]) => void;
  activeTaskId: string | null;
  onSetActiveTaskId: (id: string | null) => void;
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask, onRearrangeTasks, activeTaskId, onSetActiveTaskId }: TaskListProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newTasks = [...tasks];
      const [draggedItem] = newTasks.splice(dragItem.current, 1);
      newTasks.splice(dragOverItem.current, 0, draggedItem);
      onRearrangeTasks(newTasks);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <Card className="flex-grow flex flex-col h-full mt-4 bg-transparent border-none shadow-none">
      <CardHeader className="p-2">
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-grow min-h-0 p-2">
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
        <ScrollArea className="flex-grow -mr-2">
          <div className="space-y-1 pr-2">
            {tasks.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No tasks yet. Add one to get started!</p>
            )}
            {tasks.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "flex items-center gap-1 p-1 rounded-md transition-colors cursor-grab active:cursor-grabbing",
                  activeTaskId === task.id ? 'bg-primary/20' : 'hover:bg-muted/50',
                )}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground/50 shrink-0"/>
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
                  className="h-7 w-7"
                  onClick={() => onSetActiveTaskId(activeTaskId === task.id ? null : task.id)}
                  aria-label={`Select task ${task.text} for tracking`}
                >
                  {activeTaskId === task.id ? <Zap className="text-primary" /> : <Zap className="text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDeleteTask(task.id)} aria-label={`Delete task ${task.text}`}>
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
