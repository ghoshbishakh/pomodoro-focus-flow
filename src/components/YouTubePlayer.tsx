"use client";

import { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card } from './ui/card';

interface YouTubePlayerProps {
  initialUrl: string;
}

export interface YouTubePlayerRef {
  playVideo: () => void;
  pauseVideo: () => void;
}

function extractId(url: string): { videoId?: string; playlistId?: string } {
  if (!url) return {};
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    const playlistId = urlObj.searchParams.get('list');
    
    if (videoId) return { videoId };
    if (playlistId) return { playlistId };
    
    if (urlObj.hostname === 'youtu.be') {
        const pathVideoId = urlObj.pathname.slice(1);
        if (pathVideoId) return { videoId: pathVideoId };
    }

  } catch (e) {
      const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const playlistIdMatch = url.match(/[&?]list=([^&]+)/);

      return {
        videoId: videoIdMatch ? videoIdMatch[1] : undefined,
        playlistId: playlistIdMatch ? playlistIdMatch[1] : undefined,
      };
  }
  return {};
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({ initialUrl }, ref) => {
  const playerRef = useRef<any>(null); // To hold the YT.Player instance
  const [isApiReady, setIsApiReady] = useState(false);
  const { videoId, playlistId } = useMemo(() => extractId(initialUrl), [initialUrl]);

  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (playerRef.current && playerRef.current.getPlayerState() !== 1) { // 1: playing
        playerRef.current.playVideo();
      }
    },
    pauseVideo: () => {
      if (playerRef.current && playerRef.current.getPlayerState() === 1) { // 1: playing
        playerRef.current.pauseVideo();
      }
    },
  }));

  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
    
    return () => {
        if (playerRef.current) {
            playerRef.current.destroy();
        }
    };
  }, []);

  useEffect(() => {
    if (isApiReady && (videoId || playlistId)) {
      if (playerRef.current) {
          playerRef.current.destroy();
      }
      
      const playerOptions: any = {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          showinfo: 0,
          rel: 0,
          loop: 1,
        },
      };

      if (playlistId) {
        playerOptions.playerVars.listType = 'playlist';
        playerOptions.playerVars.list = playlistId;
      } else if (videoId) {
        playerOptions.videoId = videoId;
        playerOptions.playerVars.playlist = videoId; // Required for loop to work on single video
      }


      playerRef.current = new (window as any).YT.Player('youtube-player-container', playerOptions);
    }

  }, [isApiReady, videoId, playlistId]);


  return (
    <div className="h-full w-full flex flex-col gap-4">
        <Card className="w-full flex-grow aspect-video">
          <div id="youtube-player-container" className="w-full h-full">
            {!(videoId || playlistId) && (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-card rounded-lg">
                    <p>Enter a valid YouTube URL to start.</p>
                </div>
            )}
          </div>
        </Card>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export { YouTubePlayer };
