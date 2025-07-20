import React, { useState, useEffect } from 'react';
import { useHealthcareHashtagGenerator } from '../../hooks/useHealthcareHashtagGenerator';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Hash, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  TrendingUp,
  Eye,
  Sparkles,
  MessageSquare,
  Globe,
  Users,
  Heart,
  Stethoscope,
  BookOpen,
  Target
} from 'lucide-react';

interface HealthcareHashtagGeneratorProps {
  practiceId: string;
  defaultSpecialty?: string;
}

export function HealthcareHashtagGenerator({ 
  practiceId, 
  defaultSpecialty = 'gp' 
}: HealthcareHashtagGeneratorProps) {
  const { user } = useHealthcareAuth();
  const {
    isGenerating,
    generatedHashtags,
    hashtagLibrary,
    generateHealthcareHashtags,
    getTrendingHealthcareHashtags,
    loadHashtagLibrary,
    getProhibitedTerms
  } = useHealthcareHashtagGenerator();

  const [hashtagRequest, setHashtagRequest] = useState({
    topic: '',
    specialty: defaultSpecialty as any,
    contentType: 'educational' as any,
    targetPlatform: 'instagram' as any,
    audience: 'patients' as any,
    locationContext: ''
  });

  const [copiedHashtags, setCopiedHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [showProhibitedTerms, setShowProhibitedTerms] = useState(false);

  useEffect(() => {
    loadHashtagLibrary();
  }, [loadHashtagLibrary]);

  const specialties = [
    { value: 'gp', label: 'General Practice', icon: Stethoscope, color: 'text-blue-600' },
    { value: 'psychology', label: 'Psychology', icon: Heart, color: 'text-purple-600' },
    { value: 'allied_health', label: 'Allied Health', icon: Users, color: 'text-green-600' },
    { value: 'specialist', label: 'Specialist', icon: TrendingUp, color: 'text-red-600' },
    { value: 'dentistry', label: 'Dentistry', icon: Shield, color: 'text-orange-600' },
    { value: 'nursing', label: 'Nursing', icon: Heart, color: 'text-pink-600' }
  ];

  const contentTypes = [
    { value: 'educational', label: 'Educational', icon: BookOpen },
    { value: 'awareness', label: 'Health Awareness', icon: Eye },
    { value: 'community', label: 'Community', icon: Users },
    { value: 'preventive', label: 'Preventive Care', icon: Shield },
    { value: 'promotional', label: 'Professional Services', icon: Sparkles }
  ];

  const platforms = [
    { value: 'instagram', label: 'Instagram', limit: 30 },
    { value: 'facebook', label: 'Facebook', limit: 25 },
    { value: 'linkedin', label: 'LinkedIn', limit: 20 },
    { value: 'twitter', label: 'Twitter', limit: 15 },
    { value: 'tiktok', label: 'TikTok', limit: 20 }
  ];

  const audiences = [
    { value: 'patients', label: 'Patients & Public' },
    { value: 'professionals', label: 'Healthcare Professionals' },
    { value: 'community', label: 'Local Community' },
    { value: 'mixed', label: 'Mixed Audience' }
  ];

  const handleGenerateHashtags = async () => {
    if (!hashtagRequest.topic.trim()) return;
    
    const result = await generateHealthcareHashtags(hashtagRequest);
    if (result.success) {
      setSelectedHashtags([]);
      setCopiedHashtags([]);
    }
  };

  const handleCopyHashtags = async (hashtags: string[], category: string) => {
    try {
      const hashtagText = hashtags.join(' ');
      await navigator.clipboard.writeText(hashtagText);
      setCopiedHashtags(prev => [...prev, category]);
      setTimeout(() => {
        setCopiedHashtags(prev => prev.filter(c => c !== category));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy hashtags:', error);
    }
  };

  const handleSelectHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50';
  };

  const renderHashtagForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Generate AHPRA-Compliant Hashtags
        </CardTitle>
        <CardDescription>
          Create professional healthcare hashtags that follow Australian advertising guidelines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Healthcare Specialty</label>
            <select
              value={hashtagRequest.specialty}
              onChange={(e) => setHashtagRequest({
                ...hashtagRequest,
                specialty: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {specialties.map((specialty) => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <select
              value={hashtagRequest.contentType}
              onChange={(e) => setHashtagRequest({
                ...hashtagRequest,
                contentType: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Platform</label>
            <select
              value={hashtagRequest.targetPlatform}
              onChange={(e) => setHashtagRequest({
                ...hashtagRequest,
                targetPlatform: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label} (max {platform.limit} hashtags)
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <select
              value={hashtagRequest.audience}
              onChange={(e) => setHashtagRequest({
                ...hashtagRequest,
                audience: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {audiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content Topic</label>
          <input
            type="text"
            placeholder="e.g., Mental health awareness for young adults"
            value={hashtagRequest.topic}
            onChange={(e) => setHashtagRequest({
              ...hashtagRequest,
              topic: e.target.value
            })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Melbourne, Sydney, Brisbane"
            value={hashtagRequest.locationContext}
            onChange={(e) => setHashtagRequest({
              ...hashtagRequest,
              locationContext: e.target.value
            })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <Button
          onClick={handleGenerateHashtags}
          disabled={!hashtagRequest.topic.trim() || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Compliant Hashtags...
            </>
          ) : (
            <>
              <Hash className="h-4 w-4 mr-2" />
              Generate Healthcare Hashtags
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderHashtagCategory = (
    title: string,
    hashtags: any[],
    category: string,
    description: string
  ) => {
    if (!hashtags || hashtags.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-lg">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyHashtags(hashtags.map(h => h.hashtag), category)}
          >
            {copiedHashtags.includes(category) ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {hashtags.map((hashtagObj, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`cursor-pointer transition-colors ${
                selectedHashtags.includes(hashtagObj.hashtag)
                  ? 'bg-blue-100 border-blue-300'
                  : getComplianceColor(hashtagObj.ahpraCompliant)
              }`}
              onClick={() => handleSelectHashtag(hashtagObj.hashtag)}
            >
              <Hash className="h-3 w-3 mr-1" />
              {hashtagObj.hashtag.replace('#', '')}
              {hashtagObj.ahpraCompliant ? (
                <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
              )}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderGeneratedHashtags = () => {
    if (!generatedHashtags) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Generated Healthcare Hashtags
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={generatedHashtags.compliance.allCompliant ? "default" : "destructive"}>
                <Shield className="h-3 w-3 mr-1" />
                {generatedHashtags.compliance.allCompliant ? 'All Compliant' : 'Review Required'}
              </Badge>
              <Badge variant="outline">
                {generatedHashtags.totalCount} hashtags
              </Badge>
            </div>
          </div>
          <CardDescription>
            AHPRA-compliant hashtags ready for use in your healthcare content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!generatedHashtags.compliance.allCompliant && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Compliance Issues Found:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {generatedHashtags.compliance.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {renderHashtagCategory(
            'Primary Professional Hashtags',
            generatedHashtags.primary,
            'primary',
            'Core hashtags specific to your healthcare specialty'
          )}

          {renderHashtagCategory(
            'Secondary Supporting Hashtags',
            generatedHashtags.secondary,
            'secondary',
            'General healthcare hashtags for broader reach'
          )}

          {renderHashtagCategory(
            'Location-Based Hashtags',
            generatedHashtags.locationBased,
            'location',
            'Regional hashtags for local community engagement'
          )}

          {selectedHashtags.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Selected Hashtags ({selectedHashtags.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyHashtags(selectedHashtags, 'selected')}
                >
                  {copiedHashtags.includes('selected') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-blue-800 font-mono">
                {selectedHashtags.join(' ')}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleGenerateHashtags()}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedHashtags([])}
              disabled={selectedHashtags.length === 0}
            >
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHashtagLibrary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          AHPRA-Approved Hashtag Library
        </CardTitle>
        <CardDescription>
          Pre-approved healthcare hashtags organized by specialty and content type
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hashtagLibrary.length === 0 ? (
          <div className="text-center py-8">
            <Hash className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Hashtag Library
            </h3>
            <p className="text-gray-600">
              Fetching AHPRA-approved hashtags for healthcare professionals.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {specialties.map((specialty) => {
              const specialtyHashtags = hashtagLibrary.filter(h => 
                h.specialties.includes(specialty.value)
              );
              
              if (specialtyHashtags.length === 0) return null;
              
              return (
                <div key={specialty.value} className="space-y-2">
                  <h4 className={`font-medium flex items-center gap-2 ${specialty.color}`}>
                    <specialty.icon className="h-4 w-4" />
                    {specialty.label}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {specialtyHashtags.slice(0, 10).map((hashtag) => (
                      <Badge
                        key={hashtag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSelectHashtag(hashtag.hashtag)}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {hashtag.hashtag.replace('#', '')}
                        <span className="ml-1 text-xs">({hashtag.effectiveness}/10)</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderComplianceGuidelines = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          AHPRA Hashtag Compliance Guidelines
        </CardTitle>
        <CardDescription>
          Guidelines for creating compliant healthcare hashtags
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Recommended Practices</h4>
              <ul className="text-sm text-green-700 list-disc list-inside mt-1">
                <li>Use educational and informational hashtags</li>
                <li>Focus on professional healthcare terminology</li>
                <li>Include location-based hashtags for community engagement</li>
                <li>Emphasize patient care and health education</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Prohibited Practices</h4>
              <ul className="text-sm text-red-700 list-disc list-inside mt-1">
                <li>Therapeutic claims (#cure, #miracle, #guaranteed)</li>
                <li>Comparative superiority (#best, #leading, #numberone)</li>
                <li>Brand drug names (#botox, #dysport)</li>
                <li>Exaggerated outcomes (#amazing, #lifechanging)</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowProhibitedTerms(!showProhibitedTerms)}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showProhibitedTerms ? 'Hide' : 'Show'} Full Prohibited Terms List
        </Button>
        
        {showProhibitedTerms && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Prohibited Terms</h4>
            <div className="flex flex-wrap gap-1">
              {getProhibitedTerms().map((term, index) => (
                <Badge key={index} variant="outline" className="text-red-700 border-red-200">
                  #{term}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Healthcare Hashtag Generator
          </h2>
          <p className="text-gray-600">
            Generate AHPRA-compliant hashtags for your healthcare content
          </p>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          All generated hashtags are validated against AHPRA advertising guidelines 
          and TGA therapeutic advertising requirements to ensure professional compliance.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Hashtags</TabsTrigger>
          <TabsTrigger value="results">Generated Results</TabsTrigger>
          <TabsTrigger value="library">Hashtag Library</TabsTrigger>
          <TabsTrigger value="guidelines">Compliance Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {renderHashtagForm()}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {generatedHashtags ? renderGeneratedHashtags() : (
            <Card>
              <CardContent className="p-6 text-center">
                <Hash className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Hashtags Generated Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate your first set of AHPRA-compliant healthcare hashtags.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {renderHashtagLibrary()}
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-6">
          {renderComplianceGuidelines()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 