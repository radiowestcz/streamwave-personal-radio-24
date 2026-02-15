import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useScheduleSlots, useCreateScheduleSlot, useDeleteScheduleSlot } from '@/hooks/useScheduleSlots';
import { useTemplates } from '@/hooks/useTemplates';

const DAYS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const SLOT_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-red-500',
];

const formatHour = (h: number) =>
  h === 0 ? '0:00' : h < 10 ? `${h}:00` : `${h}:00`;

const Schedule: React.FC = () => {
  const { data: slots = [], isLoading } = useScheduleSlots();
  const { data: templates = [] } = useTemplates();
  const createSlot = useCreateScheduleSlot();
  const deleteSlot = useDeleteScheduleSlot();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDay, setNewDay] = useState('1');
  const [newStart, setNewStart] = useState('6');
  const [newEnd, setNewEnd] = useState('10');
  const [newTemplateId, setNewTemplateId] = useState('');

  // Color mapping per template
  const templateColorMap = new Map<string, string>();
  templates.forEach((t, i) => {
    templateColorMap.set(t.id, SLOT_COLORS[i % SLOT_COLORS.length]);
  });

  const handleCreate = () => {
    if (!newTemplateId) return;
    createSlot.mutate({
      day_of_week: parseInt(newDay),
      start_hour: parseInt(newStart),
      end_hour: parseInt(newEnd),
      template_id: newTemplateId,
    }, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const getSlotsForDay = (day: number) => slots.filter(s => s.day_of_week === day);

  return (
    <Layout>
      <AdminHeader title="Rozvrh vysílání" description="Přiřaďte šablony ke dnům a hodinám" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <span key={t.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${templateColorMap.get(t.id)}`}>
                {t.name}
              </span>
            ))}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Přidat slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nový slot v rozvrhu</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Den</Label>
                  <Select value={newDay} onValueChange={setNewDay}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Od (hodina)</Label>
                    <Select value={newStart} onValueChange={setNewStart}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HOURS.map(h => <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Do (hodina)</Label>
                    <Select value={newEnd} onValueChange={setNewEnd}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HOURS.filter(h => h > 0).map(h => <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Šablona</Label>
                  <Select value={newTemplateId} onValueChange={setNewTemplateId}>
                    <SelectTrigger><SelectValue placeholder="Vyber šablonu" /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={createSlot.isPending || !newTemplateId}>
                  {createSlot.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Přidat
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 font-medium text-sm text-muted-foreground">Čas</div>
                  {DAYS.map((d, i) => (
                    <div key={i} className="p-3 font-medium text-sm text-center border-l">{d}</div>
                  ))}
                </div>
                <div className="relative">
                  {/* Hour grid lines */}
                  <div className="grid grid-cols-8">
                    <div>
                      {HOURS.map(h => (
                        <div key={h} className="h-12 flex items-center justify-end pr-3 text-xs text-muted-foreground border-b">
                          {formatHour(h)}
                        </div>
                      ))}
                    </div>
                    {DAYS.map((_, dayIdx) => (
                      <div key={dayIdx} className="relative border-l" style={{ height: `${24 * 3}rem` }}>
                        {HOURS.map(h => (
                          <div key={h} className="absolute w-full border-b border-border/50" style={{ top: `${h * 3}rem`, height: '3rem' }} />
                        ))}
                        {getSlotsForDay(dayIdx).map(slot => {
                          const color = templateColorMap.get(slot.template_id) || 'bg-primary';
                          const templateName = slot.template?.name || 'Šablona';
                          return (
                            <div
                              key={slot.id}
                              className={`absolute left-1 right-1 rounded-md ${color} text-white p-1.5 overflow-hidden group cursor-default`}
                              style={{
                                top: `${slot.start_hour * 3}rem`,
                                height: `${(slot.end_hour - slot.start_hour) * 3}rem`,
                              }}
                            >
                              <div className="font-medium text-xs leading-tight">{templateName}</div>
                              <div className="text-[10px] opacity-80">{formatHour(slot.start_hour)} – {formatHour(slot.end_hour)}</div>
                              <button
                                onClick={() => deleteSlot.mutate(slot.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded p-0.5"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
