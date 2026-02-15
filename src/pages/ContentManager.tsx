import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Upload, Loader2 } from 'lucide-react';
import { useContentItems, useCreateContent, useDeleteContent, useUpdateContent, useUploadAudio, ContentType } from '@/hooks/useContentItems';
import ContentCard from '@/components/ContentCard';
import BulkUpload from '@/components/BulkUpload';
import { toast } from 'sonner';

const ContentManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New content form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('music');
  const [newArtist, setNewArtist] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeFilter = selectedTab === 'all' ? undefined : selectedTab as ContentType;
  const { data: contentItems = [], isLoading } = useContentItems(typeFilter);
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();
  const updateContent = useUpdateContent();
  const uploadAudio = useUploadAudio();

  const getFilteredContent = () => {
    let filtered = [...contentItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.artist && item.artist.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filterActive !== "all") {
      const isActive = filterActive === "active";
      filtered = filtered.filter(item => item.is_active === isActive);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl: string | undefined;

    if (selectedFile) {
      try {
        fileUrl = await uploadAudio.mutateAsync(selectedFile);
      } catch {
        return;
      }
    }

    await createContent.mutateAsync({
      title: newTitle,
      type: newType,
      artist: newArtist || undefined,
      duration: newDuration || undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()) : [],
      file_url: fileUrl,
      external_url: newExternalUrl || undefined,
    });

    // Reset form
    setNewTitle('');
    setNewType('music');
    setNewArtist('');
    setNewDuration('');
    setNewTags('');
    setNewExternalUrl('');
    setSelectedFile(null);
    setDialogOpen(false);
  };

  const filteredContent = getFilteredContent();

  const mapToCardItem = (item: typeof contentItems[0]) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    artist: item.artist || undefined,
    duration: item.duration || '0:00',
    createdAt: new Date(item.created_at).toLocaleDateString(),
    tags: item.tags,
    isActive: item.is_active,
  });

  return (
    <Layout>
      <AdminHeader title="Content Manager" description="Manage all your radio content" />

      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
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
                <Input placeholder="Search content..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Archived Only</SelectItem>
                </SelectContent>
              </Select>

              <BulkUpload />

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Content</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Content</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateContent} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="Content title" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newType} onValueChange={(v) => setNewType(v as ContentType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="news">News</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="talk">Talk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder="3:25" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Artist / Host</Label>
                      <Input value={newArtist} onChange={e => setNewArtist(e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma separated)</Label>
                      <Input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Pop, Rock, Morning" />
                    </div>
                    <div className="space-y-2">
                      <Label>Audio File</Label>
                      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                      <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        {selectedFile ? selectedFile.name : 'Choose audio file'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Or External URL</Label>
                      <Input value={newExternalUrl} onChange={e => setNewExternalUrl(e.target.value)} placeholder="https://example.com/audio.mp3" />
                    </div>
                    <Button type="submit" className="w-full" disabled={createContent.isPending || uploadAudio.isPending}>
                      {(createContent.isPending || uploadAudio.isPending) ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                      ) : 'Save Content'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium">No content found</h3>
                <p className="text-muted-foreground">Add your first content item to get started</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={mapToCardItem(item)}
                    onPlay={() => {
                      const url = item.file_url || item.external_url;
                      if (url) {
                        window.open(url, '_blank');
                      } else {
                        toast.info('No audio file attached');
                      }
                    }}
                    onEdit={() => {
                      updateContent.mutate({
                        id: item.id,
                        is_active: !item.is_active,
                      });
                    }}
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
