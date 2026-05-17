import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { 
  FileText, 
  CheckCircle, 
  ShoppingCart, 
  Package, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/procurement');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total PRs',
      value: data?.total_purchase_requests || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/purchase-requests'
    },
    {
      title: 'Pending Approval',
      value: data?.pending_pr_approval || 0,
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/purchase-requests?status=submitted'
    },
    {
      title: 'Approved PRs',
      value: data?.approved_prs || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/purchase-requests?status=approved'
    },
    {
      title: 'Pending Quotations',
      value: data?.pending_quotations || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/vendor-quotations'
    },
    {
      title: 'Issued POs',
      value: data?.issued_pos || 0,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/purchase-orders'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, <span className="font-medium text-slate-700">{user?.name}</span>. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <Link 
              to={stat.link}
              className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Details <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
      
      {/* Quick Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" /> 
            Active Projects
          </h3>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Currently Running</p>
              <p className="text-2xl font-bold text-slate-900">{data?.active_projects || 0}</p>
            </div>
            <Link to="/projects" className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also defining Building2 icon which wasn't imported initially
import { Building2 } from 'lucide-react';

export default Dashboard;
