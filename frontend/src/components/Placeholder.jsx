import React from 'react';

const Placeholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-[#161B22] rounded-2xl border border-gray-800 flex items-center justify-center mb-6 shadow-sm">
        <span className="text-gray-500 text-2xl font-bold">?</span>
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-gray-400 max-w-md">
        This view is currently under construction. 
        Detailed metrics and charts for {title.toLowerCase()} will be available soon.
      </p>
    </div>
  );
};

export default Placeholder;
