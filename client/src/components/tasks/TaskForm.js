import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../../context/TaskContext';
import { X, Save } from 'lucide-react';
import { format } from 'date-fns';

const TaskForm = ({ isOpen, onClose, onTaskCreated, editingTask }) => {
  const { createTask, updateTask, loading } = useTask();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'assignment',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    dueTime: '23:59',
    estimatedHours: 1
  });
  const [errors, setErrors] = useState({});

  const modalRef = useRef();

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        subject: editingTask.subject,
        type: editingTask.type,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: format(new Date(editingTask.dueDate), 'yyyy-MM-dd'),
        dueTime: editingTask.dueTime,
        estimatedHours: editingTask.estimatedHours
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subject: '',
        type: 'assignment',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        dueTime: '23:59',
        estimatedHours: 1
      });
    }
  }, [editingTask, isOpen]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } 
    // else {
    //   const selectedDate = new Date(formData.dueDate);
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);
      
    //   if (selectedDate < today) {
    //     newErrors.dueDate = 'Due date cannot be in the past';
    //   }
    // }
    
    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) {
      newErrors.estimatedHours = 'Estimated hours must be between 0.5 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      dueDate: new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString(),
      estimatedHours: parseFloat(formData.estimatedHours)
    };

    let result;
    if (editingTask) {
      result = await updateTask(editingTask._id, taskData);
    } else {
      result = await createTask(taskData);
    }

    if (result.success) {
      onTaskCreated();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out dark:bg-opacity-70">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-scale-in dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-700 dark:text-gray-300">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-6">
          <InputField label="Task Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} required />
          <TextareaField label="Description" name="description" value={formData.description} onChange={handleChange} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Subject" name="subject" value={formData.subject} onChange={handleChange} error={errors.subject} required />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} error={errors.dueDate} required />
            <InputField label="Due Time" name="dueTime" type="time" value={formData.dueTime} onChange={handleChange} />
          </div>

          <InputField label="Estimated Hours" name="estimatedHours" type="number" value={formData.estimatedHours} onChange={handleChange} error={errors.estimatedHours} step="0.5" />

        </form>

        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl dark:bg-gray-900/50 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="ml-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
      className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
      className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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

export default TaskForm; 