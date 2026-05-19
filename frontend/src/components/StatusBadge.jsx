import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Send, 
  Truck, 
  Archive,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const styles = {
    // PRs & General
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    processed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
    
    // Vendor Quotations
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    selected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    
    // Purchase Orders
    issued: 'bg-blue-100 text-blue-700 border-blue-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed: 'bg-purple-100 text-purple-700 border-purple-200',

    // Projects
    planning: 'bg-amber-100 text-amber-700 border-amber-200',
    running: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    on_hold: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  const renderIcon = () => {
    switch (status) {
      case 'approved':
      case 'selected':
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'submitted':
      case 'pending':
      case 'planning':
        return <Clock className="w-3.5 h-3.5" />;
      case 'draft':
        return <FileText className="w-3.5 h-3.5" />;
      case 'issued':
        return <Send className="w-3.5 h-3.5" />;
      case 'closed':
        return <Archive className="w-3.5 h-3.5" />;
      case 'running':
        return <PlayCircle className="w-3.5 h-3.5" />;
      case 'on_hold':
        return <PauseCircle className="w-3.5 h-3.5" />;
      default:
        return null; // Fallback no icon
    }
  };

  const icon = renderIcon();

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize flex items-center gap-1.5 w-max ${currentStyle}`}>
      {icon}
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
