import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Save, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogoOverlayToolProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  baseImage: string;
  logoUrl?: string;
  onSave?: (finalImageBlob: Blob, filename: string) => void;
}

interface LogoSettings {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: number;
  opacity: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  visible: boolean;
}

export const LogoOverlayTool: React.FC<LogoOverlayToolProps> = ({
  isOpen,
  onOpenChange,
  baseImage,
  logoUrl: initialLogoUrl,
  onSave
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<HTMLImageElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl || '');
  
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    position: 'bottom-right',
    size: 20,
    opacity: 80,
    rotation: 0,
    offsetX: 20,
    offsetY: 20,
    visible: true
  });

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const baseImage = baseImageRef.current;
    const logoImage = logoImageRef.current;

    if (!canvas || !baseImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = baseImage.naturalWidth;
    canvas.height = baseImage.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0);

    if (logoSettings.visible && logoImage && logoImage.complete) {
      ctx.save();
      
      const logoSize = (logoSettings.size / 100) * Math.min(canvas.width, canvas.height) * 0.3;
      const logoWidth = logoSize;
      const logoHeight = (logoImage.naturalHeight / logoImage.naturalWidth) * logoSize;

      let x = 0;
      let y = 0;

      switch (logoSettings.position) {
        case 'top-left':
          x = logoSettings.offsetX;
          y = logoSettings.offsetY;
          break;
        case 'top-right':
          x = canvas.width - logoWidth - logoSettings.offsetX;
          y = logoSettings.offsetY;
          break;
        case 'bottom-left':
          x = logoSettings.offsetX;
          y = canvas.height - logoHeight - logoSettings.offsetY;
          break;
        case 'bottom-right':
          x = canvas.width - logoWidth - logoSettings.offsetX;
          y = canvas.height - logoHeight - logoSettings.offsetY;
          break;
        case 'center':
          x = (canvas.width - logoWidth) / 2 + logoSettings.offsetX;
          y = (canvas.height - logoHeight) / 2 + logoSettings.offsetY;
          break;
      }

      ctx.globalAlpha = logoSettings.opacity / 100;
      ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
      ctx.rotate((logoSettings.rotation * Math.PI) / 180);
      ctx.translate(-logoWidth / 2, -logoHeight / 2);
      ctx.drawImage(logoImage, 0, 0, logoWidth, logoHeight);
      ctx.restore();
    }
  };

  useEffect(() => {
    if (baseImage && baseImageRef.current) {
      baseImageRef.current.onload = drawCanvas;
      baseImageRef.current.src = baseImage;
    }
  }, [baseImage]);

  useEffect(() => {
    if (logoUrl && logoImageRef.current) {
      logoImageRef.current.onload = drawCanvas;
      logoImageRef.current.src = logoUrl;
    }
  }, [logoUrl]);

  useEffect(() => {
    drawCanvas();
  }, [logoSettings]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const filename = `logo-overlay-${Date.now()}.png`;
        onSave(blob, filename);
        toast({
          title: "Success",
          description: "Image with logo overlay saved successfully",
        });
      }
    }, 'image/png', 0.9);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Logo Overlay Tool</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const link = document.createElement('a');
                link.download = `logo-overlay-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
              }}>
                <Download className="h-4 w-4" />
              </Button>
              {onSave && (
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain shadow-lg"
            />
            <img ref={baseImageRef} style={{ display: 'none' }} />
            <img ref={logoImageRef} style={{ display: 'none' }} />
          </div>

          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Logo Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button asChild variant="outline" className="w-full">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Logo</label>
                  <Button
                    variant={logoSettings.visible ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLogoSettings(prev => ({ ...prev, visible: !prev.visible }))}
                  >
                    {logoSettings.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                {logoSettings.visible && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Position</label>
                      <Select 
                        value={logoSettings.position} 
                        onValueChange={(value) => setLogoSettings(prev => ({ 
                          ...prev, 
                          position: value as LogoSettings['position'] 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Size</label>
                        <span className="text-sm text-muted-foreground">{logoSettings.size}%</span>
                      </div>
                      <Slider
                        value={[logoSettings.size]}
                        onValueChange={(value) => setLogoSettings(prev => ({ ...prev, size: value[0] }))}
                        min={5}
                        max={50}
                        step={1}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Opacity</label>
                        <span className="text-sm text-muted-foreground">{logoSettings.opacity}%</span>
                      </div>
                      <Slider
                        value={[logoSettings.opacity]}
                        onValueChange={(value) => setLogoSettings(prev => ({ ...prev, opacity: value[0] }))}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};