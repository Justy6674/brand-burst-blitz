import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { Shield, UserPlus, CheckCircle, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

const HEALTHCARE_PROFESSIONS = [
  { value: 'medical', label: 'Medical Practitioner (Doctor)', code: 'MED', example: 'MED0001234567' },
  { value: 'nursing', label: 'Registered Nurse/Midwife', code: 'NMW', example: 'NMW0001234567' },
  { value: 'physiotherapy', label: 'Physiotherapist', code: 'PHY', example: 'PHY0001234567' },
  { value: 'psychology', label: 'Psychologist', code: 'PSY', example: 'PSY0001234567' },
  { value: 'dental', label: 'Dental Practitioner', code: 'DEN', example: 'DEN0001234567' },
  { value: 'optometry', label: 'Optometrist', code: 'OPT', example: 'OPT0001234567' },
  { value: 'pharmacy', label: 'Pharmacist', code: 'PHA', example: 'PHA0001234567' },
  { value: 'occupational_therapy', label: 'Occupational Therapist', code: 'OCC', example: 'OCC0001234567' },
  { value: 'social_work', label: 'Social Worker', code: 'SWK', example: 'SWK0001234567' },
  { value: 'osteopathy', label: 'Osteopath', code: 'OST', example: 'OST0001234567' },
  { value: 'chiropractic', label: 'Chiropractor', code: 'CHI', example: 'CHI0001234567' },
  { value: 'podiatry', label: 'Podiatrist', code: 'POD', example: 'POD0001234567' },
  { value: 'chinese_medicine', label: 'Chinese Medicine Practitioner', code: 'CMR', example: 'CMR0001234567' },
  { value: 'aboriginal_health', label: 'Aboriginal Health Practitioner', code: 'AHP', example: 'AHP0001234567' }
];

const PRACTICE_TYPES = [
  { value: 'solo', label: 'Solo Practice', description: 'Single practitioner practice' },
  { value: 'group', label: 'Group Practice', description: 'Multiple practitioners in same practice' },
  { value: 'network', label: 'Healthcare Network', description: 'Multiple practices/locations' }
];

interface HealthcareSignUpProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const HealthcareSignUp: React.FC<HealthcareSignUpProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    ahpra_registration: '',
    profession_type: '',
    practice_name: '',
    specialty: '',
    practice_type: 'solo' as 'solo' | 'group' | 'network',
    practice_locations: ['']
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAHPRA, setAcceptedAHPRA] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [ahpraValidation, setAhpraValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isValidating: false, isValid: null, message: '' });

  const { signUpHealthcareProfessional, validateAHPRARegistration, verifyAHPRARegistration, isLoading } = useHealthcareAuth();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (!formData.ahpra_registration) errors.ahpra_registration = 'AHPRA registration number is required';
    if (!formData.profession_type) errors.profession_type = 'Profession type is required';
    if (!formData.practice_name) errors.practice_name = 'Practice name is required';

    if (!acceptedTerms) errors.terms = 'You must accept the terms and conditions';
    if (!acceptedAHPRA) errors.ahpra = 'You must acknowledge AHPRA compliance requirements';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAHPRAValidation = async () => {
    if (!formData.ahpra_registration || !formData.profession_type) return;

    setAhpraValidation({ isValidating: true, isValid: null, message: 'Validating AHPRA registration...' });

    try {
      // First check format
      const isFormatValid = validateAHPRARegistration(formData.ahpra_registration, formData.profession_type as any);
      if (!isFormatValid) {
        const profession = HEALTHCARE_PROFESSIONS.find(p => p.value === formData.profession_type);
        setAhpraValidation({ 
          isValidating: false, 
          isValid: false, 
          message: `Invalid format. Expected: ${profession?.example}` 
        });
        return;
      }

      // Then verify against database
      const result = await verifyAHPRARegistration(formData.ahpra_registration, formData.profession_type as any);
      
      if (result.isValid) {
        setAhpraValidation({ 
          isValidating: false, 
          isValid: true, 
          message: `✓ AHPRA registration verified: ${result.practitionerName}` 
        });
      } else {
        setAhpraValidation({ 
          isValidating: false, 
          isValid: false, 
          message: 'AHPRA registration not found. Please check your registration number.' 
        });
      }
    } catch (error) {
      setAhpraValidation({ 
        isValidating: false, 
        isValid: false, 
        message: 'Error validating AHPRA registration. Please try again.' 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || ahpraValidation.isValid !== true) return;

    const result = await signUpHealthcareProfessional({
      email: formData.email,
      password: formData.password,
      ahpra_registration: formData.ahpra_registration,
      profession_type: formData.profession_type as any,
      practice_name: formData.practice_name,
      specialty: formData.specialty || undefined,
      practice_type: formData.practice_type,
      practice_locations: formData.practice_locations.filter(loc => loc.trim())
    });

    if (result.success) {
      onSuccess?.();
    }
  };

  const selectedProfession = HEALTHCARE_PROFESSIONS.find(p => p.value === formData.profession_type);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <CardTitle className="text-2xl">Healthcare Professional Registration</CardTitle>
        </div>
        <CardDescription>
          Join Australia's first AHPRA-compliant content platform for healthcare professionals
        </CardDescription>
        
        {/* Compliance Badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="outline" className="border-green-500 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            AHPRA Verified
          </Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <Shield className="w-3 h-3 mr-1" />
            TGA Compliant
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@practice.com.au"
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice_name">Practice Name *</Label>
                <Input
                  id="practice_name"
                  value={formData.practice_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, practice_name: e.target.value }))}
                  placeholder="Your Practice Name"
                  className={validationErrors.practice_name ? 'border-red-500' : ''}
                />
                {validationErrors.practice_name && <p className="text-sm text-red-500">{validationErrors.practice_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    className={validationErrors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.confirmPassword && <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="profession_type">Healthcare Profession *</Label>
              <Select 
                value={formData.profession_type} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, profession_type: value, ahpra_registration: '' }));
                  setAhpraValidation({ isValidating: false, isValid: null, message: '' });
                }}
              >
                <SelectTrigger className={validationErrors.profession_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your healthcare profession" />
                </SelectTrigger>
                <SelectContent>
                  {HEALTHCARE_PROFESSIONS.map((profession) => (
                    <SelectItem key={profession.value} value={profession.value}>
                      <div className="flex flex-col">
                        <span>{profession.label}</span>
                        <span className="text-xs text-gray-500">Code: {profession.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.profession_type && <p className="text-sm text-red-500">{validationErrors.profession_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ahpra_registration">AHPRA Registration Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="ahpra_registration"
                  value={formData.ahpra_registration}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData(prev => ({ ...prev, ahpra_registration: value }));
                    setAhpraValidation({ isValidating: false, isValid: null, message: '' });
                  }}
                  placeholder={selectedProfession ? selectedProfession.example : 'Enter AHPRA registration number'}
                  className={validationErrors.ahpra_registration ? 'border-red-500' : ''}
                  disabled={!formData.profession_type}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAHPRAValidation}
                  disabled={!formData.ahpra_registration || !formData.profession_type || ahpraValidation.isValidating}
                >
                  {ahpraValidation.isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
              
              {/* AHPRA Validation Status */}
              {ahpraValidation.message && (
                <Alert className={`border-2 ${
                  ahpraValidation.isValid === true ? 'border-green-500 bg-green-50' :
                  ahpraValidation.isValid === false ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  {ahpraValidation.isValid === true ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : ahpraValidation.isValid === false ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  <AlertDescription className={
                    ahpraValidation.isValid === true ? 'text-green-700' :
                    ahpraValidation.isValid === false ? 'text-red-700' :
                    'text-blue-700'
                  }>
                    {ahpraValidation.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {validationErrors.ahpra_registration && <p className="text-sm text-red-500">{validationErrors.ahpra_registration}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty (Optional)</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  placeholder="e.g., General Practice, Cardiology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice_type">Practice Type *</Label>
                <Select 
                  value={formData.practice_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, practice_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRACTICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-gray-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Terms and Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Terms & Compliance</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the <span className="text-blue-600 underline">Terms of Service</span> and <span className="text-blue-600 underline">Privacy Policy</span>
                </Label>
              </div>
              {validationErrors.terms && <p className="text-sm text-red-500">{validationErrors.terms}</p>}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="ahpra"
                  checked={acceptedAHPRA}
                  onCheckedChange={setAcceptedAHPRA}
                />
                <Label htmlFor="ahpra" className="text-sm">
                  I acknowledge that all content created through this platform must comply with AHPRA advertising guidelines and TGA therapeutic advertising requirements. I understand that I am responsible for reviewing all content before publication.
                </Label>
              </div>
              {validationErrors.ahpra && <p className="text-sm text-red-500">{validationErrors.ahpra}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading || ahpraValidation.isValid !== true || !acceptedTerms || !acceptedAHPRA}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Healthcare Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Healthcare Account
              </>
            )}
          </Button>

          {/* Sign In Link */}
          {onSwitchToSignIn && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-blue-600 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}; 