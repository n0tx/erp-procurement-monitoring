import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import StatusBadge from '../components/StatusBadge';



const VendorQuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [qt, setQt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuotation = async () => {
    try {
      const response = await api.get(`/vendor-quotations/${id}`);
      setQt(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch Quotation details');
      navigate('/vendor-quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleAction = async (action, endpoint) => {
    const { isConfirmed } = await Swal.fire({
      title: `Confirm ${action}?`,
      text: action === 'Select' 
        ? "This will mark this quotation as the winning bid and reject others for the same PR."
        : "Are you sure you want to reject this vendor quotation?",
      icon: action === 'Select' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'Select' ? '#10b981' : '#ef4444',
      confirmButtonText: `Yes, ${action}`,
    });
    
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await api.post(`/vendor-quotations/${id}/${endpoint}`);
      toast.success(`Quotation successfully ${action.toLowerCase()}ed`);
      fetchQuotation(); // Reload data
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

  if (!qt) return null;

  const isProcurement = user?.roles?.some(r => r.name === 'procurement' || r.name === 'admin');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/vendor-quotations" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to List
        </Link>
        
        <div className="flex gap-3">
          {qt.status === 'pending' && isProcurement && (
            <>
              <button
                onClick={() => handleAction('Reject', 'reject')}
                disabled={actionLoading}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleAction('Select', 'select')}
                disabled={actionLoading}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Select as Winner
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
              {qt.quotation_number}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quotation Date: {format(new Date(qt.quotation_date), 'dd MMMM yyyy')}
            </p>
          </div>
          <div>
            <StatusBadge status={qt.status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-6 py-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" /> Vendor Information
              </p>
              <p className="text-lg font-semibold text-slate-900">{qt.vendor_name}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4" /> Related Purchase Request
              </p>
              <Link to={`/purchase-requests/${qt.purchase_request_id}`} className="text-base font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                {qt.pr_number}
              </Link>
            </div>
            
            {qt.selected_at && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs font-medium text-emerald-800 mb-1">Selected At</p>
                <p className="text-sm font-semibold text-emerald-900">{format(new Date(qt.selected_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Table */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pricing Details</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Item Description</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Qty</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Unit Price</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {qt.details?.map((detail, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                      {detail.item?.item_name || `Item #${detail.item_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-center">
                      {detail.qty}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right whitespace-nowrap">
                      Rp {Number(detail.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right whitespace-nowrap">
                      Rp {Number(detail.subtotal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-900">
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-right text-base">Grand Total:</td>
                  <td className="px-4 py-4 text-right text-indigo-700 whitespace-nowrap text-lg">
                    Rp {Number(qt.total_amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorQuotationDetail;
