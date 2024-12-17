const DB_NAME = 'task_tracker';
const DB_VERSION = 1;
const DB_STORE_NAME = 'task_times';

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(`Database error: ${event.target.errorCode}`);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(DB_STORE_NAME, { keyPath: 'task' });
    };
  });
};

const saveDataToIndexedDB = async (taskTimes) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(DB_STORE_NAME);

    for (const task in taskTimes) {
      store.put({ task: task, elapsed: taskTimes[task].elapsed, startDate: taskTimes[task].startDate });
    }

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = (event) => {
      reject(`Transaction error: ${event.target.error}`);
    };
  });
};

const loadDataFromIndexedDB = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE_NAME, 'readonly');
    const store = transaction.objectStore(DB_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const taskTimes = {};
      event.target.result.forEach(row => {
        taskTimes[row.task] = { elapsed: row.elapsed, startTime: null, startDate: row.startDate };
      });
      resolve(taskTimes);
    };

    request.onerror = (event) => {
      reject(`Error loading data: ${event.target.error}`);
    };
  });
};

const exportDataToCSV = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE_NAME, 'readonly');
      const store = transaction.objectStore(DB_STORE_NAME);
      const request = store.getAll();
  
      request.onsuccess = (event) => {
        const data = event.target.result;
        if (!data || data.length === 0) {
          resolve("");
          return;
        }
        const header = ["Task", "Elapsed Time (s)", "Start Date"];
        const csvRows = [header.join(",")];
        data.forEach(row => {
          const date = row.startDate ? new Date(row.startDate).toLocaleDateString() : "";
          csvRows.push(`${row.task},${row.elapsed},${date}`);
        });
        resolve(csvRows.join("\n"));
      };
  
      request.onerror = (event) => {
        reject(`Error exporting data: ${event.target.error}`);
      };
    });
  };

export { saveDataToIndexedDB, loadDataFromIndexedDB, exportDataToCSV };
