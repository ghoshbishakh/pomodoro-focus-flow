"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { suggestYoutubeVideos } from '@/ai/flows/suggest-youtube-videos';
import { type Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface VideoSuggestionsProps {
  tasks: Task[];
  onSuggestionClick: (url: string) => void;
}

export function VideoSuggestions({ tasks, onSuggestionClick }: VideoSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestVideos = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const taskList = tasks.map(task => `- ${task.text}`).join('\n');
    if (!taskList) {
      setError("Please add some tasks first to get suggestions.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await suggestYoutubeVideos({ taskList });
      if (result.videoSuggestions && result.videoSuggestions.length > 0) {
        setSuggestions(result.videoSuggestions);
      } else {
        setError("Could not find any video suggestions for your tasks.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while fetching suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Video Suggestions</span>
          <Button onClick={handleSuggestVideos} disabled={isLoading} size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Suggest Videos'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Click a suggestion to play it:</p>
            <ul className="list-disc list-inside">
              {suggestions.map((url, index) => (
                <li key={index} className="text-sm">
                  <button onClick={() => onSuggestionClick(url)} className="text-primary underline-offset-4 hover:underline text-left">
                    {url}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!error && !isLoading && suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground">Click "Suggest Videos" to get AI-powered recommendations based on your tasks.</p>
        )}
      </CardContent>
    </Card>
  );
}
