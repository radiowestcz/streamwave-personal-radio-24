
import React from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentCard, { ContentItem } from '@/components/ContentCard';
import { useToast } from "@/hooks/use-toast";
import { Music, FileText, Mic, FileAudio, Play } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { toast } = useToast();
  
  // Sample data for stats and charts
  const stats = [
    { 
      title: "Total Content", 
      value: "318", 
      change: "+14% from last month",
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      title: "Active Music", 
      value: "156", 
      change: "+2% from last month",
      icon: <Music className="h-5 w-5" /> 
    },
    { 
      title: "Active Podcasts", 
      value: "87", 
      change: "+5% from last month",
      icon: <FileAudio className="h-5 w-5" /> 
    },
    { 
      title: "Talk Segments", 
      value: "75", 
      change: "+11% from last month",
      icon: <Mic className="h-5 w-5" /> 
    },
  ];
  
  const analyticsData = [
    { name: 'Mon', listeners: 400, skipRate: 40 },
    { name: 'Tue', listeners: 300, skipRate: 30 },
    { name: 'Wed', listeners: 500, skipRate: 25 },
    { name: 'Thu', listeners: 280, skipRate: 28 },
    { name: 'Fri', listeners: 590, skipRate: 15 },
    { name: 'Sat', listeners: 350, skipRate: 20 },
    { name: 'Sun', listeners: 470, skipRate: 23 },
  ];
  
  // Sample recent content
  const recentContent: ContentItem[] = [
    {
      id: "1",
      title: "Morning News Update",
      type: "news",
      duration: "5:32",
      createdAt: "Today, 8:00 AM",
      tags: ["Morning", "News", "Daily"],
      isActive: true
    },
    {
      id: "2",
      title: "Easy Listening Jazz Mix",
      type: "music",
      artist: "Jazz Collective",
      duration: "45:20",
      createdAt: "Yesterday, 6:15 PM",
      tags: ["Jazz", "Relaxing", "Afternoon"],
      isActive: true
    },
    {
      id: "3",
      title: "Tech Innovations Podcast",
      type: "podcast",
      artist: "Sarah Johnson",
      duration: "32:45",
      createdAt: "Apr 20, 2025",
      tags: ["Technology", "Innovation", "Weekly"],
      isActive: true
    },
    {
      id: "4",
      title: "Station ID - Top of the Hour",
      type: "talk",
      duration: "0:30",
      createdAt: "Apr 19, 2025",
      tags: ["Station ID", "Branding"],
      isActive: true
    }
  ];
  
  const handlePlay = (item: ContentItem) => {
    toast({
      title: `Playing ${item.title}`,
      description: `${item.type} content started playing`
    });
  };
  
  return (
    <Layout>
      <AdminHeader 
        title="Dashboard" 
        description="Overview of your radio station"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="p-1 bg-primary/10 rounded">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Analytics */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Listener Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analyticsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorListeners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSkipRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="listeners" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorListeners)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="skipRate" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorSkipRate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Content */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recently Added Content</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentContent.map((item) => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onPlay={() => handlePlay(item)}
                onEdit={() => {
                  toast({
                    title: "Edit Content",
                    description: `Editing ${item.title}`
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
