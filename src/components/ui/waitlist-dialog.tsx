import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus } from 'lucide-react';

interface WaitlistDialogProps {
  children: React.ReactNode;
  triggerClassName?: string;
}

export const WaitlistDialog = ({ children, triggerClassName }: WaitlistDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    industry: 'health',
    additional_notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('interest_registrations')
        .insert({
          name: formData.name,
          email: formData.email,
          business_name: formData.business_name,
          industry: formData.industry,
          additional_notes: formData.additional_notes,
          is_australian: true,
          wants_updates: true
        });

      if (error) throw error;

      toast({
        title: "Welcome to the Waitlist!",
        description: "Thank you for your interest. We'll be in touch soon with exclusive early access.",
      });

      setOpen(false);
      setFormData({
        name: '',
        email: '',
        business_name: '',
        industry: 'health',
        additional_notes: ''
      });
    } catch (error) {
      console.error('Error registering for waitlist:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={triggerClassName}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join Healthcare Professionals Waitlist
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="jane@clinic.com.au"
              />
            </div>
            <div>
              <Label htmlFor="business_name">Practice/Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                required
                placeholder="Melbourne Family Clinic"
              />
            </div>
            <div>
              <Label htmlFor="additional_notes">Tell us about your marketing needs (optional)</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                placeholder="What marketing challenges are you facing? What features interest you most?"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-primary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Waitlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};