import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  CalendarDays, 
  AlertCircle, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  Clock,
  Image as ImageIcon,
  Settings,
  Eye,
  Calendar
} from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  maxLength: number;
  features: string[];
}

interface PublishingOptions {
  content: string;
  platforms: string[];
  scheduleType: 'now' | 'schedule';
  scheduledDate?: string;
  scheduledTime?: string;
  includeImages: boolean;
  addHashtags: boolean;
  optimizeForPlatform: boolean;
}

export const ContentPublisher: React.FC<{
  initialContent?: string;
  onPublish?: (options: PublishingOptions) => void;
}> = ({ 
  initialContent = '',
  onPublish
}) => {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [publishingOptions, setPublishingOptions] = useState<PublishingOptions>({
    content: initialContent,
    platforms: [],
    scheduleType: 'now',
    includeImages: false,
    addHashtags: true,
    optimizeForPlatform: true,
  });

  const platforms: Platform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      connected: false, // This would come from actual connection status
      maxLength: 63206,
      features: ['Text', 'Images', 'Videos', 'Links']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      connected: false,
      maxLength: 2200,
      features: ['Images', 'Videos', 'Stories', 'Hashtags']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      connected: false,
      maxLength: 3000,
      features: ['Professional content', 'Articles', 'Company updates']
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      connected: false,
      maxLength: 280,
      features: ['Short text', 'Threads', 'Media', 'Real-time']
    }
  ];

  const handlePlatformToggle = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform?.connected) {
      toast({
        title: "Platform not connected",
        description: `Please connect your ${platform?.name} account first in Social Media settings.`,
        variant: "destructive",
      });
      return;
    }

    setPublishingOptions(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handlePublish = async () => {
    if (publishingOptions.platforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to publish to.",
        variant: "destructive",
      });
      return;
    }

    if (!publishingOptions.content.trim()) {
      toast({
        title: "No content to publish",
        description: "Please enter some content before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the actual publishing API
      if (onPublish) {
        onPublish(publishingOptions);
      }

      toast({
        title: "Publishing Initiated",
        description: "Your content publishing is being processed. Note: Actual publishing is still in development.",
      });

      // Reset form
      setPublishingOptions(prev => ({
        ...prev,
        content: '',
        platforms: [],
        scheduleType: 'now',
      }));
      
    } catch (error) {
      toast({
        title: "Publishing failed",
        description: "There was an error publishing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getCharacterCount = () => {
    const selectedPlatforms = platforms.filter(p => publishingOptions.platforms.includes(p.id));
    const minLimit = Math.min(...selectedPlatforms.map(p => p.maxLength));
    return {
      current: publishingOptions.content.length,
      limit: selectedPlatforms.length > 0 ? minLimit : Infinity,
      isOverLimit: selectedPlatforms.length > 0 && publishingOptions.content.length > minLimit
    };
  };

  const characterCount = getCharacterCount();

  return (
    <div className="space-y-6">
      {/* Development Notice */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Development Notice:</strong> Content publishing is currently being implemented. 
          You can test the interface, but actual publishing to social platforms will be available soon.
        </AlertDescription>
      </Alert>

      {/* Content Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Create & Publish Content</span>
          </CardTitle>
          <CardDescription>
            Write your content and choose where to publish it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={publishingOptions.content}
              onChange={(e) => setPublishingOptions(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your content here..."
              rows={6}
              className={characterCount.isOverLimit ? 'border-red-500 focus:border-red-500' : ''}
            />
            <div className="flex justify-between items-center text-sm">
              <span className={`${characterCount.isOverLimit ? 'text-red-600' : 'text-muted-foreground'}`}>
                {characterCount.current} / {characterCount.limit === Infinity ? '∞' : characterCount.limit} characters
              </span>
              {characterCount.isOverLimit && (
                <span className="text-red-600 font-medium">
                  Content exceeds platform limits
                </span>
              )}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label>Select Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = publishingOptions.platforms.includes(platform.id);
                
                return (
                  <div
                    key={platform.id}
                    className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                      platform.connected
                        ? isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        : 'border-muted-foreground/20 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isSelected}
                        disabled={!platform.connected}
                        onChange={() => {}} // Handled by div click
                      />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    {!platform.connected && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4 border-t pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Publishing Schedule</Label>
                <Select 
                  value={publishingOptions.scheduleType} 
                  onValueChange={(value: 'now' | 'schedule') => 
                    setPublishingOptions(prev => ({ ...prev, scheduleType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Publish Now</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="schedule">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule for Later</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {publishingOptions.scheduleType === 'schedule' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={publishingOptions.scheduledDate || ''}
                      onChange={(e) => setPublishingOptions(prev => ({ 
                        ...prev, 
                        scheduledDate: e.target.value 
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={publishingOptions.scheduledTime || ''}
                      onChange={(e) => setPublishingOptions(prev => ({ 
                        ...prev, 
                        scheduledTime: e.target.value 
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <Label>Content Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeImages"
                    checked={publishingOptions.includeImages}
                    onCheckedChange={(checked) => 
                      setPublishingOptions(prev => ({ ...prev, includeImages: !!checked }))
                    }
                  />
                  <Label htmlFor="includeImages" className="text-sm font-normal">
                    Include images (when available)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addHashtags"
                    checked={publishingOptions.addHashtags}
                    onCheckedChange={(checked) => 
                      setPublishingOptions(prev => ({ ...prev, addHashtags: !!checked }))
                    }
                  />
                  <Label htmlFor="addHashtags" className="text-sm font-normal">
                    Auto-add relevant hashtags
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optimizeForPlatform"
                    checked={publishingOptions.optimizeForPlatform}
                    onCheckedChange={(checked) => 
                      setPublishingOptions(prev => ({ ...prev, optimizeForPlatform: !!checked }))
                    }
                  />
                  <Label htmlFor="optimizeForPlatform" className="text-sm font-normal">
                    Optimize content for each platform
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPublishingOptions(prev => ({ 
                  ...prev, 
                  content: '', 
                  platforms: [] 
                }))}
              >
                Clear
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || publishingOptions.platforms.length === 0 || !publishingOptions.content.trim()}
              >
                {isPublishing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    {publishingOptions.scheduleType === 'now' ? 'Publishing...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    {publishingOptions.scheduleType === 'now' ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publish Now
                      </>
                    ) : (
                      <>
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Schedule Post
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && publishingOptions.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Preview</CardTitle>
            <CardDescription>
              How your content will appear on selected platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publishingOptions.platforms.map(platformId => {
                const platform = platforms.find(p => p.id === platformId);
                const Icon = platform?.icon;
                
                return (
                  <div key={platformId} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="font-medium">{platform?.name}</span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-sm whitespace-pre-wrap">
                        {publishingOptions.content}
                      </p>
                      {publishingOptions.addHashtags && (
                        <div className="mt-2 text-primary text-sm">
                          #businesstips #marketing #contentcreation
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};