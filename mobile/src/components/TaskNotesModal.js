import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useNotes } from '../context/NotesContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TaskNotesModal = ({ visible, onClose, task }) => {
  const {
    getTaskNotesFromState,
    fetchTaskNotes,
    createNote,
    updateNote,
    deleteNote,
    noteTemplates,
    loading,
    error
  } = useNotes();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    content: '',
    template: 'blank'
  });

  // Load notes when modal opens
  useEffect(() => {
    if (visible && task) {
      loadTaskNotes();
    }
  }, [visible, task]);

  const loadTaskNotes = async () => {
    if (!task) return;
    
    // Try to get from state first
    let taskNotes = getTaskNotesFromState(task._id);
    
    // If not in state, fetch from API
    if (taskNotes.length === 0) {
      taskNotes = await fetchTaskNotes(task._id);
    }
    
    setNotes(taskNotes);
    if (taskNotes.length > 0 && !selectedNote) {
      setSelectedNote(taskNotes[0]);
    }
  };

  const handleCreateNote = async () => {
    if (!createFormData.title.trim()) {
      Alert.alert('Error', 'Please enter a note title');
      return;
    }

    const noteData = {
      taskId: task._id,
      title: createFormData.title,
      content: createFormData.content || '',
      template: createFormData.template
    };

    const result = await createNote(noteData);
    
    if (result.success) {
      const updatedNotes = [result.note, ...notes];
      setNotes(updatedNotes);
      setSelectedNote(result.note);
      setShowCreateForm(false);
      setCreateFormData({ title: '', content: '', template: 'blank' });
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    const result = await updateNote(noteId, updatedData);
    
    if (result.success) {
      const updatedNotes = notes.map(note => 
        note._id === noteId ? result.note : note
      );
      setNotes(updatedNotes);
      setSelectedNote(result.note);
      setIsEditing(false);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteNote(noteId);
            
            if (result.success) {
              const updatedNotes = notes.filter(note => note._id !== noteId);
              setNotes(updatedNotes);
              
              if (selectedNote && selectedNote._id === noteId) {
                setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
              }
            } else {
              Alert.alert('Error', result.message);
            }
          }
        }
      ]
    );
  };

  const renderNotesList = () => (
    <View style={styles.notesList}>
      <View style={styles.notesHeader}>
        <Text style={styles.notesTitle}>Notes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateForm(true)}
        >
          <Ionicons name="add" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notesScrollView}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notes yet</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.createFirstButtonText}>Create your first note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          notes.map(note => (
            <TouchableOpacity
              key={note._id}
              style={[
                styles.noteItem,
                selectedNote?._id === note._id && styles.selectedNoteItem
              ]}
              onPress={() => setSelectedNote(note)}
            >
              <Text style={styles.noteItemTitle}>{note.title}</Text>
              <Text style={styles.noteItemPreview} numberOfLines={2}>
                {note.content.substring(0, 100)}...
              </Text>
              <Text style={styles.noteItemDate}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderNoteEditor = () => {
    if (!selectedNote) {
      return (
        <View style={styles.noNoteSelected}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.noNoteText}>Select a note to view</Text>
        </View>
      );
    }

    return (
      <NoteEditor
        note={selectedNote}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleUpdateNote}
        onDelete={handleDeleteNote}
        onCancel={() => setIsEditing(false)}
      />
    );
  };

  const renderCreateForm = () => (
    <Modal
      visible={showCreateForm}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.createFormContainer}>
        <View style={styles.createFormHeader}>
          <TouchableOpacity onPress={() => setShowCreateForm(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.createFormTitle}>New Note</Text>
          <TouchableOpacity onPress={handleCreateNote}>
            <Text style={styles.saveButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.createFormContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Template</Text>
            <View style={styles.templateSelector}>
              {noteTemplates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateOption,
                    createFormData.template === template.id && styles.selectedTemplate
                  ]}
                  onPress={() => setCreateFormData(prev => ({
                    ...prev,
                    template: template.id
                  }))}
                >
                  <Text style={[
                    styles.templateText,
                    createFormData.template === template.id && styles.selectedTemplateText
                  ]}>
                    {template.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              value={createFormData.title}
              onChangeText={(text) => setCreateFormData(prev => ({
                ...prev,
                title: text
              }))}
              placeholder="Enter note title"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              value={createFormData.content}
              onChangeText={(text) => setCreateFormData(prev => ({
                ...prev,
                content: text
              }))}
              placeholder="Start writing your note... (Markdown supported)"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {task ? `${task.title} - Notes` : 'Notes'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.sidebar}>
            {renderNotesList()}
          </View>
          <View style={styles.editor}>
            {renderNoteEditor()}
          </View>
        </View>

        {renderCreateForm()}
      </SafeAreaView>
    </Modal>
  );
};

// NoteEditor component
const NoteEditor = ({ note, isEditing, onEdit, onSave, onDelete, onCancel }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note, isEditing]);

  const handleSave = () => {
    onSave(note._id, { title, content });
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    onCancel();
  };

  if (isEditing) {
    return (
      <View style={styles.editorContainer}>
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editorTitle}>Edit Note</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editorContent}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Note title"
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={styles.contentEditor}
            value={content}
            onChangeText={setContent}
            placeholder="Write your note... (Markdown supported)"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.editorContainer}>
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={() => onDelete(note._id)}>
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
        <Text style={styles.editorTitle}>{note.title}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="pencil-outline" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.editorContent}>
        <Markdown style={markdownStyles}>{content}</Markdown>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '40%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  editor: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  notesList: {
    flex: 1,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  notesScrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    marginBottom: 16,
  },
  createFirstButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  selectedNoteItem: {
    backgroundColor: '#f0f4ff',
  },
  noteItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noteItemPreview: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  noteItemDate: {
    fontSize: 11,
    color: '#999',
  },
  noNoteSelected: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noNoteText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  editorContainer: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  editorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editorContent: {
    flex: 1,
    padding: 16,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  cancelButton: {
    color: '#999',
    fontSize: 16,
  },
  saveButton: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  contentEditor: {
    fontSize: 14,
    color: '#333',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  createFormContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  createFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  createFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  createFormContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  templateSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedTemplate: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  templateText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTemplateText: {
    color: '#fff',
  },
  contentInput: {
    fontSize: 14,
    color: '#333',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});

const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  heading1: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  code_inline: {
    backgroundColor: '#f1f3f4',
    padding: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  blockquote: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
};

export default TaskNotesModal; 