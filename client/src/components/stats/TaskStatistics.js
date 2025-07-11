import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { useTask } from '../../context/TaskContext';

const TaskStatistics = () => {
  const { tasks } = useTask();

  const processDataBy = (key) => {
    if (!tasks || tasks.length === 0) return [];
    const counts = tasks.reduce((acc, task) => {
      const value = task[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  };

  const priorityData = processDataBy('priority');
  const typeData = processDataBy('type');
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const completionData = [{ name: 'Completion', value: completionRate }];


  const COLORS = {
    // Priority
    high: '#ef4444',
    medium: '#f97316',
    low: '#22c55e',
    // Type
    assignment: '#3b82f6',
    exam: '#8b5cf6',
    project: '#14b8a6',
    reading: '#ec4899',
    other: '#6b7280',
  };

  const ChartCard = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="font-semibold text-gray-700 text-lg mb-4 text-center dark:text-gray-200">{title}</h3>
      <div style={{ height: 300 }}>
        {children}
      </div>
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-100">No data available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create some tasks to see your statistics.
        </p>
      </div>
    )
  }

  const tooltipContentStyle = { 
    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
    borderColor: '#4b5563' 
  };
  const legendTextStyle = { color: '#d1d5db' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChartCard title="Tasks by Priority">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={{ fill: '#d1d5db' }}>
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend wrapperStyle={legendTextStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tasks by Type">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={{ fill: '#d1d5db' }}>
              {typeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend wrapperStyle={legendTextStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Completion Rate">
        <ResponsiveContainer>
          <RadialBarChart 
            innerRadius="80%" 
            outerRadius="100%" 
            data={completionData} 
            startAngle={90} 
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar 
              background={{ fill: '#374151' }} 
              dataKey="value" 
              cornerRadius={10} 
              fill="#10b981" 
              angleAxisId={0} 
            />
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="text-4xl font-bold fill-current text-gray-700 dark:text-gray-200"
            >
              {`${Math.round(completionRate)}%`}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default TaskStatistics; 