import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const prSchema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  department_id: z.string().min(1, 'Department is required'),
  request_date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  details: z.array(z.object({
    item_id: z.string().min(1, 'Item is required'),
    qty: z.coerce.number().min(0.01, 'Min qty is 0.01'),
    estimated_price: z.coerce.number().min(0, 'Min price is 0'),
    remarks: z.string().optional()
  })).min(1, 'At least one item is required')
});

const PurchaseRequestForm = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(prSchema),
    defaultValues: {
      request_date: new Date().toISOString().split('T')[0],
      details: [{ item_id: '', qty: 1, estimated_price: 0, remarks: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details"
  });

  // Watch details array to calculate totals
  const watchDetails = watch("details");
  const grandTotal = watchDetails.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.estimated_price) || 0)), 0);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [projRes, deptRes, itemsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/departments'),
          api.get('/items')
        ]);
        setProjects(projRes.data.data || []);
        setDepartments(deptRes.data.data || []);
        setItems(itemsRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load form options');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleItemSelect = (index, itemId) => {
    const selectedItem = items.find(i => i.id.toString() === itemId);
    if (selectedItem) {
      setValue(`details.${index}.estimated_price`, selectedItem.estimated_price);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/purchase-requests', data);
      toast.success('Purchase Request created successfully');
      navigate('/purchase-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PR');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/purchase-requests" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to List
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Purchase Request</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill out the form below to initiate a new material request.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">General Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
              <select 
                {...register('project_id')}
                className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
              >
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
              {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select 
                {...register('department_id')}
                className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
              >
                <option value="">Select a department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Request Date</label>
              <input 
                type="date" 
                {...register('request_date')}
                className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
              />
              {errors.request_date && <p className="mt-1 text-sm text-red-600">{errors.request_date.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Justification</label>
            <textarea 
              {...register('notes')}
              rows="3"
              placeholder="Provide a brief explanation or business justification..."
              className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
            ></textarea>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
            <button
              type="button"
              onClick={() => append({ item_id: '', qty: 1, estimated_price: 0, remarks: '' })}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
          
          <div className="p-6 overflow-x-auto">
            {errors.details?.root && <p className="mb-4 text-sm text-red-600 font-medium">{errors.details.root.message}</p>}
            
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Material / Item</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-24">Qty</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-40">Est. Unit Price</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-40">Subtotal</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Remarks</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, index) => {
                  const qty = Number(watchDetails[index]?.qty || 0);
                  const price = Number(watchDetails[index]?.estimated_price || 0);
                  const subtotal = qty * price;
                  
                  return (
                    <tr key={field.id} className="group">
                      <td className="px-2 py-3 align-top">
                        <select 
                          {...register(`details.${index}.item_id`)}
                          onChange={(e) => {
                            // First run hook form's onChange
                            register(`details.${index}.item_id`).onChange(e);
                            // Then run our custom logic
                            handleItemSelect(index, e.target.value);
                          }}
                          className={`w-full rounded-md border text-sm py-1.5 px-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.details?.[index]?.item_id ? 'border-red-300' : 'border-slate-300'}`}
                        >
                          <option value="">Select Item...</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>{item.item_code} - {item.item_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3 align-top">
                        <input 
                          type="number" 
                          step="0.01"
                          {...register(`details.${index}.qty`)}
                          className={`w-full rounded-md border text-sm py-1.5 px-2 text-center focus:ring-indigo-500 focus:border-indigo-500 ${errors.details?.[index]?.qty ? 'border-red-300' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-2 py-3 align-top">
                        <input 
                          type="number" 
                          {...register(`details.${index}.estimated_price`)}
                          className={`w-full rounded-md border text-sm py-1.5 px-2 text-right focus:ring-indigo-500 focus:border-indigo-500 ${errors.details?.[index]?.estimated_price ? 'border-red-300' : 'border-slate-300'}`}
                        />
                      </td>
                      <td className="px-2 py-3 align-top text-right pt-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                        Rp {subtotal.toLocaleString('id-ID')}
                      </td>
                      <td className="px-2 py-3 align-top">
                        <input 
                          type="text" 
                          {...register(`details.${index}.remarks`)}
                          placeholder="Optional"
                          className="w-full rounded-md border border-slate-300 text-sm py-1.5 px-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-3 align-top text-center pt-3.5">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan="3" className="px-4 py-4 text-right font-semibold text-slate-700">Estimated Grand Total:</td>
                  <td className="px-2 py-4 text-right font-bold text-indigo-700 whitespace-nowrap text-lg">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/purchase-requests"
            className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseRequestForm;
