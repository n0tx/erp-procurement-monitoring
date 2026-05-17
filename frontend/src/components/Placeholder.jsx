import React from 'react';
import { useLocation } from 'react-router';

const Placeholder = () => {
  const location = useLocation();
  const pathName = location.pathname.split('/').filter(Boolean).map(str => 
    str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  ).join(' - ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{pathName || 'Module'}</h2>
      <p className="mt-2 text-slate-500 max-w-md">
        This module is currently under development. The full feature will be implemented in the upcoming phase of the frontend integration.
      </p>
    </div>
  );
};

export default Placeholder;
