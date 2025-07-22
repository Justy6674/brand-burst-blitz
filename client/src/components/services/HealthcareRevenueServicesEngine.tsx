// Healthcare Revenue Services Delivery Engine
// Professional service delivery pipeline for Australian healthcare practices

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileCheck, 
  Users, 
  TrendingUp,
  Shield,
  Star,
  Download,
  Send,
  Phone,
  Calendar
} from 'lucide-react';

interface HealthcareService {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: string;
  includes: string[];
  compliance: string[];
  category: 'audit' | 'setup' | 'strategy' | 'compliance';
  popularity: number;
  status: 'available' | 'beta' | 'coming_soon';
}

interface ServiceOrder {
  id: string;
  service_id: string;
  practice_name: string;
  practitioner_name: string;
  ahpra_registration: string;
  specialty: string;
  status: 'pending' | 'in_progress' | 'quality_review' | 'completed' | 'delivered';
  payment_status: 'pending' | 'paid' | 'refunded';
  ordered_at: string;
  estimated_delivery: string;
  price_paid: number;
  deliverables: any[];
  progress_percentage: number;
}

const HEALTHCARE_SERVICES: HealthcareService[] = [
  {
    id: 'ahpra-compliance-audit',
    name: 'AHPRA Compliance Audit',
    description: 'Comprehensive review of your practice marketing and content against AHPRA advertising guidelines',
    price: 199,
    deliveryTime: '3-5 business days',
    includes: [
      'Complete website content audit',
      'Social media compliance review', 
      'Patient testimonial compliance check',
      'Before/after photo assessment',
      'Detailed compliance report with recommendations',
      'Action plan for compliance improvements',
      '30-day follow-up support'
    ],
    compliance: [
      'AHPRA Advertising Guidelines',
      'TGA Therapeutic Advertising Requirements',
      'Privacy Act compliance',
      'Australian Consumer Law'
    ],
    category: 'audit',
    popularity: 95,
    status: 'available'
  },
  {
    id: 'healthcare-practice-name-scout',
    name: 'Healthcare Practice Name Scout',
    description: 'Professional naming research and domain availability for new healthcare practices',
    price: 149,
    deliveryTime: '2-3 business days',
    includes: [
      'AHPRA-compliant name suggestions (20 options)',
      'Domain availability check (.com.au, .au)',
      'ABN name availability verification',
      'Trademark conflict assessment',
      'Social media handle availability',
      'Professional branding recommendations',
      'Logo concept suggestions'
    ],
    compliance: [
      'AHPRA Professional Standards',
      'ACIC Business Name Guidelines',
      'Intellectual Property considerations'
    ],
    category: 'setup',
    popularity: 78,
    status: 'available'
  },
  {
    id: 'patient-journey-strategy',
    name: 'Patient Journey Content Strategy',
    description: 'Complete patient engagement strategy with AHPRA-compliant content templates',
    price: 299,
    deliveryTime: '5-7 business days',
    includes: [
      'Patient journey mapping for your specialty',
      '30 AHPRA-compliant content templates',
      'Email sequence templates (onboarding, follow-up, education)',
      'Social media content calendar (3 months)',
      'Patient education material templates',
      'Referral network communication templates',
      'Implementation guidance and training'
    ],
    compliance: [
      'AHPRA Patient Communication Standards',
      'TGA Therapeutic Advertising Compliance',
      'Privacy Act patient information guidelines'
    ],
    category: 'strategy',
    popularity: 89,
    status: 'available'
  },
  {
    id: 'complete-social-setup',
    name: 'Complete Healthcare Social Media Setup',
    description: 'Full social media account configuration with ongoing compliance monitoring',
    price: 399,
    deliveryTime: '7-10 business days',
    includes: [
      'Facebook Business Page setup',
      'Instagram Business account configuration',
      'LinkedIn professional profile optimization',
      'AHPRA-compliant bio and descriptions',
      'Professional photography guidelines',
      'Content posting schedule setup',
      '3 months of compliance monitoring',
      'Monthly performance reports'
    ],
    compliance: [
      'Meta Business Platform compliance',
      'AHPRA Social Media Guidelines',
      'Professional Photography Standards'
    ],
    category: 'setup',
    popularity: 92,
    status: 'available'
  },
  {
    id: 'telehealth-compliance-package',
    name: 'Telehealth Compliance Package',
    description: 'Complete telehealth setup with AHPRA and Medicare compliance',
    price: 249,
    deliveryTime: '4-6 business days',
    includes: [
      'Telehealth platform recommendations',
      'AHPRA telehealth compliance checklist',
      'Medicare billing guidance for telehealth',
      'Patient consent form templates',
      'Technical setup documentation',
      'Privacy and security assessment',
      'State-specific compliance requirements'
    ],
    compliance: [
      'AHPRA Telehealth Guidelines',
      'Medicare Telehealth Requirements',
      'Privacy Act telehealth provisions',
      'State health department regulations'
    ],
    category: 'compliance',
    popularity: 73,
    status: 'beta'
  },
  {
    id: 'practice-acquisition-due-diligence',
    name: 'Practice Acquisition Due Diligence',
    description: 'Comprehensive practice evaluation for acquisition or merger',
    price: 599,
    deliveryTime: '10-14 business days',
    includes: [
      'Financial performance analysis',
      'AHPRA compliance assessment',
      'Patient base evaluation',
      'Technology stack review',
      'Staff and workflow assessment',
      'Market positioning analysis',
      'Risk assessment report',
      'Acquisition recommendation'
    ],
    compliance: [
      'AHPRA Practice Standards',
      'Australian Financial Services compliance',
      'Employment law considerations',
      'Competition and Consumer Act'
    ],
    category: 'strategy',
    popularity: 45,
    status: 'coming_soon'
  }
];

export const HealthcareRevenueServicesEngine: React.FC = () => {
  const [selectedService, setSelectedService] = useState<HealthcareService | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [orderProgress, setOrderProgress] = useState<{ [key: string]: number }>({});
  
  const { toast } = useToast();

  // Load existing service orders
  useEffect(() => {
    loadServiceOrders();
  }, []);

  const loadServiceOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('healthcare_service_orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('ordered_at', { ascending: false });

      if (error) throw error;
      setServiceOrders(data || []);
    } catch (error) {
      console.error('Error loading service orders:', error);
    }
  };

  const handleServicePurchase = async (service: HealthcareService) => {
    try {
      setLoading(true);
      
      // REAL SERVICE ORDER PROCESSING - No more simulation
      const { data, error } = await supabase.functions.invoke('process-healthcare-service-order', {
        body: {
          serviceId: service.id,
          userId: user?.id,
          practiceId: user?.id,
          serviceType: service.category,
          price: service.price,
          deliveryExpected: service.deliveryTime
        }
      });

      if (error) {
        throw new Error(error.message || 'Order processing failed');
      }

      if (data.success) {
        toast({
          title: "Service Ordered Successfully",
          description: `${service.name} has been ordered. Expected delivery: ${service.deliveryTime}`,
        });

        // Start real service delivery tracking
        startRealServiceDelivery(service.id, data.orderId);
        
        // Update service status
        setServices(prev => prev.map(s => 
          s.id === service.id 
            ? { ...s, status: 'ordered' as const }
            : s
        ));
      } else {
        throw new Error(data.error || 'Service order failed');
      }

    } catch (error: any) {
      console.error('Service purchase error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process service order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // REAL SERVICE DELIVERY TRACKING - Replace simulation
  const startRealServiceDelivery = async (serviceId: string, orderId: string) => {
    try {
      // Subscribe to real-time service delivery updates
      const { data, error } = await supabase.functions.invoke('track-service-delivery', {
        body: {
          serviceId,
          orderId,
          userId: user?.id,
          enableRealTimeUpdates: true
        }
      });

      if (error) {
        console.error('Service tracking error:', error);
        return;
      }

      // Set up real-time subscription for delivery updates
      const subscription = supabase
        .channel(`service_delivery_${orderId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_orders',
          filter: `id=eq.${orderId}`
        }, (payload) => {
          // Update service delivery progress with real data
          const newProgress = payload.new.progress_percentage || 0;
          setServiceProgress(prev => ({
            ...prev,
            [serviceId]: {
              progress: newProgress,
              status: payload.new.status,
              lastUpdate: new Date(payload.new.updated_at)
            }
          }));

          // Notify when service is completed
          if (newProgress >= 100) {
            toast({
              title: "Service Completed",
              description: "Your healthcare service has been delivered successfully",
            });
          }
        })
        .subscribe();

      // Store subscription for cleanup
      setActiveSubscriptions(prev => [...prev, subscription]);

    } catch (error) {
      console.error('Error setting up service tracking:', error);
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'audit': return <Shield className="w-5 h-5" />;
      case 'setup': return <Users className="w-5 h-5" />;
      case 'strategy': return <TrendingUp className="w-5 h-5" />;
      case 'compliance': return <FileCheck className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'coming_soon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Healthcare Professional Services</h2>
          <p className="text-gray-600">AHPRA-compliant services for Australian healthcare practices</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <Shield className="w-3 h-3 mr-1" />
          Fully Compliant
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Available Services</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Service Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HEALTHCARE_SERVICES.map((service) => (
              <Card key={service.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(service.category)}
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-sm text-gray-600">{service.deliveryTime}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{service.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Includes:</h4>
                    <ul className="text-xs space-y-1">
                      {service.includes.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {service.includes.length > 3 && (
                        <li className="text-gray-500">+ {service.includes.length - 3} more...</li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Compliance:</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.compliance.slice(0, 2).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{service.popularity}% satisfaction</span>
                    </div>
                    
                    <Button 
                      onClick={() => handleServicePurchase(service)}
                      disabled={loading || service.status === 'coming_soon'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {service.status === 'coming_soon' ? 'Coming Soon' : 'Order Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Guarantees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Our Guarantees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">100% AHPRA Compliant</h4>
                  <p className="text-sm text-gray-600">All services meet Australian healthcare standards</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">On-Time Delivery</h4>
                  <p className="text-sm text-gray-600">Delivered within promised timeframes</p>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-medium">Quality Guarantee</h4>
                  <p className="text-sm text-gray-600">100% satisfaction or full refund</p>
                </div>
                <div className="text-center">
                  <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium">Expert Support</h4>
                  <p className="text-sm text-gray-600">Direct access to healthcare marketing specialists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {serviceOrders.length > 0 ? (
            <div className="space-y-4">
              {serviceOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {HEALTHCARE_SERVICES.find(s => s.id === order.service_id)?.name || 'Service'}
                        </CardTitle>
                        <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {getOrderStatusIcon(order.status)}
                          <Badge variant="outline">{order.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm font-medium">{formatPrice(order.price_paid)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Practice:</span>
                          <p className="text-sm text-gray-600">{order.practice_name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Practitioner:</span>
                          <p className="text-sm text-gray-600">{order.practitioner_name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Ordered:</span>
                          <p className="text-sm text-gray-600">
                            {new Date(order.ordered_at).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Estimated Delivery:</span>
                          <p className="text-sm text-gray-600">
                            {new Date(order.estimated_delivery).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {order.status !== 'completed' && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{order.progress_percentage}%</span>
                          </div>
                          <Progress value={orderProgress[order.service_id] || order.progress_percentage} />
                        </div>
                      )}

                      {/* Deliverables */}
                      {order.deliverables && order.deliverables.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Deliverables:</span>
                          <div className="flex flex-wrap gap-2">
                            {order.deliverables.map((deliverable, index) => (
                              <Button key={index} variant="outline" size="sm" className="text-xs">
                                <Download className="w-3 h-3 mr-1" />
                                {deliverable.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-4">
                  Order your first healthcare professional service to get started
                </p>
                <Button onClick={() => setActiveTab('services')}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Get Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Direct Contact</h4>
                  <p className="text-sm text-gray-600 mb-2">Speak directly with our healthcare marketing specialists</p>
                  <Button className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-2">Get detailed help via email</p>
                  <Button variant="outline" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Response Times</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Phone: Immediate during business hours</li>
                    <li>• Email: Within 4 hours</li>
                    <li>• Chat: Within 30 minutes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">How do I ensure AHPRA compliance?</h4>
                  <p className="text-sm text-gray-600">All our services are designed and delivered by healthcare marketing specialists who understand AHPRA requirements.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">What if I'm not satisfied?</h4>
                  <p className="text-sm text-gray-600">We offer a 100% satisfaction guarantee. If you're not happy with the deliverables, we'll refund your payment in full.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Can I modify a service?</h4>
                  <p className="text-sm text-gray-600">Yes! We can customize any service to meet your specific practice needs. Contact support for custom pricing.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Do you work with all specialties?</h4>
                  <p className="text-sm text-gray-600">We work with all AHPRA-registered healthcare professions including GPs, specialists, allied health, and nursing.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Compliance Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All services are delivered by AHPRA-compliant healthcare marketing specialists and include ongoing compliance monitoring. 
          Services are specifically designed for Australian healthcare professionals and meet all regulatory requirements.
        </AlertDescription>
      </Alert>
    </div>
  );
}; 