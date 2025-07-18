import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  Shield, 
  Globe, 
  Phone, 
  Mail,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface AppealCase {
  id: string;
  submittedAt: string;
  userEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  evidence?: string;
}

export const RiskMitigationSystem = () => {
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealForm, setAppealForm] = useState({
    email: '',
    reason: '',
    description: '',
    evidence: ''
  });

  const appealCases: AppealCase[] = [
    {
      id: 'APP-001',
      submittedAt: '2024-07-15T10:30:00Z',
      userEmail: 'sarah@melbourneclinic.com.au',
      reason: 'Corporate VPN blocking',
      status: 'approved',
      description: 'Healthcare practice using corporate VPN for security compliance',
      evidence: 'ABN verification and practice registration documents'
    },
    {
      id: 'APP-002',
      submittedAt: '2024-07-14T14:20:00Z',
      userEmail: 'john@sydneylaw.com.au',
      reason: 'Traveling overseas',
      status: 'pending',
      description: 'Legal practitioner temporarily in Singapore for conference',
      evidence: 'Law Society membership and travel itinerary'
    }
  ];

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle appeal submission
    console.log('Appeal submitted:', appealForm);
    setShowAppealForm(false);
    setAppealForm({ email: '', reason: '', description: '', evidence: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Mitigation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Risk Mitigation & Edge Case Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">97.3%</div>
              <div className="text-sm text-muted-foreground">Accurate Geo-Detection</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">2.3hrs</div>
              <div className="text-sm text-muted-foreground">Avg Appeal Response</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Eye className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-muted-foreground">Appeal Approval Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Edge Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Common Edge Cases & Solutions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Globe className="w-4 h-4" />
              <AlertDescription>
                <strong>Corporate VPNs:</strong> Many Australian businesses use international VPN services for security.
                Our system checks for ABN verification and business registration to whitelist legitimate cases.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Phone className="w-4 h-4" />
              <AlertDescription>
                <strong>Traveling Australians:</strong> Business owners traveling overseas can verify their identity
                through our appeal process using Australian business documentation.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Mail className="w-4 h-4" />
              <AlertDescription>
                <strong>Shared Networks:</strong> Businesses operating from shared office spaces or co-working
                environments may trigger false positives. We maintain a whitelist of known Australian business hubs.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Appeal Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span>Access Appeal Process</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAppealForm ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">
                If you believe you've been incorrectly identified as a non-Australian business,
                you can submit an appeal with supporting documentation.
              </p>
              <Button onClick={() => setShowAppealForm(true)}>
                Submit Access Appeal
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAppealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={appealForm.email}
                  onChange={(e) => setAppealForm({ ...appealForm, email: e.target.value })}
                  placeholder="your.email@business.com.au"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Appeal</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={appealForm.reason}
                  onChange={(e) => setAppealForm({ ...appealForm, reason: e.target.value })}
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="corporate-vpn">Corporate VPN/Network</option>
                  <option value="traveling-overseas">Traveling Overseas</option>
                  <option value="shared-office">Shared Office Space</option>
                  <option value="technical-issue">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={appealForm.description}
                  onChange={(e) => setAppealForm({ ...appealForm, description: e.target.value })}
                  placeholder="Please describe your situation and why you should have access..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Supporting Evidence</label>
                <Textarea
                  value={appealForm.evidence}
                  onChange={(e) => setAppealForm({ ...appealForm, evidence: e.target.value })}
                  placeholder="ABN number, business registration details, or other supporting information..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  Submit Appeal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAppealForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recent Appeals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appeal Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appealCases.map((appeal) => (
              <div key={appeal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{appeal.id}</Badge>
                    <span className="text-sm font-medium">{appeal.userEmail}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(appeal.status)}
                    <span className={`text-sm font-medium capitalize ${getStatusColor(appeal.status)}`}>
                      {appeal.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div><strong>Reason:</strong> {appeal.reason}</div>
                  <div><strong>Description:</strong> {appeal.description}</div>
                  {appeal.evidence && (
                    <div><strong>Evidence:</strong> {appeal.evidence}</div>
                  )}
                  <div className="text-muted-foreground">
                    Submitted: {new Date(appeal.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* International Expansion Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-600" />
            <span>International Expansion Readiness</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Market Expansion Framework</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Technical Requirements</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Multi-region database architecture</li>
                    <li>✓ Scalable geo-detection system</li>
                    <li>✓ Internationalization framework</li>
                    <li>✓ Currency and payment system flexibility</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Business Requirements</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>⏳ Local compliance research</li>
                    <li>⏳ Regional partnership identification</li>
                    <li>⏳ Market size validation</li>
                    <li>⏳ Localization strategy development</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">International Waitlist Status</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-xl font-bold">247</div>
                  <div className="text-sm text-muted-foreground">New Zealand</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-xl font-bold">189</div>
                  <div className="text-sm text-muted-foreground">United Kingdom</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-xl font-bold">156</div>
                  <div className="text-sm text-muted-foreground">Canada</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We're actively monitoring international demand to prioritize our expansion roadmap.
                New Zealand is likely our next market based on similar business structures and compliance requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};