
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek } from "date-fns";

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours = Array.from({ length: 24 }, (_, i) => i);

interface ScheduleSlot {
  id: string;
  day: string;
  startHour: number;
  endHour: number;
  template: {
    id: string;
    name: string;
    color: string;
  };
}

// Mock data
const mockScheduleSlots: ScheduleSlot[] = [
  {
    id: "slot-1",
    day: "Monday",
    startHour: 6,
    endHour: 10,
    template: { id: "t1", name: "Morning Drive", color: "bg-blue-500" }
  },
  {
    id: "slot-2",
    day: "Monday",
    startHour: 10,
    endHour: 13,
    template: { id: "t2", name: "Midday Mix", color: "bg-green-500" }
  },
  {
    id: "slot-3",
    day: "Monday",
    startHour: 13,
    endHour: 16,
    template: { id: "t3", name: "Afternoon Show", color: "bg-yellow-500" }
  },
  {
    id: "slot-4",
    day: "Monday",
    startHour: 16,
    endHour: 19,
    template: { id: "t4", name: "Evening Drive", color: "bg-purple-500" }
  },
  {
    id: "slot-5",
    day: "Monday",
    startHour: 19,
    endHour: 22,
    template: { id: "t5", name: "Evening Show", color: "bg-pink-500" }
  },
  {
    id: "slot-6",
    day: "Tuesday",
    startHour: 6,
    endHour: 10,
    template: { id: "t1", name: "Morning Drive", color: "bg-blue-500" }
  },
  {
    id: "slot-7",
    day: "Tuesday",
    startHour: 10,
    endHour: 13,
    template: { id: "t2", name: "Midday Mix", color: "bg-green-500" }
  },
  {
    id: "slot-8",
    day: "Wednesday",
    startHour: 6,
    endHour: 10,
    template: { id: "t1", name: "Morning Drive", color: "bg-blue-500" }
  },
  {
    id: "slot-9",
    day: "Wednesday",
    startHour: 10,
    endHour: 13,
    template: { id: "t2", name: "Midday Mix", color: "bg-green-500" }
  },
  {
    id: "slot-10",
    day: "Thursday",
    startHour: 6,
    endHour: 10,
    template: { id: "t1", name: "Morning Drive", color: "bg-blue-500" }
  },
  {
    id: "slot-11",
    day: "Friday",
    startHour: 6,
    endHour: 10,
    template: { id: "t1", name: "Morning Drive", color: "bg-blue-500" }
  },
  {
    id: "slot-12",
    day: "Saturday",
    startHour: 8,
    endHour: 12,
    template: { id: "t6", name: "Weekend Morning", color: "bg-orange-500" }
  },
  {
    id: "slot-13",
    day: "Sunday",
    startHour: 8,
    endHour: 12,
    template: { id: "t6", name: "Weekend Morning", color: "bg-orange-500" }
  },
];

const Schedule: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<string>("week");
  
  const formatHour = (hour: number) => {
    return hour === 0 ? "12 AM" : 
           hour < 12 ? `${hour} AM` : 
           hour === 12 ? "12 PM" : 
           `${hour - 12} PM`;
  };
  
  const getScheduleForDay = (day: string) => {
    return mockScheduleSlots.filter(slot => slot.day === day);
  };
  
  const renderWeekSchedule = () => {
    return (
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-1">
            {/* Time labels column */}
            <div className="col-span-1">
              <div className="h-12 flex items-end justify-center pb-2 font-medium">
                Time
              </div>
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-center justify-end pr-4 text-sm">
                  {formatHour(hour)}
                </div>
              ))}
            </div>
            
            {/* Days columns */}
            {days.map(day => (
              <div key={day} className="col-span-1">
                <div className="h-12 bg-muted flex items-center justify-center font-medium">
                  {day}
                </div>
                <div className="relative" style={{ height: `${hours.length * 4}rem` }}>
                  {hours.map(hour => (
                    <div 
                      key={hour} 
                      className="absolute w-full h-16 border-t border-border"
                      style={{ top: `${hour * 4}rem` }}
                    />
                  ))}
                  
                  {getScheduleForDay(day).map(slot => (
                    <div
                      key={slot.id}
                      className={`absolute w-full rounded-md ${slot.template.color} bg-opacity-80 text-white p-2 overflow-hidden`}
                      style={{
                        top: `${slot.startHour * 4}rem`,
                        height: `${(slot.endHour - slot.startHour) * 4}rem`
                      }}
                    >
                      <div className="font-medium text-sm">{slot.template.name}</div>
                      <div className="text-xs opacity-80">
                        {formatHour(slot.startHour)} - {formatHour(slot.endHour)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <AdminHeader 
        title="Broadcast Schedule" 
        description="Manage when templates are broadcast"
      />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
              />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">View Mode</div>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="View mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week View</SelectItem>
                    <SelectItem value="day">Day View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Templates</div>
                <div className="space-y-2">
                  <Badge className="bg-blue-500 hover:bg-blue-600">Morning Drive</Badge>
                  <Badge className="bg-green-500 hover:bg-green-600">Midday Mix</Badge>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">Afternoon Show</Badge>
                  <Badge className="bg-purple-500 hover:bg-purple-600">Evening Drive</Badge>
                  <Badge className="bg-pink-500 hover:bg-pink-600">Evening Show</Badge>
                  <Badge className="bg-orange-500 hover:bg-orange-600">Weekend Morning</Badge>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                Add Schedule Slot
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {renderWeekSchedule()}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
