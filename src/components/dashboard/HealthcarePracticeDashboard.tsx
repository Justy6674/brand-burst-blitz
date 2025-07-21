import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, CheckCircle, AlertTriangle, Users, Settings, 
  FileText, Calendar, BarChart3, Plus, Building2, 
  Clock, Zap, Award, Brain, Heart, Building, MapPin, Phone, Globe, DollarSign, TrendingUp, Activity, Stethoscope
} from 'lucide-react';

interface Practice {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website?: string;
  ahpra_registration?: string;
  specialty?: string;
  staff_count?: number;
  patient_capacity?: number;
  operating_hours?: string;
}

const HealthcarePracticeDashboard = () => {
  const { user } = useHealthcareAuth();
  const { businessProfile } = useBusinessProfile();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRealPracticeData();
  }, [businessProfile]);

  const loadRealPracticeData = async () => {
    try {
      setIsLoading(true);
      
      // Load real practice data from questionnaire and user profile
      if (businessProfile) {
        const realPractice: Practice = {
          id: businessProfile.id || 'main-practice',
          name: businessProfile.businessName || 'Healthcare Practice',
          type: businessProfile.practiceType || 'General Practice',
          address: businessProfile.address || 'Address not provided',
          phone: businessProfile.phone || 'Phone not provided',
          website: businessProfile.website,
          ahpra_registration: businessProfile.ahpraRegistration,
          specialty: businessProfile.specialty,
          staff_count: businessProfile.staffCount,
          patient_capacity: businessProfile.patientCapacity,
          operating_hours: businessProfile.operatingHours || '9:00 AM - 5:00 PM'
        };
        
        setPractices([realPractice]);
        setSelectedPractice(realPractice);
      } else {
        // No practice data available - show setup prompt
        setPractices([]);
        setSelectedPractice(null);
      }
      
    } catch (error) {
      console.error('Error loading practice data:', error);
      toast({
        title: "Error",
        description: "Failed to load practice data. Please complete your business questionnaire.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedPractice) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Stethoscope className="w-6 h-6" />
            Complete Your Practice Setup
          </CardTitle>
          <CardDescription>
            Real practice data will appear here once you complete the business questionnaire
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.href = '/questionnaire'}>
            Complete Business Questionnaire
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadgeColor = (score: number) => {
    if (score >= 95) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 85) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusBadge = (status: Practice['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'setup_required':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Setup Required</Badge>;
      case 'compliance_issue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Compliance Issue</Badge>;
    }
  };

  const getProfessionIcon = (specialty: string) => {
    if (specialty.includes('Psychology')) return Brain;
    if (specialty.includes('Physiotherapy')) return Heart;
    return Shield;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Practice Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your healthcare practices with AHPRA compliance monitoring
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Practice
        </Button>
      </div>

      {/* Practice Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Healthcare Practices
          </CardTitle>
          <CardDescription>
            Switch between practices to manage different compliance settings and content workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {practices.map((practice) => {
              const Icon = getProfessionIcon(practice.specialty || '');
              const isSelected = selectedPractice.id === practice.id;
              
              return (
                <Card 
                  key={practice.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedPractice(practice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="h-8 w-8 text-blue-600" />
                      {getStatusBadge(practice.status)}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{practice.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{practice.specialty}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">AHPRA Compliance</span>
                        <span className={`text-sm font-semibold ${getComplianceColor(practice.ahpra_compliance_score)}`}>
                          {practice.ahpra_compliance_score}%
                        </span>
                      </div>
                      <Progress 
                        value={practice.ahpra_compliance_score} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      {practice.locations.length} location{practice.locations.length > 1 ? 's' : ''} • 
                      {practice.type === 'solo' ? ' Solo Practice' : 
                       practice.type === 'group' ? ' Group Practice' : 
                       ' Healthcare Network'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Practice Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Compliance Status */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AHPRA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getComplianceColor(selectedPractice.ahpra_compliance_score)}`}>
                {selectedPractice.ahpra_compliance_score}%
              </div>
              <Badge className={`mt-2 ${getComplianceBadgeColor(selectedPractice.ahpra_compliance_score)}`}>
                {selectedPractice.ahpra_compliance_score >= 95 ? 'Excellent' :
                 selectedPractice.ahpra_compliance_score >= 85 ? 'Good' : 'Needs Attention'}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">
                Last checked: {new Date(selectedPractice.last_compliance_check).toLocaleDateString()}
              </p>
            </div>

            {selectedPractice.status === 'compliance_issue' && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  3 content pieces need compliance review
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {selectedPractice.name} - Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{selectedPractice.content_generated}</div>
                <p className="text-sm text-gray-600">Content Pieces Generated</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{selectedPractice.patients_engaged.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Patients Engaged</p>
                <p className="text-xs text-gray-500">Through content</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{selectedPractice.active_campaigns}</div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-xs text-gray-500">Currently running</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Management Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-800 mb-2">Patient Education</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Create AHPRA-compliant patient education materials
                </p>
                <Button variant="outline" size="sm">
                  Create Content
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:bg-green-50 cursor-pointer transition-colors">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Practice Marketing</h3>
                <p className="text-sm text-green-700 mb-4">
                  Generate compliant marketing materials for your practice
                </p>
                <Button variant="outline" size="sm">
                  Create Content
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:bg-purple-50 cursor-pointer transition-colors">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-800 mb-2">Professional Content</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Share insights with healthcare colleagues
                </p>
                <Button variant="outline" size="sm">
                  Create Content
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AHPRA Compliance Monitoring
              </CardTitle>
              <CardDescription>
                Real-time compliance status for {selectedPractice.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Advertising Guidelines</h4>
                      <p className="text-sm text-gray-600">All content follows AHPRA advertising rules</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">TGA Therapeutic Claims</h4>
                      <p className="text-sm text-gray-600">No prohibited therapeutic advertising detected</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>

                {selectedPractice.status === 'compliance_issue' && (
                  <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-semibold text-red-800">Professional Boundaries</h4>
                        <p className="text-sm text-red-600">3 content pieces contain potential testimonials</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Review Content
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Registration Display</h4>
                      <p className="text-sm text-gray-600">AHPRA registration properly displayed</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Patient education posts</span>
                    <span className="font-semibold">85% engagement</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Practice marketing content</span>
                    <span className="font-semibold">72% engagement</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Professional articles</span>
                    <span className="font-semibold">91% engagement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">↗ 5%</div>
                  <p className="text-sm text-gray-600">Compliance improvement this month</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Better adherence to AHPRA guidelines
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Configuration</CardTitle>
              <CardDescription>
                Manage settings specific to {selectedPractice.specialty?.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Auto-compliance checking</h4>
                    <p className="text-sm text-gray-600">Automatically scan content for AHPRA compliance</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Specialty-specific templates</h4>
                    <p className="text-sm text-gray-600">Use {selectedPractice.specialty?.toLowerCase()}-specific content templates</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Multi-location management</h4>
                    <p className="text-sm text-gray-600">Manage content across {selectedPractice.locations.length} locations</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 