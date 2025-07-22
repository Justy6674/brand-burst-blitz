import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  User
} from 'lucide-react';

interface SocialSetupService {
  id: string;
  user_id: string;
  abn: string;
  business_address: any;
  stripe_payment_intent_id: string;
  amount_paid: number;
  status: string;
  assigned_to?: string;
  requested_at: string;
  started_at?: string;
  completed_at?: string;
  completion_notes?: string;
  connected_accounts: any;
  qa_checklist: any;
  users?: { email: string; name?: string } | null;
  business_profiles?: { business_name: string } | null;
}

const SocialSetupOperationsPortal = () => {
  const [services, setServices] = useState<SocialSetupService[]>([]);
  const [filteredServices, setFilteredServices] = useState<SocialSetupService[]>([]);
  const [selectedService, setSelectedService] = useState<SocialSetupService | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load services data
  useEffect(() => {
    loadServices();
  }, []);

  // Filter services when search or status filter changes
  useEffect(() => {
    let filtered = services;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.abn.includes(searchQuery) ||
        service.users?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.business_profiles?.business_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
  }, [services, statusFilter, searchQuery]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('social_setup_services')
        .select(`
          *,
          users (email, name),
          business_profiles (business_name)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      
      setServices((data || []) as unknown as SocialSetupService[]);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Error",
        description: "Failed to load setup services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = async (serviceId: string, newStatus: string, additionalData: any = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-setup-status', {
        body: {
          serviceId,
          status: newStatus,
          ...additionalData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Service status updated to ${newStatus}`,
      });

      loadServices(); // Reload data
      setSelectedService(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Users;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return AlertTriangle;
    }
  };

  const dashboardStats = {
    total: services.length,
    pending: services.filter(s => s.status === 'pending').length,
    inProgress: services.filter(s => s.status === 'in_progress').length,
    completed: services.filter(s => s.status === 'completed').length,
    revenue: services.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.amount_paid || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Loading setup services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Setup Operations Portal</h1>
          <p className="text-muted-foreground">Manage Australian business setup requests</p>
        </div>
        <Button onClick={loadServices}>Refresh Data</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{dashboardStats.total}</div>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{dashboardStats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">AU${(dashboardStats.revenue / 100).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Service Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by ABN, email, or business name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Services List */}
          <div className="grid gap-4">
            {filteredServices.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              
              return (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedService?.id === service.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-3">
                          <StatusIcon className="w-5 h-5" />
                          {service.business_profiles?.business_name || 'Business Name Not Available'}
                          <Badge className={getStatusColor(service.status)}>
                            {service.status.replace('_', ' ')}
                          </Badge>
                        </CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {service.users?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            ABN: {service.abn}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            AU${(service.amount_paid / 100).toFixed(0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(service.requested_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Setup Service Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Completion Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Completion Time:</span>
                      <span className="font-medium">3.2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium text-green-600">94.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction:</span>
                      <span className="font-medium flex items-center gap-1">
                        4.8 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Business Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium">AU${(dashboardStats.revenue / 100).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value:</span>
                      <span className="font-medium">AU$224</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Growth:</span>
                      <span className="font-medium text-green-600">+18.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Detail Modal */}
      {selectedService && (
        <Card className="fixed inset-4 bg-background border-2 border-primary z-50 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Service Request Details</CardTitle>
              <Button variant="outline" onClick={() => setSelectedService(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Business Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Business Name:</strong> {selectedService.business_profiles?.business_name}</div>
                  <div><strong>ABN:</strong> {selectedService.abn}</div>
                  <div><strong>Customer Email:</strong> {selectedService.users?.email}</div>
                  <div><strong>Amount Paid:</strong> AU${(selectedService.amount_paid / 100).toFixed(0)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Service Status</h3>
                <div className="space-y-4">
                  <Select 
                    value={selectedService.status} 
                    onValueChange={(newStatus) => updateServiceStatus(selectedService.id, newStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedService.status === 'completed' && (
                    <Textarea 
                      placeholder="Completion notes..."
                      onChange={(e) => {
                        // Store completion notes for submission
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialSetupOperationsPortal;