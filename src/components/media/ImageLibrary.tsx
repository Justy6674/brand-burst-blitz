import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Edit,
  Download,
  Eye,
  Filter,
  Plus,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface BlogImage {
  id: string;
  business_id: string;
  filename: string;
  url: string;
  size: number;
  dimensions: any; // JSON from database
  alt_text?: string;
  folder?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ImageLibraryProps {
  onImageSelect?: (image: BlogImage) => void;
  selectionMode?: boolean;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({
  onImageSelect,
  selectionMode = false
}) => {
  const { toast } = useToast();
  const { currentProfile } = useBusinessProfile();
  const selectedBusinessId = currentProfile?.id;
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<BlogImage | null>(null);
  const [editingImage, setEditingImage] = useState<BlogImage | null>(null);

  const fetchImages = useCallback(async () => {
    if (!selectedBusinessId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('blog_images')
        .select('*')
        .eq('business_id', selectedBusinessId)
        .order('created_at', { ascending: false });

      if (selectedFolder !== 'all') {
        query = query.eq('folder', selectedFolder);
      }

      const { data, error } = await query;

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, selectedFolder, toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedBusinessId) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${selectedBusinessId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        // Get image dimensions
        const img = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = URL.createObjectURL(file);
        });

        // Save to database
        const { error: dbError } = await supabase
          .from('blog_images')
          .insert({
            business_id: selectedBusinessId,
            filename: file.name,
            url: publicUrl,
            size: file.size,
            dimensions,
            folder: selectedFolder === 'all' ? 'uploads' : selectedFolder,
            tags: []
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
      });

      await fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('blog_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });

      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleUpdateImage = async (imageId: string, updates: Partial<BlogImage>) => {
    try {
      const { error } = await supabase
        .from('blog_images')
        .update(updates)
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image updated successfully",
      });

      await fetchImages();
      setEditingImage(null);
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = searchTerm === '' || 
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = selectedTag === 'all' || image.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const folders = Array.from(new Set(images.map(img => img.folder).filter(Boolean)));
  const allTags = Array.from(new Set(images.flatMap(img => img.tags)));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Image Library</h2>
          <p className="text-muted-foreground">Manage your blog images and media assets</p>
        </div>
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
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </p>
              <p className="text-muted-foreground">
                Drag and drop images here or click to browse
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid/List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading images...
          </div>
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No images found</p>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search filters' : 'Upload your first image to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              {viewMode === 'grid' ? (
                <div>
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
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingImage(image)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {selectionMode && onImageSelect && (
                        <Button
                          size="sm"
                          onClick={() => onImageSelect(image)}
                        >
                          Select
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{image.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {image.dimensions.width} × {image.dimensions.height} • {formatFileSize(image.size)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {image.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{image.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={image.url}
                    alt={image.alt_text || image.filename}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {image.dimensions.width} × {image.dimensions.height} • {formatFileSize(image.size)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {image.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingImage(image)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {selectionMode && onImageSelect && (
                      <Button
                        size="sm"
                        onClick={() => onImageSelect(image)}
                      >
                        Select
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.filename}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt_text || selectedImage.filename}
                className="w-full max-h-96 object-contain rounded"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Dimensions:</strong> {selectedImage.dimensions.width} × {selectedImage.dimensions.height}
                </div>
                <div>
                  <strong>Size:</strong> {formatFileSize(selectedImage.size)}
                </div>
                <div>
                  <strong>Folder:</strong> {selectedImage.folder || 'None'}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedImage.created_at).toLocaleDateString()}
                </div>
              </div>
              {selectedImage.alt_text && (
                <div>
                  <strong>Alt Text:</strong> {selectedImage.alt_text}
                </div>
              )}
              {selectedImage.tags.length > 0 && (
                <div>
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedImage.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <EditImageForm
              image={editingImage}
              onSave={(updates) => handleUpdateImage(editingImage.id, updates)}
              onCancel={() => setEditingImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Edit Image Form Component
interface EditImageFormProps {
  image: BlogImage;
  onSave: (updates: Partial<BlogImage>) => void;
  onCancel: () => void;
}

const EditImageForm: React.FC<EditImageFormProps> = ({ image, onSave, onCancel }) => {
  const [altText, setAltText] = useState(image.alt_text || '');
  const [folder, setFolder] = useState(image.folder || '');
  const [tags, setTags] = useState(image.tags.join(', '));

  const handleSave = () => {
    onSave({
      alt_text: altText,
      folder: folder || null,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Alt Text</label>
        <Input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe this image for accessibility"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Folder</label>
        <Input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Optional folder name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Comma-separated tags"
        />
      </div>
      <div className="flex justify-end gap-2">
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