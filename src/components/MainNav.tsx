
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  Mic, 
  Music, 
  Calendar, 
  Clock, 
  Upload, 
  Tag, 
  FileAudio, 
  Play, 
  Folder, 
  FileText
} from 'lucide-react';

const MainNav: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const [activeGroup, setActiveGroup] = useState<string | null>("content");
  
  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (prefix: string) => location.pathname.startsWith(prefix);
  
  const navLinks = [
    { 
      group: "content",
      label: "Content",
      links: [
        { href: "/content", label: "All Content", icon: <Folder className="w-4 h-4" /> },
        { href: "/content/news", label: "News", icon: <FileText className="w-4 h-4" /> },
        { href: "/content/music", label: "Music", icon: <Music className="w-4 h-4" /> },
        { href: "/content/podcasts", label: "Podcasts", icon: <FileAudio className="w-4 h-4" /> },
        { href: "/content/talk", label: "Talk", icon: <Mic className="w-4 h-4" /> },
        { href: "/content/upload", label: "Upload", icon: <Upload className="w-4 h-4" /> },
      ]
    },
    {
      group: "programming",
      label: "Programming",
      links: [
        { href: "/templates", label: "Templates", icon: <Clock className="w-4 h-4" /> },
        { href: "/schedule", label: "Schedule", icon: <Calendar className="w-4 h-4" /> },
        { href: "/tags", label: "Categories & Tags", icon: <Tag className="w-4 h-4" /> },
      ]
    },
    {
      group: "preview",
      label: "Preview",
      links: [
        { href: "/player", label: "Player", icon: <Play className="w-4 h-4" /> },
      ]
    }
  ];

  React.useEffect(() => {
    // Set active group based on current path
    for (const group of navLinks) {
      const isCurrentGroupActive = group.links.some(link => location.pathname.startsWith(link.href));
      if (isCurrentGroupActive) {
        setActiveGroup(group.group);
        break;
      }
    }
  }, [location.pathname]);

  const getNavItemClass = (isItemActive: boolean) => {
    return `flex items-center gap-2 px-3 py-2 rounded-md w-full transition-colors ${
      isItemActive 
        ? 'bg-primary text-primary-foreground font-medium' 
        : 'hover:bg-muted text-foreground hover:text-foreground'
    }`;
  };

  return (
    <Sidebar
      className={`border-r border-border ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}
      collapsible
    >
      <div className={`flex items-center justify-between p-4 ${collapsed ? "px-2" : "px-4"}`}>
        <Link to="/dashboard" className="flex-1">
          <Logo variant={collapsed ? "icon" : "full"} />
        </Link>
      </div>
      
      <SidebarContent className="px-2">
        {navLinks.map((group) => (
          <SidebarGroup 
            key={group.group}
            open={activeGroup === group.group}
            onOpenChange={() => setActiveGroup(activeGroup === group.group ? null : group.group)}
          >
            <SidebarGroupLabel 
              className={`text-xs text-muted-foreground uppercase ${collapsed ? 'sr-only' : ''}`}
            >
              {group.label}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.links.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={link.href}
                        className={getNavItemClass(isActive(link.href))}
                      >
                        {link.icon}
                        {!collapsed && <span>{link.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <div className="mt-auto p-4 border-t border-border">
        <SidebarTrigger />
      </div>
    </Sidebar>
  );
};

export default MainNav;
