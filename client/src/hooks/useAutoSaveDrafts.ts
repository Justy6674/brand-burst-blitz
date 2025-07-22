import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from './use-toast';

interface DraftIdea {
  id: string;
  content: string;
  type: 'voice' | 'sketch' | 'text';
  practiceId: string;
  timestamp: number;
  autoSaved: boolean;
  sketch_data?: string;
  voice_transcript?: string;
  ai_analysis?: string;
  ahpra_compliance_score?: number;
}

interface AutoSaveOptions {
  enabled: boolean;
  interval: number; // Auto-save interval in milliseconds
  practiceId: string;
  onDraftRestored?: (draft: DraftIdea) => void;
  onAutoSaveComplete?: (draftId: string) => void;
}

export function useAutoSaveDrafts({
  enabled = true,
  interval = 10000, // 10 seconds
  practiceId,
  onDraftRestored,
  onAutoSaveComplete
}: AutoSaveOptions) {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftIdea[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const dbRef = useRef<IDBDatabase | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    initializeDB();
  }, []);

  // Auto-save timer
  useEffect(() => {
    if (!enabled || !isInitialized) return;

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      checkAndAutoSave();
    }, interval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, isInitialized, interval]);

  const initializeDB = async () => {
    try {
      const request = indexedDB.open('HealthcareIdeasDrafts', 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
      };

      request.onsuccess = () => {
        dbRef.current = request.result;
        setIsInitialized(true);
        loadExistingDrafts();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('drafts')) {
          const store = db.createObjectStore('drafts', { keyPath: 'id' });
          store.createIndex('practiceId', 'practiceId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  };

  const loadExistingDrafts = async () => {
    if (!dbRef.current) return;

    try {
      const transaction = dbRef.current.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const index = store.index('practiceId');
      const request = index.getAll(practiceId);

      request.onsuccess = () => {
        const loadedDrafts = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10); // Keep only latest 10 drafts

        setDrafts(loadedDrafts);
        
        // Check for recent unsaved drafts
        const recentDraft = loadedDrafts.find(
          draft => Date.now() - draft.timestamp < 300000 && draft.autoSaved // 5 minutes
        );

        if (recentDraft && onDraftRestored) {
          toast({
            title: "📝 Draft Recovered",
            description: `Found unsaved healthcare idea from ${new Date(recentDraft.timestamp).toLocaleTimeString()}`,
          });
          onDraftRestored(recentDraft);
        }
      };
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const saveDraft = useCallback(async (draft: Partial<DraftIdea>, autoSave = false): Promise<string | null> => {
    if (!dbRef.current || !draft.content) return null;

    try {
      const draftToSave: DraftIdea = {
        id: draft.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: draft.content,
        type: draft.type || 'text',
        practiceId: draft.practiceId || practiceId,
        timestamp: Date.now(),
        autoSaved: autoSave,
        sketch_data: draft.sketch_data,
        voice_transcript: draft.voice_transcript,
        ai_analysis: draft.ai_analysis,
        ahpra_compliance_score: draft.ahpra_compliance_score
      };

      const transaction = dbRef.current.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.put(draftToSave);

      request.onsuccess = () => {
        setDrafts(prev => {
          const updated = prev.filter(d => d.id !== draftToSave.id);
          return [draftToSave, ...updated].slice(0, 10); // Keep only latest 10
        });

        setLastSaveTime(Date.now());

        if (autoSave) {
          onAutoSaveComplete?.(draftToSave.id);
        } else {
          toast({
            title: "💾 Draft Saved",
            description: "Healthcare idea saved locally",
          });
        }
      };

      request.onerror = () => {
        console.error('Failed to save draft');
        toast({
          title: "Save Failed",
          description: "Could not save draft locally",
          variant: "destructive"
        });
      };

      return draftToSave.id;
    } catch (error) {
      console.error('Error saving draft:', error);
      return null;
    }
  }, [dbRef, practiceId, toast, onAutoSaveComplete]);

  const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
    if (!dbRef.current) return false;

    try {
      const transaction = dbRef.current.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.delete(draftId);

      request.onsuccess = () => {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        toast({
          title: "🗑️ Draft Deleted",
          description: "Draft removed from local storage",
        });
      };

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }, [dbRef, toast]);

  const clearAllDrafts = useCallback(async (): Promise<boolean> => {
    if (!dbRef.current) return false;

    try {
      const transaction = dbRef.current.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const index = store.index('practiceId');
      const request = index.getAll(practiceId);

      request.onsuccess = () => {
        const draftIds = request.result.map(draft => draft.id);
        
        draftIds.forEach(id => {
          store.delete(id);
        });

        setDrafts([]);
        toast({
          title: "🧹 All Drafts Cleared",
          description: "All local drafts have been removed",
        });
      };

      return true;
    } catch (error) {
      console.error('Error clearing drafts:', error);
      return false;
    }
  }, [dbRef, practiceId, toast]);

  const checkAndAutoSave = useCallback(() => {
    // This will be called by components that have unsaved content
    const event = new CustomEvent('healthcareAutoSave', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }, []);

  // Auto-save trigger for components
  const triggerAutoSave = useCallback((draftData: Partial<DraftIdea>) => {
    if (!enabled || !draftData.content) return;

    // Only auto-save if content has changed significantly
    const wordCount = draftData.content.split(' ').length;
    if (wordCount < 3) return; // Don't save very short content

    const now = Date.now();
    if (now - lastSaveTime < 5000) return; // Debounce - max once per 5 seconds

    saveDraft(draftData, true);
  }, [enabled, lastSaveTime, saveDraft]);

  const restoreDraft = useCallback((draftId: string): DraftIdea | null => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft && onDraftRestored) {
      onDraftRestored(draft);
      return draft;
    }
    return null;
  }, [drafts, onDraftRestored]);

  const exportDrafts = useCallback((): string => {
    const exportData = {
      practiceId,
      exportDate: new Date().toISOString(),
      drafts: drafts.map(draft => ({
        ...draft,
        exported: true
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthcare-drafts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);

    toast({
      title: "📤 Drafts Exported",
      description: "All drafts exported to JSON file",
    });

    return dataStr;
  }, [drafts, practiceId, toast]);

  const importDrafts = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.drafts || !Array.isArray(importData.drafts)) {
        throw new Error('Invalid draft file format');
      }

      let importedCount = 0;
      for (const draft of importData.drafts) {
        await saveDraft({
          ...draft,
          id: `imported_${Date.now()}_${importedCount}`,
          timestamp: Date.now(),
          autoSaved: false
        });
        importedCount++;
      }

      toast({
        title: "📥 Drafts Imported",
        description: `Successfully imported ${importedCount} drafts`,
      });

      return true;
    } catch (error) {
      console.error('Error importing drafts:', error);
      toast({
        title: "Import Failed",
        description: "Could not import draft file",
        variant: "destructive"
      });
      return false;
    }
  }, [saveDraft, toast]);

  return {
    drafts,
    isInitialized,
    saveDraft,
    deleteDraft,
    clearAllDrafts,
    triggerAutoSave,
    restoreDraft,
    exportDrafts,
    importDrafts,
    lastSaveTime
  };
} 