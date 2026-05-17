import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import api from '../services/api';
import { 
  History, 
  Loader2,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Send,
  Package,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const ActionIcon = ({ action }) => {
  if (action.includes('approve') || action.includes('selected')) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (action.includes('reject')) return <XCircle className="w-4 h-4 text-red-500" />;
  if (action.includes('submit')) return <Send className="w-4 h-4 text-blue-500" />;
  if (action.includes('issue') || action.includes('deliver')) return <Package className="w-4 h-4 text-indigo-500" />;
  return <Clock className="w-4 h-4 text-slate-500" />;
};

const ApprovalLogsList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/approval-logs');
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch Approval Logs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    return log.reference_type === filterType;
  });

  const getDocLink = (type, id) => {
    switch (type) {
      case 'purchase_request': return `/purchase-requests/${id}`;
      case 'vendor_quotation': return `/vendor-quotations/${id}`;
      case 'purchase_order': return `/purchase-orders/${id}`;
      default: return '#';
    }
  };

  const formatDocType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail & Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor all system activities, approvals, and rejections.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Filter by Module:</label>
          <select
            className="block w-48 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-colors"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="purchase_request">Purchase Requests</option>
            <option value="vendor_quotation">Vendor Quotations</option>
            <option value="purchase_order">Purchase Orders</option>
          </select>
        </div>

        {/* Timeline / Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(log.acted_at), 'dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{log.actor_name || 'System Admin'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <ActionIcon action={log.action} />
                        <span className="text-sm font-semibold text-slate-700 capitalize">{log.action.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={getDocLink(log.reference_type, log.reference_id)}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        {formatDocType(log.reference_type)} #{log.reference_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-md truncate" title={log.notes}>
                        {log.notes || '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <History className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No Logs Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                System activities will be recorded here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalLogsList;
