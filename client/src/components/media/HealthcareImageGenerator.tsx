import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHealthcareImageGeneration } from '@/hooks/useHealthcareImageGeneration';
import { useToast } from '@/hooks/use-toast';
import { 
  Image, 
  Shield, 
  Download, 
  Eye,
  Copy,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Palette,
  Accessibility,
  FileImage,
  Camera,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Users,
  BookOpen,
  Award,
  Globe,
  Sparkles
} from 'lucide-react';

interface HealthcareImageGeneratorProps {
  practiceId?: string;
  specialty?: string;
  onImageGenerated?: (imageData: any) => void;
}

export const HealthcareImageGenerator: React.FC<HealthcareImageGeneratorProps> = ({
  practiceId,
  specialty = 'gp',
  onImageGenerated
}) => {
  const { toast } = useToast();
  const {
    isGenerating,
    generatedImages,
    generationProgress,
    generateHealthcareImage,
    loadHealthcareImages,
    generateImageVariations,
    disclaimerTemplates
  } = useHealthcareImageGeneration();

  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'compliance'>('generate');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageDetails, setShowImageDetails] = useState(false);
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState<'patient_education' | 'anatomy_diagram' | 'procedure_explanation' | 'health_awareness' | 'practice_branding' | 'infographic'>('patient_education');
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialty);
  const [targetAudience, setTargetAudience] = useState<'patients' | 'professionals' | 'community' | 'children' | 'elderly' | 'multicultural'>('patients');
  const [disclaimerLevel, setDisclaimerLevel] = useState<'standard' | 'enhanced' | 'medical_advice' | 'therapeutic' | 'emergency'>('standard');
  const [culturalContext, setCulturalContext] = useState<'indigenous' | 'multicultural' | 'general'>('general');
  
  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    colorBlindFriendly: false,
    screenReaderOptimized: true
  });

  // Compliance requirements
  const [complianceRequirements, setComplianceRequirements] = useState({
    ahpraCompliant: true,
    tgaCompliant: true,
    therapeuticClaims: false,
    patientConsent: false,
    beforeAfterPhoto: false
  });

  useEffect(() => {
    if (practiceId) {
      loadHealthcareImages(practiceId);
    }
  }, [practiceId, loadHealthcareImages]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      });
      return;
    }

    const request = {
      prompt,
      imageType,
      specialty: selectedSpecialty as any,
      targetAudience,
      disclaimerLevel,
      culturalContext: culturalContext !== 'general' ? culturalContext : undefined,
      accessibilityRequirements: accessibilitySettings,
      complianceRequirements
    };

    const result = await generateHealthcareImage(request);
    if (result.success && result.image) {
      onImageGenerated?.(result.image);
    }
  };

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'patient_education': return <BookOpen className="h-4 w-4" />;
      case 'anatomy_diagram': return <Stethoscope className="h-4 w-4" />;
      case 'procedure_explanation': return <Activity className="h-4 w-4" />;
      case 'health_awareness': return <Heart className="h-4 w-4" />;
      case 'practice_branding': return <Award className="h-4 w-4" />;
      case 'infographic': return <FileImage className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getSpecialtyIcon = (spec: string) => {
    switch (spec) {
      case 'psychology': return <Brain className="h-4 w-4" />;
      case 'dentistry': return <Stethoscope className="h-4 w-4" />;
      case 'physiotherapy': return <Activity className="h-4 w-4" />;
      case 'mental_health': return <Heart className="h-4 w-4" />;
      default: return <Stethoscope className="h-4 w-4" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderImageGenerationForm = () => (
    <div className="space-y-6">
      {/* Image Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Image Description
          </CardTitle>
          <CardDescription>
            Describe the healthcare image you want to generate (e.g., "anatomy of the heart for patient education")
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the healthcare image you want to generate..."
            rows={3}
          />
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>AHPRA Compliance:</strong> Avoid therapeutic claims, patient testimonials, 
              before/after comparisons, or guaranteed outcomes in your image description.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Image Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Image Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Type</label>
              <Select value={imageType} onValueChange={setImageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient_education">Patient Education</SelectItem>
                  <SelectItem value="anatomy_diagram">Anatomy Diagram</SelectItem>
                  <SelectItem value="procedure_explanation">Procedure Explanation</SelectItem>
                  <SelectItem value="health_awareness">Health Awareness</SelectItem>
                  <SelectItem value="practice_branding">Practice Branding</SelectItem>
                  <SelectItem value="infographic">Infographic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Healthcare Specialty</label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gp">General Practice</SelectItem>
                  <SelectItem value="psychology">Psychology</SelectItem>
                  <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                  <SelectItem value="dentistry">Dentistry</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                  <SelectItem value="allied_health">Allied Health</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="professionals">Healthcare Professionals</SelectItem>
                  <SelectItem value="community">General Community</SelectItem>
                  <SelectItem value="children">Children/Families</SelectItem>
                  <SelectItem value="elderly">Elderly Patients</SelectItem>
                  <SelectItem value="multicultural">Multicultural Communities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Disclaimer Level</label>
              <Select value={disclaimerLevel} onValueChange={setDisclaimerLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Medical Disclaimer</SelectItem>
                  <SelectItem value="enhanced">Enhanced Medical Disclaimer</SelectItem>
                  <SelectItem value="medical_advice">Medical Advice Warning</SelectItem>
                  <SelectItem value="therapeutic">Therapeutic Claims Disclaimer</SelectItem>
                  <SelectItem value="emergency">Emergency Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cultural Context</label>
            <Select value={culturalContext} onValueChange={setCulturalContext}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Australian</SelectItem>
                <SelectItem value="multicultural">Multicultural Communities</SelectItem>
                <SelectItem value="indigenous">Indigenous Health (Requires Cultural Review)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Requirements
          </CardTitle>
          <CardDescription>
            Ensure your image meets accessibility standards for all patients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="high-contrast"
                checked={accessibilitySettings.highContrast}
                onCheckedChange={(checked) => 
                  setAccessibilitySettings(prev => ({ ...prev, highContrast: checked as boolean }))
                }
              />
              <label htmlFor="high-contrast" className="text-sm">High Contrast Colors</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="large-text"
                checked={accessibilitySettings.largeText}
                onCheckedChange={(checked) => 
                  setAccessibilitySettings(prev => ({ ...prev, largeText: checked as boolean }))
                }
              />
              <label htmlFor="large-text" className="text-sm">Large Text Size</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="colorblind-friendly"
                checked={accessibilitySettings.colorBlindFriendly}
                onCheckedChange={(checked) => 
                  setAccessibilitySettings(prev => ({ ...prev, colorBlindFriendly: checked as boolean }))
                }
              />
              <label htmlFor="colorblind-friendly" className="text-sm">Colorblind Friendly</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="screen-reader"
                checked={accessibilitySettings.screenReaderOptimized}
                onCheckedChange={(checked) => 
                  setAccessibilitySettings(prev => ({ ...prev, screenReaderOptimized: checked as boolean }))
                }
              />
              <label htmlFor="screen-reader" className="text-sm">Screen Reader Optimized</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Requirements
          </CardTitle>
          <CardDescription>
            Specify healthcare compliance requirements for this image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ahpra-compliant"
                checked={complianceRequirements.ahpraCompliant}
                onCheckedChange={(checked) => 
                  setComplianceRequirements(prev => ({ ...prev, ahpraCompliant: checked as boolean }))
                }
              />
              <label htmlFor="ahpra-compliant" className="text-sm">AHPRA Advertising Guidelines Compliant</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tga-compliant"
                checked={complianceRequirements.tgaCompliant}
                onCheckedChange={(checked) => 
                  setComplianceRequirements(prev => ({ ...prev, tgaCompliant: checked as boolean }))
                }
              />
              <label htmlFor="tga-compliant" className="text-sm">TGA Therapeutic Advertising Compliant</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="therapeutic-claims"
                checked={complianceRequirements.therapeuticClaims}
                onCheckedChange={(checked) => 
                  setComplianceRequirements(prev => ({ ...prev, therapeuticClaims: checked as boolean }))
                }
              />
              <label htmlFor="therapeutic-claims" className="text-sm">Contains Therapeutic Claims (Requires Enhanced Disclaimer)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="before-after"
                checked={complianceRequirements.beforeAfterPhoto}
                onCheckedChange={(checked) => 
                  setComplianceRequirements(prev => ({ ...prev, beforeAfterPhoto: checked as boolean }))
                }
              />
              <label htmlFor="before-after" className="text-sm">Before/After Style Image (Requires Patient Consent)</label>
            </div>
          </div>

          {complianceRequirements.beforeAfterPhoto && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Before/After Images:</strong> AHPRA requires explicit patient consent, 
                proper disclaimers, and careful consideration of professional boundaries.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Generate Healthcare Image</h3>
              <p className="text-sm text-gray-600">
                Create AHPRA-compliant healthcare imagery with appropriate medical disclaimers
              </p>
            </div>
            <Button 
              onClick={handleGenerateImage} 
              disabled={isGenerating || !prompt.trim()}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generation Progress</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview: Medical Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs">
            {disclaimerTemplates[disclaimerLevel]}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderImageLibrary = () => (
    <div className="space-y-4">
      {generatedImages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Generated</h3>
            <p className="text-gray-600">
              Generate your first healthcare image using the form above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedImages.map((image) => (
            <Card key={image.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <img
                    src={image.thumbnailUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover rounded-lg"
                    onClick={() => {
                      setSelectedImage(image);
                      setShowImageDetails(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="flex items-center gap-1">
                      {getImageTypeIcon(image.imageType)}
                      {image.imageType.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getSpecialtyIcon(image.specialty)}
                      {image.specialty}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {image.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getComplianceColor(image.complianceValidation.complianceScore)}`}>
                      {image.complianceValidation.complianceScore}% Compliant
                    </span>
                    <span className="text-gray-500">
                      {new Date(image.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderComplianceInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AHPRA Compliance Guidelines for Healthcare Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All generated images automatically comply with AHPRA advertising guidelines 
              and include appropriate medical disclaimers.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Required Elements</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Appropriate medical disclaimers</li>
              <li>No patient testimonials or success stories</li>
              <li>No before/after comparisons without consent</li>
              <li>Evidence-based information only</li>
              <li>Professional healthcare watermarks</li>
              <li>Accessibility compliance (WCAG 2.1 AA)</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Prohibited Content</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Therapeutic claims without evidence</li>
              <li>Patient identifiable information</li>
              <li>Misleading or exaggerated outcomes</li>
              <li>Comparative advertising</li>
              <li>Inducements or special offers</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disclaimer Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(disclaimerTemplates).map(([level, text]) => (
            <div key={level} className="space-y-2">
              <h4 className="font-medium capitalize">{level.replace('_', ' ')} Level</h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {text}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Healthcare Image Generator
          </CardTitle>
          <CardDescription>
            Generate AHPRA-compliant healthcare images with appropriate medical disclaimers
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Image</TabsTrigger>
          <TabsTrigger value="library">Image Library</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          {renderImageGenerationForm()}
        </TabsContent>

        <TabsContent value="library">
          {renderImageLibrary()}
        </TabsContent>

        <TabsContent value="compliance">
          {renderComplianceInfo()}
        </TabsContent>
      </Tabs>

      {/* Image Details Dialog */}
      <Dialog open={showImageDetails} onOpenChange={setShowImageDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Healthcare Image Details</DialogTitle>
            <DialogDescription>
              Complete information about this AHPRA-compliant healthcare image
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.altText}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Image Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {selectedImage.imageType.replace('_', ' ')}</div>
                      <div><strong>Specialty:</strong> {selectedImage.specialty}</div>
                      <div><strong>Prompt:</strong> {selectedImage.prompt}</div>
                      <div><strong>Alt Text:</strong> {selectedImage.altText}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Compliance Validation</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {selectedImage.complianceValidation.ahpraCompliant ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        AHPRA Compliant
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedImage.complianceValidation.tgaCompliant ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        TGA Compliant
                      </div>
                      <div>
                        <strong>Compliance Score:</strong> {selectedImage.complianceValidation.complianceScore}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Medical Disclaimer</h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs">
                      {selectedImage.disclaimerText}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Usage Rights</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedImage.usageRights).map(([right, allowed]) => (
                        <div key={right} className="flex items-center gap-2">
                          {allowed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-gray-400" />
                          )}
                          {right.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Disclaimer
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 