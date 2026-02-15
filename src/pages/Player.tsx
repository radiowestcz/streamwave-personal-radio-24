import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward, Volume2, VolumeX, Mic, Music, FileText, FileAudio, Bell, Radio, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useContentItems, useRadioSettings, ContentType } from '@/hooks/useContentItems';
import { useRadioEngine } from '@/hooks/useRadioEngine';
import { Loader2 } from 'lucide-react';

const contentTypeIcons: Record<ContentType, JSX.Element> = {
  news: <FileText className="h-5 w-5 text-news" />,
  music: <Music className="h-5 w-5 text-music" />,
  podcast: <FileAudio className="h-5 w-5 text-podcast" />,
  talk: <Mic className="h-5 w-5 text-talk" />,
  jingle_news: <Bell className="h-5 w-5 text-jingle-news" />,
  jingle_talk: <Bell className="h-5 w-5 text-jingle-talk" />,
  jingle_podcast: <Bell className="h-5 w-5 text-jingle-podcast" />,
  station_id: <Radio className="h-5 w-5 text-station-id" />,
  promo: <Megaphone className="h-5 w-5 text-promo" />,
};

const Player: React.FC = () => {
  const { data: contentItems = [], isLoading } = useContentItems();
  const { data: settings = {} } = useRadioSettings();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const crossfadeDuration = parseFloat(settings.crossfade_duration || '3');
  const underscoreVolume = parseFloat(settings.underscore_volume || '15') / 100;

  const engine = useRadioEngine({ crossfadeDuration, underscoreVolume, settings });

  const playableItems = contentItems.filter(item => item.file_url || item.external_url);
  const currentTrack = playableItems[currentTrackIndex];

  // Load track when index changes
  useEffect(() => {
    if (currentTrack) {
      engine.loadTrack(currentTrack);
      if (engine.isPlaying) engine.play();
    }
  }, [currentTrackIndex, currentTrack?.id]);

  const togglePlayPause = () => {
    if (!currentTrack) return;
    engine.togglePlayPause();
  };

  const skipTrack = useCallback(() => {
    if (currentTrackIndex < playableItems.length - 1) {
      const nextItem = playableItems[currentTrackIndex + 1];
      // Use crossfade for music -> music transitions
      if (currentTrack?.type === 'music' && nextItem.type === 'music') {
        engine.crossfadeTo(nextItem, () => {
          setCurrentTrackIndex(prev => prev + 1);
        });
      } else {
        setCurrentTrackIndex(prev => prev + 1);
      }
      toast.success("Next: " + nextItem.title);
    } else {
      toast.error("End of queue");
    }
  }, [currentTrackIndex, playableItems, currentTrack, engine]);

  // Auto-advance when track ends
  useEffect(() => {
    const audio = engine.mainAudioRef.current;
    if (!audio) return;
    const handleEnded = () => skipTrack();
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [skipTrack]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = engine.duration > 0 ? (engine.currentTime / engine.duration) * 100 : 0;

  const getCoverUrl = (item: typeof playableItems[0]) => {
    return item.cover_image_url || settings[`default_cover_${item.type}`] || null;
  };

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

      <div className="p-6">
        <div className="grid gap-8 md:grid-cols-7">
          <Card className="md:col-span-5">
            <CardHeader><CardTitle>Now Playing {engine.isCrossfading && <span className="text-xs text-muted-foreground ml-2">crossfading...</span>}</CardTitle></CardHeader>
            <CardContent>
              {!currentTrack ? (
                <p className="text-muted-foreground text-center py-8">No playable content. Add content with audio files first.</p>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="min-w-[180px] w-[180px] h-[180px] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {getCoverUrl(currentTrack) ? (
                      <img src={getCoverUrl(currentTrack)!} alt={currentTrack.title} className="w-full h-full object-cover" />
                    ) : (
                      contentTypeIcons[currentTrack.type]
                    )}
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
                        <span>{formatTime(engine.currentTime)}</span>
                        <span>{formatTime(engine.duration)}</span>
                      </div>
                      <Progress value={progress} className="h-2 cursor-pointer" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        engine.seek(pct * engine.duration);
                      }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => engine.setVolume(engine.volume === 0 ? 80 : 0)}>
                          {engine.volume === 0 ? <VolumeX /> : <Volume2 />}
                        </Button>
                        <Slider className="w-24" value={[engine.volume]} max={100} step={1} onValueChange={(v) => engine.setVolume(v[0])} />
                      </div>

                      <div className="flex items-center gap-4">
                        <Button size="icon" variant={engine.isPlaying ? "outline" : "default"} className="h-12 w-12 rounded-full" onClick={togglePlayPause}>
                          {engine.isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
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
                    <div className="w-8 h-8 bg-muted flex items-center justify-center rounded overflow-hidden">
                      {getCoverUrl(item) ? (
                        <img src={getCoverUrl(item)!} alt="" className="w-full h-full object-cover" />
                      ) : contentTypeIcons[item.type]}
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
