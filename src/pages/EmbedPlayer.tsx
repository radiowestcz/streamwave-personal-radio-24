import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useContentItems, useRadioSettings, ContentType } from '@/hooks/useContentItems';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, FileText, FileAudio, Mic } from 'lucide-react';

const contentTypeIcons: Record<ContentType, JSX.Element> = {
  news: <FileText className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  podcast: <FileAudio className="h-4 w-4" />,
  talk: <Mic className="h-4 w-4" />,
};

const EmbedPlayer: React.FC = () => {
  const { data: contentItems = [] } = useContentItems();
  const { data: settings = {} } = useRadioSettings();
  const playableItems = contentItems.filter(item => item.file_url || item.external_url);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const underscoreRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimer = useRef<number | null>(null);

  const current = playableItems[currentIndex];
  const crossfadeDuration = parseFloat(settings.crossfade_duration || '3');
  const underscoreVolume = parseFloat(settings.underscore_volume || '15') / 100;

  useEffect(() => {
    mainAudioRef.current = new Audio();
    nextAudioRef.current = new Audio();
    underscoreRef.current = new Audio();
    underscoreRef.current.loop = true;
    return () => {
      mainAudioRef.current?.pause();
      nextAudioRef.current?.pause();
      underscoreRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (mainAudioRef.current) mainAudioRef.current.volume = volume / 100;
    if (underscoreRef.current && (current?.type === 'news' || current?.type === 'talk')) {
      underscoreRef.current.volume = underscoreVolume * (volume / 100);
    }
  }, [volume, underscoreVolume, current?.type]);

  useEffect(() => {
    if (!mainAudioRef.current || !current) return;
    const url = current.file_url || current.external_url;
    if (!url) return;
    mainAudioRef.current.src = url;
    mainAudioRef.current.volume = volume / 100;

    // Underscore
    if ((current.type === 'news' || current.type === 'talk') && underscoreRef.current) {
      const uUrl = current.underscore_url || settings[`default_underscore_${current.type}`];
      if (uUrl) {
        underscoreRef.current.src = uUrl;
        underscoreRef.current.volume = underscoreVolume * (volume / 100);
        if (isPlaying) underscoreRef.current.play().catch(() => {});
      }
    } else {
      underscoreRef.current?.pause();
    }

    if (isPlaying) mainAudioRef.current.play().catch(() => {});
  }, [currentIndex, current?.id]);

  // Time tracking
  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) return;
    const onTime = () => { setCurrentTime(audio.currentTime); setDuration(audio.duration || 0); };
    const onEnded = () => skip();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnded); };
  }, [currentIndex, playableItems.length]);

  const togglePlay = () => {
    if (!mainAudioRef.current || !current) return;
    if (isPlaying) {
      mainAudioRef.current.pause();
      underscoreRef.current?.pause();
    } else {
      mainAudioRef.current.play().catch(() => {});
      if ((current.type === 'news' || current.type === 'talk') && underscoreRef.current?.src) {
        underscoreRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const skip = useCallback(() => {
    if (currentIndex >= playableItems.length - 1) return;
    const nextItem = playableItems[currentIndex + 1];
    
    // Crossfade for music -> music
    if (current?.type === 'music' && nextItem.type === 'music' && nextAudioRef.current && mainAudioRef.current) {
      const nextUrl = nextItem.file_url || nextItem.external_url;
      if (nextUrl) {
        nextAudioRef.current.src = nextUrl;
        nextAudioRef.current.volume = 0;
        nextAudioRef.current.play().catch(() => {});
        
        const steps = crossfadeDuration * 20;
        let step = 0;
        const targetVol = volume / 100;
        if (crossfadeTimer.current) clearInterval(crossfadeTimer.current);
        
        crossfadeTimer.current = window.setInterval(() => {
          step++;
          const p = step / steps;
          if (mainAudioRef.current) mainAudioRef.current.volume = targetVol * (1 - p);
          if (nextAudioRef.current) nextAudioRef.current.volume = targetVol * p;
          if (step >= steps) {
            if (crossfadeTimer.current) clearInterval(crossfadeTimer.current);
            mainAudioRef.current?.pause();
            const temp = mainAudioRef.current;
            mainAudioRef.current = nextAudioRef.current;
            nextAudioRef.current = temp;
            setCurrentIndex(prev => prev + 1);
          }
        }, 50);
        return;
      }
    }
    
    setCurrentIndex(prev => prev + 1);
    setIsPlaying(true);
  }, [currentIndex, playableItems, current, crossfadeDuration, volume]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getCoverUrl = (item: typeof playableItems[0]) => {
    return item.cover_image_url || settings[`default_cover_${item.type}`] || null;
  };

  return (
    <div className="bg-background text-foreground p-4 rounded-lg border border-border max-w-md mx-auto font-sans">
      {!current ? (
        <p className="text-center text-muted-foreground text-sm py-4">No content available</p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {getCoverUrl(current) ? (
                <img src={getCoverUrl(current)!} alt="" className="w-full h-full object-cover" />
              ) : contentTypeIcons[current.type]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{current.title}</p>
              {current.artist && <p className="text-xs text-muted-foreground truncate">{current.artist}</p>}
            </div>
          </div>

          <div className="relative w-full h-1.5 bg-muted rounded-full mb-3 cursor-pointer"
            onClick={(e) => {
              if (!mainAudioRef.current || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              mainAudioRef.current.currentTime = pct * duration;
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
