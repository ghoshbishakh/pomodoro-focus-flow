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
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    const playlistId = urlObj.searchParams.get('list');
    
    if (videoId) return { videoId };
    if (playlistId) return { playlistId };
    
    // Fallback for youtu.be links
    if (urlObj.hostname === 'youtu.be') {
        const pathVideoId = urlObj.pathname.slice(1);
        if (pathVideoId) return { videoId: pathVideoId };
    }

  } catch (e) {
      // Fallback for non-url strings or invalid urls
      const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const playlistIdMatch = url.match(/[&?]list=([^&]+)/);

      return {
        videoId: videoIdMatch ? videoIdMatch[1] : undefined,
        playlistId: playlistIdMatch ? playlistIdMatch[1] : undefined,
      };
  }
  return {};
}

export function YouTubePlayer({ initialUrl, onUrlChange }: YouTubePlayerProps) {
  const [inputValue, setInputValue] = useState(initialUrl);

  const embedUrl = useMemo(() => {
    const { videoId, playlistId } = extractId(initialUrl);

    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&controls=0&showinfo=0&rel=0`;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
    }
    return '';
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUrlChange(inputValue);
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 p-2 relative">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg mx-auto z-10">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter YouTube video or playlist URL"
            className="bg-black/30 border-white/20 backdrop-blur-sm"
          />
          <Button type="submit" className="bg-black/30 border-white/20 backdrop-blur-sm hover:bg-white/20">
            <Play className="mr-2 h-4 w-4" /> Load
          </Button>
        </form>
        <div className="absolute inset-0 w-full h-full">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              className="w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-black/80 rounded-lg">
              <p>Enter a valid YouTube URL to start.</p>
            </div>
          )}
        </div>
    </div>
  );
}
