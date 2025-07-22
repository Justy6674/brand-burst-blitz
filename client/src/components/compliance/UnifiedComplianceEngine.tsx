import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AHPRAComplianceDashboard } from './AHPRAComplianceDashboard';
import { AustralianBusinessValidator } from '../business/AustralianBusinessValidator';
import { useAHPRACompliance, HealthcarePracticeType, ComplianceResult } from '@/hooks/useAHPRACompliance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Building,
  Stethoscope,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  Users,
  BookOpen,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

interface ComplianceMetrics {
  overallScore: number;
  ahpraScore: number;
  tgaScore: number;
  abnScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAssessment: string;
  activeViolations: number;
  resolvedViolations: number;
}

interface PracticeProfile {
  id: string;
  practiceName: string;
  practiceType: string;
  ahpraRegistration: string;
  abn?: string;
  ahpraValidated: boolean;
  abnValidated: boolean;
  specialtyArea?: string;
  practiceLocation?: string;
}

interface UnifiedComplianceEngineProps {
  businessId?: string;
  autoAssessment?: boolean;
  showAdvancedMetrics?: boolean;
}

export const UnifiedComplianceEngine: React.FC<UnifiedComplianceEngineProps> = ({
  businessId,
  autoAssessment = true,
  showAdvancedMetrics = true
}) => {
  const { toast } = useToast();
  const { validateContent, isValidating } = useAHPRACompliance();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [practiceProfile, setPracticeProfile] = useState<PracticeProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastComplianceCheck, setLastComplianceCheck] = useState<ComplianceResult | null>(null);
  
  // Practice profile setup
  const [practiceSetup, setPracticeSetup] = useState({
    practiceName: '',
    practiceType: 'gp' as const,
    ahpraRegistration: '',
    abn: '',
    specialtyArea: '',
    practiceLocation: ''
  });

  // Load compliance data on component mount
  useEffect(() => {
    if (autoAssessment) {
      loadComplianceData();
    }
  }, [businessId, autoAssessment]);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);
      
      // Load practice profile
      await loadPracticeProfile();
      
      // Load compliance metrics
      await loadComplianceMetrics();
      
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load compliance data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPracticeProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profiles, error } = await supabase
        .from('healthcare_practice_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setPracticeProfile({
          id: profile.id,
          practiceName: profile.practice_name,
          practiceType: profile.practice_type,
          ahpraRegistration: profile.ahpra_registration,
          abn: profile.abn,
          ahpraValidated: profile.ahpra_validated,
          abnValidated: profile.abn_validated,
          specialtyArea: profile.specialty_area,
          practiceLocation: profile.practice_location
        });
        
        // Update practice setup form
        setPracticeSetup({
          practiceName: profile.practice_name,
          practiceType: profile.practice_type,
          ahpraRegistration: profile.ahpra_registration,
          abn: profile.abn || '',
          specialtyArea: profile.specialty_area || '',
          practiceLocation: profile.practice_location || ''
        });
      }
    } catch (error) {
      console.error('Error loading practice profile:', error);
    }
  };

  const loadComplianceMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call the compliance score calculation function
      const { data: scoreData, error } = await supabase
        .rpc('calculate_user_compliance_score', { user_uuid: user.id });

      if (error) throw error;

      // Get violations summary
      const { data: violationsData, error: violationsError } = await supabase
        .rpc('get_compliance_violations_summary', { user_uuid: user.id });

      if (violationsError) throw violationsError;

      if (scoreData && violationsData) {
        setComplianceMetrics({
          overallScore: scoreData.overall_score,
          ahpraScore: scoreData.ahpra_score,
          tgaScore: scoreData.tga_score,
          abnScore: scoreData.abn_score,
          riskLevel: scoreData.risk_level,
          lastAssessment: scoreData.calculated_at,
          activeViolations: violationsData.active_violations || 0,
          resolvedViolations: violationsData.resolved_violations || 0
        });
      }
    } catch (error) {
      console.error('Error loading compliance metrics:', error);
    }
  };

  const validateAHPRARegistration = async () => {
    if (!practiceSetup.ahpraRegistration) {
      toast({
        title: "Missing Information",
        description: "Please enter an AHPRA registration number",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/validate-ahpra-registration`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            registrationNumber: practiceSetup.ahpraRegistration,
            practiceType: practiceSetup.practiceType
          })
        }
      );

      const result = await response.json();

      if (result.isValid) {
        toast({
          title: "AHPRA Validation Successful",
          description: `Registration verified for ${result.practitionerName}`,
          variant: "default"
        });
        
        // Update practice profile
        await updatePracticeProfile({ ahpraValidated: true });
      } else {
        toast({
          title: "AHPRA Validation Failed",
          description: result.error || "Registration number not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating AHPRA registration:', error);
      toast({
        title: "Validation Error",
        description: "Unable to validate AHPRA registration",
        variant: "destructive"
      });
    }
  };

  const validateABN = async () => {
    if (!practiceSetup.abn) {
      toast({
        title: "Missing Information",
        description: "Please enter an ABN",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/validate-australian-business`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ abn: practiceSetup.abn })
        }
      );

      const result = await response.json();

      if (result.isValid) {
        toast({
          title: "ABN Validation Successful",
          description: `Business verified: ${result.businessName}`,
          variant: "default"
        });
        
        // Update practice profile
        await updatePracticeProfile({ abnValidated: true });
      } else {
        toast({
          title: "ABN Validation Failed",
          description: result.error || "ABN not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating ABN:', error);
      toast({
        title: "Validation Error",
        description: "Unable to validate ABN",
        variant: "destructive"
      });
    }
  };

  const savePracticeProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profileData = {
        user_id: user.id,
        practice_name: practiceSetup.practiceName,
        practice_type: practiceSetup.practiceType,
        ahpra_registration: practiceSetup.ahpraRegistration,
        abn: practiceSetup.abn || null,
        specialty_area: practiceSetup.specialtyArea || null,
        practice_location: practiceSetup.practiceLocation || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('healthcare_practice_profiles')
        .upsert(profileData, { onConflict: 'user_id,practice_name' });

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Practice profile saved successfully",
        variant: "default"
      });

      // Reload data
      await loadComplianceData();
    } catch (error) {
      console.error('Error saving practice profile:', error);
      toast({
        title: "Save Error",
        description: "Unable to save practice profile",
        variant: "destructive"
      });
    }
  };

  const updatePracticeProfile = async (updates: Partial<PracticeProfile>) => {
    if (!practiceProfile) return;

    try {
      const { error } = await supabase
        .from('healthcare_practice_profiles')
        .update(updates)
        .eq('id', practiceProfile.id);

      if (error) throw error;

      setPracticeProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating practice profile:', error);
    }
  };

  const runComprehensiveAssessment = async () => {
    try {
      setIsLoading(true);
      
      // Validate AHPRA if not already validated
      if (practiceSetup.ahpraRegistration && !practiceProfile?.ahpraValidated) {
        await validateAHPRARegistration();
      }
      
      // Validate ABN if provided and not already validated
      if (practiceSetup.abn && !practiceProfile?.abnValidated) {
        await validateABN();
      }
      
      // Reload compliance metrics
      await loadComplianceMetrics();
      
      toast({
        title: "Assessment Complete",
        description: "Comprehensive compliance assessment completed",
        variant: "default"
      });
    } catch (error) {
      console.error('Error running assessment:', error);
      toast({
        title: "Assessment Error",
        description: "Unable to complete compliance assessment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateComplianceReport = async () => {
    // This would generate a PDF compliance report
    toast({
      title: "Report Generation",
      description: "Compliance report generation started...",
      variant: "default"
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading compliance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Australian Healthcare Compliance Engine
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive AHPRA, TGA, and ABN compliance management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runComprehensiveAssessment} disabled={isLoading}>
            <Activity className="w-4 h-4 mr-2" />
            Run Assessment
          </Button>
          <Button variant="outline" onClick={generateComplianceReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      {complianceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${getScoreColor(complianceMetrics.overallScore)}`}>
                  {complianceMetrics.overallScore}%
                </div>
                <Badge variant={getRiskBadgeVariant(complianceMetrics.riskLevel)}>
                  {complianceMetrics.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <Progress value={complianceMetrics.overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Stethoscope className="w-4 h-4 mr-1" />
                AHPRA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(complianceMetrics.ahpraScore)}`}>
                {complianceMetrics.ahpraScore}%
              </div>
              <Progress value={complianceMetrics.ahpraScore} className="mt-2" />
              {practiceProfile?.ahpraValidated ? (
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Validated
                </div>
              ) : (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Validated
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                TGA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(complianceMetrics.tgaScore)}`}>
                {complianceMetrics.tgaScore}%
              </div>
              <Progress value={complianceMetrics.tgaScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building className="w-4 h-4 mr-1" />
                Business Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(complianceMetrics.abnScore)}`}>
                {complianceMetrics.abnScore}%
              </div>
              <Progress value={complianceMetrics.abnScore} className="mt-2" />
              {practiceProfile?.abnValidated ? (
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ABN Validated
                </div>
              ) : (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  ABN Not Validated
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Violations Alert */}
      {complianceMetrics && complianceMetrics.activeViolations > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> You have {complianceMetrics.activeViolations} active compliance violations that need attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Compliance Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Practice Setup</TabsTrigger>
          <TabsTrigger value="ahpra">AHPRA Compliance</TabsTrigger>
          <TabsTrigger value="validation">Business Validation</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview content would include summary cards, recent activity, etc. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Compliance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Track your compliance performance over time
                </p>
                {/* Compliance trend chart would go here */}
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Compliance trend chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Latest compliance checks and validations
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">AHPRA validation check</span>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">Content compliance scan</span>
                    <Badge variant="outline">1 day ago</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">ABN verification</span>
                    <Badge variant="outline">3 days ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Practice Profile Setup
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure your healthcare practice information for compliance validation
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Practice Name</label>
                  <input
                    type="text"
                    value={practiceSetup.practiceName}
                    onChange={(e) => setPracticeSetup({ ...practiceSetup, practiceName: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    placeholder="Your Practice Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Practice Type</label>
                  <select
                    value={practiceSetup.practiceType}
                    onChange={(e) => setPracticeSetup({ ...practiceSetup, practiceType: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="gp">General Practice</option>
                    <option value="specialist">Medical Specialist</option>
                    <option value="allied_health">Allied Health</option>
                    <option value="psychology">Psychology</option>
                    <option value="dental">Dental</option>
                    <option value="nursing">Nursing</option>
                    <option value="optometry">Optometry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">AHPRA Registration Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={practiceSetup.ahpraRegistration}
                      onChange={(e) => setPracticeSetup({ ...practiceSetup, ahpraRegistration: e.target.value })}
                      className="flex-1 p-2 border rounded-md"
                      placeholder="MED1234567890"
                    />
                    <Button 
                      onClick={validateAHPRARegistration}
                      variant="outline"
                      disabled={!practiceSetup.ahpraRegistration}
                    >
                      Validate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">ABN (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={practiceSetup.abn}
                      onChange={(e) => setPracticeSetup({ ...practiceSetup, abn: e.target.value })}
                      className="flex-1 p-2 border rounded-md"
                      placeholder="12 345 678 901"
                    />
                    <Button 
                      onClick={validateABN}
                      variant="outline"
                      disabled={!practiceSetup.abn}
                    >
                      Validate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty Area</label>
                  <input
                    type="text"
                    value={practiceSetup.specialtyArea}
                    onChange={(e) => setPracticeSetup({ ...practiceSetup, specialtyArea: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., Cardiology, General Medicine"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Practice Location</label>
                  <input
                    type="text"
                    value={practiceSetup.practiceLocation}
                    onChange={(e) => setPracticeSetup({ ...practiceSetup, practiceLocation: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., Sydney, NSW"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={savePracticeProfile}
                  className="w-full"
                  disabled={!practiceSetup.practiceName || !practiceSetup.ahpraRegistration}
                >
                  Save Practice Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ahpra" className="space-y-6">
          {practiceProfile && (
            <AHPRAComplianceDashboard
              content=""
              practiceType={{
                type: practiceProfile.practiceType as any,
                ahpra_registration: practiceProfile.ahpraRegistration,
                specialty: practiceProfile.specialtyArea
              }}
              contentType="website"
              onComplianceChange={setLastComplianceCheck}
            />
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <AustralianBusinessValidator
            onValidationComplete={(isAustralian) => {
              if (isAustralian) {
                toast({
                  title: "Business Validation",
                  description: "Australian business status confirmed",
                  variant: "default"
                });
              }
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Compliance Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Compliance Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span className="text-sm">Performance Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span className="text-sm">Audit Trail</span>
                </Button>
              </div>
              
              {complianceMetrics && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Compliance Summary</h4>
                  <div className="text-sm text-gray-600">
                    <p>Last Assessment: {new Date(complianceMetrics.lastAssessment).toLocaleDateString()}</p>
                    <p>Active Violations: {complianceMetrics.activeViolations}</p>
                    <p>Resolved Issues: {complianceMetrics.resolvedViolations}</p>
                    <p>Risk Level: {complianceMetrics.riskLevel.toUpperCase()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 