import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from './use-toast';
import healthcareValidation, { 
  ValidationResult, 
  AHPRAComplianceCheck,
  validateHealthcareInput,
  validateContentInRealTime,
  validateAHPRACompliance,
  sanitizeHealthcareText
} from '../lib/validation/healthcareValidation';

// Real-time content validation hook
export function useRealTimeContentValidation(initialContent: string = '') {
  const [content, setContent] = useState(initialContent);
  const [validation, setValidation] = useState({
    isCompliant: true,
    issues: [] as Array<{ type: 'error' | 'warning', message: string }>,
    score: 100
  });
  const [isValidating, setIsValidating] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const validateContent = useCallback((text: string) => {
    setIsValidating(true);
    
    // Debounce validation to avoid excessive API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      const result = validateContentInRealTime(text);
      setValidation(result);
      setIsValidating(false);
    }, 500);
  }, []);
  
  const updateContent = useCallback((newContent: string) => {
    const sanitized = sanitizeHealthcareText(newContent);
    setContent(sanitized);
    validateContent(sanitized);
  }, [validateContent]);
  
  useEffect(() => {
    if (content) {
      validateContent(content);
    }
  }, [content, validateContent]);
  
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  return {
    content,
    setContent: updateContent,
    validation,
    isValidating,
    isCompliant: validation.isCompliant,
    complianceScore: validation.score,
    errors: validation.issues.filter(i => i.type === 'error'),
    warnings: validation.issues.filter(i => i.type === 'warning')
  };
}

// Healthcare form validation hook
export function useHealthcareFormValidation<T>(
  validationType: 'ahpra_registration' | 'practice_details' | 'patient_content' | 'team_member' | 'appointment_info'
) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [warnings, setWarnings] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);
  
  const validateField = useCallback(async (fieldName: string, value: any): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      // Create partial object for single field validation
      const partialData = { [fieldName]: value };
      const result = validateHealthcareInput(partialData, validationType, true);
      
      // Update field-specific errors
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.errors.filter(e => e.includes(fieldName))
      }));
      
      setWarnings(prev => ({
        ...prev,
        [fieldName]: result.warnings.filter(w => w.includes(fieldName))
      }));
      
      return result.isValid;
    } catch (error) {
      console.error('Field validation error:', error);
      setErrors(prev => ({
        ...prev,
        [fieldName]: [error.message]
      }));
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [validationType]);
  
  const validateForm = useCallback(async (formData: T): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = validateHealthcareInput(formData, validationType, true);
      setLastValidation(result);
      
      // Parse errors by field
      const fieldErrors: Record<string, string[]> = {};
      const fieldWarnings: Record<string, string[]> = {};
      
      result.errors.forEach(error => {
        const fieldMatch = error.match(/^([^:]+):/);
        const fieldName = fieldMatch ? fieldMatch[1] : 'general';
        
        if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
        fieldErrors[fieldName].push(error.replace(/^[^:]+:\s*/, ''));
      });
      
      result.warnings.forEach(warning => {
        const fieldMatch = warning.match(/^([^:]+):/);
        const fieldName = fieldMatch ? fieldMatch[1] : 'general';
        
        if (!fieldWarnings[fieldName]) fieldWarnings[fieldName] = [];
        fieldWarnings[fieldName].push(warning.replace(/^[^:]+:\s*/, ''));
      });
      
      setErrors(fieldErrors);
      setWarnings(fieldWarnings);
      
      // Show compliance warnings for healthcare content
      if (validationType === 'patient_content' && result.complianceScore < 100) {
        toast({
          title: "AHPRA Compliance Warning",
          description: `Content compliance score: ${result.complianceScore}%. Please review suggestions.`,
          variant: result.complianceScore < 70 ? "destructive" : "default"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Form validation error:', error);
      const errorResult: ValidationResult = {
        isValid: false,
        errors: [error.message],
        warnings: [],
        securityRisk: 'high'
      };
      setLastValidation(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [validationType, toast]);
  
  const clearValidation = useCallback(() => {
    setErrors({});
    setWarnings({});
    setLastValidation(null);
  }, []);
  
  const getFieldErrors = useCallback((fieldName: string): string[] => {
    return errors[fieldName] || [];
  }, [errors]);
  
  const getFieldWarnings = useCallback((fieldName: string): string[] => {
    return warnings[fieldName] || [];
  }, [warnings]);
  
  const hasFieldErrors = useCallback((fieldName: string): boolean => {
    return (errors[fieldName] || []).length > 0;
  }, [errors]);
  
  return {
    validateField,
    validateForm,
    clearValidation,
    getFieldErrors,
    getFieldWarnings,
    hasFieldErrors,
    errors,
    warnings,
    isValidating,
    lastValidation,
    isFormValid: lastValidation?.isValid || false,
    complianceScore: lastValidation?.complianceScore || 0
  };
}

// AHPRA compliance monitoring hook
export function useAHPRAComplianceMonitoring() {
  const { toast } = useToast();
  const [complianceHistory, setComplianceHistory] = useState<AHPRAComplianceCheck[]>([]);
  const [activeViolations, setActiveViolations] = useState<string[]>([]);
  const [complianceScore, setComplianceScore] = useState(100);
  
  const checkCompliance = useCallback(async (content: string): Promise<AHPRAComplianceCheck> => {
    const result = validateAHPRACompliance(content);
    
    // Add to compliance history
    setComplianceHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 checks
    
    // Update active violations
    setActiveViolations(result.violations);
    
    // Calculate compliance score
    const score = Math.max(0, 100 - (result.violations.length * 20));
    setComplianceScore(score);
    
    // Show critical compliance alerts
    if (result.riskLevel === 'critical') {
      toast({
        title: "CRITICAL AHPRA Violation",
        description: "Content violates AHPRA guidelines and cannot be published",
        variant: "destructive"
      });
    } else if (result.riskLevel === 'high') {
      toast({
        title: "AHPRA Compliance Warning",
        description: "Content may violate professional guidelines",
        variant: "destructive"
      });
    }
    
    return result;
  }, [toast]);
  
  const getComplianceTrend = useCallback(() => {
    if (complianceHistory.length < 2) return 'stable';
    
    const recent = complianceHistory.slice(0, 3);
    const older = complianceHistory.slice(3, 6);
    
    const recentViolations = recent.reduce((sum, check) => sum + check.violations.length, 0);
    const olderViolations = older.reduce((sum, check) => sum + check.violations.length, 0);
    
    if (recentViolations < olderViolations) return 'improving';
    if (recentViolations > olderViolations) return 'declining';
    return 'stable';
  }, [complianceHistory]);
  
  return {
    checkCompliance,
    complianceHistory,
    activeViolations,
    complianceScore,
    complianceTrend: getComplianceTrend(),
    hasActiveViolations: activeViolations.length > 0,
    riskLevel: complianceHistory[0]?.riskLevel || 'low'
  };
}

// Healthcare data sanitization hook
export function useHealthcareDataSanitization() {
  const [sanitizationLog, setSanitizationLog] = useState<Array<{
    timestamp: Date;
    originalLength: number;
    sanitizedLength: number;
    changesDetected: boolean;
  }>>([]);
  
  const sanitizeData = useCallback((data: any): any => {
    const originalData = JSON.stringify(data);
    const originalLength = originalData.length;
    
    let sanitized = data;
    
    if (typeof data === 'string') {
      sanitized = sanitizeHealthcareText(data);
    } else if (typeof data === 'object' && data !== null) {
      sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeHealthcareText(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    const sanitizedData = JSON.stringify(sanitized);
    const sanitizedLength = sanitizedData.length;
    const changesDetected = originalData !== sanitizedData;
    
    // Log sanitization activity
    setSanitizationLog(prev => [{
      timestamp: new Date(),
      originalLength,
      sanitizedLength,
      changesDetected
    }, ...prev.slice(0, 49)]); // Keep last 50 logs
    
    return sanitized;
  }, []);
  
  const getSanitizationStats = useCallback(() => {
    const totalSanitizations = sanitizationLog.length;
    const sanitizationsWithChanges = sanitizationLog.filter(log => log.changesDetected).length;
    const averageChangeRate = totalSanitizations > 0 ? (sanitizationsWithChanges / totalSanitizations) * 100 : 0;
    
    return {
      totalSanitizations,
      sanitizationsWithChanges,
      averageChangeRate: Math.round(averageChangeRate)
    };
  }, [sanitizationLog]);
  
  return {
    sanitizeData,
    sanitizationLog,
    sanitizationStats: getSanitizationStats()
  };
}

// Healthcare security validation hook
export function useHealthcareSecurityValidation() {
  const { toast } = useToast();
  const [securityAlerts, setSecurityAlerts] = useState<Array<{
    timestamp: Date;
    type: 'xss' | 'injection' | 'malicious_content' | 'suspicious_pattern';
    severity: 'low' | 'medium' | 'high' | 'critical';
    content: string;
    action: 'blocked' | 'sanitized' | 'flagged';
  }>>([]);
  
  const validateSecurity = useCallback((content: string, context: string = 'general'): boolean => {
    const result = healthcareValidation.validateSecurity(content);
    
    if (!result.isValid) {
      const alert = {
        timestamp: new Date(),
        type: 'malicious_content' as const,
        severity: result.securityRisk || 'medium' as const,
        content: content.substring(0, 100) + '...',
        action: 'blocked' as const
      };
      
      setSecurityAlerts(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts
      
      toast({
        title: "Security Alert",
        description: "Potentially malicious content detected and blocked",
        variant: "destructive"
      });
      
      return false;
    }
    
    if (result.warnings.length > 0) {
      const alert = {
        timestamp: new Date(),
        type: 'suspicious_pattern' as const,
        severity: 'low' as const,
        content: content.substring(0, 100) + '...',
        action: 'flagged' as const
      };
      
      setSecurityAlerts(prev => [alert, ...prev.slice(0, 99)]);
    }
    
    return true;
  }, [toast]);
  
  const getSecuritySummary = useCallback(() => {
    const last24Hours = securityAlerts.filter(
      alert => alert.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    return {
      totalAlerts: securityAlerts.length,
      alertsLast24Hours: last24Hours.length,
      criticalAlerts: securityAlerts.filter(a => a.severity === 'critical').length,
      blockedContent: securityAlerts.filter(a => a.action === 'blocked').length
    };
  }, [securityAlerts]);
  
  return {
    validateSecurity,
    securityAlerts,
    securitySummary: getSecuritySummary()
  };
}

// Comprehensive healthcare validation hook (combines all features)
export function useComprehensiveHealthcareValidation() {
  const contentValidation = useRealTimeContentValidation();
  const complianceMonitoring = useAHPRAComplianceMonitoring();
  const dataSanitization = useHealthcareDataSanitization();
  const securityValidation = useHealthcareSecurityValidation();
  
  const validateAndSanitize = useCallback(async (data: any, type: string) => {
    // 1. Sanitize data first
    const sanitizedData = dataSanitization.sanitizeData(data);
    
    // 2. Security validation
    if (typeof sanitizedData === 'string') {
      const isSecure = securityValidation.validateSecurity(sanitizedData);
      if (!isSecure) {
        throw new Error('Content failed security validation');
      }
    }
    
    // 3. AHPRA compliance check for content
    if (type === 'patient_content' && sanitizedData.content) {
      const complianceResult = await complianceMonitoring.checkCompliance(sanitizedData.content);
      if (complianceResult.riskLevel === 'critical') {
        throw new Error('Content violates AHPRA guidelines');
      }
    }
    
    return sanitizedData;
  }, [dataSanitization, securityValidation, complianceMonitoring]);
  
  const getOverallHealthScore = useCallback(() => {
    const complianceScore = complianceMonitoring.complianceScore;
    const securityScore = Math.max(0, 100 - (securityValidation.securitySummary.criticalAlerts * 10));
    const sanitizationScore = dataSanitization.sanitizationStats.averageChangeRate < 20 ? 100 : 80;
    
    return Math.round((complianceScore + securityScore + sanitizationScore) / 3);
  }, [complianceMonitoring.complianceScore, securityValidation.securitySummary, dataSanitization.sanitizationStats]);
  
  return {
    contentValidation,
    complianceMonitoring,
    dataSanitization,
    securityValidation,
    validateAndSanitize,
    overallHealthScore: getOverallHealthScore()
  };
} 