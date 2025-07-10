import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import TaskList from '../tasks/TaskList';
import TaskForm from '../tasks/TaskForm';
import Calendar from '../calendar/Calendar';
import { Plus, Calendar as CalendarIcon, List, BarChart3 } from 'lucide-react';
import TaskDetailModal from '../tasks/TaskDetailModal';
import Loading from '../common/Loading';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  
  const { user } = useAuth();
  const { fetchTasks, tasks, loading } = useTask();

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };
  const handleViewTaskDetail = (task) => {
    setSelectedTaskDetail(task);
    setShowTaskDetail(true);
  };
  const handleCloseTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTaskDetail(null);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  const getTodayTasksCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.dueDate.split('T')[0] === today && task.status !== 'completed'
    ).length;
  };

  const getOverdueTasksCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.dueDate.split('T')[0] < today && task.status !== 'completed'
    ).length;
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: List },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'stats', label: 'Statistics', icon: BarChart3 }
  ];

  if (loading && tasks.length === 0) {
    return <Loading text="Loading your dashboard..." />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '20px 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            Here's what's happening with your tasks today
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'inline-flex',
              marginBottom: '12px'
            }}>
              <BarChart3 size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: '#333' }}>
              {getCompletedTasksCount()}
            </h3>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Completed Tasks</p>
          </div>

          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #339af0 0%, #228be6 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'inline-flex',
              marginBottom: '12px'
            }}>
              <CalendarIcon size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: '#333' }}>
              {getTodayTasksCount()}
            </h3>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Due Today</p>
          </div>

          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'inline-flex',
              marginBottom: '12px'
            }}>
              <List size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: '#333' }}>
              {getOverdueTasksCount()}
            </h3>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Overdue</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 24px',
                    border: 'none',
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #4f63d2 100%)'
                      : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#666',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'tasks' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: 0,
                    color: '#333'
                  }}>
                    Your Tasks
                  </h2>
                  <div>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="btn btn-primary"
                    >
                      <Plus size={16} />
                      Add Task
                    </button>
                  </div>
                </div>
                <TaskList onEditTask={handleEditTask} onViewTask={handleViewTaskDetail} />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 24px 0',
                  color: '#333'
                }}>
                  Calendar View
                </h2>
                <Calendar />
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 24px 0',
                  color: '#333'
                }}>
                  Task Statistics
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#667eea' }}>Total Tasks</h3>
                    <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#333' }}>
                      {tasks.length}
                    </p>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: 'rgba(81, 207, 102, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(81, 207, 102, 0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#51cf66' }}>Completion Rate</h3>
                    <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#333' }}>
                      {tasks.length > 0 ? Math.round((getCompletedTasksCount() / tasks.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            task={editingTask}
            onClose={handleCloseForm}
            onTaskSaved={handleTaskCreated}
          />
        )}
        {/* Task Detail Modal */}
        {showTaskDetail && (
          <TaskDetailModal
            task={selectedTaskDetail}
            onClose={handleCloseTaskDetail}
            onTaskSaved={() => {
              handleCloseTaskDetail();
              fetchTasks();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 