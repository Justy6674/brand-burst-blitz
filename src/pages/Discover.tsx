import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/layout/HeroSection';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Heart, 
  Scale, 
  DollarSign, 
  Dumbbell, 
  Sparkles, 
  Laptop,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';
import aiContentHero from '@/assets/ai-content-creation-hero.jpg';

const industries = [
  {
    id: 'health',
    name: 'Healthcare & Medical',
    icon: Heart,
    description: 'Compliant content for medical practices, clinics, and health services',
    color: 'bg-red-500',
    examples: ['Patient education posts', 'Health tips and advice', 'Service announcements'],
    regulations: 'TGA & Privacy Act compliant'
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    icon: DollarSign,
    description: 'Professional content for financial services and advisors',
    color: 'bg-green-500',
    examples: ['Financial literacy content', 'Market updates', 'Service explanations'],
    regulations: 'ASIC & APRA compliant'
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: Scale,
    description: 'Professional content for law firms and legal practitioners',
    color: 'bg-blue-500',
    examples: ['Legal education posts', 'Process explanations', 'Firm announcements'],
    regulations: 'Law Society compliant'
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    icon: Dumbbell,
    description: 'Engaging content for gyms, trainers, and wellness businesses',
    color: 'bg-orange-500',
    examples: ['Workout tips', 'Nutrition advice', 'Client success stories'],
    regulations: 'Health claims compliant'
  },
  {
    id: 'beauty',
    name: 'Beauty & Cosmetics',
    icon: Sparkles,
    description: 'Attractive content for beauty salons and cosmetic businesses',
    color: 'bg-pink-500',
    examples: ['Beauty tips', 'Treatment showcases', 'Product highlights'],
    regulations: 'TGA cosmetics compliant'
  },
  {
    id: 'tech',
    name: 'Technology & Software',
    icon: Laptop,
    description: 'Technical content for IT companies and software businesses',
    color: 'bg-purple-500',
    examples: ['Tech insights', 'Product updates', 'Industry trends'],
    regulations: 'Privacy & cyber security aware'
  },
  {
    id: 'general',
    name: 'General Business',
    icon: Building2,
    description: 'Professional content for any Australian business',
    color: 'bg-gray-500',
    examples: ['Business insights', 'Industry news', 'Company updates'],
    regulations: 'Australian business compliant'
  }
];

const Discover = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    // Store selection in localStorage for use in signup flow
    localStorage.setItem('selected-industry', industryId);
  };

  const selectedIndustryData = industries.find(ind => ind.id === selectedIndustry);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <HeroSection backgroundImage={aiContentHero} className="min-h-[60vh]">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-base px-4 py-2">
            🇦🇺 Industry-Specific AI Content for Australian Businesses
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            <span className="block mb-2">Discover Your</span>
            <span className="text-gradient-hero block">Industry-Specific</span>
            <span className="block">Content Solutions</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            Get AI content that understands your industry's regulations, terminology, and audience. 
            <strong className="block mt-2">Choose your industry to see exactly what we can create for you.</strong>
          </p>
        </div>
      </HeroSection>

      {/* Industry Selection */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Industry Are You In?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your industry to see customized content examples and compliance features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {industries.map((industry) => {
              const Icon = industry.icon;
              const isSelected = selectedIndustry === industry.id;
              
              return (
                <Card 
                  key={industry.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleIndustrySelect(industry.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${industry.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{industry.name}</CardTitle>
                        {isSelected && (
                          <Badge className="mt-1 bg-primary/10 text-primary">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{industry.description}</p>
                    <div className="text-sm">
                      <div className="font-medium text-primary mb-2">✓ {industry.regulations}</div>
                      <div className="space-y-1">
                        {industry.examples.map((example, idx) => (
                          <div key={idx} className="text-muted-foreground">• {example}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Industry-Specific Preview */}
          {selectedIndustryData && (
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-16 h-16 ${selectedIndustryData.color} rounded-xl flex items-center justify-center`}>
                    <selectedIndustryData.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Perfect for {selectedIndustryData.name}</CardTitle>
                    <p className="text-muted-foreground">Here's what you'll get with industry-specific AI</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Content Examples:</h4>
                    <div className="space-y-3">
                      {selectedIndustryData.examples.map((example, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-primary" />
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Compliance Features:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>{selectedIndustryData.regulations}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Australian terminology & context</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Industry-specific tone & voice</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="premium" size="lg" asChild>
                    <Link to="/auth">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Creating {selectedIndustryData.name} Content
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/pricing">
                      View Pricing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          {!selectedIndustry && (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Don't see your industry? We support all Australian businesses with general business content.
              </p>
              <Button variant="outline" size="lg" onClick={() => handleIndustrySelect('general')}>
                Choose General Business
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Discover;