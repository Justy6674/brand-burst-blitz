import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Check, 
  Globe, 
  Users, 
  Settings 
} from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { CreateBusinessProfileDialog } from './CreateBusinessProfileDialog';

interface BusinessSwitcherProps {
  className?: string;
}

export const BusinessSwitcher: React.FC<BusinessSwitcherProps> = ({ className }) => {
  const { businessProfiles, isLoading } = useBusinessProfile();
  const [activeProfile, setActiveProfile] = useState(businessProfiles?.[0] || null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getIndustryIcon = (industry: string | null) => {
    switch (industry) {
      case 'technology':
        return '💻';
      case 'healthcare':
        return '🏥';
      case 'retail':
        return '🛍️';
      case 'finance':
        return '💰';
      case 'education':
        return '📚';
      case 'hospitality':
        return '🏨';
      case 'legal':
        return '⚖️';
      case 'real_estate':
        return '🏢';
      case 'automotive':
        return '🚗';
      case 'beauty':
        return '💄';
      case 'fitness':
        return '💪';
      case 'food_beverage':
        return '🍕';
      case 'trades':
        return '🔨';
      case 'professional_services':
        return '💼';
      case 'non_profit':
        return '❤️';
      default:
        return '🏢';
    }
  };

  const formatIndustry = (industry: string | null) => {
    if (!industry) return 'General Business';
    return industry.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-1">
          <div className="w-24 h-4 bg-muted animate-pulse rounded" />
          <div className="w-16 h-3 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!businessProfiles?.length) {
    return (
      <div className={className}>
        <Button 
          variant="outline" 
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Business Profile
        </Button>
        <CreateBusinessProfileDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  const currentBusiness = activeProfile || businessProfiles[0];

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 h-auto p-2 min-w-0 w-full justify-start hover:bg-accent transition-colors"
          >
            <Avatar className="w-8 h-8 rounded-lg">
              <AvatarImage src={currentBusiness.logo_url || undefined} />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm">
                {getInitials(currentBusiness.business_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-center gap-2 max-w-full">
                <span className="font-medium text-sm truncate max-w-[120px]">
                  {currentBusiness.business_name}
                </span>
                {currentBusiness.is_primary && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{getIndustryIcon(currentBusiness.industry)}</span>
                <span className="truncate max-w-[100px]">
                  {formatIndustry(currentBusiness.industry)}
                </span>
              </div>
            </div>
            
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-80 bg-background border z-50">{/* Fixed dropdown transparency and z-index */}
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2 px-2">
              Business Profiles ({businessProfiles.length})
            </div>
            
            {businessProfiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => setActiveProfile(profile)}
                className="p-0 mb-1"
              >
                <Card className="w-full border-0 shadow-none">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 rounded-lg">
                        <AvatarImage src={profile.logo_url || undefined} />
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                          {getInitials(profile.business_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {profile.business_name}
                          </span>
                          {profile.is_primary && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              Primary
                            </Badge>
                          )}
                          {activeProfile?.id === profile.id && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>{getIndustryIcon(profile.industry)}</span>
                            <span>{formatIndustry(profile.industry)}</span>
                          </div>
                          
                          {profile.website_url && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[80px]">
                                {profile.website_url.replace(/^https?:\/\//, '')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DropdownMenuItem>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 p-3"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Business</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-2 p-3">
            <Settings className="w-4 h-4" />
            <span>Manage Businesses</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <CreateBusinessProfileDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};