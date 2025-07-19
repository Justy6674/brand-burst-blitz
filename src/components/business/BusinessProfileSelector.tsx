import React from 'react';
import { Check, ChevronDown, Plus, Building2, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { CreateBusinessProfileDialog } from './CreateBusinessProfileDialog';

export const BusinessProfileSelector: React.FC = () => {
  const { activeProfile, allProfiles, switchProfile } = useBusinessProfileContext();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  if (!activeProfile && allProfiles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Business
        </Button>
        <CreateBusinessProfileDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
        />
      </div>
    );
  }

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
      case 'tech':
        return <Globe className="h-3 w-3" />;
      case 'health':
        return <Building2 className="h-3 w-3" />;
      default:
        return <Palette className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 h-auto"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={activeProfile?.favicon_url || activeProfile?.logo_url || ''} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {activeProfile ? getInitials(activeProfile.business_name) : 'B'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate max-w-32">
                {activeProfile?.business_name || 'No Business'}
              </span>
              {activeProfile?.industry && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getIndustryIcon(activeProfile.industry)}
                  <span className="capitalize">{activeProfile.industry}</span>
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Business Profiles
            <Badge variant="secondary" className="text-xs">
              {allProfiles.length} {allProfiles.length === 1 ? 'business' : 'businesses'}
            </Badge>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {allProfiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => switchProfile(profile.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.favicon_url || profile.logo_url || ''} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(profile.business_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{profile.business_name}</span>
                  {profile.is_primary && (
                    <Badge variant="secondary" className="text-xs">Primary</Badge>
                  )}
                  {activeProfile?.id === profile.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {profile.industry && (
                    <div className="flex items-center gap-1">
                      {getIndustryIcon(profile.industry)}
                      <span className="capitalize">{profile.industry}</span>
                    </div>
                  )}
                  {profile.website_url && (
                    <span className="truncate max-w-32">{profile.website_url}</span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer text-primary"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Business</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <CreateBusinessProfileDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
};