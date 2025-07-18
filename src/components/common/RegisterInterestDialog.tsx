import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, X, Loader2, Sparkles } from "lucide-react";

interface RegisterInterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  businessName: string;
  industry: string;
  isAustralian: boolean;
  currentChallenges: string[];
  monthlyMarketingSpend: string;
  teamSize: string;
  primaryGoals: string[];
  wantsUpdates: boolean;
  heardAboutUs: string;
  additionalNotes: string;
}

const industries = [
  "Health & Wellness", "Finance & Insurance", "Legal Services", "Real Estate",
  "Fitness & Nutrition", "Beauty & Cosmetics", "Technology", "Construction",
  "Retail & E-commerce", "Professional Services", "Hospitality & Tourism",
  "Education & Training", "Manufacturing", "Other"
];

const challenges = [
  "Finding time for content creation",
  "Maintaining brand consistency",
  "Generating engaging content ideas",
  "Managing multiple social platforms",
  "Measuring content performance",
  "Creating professional visuals",
  "Writing compelling copy",
  "Scheduling and automation"
];

const goals = [
  "Increase social media engagement",
  "Generate more leads",
  "Build brand awareness",
  "Save time on content creation",
  "Improve content quality",
  "Expand to new platforms",
  "Better ROI from marketing spend",
  "Automate marketing processes"
];

export function RegisterInterestDialog({ open, onOpenChange }: RegisterInterestDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    businessName: "",
    industry: "",
    isAustralian: false,
    currentChallenges: [],
    monthlyMarketingSpend: "",
    teamSize: "",
    primaryGoals: [],
    wantsUpdates: true,
    heardAboutUs: "",
    additionalNotes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      currentChallenges: prev.currentChallenges.includes(challenge)
        ? prev.currentChallenges.filter(c => c !== challenge)
        : [...prev.currentChallenges, challenge]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save interest registration via edge function
      const { error } = await supabase.functions.invoke('save-interest', {
        body: formData
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Interest Registered! 🎉",
        description: "Thanks for your interest! We'll contact you before our August 2025 launch.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again or contact us directly at jbsaasai@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      businessName: "",
      industry: "",
      isAustralian: false,
      currentChallenges: [],
      monthlyMarketingSpend: "",
      teamSize: "",
      primaryGoals: [],
      wantsUpdates: true,
      heardAboutUs: "",
      additionalNotes: ""
    });
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Thanks for registering! 🎉</h3>
            <p className="text-muted-foreground mb-6">
              We'll keep you updated on our August 2025 launch and send you early access information.
            </p>
            <Button 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Sparkles className="w-6 h-6 text-primary mr-2" />
            Register Your Interest - Launching August 2025
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📋 Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
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
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAustralian"
                checked={formData.isAustralian}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isAustralian: checked as boolean }))
                }
              />
              <Label htmlFor="isAustralian" className="font-medium">
                🇦🇺 This is an Australian business *
              </Label>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">💼 Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Just me (Solo)</SelectItem>
                    <SelectItem value="2-5">2-5 people</SelectItem>
                    <SelectItem value="6-15">6-15 people</SelectItem>
                    <SelectItem value="16-50">16-50 people</SelectItem>
                    <SelectItem value="51+">51+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="monthlySpend">Monthly Marketing Spend</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, monthlyMarketingSpend: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select monthly marketing spend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$0-500">$0 - $500</SelectItem>
                  <SelectItem value="$500-2000">$500 - $2,000</SelectItem>
                  <SelectItem value="$2000-5000">$2,000 - $5,000</SelectItem>
                  <SelectItem value="$5000-15000">$5,000 - $15,000</SelectItem>
                  <SelectItem value="$15000+">$15,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Challenges */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">🎯 Current Marketing Challenges</h3>
            <p className="text-sm text-muted-foreground">Select all that apply:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {challenges.map(challenge => (
                <div key={challenge} className="flex items-center space-x-2">
                  <Checkbox
                    id={challenge}
                    checked={formData.currentChallenges.includes(challenge)}
                    onCheckedChange={() => handleChallengeToggle(challenge)}
                  />
                  <Label htmlFor={challenge} className="text-sm">{challenge}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Goals */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">🚀 Primary Goals</h3>
            <p className="text-sm text-muted-foreground">What do you hope to achieve?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {goals.map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.primaryGoals.includes(goal)}
                    onCheckedChange={() => handleGoalToggle(goal)}
                  />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📢 Additional Information</h3>
            
            <div>
              <Label htmlFor="heardAboutUs">How did you hear about us?</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, heardAboutUs: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Search</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any specific requirements or questions?"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="wantsUpdates"
                checked={formData.wantsUpdates}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, wantsUpdates: checked as boolean }))
                }
              />
              <Label htmlFor="wantsUpdates" className="text-sm">
                Yes, I want to receive updates about the August 2025 launch and early access opportunities
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.businessName || !formData.isAustralian}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Register Interest"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}