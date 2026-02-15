import React from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentCard from '@/components/ContentCard';
import { useToast } from "@/hooks/use-toast";
import { Music, FileText, Mic, FileAudio } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useContentItems } from '@/hooks/useContentItems';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { toast } = useToast();
  const { data: allContent = [], isLoading } = useContentItems();

  const stats = [
    { title: "Total Content", value: allContent.length.toString(), icon: <FileText className="h-5 w-5" /> },
    { title: "Music", value: allContent.filter(c => c.type === 'music').length.toString(), icon: <Music className="h-5 w-5" /> },
    { title: "Podcasts", value: allContent.filter(c => c.type === 'podcast').length.toString(), icon: <FileAudio className="h-5 w-5" /> },
    { title: "Talk", value: allContent.filter(c => c.type === 'talk').length.toString(), icon: <Mic className="h-5 w-5" /> },
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

  const recentContent = allContent.slice(0, 4);

  return (
    <Layout>
      <AdminHeader title="Dashboard" description="Overview of your radio station" />

      <div className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="p-1 bg-primary/10 rounded">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Listener Analytics</CardTitle></CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorListeners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="listeners" stroke="#3B82F6" fillOpacity={1} fill="url(#colorListeners)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recently Added Content</h2>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : recentContent.length === 0 ? (
            <p className="text-muted-foreground">No content yet. Go to Content Manager to add some.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentContent.map((item) => (
                <ContentCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    artist: item.artist || undefined,
                    duration: item.duration || '0:00',
                    createdAt: new Date(item.created_at).toLocaleDateString(),
                    tags: item.tags,
                    isActive: item.is_active,
                  }}
                  onPlay={() => toast({ title: `Playing ${item.title}` })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
