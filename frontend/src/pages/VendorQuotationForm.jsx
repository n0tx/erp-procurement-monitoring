import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Save,
  Building2,
  FileText,
  Calendar,
  Loader2,
  Calculator,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const quotationSchema = z.object({
  purchase_request_id: z.string().min(1, 'Purchase Request must be selected'),
  vendor_id: z.string().min(1, 'Vendor must be selected'),
  quotation_date: z.string().min(1, 'Date is required'),
  details: z.array(
    z.object({
      item_id: z.number(),
      item_name: z.string().optional(),
      qty: z.number().min(0.01, 'Invalid quantity'),
      price: z.number().min(0, 'Price cannot be negative'),
    })
  ).min(1, 'At least one item is required'),
});

const VendorQuotationForm = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [prs, setPrs] = useState([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);
  const [isLoadingPrDetail, setIsLoadingPrDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      purchase_request_id: '',
      vendor_id: '',
      quotation_date: new Date().toISOString().split('T')[0],
      details: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'details',
  });

  const selectedPrId = watch('purchase_request_id');
  const details = watch('details');

  const calculateTotal = () => {
    return details.reduce((acc, curr) => {
      const price = parseFloat(curr.price) || 0;
      const qty = parseFloat(curr.qty) || 0;
      return acc + (price * qty);
    }, 0);
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [vendorsRes, prsRes] = await Promise.all([
          api.get('/vendors'),
          api.get('/purchase-requests')
        ]);
        setVendors(vendorsRes.data.data);
        
        // Only allow inputting quotation for 'approved' PRs
        const approvedPrs = prsRes.data.data.filter(pr => pr.status === 'approved');
        setPrs(approvedPrs);
      } catch (error) {
        toast.error('Failed to fetch master data');
        console.error(error);
      } finally {
        setIsLoadingMaster(false);
      }
    };
    fetchMasterData();
  }, []);

  // When a PR is selected, fetch its line items to pre-fill the form
  useEffect(() => {
    if (!selectedPrId) {
      replace([]); // clear details
      return;
    }

    const fetchPrDetail = async () => {
      setIsLoadingPrDetail(true);
      try {
        const res = await api.get(`/purchase-requests/${selectedPrId}`);
        const pr = res.data.data;
        
        const initialDetails = pr.details.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name || 'Unknown Item',
          qty: parseFloat(item.qty),
          price: 0, // vendor has to input this
        }));
        
        replace(initialDetails);
      } catch (error) {
        toast.error('Failed to fetch PR details');
        console.error(error);
      } finally {
        setIsLoadingPrDetail(false);
      }
    };

    fetchPrDetail();
  }, [selectedPrId, replace]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/vendor-quotations', data);
      toast.success('Vendor Quotation created successfully!');
      navigate('/vendor-quotations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save quotation');
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/vendor-quotations')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Input Vendor Quotation</h1>
            <p className="text-slate-500 text-sm mt-1">
              Record price quotes from vendors for approved Purchase Requests
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Main Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Purchase Request
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <select
                    {...register('purchase_request_id')}
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-colors appearance-none ${
                      errors.purchase_request_id ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Select PR (Status: Approved) --</option>
                    {prs.map(pr => (
                      <option key={pr.id} value={pr.id}>
                        {pr.pr_number} - {pr.project_name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.purchase_request_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.purchase_request_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vendor / Supplier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <select
                    {...register('vendor_id')}
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-colors appearance-none ${
                      errors.vendor_id ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vendor_name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.vendor_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.vendor_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quotation Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    {...register('quotation_date')}
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-colors ${
                      errors.quotation_date ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.quotation_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.quotation_date.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        {selectedPrId && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  Input Item Prices
                </h3>
              </div>

              {isLoadingPrDetail ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : fields.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Qty (PR)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">Unit Price (IDR)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {fields.map((field, index) => (
                        <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {field.item_name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                            {field.qty}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              {...register(`details.${index}.price`, { valueAsNumber: true })}
                              className="block w-full px-3 py-2 sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              placeholder="0"
                            />
                            {errors.details?.[index]?.price && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.details[index].price.message}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                            Rp {((watch(`details.${index}.price`) || 0) * field.qty).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td colSpan="4" className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase">
                          Grand Total
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-lg font-bold text-indigo-700">
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">This PR does not have any item details.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Quotation
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorQuotationForm;
