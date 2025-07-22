import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import { Shield, CheckCircle, AlertTriangle, FileText, Users, Star } from 'lucide-react';

export const HealthcareContent = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Healthcare Content Creator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Australia's first AHPRA-compliant AI content generator for healthcare professionals. 
            Create patient education materials, practice marketing, and professional communications 
            that automatically follow AHPRA advertising guidelines and TGA therapeutic advertising requirements.
          </p>
          
          {/* Compliance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
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
              Healthcare Specific
            </Badge>
            <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Australia's First
            </Badge>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                AHPRA Compliant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• No patient testimonials detection</li>
                <li>• Professional boundary enforcement</li>
                <li>• Risk disclaimers included</li>
                <li>• Registration number validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                TGA Therapeutic Advertising
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Prohibited drug name detection</li>
                <li>• Therapeutic claims validation</li>
                <li>• Medical device compliance</li>
                <li>• Evidence-based language only</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <FileText className="h-5 w-5" />
                Healthcare Specialized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• GP, Allied Health, Specialist support</li>
                <li>• Patient-appropriate language</li>
                <li>• Cultural safety considerations</li>
                <li>• Multi-practice management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Usage Warning */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This platform is designed exclusively for Australian healthcare professionals. 
            All content generation requires valid AHPRA registration and follows Australian healthcare advertising regulations. 
            Content should be reviewed by qualified healthcare professionals before publication.
          </AlertDescription>
        </Alert>

        {/* Main Content Generator */}
        <AIContentGenerator 
          onContentGenerated={(content, postId) => {
            console.log('Healthcare content generated:', { content, postId });
          }}
        />

        {/* Bottom Information */}
        <Card>
          <CardHeader>
            <CardTitle>Why Choose JBSAAS for Healthcare Content?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Regulatory Compliance</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Built-in AHPRA advertising guidelines validation</li>
                  <li>• TGA therapeutic advertising compliance</li>
                  <li>• Professional indemnity protection through compliant content</li>
                  <li>• Real-time compliance scoring and suggestions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Healthcare Expertise</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Patient-appropriate communication training</li>
                  <li>• Healthcare specialty-specific content generation</li>
                  <li>• Professional boundary respect in all content</li>
                  <li>• Evidence-based medical language</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                <strong>Disclaimer:</strong> This AI-generated content is designed to assist healthcare professionals 
                in creating compliant marketing materials. All content should be reviewed by qualified healthcare 
                professionals before publication. JBSAAS does not provide medical advice or replace professional 
                medical judgment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}; 