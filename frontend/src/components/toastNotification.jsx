import React, { useState, useEffect } from 'react';

const ToastNotification = ({ message, duration = 3000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 0) {
          clearInterval(timer);
          return 0;
        }
        const newProgress = oldProgress - 100 / (duration / 100);
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [duration]);

  return (
    <div className="fixed bottom-4 right-4 bg-xenial-dark text-white p-4 rounded shadow-lg">
      <p>{message}</p>
      <div className="w-full bg-gray-700 h-1 mt-2">
        <div
          className="bg-xenial-blue h-1"
          style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
        ></div>
      </div>
    </div>
  );
};

export default ToastNotification;