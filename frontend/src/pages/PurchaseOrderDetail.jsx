import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { 
  ArrowLeft, 
  Package, 
  Building2, 
  Calendar,
  CheckCircle,
  Truck,
  Send,
  Loader2,
  FileText,
  User,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

const StatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    issued: 'bg-blue-100 text-blue-700 border-blue-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border capitalize flex items-center gap-1.5 w-max ${currentStyle}`}>
      {status === 'draft' && <FileText className="w-4 h-4" />}
      {status === 'issued' && <Send className="w-4 h-4" />}
      {status === 'delivered' && <Truck className="w-4 h-4" />}
      {status === 'closed' && <Archive className="w-4 h-4" />}
      {status}
    </span>
  );
};

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPO = async () => {
    try {
      const response = await api.get(`/purchase-orders/${id}`);
      setPo(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch Purchase Order details');
      navigate('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPO();
  }, [id]);

  const handleAction = async (action, endpoint) => {
    let icon = 'question';
    let titleText = `Confirm ${action}?`;
    let confirmColor = '#4f46e5';

    if (action === 'Issue PO') {
      icon = 'info';
      confirmColor = '#3b82f6';
    } else if (action === 'Mark as Delivered') {
      icon = 'success';
      confirmColor = '#10b981';
    } else if (action === 'Close PO') {
      icon = 'warning';
      confirmColor = '#8b5cf6';
    }

    const { isConfirmed } = await Swal.fire({
      title: titleText,
      text: `Are you sure you want to ${action.toLowerCase()}?`,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      confirmButtonText: `Yes, ${action}`,
    });
    
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await api.post(`/purchase-orders/${id}/${endpoint}`);
      toast.success(`Purchase Order successfully updated to ${endpoint}`);
      fetchPO(); // Reload data
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update status`);
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

  if (!po) return null;

  const isProcurement = user?.roles?.some(r => r.name === 'procurement' || r.name === 'admin');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/purchase-orders" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to List
        </Link>
        
        <div className="flex gap-3">
          {po.status === 'draft' && isProcurement && (
            <button
              onClick={() => handleAction('Issue PO', 'issue')}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Issue PO to Vendor
            </button>
          )}
          
          {po.status === 'issued' && isProcurement && (
            <button
              onClick={() => handleAction('Mark as Delivered', 'deliver')}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Truck className="w-4 h-4 mr-2" />
              Mark as Delivered
            </button>
          )}

          {po.status === 'delivered' && isProcurement && (
            <button
              onClick={() => handleAction('Close PO', 'close')}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Archive className="w-4 h-4 mr-2" />
              Close PO
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-500" />
              {po.po_number}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Generated on {format(new Date(po.created_at), 'dd MMMM yyyy, HH:mm')}
            </p>
          </div>
          <div>
            <StatusBadge status={po.status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-6 py-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" /> Ship To / Vendor
              </p>
              <p className="text-lg font-bold text-slate-900">{po.vendor_name}</p>
              <p className="text-sm text-slate-600 mt-1">Vendor ID: {po.vendor_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" /> Reference Purchase Request
              </p>
              <Link to={`/purchase-requests/${po.purchase_request_id}`} className="text-base font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                {po.pr_number}
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" /> PO Date
              </p>
              <p className="text-base font-medium text-slate-900">{format(new Date(po.po_date), 'dd MMMM yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <User className="w-4 h-4" /> Issued By
              </p>
              <p className="text-base font-medium text-slate-900">{po.creator_name || 'System Admin'}</p>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Line Items</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Item Description</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Qty</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Final Price</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {po.details?.map((detail, index) => (
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
              <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-right text-base">Grand Total:</td>
                  <td className="px-4 py-4 text-right text-indigo-700 whitespace-nowrap text-lg">
                    Rp {Number(po.total_amount).toLocaleString('id-ID')}
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

export default PurchaseOrderDetail;
