import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  MapPin, 
  Lock, 
  FileText, 
  Database,
  Eye,
  CheckCircle
} from 'lucide-react';

export const DataSovereigntyCompliance = () => {
  return (
    <div className="space-y-6">
      {/* Data Residency Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>Australian Data Sovereignty</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <MapPin className="w-4 h-4" />
            <AlertDescription>
              <strong>Data Hosting Location:</strong> All your business data is stored on servers located within Australia, 
              ensuring compliance with Australian Privacy Principles and data sovereignty requirements.
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Data Storage</span>
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Australian data centres (Sydney region)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>ISO 27001 certified infrastructure</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Regular security audits</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Privacy Protection</span>
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Privacy Act 1988 compliant</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Australian Privacy Principles adherence</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>No offshore data transfers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Right to data portability</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Compliance Certifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Badge variant="outline" className="p-3 flex flex-col items-center space-y-2">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-center">
                <div className="font-semibold">Privacy Act 1988</div>
                <div className="text-xs text-muted-foreground">Fully Compliant</div>
              </span>
            </Badge>
            
            <Badge variant="outline" className="p-3 flex flex-col items-center space-y-2">
              <Lock className="w-6 h-6 text-blue-600" />
              <span className="text-center">
                <div className="font-semibold">ISO 27001</div>
                <div className="text-xs text-muted-foreground">Security Management</div>
              </span>
            </Badge>
            
            <Badge variant="outline" className="p-3 flex flex-col items-center space-y-2">
              <Database className="w-6 h-6 text-purple-600" />
              <span className="text-center">
                <div className="font-semibold">SOC 2 Type II</div>
                <div className="text-xs text-muted-foreground">Data Security</div>
              </span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Processing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Processing & Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">What Data We Collect:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Business information (ABN, business name, contact details)</li>
              <li>• User account information (email, name, profile data)</li>
              <li>• Content creation data (posts, templates, analytics)</li>
              <li>• Usage analytics (anonymised platform interaction data)</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">How We Protect Your Data:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Encryption at rest and in transit (AES-256)</li>
              <li>• Regular automated backups with 30-day retention</li>
              <li>• Multi-factor authentication for admin access</li>
              <li>• Regular penetration testing and security audits</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Your Rights:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Right to access your personal information</li>
              <li>• Right to correct inaccurate information</li>
              <li>• Right to delete your account and data</li>
              <li>• Right to data portability (export your data)</li>
              <li>• Right to complaint to the Office of the Australian Information Commissioner</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Officer Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For any privacy-related questions or to exercise your rights under the Privacy Act 1988:
          </p>
          <div className="space-y-2 text-sm">
            <div><strong>Email:</strong> privacy@jbsaas.com.au</div>
            <div><strong>Phone:</strong> 1300 JB SAAS (1300 527 227)</div>
            <div><strong>Address:</strong> Level 1, 123 Collins Street, Melbourne VIC 3000</div>
            <div><strong>Response Time:</strong> We will respond within 30 days as required by law</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};