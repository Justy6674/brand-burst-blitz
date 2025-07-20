import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HealthcareSignUp } from '@/components/auth/HealthcareSignUp';
import { HealthcareSignIn } from '@/components/auth/HealthcareSignIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup';

export const HealthcareAuth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Redirect to healthcare dashboard or content page
    navigate('/healthcare-content');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                JBSAAS Healthcare Platform
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Australia's first AHPRA-compliant AI content generator designed exclusively for healthcare professionals. 
              Create patient education materials and practice marketing that automatically follows Australian healthcare regulations.
            </p>
            
            {/* Key Features Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                AHPRA Compliant
              </Badge>
              <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                TGA Validated
              </Badge>
              <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                Healthcare Only
              </Badge>
              <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Australia's First
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Auth Form */}
            <div className="order-2 lg:order-1">
              {authMode === 'signin' ? (
                <HealthcareSignIn
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignUp={() => setAuthMode('signup')}
                />
              ) : (
                <HealthcareSignUp
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignIn={() => setAuthMode('signin')}
                />
              )}
            </div>

            {/* Platform Benefits */}
            <div className="order-1 lg:order-2 space-y-6">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-6 w-6" />
                    Why Healthcare Professionals Choose JBSAAS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">AHPRA Advertising Compliance</h4>
                        <p className="text-sm text-gray-600">
                          Every piece of content automatically follows AHPRA advertising guidelines. No more worrying about compliance violations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">TGA Therapeutic Advertising</h4>
                        <p className="text-sm text-gray-600">
                          Built-in validation prevents prohibited drug names and misleading therapeutic claims.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Patient-Appropriate Content</h4>
                        <p className="text-sm text-gray-600">
                          AI trained specifically for healthcare communication that maintains professional boundaries.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Multi-Practice Management</h4>
                        <p className="text-sm text-gray-600">
                          Perfect for healthcare professionals managing multiple practices with different tech stacks.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-800">Healthcare Specialties Supported</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>General Practice (GP)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Medical Specialists</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Physiotherapy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Psychology</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Nursing</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Dental Practice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Optometry</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Social Work</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Allied Health</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>+ 5 more</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="text-purple-800">Competitive Advantage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span><strong>Australia's First:</strong> Healthcare-specific content platform</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span><strong>Built-in Compliance:</strong> No other platform offers AHPRA validation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span><strong>Healthcare Expertise:</strong> Built by healthcare professionals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span><strong>Professional Protection:</strong> Reduces compliance risks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial Placeholder */}
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <blockquote className="text-sm italic text-gray-600">
                    "Finally, a content platform that understands Australian healthcare regulations. 
                    The AHPRA compliance checking gives me confidence that my practice marketing 
                    meets professional standards."
                  </blockquote>
                  <div className="mt-3 text-sm">
                    <div className="font-semibold text-gray-900">Dr. Sarah Chen</div>
                    <div className="text-gray-500">General Practitioner, Melbourne</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-16 text-center text-sm text-gray-500 max-w-4xl mx-auto">
            <p>
              <strong>Healthcare Professional Disclaimer:</strong> This platform is designed to assist Australian healthcare 
              professionals in creating compliant marketing materials. All content should be reviewed by qualified healthcare 
              professionals before publication. JBSAAS does not provide medical advice or replace professional medical judgment. 
              Users are responsible for ensuring all content meets their professional standards and regulatory requirements.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}; 