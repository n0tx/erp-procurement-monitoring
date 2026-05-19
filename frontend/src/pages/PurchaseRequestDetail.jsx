import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Building2, 
  Calendar,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import StatusBadge from '../components/StatusBadge';



const PurchaseRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPR = async () => {
    try {
      const response = await api.get(`/purchase-requests/${id}`);
      setPr(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch Purchase Request details');
      navigate('/purchase-requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
  }, [id]);

  const handleAction = async (action, endpoint, requireNote = false) => {
    let notes = '';
    
    if (requireNote) {
      const { value: text, isConfirmed } = await Swal.fire({
        title: `Confirm ${action}`,
        input: 'textarea',
        inputLabel: 'Notes / Remarks',
        inputPlaceholder: 'Enter your notes here...',
        showCancelButton: true,
        confirmButtonColor: action === 'Approve' ? '#10b981' : action === 'Reject' ? '#ef4444' : '#4f46e5',
        confirmButtonText: `Yes, ${action}`,
      });
      
      if (!isConfirmed) return;
      notes = text;
    } else {
      const { isConfirmed } = await Swal.fire({
        title: `Confirm ${action}?`,
        text: `Are you sure you want to ${action.toLowerCase()} this request?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        confirmButtonText: `Yes, ${action}`,
      });
      
      if (!isConfirmed) return;
    }

    setActionLoading(true);
    try {
      await api.post(`/purchase-requests/${id}/${endpoint}`, { notes });
      toast.success(`Purchase Request successfully ${action.toLowerCase()}d`);
      fetchPR(); // Reload data
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action.toLowerCase()}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!pr) return null;

  // Simple Role Checks
  const isProjectUser = user?.roles?.some(r => r.name === 'project_user' || r.name === 'admin');
  const isApprover = user?.roles?.some(r => r.name === 'approver' || r.name === 'admin');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/purchase-requests" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to List
        </Link>
        
        <div className="flex gap-3">
          {pr.status === 'draft' && isProjectUser && (
            <button
              onClick={() => handleAction('Submit', 'submit')}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </button>
          )}
          
          {pr.status === 'submitted' && isApprover && (
            <>
              <button
                onClick={() => handleAction('Reject', 'reject', true)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleAction('Approve', 'approve', true)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-500" />
              {pr.pr_number}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Created on {format(new Date(pr.created_at), 'dd MMMM yyyy, HH:mm')}
            </p>
          </div>
          <div>
            <StatusBadge status={pr.status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-6 py-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" /> Project / Department
              </p>
              <p className="text-base font-semibold text-slate-900">{pr.project_name}</p>
              <p className="text-sm text-slate-600">{pr.department_name}</p>
            </div>
            
            {pr.notes && (
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {pr.notes}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <User className="w-4 h-4" /> Requested By
              </p>
              <p className="text-base font-medium text-slate-900">{pr.requester_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" /> Request Date
              </p>
              <p className="text-base font-medium text-slate-900">{format(new Date(pr.request_date), 'dd MMMM yyyy')}</p>
            </div>
            {pr.approved_by && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs font-medium text-emerald-800 mb-1">Approved By</p>
                <p className="text-sm font-semibold text-emerald-900">{pr.approver_name}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{format(new Date(pr.approved_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            )}
            {pr.rejected_by && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-xs font-medium text-red-800 mb-1">Rejected By</p>
                <p className="text-sm font-semibold text-red-900">System Admin</p>
                <p className="text-xs text-red-700 mt-0.5">{format(new Date(pr.rejected_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Table */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Material Requirements</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Item Description</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Qty</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Est. Unit Price</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Est. Subtotal</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {pr.details?.map((detail, index) => {
                  const subtotal = detail.qty * detail.estimated_price;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {detail.item_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-center">
                        {detail.qty}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right whitespace-nowrap">
                        Rp {detail.estimated_price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right whitespace-nowrap">
                        Rp {subtotal.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {detail.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right">Estimated Total:</td>
                  <td className="px-4 py-3 text-right text-indigo-700 whitespace-nowrap">
                    Rp {pr.details?.reduce((sum, item) => sum + (item.qty * item.estimated_price), 0).toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestDetail;
