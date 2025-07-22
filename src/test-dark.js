import React, { useState } from 'react';

function TestDark() {
  const [dark, setDark] = useState(false);

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => setDark(!dark)}
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
        >
          Toggle Dark Mode (currently: {dark ? 'dark' : 'light'})
        </button>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Test Dark Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            If dark mode is working, this box should have a dark background.
          </p>
        </div>
        
        <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-black dark:text-white">
            Another test box
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestDark;