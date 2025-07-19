import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Rocket, Star, X, Mail, Building, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ComingSoonPopupProps {
  trigger: React.ReactElement;
}

export const ComingSoonPopup: React.FC<ComingSoonPopupProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    industry: '',
    additionalNotes: ''
  });
  const { toast } = useToast();

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('interest_registrations')
        .insert({
          name: formData.name,
          email: formData.email,
          business_name: formData.businessName,
          industry: formData.industry || null,
          additional_notes: formData.additionalNotes || null,
          is_australian: true, // Since this is for Australian businesses
          wants_updates: true,
          primary_goals: ['Early access to JB-SaaS platform'],
          heard_about_us: 'Website waitlist'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome to early access!",
        description: "You're now registered for early access. We'll be in touch soon with your account details.",
      });

      // Reset form and close popup
      setFormData({
        name: '',
        email: '',
        businessName: '',
        industry: '',
        additionalNotes: ''
      });
      setShowWaitlistForm(false);
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerWithProps = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      setIsOpen(true);
      setShowWaitlistForm(false); // Reset to main view
    }
  });

  return (
    <>
      {triggerWithProps}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto border-0 sm:border p-4 sm:p-6 rounded-lg sm:rounded-xl w-[calc(100vw-16px)] sm:w-auto">
          {!showWaitlistForm ? (
            // Main Coming Soon View
            <>
              <DialogHeader className="space-y-6 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4 p-2 h-8 w-8 sm:h-6 sm:w-6 z-50 bg-background/80 hover:bg-background rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 sm:h-3 sm:w-3" />
                </Button>
                
                <div className="space-y-4">
                  <Badge className="bg-gradient-primary text-primary-foreground px-6 py-2 text-lg">
                    <Rocket className="w-5 h-5 mr-2" />
                    Early Access Available
                  </Badge>
                  
                  <DialogTitle className="text-3xl md:text-4xl font-bold">
                    Australia's Most Advanced <br />
                    <span className="text-gradient-primary">AI Marketing Platform</span>
                  </DialogTitle>
                  
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Australia's most comprehensive business automation and content management platform. Join thousands of Australian businesses getting early access to our AI-powered marketing tools.
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
                        <span className="text-muted-foreground">Early Access</span>
                        <Badge variant="secondary">Available Now</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Full Platform</span>
                        <Badge className="bg-gradient-primary text-primary-foreground">Coming Soon</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Early Bird Pricing</span>
                        <Badge variant="outline">Limited Time</Badge>
                      </div>
                    </div>
                </div>
                
                <div className="text-center space-y-4">
                  <h4 className="font-bold text-foreground">Get early access to JB-SaaS</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg" 
                      className="flex-1 bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform"
                      onClick={() => setShowWaitlistForm(true)}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Join Priority Waitlist
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowWaitlistForm(true)}
                    >
                      Get Launch Updates
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Join <strong>2,847+ Australian businesses</strong> already on our waitlist
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Waitlist Form View
            <>
              <DialogHeader className="relative">
                {/* Single close button - consolidated functionality */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4 p-2 h-8 w-8 sm:h-6 sm:w-6 z-50 bg-background/80 hover:bg-background rounded-full"
                  onClick={() => {
                    setShowWaitlistForm(false);
                    setIsOpen(false);
                  }}
                >
                  <X className="h-4 w-4 sm:h-3 sm:w-3" />
                </Button>
                
                {/* Back button for larger screens only */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:block absolute left-4 top-4 p-2 h-6 w-6 hover:bg-muted rounded-full"
                  onClick={() => setShowWaitlistForm(false)}
                >
                  ←
                </Button>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-center pt-2 sm:pt-0">
                  Join the Priority Waitlist
                </DialogTitle>
                <p className="text-sm sm:text-base text-muted-foreground text-center px-4 sm:px-0">
                  Get early access and exclusive launch pricing for Australian businesses
                </p>
              </DialogHeader>

              <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-6 px-4 sm:px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="w-4 h-4 inline mr-1" />
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="john@business.com.au"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    <Building className="w-4 h-4 inline mr-1" />
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                    placeholder="Your Australian Business Pty Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Healthcare, Finance, Retail"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">What are you most excited about? (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Tell us what features you're looking forward to..."
                    rows={3}
                  />
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-semibold mb-2 text-primary">🇦🇺 Australian Business Priority</h4>
                  <p className="text-sm text-muted-foreground">
                    As an Australian business, you'll get priority access, local support, and special launch pricing.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-primary-foreground" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Joining Waitlist...</>
                  ) : (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Join Priority Waitlist
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};