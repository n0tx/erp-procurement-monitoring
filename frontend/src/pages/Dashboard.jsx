import React from 'react';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Pending Approvals</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Active PRs</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">45</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Issued POs</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">89</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">More widgets coming soon</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          The dashboard data fetching will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
