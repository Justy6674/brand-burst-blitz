import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Search, Zap, CheckCircle, Globe, Code, Clock, Star } from 'lucide-react';
import { ALL_PLATFORMS, PLATFORM_CATEGORIES, PlatformDefinition } from '@/data/platformDefinitions';

interface ComprehensivePlatformSelectorProps {
  onPlatformSelect: (platform: PlatformDefinition) => void;
  selectedPlatformId?: string;
  websiteUrl?: string;
  onWebsiteUrlChange?: (url: string) => void;
}

export const ComprehensivePlatformSelector: React.FC<ComprehensivePlatformSelectorProps> = ({
  onPlatformSelect,
  selectedPlatformId,
  websiteUrl = '',
  onWebsiteUrlChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{platform?: PlatformDefinition, confidence: number} | null>(null);
  
  const { toast } = useToast();

  // Filter platforms based on search and filters
  const filteredPlatforms = ALL_PLATFORMS.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         platform.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || platform.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || platform.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Auto-detect platform from URL
  const detectPlatform = async () => {
    if (!websiteUrl) {
      toast({
        title: "URL Required",
        description: "Please enter your website URL first",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    try {
      const url = new URL(websiteUrl);
      const hostname = url.hostname.toLowerCase();
      
      let detectedPlatform: PlatformDefinition | undefined;
      let confidence = 0;

      // Check each platform's detection patterns
      for (const platform of ALL_PLATFORMS) {
        for (const pattern of platform.detectionPatterns) {
          if (hostname.includes(pattern.toLowerCase())) {
            detectedPlatform = platform;
            confidence = 95; // High confidence for domain-based detection
            break;
          }
        }
        if (detectedPlatform) break;
      }

      // If no direct match, try to detect by fetching the page (in real implementation)
      if (!detectedPlatform) {
        // Simulate additional detection logic
        if (hostname.includes('wordpress') || hostname.includes('wp.')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'wordpress');
          confidence = 80;
        } else if (hostname.includes('wix')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'wix');
          confidence = 90;
        } else if (hostname.includes('squarespace')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'squarespace');
          confidence = 90;
        } else if (hostname.includes('godaddy') || hostname.includes('secureserver')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'godaddy');
          confidence = 85;
        } else if (hostname.includes('shopify')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'shopify');
          confidence = 90;
        } else if (hostname.includes('vercel')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'vercel');
          confidence = 95;
        } else if (hostname.includes('netlify')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'netlify');
          confidence = 95;
        } else if (hostname.includes('firebase')) {
          detectedPlatform = ALL_PLATFORMS.find(p => p.id === 'firebase-studio');
          confidence = 90;
        }
      }

      setDetectionResult({ platform: detectedPlatform, confidence });

      if (detectedPlatform) {
        toast({
          title: "Platform Detected!",
          description: `We detected ${detectedPlatform.name} with ${confidence}% confidence`,
        });
        onPlatformSelect(detectedPlatform);
      } else {
        toast({
          title: "Detection Inconclusive",
          description: "Please select your platform manually from the list below",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Detection Failed",
        description: "Invalid URL format. Please check and try again.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'traditional': return '🏢';
      case 'ecommerce': return '🛒';
      case 'developer': return '💻';
      case 'cms': return '📝';
      case 'modern-dev': return '🚀';
      default: return '🌐';
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Detection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Platform Detection
          </CardTitle>
          <CardDescription>
            Enter your website URL and we'll automatically detect your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                value={websiteUrl}
                onChange={(e) => onWebsiteUrlChange?.(e.target.value)}
                placeholder="https://your-practice-website.com.au"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={detectPlatform}
                disabled={!websiteUrl || isDetecting}
                className="mb-0"
              >
                {isDetecting ? (
                  <Zap className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {isDetecting ? 'Detecting...' : 'Auto-Detect'}
              </Button>
            </div>
          </div>

          {detectionResult && (
            <div className={`p-4 rounded-lg border ${
              detectionResult.platform 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {detectionResult.platform ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Search className="w-5 h-5 text-yellow-600" />
                )}
                <h4 className="font-semibold">
                  {detectionResult.platform 
                    ? `Platform Detected: ${detectionResult.platform.name}` 
                    : 'No Platform Detected'
                  }
                </h4>
                {detectionResult.platform && (
                  <Badge variant="outline">
                    {detectionResult.confidence}% confidence
                  </Badge>
                )}
              </div>
              {detectionResult.platform && (
                <p className="text-sm text-muted-foreground">
                  {detectionResult.platform.description}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Platform</CardTitle>
          <CardDescription>
            Choose from 25+ supported website platforms and development environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search platforms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="traditional">Traditional Builders</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="cms">Content Management</SelectItem>
                  <SelectItem value="developer">Developer Tools</SelectItem>
                  <SelectItem value="modern-dev">Modern Development</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Categories */}
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="traditional">Traditional</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
              <TabsTrigger value="cms">CMS</TabsTrigger>
              <TabsTrigger value="modern">Modern Dev</TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLATFORM_CATEGORIES['Most Popular Australian Platforms'].map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatformId === platform.id}
                    onSelect={() => onPlatformSelect(platform)}
                    getDifficultyColor={getDifficultyColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="traditional" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.filter(p => p.category === 'traditional').map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatformId === platform.id}
                    onSelect={() => onPlatformSelect(platform)}
                    getDifficultyColor={getDifficultyColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ecommerce" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.filter(p => p.category === 'ecommerce').map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatformId === platform.id}
                    onSelect={() => onPlatformSelect(platform)}
                    getDifficultyColor={getDifficultyColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.filter(p => p.category === 'cms').map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatformId === platform.id}
                    onSelect={() => onPlatformSelect(platform)}
                    getDifficultyColor={getDifficultyColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="modern" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.filter(p => p.category === 'modern-dev' || p.category === 'developer').map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatformId === platform.id}
                    onSelect={() => onPlatformSelect(platform)}
                    getDifficultyColor={getDifficultyColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Show all filtered results if searching */}
          {searchTerm && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Search Results ({filteredPlatforms.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatformId === platform.id}
                    onSelect={() => onPlatformSelect(platform)}
                    getDifficultyColor={getDifficultyColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Platform Card Component
interface PlatformCardProps {
  platform: PlatformDefinition;
  isSelected: boolean;
  onSelect: () => void;
  getDifficultyColor: (difficulty: string) => string;
  getCategoryIcon: (category: string) => string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  isSelected,
  onSelect,
  getDifficultyColor,
  getCategoryIcon
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
          : 'hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{platform.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{platform.name}</h4>
              {platform.marketShare !== '0%' && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {platform.marketShare}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {platform.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getDifficultyColor(platform.difficulty)}`}>
                  {platform.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {platform.setupTime}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <span>{getCategoryIcon(platform.category)}</span>
                <span className="text-muted-foreground capitalize">
                  {platform.category.replace('-', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <Code className="w-3 h-3" />
                <span className="text-muted-foreground capitalize">
                  {platform.integrationType.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            {isSelected && (
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium">
                <CheckCircle className="w-3 h-3" />
                Selected
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 