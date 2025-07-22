import { useCallback } from "react";

export const useScrollToPricing = () => {
  const scrollToPricing = useCallback(() => {
    // Look for pricing section by ID or class
    const pricingSection = document.getElementById('pricing') || 
                          document.querySelector('[data-section="pricing"]') ||
                          document.querySelector('.pricing-section');
    
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // If no pricing section on current page, navigate to pricing page
      window.location.href = '/pricing';
    }
  }, []);

  return { scrollToPricing };
};