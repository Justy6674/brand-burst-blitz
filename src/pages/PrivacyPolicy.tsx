import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/layout/HeroSection';
import { Shield, Eye, Lock, MapPin, Phone, Mail } from 'lucide-react';
import aiContentHero from '@/assets/ai-content-creation-hero.jpg';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <HeroSection backgroundImage={aiContentHero} className="min-h-[40vh]">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-6 bg-green-600 text-white border-green-500 text-base px-4 py-2">
            🇦🇺 Australian Privacy Act 1988 Compliant
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Privacy Policy
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
            Your privacy matters. We're committed to protecting your data under Australian law.
          </p>
        </div>
      </HeroSection>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Overview */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">Privacy Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                JB-SaaS is an Australian-owned and operated business committed to protecting your privacy 
                in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Australian Data Hosting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Transparent Practices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Secure Processing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Name and email address (for account creation)</li>
                  <li>Australian Business Number (ABN) for business verification</li>
                  <li>Business name and industry type</li>
                  <li>Payment information (processed securely through Stripe)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Information:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Content generated through our AI platform</li>
                  <li>Platform usage analytics and preferences</li>
                  <li>Device information and IP address (for Australian verification)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide AI content generation services specifically for Australian businesses</li>
                <li>Verify your business is Australian-operated (ABN validation)</li>
                <li>Process payments and manage your subscription</li>
                <li>Improve our platform and develop new features</li>
                <li>Communicate with you about service updates and support</li>
                <li>Ensure compliance with Australian business regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">3. Data Storage & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Location:</h4>
                <p className="text-muted-foreground">
                  Your data is stored using Supabase infrastructure, which uses AWS servers. 
                  We ensure data residency compliance for Australian businesses.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Measures:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Secure database storage with regular backups</li>
                  <li>Multi-factor authentication options</li>
                  <li>Regular security audits and updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sharing and Disclosure */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">4. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">We do not sell, trade, or share your personal information except:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>With your explicit consent</li>
                <li>To our trusted service providers (Stripe for payments, Supabase for data storage)</li>
                <li>When required by Australian law or regulation</li>
                <li>To protect our rights or the safety of our users</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">5. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Under the Privacy Act 1988, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
                <li>Restrict or object to processing of your information</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-xl">Contact Us About Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have questions about this Privacy Policy or want to exercise your privacy rights:
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>Email: privacy@jb-saas.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Phone: 1800 JB-SAAS (Australian business hours)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Address: Australian Business Address (Available upon request)</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>OAIC Complaints:</strong> You can also lodge a complaint directly with the 
                  Office of the Australian Information Commissioner at <em>oaic.gov.au</em>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center mt-8 text-muted-foreground">
            <p>Last updated: January 2025</p>
            <p className="text-sm mt-2">
              This policy may be updated periodically. We'll notify you of significant changes via email.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;