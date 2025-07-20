import React, { useState, useEffect } from 'react';
import { usePlatformCharacterLimits } from '../../hooks/usePlatformCharacterLimits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  MessageSquare, 
  Globe, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Info,
  BarChart3,
  Copy,
  RefreshCw,
  Scissors,
  Target,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';

interface PlatformCharacterLimitsValidatorProps {
  defaultContent?: string;
  defaultPlatform?: string;
  onValidation?: (validation: any) => void;
}

export function PlatformCharacterLimitsValidator({ 
  defaultContent = '', 
  defaultPlatform = 'facebook',
  onValidation
}: PlatformCharacterLimitsValidatorProps) {
  const {
    platformLimits,
    validationResults,
    isValidating,
    validateContent,
    getPlatformRecommendations,
    optimizeForPlatform,
    getHealthcareContentStructure
  } = usePlatformCharacterLimits();

  const [content, setContent] = useState(defaultContent);
  const [selectedPlatform, setSelectedPlatform] = useState(defaultPlatform);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentValidation, setCurrentValidation] = useState<any>(null);
  const [optimizedContent, setOptimizedContent] = useState<any>(null);
  const [showOptimization, setShowOptimization] = useState(false);

  const platformIcons = {
    facebook: MessageSquare,
    instagram: MessageSquare,
    linkedin: Users,
    twitter: MessageSquare,
    tiktok: MessageSquare,
    website: Globe,
    email: Mail
  };

  const platformColors = {
    facebook: 'text-blue-600 border-blue-200 bg-blue-50',
    instagram: 'text-pink-600 border-pink-200 bg-pink-50',
    linkedin: 'text-blue-800 border-blue-300 bg-blue-100',
    twitter: 'text-sky-600 border-sky-200 bg-sky-50',
    tiktok: 'text-purple-600 border-purple-200 bg-purple-50',
    website: 'text-green-600 border-green-200 bg-green-50',
    email: 'text-gray-600 border-gray-200 bg-gray-50'
  };

  // Real-time validation when content or platform changes
  useEffect(() => {
    if (content.trim()) {
      const validate = async () => {
        try {
          const validation = await validateContent(content, selectedPlatform, hashtags);
          setCurrentValidation(validation);
          if (onValidation) {
            onValidation(validation);
          }
        } catch (error) {
          console.error('Validation error:', error);
        }
      };
      
      const debounceTimer = setTimeout(validate, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [content, selectedPlatform, hashtags, validateContent, onValidation]);

  const handleOptimizeContent = async () => {
    try {
      const optimization = await optimizeForPlatform(content, selectedPlatform, true);
      setOptimizedContent(optimization);
      setShowOptimization(true);
    } catch (error) {
      console.error('Optimization error:', error);
    }
  };

  const handleUseOptimized = () => {
    if (optimizedContent) {
      setContent(optimizedContent.optimizedContent);
      setShowOptimization(false);
      setOptimizedContent(null);
    }
  };

  const handleCopyContent = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const getValidationColor = (validation: any) => {
    if (!validation) return 'text-gray-500';
    if (!validation.isWithinLimits) return 'text-red-600';
    if (validation.isHealthcareOptimal) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getValidationIcon = (validation: any) => {
    if (!validation) return Info;
    if (!validation.isWithinLimits) return XCircle;
    if (validation.isHealthcareOptimal) return CheckCircle;
    return AlertCircle;
  };

  const renderPlatformSelector = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {platformLimits.map((platform) => {
        const Icon = platformIcons[platform.platform];
        const isSelected = selectedPlatform === platform.platform;
        
        return (
          <button
            key={platform.platform}
            onClick={() => setSelectedPlatform(platform.platform)}
            className={`p-3 rounded-lg border-2 transition-all ${
              isSelected 
                ? platformColors[platform.platform]
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className="h-5 w-5 mx-auto mb-1" />
            <div className="text-xs font-medium capitalize">
              {platform.platform}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderContentInput = () => {
    const platformLimit = getPlatformRecommendations(selectedPlatform);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Healthcare Content Validation
          </CardTitle>
          <CardDescription>
            Create content optimized for {selectedPlatform} with healthcare compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Content Text</label>
              {currentValidation && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {currentValidation.characterCount} / {currentValidation.characterLimit}
                  </span>
                  <Badge 
                    variant={currentValidation.isHealthcareOptimal ? "default" : "outline"}
                    className={getValidationColor(currentValidation)}
                  >
                    {currentValidation.utilizationPercentage}%
                  </Badge>
                </div>
              )}
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter your healthcare content for ${selectedPlatform}...`}
              rows={6}
              className="resize-none"
            />
            
            {currentValidation && (
              <div className="space-y-2">
                <Progress 
                  value={Math.min(currentValidation.utilizationPercentage, 100)} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Healthcare Optimal: {currentValidation.healthcareOptimalRange.min} - {currentValidation.healthcareOptimalRange.max} chars
                  </span>
                  <span className={getValidationColor(currentValidation)}>
                    {currentValidation.isHealthcareOptimal ? 'Optimal' : 
                     currentValidation.isWithinLimits ? 'Within Limits' : 'Exceeds Limit'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Healthcare Hashtags (Optional)</label>
            <input
              type="text"
              placeholder="Enter hashtags separated by commas (e.g., #HealthEducation, #PatientCare)"
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => 
                  tag.trim().startsWith('#') ? tag.trim() : '#' + tag.trim()
                ).filter(tag => tag.length > 1);
                setHashtags(tags);
              }}
              className="w-full p-2 border rounded-md"
            />
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {platformLimit && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>{selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Healthcare Optimization:</strong><br />
                {platformLimit.healthcareOptimal.explanation}<br />
                <em>{platformLimit.healthcareOptimal.complianceNote}</em>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderValidationResults = () => {
    if (!currentValidation) return null;

    const ValidationIcon = getValidationIcon(currentValidation);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ValidationIcon className={`h-5 w-5 ${getValidationColor(currentValidation)}`} />
            Validation Results
          </CardTitle>
          <CardDescription>
            Real-time healthcare content compliance and optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getValidationColor(currentValidation)}`}>
                {currentValidation.characterCount}
              </div>
              <div className="text-sm text-gray-600">Characters Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentValidation.characterLimit}
              </div>
              <div className="text-sm text-gray-600">Platform Limit</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                currentValidation.isHealthcareOptimal ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {currentValidation.utilizationPercentage}%
              </div>
              <div className="text-sm text-gray-600">Utilization</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                currentValidation.isHealthcareOptimal ? 'text-green-600' : 'text-gray-500'
              }`}>
                {currentValidation.isHealthcareOptimal ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Healthcare Optimal</div>
            </div>
          </div>

          {currentValidation.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Warnings & Recommendations</h4>
              {currentValidation.warnings.map((warning, index) => (
                <Alert 
                  key={index} 
                  className={warning.severity === 'error' ? 'border-red-200 bg-red-50' : 
                            warning.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                            'border-blue-200 bg-blue-50'}
                >
                  <AlertCircle className={`h-4 w-4 ${
                    warning.severity === 'error' ? 'text-red-600' : 
                    warning.severity === 'warning' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`} />
                  <AlertDescription className={
                    warning.severity === 'error' ? 'text-red-800' : 
                    warning.severity === 'warning' ? 'text-yellow-800' : 
                    'text-blue-800'
                  }>
                    <strong>{warning.message}</strong><br />
                    {warning.recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {currentValidation.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Healthcare Optimization Suggestions</h4>
              {currentValidation.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-green-800">{suggestion.suggestion}</div>
                      {suggestion.expectedSavings && (
                        <div className="text-xs text-green-600 mt-1">
                          Potential savings: {suggestion.expectedSavings} characters
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-xs ${
                      suggestion.priority === 'high' ? 'border-red-300 text-red-700' :
                      suggestion.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }`}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleOptimizeContent}
              disabled={isValidating || !content.trim()}
              variant="outline"
            >
              <Scissors className="h-4 w-4 mr-2" />
              Optimize for Healthcare
            </Button>
            <Button
              onClick={() => handleCopyContent(content)}
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Content
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOptimization = () => {
    if (!showOptimization || !optimizedContent) return null;

    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5" />
            Healthcare Optimized Content
          </CardTitle>
          <CardDescription className="text-green-700">
            AI-optimized for {selectedPlatform} with AHPRA compliance maintained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {optimizedContent.originalLength}
              </div>
              <div className="text-xs text-gray-600">Original</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {optimizedContent.optimizedLength}
              </div>
              <div className="text-xs text-gray-600">Optimized</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                -{optimizedContent.savings}
              </div>
              <div className="text-xs text-gray-600">Saved</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <div className="text-sm font-medium mb-2">Optimized Content:</div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {optimizedContent.optimizedContent}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUseOptimized} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Use Optimized Content
            </Button>
            <Button 
              onClick={() => handleCopyContent(optimizedContent.optimizedContent)}
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button 
              onClick={() => setShowOptimization(false)}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPlatformInsights = () => {
    const platformLimit = getPlatformRecommendations(selectedPlatform);
    const contentStructure = getHealthcareContentStructure(selectedPlatform);
    
    if (!platformLimit || !contentStructure) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Healthcare Insights
          </CardTitle>
          <CardDescription>
            Platform-specific recommendations for healthcare content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Recommended Structure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Introduction:</span>
                  <span>{contentStructure.introduction}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Main Content:</span>
                  <span>{contentStructure.mainContent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Disclaimer:</span>
                  <span>{contentStructure.disclaimer}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Call to Action:</span>
                  <span>{contentStructure.callToAction}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hashtags:</span>
                  <span>{contentStructure.hashtags}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Special Considerations</h4>
              <ul className="space-y-1 text-sm">
                {platformLimit.specialConsiderations.map((consideration, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Shield className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Platform Character Limits Validator
          </h2>
          <p className="text-gray-600">
            Optimize healthcare content for each social media platform with compliance checking
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Platform</CardTitle>
          <CardDescription>
            Choose the platform you're creating content for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderPlatformSelector()}
        </CardContent>
      </Card>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content Input</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="insights">Platform Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {renderContentInput()}
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          {renderValidationResults()}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {showOptimization ? renderOptimization() : (
            <Card>
              <CardContent className="p-6 text-center">
                <Scissors className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Content Optimization
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter content and click "Optimize for Healthcare" to see AI-powered suggestions.
                </p>
                <Button
                  onClick={handleOptimizeContent}
                  disabled={!content.trim()}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Optimize Content
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderPlatformInsights()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 