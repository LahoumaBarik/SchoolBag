import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import TaskList from '../tasks/TaskList';
import TaskForm from '../tasks/TaskForm';
import Calendar from '../calendar/Calendar';
import { Plus, Calendar as CalendarIcon, List, BarChart3 } from 'lucide-react';
import TaskDetailModal from '../tasks/TaskDetailModal';
import Loading from '../common/Loading';
import TaskStatistics from '../stats/TaskStatistics';

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
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Here's what's happening with your tasks today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Completed Tasks"
            value={getCompletedTasksCount()}
            icon={<BarChart3 size={24} className="text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Due Today"
            value={getTodayTasksCount()}
            icon={<CalendarIcon size={24} className="text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Overdue"
            value={getOverdueTasksCount()}
            icon={<List size={24} className="text-white" />}
            color="bg-red-500"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 dark:bg-gray-800">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
                    ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                    } transition-all duration-200 ease-in-out focus:outline-none`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Your Tasks
                  </h2>
                  <div>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">
                  Calendar View
                </h2>
                <Calendar />
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">
                  Task Statistics
                </h2>
                <TaskStatistics />
              </div>
            )}
          </div>
        </div>

        {showTaskForm && (
          <TaskForm
            isOpen={showTaskForm}
            onClose={handleCloseForm}
            onTaskCreated={handleTaskCreated}
            editingTask={editingTask}
          />
        )}

        {showTaskDetail && (
          <TaskDetailModal
            isOpen={showTaskDetail}
            onClose={handleCloseTaskDetail}
            task={selectedTaskDetail}
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6 dark:bg-gray-800">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

export default Dashboard; 