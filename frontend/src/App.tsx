import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import TenderList from './pages/tenders/TenderList';
import TenderCreate from './pages/tenders/TenderCreate';
import TenderDetails from './pages/tenders/TenderDetails';
import TenderEdit from './pages/tenders/TenderEdit';
import MyBids from './pages/bids/MyBids';
import BidSubmission from './pages/bids/BidSubmission';
import BidDetails from './pages/bids/BidDetails';
import BidderProfile from './pages/bids/BidderProfile';
import EvaluationPanel from './pages/evaluation/EvaluationPanel';
import ComparativeStatement from './pages/evaluation/ComparativeStatement';
import RFPGenerator from './pages/rfp/RFPGenerator';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import TenderStatusReport from './pages/reports/TenderStatusReport';
import SavingsReport from './pages/reports/SavingsReport';
import AuditTrailReport from './pages/reports/AuditTrailReport';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import Settings from './pages/admin/Settings';
import Toast from './components/ui/Toast';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Placeholder pages for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-500 mt-2">Coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenders" element={<TenderList />} />
            <Route path="/tenders/create" element={<TenderCreate />} />
            <Route path="/tenders/:id" element={<TenderDetails />} />
            <Route path="/tenders/:id/edit" element={<TenderEdit />} />
            <Route path="/tenders/:id/bid" element={<BidSubmission />} />
            <Route path="/bids" element={<MyBids />} />
            <Route path="/bids/profile" element={<BidderProfile />} />
            <Route path="/bids/:id" element={<BidDetails />} />
            <Route path="/evaluation" element={<PlaceholderPage title="Evaluation" />} />
            <Route path="/evaluation/:id" element={<EvaluationPanel />} />
            <Route path="/evaluation/:id/comparative" element={<ComparativeStatement />} />
            <Route path="/rfp" element={<RFPGenerator />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/reports/tender-status" element={<TenderStatusReport />} />
            <Route path="/reports/savings" element={<SavingsReport />} />
            <Route path="/reports/audit-trail" element={<AuditTrailReport />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toast />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
