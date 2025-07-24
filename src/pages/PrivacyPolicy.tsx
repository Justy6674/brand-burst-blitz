import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PublicHeader />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6 text-white">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-white/90 mb-4">
                JB-Health collects the following information to provide our healthcare marketing services:
              </p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>Account information (name, email, practice details)</li>
                <li>AHPRA registration details</li>
                <li>Content and marketing materials you create</li>
                <li>Usage data and platform analytics</li>
                <li>Payment and billing information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-white/90 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>Provide AI-powered content generation services</li>
                <li>Ensure AHPRA compliance in generated content</li>
                <li>Process payments and manage subscriptions</li>
                <li>Improve our platform and services</li>
                <li>Communicate important updates and support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p className="text-white/90">
                We implement industry-standard security measures to protect your data, including encryption, secure hosting, and regular security audits. All data is stored in Australia in compliance with local privacy laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p className="text-white/90">
                We do not sell or share your personal information with third parties except as necessary to provide our services (e.g., payment processing) or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="text-white/90 mb-4">Under Australian Privacy Laws, you have the right to:</p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p className="text-white/90">
                For privacy concerns or to exercise your rights, contact us at:<br />
                Email: privacy@jbhealth.health<br />
                Website: www.jbhealth.health
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

export default PrivacyPolicy;