
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ContentManager from "./pages/ContentManager";
import Templates from "./pages/Templates";
import Schedule from "./pages/Schedule";
import Player from "./pages/Player";
import EmbedPlayer from "./pages/EmbedPlayer";
import EmbedGenerator from "./pages/EmbedGenerator";
import RadioSettings from "./pages/RadioSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/embed" element={<EmbedPlayer />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/content" element={<ProtectedRoute><ContentManager /></ProtectedRoute>} />
            <Route path="/content/:type" element={<ProtectedRoute><ContentManager /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/player" element={<ProtectedRoute><Player /></ProtectedRoute>} />
            <Route path="/embed-generator" element={<ProtectedRoute><EmbedGenerator /></ProtectedRoute>} />
            <Route path="/radio-settings" element={<ProtectedRoute><RadioSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
