import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Scale,
  Users,
  Building,
  Clock,
  Download,
  Copy,
  ExternalLink,
  Zap,
  Search,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ComplianceCheck {
  id: string;
  content: string;
  industry: string;
  regulations: string[];
  warnings: string[];
  suggestions: string[];
  compliance_score: number;
  last_checked: string;
}

interface RegulationUpdate {
  id: string;
  title: string;
  description: string;
  industry: string[];
  effective_date: string;
  impact_level: 'low' | 'medium' | 'high';
  action_required: boolean;
  source: string;
}

const AUSTRALIAN_INDUSTRIES = [
  { value: 'financial', label: 'Financial Services', regulations: ['ASIC', 'AUSTRAC', 'Privacy Act'] },
  { value: 'healthcare', label: 'Healthcare & Medical', regulations: ['TGA', 'Privacy Act', 'Health Records Act'] },
  { value: 'food', label: 'Food & Beverage', regulations: ['FSANZ', 'ACCC', 'Australian Consumer Law'] },
  { value: 'automotive', label: 'Automotive', regulations: ['ACCC', 'Australian Consumer Law', 'ADR'] },
  { value: 'legal', label: 'Legal Services', regulations: ['Law Society', 'Legal Profession Act', 'Privacy Act'] },
  { value: 'education', label: 'Education & Training', regulations: ['TEQSA', 'Privacy Act', 'Student Protection'] },
  { value: 'construction', label: 'Construction & Building', regulations: ['Fair Trading', 'BCA', 'Work Health & Safety'] },
  { value: 'real_estate', label: 'Real Estate', regulations: ['Real Estate Institute', 'Fair Trading', 'Privacy Act'] },
  { value: 'telecommunications', label: 'Telecommunications', regulations: ['ACMA', 'Privacy Act', 'Spam Act'] },
  { value: 'retail', label: 'Retail & E-commerce', regulations: ['ACCC', 'Australian Consumer Law', 'Privacy Act'] }
];

const COMPLIANCE_TEMPLATES = {
  privacy_policy: {
    title: 'Privacy Policy Statement',
    description: 'Australian Privacy Principles compliant privacy policy',
    template: 'We are committed to protecting your privacy in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs)...'
  },
  terms_conditions: {
    title: 'Terms & Conditions',
    description: 'Australian Consumer Law compliant terms',
    template: 'These terms and conditions comply with Australian Consumer Law and govern your use of our services...'
  },
  disclaimer: {
    title: 'Professional Disclaimer',
    description: 'Industry-specific professional disclaimers',
    template: 'This information is general in nature and does not constitute professional advice...'
  }
};

export default function AustralianComplianceContentSystem() {
  const [activeTab, setActiveTab] = useState('checker');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [contentToCheck, setContentToCheck] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceCheck | null>(null);
  const [regulationUpdates, setRegulationUpdates] = useState<RegulationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRegulationUpdates();
  }, []);

  const loadRegulationUpdates = async () => {
    try {
      // Simulate loading regulation updates
      const mockUpdates: RegulationUpdate[] = [
        {
          id: '1',
          title: 'Privacy Act Amendment (Notifiable Data Breaches)',
          description: 'New requirements for notifying data breaches to the Privacy Commissioner and affected individuals',
          industry: ['financial', 'healthcare', 'retail', 'telecommunications'],
          effective_date: '2024-02-01',
          impact_level: 'high',
          action_required: true,
          source: 'Office of the Australian Information Commissioner'
        },
        {
          id: '2',
          title: 'Australian Consumer Law - Social Media Advertising Guidelines',
          description: 'Updated guidelines for advertising on social media platforms including disclosure requirements',
          industry: ['retail', 'food', 'automotive', 'real_estate'],
          effective_date: '2024-03-15',
          impact_level: 'medium',
          action_required: true,
          source: 'Australian Competition & Consumer Commission'
        },
        {
          id: '3',
          title: 'Therapeutic Goods Administration - Social Media Claims',
          description: 'New restrictions on health claims made through social media channels',
          industry: ['healthcare', 'food'],
          effective_date: '2024-01-30',
          impact_level: 'high',
          action_required: true,
          source: 'Therapeutic Goods Administration'
        }
      ];

      setRegulationUpdates(mockUpdates);
    } catch (error) {
      console.error('Error loading regulation updates:', error);
      toast({
        title: "Error",
        description: "Failed to load regulation updates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCompliance = async () => {
    if (!contentToCheck.trim() || !selectedIndustry) {
      toast({
        title: "Missing Information",
        description: "Please select an industry and enter content to check",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Simulate compliance checking with AI
      await new Promise(resolve => setTimeout(resolve, 3000));

      const industry = AUSTRALIAN_INDUSTRIES.find(i => i.value === selectedIndustry);
      
      const mockResult: ComplianceCheck = {
        id: crypto.randomUUID(),
        content: contentToCheck,
        industry: selectedIndustry,
        regulations: industry?.regulations || [],
        warnings: [
          'Consider adding a disclaimer about professional advice',
          'Ensure claims are substantiated with evidence',
          'Review privacy implications of customer data collection'
        ],
        suggestions: [
          'Add "Results may vary" disclaimer for testimonials',
          'Include reference to Australian Consumer Law',
          'Consider adding contact information for complaints'
        ],
        compliance_score: Math.floor(Math.random() * 30) + 70, // 70-100
        last_checked: new Date().toISOString()
      };

      setComplianceResult(mockResult);

      toast({
        title: "Compliance Check Complete",
        description: `Content scored ${mockResult.compliance_score}% compliance`
      });

    } catch (error) {
      console.error('Error checking compliance:', error);
      toast({
        title: "Check Failed",
        description: "Failed to check content compliance",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const generateComplianceContent = async (templateType: string) => {
    if (!selectedIndustry) {
      toast({
        title: "Industry Required",
        description: "Please select an industry first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: `Generate an Australian ${templateType} for a ${selectedIndustry} business. Ensure compliance with relevant Australian regulations including Privacy Act 1988, Australian Consumer Law, and industry-specific requirements.`,
          contentType: 'compliance_document',
          businessContext: {
            industry: selectedIndustry,
            documentType: templateType,
            jurisdiction: 'Australia'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Document Generated",
        description: `${COMPLIANCE_TEMPLATES[templateType as keyof typeof COMPLIANCE_TEMPLATES]?.title} generated successfully`
      });

    } catch (error) {
      console.error('Error generating compliance content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate compliance document",
        variant: "destructive"
      });
    }
  };

  const copyContent = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Content Copied",
      description: "Content copied to clipboard"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading compliance system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Australian Compliance Content System</h1>
          <p className="text-muted-foreground">Ensure your content meets Australian regulatory requirements</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checker">Compliance Checker</TabsTrigger>
          <TabsTrigger value="templates">Legal Templates</TabsTrigger>
          <TabsTrigger value="updates">Regulation Updates</TabsTrigger>
          <TabsTrigger value="guidance">Industry Guidance</TabsTrigger>
        </TabsList>

        <TabsContent value="checker" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Content Compliance Checker
              </CardTitle>
              <CardDescription>
                Check your content against Australian regulations and industry standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUSTRALIAN_INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedIndustry && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {AUSTRALIAN_INDUSTRIES.find(i => i.value === selectedIndustry)?.regulations.map((reg) => (
                      <Badge key={reg} variant="secondary" className="text-xs">
                        {reg}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content to Check</label>
                <Textarea
                  value={contentToCheck}
                  onChange={(e) => setContentToCheck(e.target.value)}
                  placeholder="Paste your marketing content, social media post, or website copy here..."
                  rows={6}
                />
              </div>

              <Button 
                onClick={checkCompliance}
                disabled={isChecking || !contentToCheck.trim() || !selectedIndustry}
                className="w-full"
                size="lg"
              >
                {isChecking ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-pulse" />
                    Checking Compliance...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Check Compliance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {complianceResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Compliance Analysis Results
                  </span>
                  <Badge 
                    variant={complianceResult.compliance_score >= 90 ? "default" : complianceResult.compliance_score >= 70 ? "secondary" : "destructive"}
                  >
                    {complianceResult.compliance_score}% Compliant
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Warnings
                    </h4>
                    <ul className="space-y-1">
                      {complianceResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Suggestions
                    </h4>
                    <ul className="space-y-1">
                      {complianceResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-2">Applicable Regulations</h4>
                  <div className="flex flex-wrap gap-2">
                    {complianceResult.regulations.map((regulation) => (
                      <Badge key={regulation} variant="outline">
                        {regulation}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyContent(complianceResult.content)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(COMPLIANCE_TEMPLATES).map(([key, template]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.title}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {template.template}
                  </div>
                  <Button 
                    onClick={() => generateComplianceContent(key)}
                    disabled={!selectedIndustry}
                    className="w-full"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate for {selectedIndustry ? AUSTRALIAN_INDUSTRIES.find(i => i.value === selectedIndustry)?.label : 'Industry'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {!selectedIndustry && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select an industry from the Compliance Checker tab to generate customized templates.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Regulation Updates</h2>
            <Badge variant="outline">{regulationUpdates.length} Updates</Badge>
          </div>

          {regulationUpdates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{update.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Effective: {new Date(update.effective_date).toLocaleDateString()}
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs">{update.source}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={update.impact_level === 'high' ? 'destructive' : update.impact_level === 'medium' ? 'default' : 'secondary'}
                    >
                      {update.impact_level.toUpperCase()} Impact
                    </Badge>
                    {update.action_required && (
                      <Badge variant="outline" className="text-xs">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{update.description}</p>
                
                <div>
                  <span className="text-sm font-medium">Affected Industries:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {update.industry.map((ind) => (
                      <Badge key={ind} variant="secondary" className="text-xs">
                        {AUSTRALIAN_INDUSTRIES.find(i => i.value === ind)?.label || ind}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="guidance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick Reference Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Social Media Advertising</h4>
                    <p className="text-xs text-muted-foreground">Must clearly identify sponsored content and comply with platform policies</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Health Claims</h4>
                    <p className="text-xs text-muted-foreground">Require substantiation and TGA approval for therapeutic claims</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Financial Services</h4>
                    <p className="text-xs text-muted-foreground">Must include appropriate risk warnings and disclaimers</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Privacy Collection</h4>
                    <p className="text-xs text-muted-foreground">Requires clear notification and consent under Privacy Act</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Key Regulatory Bodies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ACCC</span>
                    <Badge variant="outline" className="text-xs">Competition & Consumer</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ASIC</span>
                    <Badge variant="outline" className="text-xs">Financial Services</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">TGA</span>
                    <Badge variant="outline" className="text-xs">Therapeutic Goods</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">OAIC</span>
                    <Badge variant="outline" className="text-xs">Privacy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ACMA</span>
                    <Badge variant="outline" className="text-xs">Communications</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> This system provides general guidance only and does not constitute legal advice. 
              Always consult with qualified legal professionals for specific compliance requirements.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}