import React from 'react';

export default function LoadingState({ message = "Loading content..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
      <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">{message}</p>
    </div>
  );
}
