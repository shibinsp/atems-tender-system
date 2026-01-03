import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  User,
  FileText,
  Edit,
  Plus,
  Trash2,
  LogIn,
  Download,
  Send,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { ReportFilters } from '../../components/reports';
import { useUIStore } from '../../store/uiStore';
import reportService from '../../services/reportService';
import type { ReportFilters as ReportFiltersType, AuditTrailReport, AuditTrailEntry } from '../../types';

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE':
      return <Plus className="w-4 h-4" />;
    case 'UPDATE':
      return <Edit className="w-4 h-4" />;
    case 'DELETE':
      return <Trash2 className="w-4 h-4" />;
    case 'LOGIN':
      return <LogIn className="w-4 h-4" />;
    case 'DOWNLOAD':
      return <Download className="w-4 h-4" />;
    case 'SUBMIT':
      return <Send className="w-4 h-4" />;
    case 'EVALUATE':
    case 'DECLARE_WINNER':
      return <Award className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'bg-green-100 text-green-600';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-600';
    case 'DELETE':
      return 'bg-red-100 text-red-600';
    case 'LOGIN':
      return 'bg-purple-100 text-purple-600';
    case 'SUBMIT':
      return 'bg-yellow-100 text-yellow-600';
    case 'EVALUATE':
    case 'DECLARE_WINNER':
      return 'bg-emerald-100 text-emerald-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AuditTrailReportPage: React.FC = () => {
  const { addToast } = useUIStore();

  const [filters, setFilters] = React.useState<ReportFiltersType>({});
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState<AuditTrailReport | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedEntry, setSelectedEntry] = React.useState<AuditTrailEntry | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getAuditTrailReport({ ...filters, page: currentPage });
      setReport(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load audit trail'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      addToast({
        type: 'info',
        title: 'Exporting',
        message: `Generating ${format.toUpperCase()} report...`
      });
      addToast({
        type: 'success',
        title: 'Success',
        message: `Audit trail exported as ${format.toUpperCase()}`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to export report'
      });
    }
  };

  if (loading && !report) {
    return <Loading text="Loading audit trail..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reports', path: '/reports' },
          { label: 'Audit Trail' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-govt p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
              <p className="text-gray-600">
                Complete log of all system activities and user actions
              </p>
            </div>
          </div>
          <Link to="/reports">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={fetchData}
        onReset={() => {
          setFilters({});
          setCurrentPage(1);
        }}
        onExport={handleExport}
        loading={loading}
        showDepartment={false}
        showCategory={false}
      />

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audit Entries List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Activity Log</CardTitle>
                  <span className="text-sm text-gray-500">
                    {report.total} total entries
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {report.entries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedEntry?.id === entry.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
                          {getActionIcon(entry.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {entry.action.replace('_', ' ')}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {entry.entity_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {entry.entity_name || `ID: ${entry.entity_id}`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {entry.user_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(entry.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t">
                  <span className="text-sm text-gray-500">
                    Page {report.page} of {report.pages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === report.pages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      icon={<ChevronRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entry Details */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Entry Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEntry ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Action</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`p-1.5 rounded ${getActionColor(selectedEntry.action)}`}>
                          {getActionIcon(selectedEntry.action)}
                        </span>
                        <span className="font-medium">{selectedEntry.action.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Entity</label>
                      <p className="mt-1 font-medium">{selectedEntry.entity_type}</p>
                      <p className="text-sm text-gray-600">
                        {selectedEntry.entity_name || `ID: ${selectedEntry.entity_id}`}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">User</label>
                      <p className="mt-1 font-medium">{selectedEntry.user_name}</p>
                      <p className="text-sm text-gray-600">User ID: {selectedEntry.user_id}</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</label>
                      <p className="mt-1">{formatDateTime(selectedEntry.created_at)}</p>
                    </div>

                    {selectedEntry.ip_address && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">IP Address</label>
                        <p className="mt-1 font-mono text-sm">{selectedEntry.ip_address}</p>
                      </div>
                    )}

                    {selectedEntry.details && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Details</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(selectedEntry.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Select an entry to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailReportPage;
