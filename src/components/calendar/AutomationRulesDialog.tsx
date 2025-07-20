import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { useAutomationRules, AutomationRule } from '@/hooks/useAutomationRules';
import { toast } from 'sonner';

export interface AutomationRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string;
}

const ACTION_TYPES = [
  { id: 'create_notification', label: 'Create Notification' },
  { id: 'generate_content', label: 'Generate Content' },
  { id: 'update_external_calendar', label: 'Update External Calendar' },
  { id: 'send_email', label: 'Send Email' },
  { id: 'create_task', label: 'Create Task' },
];

const CONDITION_TYPES = [
  { id: 'event_type', label: 'Event Type' },
  { id: 'platform', label: 'Platform' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
];

export const AutomationRulesDialog: React.FC<AutomationRulesDialogProps> = ({
  open,
  onOpenChange,
  businessId
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: '',
    event_type: '',
    conditions: {},
    actions: [],
    is_active: true
  });

  const { 
    rules, 
    loading, 
    createRule, 
    updateRule, 
    deleteRule, 
    toggleRule 
  } = useAutomationRules(businessId);

  const handleCreateNew = () => {
    setFormData({
      name: '',
      event_type: '',
      conditions: {},
      actions: [],
      is_active: true
    });
    setEditingRule(null);
    setIsCreating(true);
  };

  const handleEdit = (rule: AutomationRule) => {
    setFormData(rule);
    setEditingRule(rule);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.actions || formData.actions.length === 0) {
      toast.error('Please fill in rule name and at least one action');
      return;
    }

    try {
      if (editingRule) {
        await updateRule(editingRule.id!, formData);
      } else {
        await createRule({
          ...formData,
          business_id: businessId,
        } as Omit<AutomationRule, 'id'>);
      }
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving automation rule:', error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this automation rule?')) {
      await deleteRule(ruleId);
    }
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [`condition_${Date.now()}`]: { type: '', value: '' }
      }
    }));
  };

  const removeCondition = (key: string) => {
    setFormData(prev => {
      const newConditions = { ...prev.conditions };
      delete newConditions[key];
      return { ...prev, conditions: newConditions };
    });
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        { type: 'create_notification', title: '', message: '' }
      ]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateAction = (index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      ) || []
    }));
  };

  if (isCreating) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div>
                <Label htmlFor="event_type">Event Type Trigger</Label>
                <Select
                  value={formData.event_type || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Event Type</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Conditions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              
              <div className="space-y-2">
                {Object.entries(formData.conditions || {}).map(([key, condition]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2 p-2 border rounded">
                    <Select
                      value={condition.type || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          [key]: { ...condition, type: value }
                        }
                      }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={condition.value || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          [key]: { ...condition, value: e.target.value }
                        }
                      }))}
                      placeholder="Condition value"
                      className="flex-1"
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Actions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </Button>
              </div>
              
              <div className="space-y-3">
                {(formData.actions || []).map((action, index) => (
                  <div key={index} className="p-3 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <Select
                        value={action.type || ''}
                        onValueChange={(value) => updateAction(index, { type: value })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {action.type === 'create_notification' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          value={action.title || ''}
                          onChange={(e) => updateAction(index, { title: e.target.value })}
                          placeholder="Notification title"
                        />
                        <Input
                          value={action.message || ''}
                          onChange={(e) => updateAction(index, { message: e.target.value })}
                          placeholder="Notification message"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Rule is active</Label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Rules
            </DialogTitle>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Automation Rules</h3>
              <p className="text-muted-foreground mb-4">
                Create automation rules to automatically perform actions when events are created or updated.
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Rule
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {rules.map(rule => (
                <Card key={rule.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {rule.event_type && (
                          <Badge variant="outline">{rule.event_type}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRule(rule.id!, !rule.is_active)}
                        >
                          {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Conditions */}
                      <div>
                        <Label className="text-sm font-medium">Conditions</Label>
                        <div className="mt-1">
                          {Object.keys(rule.conditions || {}).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(rule.conditions || {}).map(([key, condition]: [string, any]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {condition.type}: {condition.value}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No conditions set</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <Label className="text-sm font-medium">Actions</Label>
                        <div className="mt-1">
                          {rule.actions && rule.actions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rule.actions.map((action: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {ACTION_TYPES.find(t => t.id === action.type)?.label || action.type}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No actions set</p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <span>Executed: {rule.execution_count || 0} times</span>
                        {rule.last_executed_at && (
                          <span>Last: {new Date(rule.last_executed_at).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(rule.created_at!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};