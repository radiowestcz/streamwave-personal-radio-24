
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Mic, Music, FileText, FileAudio, Clock, Plus, Edit, Trash2, Bell, Radio, Megaphone } from "lucide-react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';
import type { TemplateSlot } from '@/hooks/useTemplates';
import type { ContentType } from '@/hooks/useContentItems';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'news', label: 'News' },
  { value: 'music', label: 'Music' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'talk', label: 'Talk' },
  { value: 'jingle_news', label: 'Jingle News' },
  { value: 'jingle_talk', label: 'Jingle Talk' },
  { value: 'jingle_podcast', label: 'Jingle Podcast' },
  { value: 'station_id', label: 'Station ID' },
  { value: 'promo', label: 'Promo' },
];

const contentTypeIcons: Record<string, JSX.Element> = {
  news: <FileText className="h-4 w-4 text-news" />,
  music: <Music className="h-4 w-4 text-music" />,
  podcast: <FileAudio className="h-4 w-4 text-podcast" />,
  talk: <Mic className="h-4 w-4 text-talk" />,
  jingle_news: <Bell className="h-4 w-4 text-jingle-news" />,
  jingle_talk: <Bell className="h-4 w-4 text-jingle-talk" />,
  jingle_podcast: <Bell className="h-4 w-4 text-jingle-podcast" />,
  station_id: <Radio className="h-4 w-4 text-station-id" />,
  promo: <Megaphone className="h-4 w-4 text-promo" />,
};

const contentTypeLabels: Record<string, string> = Object.fromEntries(CONTENT_TYPES.map(ct => [ct.value, ct.label]));

const emptySlot = (): TemplateSlot => ({
  id: crypto.randomUUID(),
  time: ':00',
  contentType: 'music',
  duration: '5:00',
});

const Templates: React.FC = () => {
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<TemplateSlot[]>([emptySlot()]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSlots([emptySlot()]);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (t: typeof templates[0]) => {
    setEditingId(t.id);
    setName(t.name);
    setDescription(t.description || '');
    setSlots(t.slots.length > 0 ? t.slots : [emptySlot()]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), description: description.trim(), slots };
    if (editingId) {
      updateTemplate.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createTemplate.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const updateSlot = (index: number, patch: Partial<TemplateSlot>) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const addSlot = () => {
    setSlots(prev => [...prev, emptySlot()]);
  };

  return (
    <Layout>
      <AdminHeader 
        title="Šablony" 
        description="Vytváření a správa vysílacích šablon"
      />
      
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hour Clock Šablony
          </h2>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nová šablona
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Načítání…</p>
        ) : templates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Zatím nemáte žádné šablony.</p>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Vytvořit první šablonu</Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden flex flex-col">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  {template.description && (
                    <p className="text-muted-foreground text-sm">{template.description}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  {template.slots.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {template.slots.slice(0, 5).map((slot) => (
                        <div key={slot.id} className="flex justify-between items-center text-sm border rounded px-3 py-2">
                          <div className="flex items-center gap-2">
                            {contentTypeIcons[slot.contentType]}
                            <span className="font-medium">{slot.time}</span>
                            <Badge variant="secondary" className="text-xs">{contentTypeLabels[slot.contentType]}</Badge>
                          </div>
                          <span className="text-muted-foreground">{slot.duration}</span>
                        </div>
                      ))}
                      {template.slots.length > 5 && (
                        <p className="text-center text-xs text-muted-foreground">+ {template.slots.length - 5} dalších slotů</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Žádné sloty</p>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/30 p-4 gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openEdit(template)}>
                    <Edit className="mr-2 h-4 w-4" /> Upravit
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteTemplate.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Upravit šablonu' : 'Nová šablona'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Název</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Např. Morning Drive" />
              </div>
              <div className="space-y-2">
                <Label>Popis</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Popis šablony" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Sloty</Label>
                <Button size="sm" variant="outline" onClick={addSlot}>
                  <Plus className="mr-1 h-3 w-3" /> Přidat slot
                </Button>
              </div>

              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {slots.map((slot, i) => (
                  <div key={slot.id} className="p-3 flex flex-wrap gap-3 items-end">
                    <div className="w-20">
                      <Label className="text-xs">Čas</Label>
                      <Input
                        className="h-8"
                        value={slot.time}
                        onChange={e => updateSlot(i, { time: e.target.value })}
                        placeholder=":00"
                      />
                    </div>
                    <div className="w-36">
                      <Label className="text-xs">Typ obsahu</Label>
                      <Select value={slot.contentType} onValueChange={(v) => updateSlot(i, { contentType: v as ContentType })}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map(ct => (
                            <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Délka</Label>
                      <Input
                        className="h-8"
                        value={slot.duration}
                        onChange={e => updateSlot(i, { duration: e.target.value })}
                        placeholder="5:00"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSlot(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Zrušit</Button>
            <Button onClick={handleSave} disabled={!name.trim() || createTemplate.isPending || updateTemplate.isPending}>
              {editingId ? 'Uložit' : 'Vytvořit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Templates;
