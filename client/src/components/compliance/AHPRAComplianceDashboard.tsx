import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAHPRACompliance, ComplianceResult, HealthcarePracticeType } from '@/hooks/useAHPRACompliance';
import { AlertTriangle, CheckCircle, XCircle, Shield, FileText, User, Info } from 'lucide-react';

interface AHPRAComplianceDashboardProps {
  content: string;
  practiceType: HealthcarePracticeType;
  contentType: 'social_media' | 'blog' | 'advertisement' | 'website';
  onComplianceChange: (result: ComplianceResult) => void;
}

export const AHPRAComplianceDashboard: React.FC<AHPRAComplianceDashboardProps> = ({
  content,
  practiceType,
  contentType,
  onComplianceChange
}) => {
  const { validateContent, isValidating } = useAHPRACompliance();
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [testContent, setTestContent] = useState(content);

  useEffect(() => {
    if (content.length > 10) {
      const validateAsync = async () => {
        const result = await validateContent(content, practiceType, contentType);
        setComplianceResult(result);
        onComplianceChange(result);
      };
      validateAsync();
    }
  }, [content, practiceType, contentType, validateContent, onComplianceChange]);

  const handleTestValidation = async () => {
    if (testContent.length > 10) {
      const result = await validateContent(testContent, practiceType, contentType);
      setComplianceResult(result);
      onComplianceChange(result);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getComplianceStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatusText = (result: ComplianceResult | null) => {
    if (!result) return 'Not validated';
    if (result.isCompliant) return 'AHPRA/TGA Compliant';
    return 'Compliance Issues Detected';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            AHPRA/TGA Compliance Dashboard
            <Badge variant="outline" className="ml-2">
              {practiceType.type.toUpperCase()}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Real-time compliance checking for Australian healthcare advertising regulations
          </p>
        </CardHeader>
      </Card>

      {/* Compliance Score Overview */}
      {complianceResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Compliance Score</span>
              <span className={`text-2xl font-bold ${getComplianceStatusColor(complianceResult.score)}`}>
                {complianceResult.score}/100
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={complianceResult.score} className="w-full" />
            <div className="flex items-center gap-2">
              {complianceResult.isCompliant ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${complianceResult.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                {getComplianceStatusText(complianceResult)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Content Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Test Content Compliance
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test your content for AHPRA/TGA compliance before publishing
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            placeholder="Enter healthcare content to test for AHPRA/TGA compliance..."
            className="min-h-[120px]"
          />
          <Button 
            onClick={handleTestValidation}
            disabled={isValidating || testContent.length < 10}
            className="w-full"
          >
            {isValidating ? 'Validating...' : 'Check AHPRA/TGA Compliance'}
          </Button>
        </CardContent>
      </Card>

      {/* Compliance Violations */}
      {complianceResult && complianceResult.violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Compliance Violations ({complianceResult.violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceResult.violations.map((violation, index) => (
              <Alert key={index} className="border-l-4 border-l-red-500">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(violation.severity)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(violation.severity)}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {violation.type.toUpperCase()}
                      </Badge>
                    </div>
                    <AlertDescription className="font-medium">
                      {violation.message}
                    </AlertDescription>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Suggestion:</p>
                      <p className="text-sm text-blue-700">{violation.suggestion}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Regulation:</strong> {violation.regulation}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Changes */}
      {complianceResult && complianceResult.recommendedChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              Recommended Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {complianceResult.recommendedChanges.map((change, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{change}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AHPRA/TGA Guidelines Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            AHPRA/TGA Guidelines Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">❌ PROHIBITED</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Patient testimonials or reviews</li>
                <li>• Drug brand names (Botox, Juvederm, etc.)</li>
                <li>• Misleading therapeutic claims</li>
                <li>• "Specialist" title (unless registered)</li>
                <li>• Finance offers without T&Cs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ REQUIRED</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• AHPRA registration number</li>
                <li>• Risk disclaimers for treatments</li>
                <li>• Professional boundary respect</li>
                <li>• Evidence-based language</li>
                <li>• Contact information in ads</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Information */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Compliance Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Practice Type:</span>
            <Badge variant="outline">{practiceType.type.replace('_', ' ').toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">AHPRA Registration:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{practiceType.ahpra_registration}</code>
          </div>
          {practiceType.specialty && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Specialty:</span>
              <Badge variant="secondary">{practiceType.specialty}</Badge>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Content Type:</span>
            <Badge variant="outline">{contentType.replace('_', ' ').toUpperCase()}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 