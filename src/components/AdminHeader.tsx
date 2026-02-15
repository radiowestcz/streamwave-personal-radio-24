import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description }) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  return (
    <div className="border-b border-border">
      <div className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toast({ title: "Notifications", description: "You have no new notifications" })}
            className="relative"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
