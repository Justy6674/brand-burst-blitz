import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import FreeSubdomainPreview from '@/components/seo/FreeSubdomainPreview';

const FreeSubdomainAnalysis = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="py-12 md:py-16 lg:py-24">
        <FreeSubdomainPreview />
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/jbsaaslogo.png" 
                alt="jbhealth.health Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gradient-primary">jbhealth.health</span>
            </div>
            <p className="text-muted-foreground">
              © 2025 jbhealth.health. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FreeSubdomainAnalysis;