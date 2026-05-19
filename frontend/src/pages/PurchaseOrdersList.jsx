import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import api from '../services/api';
import { 
  Search, 
  Package, 
  ChevronRight, 
  Loader2,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';



const PurchaseOrdersList = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPos(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch POs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPOs = pos.filter(po => {
    const prNumber = po.pr_number || '';
    const vendorName = po.vendor_name || '';
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage material orders sent to vendors.
          </p>
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
              placeholder="Search by PO, PR, or vendor..."
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
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="delivered">Delivered</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredPOs.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    PO Number
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
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{po.po_number}</div>
                          <div className="text-xs text-slate-500">PR: {po.pr_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-medium">{po.vendor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(po.po_date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-slate-900">
                        Rp {Number(po.total_amount).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/purchase-orders/${po.id}`}
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
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No Purchase Orders Found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? "We couldn't find anything matching your current filters."
                  : "PO will appear here once a vendor quotation is approved and converted."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersList;
