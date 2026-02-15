import React from 'react';
import { Calendar, Clock, Tag, FileText, Music, Mic, Image } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type ContentType = 'news' | 'music' | 'podcast' | 'talk';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  artist?: string;
  duration: string;
  createdAt: string;
  tags: string[];
  thumbnail?: string;
  expiresAt?: string;
  isActive: boolean;
}

interface ContentCardProps {
  item: ContentItem;
  onPlay?: () => void;
  onEdit?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onPlay,
  onEdit,
  selectable = false,
  selected = false,
  onSelect,
}) => {
  const { title, type, artist, duration, createdAt, tags, thumbnail, isActive } = item;
  
  const typeColors: Record<ContentType, string> = {
    news: 'bg-news text-white',
    music: 'bg-music text-white',
    podcast: 'bg-podcast text-white',
    talk: 'bg-talk text-white'
  };
  
  return (
    <Card className={cn(
      "overflow-hidden h-full flex flex-col",
      !isActive && "opacity-70",
      selected && "ring-2 ring-primary"
    )}>
      <div className="relative pb-[60%] bg-muted">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            {type === 'news' && <FileText className="h-12 w-12 text-news" />}
            {type === 'music' && <Music className="h-12 w-12 text-music" />}
            {type === 'podcast' && <Mic className="h-12 w-12 text-podcast" />}
            {type === 'talk' && <Mic className="h-12 w-12 text-talk" />}
          </div>
        )}
        <Badge className={cn("absolute top-2 right-2", typeColors[type])}>
          {type}
        </Badge>
        {selectable && (
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect?.(item.id, !!checked)}
              className="bg-background/80 border-foreground/50"
            />
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        {artist && <p className="text-muted-foreground">{artist}</p>}
        
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{duration}</span>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{createdAt}</span>
        </div>
        
        <div className="flex gap-2">
          {onPlay && (
            <Button size="sm" onClick={onPlay}>
              Play
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
