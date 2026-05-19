import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Loader2, Lock, Mail } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast, Toaster } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const demoAccounts = [
  { email: 'admin@demo-epc.com', role: 'Admin', desc: 'Full access to all modules', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
  { email: 'project@demo-epc.com', role: 'Project User', desc: 'Create & submit PR', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
  { email: 'manager@demo-epc.com', role: 'Approver', desc: 'Approve / Reject PR', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
  { email: 'procurement@demo-epc.com', role: 'Procurement', desc: 'Quotation, PO & vendor mgmt', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
];

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const fillCredentials = (email) => {
    setValue('email', email);
    setValue('password', 'password');
  };

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
            <Building2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          EPC Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          E-Procurement & Project Monitoring System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.email ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="admin@demo-epc.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.password ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Authenticating...
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </div>
            
          </form>
          
          {/* Demo Credentials Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Demo Accounts (click to fill)</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillCredentials(account.email)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${account.color}`}
                >
                  <span className="font-bold block">{account.role}</span>
                  <span className="opacity-75 block mt-0.5">{account.desc}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-3">
              Password for all accounts: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-600">password</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
