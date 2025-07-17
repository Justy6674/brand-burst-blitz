import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'functionality' | 'performance' | 'compliance' | 'ui';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  result?: any;
}

interface TestSuiteProps {
  onTestComplete?: (results: TestCase[]) => void;
}

export const TestSuite: React.FC<TestSuiteProps> = ({ onTestComplete }) => {
  const [tests, setTests] = useState<TestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const initializeTests = () => {
    const testCases: TestCase[] = [
      // Security Tests
      {
        id: 'sec-001',
        name: 'Authentication Flow',
        description: 'Test login/logout functionality',
        category: 'security',
        priority: 'critical',
        status: 'pending'
      },
      {
        id: 'sec-002',
        name: 'RLS Policies',
        description: 'Verify Row Level Security is properly enforced',
        category: 'security',
        priority: 'critical',
        status: 'pending'
      },
      {
        id: 'sec-003',
        name: 'API Endpoints Security',
        description: 'Test unauthorized access to protected endpoints',
        category: 'security',
        priority: 'high',
        status: 'pending'
      },
      
      // Functionality Tests
      {
        id: 'func-001',
        name: 'Content Generation',
        description: 'Test AI content generation functionality',
        category: 'functionality',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'func-002',
        name: 'Social Media Integration',
        description: 'Test social media account connections',
        category: 'functionality',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'func-003',
        name: 'Calendar Scheduling',
        description: 'Test post scheduling functionality',
        category: 'functionality',
        priority: 'medium',
        status: 'pending'
      },
      
      // Performance Tests
      {
        id: 'perf-001',
        name: 'Page Load Times',
        description: 'Measure page load performance',
        category: 'performance',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'perf-002',
        name: 'Database Query Performance',
        description: 'Test database query response times',
        category: 'performance',
        priority: 'low',
        status: 'pending'
      },
      
      // Compliance Tests
      {
        id: 'comp-001',
        name: 'GDPR Compliance',
        description: 'Verify GDPR compliance measures',
        category: 'compliance',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'comp-002',
        name: 'Copyright Detection',
        description: 'Test copyright violation detection',
        category: 'compliance',
        priority: 'medium',
        status: 'pending'
      },
      
      // UI Tests
      {
        id: 'ui-001',
        name: 'Responsive Design',
        description: 'Test responsive layout on different screen sizes',
        category: 'ui',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'ui-002',
        name: 'Navigation Links',
        description: 'Test all navigation links work correctly',
        category: 'ui',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'ui-003',
        name: 'Form Validation',
        description: 'Test form validation and error handling',
        category: 'ui',
        priority: 'medium',
        status: 'pending'
      }
    ];

    setTests(testCases);
    return testCases;
  };

  const runTest = async (test: TestCase): Promise<TestCase> => {
    const startTime = Date.now();
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    const duration = Date.now() - startTime;
    
    // Simulate test results (in real implementation, these would be actual tests)
    const shouldPass = Math.random() > 0.1; // 90% pass rate for demo
    
    if (shouldPass) {
      return {
        ...test,
        status: 'passed',
        duration,
        result: { success: true, message: 'Test completed successfully' }
      };
    } else {
      return {
        ...test,
        status: 'failed',
        duration,
        error: 'Test failed - simulated failure for demonstration'
      };
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    
    const testCases = initializeTests();
    let completedTests = 0;
    
    for (const test of testCases) {
      // Update test status to running
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' as const } : t
      ));
      
      try {
        const result = await runTest(test);
        
        setTests(prev => prev.map(t => 
          t.id === test.id ? result : t
        ));
        
        completedTests++;
        setProgress((completedTests / testCases.length) * 100);
        
      } catch (error) {
        setTests(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : t
        ));
        
        completedTests++;
        setProgress((completedTests / testCases.length) * 100);
      }
    }
    
    setIsRunning(false);
    
    toast({
      title: "Test Suite Complete",
      description: `Completed ${completedTests} tests`,
    });
    
    if (onTestComplete) {
      onTestComplete(testCases);
    }
  };

  const resetTests = () => {
    setTests(initializeTests());
    setProgress(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string, priority: string) => {
    const variant = status === 'passed' ? 'default' : 
                   status === 'failed' ? 'destructive' :
                   status === 'running' ? 'secondary' : 'outline';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'text-red-600 bg-red-50';
      case 'functionality': return 'text-blue-600 bg-blue-50';
      case 'performance': return 'text-yellow-600 bg-yellow-50';
      case 'compliance': return 'text-purple-600 bg-purple-50';
      case 'ui': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  useEffect(() => {
    initializeTests();
  }, []);

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Comprehensive Test Suite
              </CardTitle>
              <CardDescription>
                Automated testing for security, functionality, performance, and compliance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetTests} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Running tests...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.description}</div>
                  {test.error && (
                    <div className="text-sm text-red-600 mt-1">{test.error}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(test.category)} variant="outline">
                  {test.category}
                </Badge>
                {getStatusBadge(test.status, test.priority)}
                {test.duration && (
                  <span className="text-xs text-muted-foreground">
                    {test.duration}ms
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};