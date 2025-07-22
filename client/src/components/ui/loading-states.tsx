import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Shield, 
  FileText, 
  Users, 
  Calendar, 
  Database, 
  Upload, 
  Download, 
  CheckCircle, 
  Clock,
  Wifi,
  Brain,
  Heart,
  Activity,
  Stethoscope,
  FileCheck,
  Search,
  Settings,
  Mail,
  Phone,
  Globe,
  Lock,
  RefreshCw
} from 'lucide-react';

// Loading state types
export type LoadingType = 
  | 'spinner'
  | 'skeleton'
  | 'progress'
  | 'pulse'
  | 'dots'
  | 'healthcare'
  | 'compliance'
  | 'upload'
  | 'download'
  | 'search'
  | 'analysis';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingStateProps {
  type?: LoadingType;
  size?: LoadingSize;
  message?: string;
  progress?: number;
  className?: string;
  showProgress?: boolean;
  estimatedTime?: string;
  context?: string;
}

// Healthcare-specific loading contexts
export interface HealthcareLoadingProps extends LoadingStateProps {
  operation: 'compliance-check' | 'patient-data' | 'appointment-sync' | 'ahpra-validation' | 
            'tga-review' | 'cultural-consultation' | 'practice-integration' | 'backup-restore' |
            'security-scan' | 'audit-log' | 'mfa-setup' | 'video-tutorial' | 'content-generation';
  sensitive?: boolean;
  complianceLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Size configurations
const sizeConfig = {
  sm: { spinner: 'h-4 w-4', card: 'h-16', text: 'text-sm' },
  md: { spinner: 'h-6 w-6', card: 'h-24', text: 'text-base' },
  lg: { spinner: 'h-8 w-8', card: 'h-32', text: 'text-lg' },
  xl: { spinner: 'h-12 w-12', card: 'h-40', text: 'text-xl' }
};

// Basic spinner loader
export const LoadingSpinner: React.FC<LoadingStateProps> = ({
  size = 'md',
  message = 'Loading...',
  className = ''
}) => {
  const config = sizeConfig[size];
  
  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <Loader2 className={`${config.spinner} animate-spin text-blue-600`} />
      <span className={`${config.text} text-gray-600`}>{message}</span>
    </div>
  );
};

// Animated dots loader
export const LoadingDots: React.FC<LoadingStateProps> = ({
  message = 'Processing',
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-gray-600">{message}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

// Progress bar loader
export const LoadingProgress: React.FC<LoadingStateProps> = ({
  progress = 0,
  message = 'Loading...',
  estimatedTime,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{message}</span>
        {estimatedTime && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {estimatedTime}
          </Badge>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-xs text-gray-500 text-center">{progress}% complete</div>
    </div>
  );
};

// Skeleton loader for content
export const LoadingSkeleton: React.FC<{
  rows?: number;
  showAvatar?: boolean;
  showHeader?: boolean;
  className?: string;
}> = ({
  rows = 3,
  showAvatar = false,
  showHeader = false,
  className = ''
}) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {showHeader && (
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
      
      <div className="flex space-x-4">
        {showAvatar && <div className="h-12 w-12 bg-gray-200 rounded-full"></div>}
        <div className="flex-1 space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 rounded ${
                i === rows - 1 ? 'w-2/3' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Card skeleton loader
export const LoadingCardSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className = '' }) => {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Healthcare-specific loading component
export const HealthcareLoading: React.FC<HealthcareLoadingProps> = ({
  operation,
  sensitive = false,
  complianceLevel = 'medium',
  progress,
  estimatedTime,
  className = ''
}) => {
  const getOperationConfig = () => {
    switch (operation) {
      case 'compliance-check':
        return {
          icon: <Shield className="h-6 w-6 text-red-600" />,
          title: 'AHPRA Compliance Check',
          description: 'Validating content against professional advertising guidelines',
          color: 'border-red-200 bg-red-50'
        };
      
      case 'patient-data':
        return {
          icon: <Heart className="h-6 w-6 text-blue-600" />,
          title: 'Patient Data Processing',
          description: sensitive ? 'Processing sensitive health information securely' : 'Loading patient information',
          color: 'border-blue-200 bg-blue-50'
        };
      
      case 'appointment-sync':
        return {
          icon: <Calendar className="h-6 w-6 text-green-600" />,
          title: 'Appointment Synchronisation',
          description: 'Syncing appointments with practice management system',
          color: 'border-green-200 bg-green-50'
        };
      
      case 'ahpra-validation':
        return {
          icon: <FileCheck className="h-6 w-6 text-purple-600" />,
          title: 'AHPRA Registration Validation',
          description: 'Verifying professional registration details',
          color: 'border-purple-200 bg-purple-50'
        };
      
      case 'tga-review':
        return {
          icon: <Stethoscope className="h-6 w-6 text-indigo-600" />,
          title: 'TGA Compliance Review',
          description: 'Reviewing medical device promotional content',
          color: 'border-indigo-200 bg-indigo-50'
        };
      
      case 'cultural-consultation':
        return {
          icon: <Users className="h-6 w-6 text-orange-600" />,
          title: 'Cultural Safety Consultation',
          description: 'Requesting Indigenous health cultural review',
          color: 'border-orange-200 bg-orange-50'
        };
      
      case 'practice-integration':
        return {
          icon: <Settings className="h-6 w-6 text-gray-600" />,
          title: 'Practice Management Integration',
          description: 'Connecting with practice management system',
          color: 'border-gray-200 bg-gray-50'
        };
      
      case 'backup-restore':
        return {
          icon: <Database className="h-6 w-6 text-blue-600" />,
          title: 'Data Backup & Restore',
          description: 'Securing healthcare data with encrypted backup',
          color: 'border-blue-200 bg-blue-50'
        };
      
      case 'security-scan':
        return {
          icon: <Lock className="h-6 w-6 text-red-600" />,
          title: 'Security Compliance Scan',
          description: 'Performing healthcare data security audit',
          color: 'border-red-200 bg-red-50'
        };
      
      case 'audit-log':
        return {
          icon: <FileText className="h-6 w-6 text-yellow-600" />,
          title: 'Audit Log Processing',
          description: 'Recording healthcare compliance activities',
          color: 'border-yellow-200 bg-yellow-50'
        };
      
      case 'mfa-setup':
        return {
          icon: <Phone className="h-6 w-6 text-green-600" />,
          title: 'Multi-Factor Authentication Setup',
          description: 'Configuring additional security for healthcare data',
          color: 'border-green-200 bg-green-50'
        };
      
      case 'video-tutorial':
        return {
          icon: <Activity className="h-6 w-6 text-blue-600" />,
          title: 'Healthcare Training Content',
          description: 'Loading professional development materials',
          color: 'border-blue-200 bg-blue-50'
        };
      
      case 'content-generation':
        return {
          icon: <Brain className="h-6 w-6 text-purple-600" />,
          title: 'AI Content Generation',
          description: 'Creating AHPRA-compliant healthcare content',
          color: 'border-purple-200 bg-purple-50'
        };
      
      default:
        return {
          icon: <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />,
          title: 'Processing',
          description: 'Healthcare operation in progress',
          color: 'border-gray-200 bg-gray-50'
        };
    }
  };

  const config = getOperationConfig();
  const getComplianceBadge = () => {
    switch (complianceLevel) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low': return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <Card className={`${config.color} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 text-lg">
            {config.icon}
            <span>{config.title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getComplianceBadge()}
            {estimatedTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {estimatedTime}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {progress !== undefined ? (
          <LoadingProgress 
            progress={progress} 
            message="Processing healthcare data..."
            estimatedTime={estimatedTime}
          />
        ) : (
          <LoadingDots message="Processing healthcare data" />
        )}
        
        {sensitive && (
          <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
            <Lock className="h-3 w-3" />
            <span>Sensitive healthcare data - encrypted processing</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Upload/Download progress loader
export const FileTransferLoading: React.FC<{
  type: 'upload' | 'download';
  fileName: string;
  progress: number;
  fileSize?: string;
  className?: string;
}> = ({ type, fileName, progress, fileSize, className = '' }) => {
  const Icon = type === 'upload' ? Upload : Download;
  
  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon className="h-5 w-5 text-blue-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
          </div>
          <Badge variant="outline">{progress}%</Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{type === 'upload' ? 'Uploading...' : 'Downloading...'}</span>
          <span>{progress === 100 ? 'Complete' : 'In progress'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Search loading state
export const SearchLoading: React.FC<{
  query: string;
  context?: 'patients' | 'appointments' | 'content' | 'compliance';
  className?: string;
}> = ({ query, context = 'content', className = '' }) => {
  const getContextConfig = () => {
    switch (context) {
      case 'patients': return { icon: Heart, color: 'text-blue-600' };
      case 'appointments': return { icon: Calendar, color: 'text-green-600' };
      case 'compliance': return { icon: Shield, color: 'text-red-600' };
      default: return { icon: Search, color: 'text-gray-600' };
    }
  };
  
  const { icon: Icon, color } = getContextConfig();
  
  return (
    <div className={`flex items-center space-x-3 p-4 border rounded-lg ${className}`}>
      <Icon className={`h-5 w-5 ${color} animate-pulse`} />
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          Searching for "{query}"...
        </p>
        <LoadingDots message="Analysing healthcare data" />
      </div>
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<{
  message?: string;
  progress?: number;
  healthcare?: boolean;
  className?: string;
}> = ({ 
  message = 'Loading...', 
  progress, 
  healthcare = false,
  className = '' 
}) => {
  return (
    <div className={`fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
      <Card className="w-96 max-w-md mx-4">
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-6">
            {healthcare ? (
              <div className="flex justify-center">
                <div className="relative">
                  <Heart className="h-12 w-12 text-red-400 animate-pulse" />
                  <div className="absolute inset-0 h-12 w-12 border-4 border-red-200 rounded-full animate-spin border-t-red-600"></div>
                </div>
              </div>
            ) : (
              <LoadingSpinner size="xl" message="" />
            )}
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
              {healthcare && (
                <p className="text-sm text-gray-600">
                  Processing healthcare data securely
                </p>
              )}
            </div>
            
            {progress !== undefined && (
              <LoadingProgress 
                progress={progress} 
                message=""
                showProgress
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Table loading skeleton
export const TableLoadingSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showHeader && (
        <div className="flex space-x-4 mb-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard loading state
export const DashboardLoading: React.FC<{
  sections?: number;
  healthcare?: boolean;
  className?: string;
}> = ({ 
  sections = 4, 
  healthcare = false,
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: sections }).map((_, i) => (
          <LoadingCardSkeleton key={i} count={1} />
        ))}
      </div>
      
      {healthcare && (
        <div className="text-center py-4">
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Loading healthcare dashboard securely
          </Badge>
        </div>
      )}
    </div>
  );
}; 