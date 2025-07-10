import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const TaskFormModal = ({ visible, task, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'assignment',
    dueDate: '',
    dueTime: '23:59',
    estimatedHours: 1,
    priority: 'medium',
    status: 'pending',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    if (task) {
      // Create a date that's explicitly in local time zone
      const taskDate = new Date(task.dueDate);
      const year = taskDate.getFullYear();
      const month = taskDate.getMonth();
      const day = taskDate.getDate();
      
      // Create a fresh date with the local components
      const localTaskDate = new Date(year, month, day, 12, 0, 0);
      
      const timeDate = new Date();
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        timeDate.setHours(parseInt(hours), parseInt(minutes));
      }
      
      // Get YYYY-MM-DD format using local values to prevent timezone shift
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      setFormData({
        title: task.title,
        description: task.description || '',
        subject: task.subject,
        type: task.type || 'assignment',
        dueDate: dateString,
        dueTime: task.dueTime || '23:59',
        estimatedHours: task.estimatedHours || 1,
        priority: task.priority,
        status: task.status,
      });
      setSelectedDate(localTaskDate);
      setSelectedTime(timeDate);
      setTempDate(localTaskDate);
      setTempTime(timeDate);
    } else {
      // Create date that's explicitly in local time zone with no offset issues
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      
      // Create a fresh date object with local components
      const today = new Date(year, month, day, 12, 0, 0);
      
      const defaultTime = new Date();
      defaultTime.setHours(23, 59);
      
      // Get YYYY-MM-DD format using local values to prevent timezone shift
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      setFormData({
        title: '',
        description: '',
        subject: '',
        type: 'assignment',
        dueDate: dateString,
        dueTime: '23:59',
        estimatedHours: 1,
        priority: 'medium',
        status: 'pending',
      });
      setSelectedDate(today);
      setSelectedTime(defaultTime);
      setTempDate(today);
      setTempTime(defaultTime);
    }
  }, [task, visible]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        // Extract local date components
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        // Create a fresh date using local components
        const localDate = new Date(year, month, day, 12, 0, 0);
        
        // Format date string explicitly to avoid timezone issues
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        setSelectedDate(localDate);
        setTempDate(localDate);
        setFormData(prev => ({
          ...prev,
          dueDate: dateString,
        }));
      }
    } else {
      // On iOS, only update tempDate while scrolling
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleDateConfirm = () => {
    // Extract local date components
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const day = tempDate.getDate();
    
    // Create a fresh date using local components
    const localDate = new Date(year, month, day, 12, 0, 0);
    
    // Format date string explicitly to avoid timezone issues
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setSelectedDate(localDate);
    setFormData(prev => ({
      ...prev,
      dueDate: dateString,
    }));
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(selectedDate); // Reset to original date
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(selectedDate); // Initialize temp date with current selection
    setShowDatePicker(true);
  };

  const handleTimeChange = (event, time) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (time) {
        setSelectedTime(time);
        setTempTime(time);
        const timeString = time.toTimeString().slice(0, 5);
        setFormData(prev => ({
          ...prev,
          dueTime: timeString,
        }));
      }
    } else {
      // On iOS, only update tempTime while scrolling
      if (time) {
        setTempTime(time);
      }
    }
  };

  const handleTimeConfirm = () => {
    setSelectedTime(tempTime);
    const timeString = tempTime.toTimeString().slice(0, 5);
    setFormData(prev => ({
      ...prev,
      dueTime: timeString,
    }));
    setShowTimePicker(false);
  };

  const handleTimeCancel = () => {
    setTempTime(selectedTime); // Reset to original time
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    setTempTime(selectedTime); // Initialize temp time with current selection
    setShowTimePicker(true);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select Date';

    // Manually parse the 'YYYY-MM-DD' string to avoid timezone issues.
    // `new Date('YYYY-MM-DD')` is parsed as UTC, which can cause off-by-one-day errors.
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create a date in the local timezone by providing components. Month is 0-indexed.
    const localDate = new Date(year, month - 1, day);

    return localDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return false;
    }
    if (!formData.subject.trim()) {
      Alert.alert('Error', 'Subject is required');
      return false;
    }
    if (!formData.dueDate) {
      Alert.alert('Error', 'Due date is required');
      return false;
    }
    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) {
      Alert.alert('Error', 'Estimated hours must be between 0.5 and 100');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Parse the date parts
    const [year, month, day] = formData.dueDate.split('-').map(part => parseInt(part, 10));
    // Parse the time parts
    const [hours, minutes] = formData.dueTime.split(':').map(part => parseInt(part, 10));
    
    // Create a date using local components (month is 0-indexed in JS Date)
    const localDate = new Date(year, month - 1, day, hours, minutes, 0);
    
    const submitData = {
      ...formData,
      dueDate: localDate.toISOString(),
      estimatedHours: parseFloat(formData.estimatedHours),
    };

    onSubmit(submitData);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const typeOptions = [
    { label: 'Assignment', value: 'assignment' },
    { label: 'Exam', value: 'exam' },
    { label: 'Project', value: 'project' },
    { label: 'Reading', value: 'reading' },
    { label: 'Other', value: 'other' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'low', color: '#10b981' },
    { label: 'Medium', value: 'medium', color: '#f59e0b' },
    { label: 'High', value: 'high', color: '#ef4444' },
  ];

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>{task ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Task Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter task title"
              multiline
            />
          </View>

          {/* Subject */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(value) => handleInputChange('subject', value)}
              placeholder="e.g., Mathematics, History, Science"
            />
          </View>

          {/* Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.optionGrid}>
              {typeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.gridOptionButton,
                    formData.type === option.value && styles.selectedGridOption,
                  ]}
                  onPress={() => handleInputChange('type', option.value)}
                >
                  <Text
                    style={[
                      styles.gridOptionText,
                      formData.type === option.value && styles.selectedGridOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Add task details..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Due Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={openDatePicker}
            >
              <Ionicons name="calendar-outline" size={20} color="#667eea" />
              <Text style={styles.dateButtonText}>
                {formatDisplayDate(formData.dueDate)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity
                      style={[styles.datePickerButton, styles.cancelButton]}
                      onPress={handleDateCancel}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.datePickerButton, styles.confirmButton]}
                      onPress={handleDateConfirm}
                    >
                      <Text style={styles.confirmButtonText}>Select Date</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Time and Hours Row */}
          <View style={styles.formRow}>
            {/* Time */}
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={openTimePicker}
              >
                <Ionicons name="time-outline" size={20} color="#667eea" />
                <Text style={styles.dateButtonText}>
                  {formData.dueTime}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
              
              {showTimePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={styles.datePickerButtons}>
                      <TouchableOpacity
                        style={[styles.datePickerButton, styles.cancelButton]}
                        onPress={handleTimeCancel}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.datePickerButton, styles.confirmButton]}
                        onPress={handleTimeConfirm}
                      >
                        <Text style={styles.confirmButtonText}>Select Time</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Hours */}
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Hours</Text>
              <TextInput
                style={styles.input}
                value={formData.estimatedHours.toString()}
                onChangeText={(value) => handleInputChange('estimatedHours', parseFloat(value) || 1)}
                placeholder="1"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Priority */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionGroup}>
              {priorityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.priority === option.value && styles.selectedOption,
                    { borderColor: option.color },
                    formData.priority === option.value && { backgroundColor: option.color },
                  ]}
                  onPress={() => handleInputChange('priority', option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: formData.priority === option.value ? '#fff' : option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.optionGroup}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.status === option.value && styles.selectedStatusOption,
                  ]}
                  onPress={() => handleInputChange('status', option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.status === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
    marginLeft: 10,
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 10,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#667eea',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedGridOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  gridOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedGridOptionText: {
    color: '#fff',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  selectedOption: {
    borderColor: '#667eea',
  },
  selectedStatusOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedOptionText: {
    color: '#fff',
  },
});

export default TaskFormModal; 