
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Mic, 
  Music, 
  FileText, 
  FileAudio,
  Repeat
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContentItem, ContentType } from '@/components/ContentCard';
import { toast } from "sonner";

interface QueueItem extends ContentItem {
  progress?: number;
}

const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [progress, setProgress] = useState<number>(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  
  // Mock queue data
  const initialQueue: QueueItem[] = [
    {
      id: "1",
      title: "Morning News Update",
      type: "news",
      duration: "3:25",
      createdAt: "Today",
      tags: ["News", "Morning", "Update"],
      isActive: true,
      progress: 45,
    },
    {
      id: "2",
      title: "Sunny Days",
      type: "music",
      artist: "The Morning Band",
      duration: "4:12",
      createdAt: "Today",
      tags: ["Pop", "Upbeat"],
      isActive: true,
    },
    {
      id: "3",
      title: "Weather Report",
      type: "talk",
      duration: "1:30",
      createdAt: "Today",
      tags: ["Weather", "Information"],
      isActive: true,
    },
    {
      id: "4",
      title: "Innovation Today",
      type: "podcast",
      artist: "Tech Insiders",
      duration: "15:45",
      createdAt: "Today",
      tags: ["Technology", "Innovation"],
      isActive: true,
    },
    {
      id: "5",
      title: "Classic Hits Mix",
      type: "music",
      artist: "Various Artists",
      duration: "12:30",
      createdAt: "Today",
      tags: ["Classics", "Mix"],
      isActive: true,
    },
  ];
  
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  
  const contentTypeIcons: Record<ContentType, JSX.Element> = {
    news: <FileText className="h-5 w-5 text-news" />,
    music: <Music className="h-5 w-5 text-music" />,
    podcast: <FileAudio className="h-5 w-5 text-podcast" />,
    talk: <Mic className="h-5 w-5 text-talk" />
  };
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            skipTrack();
            return 0;
          }
          return prev + 1;
        });
        
        // Update current time based on progress
        const totalSeconds = convertDurationToSeconds(queue[currentTrackIndex].duration);
        const currentSeconds = Math.floor((totalSeconds * progress) / 100);
        setCurrentTime(formatTime(currentSeconds));
        
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIndex, queue]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    toast.success(
      !isPlaying ? "Radio stream started" : "Radio stream paused", 
      { description: queue[currentTrackIndex].title }
    );
  };
  
  const skipTrack = () => {
    if (currentTrackIndex < queue.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setProgress(0);
      setCurrentTime("0:00");
      
      // If not playing, start playing
      if (!isPlaying) {
        setIsPlaying(true);
      }
      
      toast.success("Skipped to next item", {
        description: queue[currentTrackIndex + 1].title
      });
    } else {
      toast.error("End of queue reached");
    }
  };
  
  const toggleMute = () => {
    setVolume(volume === 0 ? 80 : 0);
  };
  
  // Helper functions
  const convertDurationToSeconds = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    return parts.length === 2 
      ? parts[0] * 60 + parts[1] 
      : parts[0] * 3600 + parts[1] * 60 + parts[2];
  };
  
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Sample generation of more content
  const generateMoreContent = () => {
    const types: ContentType[] = ['music', 'news', 'podcast', 'talk'];
    const newType = types[Math.floor(Math.random() * types.length)];
    
    const newItem: QueueItem = {
      id: `new-${Date.now()}`,
      title: newType === 'music' ? `New Music Track ${Math.floor(Math.random() * 100)}` :
             newType === 'news' ? `News Update ${Math.floor(Math.random() * 100)}` :
             newType === 'podcast' ? `Podcast Episode ${Math.floor(Math.random() * 100)}` :
             `Talk Segment ${Math.floor(Math.random() * 100)}`,
      type: newType,
      artist: newType === 'music' ? `Artist ${Math.floor(Math.random() * 100)}` :
              newType === 'podcast' ? `Host ${Math.floor(Math.random() * 100)}` : undefined,
      duration: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      createdAt: "Just added",
      tags: ["Generated", "Auto"],
      isActive: true,
    };
    
    setQueue([...queue, newItem]);
    toast.success("Added to queue", { description: newItem.title });
  };
  
  return (
    <Layout>
      <AdminHeader 
        title="Radio Player" 
        description="Preview your personalized radio experience"
      />
      
      <div className="p-6">
        <div className="grid gap-8 md:grid-cols-7">
          <Card className="md:col-span-5">
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="min-w-[180px] w-[180px] h-[180px] bg-muted rounded-lg relative overflow-hidden">
                  {queue[currentTrackIndex].type === 'music' ? (
                    <img 
                      src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60" 
                      alt="Album art" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      {contentTypeIcons[queue[currentTrackIndex].type]}
                    </div>
                  )}
                  
                  {isPlaying && (
                    <div className="absolute bottom-2 right-2">
                      <div className="audio-visualizer">
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Badge 
                      className={
                        queue[currentTrackIndex].type === 'news' ? 'bg-news' :
                        queue[currentTrackIndex].type === 'music' ? 'bg-music' :
                        queue[currentTrackIndex].type === 'podcast' ? 'bg-podcast' :
                        'bg-talk'
                      }
                    >
                      {queue[currentTrackIndex].type}
                    </Badge>
                    
                    <h2 className="text-2xl font-bold mt-2">
                      {queue[currentTrackIndex].title}
                    </h2>
                    
                    {queue[currentTrackIndex].artist && (
                      <p className="text-muted-foreground">{queue[currentTrackIndex].artist}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{currentTime}</span>
                      <span>{queue[currentTrackIndex].duration}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={toggleMute}
                      >
                        {volume === 0 ? <VolumeX /> : <Volume2 />}
                      </Button>
                      <Slider
                        className="w-24"
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setVolume(value[0])}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        size="icon"
                        variant={isPlaying ? "outline" : "default"}
                        className="h-12 w-12 rounded-full"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={skipTrack}
                      >
                        <SkipForward />
                      </Button>
                    </div>
                    
                    <Button variant="outline">
                      <Repeat className="mr-2 h-4 w-4" />
                      Continuous
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Up Next</CardTitle>
              <Button size="sm" onClick={generateMoreContent}>
                Generate More
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {queue.slice(currentTrackIndex + 1).map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 border-l-4 p-2 rounded-r-md"
                    style={{
                      borderLeftColor: 
                        item.type === 'news' ? 'var(--news)' :
                        item.type === 'music' ? 'var(--music)' :
                        item.type === 'podcast' ? 'var(--podcast)' : 
                        'var(--talk)'
                    }}
                  >
                    <div className="w-8 h-8 bg-muted flex items-center justify-center rounded">
                      {contentTypeIcons[item.type]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{item.artist || item.type}</span>
                        <span>{item.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {queue.slice(currentTrackIndex + 1).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    End of queue. More content will be generated automatically.
                  </div>
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
