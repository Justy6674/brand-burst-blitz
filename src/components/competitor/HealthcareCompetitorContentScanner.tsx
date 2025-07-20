import React, { useState, useEffect } from 'react';
import { useHealthcareCompetitorContentScanning } from '../../hooks/useHealthcareCompetitorContentScanning';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Search, 
  Shield, 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Heart,
  GraduationCap,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface HealthcareCompetitorContentScannerProps {
  practiceId: string;
}

export function HealthcareCompetitorContentScanner({ practiceId }: HealthcareCompetitorContentScannerProps) {
  const { user } = useHealthcareAuth();
  const {
    isScanning,
    scanResults,
    competitorPractices,
    scanningOptions,
    registerCompetitorPractice,
    scanCompetitorContent,
    generateProfessionalInsights,
    loadCompetitorPractices,
    loadScanResults,
    setScanningOptions
  } = useHealthcareCompetitorContentScanning();

  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [insights, setInsights] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    loadCompetitorPractices(practiceId);
    loadScanResults(practiceId);
  }, [loadCompetitorPractices, loadScanResults, practiceId]);

  const handleScanContent = async () => {
    if (!selectedCompetitor) return;
    
    const result = await scanCompetitorContent(practiceId, selectedCompetitor);
    if (result.success) {
      // Refresh insights after successful scan
      const insightsResult = await generateProfessionalInsights(practiceId);
      if (insightsResult.success) {
        setInsights(insightsResult.insights);
      }
    }
  };

  const renderEthicalGuidelines = () => (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Shield className="h-5 w-5" />
          Ethical Analysis Guidelines
        </CardTitle>
        <CardDescription className="text-blue-700">
          Our competitor analysis follows strict professional and ethical standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <CheckCircle className="h-4 w-4" />
          Respects professional boundaries and patient privacy
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <CheckCircle className="h-4 w-4" />
          Limited to publicly available content only
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <CheckCircle className="h-4 w-4" />
          Focuses on professional development and education
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <CheckCircle className="h-4 w-4" />
          Complies with AHPRA advertising guidelines
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <CheckCircle className="h-4 w-4" />
          Maintains respectful professional relationships
        </div>
      </CardContent>
    </Card>
  );

  const renderCompetitorSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Healthcare Practices for Professional Analysis
        </CardTitle>
        <CardDescription>
          Select AHPRA-registered practices for ethical content analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitorPractices.map((practice) => (
          <div
            key={practice.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCompetitor === practice.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedCompetitor(practice.id)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-medium">{practice.practiceName}</h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {practice.practiceType.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{practice.location}</Badge>
                  {practice.ahpraRegistered && (
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      AHPRA Registered
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{practice.professionalSpecialty}</p>
              </div>
              {selectedCompetitor === practice.id && (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowRegistrationForm(true)}
        >
          Register New Practice for Analysis
        </Button>
      </CardContent>
    </Card>
  );

  const renderScanningOptions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Professional Development Focus
        </CardTitle>
        <CardDescription>
          Configure analysis parameters for ethical professional development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Types</label>
            <div className="space-y-2">
              {['educational', 'promotional', 'community', 'awareness'].map((type) => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={scanningOptions.contentTypes.includes(type as any)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...scanningOptions.contentTypes, type as any]
                        : scanningOptions.contentTypes.filter(t => t !== type);
                      setScanningOptions({ ...scanningOptions, contentTypes: newTypes });
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Scan Frequency</label>
            <select
              value={scanningOptions.scanFrequency}
              onChange={(e) => setScanningOptions({
                ...scanningOptions,
                scanFrequency: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button
            onClick={handleScanContent}
            disabled={!selectedCompetitor || isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Content...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Begin Ethical Analysis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalysisResults = () => (
    <div className="space-y-6">
      {scanResults.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Analysis Results Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Begin your first ethical competitor analysis to see professional development insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        scanResults.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Analysis Results
              </CardTitle>
              <CardDescription>
                Professional development insights from ethical analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.contentQuality.educationalValue}/10
                  </div>
                  <div className="text-sm text-gray-600">Educational Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.contentQuality.professionalPresentation}/10
                  </div>
                  <div className="text-sm text-gray-600">Professional Presentation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.contentQuality.patientEngagement}/10
                  </div>
                  <div className="text-sm text-gray-600">Patient Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {result.contentQuality.complianceScore}/10
                  </div>
                  <div className="text-sm text-gray-600">AHPRA Compliance</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Learning Opportunities</h4>
                  <ul className="space-y-1">
                    {result.learningOpportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Heart className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Professional Development Suggestions</h4>
                  <ul className="space-y-1">
                    {result.suggestedImprovements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Analyzed: {new Date(result.scannedAt).toLocaleDateString()}</span>
                  <Badge variant="outline" className="capitalize">
                    {result.contentType}
                  </Badge>
                  {result.professionalStandards.ahpraCompliant && (
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      AHPRA Compliant
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderProfessionalInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Professional Development Insights
        </CardTitle>
        <CardDescription>
          Aggregated insights for practice improvement and development
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.contentQualityTrends?.averageEducationalValue || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Educational Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.professionalStandardsBenchmarks?.ahpraComplianceRate || 0}%
                </div>
                <div className="text-sm text-gray-600">AHPRA Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {insights.professionalStandardsBenchmarks?.patientFocusedContentPercentage || 0}%
                </div>
                <div className="text-sm text-gray-600">Patient Focused</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.contentQualityTrends?.averageComplianceScore || 0}
                </div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>
            </div>
            
            {insights.educationalContentOpportunities && (
              <div>
                <h4 className="font-medium mb-3">Educational Content Opportunities</h4>
                <div className="grid gap-2">
                  {insights.educationalContentOpportunities.map((opportunity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              onClick={() => generateProfessionalInsights(practiceId)}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Professional Insights
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Insights Available Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete a few content analyses to generate professional development insights.
            </p>
            <Button
              onClick={() => generateProfessionalInsights(practiceId)}
              disabled={scanResults.length === 0}
            >
              Generate Insights
            </Button>
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
            Healthcare Professional Content Analysis
          </h2>
          <p className="text-gray-600">
            Ethical competitor analysis for professional development and practice improvement
          </p>
        </div>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          This analysis tool is designed for professional development purposes only. 
          All analysis respects AHPRA guidelines and professional boundaries.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Content Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Practice Selection</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="insights">Professional Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderEthicalGuidelines()}
            {renderScanningOptions()}
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          {renderCompetitorSelection()}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {renderAnalysisResults()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderProfessionalInsights()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 