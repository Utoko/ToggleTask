import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState<
    { name: string; isRunning: boolean; startTime: number | null; totalTime: number }[]
  >([
    { name: 'programming Task', isRunning: false, startTime: null, totalTime: 0 },
    { name: 'eating', isRunning: false, startTime: null, totalTime: 0 },
  ]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { name: newTask, isRunning: false, startTime: null, totalTime: 0 }]);
      setNewTask('');
    }
  };

  const handleToggleTask = (index: number) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[index];
    if (task.isRunning) {
      task.isRunning = false;
      if (task.startTime) {
        task.totalTime += Date.now() - task.startTime;
      }
      task.startTime = null;
    } else {
      task.isRunning = true;
      task.startTime = Date.now();
    }
    setTasks(updatedTasks);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.isRunning) {
            return { ...task };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
        />
        <button onClick={handleAddTask}>Add Task</button>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              {task.name} - Time: {task.totalTime}
              <button onClick={() => handleToggleTask(index)}>
                {task.isRunning ? 'Stop' : 'Start'}
              </button>
            </li>
          ))}
        </ul>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
