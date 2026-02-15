import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Code } from 'lucide-react';
import { toast } from 'sonner';

const EmbedGenerator: React.FC = () => {
  const [width, setWidth] = useState('400');
  const [height, setHeight] = useState('250');
  const [theme, setTheme] = useState('dark');
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed?theme=${theme}`;

  const embedCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="autoplay"
  style="border-radius: 12px; border: none;"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <AdminHeader title="Embed Player" description="Get embed code for your website" />

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Embed Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input value={width} onChange={e => setWidth(e.target.value)} type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input value={height} onChange={e => setHeight(e.target.value)} type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Embed Code</Label>
                <Textarea value={embedCode} readOnly className="font-mono text-xs h-32" />
              </div>

              <Button onClick={handleCopy} className="w-full">
                {copied ? <><Check className="mr-2 h-4 w-4" /> Copied!</> : <><Copy className="mr-2 h-4 w-4" /> Copy Embed Code</>}
              </Button>

              <div className="space-y-2">
                <Label>Direct Link</Label>
                <div className="flex gap-2">
                  <Input value={embedUrl} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(embedUrl); toast.success('Link copied!'); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg min-h-[300px]">
                <iframe
                  src={embedUrl}
                  width={width}
                  height={height}
                  style={{ borderRadius: '12px', border: 'none' }}
                  allow="autoplay"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmbedGenerator;
