
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from '@/components/Logo';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demo purposes, we'll just simulate a login process
    setTimeout(() => {
      setIsLoading(false);
      // For demo, any credentials work
      toast.success("Login successful");
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your radio admin dashboard
          </p>
        </div>
        
        <form 
          onSubmit={handleLogin} 
          className="w-full max-w-md space-y-4 border border-border rounded-lg p-6 shadow-md"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button type="button" variant="ghost" className="text-xs">
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        
        <div className="text-sm text-muted-foreground">
          For demo purposes, any credentials will work
        </div>
      </div>
    </div>
  );
};

export default Index;
