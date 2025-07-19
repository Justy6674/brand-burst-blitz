import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Plus, 
  Edit, 
  Share2, 
  Download, 
  Eye,
  MessageSquare,
  Heart,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerRole?: string;
  rating: number;
  testimonialText: string;
  dateSubmitted: Date;
  status: 'pending' | 'approved' | 'featured' | 'rejected';
  platform: string;
  tags: string[];
  useCase?: string;
  results?: string;
  beforeAfter?: {
    before: string;
    after: string;
  };
  mediaUrls?: string[];
  customerPhoto?: string;
  location?: string;
}

interface TestimonialForm {
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerRole: string;
  rating: number;
  testimonialText: string;
  useCase: string;
  results: string;
  location: string;
}

export const TestimonialCollectionBuilder: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [collectionMethod, setCollectionMethod] = useState<'form' | 'email' | 'widget'>('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>({
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerRole: '',
    rating: 5,
    testimonialText: '',
    useCase: '',
    results: '',
    location: ''
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      // Generate mock testimonials for demonstration
      const mockTestimonials: Testimonial[] = [
        {
          id: '1',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@techcorp.com',
          customerCompany: 'TechCorp Solutions',
          customerRole: 'Marketing Director',
          rating: 5,
          testimonialText: 'JBSAAS transformed our social media strategy completely. We saw a 300% increase in engagement within the first month!',
          dateSubmitted: new Date('2024-01-15'),
          status: 'featured',
          platform: 'LinkedIn',
          tags: ['social media', 'engagement', 'growth'],
          useCase: 'Social media management for B2B company',
          results: '300% increase in engagement, 150% more leads',
          location: 'Sydney, Australia'
        },
        {
          id: '2',
          customerName: 'Michael Chen',
          customerEmail: 'mike@startup.io',
          customerCompany: 'InnovateTech',
          customerRole: 'CEO',
          rating: 5,
          testimonialText: 'The AI-powered content generation saved us 20 hours per week. Our team can now focus on strategy instead of content creation.',
          dateSubmitted: new Date('2024-01-20'),
          status: 'approved',
          platform: 'Twitter',
          tags: ['AI', 'automation', 'efficiency'],
          useCase: 'Content creation automation for startup',
          results: '20 hours saved per week, 200% more content published',
          location: 'Melbourne, Australia'
        },
        {
          id: '3',
          customerName: 'Emma Williams',
          customerEmail: 'emma@retail.com',
          customerCompany: 'RetailMaster',
          customerRole: 'Digital Marketing Manager',
          rating: 4,
          testimonialText: 'Great platform with excellent customer support. The analytics dashboard gives us insights we never had before.',
          dateSubmitted: new Date('2024-01-25'),
          status: 'pending',
          platform: 'Instagram',
          tags: ['analytics', 'insights', 'support'],
          useCase: 'Social media analytics for retail business',
          results: 'Better decision making, improved ROI tracking',
          location: 'Brisbane, Australia'
        }
      ];

      setTestimonials(mockTestimonials);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast({
        title: "Error Loading Testimonials",
        description: "Failed to load testimonials",
        variant: "destructive"
      });
    }
  };

  const generateTestimonialWidget = async () => {
    setIsGenerating(true);
    try {
      // Simulate widget generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const widgetCode = `
<!-- JBSAAS Testimonial Collection Widget -->
<div id="jbsaas-testimonial-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.async = true;
    script.onload = function() {
      JBSAASWidget.init({
        containerId: 'jbsaas-testimonial-widget',
        theme: 'modern',
        fields: ['name', 'email', 'company', 'rating', 'testimonial'],
        submitEndpoint: 'https://your-domain.com/api/testimonials'
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

      navigator.clipboard.writeText(widgetCode);
      
      toast({
        title: "Widget Generated",
        description: "Widget code copied to clipboard!"
      });
    } catch (error) {
      console.error('Error generating widget:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate widget code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEmailTemplate = () => {
    const emailTemplate = `
Subject: We'd love your feedback! 

Hi [Customer Name],

Thank you for choosing JBSAAS for your social media management needs. We hope you're seeing great results!

We'd be thrilled if you could share your experience with us. Your feedback helps us improve and helps other businesses discover how JBSAAS can transform their social media strategy.

Would you mind taking 2 minutes to share your thoughts?

[TESTIMONIAL FORM LINK]

As a thank you, we'll feature your success story (with your permission) and send you a $50 credit for your next billing cycle.

Thank you for being an amazing customer!

Best regards,
The JBSAAS Team
`;

    navigator.clipboard.writeText(emailTemplate);
    toast({
      title: "Email Template Copied",
      description: "Email template copied to clipboard!"
    });
  };

  const submitTestimonial = async () => {
    try {
      const newTestimonial: Testimonial = {
        id: Date.now().toString(),
        ...testimonialForm,
        dateSubmitted: new Date(),
        status: 'pending',
        platform: 'Website',
        tags: [testimonialForm.useCase.toLowerCase(), 'customer feedback']
      };

      setTestimonials(prev => [newTestimonial, ...prev]);
      setIsFormDialogOpen(false);
      
      // Reset form
      setTestimonialForm({
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        customerRole: '',
        rating: 5,
        testimonialText: '',
        useCase: '',
        results: '',
        location: ''
      });

      toast({
        title: "Testimonial Submitted",
        description: "Thank you for your feedback!"
      });
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit testimonial",
        variant: "destructive"
      });
    }
  };

  const updateTestimonialStatus = async (id: string, newStatus: Testimonial['status']) => {
    setTestimonials(prev => 
      prev.map(t => t.id === id ? { ...t, status: newStatus } : t)
    );
    
    toast({
      title: "Status Updated",
      description: `Testimonial marked as ${newStatus}`
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'featured': return 'default';
      case 'approved': return 'secondary';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const testimonialStats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    featured: testimonials.filter(t => t.status === 'featured').length,
    avgRating: testimonials.length > 0 
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
      : 0
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Testimonial Collection Builder</h1>
        <p className="text-muted-foreground">
          Collect, manage, and showcase customer testimonials to build trust and credibility
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{testimonialStats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{testimonialStats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{testimonialStats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{testimonialStats.featured}</div>
            <p className="text-sm text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {testimonialStats.avgRating.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="collection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collection">Collection Methods</TabsTrigger>
          <TabsTrigger value="testimonials">Manage Testimonials</TabsTrigger>
          <TabsTrigger value="showcase">Showcase Options</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Embedded Form
                </CardTitle>
                <CardDescription>
                  Add a testimonial form directly to your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • Customizable form fields
                  • Automatic spam protection
                  • Real-time notifications
                  • Mobile responsive design
                </div>
                
                <Button 
                  onClick={generateTestimonialWidget}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Generate Widget Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Campaigns
                </CardTitle>
                <CardDescription>
                  Send personalized testimonial requests via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • Automated follow-up sequences
                  • Personalized templates
                  • Incentive management
                  • Response tracking
                </div>
                
                <Button onClick={generateEmailTemplate} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Manual Entry
                </CardTitle>
                <CardDescription>
                  Add testimonials from customer interviews or calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  • Rich text formatting
                  • Media attachments
                  • Customer verification
                  • Approval workflow
                </div>
                
                <Button onClick={() => setIsFormDialogOpen(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collection Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Timing is Everything</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Request testimonials after successful outcomes</li>
                    <li>• Follow up within 24-48 hours of positive interactions</li>
                    <li>• Send requests when customers are most engaged</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Make it Easy</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep forms short and simple</li>
                    <li>• Provide guiding questions</li>
                    <li>• Offer incentives for participation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="space-y-4">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{testimonial.customerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.customerRole} at {testimonial.customerCompany}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(testimonial.status)}>
                        {testimonial.status}
                      </Badge>
                      <Select
                        value={testimonial.status}
                        onValueChange={(value: Testimonial['status']) => 
                          updateTestimonialStatus(testimonial.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <blockquote className="text-lg mb-4 pl-4 border-l-4 border-primary/20">
                    "{testimonial.testimonialText}"
                  </blockquote>
                  
                  {testimonial.results && (
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium text-green-800 mb-1">Results Achieved:</p>
                      <p className="text-sm text-green-700">{testimonial.results}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {testimonial.dateSubmitted.toLocaleDateString()}
                    </div>
                    {testimonial.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {testimonial.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {testimonial.platform}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {testimonial.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="showcase" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Integration</CardTitle>
                <CardDescription>
                  Display testimonials on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Available Layouts:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Carousel slider</li>
                    <li>• Grid layout</li>
                    <li>• Featured testimonial</li>
                    <li>• Sidebar widget</li>
                  </ul>
                </div>
                
                <Button className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Generate Embed Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Sharing</CardTitle>
                <CardDescription>
                  Share testimonials across platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Auto-generation for:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Instagram stories</li>
                    <li>• LinkedIn posts</li>
                    <li>• Twitter graphics</li>
                    <li>• Facebook posts</li>
                  </ul>
                </div>
                
                <Button className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Social Graphics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">23%</div>
                <Progress value={23} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  23 testimonials from 100 requests
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">2.3</div>
                <p className="text-sm text-muted-foreground">
                  Average days to respond
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conversion Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2 text-green-600">+18%</div>
                <p className="text-sm text-muted-foreground">
                  Increase in conversion rate with testimonials
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Testimonial Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
            <DialogDescription>
              Enter customer testimonial details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Customer Name</label>
                <Input
                  placeholder="Full name"
                  value={testimonialForm.customerName}
                  onChange={(e) => setTestimonialForm(prev => ({ 
                    ...prev, customerName: e.target.value 
                  }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  placeholder="email@company.com"
                  value={testimonialForm.customerEmail}
                  onChange={(e) => setTestimonialForm(prev => ({ 
                    ...prev, customerEmail: e.target.value 
                  }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Input
                  placeholder="Company name"
                  value={testimonialForm.customerCompany}
                  onChange={(e) => setTestimonialForm(prev => ({ 
                    ...prev, customerCompany: e.target.value 
                  }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Input
                  placeholder="Job title"
                  value={testimonialForm.customerRole}
                  onChange={(e) => setTestimonialForm(prev => ({ 
                    ...prev, customerRole: e.target.value 
                  }))}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <Select 
                value={testimonialForm.rating.toString()} 
                onValueChange={(value) => setTestimonialForm(prev => ({ 
                  ...prev, rating: parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars - Excellent</SelectItem>
                  <SelectItem value="4">4 Stars - Very Good</SelectItem>
                  <SelectItem value="3">3 Stars - Good</SelectItem>
                  <SelectItem value="2">2 Stars - Fair</SelectItem>
                  <SelectItem value="1">1 Star - Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Testimonial</label>
              <Textarea
                placeholder="Share your experience..."
                value={testimonialForm.testimonialText}
                onChange={(e) => setTestimonialForm(prev => ({ 
                  ...prev, testimonialText: e.target.value 
                }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Use Case</label>
              <Input
                placeholder="How did they use your product/service?"
                value={testimonialForm.useCase}
                onChange={(e) => setTestimonialForm(prev => ({ 
                  ...prev, useCase: e.target.value 
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Results Achieved</label>
              <Textarea
                placeholder="What results did they achieve?"
                value={testimonialForm.results}
                onChange={(e) => setTestimonialForm(prev => ({ 
                  ...prev, results: e.target.value 
                }))}
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTestimonial}>
              Add Testimonial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};