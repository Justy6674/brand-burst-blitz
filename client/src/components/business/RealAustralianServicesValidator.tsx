import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { australianServices, ABNDetails, AHPRARegistration, ValidationResult } from '../../services/australianServices';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Building2,
  Stethoscope,
  FileText,
  Clock,
  Database,
  RefreshCw,
  ExternalLink,
  Award,
  MapPin
} from 'lucide-react';

interface ValidationState {
  isValidating: boolean;
  abnResult: ValidationResult | null;
  ahpraResult: ValidationResult | null;
  eligibilityResult: ValidationResult | null;
  practiceNameResult: ValidationResult | null;
}

export function RealAustralianServicesValidator() {
  const { toast } = useToast();
  
  const [abn, setAbn] = useState('');
  const [ahpraRegistration, setAhpraRegistration] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    abnResult: null,
    ahpraResult: null,
    eligibilityResult: null,
    practiceNameResult: null
  });

  // Format ABN input
  const formatABN = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
  }, []);

  // Format AHPRA registration input
  const formatAHPRA = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    const letters = upperValue.replace(/[^A-Z]/g, '').slice(0, 3);
    const numbers = upperValue.replace(/[^0-9]/g, '').slice(0, 10);
    return `${letters}${numbers}`;
  }, []);

  // Validate ABN
  const validateABN = useCallback(async () => {
    if (!abn.trim()) {
      toast({
        title: "ABN Required",
        description: "Please enter an Australian Business Number",
        variant: "destructive"
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, abnResult: null }));

    try {
      const result = await australianServices.validateABN(abn);
      setValidationState(prev => ({ ...prev, abnResult: result }));

      if (result.isValid) {
        toast({
          title: "ABN Validated ✅",
          description: `${result.data.entityName} - ${result.data.abnStatus}`,
        });
      } else {
        toast({
          title: "ABN Validation Failed",
          description: result.errors[0],
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Unable to validate ABN. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  }, [abn, toast]);

  // Verify AHPRA Registration
  const verifyAHPRA = useCallback(async () => {
    if (!ahpraRegistration.trim()) {
      toast({
        title: "AHPRA Registration Required",
        description: "Please enter an AHPRA registration number",
        variant: "destructive"
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, ahpraResult: null }));

    try {
      const result = await australianServices.verifyAHPRARegistration(ahpraRegistration);
      setValidationState(prev => ({ ...prev, ahpraResult: result }));

      if (result.isValid) {
        toast({
          title: "AHPRA Registration Verified ✅",
          description: `${result.data.givenName} ${result.data.familyName} - ${result.data.profession}`,
        });
      } else {
        toast({
          title: "AHPRA Verification Failed",
          description: result.errors[0],
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Unable to verify AHPRA registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  }, [ahpraRegistration, toast]);

  // Validate Practice Name
  const validatePracticeName = useCallback(async () => {
    if (!practiceName.trim()) {
      toast({
        title: "Practice Name Required",
        description: "Please enter a practice name",
        variant: "destructive"
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, practiceNameResult: null }));

    try {
      const result = await australianServices.verifyHealthcarePracticeName(
        practiceName, 
        validationState.abnResult?.data?.abn
      );
      setValidationState(prev => ({ ...prev, practiceNameResult: result }));

      if (result.isValid) {
        toast({
          title: "Practice Name Available ✅",
          description: result.data.isUnique ? "Unique name" : "Name exists with same ABN",
        });
      } else {
        toast({
          title: "Practice Name Unavailable",
          description: result.errors[0],
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Unable to validate practice name. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  }, [practiceName, validationState.abnResult, toast]);

  // Comprehensive Eligibility Assessment
  const assessEligibility = useCallback(async () => {
    if (!validationState.abnResult?.isValid || !validationState.ahpraResult?.isValid) {
      toast({
        title: "Prerequisites Missing",
        description: "Please validate both ABN and AHPRA registration first",
        variant: "destructive"
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, eligibilityResult: null }));

    try {
      const result = await australianServices.validateHealthcarePracticeEligibility(
        validationState.abnResult.data,
        validationState.ahpraResult.data
      );
      setValidationState(prev => ({ ...prev, eligibilityResult: result }));

      if (result.isValid) {
        toast({
          title: "Practice Eligible ✅",
          description: `Eligibility score: ${result.data.eligibilityScore}%`,
        });
      } else {
        toast({
          title: "Eligibility Issues Found",
          description: result.errors[0],
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Assessment Error",
        description: "Unable to assess eligibility. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  }, [validationState.abnResult, validationState.ahpraResult, toast]);

  const getStatusIcon = (result: ValidationResult | null) => {
    if (!result) return <Clock className="h-4 w-4 text-gray-400" />;
    if (result.isValid) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (result: ValidationResult | null) => {
    if (!result) return 'border-gray-300';
    if (result.isValid) return 'border-green-300 bg-green-50';
    return 'border-red-300 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Australian Government Services Validation
          </h2>
          <p className="text-muted-foreground">
            Real-time ABN and AHPRA verification using official government APIs
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          Live Government Data
        </Badge>
      </div>

      {/* Validation Forms */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ABN Validation */}
        <Card className={getStatusColor(validationState.abnResult)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Australian Business Number (ABN)
              {getStatusIcon(validationState.abnResult)}
            </CardTitle>
            <CardDescription>
              Validate against Australian Business Register
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ABN</label>
              <Input
                placeholder="12 345 678 901"
                value={formatABN(abn)}
                onChange={(e) => setAbn(e.target.value)}
                maxLength={14}
              />
            </div>
            
            <Button 
              onClick={validateABN}
              disabled={validationState.isValidating || !abn.trim()}
              className="w-full"
            >
              {validationState.isValidating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Validate ABN
            </Button>

            {validationState.abnResult && (
              <div className="space-y-2">
                {validationState.abnResult.isValid ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-700">
                      ✅ {validationState.abnResult.data.entityName}
                    </div>
                    <div className="grid gap-1 text-xs">
                      <div>Status: <Badge variant="default">{validationState.abnResult.data.abnStatus}</Badge></div>
                      <div>Type: {validationState.abnResult.data.entityTypeName}</div>
                      <div>GST: <Badge variant={validationState.abnResult.data.gstStatus === 'Current' ? 'default' : 'secondary'}>
                        {validationState.abnResult.data.gstStatus}
                      </Badge></div>
                      <div>Location: {validationState.abnResult.data.state} {validationState.abnResult.data.postcode}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validationState.abnResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">❌ {error}</div>
                    ))}
                  </div>
                )}
                
                {validationState.abnResult.warnings.map((warning, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AHPRA Verification */}
        <Card className={getStatusColor(validationState.ahpraResult)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              AHPRA Registration
              {getStatusIcon(validationState.ahpraResult)}
            </CardTitle>
            <CardDescription>
              Verify against AHPRA public register
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Number</label>
              <Input
                placeholder="MED1234567890"
                value={formatAHPRA(ahpraRegistration)}
                onChange={(e) => setAhpraRegistration(e.target.value)}
                maxLength={13}
              />
            </div>
            
            <Button 
              onClick={verifyAHPRA}
              disabled={validationState.isValidating || !ahpraRegistration.trim()}
              className="w-full"
            >
              {validationState.isValidating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Verify AHPRA
            </Button>

            {validationState.ahpraResult && (
              <div className="space-y-2">
                {validationState.ahpraResult.isValid ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-700">
                      ✅ {validationState.ahpraResult.data.givenName} {validationState.ahpraResult.data.familyName}
                    </div>
                    <div className="grid gap-1 text-xs">
                      <div>Profession: <Badge variant="default">{validationState.ahpraResult.data.profession}</Badge></div>
                      <div>Status: <Badge variant="default">{validationState.ahpraResult.data.registrationStatus}</Badge></div>
                      <div>Expires: {new Date(validationState.ahpraResult.data.registrationExpiry).toLocaleDateString()}</div>
                      <div>Location: {validationState.ahpraResult.data.principal.state} {validationState.ahpraResult.data.principal.postcode}</div>
                      {validationState.ahpraResult.data.specialty.length > 0 && (
                        <div>Specialty: {validationState.ahpraResult.data.specialty.join(', ')}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validationState.ahpraResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">❌ {error}</div>
                    ))}
                  </div>
                )}
                
                {validationState.ahpraResult.warnings.map((warning, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Practice Name Validation */}
      <Card className={getStatusColor(validationState.practiceNameResult)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Practice Name Verification
            {getStatusIcon(validationState.practiceNameResult)}
          </CardTitle>
          <CardDescription>
            Check availability and AHPRA compliance of practice name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="City Medical Centre"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={validatePracticeName}
              disabled={validationState.isValidating || !practiceName.trim()}
            >
              {validationState.isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>
          </div>

          {validationState.practiceNameResult && (
            <div className="space-y-2">
              {validationState.practiceNameResult.isValid ? (
                <div className="text-sm text-green-700">
                  ✅ Practice name is {validationState.practiceNameResult.data.isUnique ? 'unique and ' : ''}available
                </div>
              ) : (
                <div className="space-y-1">
                  {validationState.practiceNameResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">❌ {error}</div>
                  ))}
                </div>
              )}
              
              {validationState.practiceNameResult.warnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Eligibility Assessment */}
      {validationState.abnResult?.isValid && validationState.ahpraResult?.isValid && (
        <Card className={getStatusColor(validationState.eligibilityResult)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Practice Eligibility Assessment
              {getStatusIcon(validationState.eligibilityResult)}
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of practice setup compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={assessEligibility}
              disabled={validationState.isValidating}
              className="w-full"
              size="lg"
            >
              {validationState.isValidating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Award className="h-4 w-4 mr-2" />
              )}
              Assess Practice Eligibility
            </Button>

            {validationState.eligibilityResult && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {validationState.eligibilityResult.data.eligibilityScore}%
                  </div>
                  <Progress value={validationState.eligibilityResult.data.eligibilityScore} className="h-3" />
                  <div className="text-sm text-gray-600 mt-1">Eligibility Score</div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  {validationState.eligibilityResult.data.recommendations.map((rec: any, index: number) => (
                    <Alert key={index} variant={rec.type === 'error' ? 'destructive' : 'default'}>
                      {rec.type === 'error' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <AlertDescription>{rec.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Status Footer */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Australian Business Register API
          </div>
          <div className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            AHPRA Public Register API
          </div>
        </div>
        <div>Real-time validation using official Australian government services</div>
      </div>
    </div>
  );
} 