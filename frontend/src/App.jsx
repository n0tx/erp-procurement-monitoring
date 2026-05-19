import { Routes, Route, Navigate } from 'react-router';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import PurchaseRequestsList from './pages/PurchaseRequestsList';
import PurchaseRequestDetail from './pages/PurchaseRequestDetail';
import PurchaseRequestForm from './pages/PurchaseRequestForm';
import VendorQuotationsList from './pages/VendorQuotationsList';
import VendorQuotationDetail from './pages/VendorQuotationDetail';
import VendorQuotationForm from './pages/VendorQuotationForm';
import PurchaseOrdersList from './pages/PurchaseOrdersList';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import ApprovalLogsList from './pages/ApprovalLogsList';
import ProjectsList from './pages/ProjectsList';
import VendorsList from './pages/VendorsList';
import Placeholder from './components/Placeholder';
import useAuthStore from './store/authStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Module Routes */}
        <Route path="purchase-requests" element={<PurchaseRequestsList />} />
        <Route path="purchase-requests/create" element={<PurchaseRequestForm />} />
        <Route path="purchase-requests/:id" element={<PurchaseRequestDetail />} />
        <Route path="vendor-quotations" element={<VendorQuotationsList />} />
        <Route path="vendor-quotations/create" element={<VendorQuotationForm />} />
        <Route path="vendor-quotations/:id" element={<VendorQuotationDetail />} />
        <Route path="purchase-orders" element={<PurchaseOrdersList />} />
        <Route path="purchase-orders/create" element={<PurchaseOrderForm />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
        
        <Route path="projects" element={<ProjectsList />} />
        <Route path="vendors" element={<VendorsList />} />
        <Route path="approval-logs" element={<ApprovalLogsList />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
