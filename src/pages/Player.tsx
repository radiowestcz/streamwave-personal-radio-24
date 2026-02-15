import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward, Volume2, VolumeX, Mic, Music, FileText, FileAudio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useContentItems, ContentType } from '@/hooks/useContentItems';
import { Loader2 } from 'lucide-react';

const contentTypeIcons: Record<ContentType, JSX.Element> = {
  news: <FileText className="h-5 w-5 text-news" />,
  music: <Music className="h-5 w-5 text-music" />,
  podcast: <FileAudio className="h-5 w-5 text-podcast" />,
  talk: <Mic className="h-5 w-5 text-talk" />
};

const Player: React.FC = () => {
  const { data: contentItems = [], isLoading } = useContentItems();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playableItems = contentItems.filter(item => item.file_url || item.external_url);
  const currentTrack = playableItems[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const url = currentTrack.file_url || currentTrack.external_url;
      if (url) {
        audioRef.current.src = url;
        if (isPlaying) audioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrackIndex, currentTrack]);

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => toast.error('Cannot play this audio'));
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = () => {
    if (currentTrackIndex < playableItems.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
      toast.success("Skipped to next item", { description: playableItems[currentTrackIndex + 1]?.title });
    } else {
      toast.error("End of queue");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <Layout>
        <AdminHeader title="Radio Player" description="Preview your radio experience" />
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminHeader title="Radio Player" description="Preview your radio experience" />
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={skipTrack}
      />

      <div className="p-6">
        <div className="grid gap-8 md:grid-cols-7">
          <Card className="md:col-span-5">
            <CardHeader><CardTitle>Now Playing</CardTitle></CardHeader>
            <CardContent>
              {!currentTrack ? (
                <p className="text-muted-foreground text-center py-8">No playable content. Add content with audio files first.</p>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="min-w-[180px] w-[180px] h-[180px] bg-muted rounded-lg flex items-center justify-center">
                    {contentTypeIcons[currentTrack.type]}
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <Badge className={
                        currentTrack.type === 'news' ? 'bg-news' :
                        currentTrack.type === 'music' ? 'bg-music' :
                        currentTrack.type === 'podcast' ? 'bg-podcast' : 'bg-talk'
                      }>
                        {currentTrack.type}
                      </Badge>
                      <h2 className="text-2xl font-bold mt-2">{currentTrack.title}</h2>
                      {currentTrack.artist && <p className="text-muted-foreground">{currentTrack.artist}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => setVolume(volume === 0 ? 80 : 0)}>
                          {volume === 0 ? <VolumeX /> : <Volume2 />}
                        </Button>
                        <Slider className="w-24" value={[volume]} max={100} step={1} onValueChange={(v) => setVolume(v[0])} />
                      </div>

                      <div className="flex items-center gap-4">
                        <Button size="icon" variant={isPlaying ? "outline" : "default"} className="h-12 w-12 rounded-full" onClick={togglePlayPause}>
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button size="icon" variant="outline" onClick={skipTrack}>
                          <SkipForward />
                        </Button>
                      </div>

                      <div className="w-24" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Up Next</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {playableItems.slice(currentTrackIndex + 1).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-l-4 p-2 rounded-r-md"
                    style={{
                      borderLeftColor:
                        item.type === 'news' ? 'var(--news)' :
                        item.type === 'music' ? 'var(--music)' :
                        item.type === 'podcast' ? 'var(--podcast)' : 'var(--talk)'
                    }}
                  >
                    <div className="w-8 h-8 bg-muted flex items-center justify-center rounded">
                      {contentTypeIcons[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <div className="text-xs text-muted-foreground">
                        {item.artist || item.type}
                      </div>
                    </div>
                  </div>
                ))}
                {playableItems.slice(currentTrackIndex + 1).length === 0 && (
                  <p className="text-center py-4 text-muted-foreground text-sm">No more items in queue</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Player;
