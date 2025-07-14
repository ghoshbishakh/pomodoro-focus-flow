"use client";

import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Play } from 'lucide-react';

interface YouTubePlayerProps {
  initialUrl: string;
  onUrlChange: (url: string) => void;
}

function extractId(url: string): { videoId?: string; playlistId?: string } {
  if (!url) return {};
  const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const playlistIdMatch = url.match(/[&?]list=([^&]+)/);

  return {
    videoId: videoIdMatch ? videoIdMatch[1] : undefined,
    playlistId: playlistIdMatch ? playlistIdMatch[1] : undefined,
  };
}

export function YouTubePlayer({ initialUrl, onUrlChange }: YouTubePlayerProps) {
  const [inputValue, setInputValue] = useState(initialUrl);

  const embedUrl = useMemo(() => {
    const { videoId, playlistId } = extractId(initialUrl);

    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1`;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
    }
    return '';
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUrlChange(inputValue);
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 p-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter YouTube video or playlist URL"
            className="bg-background/50"
          />
          <Button type="submit">
            <Play className="mr-2 h-4 w-4" /> Load
          </Button>
        </form>
        <div className="flex-grow w-full rounded-lg overflow-hidden aspect-video">
          {embedUrl ? (
            <iframe
              className="w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-black/20 rounded-lg">
              <p>Enter a valid YouTube URL to start.</p>
            </div>
          )}
        </div>
    </div>
  );
}
