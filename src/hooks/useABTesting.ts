import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: ABVariant[];
  traffic_split: number;
  start_date?: string;
  end_date?: string;
  goal_metric: string;
  confidence_level: number;
  created_at: string;
  updated_at: string;
}

interface ABVariant {
  id: string;
  name: string;
  content: any;
  traffic_percentage: number;
  conversions: number;
  impressions: number;
  conversion_rate: number;
}

interface ABTestResult {
  variant_id: string;
  user_id: string;
  conversion: boolean;
  timestamp: string;
  metadata?: any;
}

export const useABTesting = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeVariants, setActiveVariants] = useState<{ [testId: string]: string }>({});
  const { toast } = useToast();
  const { handleAsyncError } = useErrorHandler();

  const fetchTests = useCallback(async () => {
    return handleAsyncError(async () => {
      setIsLoading(true);
      
      // For now, return mock data since we haven't implemented the full AB testing tables
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Content Generation CTA Test',
          description: 'Testing different call-to-action buttons for content generation',
          status: 'active',
          variants: [
            {
              id: 'v1',
              name: 'Generate Now',
              content: { button_text: 'Generate Now', color: 'primary' },
              traffic_percentage: 50,
              conversions: 120,
              impressions: 1000,
              conversion_rate: 12.0
            },
            {
              id: 'v2',
              name: 'Create Content',
              content: { button_text: 'Create Content', color: 'secondary' },
              traffic_percentage: 50,
              conversions: 105,
              impressions: 980,
              conversion_rate: 10.7
            }
          ],
          traffic_split: 100,
          goal_metric: 'content_generation_clicks',
          confidence_level: 95,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setTests(mockTests);
      return mockTests;
    }, {
      function_name: 'fetchTests',
      user_message: 'Failed to fetch A/B tests'
    }).finally(() => {
      setIsLoading(false);
    });
  }, [handleAsyncError]);

  const createTest = useCallback(async (testData: Partial<ABTest>): Promise<ABTest | null> => {
    return handleAsyncError(async () => {
      // Mock implementation - in real app would create database record
      const newTest: ABTest = {
        id: Date.now().toString(),
        name: testData.name || 'Untitled Test',
        description: testData.description || '',
        status: 'draft',
        variants: testData.variants || [],
        traffic_split: testData.traffic_split || 50,
        goal_metric: testData.goal_metric || 'clicks',
        confidence_level: testData.confidence_level || 95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTests(prev => [...prev, newTest]);
      toast({
        title: "A/B Test Created",
        description: "Your test has been created successfully"
      });

      return newTest;
    }, {
      function_name: 'createTest',
      user_message: 'Failed to create A/B test'
    });
  }, [handleAsyncError, toast]);

  const getVariantForUser = useCallback((testId: string, userId: string): string => {
    // Simple hash-based assignment for consistent user experience
    if (activeVariants[testId]) {
      return activeVariants[testId];
    }

    const test = tests.find(t => t.id === testId && t.status === 'active');
    if (!test || test.variants.length === 0) {
      return '';
    }

    // Use user ID hash to consistently assign variant
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const random = Math.abs(hash) % 100;
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.traffic_percentage;
      if (random < cumulative) {
        setActiveVariants(prev => ({ ...prev, [testId]: variant.id }));
        return variant.id;
      }
    }

    return test.variants[0].id;
  }, [tests, activeVariants]);

  const recordConversion = useCallback(async (testId: string, variantId: string, userId: string, conversion: boolean = true) => {
    return handleAsyncError(async () => {
      // In real implementation, would record to database
      console.log('Recording conversion:', { testId, variantId, userId, conversion });
      
      // Update local state
      setTests(prev => prev.map(test => {
        if (test.id === testId) {
          return {
            ...test,
            variants: test.variants.map(variant => {
              if (variant.id === variantId) {
                return {
                  ...variant,
                  impressions: variant.impressions + 1,
                  conversions: conversion ? variant.conversions + 1 : variant.conversions,
                  conversion_rate: ((conversion ? variant.conversions + 1 : variant.conversions) / (variant.impressions + 1)) * 100
                };
              }
              return variant;
            })
          };
        }
        return test;
      }));
    }, {
      function_name: 'recordConversion',
      user_message: 'Failed to record conversion'
    });
  }, [handleAsyncError]);

  const pauseTest = useCallback(async (testId: string) => {
    return handleAsyncError(async () => {
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: 'paused' as const } : test
      ));
      
      toast({
        title: "Test Paused",
        description: "A/B test has been paused"
      });
    }, {
      function_name: 'pauseTest',
      user_message: 'Failed to pause test'
    });
  }, [handleAsyncError, toast]);

  const resumeTest = useCallback(async (testId: string) => {
    return handleAsyncError(async () => {
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: 'active' as const } : test
      ));
      
      toast({
        title: "Test Resumed",
        description: "A/B test has been resumed"
      });
    }, {
      function_name: 'resumeTest',
      user_message: 'Failed to resume test'
    });
  }, [handleAsyncError, toast]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return {
    tests,
    isLoading,
    createTest,
    getVariantForUser,
    recordConversion,
    pauseTest,
    resumeTest,
    refreshTests: fetchTests
  };
};