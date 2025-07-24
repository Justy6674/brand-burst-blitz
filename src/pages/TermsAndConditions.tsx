import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PublicHeader />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6 text-white">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. About JB-Health</h2>
              <p className="text-white/90">
                JB-Health is an AI-powered healthcare marketing platform designed specifically for AHPRA-registered healthcare professionals in Australia. Our platform provides compliant content generation, social media management, and marketing automation tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="text-white/90 mb-4">
                JB-Health offers the following services:
              </p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>AI-powered content generation with AHPRA compliance checking</li>
                <li>Social media management and automation</li>
                <li>Blog integration and management</li>
                <li>Healthcare-specific marketing tools</li>
                <li>Name Scout services for Australian businesses</li>
                <li>Australian business setup and social media configuration services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Subscription Terms</h2>
              <p className="text-white/90">
                JB-Health offers monthly subscription plans for healthcare professionals. Subscriptions are billed monthly and can be cancelled at any time with 30 days notice. All pricing is in Australian Dollars (AUD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. AHPRA Compliance</h2>
              <p className="text-white/90">
                While JB-Health provides AHPRA compliance checking tools, users remain solely responsible for ensuring all content and marketing activities comply with AHPRA guidelines and relevant Australian healthcare regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
              <p className="text-white/90 mb-4">Users agree to:</p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>Provide accurate information about their healthcare practice</li>
                <li>Maintain current AHPRA registration</li>
                <li>Review and approve all AI-generated content before publication</li>
                <li>Comply with all applicable healthcare regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-white/90">
                JB-Health provides tools and services to assist with healthcare marketing but does not guarantee compliance outcomes. Users are responsible for their own regulatory compliance and professional conduct.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
              <p className="text-white/90">
                JB-Health<br />
                Website: www.jbhealth.health<br />
                Email: support@jbhealth.health
              </p>
            </section>

            <p className="text-sm text-white/70 mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;