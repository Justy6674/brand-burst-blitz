import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Shield, 
  ExternalLink, 
  Search, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Mail, 
  FileText,
  Users,
  Heart,
  Stethoscope,
  Scale,
  Globe,
  Clock,
  Star,
  Info,
  Lightbulb,
  MessageCircle,
  Video,
  Download
} from 'lucide-react';

interface ComplianceResource {
  id: string;
  title: string;
  description: string;
  category: 'ahpra' | 'tga' | 'cultural' | 'privacy' | 'advertising' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  type: 'guide' | 'checklist' | 'template' | 'video' | 'webinar' | 'form' | 'tool';
  url: string;
  isExternal: boolean;
  estimatedTime?: string;
  tags: string[];
  lastUpdated: string;
}

const COMPLIANCE_RESOURCES: ComplianceResource[] = [
  // AHPRA Resources
  {
    id: 'ahpra-advertising-guidelines',
    title: 'AHPRA Advertising Guidelines - Complete Guide',
    description: 'Comprehensive guide to professional advertising standards for all health practitioners',
    category: 'ahpra',
    urgency: 'critical',
    type: 'guide',
    url: 'https://www.ahpra.gov.au/News/2014-03-24-advertising-guidelines.aspx',
    isExternal: true,
    estimatedTime: '15-20 minutes',
    tags: ['advertising', 'professional-standards', 'marketing', 'social-media'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'ahpra-social-media-guidance',
    title: 'Social Media Guidelines for Health Practitioners',
    description: 'Specific guidance on using social media platforms while maintaining professional standards',
    category: 'ahpra',
    urgency: 'high',
    type: 'guide',
    url: 'https://help.jbsaas.com.au/ahpra-social-media-guidelines',
    isExternal: false,
    estimatedTime: '10 minutes',
    tags: ['social-media', 'facebook', 'instagram', 'linkedin', 'professional-conduct'],
    lastUpdated: '2024-01-20'
  },
  {
    id: 'ahpra-testimonial-rules',
    title: 'Patient Testimonial and Review Guidelines',
    description: 'Rules and requirements for using patient testimonials and reviews in marketing',
    category: 'ahpra',
    urgency: 'high',
    type: 'checklist',
    url: 'https://help.jbsaas.com.au/ahpra-testimonial-checklist',
    isExternal: false,
    estimatedTime: '5 minutes',
    tags: ['testimonials', 'reviews', 'patient-feedback', 'marketing'],
    lastUpdated: '2024-01-18'
  },
  {
    id: 'ahpra-before-after-photos',
    title: 'Before and After Photo Compliance Guide',
    description: 'Requirements and restrictions for using before/after images in healthcare marketing',
    category: 'ahpra',
    urgency: 'critical',
    type: 'guide',
    url: 'https://help.jbsaas.com.au/before-after-photo-compliance',
    isExternal: false,
    estimatedTime: '12 minutes',
    tags: ['photography', 'aesthetic-medicine', 'visual-marketing', 'consent'],
    lastUpdated: '2024-01-22'
  },

  // TGA Resources
  {
    id: 'tga-therapeutic-goods-advertising',
    title: 'TGA Therapeutic Goods Advertising Code',
    description: 'Official code governing the advertising of therapeutic goods in Australia',
    category: 'tga',
    urgency: 'critical',
    type: 'guide',
    url: 'https://www.tga.gov.au/advertising-therapeutic-goods',
    isExternal: true,
    estimatedTime: '25-30 minutes',
    tags: ['therapeutic-goods', 'medical-devices', 'medicines', 'advertising-code'],
    lastUpdated: '2024-01-10'
  },
  {
    id: 'tga-medical-device-classification',
    title: 'Medical Device Classification Guide',
    description: 'Understanding device classes and their advertising restrictions',
    category: 'tga',
    urgency: 'high',
    type: 'tool',
    url: 'https://help.jbsaas.com.au/tga-device-classification',
    isExternal: false,
    estimatedTime: '8 minutes',
    tags: ['medical-devices', 'classification', 'regulations', 'compliance'],
    lastUpdated: '2024-01-25'
  },
  {
    id: 'tga-claims-validation',
    title: 'Therapeutic Claims Validation Tool',
    description: 'Interactive tool to validate therapeutic claims before publication',
    category: 'tga',
    urgency: 'high',
    type: 'tool',
    url: '/tools/tga-claims-validator',
    isExternal: false,
    estimatedTime: '3-5 minutes per claim',
    tags: ['claims-validation', 'therapeutic-claims', 'compliance-check'],
    lastUpdated: '2024-01-28'
  },

  // Cultural Safety Resources
  {
    id: 'indigenous-health-cultural-safety',
    title: 'Cultural Safety in Indigenous Health',
    description: 'Guidelines for respectful and culturally safe Indigenous health content',
    category: 'cultural',
    urgency: 'high',
    type: 'guide',
    url: 'https://help.jbsaas.com.au/indigenous-cultural-safety',
    isExternal: false,
    estimatedTime: '20 minutes',
    tags: ['indigenous-health', 'cultural-safety', 'reconciliation', 'community-consultation'],
    lastUpdated: '2024-01-20'
  },
  {
    id: 'cultural-consultation-process',
    title: 'Cultural Consultation Request Process',
    description: 'Step-by-step guide to requesting cultural review for Indigenous health content',
    category: 'cultural',
    urgency: 'medium',
    type: 'guide',
    url: '/dashboard/cultural-consultation',
    isExternal: false,
    estimatedTime: '5 minutes',
    tags: ['consultation', 'cultural-review', 'indigenous-advisors'],
    lastUpdated: '2024-01-23'
  },

  // Privacy & Data Protection
  {
    id: 'privacy-act-healthcare',
    title: 'Privacy Act Requirements for Healthcare',
    description: 'Australian Privacy Act compliance for healthcare providers and patient data',
    category: 'privacy',
    urgency: 'high',
    type: 'guide',
    url: 'https://help.jbsaas.com.au/privacy-act-healthcare',
    isExternal: false,
    estimatedTime: '18 minutes',
    tags: ['privacy', 'patient-data', 'consent', 'data-protection'],
    lastUpdated: '2024-01-19'
  },
  {
    id: 'patient-consent-forms',
    title: 'Patient Consent Form Templates',
    description: 'Legally compliant consent forms for marketing and photography',
    category: 'privacy',
    urgency: 'medium',
    type: 'template',
    url: 'https://help.jbsaas.com.au/consent-form-templates',
    isExternal: false,
    estimatedTime: '10 minutes',
    tags: ['consent-forms', 'patient-rights', 'legal-templates'],
    lastUpdated: '2024-01-21'
  },

  // Advertising & Marketing
  {
    id: 'healthcare-marketing-best-practices',
    title: 'Ethical Healthcare Marketing Best Practices',
    description: 'Professional marketing strategies that comply with Australian healthcare regulations',
    category: 'advertising',
    urgency: 'medium',
    type: 'guide',
    url: 'https://help.jbsaas.com.au/ethical-marketing-practices',
    isExternal: false,
    estimatedTime: '15 minutes',
    tags: ['ethical-marketing', 'professional-standards', 'patient-trust'],
    lastUpdated: '2024-01-26'
  },
  {
    id: 'prohibited-advertising-terms',
    title: 'Prohibited Terms and Claims Checklist',
    description: 'Comprehensive list of terms and claims that cannot be used in healthcare advertising',
    category: 'advertising',
    urgency: 'critical',
    type: 'checklist',
    url: 'https://help.jbsaas.com.au/prohibited-terms-checklist',
    isExternal: false,
    estimatedTime: '8 minutes',
    tags: ['prohibited-terms', 'claims', 'compliance-checklist'],
    lastUpdated: '2024-01-24'
  },

  // Emergency & Support
  {
    id: 'compliance-emergency-support',
    title: '24/7 Compliance Emergency Support',
    description: 'Immediate assistance for urgent compliance questions and violations',
    category: 'general',
    urgency: 'critical',
    type: 'guide',
    url: 'tel:1800-JBSAAS',
    isExternal: false,
    estimatedTime: 'Immediate',
    tags: ['emergency-support', '24-7-help', 'urgent-compliance'],
    lastUpdated: '2024-01-28'
  },
  {
    id: 'compliance-violation-response',
    title: 'How to Respond to Compliance Violations',
    description: 'Step-by-step response plan for AHPRA or TGA compliance issues',
    category: 'general',
    urgency: 'high',
    type: 'guide',
    url: 'https://help.jbsaas.com.au/violation-response-plan',
    isExternal: false,
    estimatedTime: '12 minutes',
    tags: ['violation-response', 'crisis-management', 'legal-guidance'],
    lastUpdated: '2024-01-27'
  }
];

interface HealthcareComplianceHelpProps {
  category?: ComplianceResource['category'];
  compact?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  className?: string;
}

export const HealthcareComplianceHelp: React.FC<HealthcareComplianceHelpProps> = ({
  category,
  compact = false,
  showSearch = true,
  maxItems = 10,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplianceResource['category'] | 'all'>(category || 'all');

  const getCategoryIcon = (cat: ComplianceResource['category']) => {
    switch (cat) {
      case 'ahpra': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'tga': return <Stethoscope className="h-4 w-4 text-green-600" />;
      case 'cultural': return <Users className="h-4 w-4 text-orange-600" />;
      case 'privacy': return <Scale className="h-4 w-4 text-purple-600" />;
      case 'advertising': return <Globe className="h-4 w-4 text-red-600" />;
      case 'general': return <HelpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: ComplianceResource['type']) => {
    switch (type) {
      case 'guide': return <BookOpen className="h-3 w-3" />;
      case 'checklist': return <CheckCircle className="h-3 w-3" />;
      case 'template': return <FileText className="h-3 w-3" />;
      case 'video': return <Video className="h-3 w-3" />;
      case 'webinar': return <MessageCircle className="h-3 w-3" />;
      case 'form': return <Download className="h-3 w-3" />;
      case 'tool': return <Lightbulb className="h-3 w-3" />;
    }
  };

  const getUrgencyColor = (urgency: ComplianceResource['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const filteredResources = COMPLIANCE_RESOURCES.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }).slice(0, maxItems);

  const handleResourceClick = (resource: ComplianceResource) => {
    if (resource.isExternal) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = resource.url;
    }
  };

  const categoryStats = COMPLIANCE_RESOURCES.reduce((acc, resource) => {
    acc[resource.category] = (acc[resource.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter */}
      {showSearch && !compact && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span>Healthcare Compliance Help Centre</span>
            </CardTitle>
            <CardDescription>
              Find guidance, resources, and support for Australian healthcare compliance requirements
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search compliance resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Categories ({COMPLIANCE_RESOURCES.length})</option>
                <option value="ahpra">AHPRA ({categoryStats.ahpra || 0})</option>
                <option value="tga">TGA ({categoryStats.tga || 0})</option>
                <option value="cultural">Cultural Safety ({categoryStats.cultural || 0})</option>
                <option value="privacy">Privacy ({categoryStats.privacy || 0})</option>
                <option value="advertising">Advertising ({categoryStats.advertising || 0})</option>
                <option value="general">General ({categoryStats.general || 0})</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Alert */}
      {!compact && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>Compliance Emergency?</strong> Get immediate assistance 24/7
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = 'tel:1800-JBSAAS'}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:compliance@jbsaas.com.au'}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resources List */}
      <div className="space-y-3">
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or category filter
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource) => (
            <Card 
              key={resource.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                resource.urgency === 'critical' ? 'border-l-4 border-l-red-500' : 
                resource.urgency === 'high' ? 'border-l-4 border-l-orange-500' : ''
              }`}
              onClick={() => handleResourceClick(resource)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(resource.category)}
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                        {resource.title}
                      </h3>
                      {resource.isExternal && (
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUrgencyColor(resource.urgency)}`}
                      >
                        {resource.urgency.toUpperCase()}
                      </Badge>
                      
                      <Badge variant="secondary" className="text-xs">
                        {getTypeIcon(resource.type)}
                        <span className="ml-1 capitalize">{resource.type}</span>
                      </Badge>
                      
                      {resource.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-2 w-2 mr-1" />
                          {resource.estimatedTime}
                        </Badge>
                      )}
                    </div>
                    
                    {!compact && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.tags.slice(0, 4).map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{resource.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResourceClick(resource);
                    }}
                  >
                    <span className="text-xs">
                      {resource.type === 'tool' ? 'Use Tool' : 
                       resource.type === 'template' ? 'Download' : 
                       'View Guide'}
                    </span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions Footer */}
      {!compact && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Need personalised compliance guidance?
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/compliance-assessment'}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Compliance Assessment
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = 'mailto:compliance@jbsaas.com.au?subject=Compliance Consultation Request'}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Book Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 