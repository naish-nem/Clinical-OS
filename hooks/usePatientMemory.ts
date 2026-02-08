import { useState, useEffect, useCallback } from 'react';

export interface MemoryItem {
    id: string;
    type: 'fact' | 'medication' | 'allergy' | 'diagnosis' | 'note';
    content: string;
    source: string;           // Where this came from (e.g., "Encounter 2024-02-08")
    createdAt: string;
    isPinned: boolean;
}

export interface PatientMemory {
    patientId: number;
    items: MemoryItem[];
    lastUpdated: string;
}

const STORAGE_KEY_PREFIX = 'clinical_os_patient_memory_';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const usePatientMemory = (patientId: number) => {
    const [memory, setMemory] = useState<PatientMemory>({
        patientId,
        items: [],
        lastUpdated: new Date().toISOString()
    });

    const storageKey = `${STORAGE_KEY_PREFIX}${patientId}`;

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as PatientMemory;
                setMemory(parsed);
            }
        } catch (e) {
            console.error('Failed to load patient memory:', e);
        }
    }, [patientId, storageKey]);

    // Save to localStorage whenever memory changes
    const saveMemory = useCallback((newMemory: PatientMemory) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(newMemory));
            setMemory(newMemory);
        } catch (e) {
            console.error('Failed to save patient memory:', e);
        }
    }, [storageKey]);

    // Add a new memory item
    const addItem = useCallback((item: Omit<MemoryItem, 'id' | 'createdAt' | 'isPinned'>) => {
        const newItem: MemoryItem = {
            ...item,
            id: generateId(),
            createdAt: new Date().toISOString(),
            isPinned: false
        };

        const newMemory: PatientMemory = {
            ...memory,
            items: [newItem, ...memory.items],
            lastUpdated: new Date().toISOString()
        };

        saveMemory(newMemory);
        return newItem;
    }, [memory, saveMemory]);

    // Pin/unpin an item
    const togglePin = useCallback((itemId: string) => {
        const newItems = memory.items.map(item =>
            item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
        );

        // Sort to put pinned items first
        newItems.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const newMemory: PatientMemory = {
            ...memory,
            items: newItems,
            lastUpdated: new Date().toISOString()
        };

        saveMemory(newMemory);
    }, [memory, saveMemory]);

    // Forget (delete) an item
    const forgetItem = useCallback((itemId: string) => {
        const newMemory: PatientMemory = {
            ...memory,
            items: memory.items.filter(item => item.id !== itemId),
            lastUpdated: new Date().toISOString()
        };

        saveMemory(newMemory);
    }, [memory, saveMemory]);

    // Clear all memory for this patient
    const clearAll = useCallback(() => {
        const newMemory: PatientMemory = {
            patientId,
            items: [],
            lastUpdated: new Date().toISOString()
        };

        saveMemory(newMemory);
    }, [patientId, saveMemory]);

    // Get items by type
    const getItemsByType = useCallback((type: MemoryItem['type']) => {
        return memory.items.filter(item => item.type === type);
    }, [memory.items]);

    // Get pinned items
    const getPinnedItems = useCallback(() => {
        return memory.items.filter(item => item.isPinned);
    }, [memory.items]);

    return {
        memory,
        items: memory.items,
        addItem,
        togglePin,
        forgetItem,
        clearAll,
        getItemsByType,
        getPinnedItems
    };
};
