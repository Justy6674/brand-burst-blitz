import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useHealthcareMFA } from '@/hooks/useHealthcareMFA';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Copy, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  MessageSquare,
  RefreshCw,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MFASetupProps {
  onSetupComplete?: () => void;
  isRequired?: boolean;
}

export const HealthcareMFASetup: React.FC<MFASetupProps> = ({
  onSetupComplete,
  isRequired = false
}) => {
  const { toast } = useToast();
  const {
    loading,
    mfaState,
    smsData,
    initiateMFAEnrollment,
    completeMFAEnrollment,
    setupSMSBackup,
    verifySMSBackup,
    generateBackupCodes,
    disableMFA,
    verifyMFA
  } = useHealthcareMFA();

  const [currentStep, setCurrentStep] = useState<'overview' | 'totp' | 'sms' | 'backup' | 'complete'>('overview');
  const [setupData, setSetupData] = useState<any>(null);
  const [totpCode, setTotpCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // Reset form when MFA state changes
  useEffect(() => {
    if (mfaState.isEnrolled) {
      setCurrentStep('complete');
    }
  }, [mfaState.isEnrolled]);

  const handleStartTOTPSetup = async () => {
    const data = await initiateMFAEnrollment();
    if (data) {
      setSetupData(data);
      setCurrentStep('totp');
    }
  };

  const handleCompleteTOTPSetup = async () => {
    if (!setupData || !totpCode) return;

    const success = await completeMFAEnrollment(setupData.secret, totpCode);
    if (success) {
      setCurrentStep('sms');
      setTotpCode('');
    }
  };

  const handleSetupSMS = async () => {
    if (!phoneNumber) return;

    const success = await setupSMSBackup(phoneNumber);
    if (success) {
      // Wait for SMS verification
    }
  };

  const handleVerifySMS = async () => {
    if (!smsCode) return;

    const success = await verifySMSBackup(smsCode);
    if (success) {
      setCurrentStep('backup');
      setSmsCode('');
    }
  };

  const handleGenerateBackupCodes = async () => {
    const codes = await generateBackupCodes();
    if (codes) {
      setBackupCodes(codes);
      setCurrentStep('complete');
      onSetupComplete?.();
    }
  };

  const handleDisableMFA = async () => {
    if (!disableCode) return;

    const success = await disableMFA(disableCode);
    if (success) {
      setShowDisableDialog(false);
      setDisableCode('');
      setCurrentStep('overview');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  const downloadBackupCodes = () => {
    const content = `JBSAAS Healthcare - MFA Backup Codes
Generated: ${new Date().toLocaleDateString()}

Important: Keep these codes secure and private. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Use these codes when you cannot access your authenticator app
- Each code works only once
- Store in a secure location (password manager recommended)
- Generate new codes if these are compromised`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthcare-mfa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading MFA settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* MFA Requirement Notice */}
      {mfaState.requiresHealthcareMFA && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Healthcare Data Protection:</strong> Multi-factor authentication is required for 
            healthcare professionals to protect patient information and ensure AHPRA compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Current MFA Status */}
      {mfaState.isEnrolled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              MFA Enabled
            </CardTitle>
            <CardDescription>
              Your account is protected with multi-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {mfaState.methods.includes('totp') && (
                <Badge variant="secondary" className="bg-green-50 border-green-200 text-green-700">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Authenticator App
                </Badge>
              )}
              {mfaState.methods.includes('sms') && (
                <Badge variant="secondary" className="bg-blue-50 border-blue-200 text-blue-700">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  SMS Backup
                </Badge>
              )}
              {mfaState.methods.includes('backup_codes') && (
                <Badge variant="secondary" className="bg-purple-50 border-purple-200 text-purple-700">
                  <Key className="h-3 w-3 mr-1" />
                  {mfaState.backupCodesRemaining} Backup Codes
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              {mfaState.enrollmentDate && (
                <p>Enrolled: {new Date(mfaState.enrollmentDate).toLocaleDateString()}</p>
              )}
              {mfaState.lastUsed && (
                <p>Last used: {new Date(mfaState.lastUsed).toLocaleDateString()}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateBackupCodes}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Backup Codes
              </Button>
              
              {!mfaState.requiresHealthcareMFA && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDisableDialog(true)}
                  disabled={loading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Disable MFA
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MFA Setup Flow */}
      {!mfaState.isEnrolled && (
        <Tabs value={currentStep} onValueChange={setCurrentStep as any}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="totp" disabled={!setupData}>Authenticator</TabsTrigger>
            <TabsTrigger value="sms" disabled={!mfaState.methods.includes('totp')}>SMS Backup</TabsTrigger>
            <TabsTrigger value="backup" disabled={!smsData?.verified}>Backup Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Set Up Multi-Factor Authentication</CardTitle>
                <CardDescription>
                  Secure your healthcare account with an additional layer of protection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Authenticator App</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Use Google Authenticator, Authy, or similar app
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">SMS Backup</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive codes via text message as backup
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Key className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium">Backup Codes</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      One-time codes for emergency access
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleStartTOTPSetup}
                  disabled={loading}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Start MFA Setup
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="totp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Set Up Authenticator App
                </CardTitle>
                <CardDescription>
                  Scan the QR code with your authenticator app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {setupData && (
                  <>
                    <div className="text-center">
                      <div className="inline-block p-4 border rounded-lg bg-white">
                        <img 
                          src={setupData.qr_code} 
                          alt="MFA QR Code" 
                          className="w-48 h-48"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Manual Entry Key (if QR doesn't work):</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={setupData.secret} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(setupData.secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="totp-code">Enter Verification Code from App:</Label>
                      <Input
                        id="totp-code"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center font-mono text-lg"
                      />
                    </div>

                    <Button 
                      onClick={handleCompleteTOTPSetup}
                      disabled={loading || totpCode.length !== 6}
                      className="w-full"
                    >
                      Verify and Continue
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Set Up SMS Backup
                </CardTitle>
                <CardDescription>
                  Add your phone number for backup verification codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!smsData?.verified ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Australian Mobile Number:</Label>
                      <Input
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+61 4XX XXX XXX"
                        type="tel"
                      />
                    </div>

                    <Button 
                      onClick={handleSetupSMS}
                      disabled={loading || !phoneNumber}
                      className="w-full"
                    >
                      Send Verification Code
                    </Button>

                    {smsData && !smsData.verified && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="sms-code">Enter SMS Verification Code:</Label>
                          <Input
                            id="sms-code"
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            className="text-center font-mono text-lg"
                          />
                        </div>

                        <Button 
                          onClick={handleVerifySMS}
                          disabled={loading || smsCode.length !== 6}
                          className="w-full"
                        >
                          Verify SMS Code
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">SMS Backup Configured</h3>
                    <p className="text-gray-600">
                      Verified: {smsData.phone_number}
                    </p>
                    <Button 
                      onClick={() => setCurrentStep('backup')}
                      className="mt-4"
                    >
                      Continue to Backup Codes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Generate Backup Codes
                </CardTitle>
                <CardDescription>
                  Create one-time backup codes for emergency access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {backupCodes.length === 0 ? (
                  <>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Backup codes allow you to access your account if you lose your authenticator app or phone.
                        Store them in a secure location like a password manager.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleGenerateBackupCodes}
                      disabled={loading}
                      className="w-full"
                    >
                      Generate Backup Codes
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Save these codes immediately!</strong> Each code can only be used once.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span>{index + 1}. {code}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={downloadBackupCodes}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Codes
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(backupCodes.join('\n'))}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Codes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Disable MFA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Disable Multi-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {mfaState.requiresHealthcareMFA
                ? "Warning: MFA is required for healthcare data access. Disabling MFA may violate compliance requirements."
                : "This will remove the additional security layer from your account."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-code">Enter Verification Code to Confirm:</Label>
              <Input
                id="disable-code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="Enter TOTP or backup code"
                className="text-center font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDisableDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisableMFA}
                disabled={loading || !disableCode}
                className="flex-1"
              >
                Disable MFA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 