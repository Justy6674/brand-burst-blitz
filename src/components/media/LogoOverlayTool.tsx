import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import {
  Download,
  Upload,
  Save,
  RotateCw,
  Move,
  Layers,
  Eye,
  EyeOff,
  Settings,
  ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface LogoOverlaySettings {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: number; // percentage of image width
  opacity: number; // 0-100
  margin: number; // pixels from edge
  rotation: number; // degrees
}

interface LogoOverlayToolProps {
  imageSrc: string;
  logoSrc?: string;
  onSave?: (processedImageBlob: Blob, filename: string) => void;
  onCancel?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogoOverlayTool: React.FC<LogoOverlayToolProps> = ({
  imageSrc,
  logoSrc: initialLogoSrc,
  onSave,
  onCancel,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const { currentProfile } = useBusinessProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoSrc, setLogoSrc] = useState(initialLogoSrc || currentProfile?.logo_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const [overlaySettings, setOverlaySettings] = useState<LogoOverlaySettings>({
    enabled: true,
    position: 'bottom-right',
    size: 15,
    opacity: 80,
    margin: 20,
    rotation: 0
  });

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const logo = logoRef.current;

    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw main image
    ctx.drawImage(image, 0, 0);

    // Draw logo overlay if enabled and logo is loaded
    if (overlaySettings.enabled && logo && logoLoaded && logoSrc) {
      ctx.save();

      // Calculate logo size
      const logoSize = (canvas.width * overlaySettings.size) / 100;
      const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
      const logoWidth = logoSize;
      const logoHeight = logoSize / logoAspectRatio;

      // Calculate position
      let x, y;
      const margin = overlaySettings.margin;

      switch (overlaySettings.position) {
        case 'top-left':
          x = margin;
          y = margin;
          break;
        case 'top-right':
          x = canvas.width - logoWidth - margin;
          y = margin;
          break;
        case 'bottom-left':
          x = margin;
          y = canvas.height - logoHeight - margin;
          break;
        case 'bottom-right':
          x = canvas.width - logoWidth - margin;
          y = canvas.height - logoHeight - margin;
          break;
        case 'center':
          x = (canvas.width - logoWidth) / 2;
          y = (canvas.height - logoHeight) / 2;
          break;
        default:
          x = canvas.width - logoWidth - margin;
          y = canvas.height - logoHeight - margin;
      }

      // Set opacity
      ctx.globalAlpha = overlaySettings.opacity / 100;

      // Apply rotation
      if (overlaySettings.rotation !== 0) {
        ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
        ctx.rotate((overlaySettings.rotation * Math.PI) / 180);
        ctx.translate(-logoWidth / 2, -logoHeight / 2);
        ctx.drawImage(logo, 0, 0, logoWidth, logoHeight);
      } else {
        ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      }

      ctx.restore();
    }
  }, [imageLoaded, logoLoaded, logoSrc, overlaySettings]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  useEffect(() => {
    if (imageSrc && imageRef.current) {
      imageRef.current.onload = () => {
        setImageLoaded(true);
      };
      imageRef.current.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    if (logoSrc && logoRef.current) {
      logoRef.current.onload = () => {
        setLogoLoaded(true);
      };
      logoRef.current.onerror = () => {
        setLogoLoaded(false);
        console.error('Failed to load logo:', logoSrc);
      };
      logoRef.current.src = logoSrc;
    } else {
      setLogoLoaded(false);
    }
  }, [logoSrc]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoSrc(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSettingChange = <K extends keyof LogoOverlaySettings>(
    key: K,
    value: LogoOverlaySettings[K]
  ) => {
    setOverlaySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: keyof LogoOverlaySettings, value: number[]) => {
    handleSettingChange(key, value[0] as any);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    setIsLoading(true);
    try {
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
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Error",
        description: "Failed to save image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `logo-overlay-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const presetPositions = [
    { label: 'Top Left', value: 'top-left' as const },
    { label: 'Top Right', value: 'top-right' as const },
    { label: 'Bottom Left', value: 'bottom-left' as const },
    { label: 'Bottom Right', value: 'bottom-right' as const },
    { label: 'Center', value: 'center' as const },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Logo Overlay Tool
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!imageLoaded}
              >
                <Download className="h-4 w-4" />
              </Button>
              {onSave && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading || !imageLoaded}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(90vh-120px)]">
          {/* Canvas Area */}
          <div className="lg:col-span-3 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
            {imageLoaded ? (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-lg rounded"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2" />
                <p>Loading image...</p>
              </div>
            )}
            
            {/* Hidden images for processing */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Main"
              style={{ display: 'none' }}
            />
            {logoSrc && (
              <img
                ref={logoRef}
                src={logoSrc}
                alt="Logo"
                style={{ display: 'none' }}
              />
            )}
          </div>

          {/* Controls Panel */}
          <div className="space-y-4 overflow-y-auto">
            {/* Logo Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Logo Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {logoSrc && logoLoaded && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <img src={logoSrc} alt="Logo preview" className="w-8 h-8 object-contain" />
                    <span className="text-xs text-muted-foreground flex-1">Logo loaded</span>
                    <Badge variant="secondary" className="text-xs">
                      <Eye className="h-3 w-3" />
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Logo
                  </Button>
                  
                  {currentProfile?.logo_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLogoSrc(currentProfile.logo_url!)}
                      className="w-full"
                    >
                      Use Business Logo
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Overlay Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Overlay Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enable Overlay</label>
                  <Switch
                    checked={overlaySettings.enabled}
                    onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                  />
                </div>

                {overlaySettings.enabled && (
                  <>
                    {/* Position */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Position</label>
                      <Select
                        value={overlaySettings.position}
                        onValueChange={(value: LogoOverlaySettings['position']) => 
                          handleSettingChange('position', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {presetPositions.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Size */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Size</label>
                        <span className="text-sm text-muted-foreground">{overlaySettings.size}%</span>
                      </div>
                      <Slider
                        value={[overlaySettings.size]}
                        onValueChange={(value) => handleSliderChange('size', value)}
                        min={5}
                        max={50}
                        step={1}
                      />
                    </div>

                    {/* Opacity */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Opacity</label>
                        <span className="text-sm text-muted-foreground">{overlaySettings.opacity}%</span>
                      </div>
                      <Slider
                        value={[overlaySettings.opacity]}
                        onValueChange={(value) => handleSliderChange('opacity', value)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>

                    {/* Margin */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Margin</label>
                        <span className="text-sm text-muted-foreground">{overlaySettings.margin}px</span>
                      </div>
                      <Slider
                        value={[overlaySettings.margin]}
                        onValueChange={(value) => handleSliderChange('margin', value)}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Rotation</label>
                        <span className="text-sm text-muted-foreground">{overlaySettings.rotation}°</span>
                      </div>
                      <Slider
                        value={[overlaySettings.rotation]}
                        onValueChange={(value) => handleSliderChange('rotation', value)}
                        min={-180}
                        max={180}
                        step={15}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverlaySettings({
                    enabled: true,
                    position: 'bottom-right',
                    size: 15,
                    opacity: 80,
                    margin: 20,
                    rotation: 0
                  })}
                  className="w-full justify-start"
                >
                  Watermark Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverlaySettings({
                    enabled: true,
                    position: 'center',
                    size: 30,
                    opacity: 40,
                    margin: 0,
                    rotation: -15
                  })}
                  className="w-full justify-start"
                >
                  Center Watermark
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverlaySettings({
                    enabled: true,
                    position: 'top-left',
                    size: 12,
                    opacity: 90,
                    margin: 15,
                    rotation: 0
                  })}
                  className="w-full justify-start"
                >
                  Brand Logo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};