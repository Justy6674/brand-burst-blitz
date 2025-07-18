import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Rocket, Star, X } from 'lucide-react';

interface ComingSoonPopupProps {
  trigger: React.ReactElement;
}

export const ComingSoonPopup: React.FC<ComingSoonPopupProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerWithProps = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      setIsOpen(true);
    }
  });

  return (
    <>
      {triggerWithProps}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 p-0 h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="space-y-4">
              <Badge className="bg-gradient-primary text-primary-foreground px-6 py-2 text-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Coming August 2025
              </Badge>
              
              <DialogTitle className="text-3xl md:text-4xl font-bold">
                Australia's Most Advanced <br />
                <span className="text-gradient-primary">AI Marketing Platform</span>
              </DialogTitle>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                We're putting the finishing touches on Australia's most comprehensive business automation and content management platform. Join thousands of Australian businesses already on our waitlist.
              </p>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 mt-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">AI-Powered</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <div className="text-2xl font-bold text-secondary mb-1">10+</div>
                <div className="text-sm text-muted-foreground">Enterprise Features</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="text-2xl font-bold text-accent mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Platform Access</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-xl font-bold">Launch Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Beta Testing</span>
                  <Badge variant="secondary">June 2025</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Public Launch</span>
                  <Badge className="bg-gradient-primary text-primary-foreground">August 2025</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Early Bird Pricing</span>
                  <Badge variant="outline">Limited Time</Badge>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="font-bold text-foreground">Be the first to know when we launch</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform"
                  onClick={() => setIsOpen(false)}
                >
                  <Star className="w-5 h-5 mr-2" />
                  Join Priority Waitlist
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Get Launch Updates
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Join <strong>2,847+ Australian businesses</strong> already on our waitlist
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};