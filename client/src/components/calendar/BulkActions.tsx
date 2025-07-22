import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Check,
  X,
  Copy,
  Trash2,
  Share2,
  Download,
  Tag,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'newsletter' | 'video' | 'other';
  status: 'planned' | 'in-progress' | 'draft' | 'scheduled' | 'published';
  priority: 'low' | 'medium' | 'high';
  scheduledDate: Date;
  platforms: string[];
  tags: string[];
}

interface BulkActionsProps {
  items: ContentItem[];
  onItemsUpdated: (items: ContentItem[]) => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  items,
  onItemsUpdated
}) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkPriority, setBulkPriority] = useState<string>('');
  const [bulkPlatform, setBulkPlatform] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const executeBulkAction = () => {
    const selectedItemsArray = items.filter(item => selectedItems.has(item.id));
    
    switch (bulkAction) {
      case 'update-status':
        handleBulkStatusUpdate(selectedItemsArray);
        break;
      case 'update-priority':
        handleBulkPriorityUpdate(selectedItemsArray);
        break;
      case 'add-platform':
        handleBulkPlatformAdd(selectedItemsArray);
        break;
      case 'duplicate':
        handleBulkDuplicate(selectedItemsArray);
        break;
      case 'export':
        handleBulkExport(selectedItemsArray);
        break;
      case 'delete':
        handleBulkDelete(selectedItemsArray);
        break;
      default:
        break;
    }

    setShowBulkDialog(false);
    setSelectedItems(new Set());
  };

  const handleBulkStatusUpdate = (selectedItemsArray: ContentItem[]) => {
    if (!bulkStatus) return;

    const updatedItems = items.map(item => {
      if (selectedItems.has(item.id)) {
        return { ...item, status: bulkStatus as ContentItem['status'] };
      }
      return item;
    });

    onItemsUpdated(updatedItems);
    toast({
      title: "Status Updated",
      description: `Updated status for ${selectedItemsArray.length} item(s) to "${bulkStatus}"`
    });
  };

  const handleBulkPriorityUpdate = (selectedItemsArray: ContentItem[]) => {
    if (!bulkPriority) return;

    const updatedItems = items.map(item => {
      if (selectedItems.has(item.id)) {
        return { ...item, priority: bulkPriority as ContentItem['priority'] };
      }
      return item;
    });

    onItemsUpdated(updatedItems);
    toast({
      title: "Priority Updated",
      description: `Updated priority for ${selectedItemsArray.length} item(s) to "${bulkPriority}"`
    });
  };

  const handleBulkPlatformAdd = (selectedItemsArray: ContentItem[]) => {
    if (!bulkPlatform) return;

    const updatedItems = items.map(item => {
      if (selectedItems.has(item.id) && !item.platforms.includes(bulkPlatform)) {
        return { ...item, platforms: [...item.platforms, bulkPlatform] };
      }
      return item;
    });

    onItemsUpdated(updatedItems);
    toast({
      title: "Platform Added",
      description: `Added "${bulkPlatform}" to ${selectedItemsArray.length} item(s)`
    });
  };

  const handleBulkDuplicate = (selectedItemsArray: ContentItem[]) => {
    const duplicatedItems = selectedItemsArray.map(item => ({
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: 'planned' as const,
      scheduledDate: new Date(item.scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Add 1 week
    }));

    const updatedItems = [...items, ...duplicatedItems];
    onItemsUpdated(updatedItems);
    
    toast({
      title: "Items Duplicated",
      description: `Created ${duplicatedItems.length} duplicate(s)`
    });
  };

  const handleBulkExport = (selectedItemsArray: ContentItem[]) => {
    const exportData = selectedItemsArray.map(item => ({
      Title: item.title,
      Type: item.type,
      Status: item.status,
      Priority: item.priority,
      'Scheduled Date': item.scheduledDate.toISOString().split('T')[0],
      Platforms: item.platforms.join(', '),
      Tags: item.tags.join(', ')
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-calendar-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${selectedItemsArray.length} item(s) to CSV`
    });
  };

  const handleBulkDelete = (selectedItemsArray: ContentItem[]) => {
    const updatedItems = items.filter(item => !selectedItems.has(item.id));
    onItemsUpdated(updatedItems);
    
    toast({
      title: "Items Deleted",
      description: `Deleted ${selectedItemsArray.length} item(s)`
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'update-status': return <Clock className="h-4 w-4" />;
      case 'update-priority': return <Tag className="h-4 w-4" />;
      case 'add-platform': return <Share2 className="h-4 w-4" />;
      case 'duplicate': return <Copy className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-orange-100 text-orange-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'newsletter': return <Tag className="h-4 w-4" />;
      case 'video': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Bulk Actions</h2>
            <p className="text-muted-foreground">
              Manage multiple content items efficiently
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedItems.size} selected
              </span>
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
              >
                Bulk Actions
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear Selection
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Items</CardTitle>
              <CardDescription>
                Select items to perform bulk actions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedItems.size === items.length && items.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className={`border transition-colors ${
                selectedItems.has(item.id) ? 'bg-primary/5 border-primary/20' : ''
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                    />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {item.scheduledDate.toLocaleDateString()}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {item.platforms.slice(0, 2).map(platform => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {item.platforms.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.platforms.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Performing action on {selectedItems.size} selected item(s)
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update-status">Update Status</SelectItem>
                    <SelectItem value="update-priority">Update Priority</SelectItem>
                    <SelectItem value="add-platform">Add Platform</SelectItem>
                    <SelectItem value="duplicate">Duplicate Items</SelectItem>
                    <SelectItem value="export">Export to CSV</SelectItem>
                    <SelectItem value="delete">Delete Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bulkAction === 'update-status' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bulkAction === 'update-priority' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Priority</label>
                  <Select value={bulkPriority} onValueChange={setBulkPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bulkAction === 'add-platform' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform to Add</label>
                  <Select value={bulkPlatform} onValueChange={setBulkPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={executeBulkAction}
                disabled={!bulkAction || 
                  (bulkAction === 'update-status' && !bulkStatus) ||
                  (bulkAction === 'update-priority' && !bulkPriority) ||
                  (bulkAction === 'add-platform' && !bulkPlatform)
                }
                className={bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <span className="flex items-center gap-2">
                  {getActionIcon(bulkAction)}
                  Execute Action
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};