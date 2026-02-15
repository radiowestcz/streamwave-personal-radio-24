import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileAudio, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUploadAudio, useCreateContent, ContentType } from '@/hooks/useContentItems';
import { Input } from '@/components/ui/input';

interface FileUploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

const BulkUpload: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [category, setCategory] = useState<ContentType>('music');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAudio = useUploadAudio();
  const createContent = useCreateContent();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newItems: FileUploadItem[] = selectedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    const newItems: FileUploadItem[] = droppedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newItems]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    const tagList = tags ? tags.split(',').map(t => t.trim()) : [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') continue;

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading', progress: 30 } : f));

      try {
        const fileUrl = await uploadAudio.mutateAsync(files[i].file);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 70 } : f));

        const title = files[i].file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        await createContent.mutateAsync({
          title,
          type: category,
          tags: tagList,
          file_url: fileUrl,
        });

        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', progress: 100 } : f));
      } catch (err: any) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.message, progress: 0 } : f));
      }
    }

    setIsUploading(false);
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  const resetAndClose = () => {
    setFiles([]);
    setTags('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isUploading) { if (!v) resetAndClose(); else setOpen(true); } }}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Audio Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ContentType)}>
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
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Pop, Morning" />
            </div>
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Click or drag & drop audio files here</p>
            <p className="text-sm text-muted-foreground mt-1">MP3, WAV, OGG, FLAC supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{files.length} files selected</span>
                <span>{doneCount}/{files.length} uploaded</span>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {files.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <FileAudio className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.file.name}</p>
                      {item.status === 'uploading' && <Progress value={item.progress} className="h-1 mt-1" />}
                      {item.status === 'error' && <p className="text-xs text-destructive">{item.error}</p>}
                    </div>
                    {item.status === 'done' && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    {item.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                    {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                    {item.status === 'pending' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={handleUploadAll}
                disabled={isUploading || pendingCount === 0}
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : doneCount === files.length && files.length > 0 ? (
                  'All Done!'
                ) : (
                  `Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUpload;
