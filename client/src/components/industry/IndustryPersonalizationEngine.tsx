import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Stethoscope, 
  Building2, 
  Scale, 
  Wrench, 
  Palette, 
  Dumbbell, 
  Monitor,
  Sparkles,
  Target,
  Shield,
  TrendingUp
} from 'lucide-react';

export interface Industry {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  complianceRequirements: string[];
  contentTopics: string[];
  targetAudience: string[];
  marketingChallenges: string[];
  aiToneRecommendation: 'professional' | 'friendly' | 'authoritative' | 'empathetic' | 'exciting';
  templateCategories: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    id: 'health',
    name: 'Healthcare & Medical',
    icon: Stethoscope,
    color: 'text-red-600',
    description: 'Medical practices, clinics, and healthcare providers',
    complianceRequirements: [
      'AHPRA registration compliance',
      'TGA advertising guidelines',
      'Privacy Act 1988 (health information)',
      'No prescription medication advertising',
      'Professional service limitations'
    ],
    contentTopics: [
      'Patient education content',
      'Health awareness campaigns',
      'Practice announcements',
      'Preventive care information',
      'Treatment explanations'
    ],
    targetAudience: ['Patients', 'Health-conscious individuals', 'Family caregivers', 'Elderly population'],
    marketingChallenges: [
      'Strict advertising regulations',
      'Patient trust and credibility',
      'Complex medical information',
      'Ethical marketing boundaries'
    ],
    aiToneRecommendation: 'professional',
    templateCategories: ['Educational', 'Appointment Reminders', 'Health Tips', 'Practice Updates']
  },
  {
    id: 'finance',
    name: 'Financial Services',
    icon: Building2,
    color: 'text-blue-600',
    description: 'Banks, accounting firms, financial advisors, and insurance',
    complianceRequirements: [
      'ASIC regulatory compliance',
      'Financial advice disclaimers',
      'Privacy and confidentiality',
      'Risk disclosure requirements',
      'Professional indemnity standards'
    ],
    contentTopics: [
      'Financial education',
      'Market updates',
      'Investment insights',
      'Tax preparation tips',
      'Insurance guidance'
    ],
    targetAudience: ['Business owners', 'Individuals seeking financial advice', 'Investors', 'SMEs'],
    marketingChallenges: [
      'Complex regulatory environment',
      'Building trust with sensitive information',
      'Explaining complex financial concepts',
      'Market volatility communication'
    ],
    aiToneRecommendation: 'authoritative',
    templateCategories: ['Market Analysis', 'Client Updates', 'Educational Content', 'Regulatory Updates']
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: Scale,
    color: 'text-purple-600',
    description: 'Law firms, solicitors, barristers, and legal consultants',
    complianceRequirements: [
      'Legal profession conduct rules',
      'Client confidentiality requirements',
      'No outcome guarantees',
      'Professional advertising standards',
      'Fee disclosure obligations'
    ],
    contentTopics: [
      'Legal rights education',
      'Law changes and updates',
      'Process explanations',
      'Preventive legal advice',
      'Case study insights'
    ],
    targetAudience: ['Individuals needing legal help', 'Business owners', 'Other professionals', 'General public'],
    marketingChallenges: [
      'Ethical advertising restrictions',
      'Complex legal language',
      'Building client trust',
      'Demonstrating expertise without guarantees'
    ],
    aiToneRecommendation: 'professional',
    templateCategories: ['Legal Updates', 'Client Education', 'Process Guides', 'Rights Information']
  },
  {
    id: 'tech',
    name: 'Technology & IT',
    icon: Monitor,
    color: 'text-green-600',
    description: 'Software companies, IT services, and tech consultants',
    complianceRequirements: [
      'Data privacy regulations',
      'Software licensing compliance',
      'Security standards disclosure',
      'Intellectual property respect',
      'Service level agreements'
    ],
    contentTopics: [
      'Technology trends',
      'Product updates',
      'Security best practices',
      'Digital transformation',
      'Technical tutorials'
    ],
    targetAudience: ['Business decision makers', 'IT professionals', 'Tech enthusiasts', 'SMEs digitizing'],
    marketingChallenges: [
      'Rapidly changing technology',
      'Complex technical concepts',
      'Security and trust concerns',
      'Competitive market differentiation'
    ],
    aiToneRecommendation: 'exciting',
    templateCategories: ['Product Updates', 'Technical Insights', 'Security Alerts', 'Innovation News']
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    icon: Dumbbell,
    color: 'text-orange-600',
    description: 'Gyms, personal trainers, wellness centers, and fitness professionals',
    complianceRequirements: [
      'Fitness industry standards',
      'Health and safety regulations',
      'Insurance requirements',
      'No medical claims without qualifications',
      'Professional certification display'
    ],
    contentTopics: [
      'Workout routines',
      'Nutrition tips',
      'Wellness advice',
      'Motivation content',
      'Fitness challenges'
    ],
    targetAudience: ['Fitness enthusiasts', 'Health-conscious individuals', 'Beginners', 'Athletes'],
    marketingChallenges: [
      'Motivating diverse fitness levels',
      'Avoiding unrealistic promises',
      'Seasonal engagement fluctuations',
      'Personal transformation showcasing'
    ],
    aiToneRecommendation: 'exciting',
    templateCategories: ['Workout Tips', 'Nutrition Advice', 'Motivation Posts', 'Progress Celebration']
  },
  {
    id: 'beauty',
    name: 'Beauty & Aesthetics',
    icon: Palette,
    color: 'text-pink-600',
    description: 'Beauty salons, aesthetic clinics, and cosmetic services',
    complianceRequirements: [
      'TGA cosmetic regulations',
      'Professional licensing requirements',
      'Before/after photo guidelines',
      'Treatment risk disclosures',
      'Hygiene and safety standards'
    ],
    contentTopics: [
      'Beauty trends',
      'Skincare education',
      'Treatment explanations',
      'Product recommendations',
      'Self-care tips'
    ],
    targetAudience: ['Beauty enthusiasts', 'Skincare conscious individuals', 'Professional clients', 'Wedding parties'],
    marketingChallenges: [
      'Visual content importance',
      'Realistic expectations setting',
      'Regulatory advertising restrictions',
      'Seasonal trend adaptation'
    ],
    aiToneRecommendation: 'friendly',
    templateCategories: ['Beauty Tips', 'Treatment Spotlights', 'Trend Updates', 'Self-Care Content']
  },
  {
    id: 'general',
    name: 'General Business',
    icon: Wrench,
    color: 'text-gray-600',
    description: 'All other business types and professional services',
    complianceRequirements: [
      'Australian Consumer Law',
      'Fair trading practices',
      'Privacy policy requirements',
      'Professional service standards',
      'Business registration compliance'
    ],
    contentTopics: [
      'Industry insights',
      'Business updates',
      'Customer stories',
      'Service highlights',
      'Professional tips'
    ],
    targetAudience: ['General public', 'Business customers', 'Local community', 'Professional networks'],
    marketingChallenges: [
      'Standing out in competitive markets',
      'Building brand recognition',
      'Customer acquisition and retention',
      'Digital marketing effectiveness'
    ],
    aiToneRecommendation: 'professional',
    templateCategories: ['Business Updates', 'Customer Stories', 'Industry Insights', 'Service Highlights']
  }
];

interface IndustryPersonalizationEngineProps {
  selectedIndustry?: string;
  onIndustrySelect?: (industry: Industry) => void;
  showCompactView?: boolean;
}

export const IndustryPersonalizationEngine: React.FC<IndustryPersonalizationEngineProps> = ({
  selectedIndustry,
  onIndustrySelect,
  showCompactView = false
}) => {
  const [currentIndustry, setCurrentIndustry] = useState<Industry | null>(null);

  useEffect(() => {
    if (selectedIndustry) {
      const industry = INDUSTRIES.find(ind => ind.id === selectedIndustry);
      if (industry) {
        setCurrentIndustry(industry);
      }
    }
  }, [selectedIndustry]);

  const handleIndustryChange = (industryId: string) => {
    const industry = INDUSTRIES.find(ind => ind.id === industryId);
    if (industry) {
      setCurrentIndustry(industry);
      onIndustrySelect?.(industry);
    }
  };

  if (showCompactView) {
    return (
      <div className="space-y-4">
        <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <SelectItem key={industry.id} value={industry.id}>
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-2 ${industry.color}`} />
                    {industry.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {currentIndustry && (
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <currentIndustry.icon className={`w-5 h-5 mr-2 ${currentIndustry.color}`} />
                <h3 className="font-semibold">{currentIndustry.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{currentIndustry.description}</p>
              
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Industry Compliance Built-in
                </Badge>
                <p className="text-xs text-muted-foreground">
                  AI content automatically follows {currentIndustry.complianceRequirements[0]} and other industry standards
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Industry Personalization
          </CardTitle>
          <CardDescription>
            Get content tailored specifically for your industry with built-in compliance and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              const isSelected = currentIndustry?.id === industry.id;
              
              return (
                <Card 
                  key={industry.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleIndustryChange(industry.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Icon className={`w-5 h-5 mr-2 ${industry.color}`} />
                      <h3 className="font-semibold text-sm">{industry.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{industry.description}</p>
                    
                    <div className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-muted/50"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {industry.aiToneRecommendation}
                      </Badge>
                      
                      {isSelected && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentIndustry && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <currentIndustry.icon className={`w-5 h-5 mr-2 ${currentIndustry.color}`} />
              {currentIndustry.name} - Personalized Features
            </CardTitle>
            <CardDescription>
              Your AI content will be automatically optimized for your industry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Compliance Requirements
                </h4>
                <ul className="space-y-1">
                  {currentIndustry.complianceRequirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  Content Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentIndustry.contentTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-600" />
                  Target Audience
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentIndustry.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
                  Template Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentIndustry.templateCategories.map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border">
              <h4 className="font-semibold mb-2">AI Tone Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Your content will use a <strong>{currentIndustry.aiToneRecommendation}</strong> tone, 
                optimized for {currentIndustry.name.toLowerCase()} communications and proven to work best with your target audience.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};