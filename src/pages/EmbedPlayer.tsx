import React, { useState, useRef, useEffect } from 'react';
import { useContentItems, ContentType } from '@/hooks/useContentItems';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, FileText, FileAudio, Mic } from 'lucide-react';

const contentTypeIcons: Record<ContentType, JSX.Element> = {
  news: <FileText className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  podcast: <FileAudio className="h-4 w-4" />,
  talk: <Mic className="h-4 w-4" />,
};

const EmbedPlayer: React.FC = () => {
  const { data: contentItems = [] } = useContentItems();
  const playableItems = contentItems.filter(item => item.file_url || item.external_url);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const current = playableItems[currentIndex];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && current) {
      audioRef.current.src = current.file_url || current.external_url || '';
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentIndex, current]);

  const togglePlay = () => {
    if (!audioRef.current || !current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const skip = () => {
    if (currentIndex < playableItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-background text-foreground p-4 rounded-lg border border-border max-w-md mx-auto font-sans">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={skip}
      />

      {!current ? (
        <p className="text-center text-muted-foreground text-sm py-4">No content available</p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
              {contentTypeIcons[current.type]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{current.title}</p>
              {current.artist && <p className="text-xs text-muted-foreground truncate">{current.artist}</p>}
            </div>
          </div>

          <div className="relative w-full h-1.5 bg-muted rounded-full mb-3 cursor-pointer"
            onClick={(e) => {
              if (!audioRef.current || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pct * duration;
            }}
          >
            <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setVolume(volume === 0 ? 80 : 0)} className="p-1.5 rounded hover:bg-muted">
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={skip} className="p-1.5 rounded hover:bg-muted">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <span className="text-xs text-muted-foreground">{currentIndex + 1}/{playableItems.length}</span>
          </div>
        </>
      )}

      <div className="mt-3 pt-2 border-t border-border text-center">
        <span className="text-[10px] text-muted-foreground">Powered by StreamWave</span>
      </div>
    </div>
  );
};

export default EmbedPlayer;
