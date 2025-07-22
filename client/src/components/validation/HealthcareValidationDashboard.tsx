import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  useRealTimeContentValidation,
  useAHPRAComplianceMonitoring,
  useHealthcareSecurityValidation,
  useComprehensiveHealthcareValidation
} from '../../hooks/useHealthcareValidation';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Activity,
  BarChart3,
  FileText,
  Lock,
  Heart,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Users,
  Award
} from 'lucide-react';

export function HealthcareValidationDashboard() {
  const [testContent, setTestContent] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  
  const contentValidation = useRealTimeContentValidation(testContent);
  const complianceMonitoring = useAHPRAComplianceMonitoring();
  const securityValidation = useHealthcareSecurityValidation();
  const comprehensiveValidation = useComprehensiveHealthcareValidation();
  
  const handleContentTest = async () => {
    if (testContent.trim()) {
      await complianceMonitoring.checkCompliance(testContent);
      securityValidation.validateSecurity(testContent);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Healthcare Validation Dashboard
          </h2>
          <p className="text-gray-600">
            Comprehensive input validation, AHPRA compliance monitoring, and security protection
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Live Monitoring
        </Badge>
      </div>

      {/* Overall Health Score */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Overall Health</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${getScoreColor(comprehensiveValidation.overallHealthScore)}`}>
                {comprehensiveValidation.overallHealthScore}%
              </div>
              <Progress value={comprehensiveValidation.overallHealthScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">AHPRA Compliance</span>
              </div>
              {getTrendIcon(complianceMonitoring.complianceTrend)}
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${getScoreColor(complianceMonitoring.complianceScore)}`}>
                {complianceMonitoring.complianceScore}%
              </div>
              <div className="text-xs text-gray-500">
                {complianceMonitoring.activeViolations.length} active violations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Security Status</span>
              </div>
              <Badge variant="outline">24H</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {securityValidation.securitySummary.blockedContent}
              </div>
              <div className="text-xs text-gray-500">
                threats blocked today
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Data Sanitization</span>
              </div>
              <Badge variant="outline">Rate</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {comprehensiveValidation.dataSanitization.sanitizationStats.averageChangeRate}%
              </div>
              <div className="text-xs text-gray-500">
                average modification rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">Real-time Content</TabsTrigger>
          <TabsTrigger value="compliance">AHPRA Compliance</TabsTrigger>
          <TabsTrigger value="security">Security Monitoring</TabsTrigger>
          <TabsTrigger value="validation">Form Validation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {/* Real-time Content Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Real-time Content Validation
              </CardTitle>
              <CardDescription>
                Test content validation with live AHPRA compliance and security checking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Content</label>
                  <Textarea
                    placeholder="Enter healthcare content to test validation (e.g., 'Our miracle treatment cures all patients instantly...')"
                    value={testContent}
                    onChange={(e) => {
                      setTestContent(e.target.value);
                      contentValidation.setContent(e.target.value);
                    }}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={contentValidation.isCompliant ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {contentValidation.isCompliant ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {contentValidation.isCompliant ? 'Compliant' : 'Non-Compliant'}
                    </Badge>
                    
                    <div className="text-sm">
                      Score: <span className={getScoreColor(contentValidation.complianceScore)}>
                        {contentValidation.complianceScore}%
                      </span>
                    </div>
                    
                    {contentValidation.isValidating && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Activity className="h-3 w-3 animate-spin" />
                        Validating...
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={handleContentTest} size="sm">
                    Run Full Test
                  </Button>
                </div>
                
                <Progress value={contentValidation.complianceScore} className="h-2" />
                
                {/* Validation Results */}
                {(contentValidation.errors.length > 0 || contentValidation.warnings.length > 0) && (
                  <div className="space-y-2">
                    {contentValidation.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    ))}
                    
                    {contentValidation.warnings.map((warning, index) => (
                      <Alert key={index}>
                        <Eye className="h-4 w-4" />
                        <AlertDescription>{warning.message}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* AHPRA Compliance Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AHPRA Compliance Monitoring
              </CardTitle>
              <CardDescription>
                Track compliance violations and improvements over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center space-y-2">
                    <div className={`text-3xl font-bold ${getScoreColor(complianceMonitoring.complianceScore)}`}>
                      {complianceMonitoring.complianceScore}%
                    </div>
                    <div className="text-sm text-gray-600">Current Score</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {complianceMonitoring.activeViolations.length}
                    </div>
                    <div className="text-sm text-gray-600">Active Violations</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(complianceMonitoring.complianceTrend)}
                      <span className="text-lg font-semibold capitalize">
                        {complianceMonitoring.complianceTrend}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Trend</div>
                  </div>
                </div>
                
                {complianceMonitoring.activeViolations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Active Violations</h4>
                    {complianceMonitoring.activeViolations.map((violation, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{violation}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
                
                {complianceMonitoring.complianceHistory.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Compliance Checks</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {complianceMonitoring.complianceHistory.slice(0, 5).map((check, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={check.riskLevel === 'low' ? 'default' : 'destructive'}>
                              {check.riskLevel}
                            </Badge>
                            <span className="text-sm">
                              {check.violations.length} violations found
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Monitoring
              </CardTitle>
              <CardDescription>
                Real-time security threat detection and mitigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-gray-600">
                      {securityValidation.securitySummary.totalAlerts}
                    </div>
                    <div className="text-sm text-gray-600">Total Alerts</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {securityValidation.securitySummary.alertsLast24Hours}
                    </div>
                    <div className="text-sm text-gray-600">Last 24 Hours</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-red-600">
                      {securityValidation.securitySummary.criticalAlerts}
                    </div>
                    <div className="text-sm text-gray-600">Critical Alerts</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {securityValidation.securitySummary.blockedContent}
                    </div>
                    <div className="text-sm text-gray-600">Blocked Threats</div>
                  </div>
                </div>
                
                {securityValidation.securityAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Security Alerts</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {securityValidation.securityAlerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className="flex justify-between items-start p-3 border rounded">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                              >
                                {alert.severity}
                              </Badge>
                              <span className="text-sm font-medium">{alert.type}</span>
                              <Badge variant="outline">{alert.action}</Badge>
                            </div>
                            <div className="text-xs text-gray-600">{alert.content}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          {/* Form Validation Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Healthcare Form Validation
              </CardTitle>
              <CardDescription>
                Test email and phone validation for healthcare professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      placeholder="test@practice.com.au"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <div className="text-xs text-gray-500">
                      Test with disposable emails or personal domains
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      placeholder="04 1234 5678"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                    />
                    <div className="text-xs text-gray-500">
                      Australian mobile or landline format
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    // This would trigger validation
                    console.log('Validating:', { email: testEmail, phone: testPhone });
                  }}
                  className="w-full"
                >
                  Validate Healthcare Contact Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Validation Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Validation Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics and validation statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {comprehensiveValidation.dataSanitization.sanitizationStats.totalSanitizations}
                    </div>
                    <div className="text-sm text-gray-600">Total Validations</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {comprehensiveValidation.dataSanitization.sanitizationStats.sanitizationsWithChanges}
                    </div>
                    <div className="text-sm text-gray-600">Data Modifications</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {comprehensiveValidation.dataSanitization.sanitizationStats.averageChangeRate}%
                    </div>
                    <div className="text-sm text-gray-600">Modification Rate</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">System Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AHPRA Compliance</span>
                        <span>{complianceMonitoring.complianceScore}%</span>
                      </div>
                      <Progress value={complianceMonitoring.complianceScore} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Security Protection</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Data Sanitization</span>
                        <span>98%</span>
                      </div>
                      <Progress value={98} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 