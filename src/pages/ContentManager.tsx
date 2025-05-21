
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ContentCard, { ContentItem, ContentType } from '@/components/ContentCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';

// Mock data
const generateMockContent = (type: ContentType, count: number): ContentItem[] => {
  const typeNames = {
    news: "News Update",
    music: "Music Track",
    podcast: "Podcast Episode",
    talk: "Talk Segment"
  };
  
  const typeTags = {
    news: ["Breaking", "Local", "World", "Sports", "Finance", "Weather"],
    music: ["Pop", "Rock", "Jazz", "Classical", "Electronic", "Hip Hop", "R&B"],
    podcast: ["Interview", "Story", "True Crime", "Comedy", "Technology", "Science"],
    talk: ["Intro", "Commentary", "Monologue", "Interview", "Station ID"]
  };
  
  const getRandomTags = (type: ContentType, count: number) => {
    const availableTags = typeTags[type];
    const shuffled = [...availableTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    title: `${typeNames[type]} ${i + 1}`,
    type,
    artist: type === 'news' ? "News Team" : type === 'music' ? `Artist ${i + 1}` : "Host Name",
    duration: `${Math.floor(Math.random() * 59) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
    createdAt: `May ${Math.floor(Math.random() * 20) + 1}, 2025`,
    tags: getRandomTags(type, Math.floor(Math.random() * 3) + 1),
    isActive: Math.random() > 0.2, // 80% chance of being active
  }));
};

const mockContentItems: Record<string, ContentItem[]> = {
  news: generateMockContent('news', 10),
  music: generateMockContent('music', 15),
  podcast: generateMockContent('podcast', 8),
  talk: generateMockContent('talk', 12)
};

const ContentManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterActive, setFilterActive] = useState<string>("all");
  
  // Get all content items
  const allContent = Object.values(mockContentItems).flat();
  
  // Filter content based on selected tab and search
  const getFilteredContent = () => {
    let filtered = selectedTab === "all" 
      ? allContent 
      : mockContentItems[selectedTab] || [];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.artist && item.artist.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply active/inactive filter
    if (filterActive !== "all") {
      const isActive = filterActive === "active";
      filtered = filtered.filter(item => item.isActive === isActive);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          const [aMin, aSec] = a.duration.split(":").map(Number);
          const [bMin, bSec] = b.duration.split(":").map(Number);
          return (aMin * 60 + aSec) - (bMin * 60 + bSec);
        default:
          return 0;
      }
    });
  };
  
  const filteredContent = getFilteredContent();
  
  return (
    <Layout>
      <AdminHeader 
        title="Content Manager" 
        description="Manage all your radio content in one place"
      />
      
      <div className="p-6">
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="podcast">Podcasts</TabsTrigger>
              <TabsTrigger value="talk">Talk</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Archived Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium">No content found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredContent.map((item) => (
                  <ContentCard 
                    key={item.id} 
                    item={item}
                    onPlay={() => {}}
                    onEdit={() => {}}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'} found
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ContentManager;
