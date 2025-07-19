import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Trash2, 
  Eye, 
  Copy,
  Edit,
  Sparkles,
  Palette,
  Type,
  Square
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogImage {
  id: string;
  url: string;
  filename: string;
  alt_text?: string;
  tags: string[];
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  created_at: string;
  business_id: string;
  folder?: string;
}

interface BlogImageLibraryProps {
  businessId: string;
  onSelectImage?: (image: BlogImage) => void;
  mode?: 'selector' | 'manager';
}

export const BlogImageLibrary: React.FC<BlogImageLibraryProps> = ({ 
  businessId, 
  onSelectImage, 
  mode = 'manager' 
}) => {
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<BlogImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<BlogImage | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, [businessId]);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_images')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error",
        description: "Failed to load images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Create file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Save to database
        const { error: dbError } = await supabase
          .from('blog_images')
          .insert({
            business_id: businessId,
            filename: file.name,
            url: urlData.publicUrl,
            size: file.size,
            dimensions,
            tags: [],
            alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
          });

        if (dbError) throw dbError;

        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded.`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}.`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    loadImages();
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleGenerateAIImage = async (prompt: string) => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { 
          prompt, 
          business_id: businessId 
        }
      });

      if (error) throw error;

      toast({
        title: "AI Image Generated",
        description: "Your AI-generated image has been added to the library.",
      });
      
      loadImages();
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteImage = async (image: BlogImage) => {
    try {
      // Delete from storage
      const fileName = image.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('blog-images')
          .remove([`${businessId}/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('blog_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      toast({
        title: "Image Deleted",
        description: "The image has been removed from your library.",
      });
      
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateImage = async (image: BlogImage, updates: Partial<BlogImage>) => {
    try {
      const { error } = await supabase
        .from('blog_images')
        .update(updates)
        .eq('id', image.id);

      if (error) throw error;

      toast({
        title: "Image Updated",
        description: "Image details have been saved.",
      });
      
      loadImages();
      setEditingImage(null);
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Image URL has been copied to clipboard.",
    });
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = searchTerm === '' || 
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => image.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(images.flatMap(img => img.tags)));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Image Library</h2>
          <p className="text-muted-foreground">Manage and organize your blog images</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Image</DialogTitle>
                <DialogDescription>
                  Describe the image you want to generate
                </DialogDescription>
              </DialogHeader>
              <AIImageGenerator 
                onGenerate={handleGenerateAIImage}
                generating={generating}
              />
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative group">
                <img
                  src={image.url}
                  alt={image.alt_text || image.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyImageUrl(image.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {mode === 'selector' && onSelectImage && (
                    <Button
                      size="sm"
                      onClick={() => onSelectImage(image)}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs truncate font-medium">{image.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {image.dimensions.width}×{image.dimensions.height} • {formatFileSize(image.size)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={image.url}
                    alt={image.alt_text || image.filename}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{image.filename}</h4>
                    <p className="text-sm text-muted-foreground">
                      {image.dimensions.width}×{image.dimensions.height} • {formatFileSize(image.size)}
                    </p>
                    {image.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {image.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingImage(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyImageUrl(image.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {mode === 'selector' && onSelectImage && (
                      <Button
                        size="sm"
                        onClick={() => onSelectImage(image)}
                      >
                        Select
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImage.filename}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt_text || selectedImage.filename}
                className="w-full max-h-96 object-contain"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Dimensions:</strong> {selectedImage.dimensions.width}×{selectedImage.dimensions.height}
                </div>
                <div>
                  <strong>File Size:</strong> {formatFileSize(selectedImage.size)}
                </div>
                <div>
                  <strong>Alt Text:</strong> {selectedImage.alt_text || 'Not set'}
                </div>
                <div>
                  <strong>Tags:</strong> {selectedImage.tags.join(', ') || 'None'}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Image Details</DialogTitle>
            </DialogHeader>
            <ImageEditor 
              image={editingImage}
              onSave={(updates) => handleUpdateImage(editingImage, updates)}
              onCancel={() => setEditingImage(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// AI Image Generator Component
const AIImageGenerator: React.FC<{
  onGenerate: (prompt: string) => void;
  generating: boolean;
}> = ({ onGenerate, generating }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photographic');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image Description</Label>
        <textarea
          className="w-full min-h-[100px] p-3 border rounded-md resize-none"
          placeholder="Describe the image you want to generate in detail..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Style</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="photographic">Photographic</option>
            <option value="digital-art">Digital Art</option>
            <option value="illustration">Illustration</option>
            <option value="3d-render">3D Render</option>
            <option value="watercolor">Watercolor</option>
            <option value="oil-painting">Oil Painting</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
          >
            <option value="1:1">Square (1:1)</option>
            <option value="16:9">Landscape (16:9)</option>
            <option value="9:16">Portrait (9:16)</option>
            <option value="4:3">Standard (4:3)</option>
            <option value="3:2">Classic (3:2)</option>
          </select>
        </div>
      </div>
      
      <Button
        onClick={() => onGenerate(`${prompt}, ${style} style, ${aspectRatio} aspect ratio`)}
        disabled={!prompt.trim() || generating}
        className="w-full"
      >
        {generating ? 'Generating...' : 'Generate Image'}
      </Button>
    </div>
  );
};

// Image Editor Component
const ImageEditor: React.FC<{
  image: BlogImage;
  onSave: (updates: Partial<BlogImage>) => void;
  onCancel: () => void;
}> = ({ image, onSave, onCancel }) => {
  const [altText, setAltText] = useState(image.alt_text || '');
  const [tags, setTags] = useState(image.tags.join(', '));

  const handleSave = () => {
    onSave({
      alt_text: altText,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe this image for accessibility..."
        />
      </div>
      
      <div className="space-y-2">
        <Label>Tags (comma separated)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="blog, featured, product, etc..."
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};