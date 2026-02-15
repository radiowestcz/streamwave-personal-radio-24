import { useRef, useState, useEffect, useCallback } from 'react';
import { ContentItem, ContentType } from './useContentItems';

interface RadioEngineOptions {
  crossfadeDuration?: number; // seconds
  underscoreVolume?: number; // 0-1
  settings?: Record<string, string>;
}

export const useRadioEngine = (options: RadioEngineOptions = {}) => {
  const { crossfadeDuration = 3, underscoreVolume = 0.15, settings = {} } = options;

  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const underscoreRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isCrossfading, setIsCrossfading] = useState(false);

  const crossfadeTimerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize audio elements
  useEffect(() => {
    mainAudioRef.current = new Audio();
    nextAudioRef.current = new Audio();
    underscoreRef.current = new Audio();
    underscoreRef.current.loop = true;
    underscoreRef.current.volume = 0;

    return () => {
      mainAudioRef.current?.pause();
      nextAudioRef.current?.pause();
      underscoreRef.current?.pause();
      if (crossfadeTimerRef.current) clearInterval(crossfadeTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Volume sync
  useEffect(() => {
    if (mainAudioRef.current) mainAudioRef.current.volume = volume / 100;
    if (nextAudioRef.current) nextAudioRef.current.volume = 0;
  }, [volume]);

  // Time tracking
  const startTimeTracking = useCallback(() => {
    const tick = () => {
      if (mainAudioRef.current) {
        setCurrentTime(mainAudioRef.current.currentTime);
        setDuration(mainAudioRef.current.duration || 0);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Underscore management
  const updateUnderscore = useCallback((contentType: ContentType | null) => {
    if (!underscoreRef.current) return;

    const shouldPlay = contentType === 'news' || contentType === 'talk';
    if (!shouldPlay) {
      // Fade out underscore
      underscoreRef.current.volume = 0;
      underscoreRef.current.pause();
      return;
    }

    // Check for per-item or global underscore
    const underscoreKey = `default_underscore_${contentType}`;
    const underscoreUrl = settings[underscoreKey];

    if (underscoreUrl && underscoreRef.current.src !== underscoreUrl) {
      underscoreRef.current.src = underscoreUrl;
    }

    if (underscoreUrl) {
      underscoreRef.current.volume = underscoreVolume * (volume / 100);
      underscoreRef.current.play().catch(() => {});
    }
  }, [settings, underscoreVolume, volume]);

  // Load and play a track
  const loadTrack = useCallback((item: ContentItem) => {
    if (!mainAudioRef.current) return;
    const url = item.file_url || item.external_url;
    if (!url) return;

    mainAudioRef.current.src = url;
    mainAudioRef.current.volume = volume / 100;

    // Handle underscore based on item type or per-item setting
    const itemUnderscore = item.underscore_url;
    if (itemUnderscore && underscoreRef.current) {
      underscoreRef.current.src = itemUnderscore;
      if (item.type === 'news' || item.type === 'talk') {
        underscoreRef.current.volume = underscoreVolume * (volume / 100);
        underscoreRef.current.play().catch(() => {});
      }
    } else {
      updateUnderscore(item.type);
    }
  }, [volume, underscoreVolume, updateUnderscore]);

  // Crossfade to next track
  const crossfadeTo = useCallback((nextItem: ContentItem, onComplete: () => void) => {
    if (!mainAudioRef.current || !nextAudioRef.current) return;

    const nextUrl = nextItem.file_url || nextItem.external_url;
    if (!nextUrl) { onComplete(); return; }

    // Only crossfade for music
    const shouldCrossfade = nextItem.type === 'music';
    if (!shouldCrossfade) {
      mainAudioRef.current.pause();
      onComplete();
      return;
    }

    setIsCrossfading(true);
    nextAudioRef.current.src = nextUrl;
    nextAudioRef.current.volume = 0;
    nextAudioRef.current.play().catch(() => {});

    const steps = crossfadeDuration * 20; // 50ms intervals
    let step = 0;
    const targetVol = volume / 100;

    if (crossfadeTimerRef.current) clearInterval(crossfadeTimerRef.current);

    crossfadeTimerRef.current = window.setInterval(() => {
      step++;
      const progress = step / steps;

      if (mainAudioRef.current) mainAudioRef.current.volume = targetVol * (1 - progress);
      if (nextAudioRef.current) nextAudioRef.current.volume = targetVol * progress;

      if (step >= steps) {
        if (crossfadeTimerRef.current) clearInterval(crossfadeTimerRef.current);
        mainAudioRef.current?.pause();

        // Swap refs
        const temp = mainAudioRef.current;
        mainAudioRef.current = nextAudioRef.current;
        nextAudioRef.current = temp;

        setIsCrossfading(false);
        onComplete();
      }
    }, 50);
  }, [crossfadeDuration, volume]);

  const play = useCallback(() => {
    mainAudioRef.current?.play().catch(() => {});
    setIsPlaying(true);
    startTimeTracking();
  }, [startTimeTracking]);

  const pause = useCallback(() => {
    mainAudioRef.current?.pause();
    underscoreRef.current?.pause();
    setIsPlaying(false);
    stopTimeTracking();
  }, [stopTimeTracking]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (mainAudioRef.current) mainAudioRef.current.currentTime = time;
  }, []);

  return {
    mainAudioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    isCrossfading,
    loadTrack,
    crossfadeTo,
    play,
    pause,
    togglePlayPause,
    seek,
    updateUnderscore,
  };
};
