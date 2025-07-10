import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [taskNotes, setTaskNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const { token, API_BASE_URL } = useAuth();

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Update auth header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      fetchNoteTemplates();
      // Start periodic sync
      startPeriodicSync();
    } else {
      setNotes([]);
      setTaskNotes({});
      setNoteTemplates([]);
      setLastSyncTime(null);
      // Stop periodic sync
      stopPeriodicSync();
    }
  }, [token]);

  // Periodic sync state
  const [syncInterval, setSyncInterval] = useState(null);

  // Start periodic sync every 30 seconds
  const startPeriodicSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        await syncNotesInBackground();
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }, 30000); // 30 seconds
    
    setSyncInterval(interval);
  };

  // Stop periodic sync
  const stopPeriodicSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPeriodicSync();
    };
  }, []);

  // Background sync for notes updates
  const syncNotesInBackground = async () => {
    try {
      // Get all notes with last modified timestamp
      const response = await api.get('/notes', {
        params: lastSyncTime ? { since: lastSyncTime } : {}
      });
      
      const latestNotes = response.data.data || [];
      
      if (latestNotes.length > 0) {
        // Update notes list with latest data
        setNotes(prev => {
          const noteMap = new Map(prev.map(note => [note._id, note]));
          
          latestNotes.forEach(note => {
            noteMap.set(note._id, note);
          });
          
          return Array.from(noteMap.values()).sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        });
        
        // Update task-specific notes cache
        setTaskNotes(prev => {
          const updated = { ...prev };
          
          latestNotes.forEach(note => {
            if (note.task) {
              if (!updated[note.task]) {
                updated[note.task] = [];
              }
              
              const taskNoteIndex = updated[note.task].findIndex(n => n._id === note._id);
              if (taskNoteIndex >= 0) {
                updated[note.task][taskNoteIndex] = note;
              } else {
                updated[note.task] = [note, ...updated[note.task]];
              }
              
              // Sort by update time
              updated[note.task].sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
              );
            }
          });
          
          return updated;
        });
        
        // Update last sync time
        setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      // Silently fail background sync to avoid disrupting user experience
      console.warn('Background notes sync failed:', error.message);
    }
  };

  // Force sync notes manually
  const forceSync = async () => {
    setLoading(true);
    try {
      await syncNotesInBackground();
    } finally {
      setLoading(false);
    }
  };

  // Fetch note templates
  const fetchNoteTemplates = async () => {
    try {
      const response = await api.get('/notes/templates');
      setNoteTemplates(response.data.data || []);
    } catch (error) {
      console.error('Fetch templates error:', error);
    }
  };

  // Fetch notes for a specific task
  const fetchTaskNotes = async (taskId) => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/task/${taskId}`);
      const taskNotesData = response.data.data || [];
      
      setTaskNotes(prev => ({
        ...prev,
        [taskId]: taskNotesData
      }));
      
      setError(null);
      return taskNotesData;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch task notes');
      console.error('Fetch task notes error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all notes for user
  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data.data || []);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch notes');
      console.error('Fetch notes error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (noteData) => {
    try {
      const response = await api.post('/notes', noteData);
      const newNote = response.data.data;
      
      // Update notes list
      setNotes(prev => [newNote, ...prev]);
      
      // Update task-specific notes if taskId provided
      if (noteData.taskId) {
        setTaskNotes(prev => ({
          ...prev,
          [noteData.taskId]: [newNote, ...(prev[noteData.taskId] || [])]
        }));
      }
      
      return { success: true, note: newNote };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create note';
      setError(message);
      return { success: false, message };
    }
  };

  // Update an existing note
  const updateNote = async (noteId, noteData) => {
    try {
      const response = await api.put(`/notes/${noteId}`, noteData);
      const updatedNote = response.data.data;
      
      // Update notes list
      setNotes(prev => 
        prev.map(note => 
          note._id === noteId ? updatedNote : note
        )
      );
      
      // Update task-specific notes
      if (updatedNote.task) {
        setTaskNotes(prev => ({
          ...prev,
          [updatedNote.task]: (prev[updatedNote.task] || []).map(note =>
            note._id === noteId ? updatedNote : note
          )
        }));
      }
      
      return { success: true, note: updatedNote };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      setError(message);
      return { success: false, message };
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      
      // Remove from notes list
      setNotes(prev => prev.filter(note => note._id !== noteId));
      
      // Remove from task-specific notes
      setTaskNotes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(taskId => {
          updated[taskId] = updated[taskId].filter(note => note._id !== noteId);
        });
        return updated;
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      setError(message);
      return { success: false, message };
    }
  };

  // Get note by ID
  const getNoteById = async (noteId) => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      return { success: true, note: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch note';
      setError(message);
      return { success: false, message };
    }
  };

  // Get notes for a specific task from state
  const getTaskNotesFromState = (taskId) => {
    return taskNotes[taskId] || [];
  };

  const value = {
    notes,
    taskNotes,
    noteTemplates,
    loading,
    error,
    lastSyncTime,
    fetchTaskNotes,
    fetchAllNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getTaskNotesFromState,
    forceSync,
    clearError: () => setError(null),
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}; 