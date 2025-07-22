import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  RotateCcw,
  RotateCw,
  Crop,
  Palette,
  Download,
  Undo,
  Redo,
  Save,
  X,
  Move,
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast,
  Droplets
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
import { Separator } from '@/components/ui/separator';

interface ImageEditorProps {
  imageSrc: string;
  onSave?: (editedImageBlob: Blob, filename: string) => void;
  onCancel?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditorState {
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  scale: number;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface HistoryState extends EditorState {
  id: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSrc,
  onSave,
  onCancel,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'crop'>('adjust');
  
  const [editorState, setEditorState] = useState<EditorState>({
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    scale: 1,
  });

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cropMode, setCropMode] = useState(false);
  const [cropAspectRatio, setCropAspectRatio] = useState<string>('free');

  const saveToHistory = useCallback((state: EditorState) => {
    const newState: HistoryState = {
      ...state,
      id: Date.now().toString()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setEditorState(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setEditorState(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();

    // Center the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((editorState.rotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(editorState.scale, editorState.scale);

    // Draw image
    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();

    // Apply filters
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = Math.min(255, data[i] * (editorState.brightness / 100));
      data[i + 1] = Math.min(255, data[i + 1] * (editorState.brightness / 100));
      data[i + 2] = Math.min(255, data[i + 2] * (editorState.brightness / 100));

      // Apply contrast
      const factor = (259 * (editorState.contrast + 255)) / (255 * (259 - editorState.contrast));
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));

      // Apply saturation
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = Math.min(255, gray + (data[i] - gray) * (editorState.saturation / 100));
      data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * (editorState.saturation / 100));
      data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * (editorState.saturation / 100));
    }

    ctx.putImageData(imageData, 0, 0);
  }, [editorState]);

  useEffect(() => {
    if (imageSrc && imageRef.current) {
      imageRef.current.onload = () => {
        applyFilters();
      };
      imageRef.current.src = imageSrc;
    }
  }, [imageSrc, applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [editorState, applyFilters]);

  const handleSliderChange = (property: keyof EditorState, value: number[]) => {
    const newState = { ...editorState, [property]: value[0] };
    setEditorState(newState);
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const rotation = direction === 'left' 
      ? editorState.rotation - 90 
      : editorState.rotation + 90;
    const newState = { ...editorState, rotation };
    setEditorState(newState);
    saveToHistory(newState);
  };

  const resetFilters = () => {
    const resetState: EditorState = {
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      scale: 1,
    };
    setEditorState(resetState);
    saveToHistory(resetState);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    setIsLoading(true);
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const filename = `edited-image-${Date.now()}.png`;
          onSave(blob, filename);
          toast({
            title: "Success",
            description: "Image saved successfully",
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
    link.download = `edited-image-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const presetFilters = [
    { name: 'Original', brightness: 100, contrast: 100, saturation: 100 },
    { name: 'Bright', brightness: 120, contrast: 110, saturation: 105 },
    { name: 'High Contrast', brightness: 105, contrast: 130, saturation: 100 },
    { name: 'Vintage', brightness: 110, contrast: 120, saturation: 80 },
    { name: 'B&W', brightness: 100, contrast: 110, saturation: 0 },
    { name: 'Warm', brightness: 110, contrast: 105, saturation: 120 },
    { name: 'Cool', brightness: 95, contrast: 105, saturation: 110 },
  ];

  const applyPresetFilter = (preset: typeof presetFilters[0]) => {
    const newState = {
      ...editorState,
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
    };
    setEditorState(newState);
    saveToHistory(newState);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Image Editor</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              {onSave && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(90vh-120px)]">
          {/* Canvas Area */}
          <div className="lg:col-span-3 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
            <div className="relative max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-lg"
                style={{ display: 'block' }}
              />
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Edit preview"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4 overflow-y-auto">
            {/* Tab Navigation */}
            <div className="flex border rounded-lg p-1 bg-muted/30">
              <Button
                variant={activeTab === 'adjust' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab('adjust')}
              >
                <Sun className="h-4 w-4 mr-1" />
                Adjust
              </Button>
              <Button
                variant={activeTab === 'filters' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab('filters')}
              >
                <Palette className="h-4 w-4 mr-1" />
                Filters
              </Button>
              <Button
                variant={activeTab === 'crop' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab('crop')}
              >
                <Crop className="h-4 w-4 mr-1" />
                Transform
              </Button>
            </div>

            {/* Adjust Panel */}
            {activeTab === 'adjust' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Adjustments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Brightness</label>
                      <span className="text-sm text-muted-foreground">{editorState.brightness}%</span>
                    </div>
                    <Slider
                      value={[editorState.brightness]}
                      onValueChange={(value) => handleSliderChange('brightness', value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Contrast</label>
                      <span className="text-sm text-muted-foreground">{editorState.contrast}%</span>
                    </div>
                    <Slider
                      value={[editorState.contrast]}
                      onValueChange={(value) => handleSliderChange('contrast', value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Saturation</label>
                      <span className="text-sm text-muted-foreground">{editorState.saturation}%</span>
                    </div>
                    <Slider
                      value={[editorState.saturation]}
                      onValueChange={(value) => handleSliderChange('saturation', value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="w-full"
                  >
                    Reset All
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Filters Panel */}
            {activeTab === 'filters' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Preset Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {presetFilters.map((filter) => (
                    <Button
                      key={filter.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPresetFilter(filter)}
                      className="w-full justify-start"
                    >
                      {filter.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Transform Panel */}
            {activeTab === 'crop' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Transform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rotation */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rotation</label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRotate('left')}
                        className="flex-1"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Left
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRotate('right')}
                        className="flex-1"
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        Right
                      </Button>
                    </div>
                  </div>

                  {/* Scale */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Scale</label>
                      <span className="text-sm text-muted-foreground">{Math.round(editorState.scale * 100)}%</span>
                    </div>
                    <Slider
                      value={[editorState.scale]}
                      onValueChange={(value) => handleSliderChange('scale', value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                    />
                  </div>

                  {/* Crop Aspect Ratio */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Crop Ratio</label>
                    <Select value={cropAspectRatio} onValueChange={setCropAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free Form</SelectItem>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="4:3">4:3</SelectItem>
                        <SelectItem value="3:2">3:2</SelectItem>
                        <SelectItem value="16:9">16:9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};