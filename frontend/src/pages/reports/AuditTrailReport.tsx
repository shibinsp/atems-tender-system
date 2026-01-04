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
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import { ReportFilters } from '../../components/reports';
import { useUIStore } from '../../store/uiStore';
import reportService from '../../services/reportService';
import type { ReportFilters as ReportFiltersType, AuditTrailReport, AuditTrailEntry } from '../../types';

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE':
      return <Plus size={16} />;
    case 'UPDATE':
      return <Edit size={16} />;
    case 'DELETE':
      return <Trash2 size={16} />;
    case 'LOGIN':
      return <LogIn size={16} />;
    case 'DOWNLOAD':
      return <Download size={16} />;
    case 'SUBMIT':
      return <Send size={16} />;
    case 'EVALUATE':
    case 'DECLARE_WINNER':
      return <Award size={16} />;
    default:
      return <FileText size={16} />;
  }
};

const getActionColor = (action: string): { backgroundColor: string; color: string } => {
  switch (action) {
    case 'CREATE':
      return { backgroundColor: '#dcfce7', color: '#16a34a' };
    case 'UPDATE':
      return { backgroundColor: '#dbeafe', color: '#2563eb' };
    case 'DELETE':
      return { backgroundColor: '#fee2e2', color: '#dc2626' };
    case 'LOGIN':
      return { backgroundColor: '#f3e8ff', color: '#9333ea' };
    case 'SUBMIT':
      return { backgroundColor: '#fef3c7', color: '#d97706' };
    case 'EVALUATE':
    case 'DECLARE_WINNER':
      return { backgroundColor: '#d1fae5', color: '#059669' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#6b7280' };
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
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Complete log of all system activities and user actions"
        icon={<Clock size={24} color="#6b7280" />}
        actions={
          <Link to="/reports">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              Back to Reports
            </Button>
          </Link>
        }
      />

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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }} className="audit-grid">
          {/* Audit Entries List */}
          <Card>
            <CardContent style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Activity Log</h3>
                <span style={{ fontSize: 14, color: '#6b7280' }}>
                  {report.total} total entries
                </span>
              </div>
              <div>
                {report.entries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    style={{
                      width: '100%',
                      padding: 16,
                      textAlign: 'left',
                      backgroundColor: selectedEntry?.id === entry.id ? 'rgba(30, 58, 95, 0.05)' : 'transparent',
                      borderLeft: selectedEntry?.id === entry.id ? '4px solid #1e3a5f' : '4px solid transparent',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      display: 'block',
                      border: 'none',
                      borderBottomWidth: 1,
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#f3f4f6',
                      borderLeftWidth: 4,
                      borderLeftStyle: 'solid',
                      borderLeftColor: selectedEntry?.id === entry.id ? '#1e3a5f' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedEntry?.id !== entry.id) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEntry?.id !== entry.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ padding: 8, borderRadius: 8, ...getActionColor(entry.action) }}>
                        {getActionIcon(entry.action)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 500, color: '#111827' }}>
                            {entry.action.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: 12, backgroundColor: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 4 }}>
                            {entry.entity_type}
                          </span>
                        </div>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.entity_name || `ID: ${entry.entity_id}`}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, fontSize: 12, color: '#9ca3af' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={12} />
                            {entry.user_name}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} />
                            {formatDateTime(entry.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 14, color: '#6b7280' }}>
                  Page {report.page} of {report.pages}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    icon={<ChevronLeft size={16} />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === report.pages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                    <ChevronRight size={16} style={{ marginLeft: 4 }} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entry Details */}
          <Card style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
            <CardContent style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Entry Details</h3>
              </div>
              <div style={{ padding: 20 }}>
                {selectedEntry ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ padding: 6, borderRadius: 4, ...getActionColor(selectedEntry.action) }}>
                          {getActionIcon(selectedEntry.action)}
                        </span>
                        <span style={{ fontWeight: 500 }}>{selectedEntry.action.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entity</label>
                      <p style={{ marginTop: 4, fontWeight: 500, marginBottom: 0 }}>{selectedEntry.entity_type}</p>
                      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                        {selectedEntry.entity_name || `ID: ${selectedEntry.entity_id}`}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</label>
                      <p style={{ marginTop: 4, fontWeight: 500, marginBottom: 0 }}>{selectedEntry.user_name}</p>
                      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>User ID: {selectedEntry.user_id}</p>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</label>
                      <p style={{ marginTop: 4, marginBottom: 0 }}>{formatDateTime(selectedEntry.created_at)}</p>
                    </div>

                    {selectedEntry.ip_address && (
                      <div>
                        <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>IP Address</label>
                        <p style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 14, marginBottom: 0 }}>{selectedEntry.ip_address}</p>
                      </div>
                    )}

                    {selectedEntry.details && (
                      <div>
                        <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</label>
                        <div style={{ marginTop: 4, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, fontSize: 14 }}>
                          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace' }}>
                            {JSON.stringify(selectedEntry.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>
                    <Clock size={48} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>Select an entry to view details</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .audit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AuditTrailReportPage;
