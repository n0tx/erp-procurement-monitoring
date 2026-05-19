import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Save,
  Building2,
  FileText,
  Calendar,
  Loader2,
  CheckCircle,
  Truck
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const poSchema = z.object({
  quotation_id: z.string().min(1, 'Quotation must be selected'),
  po_date: z.string().min(1, 'PO Date is required'),
});

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [existingPos, setExistingPos] = useState([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(poSchema),
    defaultValues: {
      quotation_id: '',
      po_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedQuotationId = watch('quotation_id');
  const selectedQuotation = quotations.find(q => q.id.toString() === selectedQuotationId);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [quotesRes, posRes] = await Promise.all([
          api.get('/vendor-quotations'),
          api.get('/purchase-orders')
        ]);
        
        const existingPoPrIds = posRes.data.data.map(po => po.purchase_request_id);

        // Only allow PO creation for 'selected' quotations whose PR doesn't have a PO yet
        const validQuotations = quotesRes.data.data.filter(q => 
          q.status === 'selected' && !existingPoPrIds.includes(q.purchase_request_id)
        );
        
        setQuotations(validQuotations);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setIsLoadingMaster(false);
      }
    };
    fetchMasterData();
  }, []);

  const onSubmit = async (data) => {
    if (!selectedQuotation) return;
    
    setIsSubmitting(true);
    try {
      // Backend expects purchase_request_id and vendor_id
      const payload = {
        purchase_request_id: selectedQuotation.purchase_request_id,
        vendor_id: selectedQuotation.vendor_id,
        po_date: data.po_date,
      };

      await api.post('/purchase-orders', payload);
      toast.success('Purchase Order generated successfully!');
      navigate('/purchase-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate PO.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMaster) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Generate Purchase Order</h1>
            <p className="text-slate-500 text-sm mt-1">
              Issue a new PO based on the winning vendor quotation (Status: Selected)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              Order Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Winning Quotation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle className="w-5 h-5 text-slate-400" />
                  </div>
                  <select
                    {...register('quotation_id')}
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-colors appearance-none ${
                      errors.quotation_id ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Select Quotation --</option>
                    {quotations.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.quotation_number} - {q.vendor_name} (PR: {q.pr_number})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.quotation_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.quotation_id.message}</p>
                )}
                {quotations.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                    No "Selected" quotations available. Please select a winning quotation first, or the existing ones already have POs.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PO Issue Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    {...register('po_date')}
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-colors ${
                      errors.po_date ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.po_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.po_date.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {selectedQuotation && (
            <div className="bg-slate-50 p-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Automated Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Selected Vendor</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    {selectedQuotation.vendor_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">PR Reference</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    {selectedQuotation.pr_number}
                  </p>
                </div>
                <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <span className="font-semibold text-indigo-900">Total PO Value</span>
                    <span className="text-xl font-bold text-indigo-700">
                      Rp {parseFloat(selectedQuotation.total_amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 italic text-center">
                    *Line items will be copied automatically from the selected quotation document.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !selectedQuotation}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Generate PO
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
