import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';
import { differenceInMinutes, addMinutes, format, isSameDay } from 'date-fns';

interface DraggedItem {
  id: string;
  type: 'event' | 'template' | 'idea';
  data: any;
  originalPosition: { x: number; y: number };
  offset: { x: number; y: number };
}

interface DropZone {
  id: string;
  type: 'date' | 'timeSlot' | 'practice' | 'calendar';
  data: any;
  position: { x: number; y: number; width: number; height: number };
  isValid: boolean;
}

interface DragDropOptions {
  enabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  enableAutoScroll: boolean;
  validateDrop: (draggedItem: DraggedItem, dropZone: DropZone) => boolean;
  onDragStart?: (draggedItem: DraggedItem) => void;
  onDragMove?: (draggedItem: DraggedItem, position: { x: number; y: number }) => void;
  onDragEnd?: (draggedItem: DraggedItem, dropZone: DropZone | null) => void;
  onDrop?: (draggedItem: DraggedItem, dropZone: DropZone) => Promise<boolean>;
}

export function useAdvancedDragDrop(options: DragDropOptions) {
  const { toast } = useToast();
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);

  // Performance optimization
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dragStartTime, setDragStartTime] = useState<number>(0);

  // Refs for DOM manipulation
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll configuration
  const autoScrollThreshold = 50;
  const autoScrollSpeed = 10;

  // Initialize drag system
  useEffect(() => {
    if (options.enabled) {
      setupDragListeners();
      createGhostElement();
    }

    return () => {
      cleanupDragListeners();
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [options.enabled]);

  const setupDragListeners = () => {
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  };

  const cleanupDragListeners = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };

  const createGhostElement = () => {
    const ghost = document.createElement('div');
    ghost.id = 'drag-ghost';
    ghost.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
      pointer-events: none;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      transform: rotate(2deg);
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
    `;
    document.body.appendChild(ghost);
    setGhostElement(ghost);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedItem) return;

    e.preventDefault();

    let newX = e.clientX - draggedItem.offset.x;
    let newY = e.clientY - draggedItem.offset.y;

    // Snap to grid if enabled
    if (options.snapToGrid) {
      newX = Math.round(newX / options.gridSize) * options.gridSize;
      newY = Math.round(newY / options.gridSize) * options.gridSize;
    }

    setCurrentPosition({ x: newX, y: newY });

    // Update ghost element position
    if (ghostElement) {
      ghostElement.style.left = `${e.clientX + 10}px`;
      ghostElement.style.top = `${e.clientY - 10}px`;
    }

    // Check for drop zones
    const hoveredDropZone = findDropZoneAt(e.clientX, e.clientY);
    setActiveDropZone(hoveredDropZone);

    // Auto-scroll if near edges
    if (options.enableAutoScroll) {
      handleAutoScroll(e.clientX, e.clientY);
    }

    // Call drag move callback
    options.onDragMove?.(draggedItem, { x: newX, y: newY });
  }, [isDragging, draggedItem, options, ghostElement]);

  const handleMouseUp = useCallback(async (e: MouseEvent) => {
    if (!isDragging || !draggedItem) return;

    e.preventDefault();
    
    const dropZone = findDropZoneAt(e.clientX, e.clientY);
    let dropSuccess = false;

    if (dropZone && options.validateDrop(draggedItem, dropZone)) {
      try {
        if (options.onDrop) {
          dropSuccess = await options.onDrop(draggedItem, dropZone);
        } else {
          dropSuccess = true;
        }

        if (dropSuccess) {
          // Success feedback
          showDropFeedback(true, dropZone);
          
          // Handle healthcare-specific drop actions
          await handleHealthcareDrop(draggedItem, dropZone);
        } else {
          showDropFeedback(false, dropZone);
        }
      } catch (error) {
        console.error('Drop operation failed:', error);
        showDropFeedback(false, dropZone);
        toast({
          title: "Drop Failed",
          description: "Failed to move the item. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Invalid drop - animate back to original position
      animateBackToOriginal();
    }

    // Cleanup
    endDrag();
    options.onDragEnd?.(draggedItem, dropZone);
  }, [isDragging, draggedItem, options, toast]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDragging) {
      cancelDrag();
    }
    
    if (e.key === 'Shift') {
      setIsMultiSelecting(true);
    }
  }, [isDragging]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsMultiSelecting(false);
    }
  }, []);

  const startDrag = useCallback((
    itemId: string,
    itemType: 'event' | 'template' | 'idea',
    itemData: any,
    event: React.MouseEvent | MouseEvent
  ) => {
    if (!options.enabled) return false;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const draggedItem: DraggedItem = {
      id: itemId,
      type: itemType,
      data: itemData,
      originalPosition: { x: rect.left, y: rect.top },
      offset
    };

    setIsDragging(true);
    setDraggedItem(draggedItem);
    setDragStartTime(Date.now());
    setCurrentPosition({ x: rect.left, y: rect.top });

    // Update ghost element
    if (ghostElement) {
      ghostElement.textContent = getDragItemLabel(draggedItem);
      ghostElement.style.display = 'block';
      ghostElement.style.left = `${event.clientX + 10}px`;
      ghostElement.style.top = `${event.clientY - 10}px`;
    }

    // Register drop zones
    registerDropZones();

    // Add visual feedback to the original element
    const element = event.target as HTMLElement;
    element.classList.add('dragging');

    options.onDragStart?.(draggedItem);
    return true;
  }, [options, ghostElement]);

  const endDrag = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setActiveDropZone(null);
    setCurrentPosition({ x: 0, y: 0 });

    // Hide ghost element
    if (ghostElement) {
      ghostElement.style.display = 'none';
    }

    // Clear auto-scroll
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    // Remove visual feedback
    document.querySelectorAll('.dragging').forEach(element => {
      element.classList.remove('dragging');
    });

    // Clear drop zones visual feedback
    document.querySelectorAll('.drop-zone-active').forEach(element => {
      element.classList.remove('drop-zone-active');
    });
  };

  const cancelDrag = () => {
    if (!isDragging || !draggedItem) return;

    // Animate back to original position
    animateBackToOriginal();
    endDrag();

    toast({
      title: "Drag Cancelled",
      description: "The item has been returned to its original position.",
    });
  };

  const animateBackToOriginal = () => {
    if (!draggedItem || !ghostElement) return;

    const startX = currentPosition.x;
    const startY = currentPosition.y;
    const endX = draggedItem.originalPosition.x;
    const endY = draggedItem.originalPosition.y;

    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentX = startX + (endX - startX) * easeOut;
      const currentY = startY + (endY - startY) * easeOut;

      if (ghostElement) {
        ghostElement.style.left = `${currentX}px`;
        ghostElement.style.top = `${currentY}px`;
        ghostElement.style.opacity = `${1 - progress}`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const findDropZoneAt = (x: number, y: number): DropZone | null => {
    for (const zone of dropZones) {
      if (
        x >= zone.position.x &&
        x <= zone.position.x + zone.position.width &&
        y >= zone.position.y &&
        y <= zone.position.y + zone.position.height
      ) {
        return zone;
      }
    }
    return null;
  };

  const registerDropZones = () => {
    const zones: DropZone[] = [];

    // Register calendar date cells as drop zones
    document.querySelectorAll('[data-calendar-date]').forEach(element => {
      const rect = element.getBoundingClientRect();
      const dateStr = element.getAttribute('data-calendar-date');
      
      if (dateStr) {
        zones.push({
          id: `date-${dateStr}`,
          type: 'date',
          data: { date: new Date(dateStr) },
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          },
          isValid: true
        });
      }
    });

    // Register time slots as drop zones
    document.querySelectorAll('[data-time-slot]').forEach(element => {
      const rect = element.getBoundingClientRect();
      const timeSlot = element.getAttribute('data-time-slot');
      
      if (timeSlot) {
        zones.push({
          id: `time-${timeSlot}`,
          type: 'timeSlot',
          data: { timeSlot },
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          },
          isValid: true
        });
      }
    });

    // Register practice switcher as drop zone
    document.querySelectorAll('[data-practice-id]').forEach(element => {
      const rect = element.getBoundingClientRect();
      const practiceId = element.getAttribute('data-practice-id');
      
      if (practiceId) {
        zones.push({
          id: `practice-${practiceId}`,
          type: 'practice',
          data: { practiceId },
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          },
          isValid: true
        });
      }
    });

    setDropZones(zones);
  };

  const handleAutoScroll = (clientX: number, clientY: number) => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    const container = containerRef.current || document.documentElement;
    const containerRect = container.getBoundingClientRect();

    let scrollX = 0;
    let scrollY = 0;

    // Check if near edges
    if (clientX < containerRect.left + autoScrollThreshold) {
      scrollX = -autoScrollSpeed;
    } else if (clientX > containerRect.right - autoScrollThreshold) {
      scrollX = autoScrollSpeed;
    }

    if (clientY < containerRect.top + autoScrollThreshold) {
      scrollY = -autoScrollSpeed;
    } else if (clientY > containerRect.bottom - autoScrollThreshold) {
      scrollY = autoScrollSpeed;
    }

    if (scrollX !== 0 || scrollY !== 0) {
      autoScrollIntervalRef.current = setInterval(() => {
        container.scrollBy(scrollX, scrollY);
      }, 16); // ~60fps
    }
  };

  const getDragItemLabel = (item: DraggedItem): string => {
    switch (item.type) {
      case 'event':
        return `📅 ${item.data.title || 'Event'}`;
      case 'template':
        return `📋 ${item.data.name || 'Template'}`;
      case 'idea':
        return `💡 ${item.data.title || 'Idea'}`;
      default:
        return '📄 Item';
    }
  };

  const showDropFeedback = (success: boolean, dropZone: DropZone | null) => {
    if (!dropZone) return;

    const element = document.elementFromPoint(
      dropZone.position.x + dropZone.position.width / 2,
      dropZone.position.y + dropZone.position.height / 2
    );

    if (element) {
      element.classList.add(success ? 'drop-success' : 'drop-error');
      
      setTimeout(() => {
        element.classList.remove('drop-success', 'drop-error');
      }, 1000);
    }
  };

  const handleHealthcareDrop = async (draggedItem: DraggedItem, dropZone: DropZone): Promise<void> => {
    switch (draggedItem.type) {
      case 'event':
        await handleEventDrop(draggedItem, dropZone);
        break;
      case 'template':
        await handleTemplateDrop(draggedItem, dropZone);
        break;
      case 'idea':
        await handleIdeaDrop(draggedItem, dropZone);
        break;
    }
  };

  const handleEventDrop = async (draggedItem: DraggedItem, dropZone: DropZone) => {
    const event = draggedItem.data;
    
    switch (dropZone.type) {
      case 'date':
        // Move event to new date
        const newDate = dropZone.data.date;
        const duration = differenceInMinutes(event.endTime, event.startTime);
        
        const newStartTime = new Date(newDate);
        newStartTime.setHours(event.startTime.getHours(), event.startTime.getMinutes());
        
        const newEndTime = addMinutes(newStartTime, duration);
        
        toast({
          title: "Event Moved",
          description: `${event.title} moved to ${format(newStartTime, 'MMM dd, yyyy')}`,
        });
        break;
        
      case 'practice':
        // Move event to different practice
        const newPracticeId = dropZone.data.practiceId;
        
        toast({
          title: "Practice Changed",
          description: `${event.title} moved to ${newPracticeId}`,
        });
        break;
        
      case 'timeSlot':
        // Move event to specific time slot
        const timeSlot = dropZone.data.timeSlot;
        
        toast({
          title: "Time Updated",
          description: `${event.title} scheduled for ${timeSlot}`,
        });
        break;
    }
  };

  const handleTemplateDrop = async (draggedItem: DraggedItem, dropZone: DropZone) => {
    const template = draggedItem.data;
    
    if (dropZone.type === 'date') {
      // Create new event from template
      const newDate = dropZone.data.date;
      
      toast({
        title: "Event Created",
        description: `New ${template.name} event created for ${format(newDate, 'MMM dd, yyyy')}`,
      });
    }
  };

  const handleIdeaDrop = async (draggedItem: DraggedItem, dropZone: DropZone) => {
    const idea = draggedItem.data;
    
    if (dropZone.type === 'date') {
      // Convert idea to scheduled event
      const newDate = dropZone.data.date;
      
      toast({
        title: "Idea Scheduled",
        description: `${idea.title} scheduled for ${format(newDate, 'MMM dd, yyyy')}`,
      });
    }
  };

  // Multi-selection support
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectAll = useCallback((items: string[]) => {
    setSelectedItems(items);
  }, []);

  // Accessibility support
  const handleKeyboardDrag = useCallback((
    itemId: string,
    direction: 'up' | 'down' | 'left' | 'right'
  ) => {
    // Implement keyboard-based dragging for accessibility
    const item = draggedItem || { id: itemId } as DraggedItem;
    
    // Calculate new position based on direction
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'left':
        deltaX = -options.gridSize;
        break;
      case 'right':
        deltaX = options.gridSize;
        break;
      case 'up':
        deltaY = -options.gridSize;
        break;
      case 'down':
        deltaY = options.gridSize;
        break;
    }
    
    setCurrentPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, [draggedItem, options.gridSize]);

  return {
    // State
    isDragging,
    draggedItem,
    currentPosition,
    activeDropZone,
    selectedItems,
    isMultiSelecting,
    
    // Actions
    startDrag,
    endDrag,
    cancelDrag,
    
    // Selection
    toggleItemSelection,
    clearSelection,
    selectAll,
    
    // Accessibility
    handleKeyboardDrag,
    
    // Utilities
    registerDropZones,
    
    // Refs
    containerRef
  };
} 