import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Edit3, Plus, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useTask } from '../../context/TaskContext';
import ReactMarkdown from 'react-markdown';

const TaskDetailModal = ({ isOpen, onClose, task, onTaskSaved }) => {
  const { updateTask, loading } = useTask();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  const modalRef = useRef();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        subject: task.subject,
        type: task.type,
        priority: task.priority,
        status: task.status,
        dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
        dueTime: task.dueTime,
        estimatedHours: task.estimatedHours
      });
      fetchNotes();
    }
  }, [task]);

  const fetchNotes = async () => {
    if (!task) return;
    try {
      // Assuming you have a way to get the auth token
      const token = localStorage.getItem('token'); 
      const response = await fetch(`/api/notes/task/${task._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(response.ok) {
        const data = await response.json();
        setNotes(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const handleNoteCreated = (newNote) => {
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setShowNoteForm(false);
  };
  
  const handleNoteUpdated = (updatedNote) => {
    setNotes(prev => prev.map(n => n._id === updatedNote._id ? updatedNote : n));
    setSelectedNote(updatedNote);
  };

  const handleNoteDeleted = (noteId) => {
    setNotes(prev => prev.filter(n => n._id !== noteId));
    if (selectedNote && selectedNote._id === noteId) {
      setSelectedNote(null);
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation logic here...
    const taskData = { ...formData };
    const result = await updateTask(task._id, taskData);
    if (result.success) {
      onTaskSaved();
    }
  };

  if (!isOpen || !formData) return null;

  const renderDetailsTab = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 dark:bg-gray-800">
      <InputField label="Task Title" name="title" value={formData.title} onChange={handleChange} required />
      <TextareaField label="Description" name="description" value={formData.description} onChange={handleChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
        <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={[
            { value: 'assignment', label: 'Assignment' },
            { value: 'exam', label: 'Exam' },
            { value: 'project', label: 'Project' },
            { value: 'reading', label: 'Reading' },
            { value: 'other', label: 'Other' },
        ]} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField label="Priority" name="priority" value={formData.priority} onChange={handleChange} options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
        ]} />
        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={[
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
        ]} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
        <InputField label="Due Time" name="dueTime" type="time" value={formData.dueTime} onChange={handleChange} />
        <InputField label="Estimated Hours" name="estimatedHours" type="number" value={formData.estimatedHours} onChange={handleChange} step="0.5" />
      </div>
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            disabled={loading}
        >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  const renderNotesTab = () => (
    <div className="flex h-full bg-gray-50 dark:bg-gray-800">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg dark:text-gray-200">Notes ({notes.length})</h3>
          <button onClick={() => setShowNoteForm(true)} className="p-2 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {notes.map(note => (
            <div
              key={note._id}
              onClick={() => setSelectedNote(note)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700/50 cursor-pointer ${selectedNote?._id === note._id ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
            >
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{note.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{note.content.substring(0, 50)}...</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDistanceToNow(new Date(note.updatedAt))} ago</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedNote ? (
          <NoteEditor 
            key={selectedNote._id}
            note={selectedNote}
            onUpdate={handleNoteUpdated}
            onDelete={handleNoteDeleted}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div>
              <FileText size={48} className="mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">Select a note</h3>
              <p>Choose a note from the list to view or edit it.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out dark:bg-opacity-70">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-scale-in dark:bg-gray-900">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{task.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<FileText size={16} />} label="Details" />
            <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<Edit3 size={16} />} label="Notes" />
        </div>

        <div className="flex-grow overflow-hidden">
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'notes' && renderNotesTab()}
        </div>
      </div>
      {showNoteForm && <NoteFormModal taskId={task._id} onClose={() => setShowNoteForm(false)} onNoteCreated={handleNoteCreated} />}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
            ${active
                ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-gray-900 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            } transition-all duration-200 ease-in-out focus:outline-none`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const InputField = ({ label, name, type = "text", value, onChange, error, required, ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
  
  const TextareaField = ({ label, name, value, onChange, ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        {...props}
      ></textarea>
    </div>
  );
  
  const SelectField = ({ label, name, value, onChange, options, required }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
);

const NoteEditor = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note);

  const handleSave = async () => {
    // Here you would call your API to save the note
    onUpdate(editedNote);
    setIsEditing(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center dark:border-gray-700">
        {isEditing ? (
          <input 
            type="text"
            value={editedNote.title}
            onChange={(e) => setEditedNote({...editedNote, title: e.target.value})}
            className="text-xl font-bold bg-transparent focus:outline-none focus:border-b dark:text-gray-200 w-full"
          />
        ) : (
          <h3 className="text-xl font-bold dark:text-gray-200">{note.title}</h3>
        )}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button onClick={handleSave} className="p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              <Save size={18} />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
              <Edit3 size={18} />
            </button>
          )}
          <button onClick={() => onDelete(note._id)} className="p-2 rounded-md hover:bg-red-100 text-red-600 dark:hover:bg-red-900/50 dark:text-red-400">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="flex-grow p-6 overflow-y-auto">
        {isEditing ? (
          <textarea
            value={editedNote.content}
            onChange={(e) => setEditedNote({...editedNote, content: e.target.value})}
            className="w-full h-full bg-gray-50 dark:bg-gray-900 dark:text-gray-200 p-4 rounded-md focus:outline-none"
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

const NoteFormModal = ({ taskId, onClose, onNoteCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const modalRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!title.trim() || !content.trim()) return;
    
    // API call to create note
    const token = localStorage.getItem('token');
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, task: taskId })
    });

    if (response.ok) {
      const newNote = await response.json();
      onNoteCreated(newNote.data);
      onClose();
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-200">New Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextareaField label="Content" name="content" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Create Note</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskDetailModal; 