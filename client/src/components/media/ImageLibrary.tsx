import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageEditor } from './ImageEditor';
import {
  Upload,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  Grid,
  List
} from 'lucide-react';

interface ImageData {
  id: string;
  filename: string;
  url: string;
  alt_text?: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  } | null;
  folder?: string;
  tags: string[];
  created_at: string;
  business_id: string;
}

interface ImageLibraryProps {
  businessId: string;
  onImageSelect?: (image: ImageData) => void;
  selectionMode?: boolean;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({
  businessId,
  onImageSelect,
  selectionMode = false
}) => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blog_images')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedImages = (data || []).map(img => ({
        ...img,
        dimensions: img.dimensions as { width: number; height: number } | null
      }));
      setImages(typedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [businessId, toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${businessId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        const img = new Image();
        const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = URL.createObjectURL(file);
        });

        const { error: dbError } = await supabase
          .from('blog_images')
          .insert({
            business_id: businessId,
            filename: file.name,
            url: publicUrl,
            size: file.size,
            dimensions,
            alt_text: '',
            folder: null,
            tags: []
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: `Uploaded ${files.length} image(s) successfully`
      });

      await fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredImages = images.filter(image =>
    image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ImageIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Image Library</h2>
          <p className="text-muted-foreground">
            Manage your blog images and media assets
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Media Library ({filteredImages.length} images)</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No images found</h3>
              <p className="text-muted-foreground mb-4">Upload your first image to get started</p>
              <label htmlFor="image-upload">
                <Button asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2'
            }>
              {filteredImages.map((image) => (
                <Card key={image.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <img
                      src={image.url}
                      alt={image.alt_text || image.filename}
                      className="w-full aspect-square object-cover rounded mb-2"
                      onClick={() => {
                        if (selectionMode && onImageSelect) {
                          onImageSelect(image);
                        } else {
                          setSelectedImage(image);
                          setShowImageEditor(true);
                        }
                      }}
                    />
                    <div className="text-sm font-medium truncate">{image.filename}</div>
                    <div className="text-xs text-muted-foreground">
                      {image.dimensions?.width || 0} × {image.dimensions?.height || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedImage && (
        <ImageEditor
          imageSrc={selectedImage.url}
          isOpen={showImageEditor}
          onOpenChange={setShowImageEditor}
          onSave={(blob, filename) => {
            setShowImageEditor(false);
            toast({
              title: "Image Saved",
              description: "Edited image has been saved"
            });
          }}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
};