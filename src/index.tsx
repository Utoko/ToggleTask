import { useState, useEffect } from 'react';
import { saveDataToIndexedDB, loadDataFromIndexedDB, exportDataToCSV } from './db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaskTime {
  elapsed: number;
  startTime: number | null;
  startDate: number | null;
}

interface TaskTimes {
  [key: string]: TaskTime;
}

const TimeTracker = () => {
  const [taskTimes, setTaskTimes] = useState<TaskTimes>({
    Work: { elapsed: 0, startTime: null, startDate: null },
    Walking: { elapsed: 0, startTime: null, startDate: null },
    'Social Media': { elapsed: 0, startTime: null, startDate: null },
  });
  const [activeTask, setActiveTask] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTask) {
        setTaskTimes((prev) => {
          const task = prev[activeTask];
          if (task.startTime) {
            const now = Date.now();
            const newElapsed = task.elapsed + (now - task.startTime) / 1000;
            return {
              ...prev,
              [activeTask]: { ...task, elapsed: newElapsed, startTime: now },
            };
          }
          return prev;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeTask]);

  const handleTaskClick = (taskName: string) => {
    setTaskTimes((prev) => {
      const newTimes = { ...prev };
      
      // Stop current task if exists
      if (activeTask) {
        const currentTask = newTimes[activeTask];
        if (currentTask.startTime) {
          const now = Date.now();
          newTimes[activeTask] = {
            ...currentTask,
            elapsed: currentTask.elapsed + (now - currentTask.startTime) / 1000,
            startTime: null,
          };
        }
      }

      // Start new task
      if (activeTask !== taskName) {
        newTimes[taskName] = {
          ...newTimes[taskName],
          startTime: Date.now(),
          startDate: Date.now(),
        };
        setActiveTask(taskName);
      } else {
        setActiveTask(null);
      }

      return newTimes;
    });
  };

  const saveToLocalStorage = async () => {
    try {
      await saveDataToIndexedDB(taskTimes);
      alert('Data saved successfully!');
    } catch (error) {
      alert('Failed to save data to IndexedDB');
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      const loadedTaskTimes = await loadDataFromIndexedDB();
      setTaskTimes(loadedTaskTimes);
      setActiveTask(null);
      alert('Data loaded successfully!');
    } catch (error) {
        alert('Failed to load data from IndexedDB');
    }
  };

  const handleExportToCSV = async () => {
    try {
      const csvData = await exportDataToCSV();
      if (!csvData) {
        alert("No data to export");
        return;
      }
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'task_times.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data to CSV');
    }
  };

  const chartData = Object.entries(taskTimes).map(([taskName, time]) => ({
    name: taskName,
    elapsed: time.elapsed,
  }));

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Time Tracker
        </h1>
        
        <div className="space-y-4">
          {Object.entries(taskTimes).map(([taskName, time]) => (
            <button
              key={taskName}
              onClick={() => handleTaskClick(taskName)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${
                  activeTask === taskName
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              {taskName}: {time.elapsed.toFixed(1)}s
            </button>
          ))}
        </div>

        <div className="mt-8">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="elapsed" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={saveToLocalStorage}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={loadFromLocalStorage}
            className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Load
          </button>
          <button
            onClick={handleExportToCSV}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
