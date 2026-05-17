import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Briefcase, 
  Loader2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors');
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch vendors', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    return v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Vendors</h1>
          <p className="mt-1 text-sm text-slate-500">
            Directory of approved suppliers and contractors.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendor by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                      </div>
                      {vendor.status === 'active' ? (
                        <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                          <XCircle className="w-3 h-3 mr-1" /> Inactive
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{vendor.vendor_name}</h3>
                    <p className="text-xs font-medium text-slate-500 mb-4">NPWP: {vendor.npwp}</p>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-start text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{vendor.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No Vendors Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorsList;
