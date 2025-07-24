import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PublicHeader />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6 text-white">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Subscription Refunds</h2>
              <p className="text-white/90">
                JB-Health offers a 14-day free trial for all new healthcare professional subscriptions. After the trial period, all subscription payments are non-refundable. You may cancel your subscription at any time to prevent future charges.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. One-Time Service Refunds</h2>
              <p className="text-white/90 mb-4">
                For one-time services such as Name Scout or Australian Business Setup:
              </p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>Refunds available within 7 days if service has not been started</li>
                <li>No refunds once work has commenced or results have been delivered</li>
                <li>Partial refunds may be considered for incomplete services at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cancellation Process</h2>
              <p className="text-white/90">
                To cancel your subscription or request a refund:
              </p>
              <ul className="list-disc list-inside text-white/90 space-y-2">
                <li>Log into your JB-Health dashboard</li>
                <li>Go to Account Settings &gt; Billing</li>
                <li>Click "Cancel Subscription" or contact support</li>
                <li>For refund requests, email support@jbhealth.health</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Exceptional Circumstances</h2>
              <p className="text-white/90">
                In exceptional circumstances (technical issues preventing service use, billing errors), we may provide refunds or credits at our discretion. Contact our support team to discuss your situation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Processing Time</h2>
              <p className="text-white/90">
                Approved refunds will be processed within 5-7 business days and will appear on your original payment method within 1-2 billing cycles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
              <p className="text-white/90">
                For refund requests or questions about this policy:<br />
                Email: support@jbhealth.health<br />
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

export default RefundPolicy;