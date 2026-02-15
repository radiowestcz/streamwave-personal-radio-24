import React, { useRef } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Image, Music2, Loader2 } from 'lucide-react';
import { useRadioSettings, useUpsertSetting, useUploadCover, useUploadUnderscore } from '@/hooks/useContentItems';
import { toast } from 'sonner';

const settingsConfig = [
  { key: 'default_cover_news', label: 'Default Cover – News', type: 'image' },
  { key: 'default_cover_music', label: 'Default Cover – Music', type: 'image' },
  { key: 'default_cover_podcast', label: 'Default Cover – Podcast', type: 'image' },
  { key: 'default_cover_talk', label: 'Default Cover – Talk', type: 'image' },
  { key: 'default_underscore_news', label: 'Default Underscore – News', type: 'audio' },
  { key: 'default_underscore_talk', label: 'Default Underscore – Talk', type: 'audio' },
  { key: 'crossfade_duration', label: 'Crossfade Duration (seconds)', type: 'number' },
  { key: 'underscore_volume', label: 'Underscore Volume (%)', type: 'number' },
];

const RadioSettings: React.FC = () => {
  const { data: settings = {}, isLoading } = useRadioSettings();
  const upsertSetting = useUpsertSetting();
  const uploadCover = useUploadCover();
  const uploadUnderscore = useUploadUnderscore();

  const handleFileUpload = async (key: string, file: File, type: 'image' | 'audio') => {
    try {
      let url: string;
      if (type === 'image') {
        url = await uploadCover.mutateAsync(file);
      } else {
        url = await uploadUnderscore.mutateAsync(file);
      }
      await upsertSetting.mutateAsync({ key, value: url });
      toast.success('Setting updated');
    } catch {
      // error handled by mutation
    }
  };

  const handleNumberChange = async (key: string, value: string) => {
    await upsertSetting.mutateAsync({ key, value });
    toast.success('Setting updated');
  };

  if (isLoading) {
    return (
      <Layout>
        <AdminHeader title="Radio Settings" description="Configure default covers, underscore and crossfading" />
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminHeader title="Radio Settings" description="Configure default covers, underscore and crossfading" />
      <div className="p-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Default Covers</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settingsConfig.filter(s => s.type === 'image').map((s) => (
              <SettingFileRow key={s.key} label={s.label} currentUrl={settings[s.key]} accept="image/*"
                onUpload={(file) => handleFileUpload(s.key, file, 'image')}
                isUploading={uploadCover.isPending}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Music2 className="h-5 w-5" /> Underscore & Crossfade</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settingsConfig.filter(s => s.type === 'audio').map((s) => (
              <SettingFileRow key={s.key} label={s.label} currentUrl={settings[s.key]} accept="audio/*"
                onUpload={(file) => handleFileUpload(s.key, file, 'audio')}
                isUploading={uploadUnderscore.isPending}
              />
            ))}
            {settingsConfig.filter(s => s.type === 'number').map((s) => (
              <div key={s.key} className="space-y-1">
                <Label>{s.label}</Label>
                <Input
                  type="number"
                  value={settings[s.key] || (s.key === 'crossfade_duration' ? '3' : '15')}
                  onChange={(e) => handleNumberChange(s.key, e.target.value)}
                  className="w-32"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

const SettingFileRow: React.FC<{
  label: string;
  currentUrl?: string;
  accept: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
}> = ({ label, currentUrl, accept, onUpload, isUploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {currentUrl && accept.startsWith('image') && (
          <img src={currentUrl} alt={label} className="h-10 w-10 rounded object-cover" />
        )}
        {currentUrl && accept.startsWith('audio') && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{currentUrl.split('/').pop()}</span>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }}
        />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default RadioSettings;
