import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import api from '../services/api';
import { 
  Search, 
  FileText, 
  ChevronRight, 
  Loader2,
  Filter,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';



const VendorQuotationsList = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/vendor-quotations');
      setQuotations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch Quotations', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(qt => {
    const prNumber = qt.pr_number || '';
    const vendorName = qt.vendor_name || '';
    const matchesSearch = qt.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || qt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor Quotations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare and evaluate price quotes from various vendors.
          </p>
        </div>
        <div>
          <Link
            to="/vendor-quotations/create"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Input Quotation
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by quote, PR, or vendor..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredQuotations.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quote / PR
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredQuotations.map((qt) => (
                  <tr key={qt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{qt.quotation_number}</div>
                          <div className="text-xs text-slate-500">{qt.pr_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-medium">{qt.vendor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(qt.quotation_date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-slate-900">
                        Rp {Number(qt.total_amount).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={qt.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/vendor-quotations/${qt.id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No Quotations Found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? "We couldn't find anything matching your current filters."
                  : "Input quotes from your vendors to compare pricing."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorQuotationsList;
