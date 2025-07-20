import { supabase } from '../integrations/supabase/client';

// Australian Business Number (ABN) API Integration
interface ABNDetails {
  abn: string;
  abnStatus: string;
  abnStatusFromDate: string;
  entityName: string;
  entityTypeCode: string;
  entityTypeName: string;
  gstStatus: string;
  gstStatusFromDate: string;
  businessNames: string[];
  isCurrentIndicator: string;
  isIndividual: boolean;
  isCompany: boolean;
  isTrust: boolean;
  isPartnership: boolean;
  postcode: string;
  state: string;
}

interface AHPRARegistration {
  registrationNumber: string;
  givenName: string;
  familyName: string;
  profession: string;
  registrationStatus: string;
  registrationExpiry: string;
  conditions: string[];
  specialty: string[];
  principal: {
    address: string;
    state: string;
    postcode: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  data?: any;
  errors: string[];
  warnings: string[];
}

class AustralianServicesAPI {
  private abnApiUrl = 'https://abr.business.gov.au/json/AbnDetails.aspx';
  private ahpraApiUrl = 'https://www.ahpra.gov.au/api/search';
  
  // Real ABN validation via Australian Business Register
  async validateABN(abn: string): Promise<ValidationResult> {
    try {
      // Clean ABN format
      const cleanABN = abn.replace(/\s/g, '');
      
      // Validate ABN format
      if (!this.isValidABNFormat(cleanABN)) {
        return {
          isValid: false,
          errors: ['Invalid ABN format. Must be 11 digits.'],
          warnings: []
        };
      }
      
      // Call Australian Business Register API
      const response = await fetch(`${this.abnApiUrl}?abn=${cleanABN}&guid=${this.getGUID()}`);
      
      if (!response.ok) {
        throw new Error(`ABN API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.AbnStatus === 'Active') {
        const abnDetails: ABNDetails = {
          abn: data.Abn,
          abnStatus: data.AbnStatus,
          abnStatusFromDate: data.AbnStatusFromDate,
          entityName: data.EntityName,
          entityTypeCode: data.EntityTypeCode,
          entityTypeName: data.EntityTypeName,
          gstStatus: data.GstStatus,
          gstStatusFromDate: data.GstStatusFromDate,
          businessNames: data.BusinessName || [],
          isCurrentIndicator: data.IsCurrentIndicator,
          isIndividual: data.EntityTypeCode === 'IND',
          isCompany: data.EntityTypeCode === 'PRV',
          isTrust: data.EntityTypeCode === 'DIS',
          isPartnership: data.EntityTypeCode === 'PRT',
          postcode: data.AddressPostcode,
          state: data.AddressState
        };
        
        // Save to Supabase for caching
        await this.cacheABNDetails(cleanABN, abnDetails);
        
        return {
          isValid: true,
          data: abnDetails,
          errors: [],
          warnings: []
        };
      } else {
        return {
          isValid: false,
          errors: [`ABN is ${data.AbnStatus.toLowerCase()}. Only active ABNs are accepted.`],
          warnings: []
        };
      }
      
    } catch (error) {
      console.error('ABN validation error:', error);
      
      // Fallback to cached data if API fails
      const cached = await this.getCachedABNDetails(abn);
      if (cached) {
        return {
          isValid: true,
          data: cached,
          errors: [],
          warnings: ['Using cached ABN data due to API unavailability']
        };
      }
      
      return {
        isValid: false,
        errors: ['Unable to validate ABN. Please try again later.'],
        warnings: []
      };
    }
  }
  
  // Real AHPRA registration verification
  async verifyAHPRARegistration(registrationNumber: string): Promise<ValidationResult> {
    try {
      // Clean registration number format
      const cleanRegNum = registrationNumber.toUpperCase().replace(/\s/g, '');
      
      // Validate format (e.g., MED1234567890)
      if (!this.isValidAHPRAFormat(cleanRegNum)) {
        return {
          isValid: false,
          errors: ['Invalid AHPRA registration format. Should be 3 letters followed by 10 digits (e.g., MED1234567890)'],
          warnings: []
        };
      }
      
      // Call AHPRA public register API
      const response = await fetch(this.ahpraApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: cleanRegNum,
          searchType: 'registration'
        })
      });
      
      if (!response.ok) {
        throw new Error(`AHPRA API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const practitioner = data.results[0];
        
        const ahpraDetails: AHPRARegistration = {
          registrationNumber: practitioner.registrationNumber,
          givenName: practitioner.givenName,
          familyName: practitioner.familyName,
          profession: practitioner.profession,
          registrationStatus: practitioner.registrationStatus,
          registrationExpiry: practitioner.registrationExpiry,
          conditions: practitioner.conditions || [],
          specialty: practitioner.specialty || [],
          principal: {
            address: practitioner.principalAddress,
            state: practitioner.principalState,
            postcode: practitioner.principalPostcode
          }
        };
        
        // Save to Supabase for caching
        await this.cacheAHPRADetails(cleanRegNum, ahpraDetails);
        
        if (practitioner.registrationStatus === 'Current') {
          return {
            isValid: true,
            data: ahpraDetails,
            errors: [],
            warnings: []
          };
        } else {
          return {
            isValid: false,
            errors: [`AHPRA registration is ${practitioner.registrationStatus.toLowerCase()}. Only current registrations are accepted.`],
            warnings: []
          };
        }
      } else {
        return {
          isValid: false,
          errors: ['AHPRA registration number not found in public register'],
          warnings: []
        };
      }
      
    } catch (error) {
      console.error('AHPRA verification error:', error);
      
      // Fallback to cached data if API fails
      const cached = await this.getCachedAHPRADetails(registrationNumber);
      if (cached) {
        return {
          isValid: true,
          data: cached,
          errors: [],
          warnings: ['Using cached AHPRA data due to API unavailability']
        };
      }
      
      return {
        isValid: false,
        errors: ['Unable to verify AHPRA registration. Please try again later.'],
        warnings: []
      };
    }
  }
  
  // Australian healthcare practice name verification
  async verifyHealthcarePracticeName(practiceName: string, abn?: string): Promise<ValidationResult> {
    try {
      // Check if practice name is already in use
      const { data: existingPractices, error } = await supabase
        .from('business_profiles')
        .select('business_name, abn')
        .eq('business_name', practiceName);
      
      if (error) {
        throw error;
      }
      
      const warnings: string[] = [];
      
      if (existingPractices && existingPractices.length > 0) {
        const existingPractice = existingPractices[0];
        
        if (abn && existingPractice.abn === abn) {
          // Same ABN, likely legitimate update
          warnings.push('Practice name exists with same ABN - this may be an update');
        } else {
          // Different ABN, potential duplicate
          return {
            isValid: false,
            errors: ['Practice name already exists with different ABN. Please choose a unique name.'],
            warnings: []
          };
        }
      }
      
      // Validate against healthcare naming conventions
      const healthcareTerms = [
        'medical', 'health', 'clinic', 'practice', 'centre', 'center',
        'physio', 'psychology', 'dental', 'pharmacy', 'allied',
        'hospital', 'surgery', 'care', 'wellness', 'therapy'
      ];
      
      const practiceNameLower = practiceName.toLowerCase();
      const hasHealthcareTerm = healthcareTerms.some(term => 
        practiceNameLower.includes(term)
      );
      
      if (!hasHealthcareTerm) {
        warnings.push('Practice name does not contain healthcare-related terms. Consider including terms like "Medical", "Health", "Clinic", etc.');
      }
      
      // Check for inappropriate terms
      const inappropriateTerms = ['miracle', 'cure-all', 'magic', 'instant'];
      const hasInappropriate = inappropriateTerms.some(term => 
        practiceNameLower.includes(term)
      );
      
      if (hasInappropriate) {
        return {
          isValid: false,
          errors: ['Practice name contains inappropriate terms that may violate AHPRA advertising guidelines'],
          warnings: []
        };
      }
      
      return {
        isValid: true,
        data: { practiceName, isUnique: existingPractices.length === 0 },
        errors: [],
        warnings
      };
      
    } catch (error) {
      console.error('Practice name verification error:', error);
      return {
        isValid: false,
        errors: ['Unable to verify practice name. Please try again later.'],
        warnings: []
      };
    }
  }
  
  // Validate healthcare practice eligibility
  async validateHealthcarePracticeEligibility(abnDetails: ABNDetails, ahpraDetails: AHPRARegistration): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Check if ABN is healthcare-related
      const healthcareEntityTypes = ['PRV', 'SOL', 'PRT']; // Company, Sole Trader, Partnership
      if (!healthcareEntityTypes.includes(abnDetails.entityTypeCode)) {
        warnings.push('Entity type may not be suitable for healthcare practice. Consider registering as Company, Sole Trader, or Partnership.');
      }
      
      // Check GST registration for larger practices
      if (abnDetails.gstStatus !== 'Current' && abnDetails.entityTypeCode === 'PRV') {
        warnings.push('GST registration recommended for companies providing healthcare services.');
      }
      
      // Verify AHPRA registration is current
      const currentDate = new Date();
      const expiryDate = new Date(ahpraDetails.registrationExpiry);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        errors.push('AHPRA registration has expired. Please renew before proceeding.');
      } else if (daysUntilExpiry < 30) {
        warnings.push(`AHPRA registration expires in ${daysUntilExpiry} days. Consider renewing soon.`);
      }
      
      // Check for registration conditions
      if (ahpraDetails.conditions.length > 0) {
        warnings.push(`AHPRA registration has conditions: ${ahpraDetails.conditions.join(', ')}`);
      }
      
      // Geographic consistency check
      if (abnDetails.state !== ahpraDetails.principal.state) {
        warnings.push('ABN state differs from AHPRA principal practice location. Ensure compliance with multi-state practice requirements.');
      }
      
      return {
        isValid: errors.length === 0,
        data: {
          eligibilityScore: Math.max(0, 100 - (errors.length * 30) - (warnings.length * 10)),
          recommendations: [
            ...errors.map(e => ({ type: 'error', message: e })),
            ...warnings.map(w => ({ type: 'warning', message: w }))
          ]
        },
        errors,
        warnings
      };
      
    } catch (error) {
      console.error('Eligibility validation error:', error);
      return {
        isValid: false,
        errors: ['Unable to validate practice eligibility. Please try again later.'],
        warnings: []
      };
    }
  }
  
  // Helper methods
  private isValidABNFormat(abn: string): boolean {
    return /^\d{11}$/.test(abn) && this.validateABNChecksum(abn);
  }
  
  private validateABNChecksum(abn: string): boolean {
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = abn.split('').map(Number);
    
    // Subtract 1 from the first digit
    digits[0] = digits[0] - 1;
    
    // Calculate weighted sum
    const sum = digits.reduce((total, digit, index) => total + (digit * weights[index]), 0);
    
    // Check if divisible by 89
    return sum % 89 === 0;
  }
  
  private isValidAHPRAFormat(registration: string): boolean {
    return /^[A-Z]{3}\d{10}$/.test(registration);
  }
  
  private getGUID(): string {
    // This would be a real GUID from ABR registration
    return process.env.REACT_APP_ABR_GUID || 'YOUR_ABR_GUID_HERE';
  }
  
  // Caching methods for offline functionality
  private async cacheABNDetails(abn: string, details: ABNDetails): Promise<void> {
    try {
      await supabase
        .from('abn_cache')
        .upsert({
          abn,
          details,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
    } catch (error) {
      console.error('Error caching ABN details:', error);
    }
  }
  
  private async getCachedABNDetails(abn: string): Promise<ABNDetails | null> {
    try {
      const { data, error } = await supabase
        .from('abn_cache')
        .select('details')
        .eq('abn', abn.replace(/\s/g, ''))
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) return null;
      return data.details;
    } catch (error) {
      console.error('Error retrieving cached ABN details:', error);
      return null;
    }
  }
  
  private async cacheAHPRADetails(registrationNumber: string, details: AHPRARegistration): Promise<void> {
    try {
      await supabase
        .from('ahpra_cache')
        .upsert({
          registration_number: registrationNumber,
          details,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
    } catch (error) {
      console.error('Error caching AHPRA details:', error);
    }
  }
  
  private async getCachedAHPRADetails(registrationNumber: string): Promise<AHPRARegistration | null> {
    try {
      const { data, error } = await supabase
        .from('ahpra_cache')
        .select('details')
        .eq('registration_number', registrationNumber.toUpperCase().replace(/\s/g, ''))
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) return null;
      return data.details;
    } catch (error) {
      console.error('Error retrieving cached AHPRA details:', error);
      return null;
    }
  }
}

// Export singleton instance
export const australianServices = new AustralianServicesAPI();

// Export types
export type {
  ABNDetails,
  AHPRARegistration,
  ValidationResult
}; 