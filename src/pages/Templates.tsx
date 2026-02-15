
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, Music, FileText, FileAudio, Clock, Plus, Edit, Calendar, Bell, Radio, Megaphone } from "lucide-react";

interface TemplateSlot {
  id: string;
  time: string;
  contentType: 'news' | 'music' | 'podcast' | 'talk' | 'jingle_news' | 'jingle_talk' | 'jingle_podcast' | 'station_id' | 'promo';
  duration: string;
  filters?: {
    categories?: string[];
    tags?: string[];
  };
}

interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  slots: TemplateSlot[];
  schedule: string[];
}

// Mock data
const mockTemplates: TemplateDefinition[] = [
  {
    id: "template-1",
    name: "Morning Drive",
    description: "Weekday morning template with news focus",
    schedule: ["Weekdays 6:00 AM - 10:00 AM"],
    slots: [
      { id: "slot-1", time: ":00", contentType: "station_id", duration: "0:10" },
      { id: "slot-2", time: ":00", contentType: "news", duration: "5:00" },
      { id: "slot-3", time: ":05", contentType: "jingle_news", duration: "0:05" },
      { id: "slot-4", time: ":05", contentType: "music", duration: "7:30" },
      { id: "slot-5", time: ":13", contentType: "promo", duration: "0:30" },
      { id: "slot-6", time: ":13", contentType: "talk", duration: "2:00" },
      { id: "slot-7", time: ":15", contentType: "music", duration: "15:00" },
      { id: "slot-8", time: ":30", contentType: "station_id", duration: "0:10" },
      { id: "slot-9", time: ":30", contentType: "news", duration: "3:00" },
      { id: "slot-10", time: ":33", contentType: "jingle_podcast", duration: "0:05" },
      { id: "slot-11", time: ":33", contentType: "podcast", duration: "10:00" },
      { id: "slot-12", time: ":43", contentType: "music", duration: "12:00" },
      { id: "slot-13", time: ":55", contentType: "talk", duration: "5:00" },
    ]
  },
  {
    id: "template-2",
    name: "Afternoon Mix",
    description: "Weekday afternoon template with music focus",
    schedule: ["Weekdays 1:00 PM - 4:00 PM"],
    slots: [
      { id: "slot-1", time: ":00", contentType: "talk", duration: "1:00" },
      { id: "slot-2", time: ":01", contentType: "music", duration: "15:00" },
      { id: "slot-3", time: ":16", contentType: "talk", duration: "4:00" },
      { id: "slot-4", time: ":20", contentType: "music", duration: "10:00" },
      { id: "slot-5", time: ":30", contentType: "news", duration: "2:00" },
      { id: "slot-6", time: ":32", contentType: "music", duration: "20:00" },
      { id: "slot-7", time: ":52", contentType: "talk", duration: "8:00" },
    ]
  },
  {
    id: "template-3",
    name: "Evening Podcast",
    description: "Evening template with podcast focus",
    schedule: ["Weekdays 7:00 PM - 9:00 PM", "Weekends 6:00 PM - 8:00 PM"],
    slots: [
      { id: "slot-1", time: ":00", contentType: "talk", duration: "3:00" },
      { id: "slot-2", time: ":03", contentType: "podcast", duration: "27:00" },
      { id: "slot-3", time: ":30", contentType: "news", duration: "2:00" },
      { id: "slot-4", time: ":32", contentType: "podcast", duration: "28:00" },
    ]
  },
];

const Templates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  
  const contentTypeIcons: Record<string, JSX.Element> = {
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

  const contentTypeLabels: Record<string, string> = {
    news: 'News', music: 'Music', podcast: 'Podcast', talk: 'Talk',
    jingle_news: 'Jingle News', jingle_talk: 'Jingle Talk', jingle_podcast: 'Jingle Podcast',
    station_id: 'Station ID', promo: 'Promo',
  };
  
  return (
    <Layout>
      <AdminHeader 
        title="Templates" 
        description="Create and manage your broadcast templates"
      />
      
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hour Clock Templates
          </h2>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{template.description}</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="space-y-1">
                    {template.schedule.map((time, i) => (
                      <Badge key={i} variant="outline">{time}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Template Preview</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {template.slots.slice(0, 4).map((slot) => (
                      <div 
                        key={slot.id} 
                        className={`template-slot ${slot.contentType}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {contentTypeIcons[slot.contentType]}
                            <span className="font-medium">{slot.time}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{slot.duration}</span>
                        </div>
                      </div>
                    ))}
                    
                    {template.slots.length > 4 && (
                      <div className="text-center text-sm text-muted-foreground py-1">
                        + {template.slots.length - 4} more slots
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 p-4">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button className="flex-1">View Schedule</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Template Designer</h3>
          <Card>
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input id="template-name" placeholder="e.g. Morning Drive" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary Content Focus</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="podcast">Podcasts</SelectItem>
                        <SelectItem value="talk">Talk</SelectItem>
                        <SelectItem value="jingle_news">Jingle News</SelectItem>
                        <SelectItem value="jingle_talk">Jingle Talk</SelectItem>
                        <SelectItem value="jingle_podcast">Jingle Podcast</SelectItem>
                        <SelectItem value="station_id">Station ID</SelectItem>
                        <SelectItem value="promo">Promo</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Input id="template-description" placeholder="Brief description of this template" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Hour Clock Slots</h4>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Slot
                    </Button>
                  </div>
                  
                  <div className="border rounded-md divide-y">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 flex flex-wrap gap-4 items-center">
                        <div className="w-20">
                          <Label className="mb-1 block text-xs">Time</Label>
                          <Input placeholder=":00" className="h-8" />
                        </div>
                        
                        <div className="w-32 flex-grow sm:flex-grow-0">
                          <Label className="mb-1 block text-xs">Content Type</Label>
                          <Select>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="news">News</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="podcast">Podcast</SelectItem>
                              <SelectItem value="talk">Talk</SelectItem>
                              <SelectItem value="jingle_news">Jingle News</SelectItem>
                              <SelectItem value="jingle_talk">Jingle Talk</SelectItem>
                              <SelectItem value="jingle_podcast">Jingle Podcast</SelectItem>
                              <SelectItem value="station_id">Station ID</SelectItem>
                              <SelectItem value="promo">Promo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="w-24">
                          <Label className="mb-1 block text-xs">Duration</Label>
                          <Input placeholder="5:00" className="h-8" />
                        </div>
                        
                        <div className="flex-grow">
                          <Label className="mb-1 block text-xs">Filters (Optional)</Label>
                          <Input placeholder="Tags, categories" className="h-8" />
                        </div>
                        
                        <Button variant="ghost" size="sm" className="self-end">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/30 p-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Template</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Templates;
