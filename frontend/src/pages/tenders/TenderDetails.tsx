import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  Edit,
  Send,
  Copy,
  XCircle,
  CheckCircle,
  Users,
  AlertTriangle,
  ChevronRight,
  Download
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import DocumentUpload from '../../components/tender/DocumentUpload';
import ExportButtons, { ComparativeStatementExport } from '../../components/reports/ExportButtons';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import tenderService from '../../services/tenderService';
import { formatDate, formatCurrency, getDaysRemaining, getDeadlineStatus } from '../../utils/formatters';
import { colors, shadows } from '../../styles/constants';
import type { Tender, TenderDocument, TenderEligibility, EvaluationCriteria } from '../../types';

const TenderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [tender, setTender] = React.useState<Tender | null>(null);
  const [documents, setDocuments] = React.useState<TenderDocument[]>([]);
  const [eligibility, setEligibility] = React.useState<TenderEligibility[]>([]);
  const [evalCriteria, setEvalCriteria] = React.useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  const canManage = user?.role === 'Admin' || user?.role === 'Tender Officer';
  const canBid = user?.role === 'Bidder' && tender?.status === 'Published';

  const daysRemaining = tender?.submission_deadline
    ? getDaysRemaining(tender.submission_deadline)
    : null;
  const deadlineStatus = tender?.submission_deadline
    ? getDeadlineStatus(tender.submission_deadline)
    : 'normal';

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [tenderData, docs, elig, evalCrit] = await Promise.all([
          tenderService.getTender(parseInt(id)),
          tenderService.getDocuments(parseInt(id)).catch(() => []),
          tenderService.getEligibility(parseInt(id)).catch(() => []),
          tenderService.getEvaluationCriteria(parseInt(id)).catch(() => [])
        ]);
        setTender(tenderData);
        setDocuments(docs);
        setEligibility(elig);
        setEvalCriteria(evalCrit);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.detail || 'Failed to load tender'
        });
        navigate('/tenders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, addToast]);

  const handlePublish = async () => {
    if (!tender) return;
    setActionLoading(true);
    try {
      const updated = await tenderService.publishTender(tender.id);
      setTender(updated);
      addToast({
        type: 'success',
        title: 'Published',
        message: 'Tender has been published successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to publish tender'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClone = async () => {
    if (!tender) return;
    setActionLoading(true);
    try {
      const cloned = await tenderService.cloneTender(tender.id);
      addToast({
        type: 'success',
        title: 'Cloned',
        message: 'Tender has been cloned successfully'
      });
      navigate(`/tenders/${cloned.id}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to clone tender'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!tender) return;
    const reason = prompt('Please provide a reason for cancellation (min 10 characters):');
    if (!reason || reason.length < 10) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Cancellation reason must be at least 10 characters'
      });
      return;
    }

    setActionLoading(true);
    try {
      const updated = await tenderService.cancelTender(tender.id, reason);
      setTender(updated);
      addToast({
        type: 'success',
        title: 'Cancelled',
        message: 'Tender has been cancelled'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to cancel tender'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading tender details..." />;
  }

  if (!tender) {
    return null;
  }

  const getDeadlineBg = () => {
    if (deadlineStatus === 'urgent') return { bg: '#fef2f2', border: '#fecaca' };
    if (deadlineStatus === 'warning') return { bg: '#fefce8', border: '#fef08a' };
    return { bg: '#eff6ff', border: '#bfdbfe' };
  };

  const getDeadlineTextColor = () => {
    if (deadlineStatus === 'urgent') return '#b91c1c';
    if (deadlineStatus === 'warning') return '#a16207';
    return '#1d4ed8';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb
        items={[
          { label: 'Tenders', path: '/tenders' },
          { label: tender.tender_id }
        ]}
      />

      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: shadows.govt }}>
        <div className="tender-detail-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <StatusBadge status={tender.status} size="lg" />
              <span style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>{tender.tender_id}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{tender.title}</h1>
            {tender.description && (
              <p style={{ marginTop: '8px', color: '#4b5563' }}>{tender.description}</p>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {canManage && tender.status === 'Draft' && (
              <>
                <Link to={`/tenders/${tender.id}/edit`}>
                  <Button variant="outline" icon={<Edit style={{ width: '16px', height: '16px' }} />}>
                    Edit
                  </Button>
                </Link>
                <Button
                  onClick={handlePublish}
                  loading={actionLoading}
                  icon={<Send style={{ width: '16px', height: '16px' }} />}
                >
                  Publish
                </Button>
              </>
            )}
            {canManage && (
              <Button
                variant="outline"
                onClick={handleClone}
                loading={actionLoading}
                icon={<Copy style={{ width: '16px', height: '16px' }} />}
              >
                Clone
              </Button>
            )}
            {canManage && !['Awarded', 'Closed', 'Cancelled'].includes(tender.status) && (
              <Button
                variant="outline"
                onClick={handleCancel}
                loading={actionLoading}
                icon={<XCircle style={{ width: '16px', height: '16px' }} />}
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Cancel
              </Button>
            )}
            {canBid && (
              <Link to={`/tenders/${tender.id}/bid`}>
                <Button icon={<CheckCircle style={{ width: '16px', height: '16px' }} />}>
                  Submit Bid
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Deadline Warning */}
        {tender.status === 'Published' && daysRemaining !== null && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: getDeadlineBg().bg,
            border: `1px solid ${getDeadlineBg().border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {deadlineStatus === 'urgent' ? (
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444', marginRight: '8px' }} />
              ) : (
                <Clock style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '8px' }} />
              )}
              <span style={{ fontWeight: 500, color: getDeadlineTextColor() }}>
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining to submit bids`
                  : daysRemaining === 0
                    ? 'Submission deadline is today!'
                    : 'Submission deadline has passed'}
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>
              Deadline: {formatDate(tender.submission_deadline!)}
            </span>
          </div>
        )}
      </div>

      <div className="tender-detail-grid">
        {/* Main Content */}
        <div className="tender-detail-main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Details Cards */}
          <div className="detail-cards-grid">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '14px' }}>Tender Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileText style={{ width: '20px', height: '20px', marginRight: '8px', color: colors.primary }} />
                  <span style={{ fontWeight: 500 }}>{tender.tender_type}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{tender.tender_stage}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '14px' }}>Estimated Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IndianRupee style={{ width: '20px', height: '20px', marginRight: '8px', color: colors.primary }} />
                  <span style={{ fontWeight: 500 }}>
                    {tender.estimated_value
                      ? formatCurrency(tender.estimated_value, tender.currency)
                      : 'Not specified'}
                  </span>
                </div>
                {tender.emd_amount && (
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    EMD: {formatCurrency(tender.emd_amount, tender.currency)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
                <Calendar style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="timeline-grid">
                {[
                  { label: 'Publishing Date', value: tender.publishing_date ? formatDate(tender.publishing_date) : '-' },
                  { label: 'Document Download', value: tender.document_download_start ? `${formatDate(tender.document_download_start)} - ${formatDate(tender.document_download_end!)}` : '-' },
                  { label: 'Submission Start', value: tender.submission_start ? formatDate(tender.submission_start) : '-' },
                  { label: 'Submission Deadline', value: tender.submission_deadline ? formatDate(tender.submission_deadline) : '-' },
                  { label: 'Technical Opening', value: tender.technical_opening_date ? formatDate(tender.technical_opening_date) : '-' },
                  { label: 'Financial Opening', value: tender.financial_opening_date ? formatDate(tender.financial_opening_date) : '-' }
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>{item.label}</span>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <DocumentUpload
            tenderId={tender.id}
            documents={documents}
            onDocumentsChange={setDocuments}
            readOnly={!canManage || tender.status !== 'Draft'}
          />

          {/* Eligibility Criteria */}
          {eligibility.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {eligibility.map((criteria, index) => (
                    <li key={criteria.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{
                        flexShrink: 0,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        marginRight: '12px',
                        backgroundColor: colors.primary,
                        color: 'white'
                      }}>
                        {index + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, color: '#111827' }}>{criteria.criteria_type}</p>
                        {criteria.criteria_value && (
                          <p style={{ fontSize: '14px', color: '#4b5563' }}>{criteria.criteria_value}</p>
                        )}
                        {criteria.is_mandatory && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            fontSize: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            Mandatory
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Evaluation Criteria */}
          {evalCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
                  <Users style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                  Evaluation Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Criteria</th>
                        <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Max Score</th>
                        <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Weight</th>
                        <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Mandatory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evalCriteria.map((criteria, index) => (
                        <tr key={criteria.id} style={{ borderBottom: index === evalCriteria.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px 0' }}>
                            <p style={{ fontWeight: 500 }}>{criteria.criteria_name}</p>
                            {criteria.description && (
                              <p style={{ color: '#6b7280', fontSize: '12px' }}>{criteria.description}</p>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 0' }}>{criteria.max_score}</td>
                          <td style={{ textAlign: 'center', padding: '12px 0' }}>{criteria.weight}%</td>
                          <td style={{ textAlign: 'center', padding: '12px 0' }}>
                            {criteria.is_mandatory ? (
                              <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a', margin: '0 auto' }} />
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="tender-detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '14px' }}>Quick Info</CardTitle>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tender.reference_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#4b5563' }}>Reference</span>
                  <span style={{ fontWeight: 500 }}>{tender.reference_number}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Bid Validity</span>
                <span style={{ fontWeight: 500 }}>{tender.bid_validity_days} days</span>
              </div>
              {tender.department_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#4b5563' }}>Department</span>
                  <span style={{ fontWeight: 500 }}>#{tender.department_id}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Created</span>
                <span style={{ fontWeight: 500 }}>{formatDate(tender.created_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Last Updated</span>
                <span style={{ fontWeight: 500 }}>{formatDate(tender.updated_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions for Bidders */}
          {user?.role === 'Bidder' && tender.status === 'Published' && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '14px' }}>Bidder Actions</CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to={`/tenders/${tender.id}/bid`} style={{ display: 'block' }}>
                  <Button fullWidth icon={<ChevronRight style={{ width: '16px', height: '16px' }} />} iconPosition="right">
                    Submit Bid
                  </Button>
                </Link>
                <Link to={`/tenders/${tender.id}/rfi`} style={{ display: 'block' }}>
                  <Button variant="outline" fullWidth>
                    Submit RFI
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          {canManage && tender.status !== 'Draft' && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '14px' }}>Management</CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to={`/tenders/${tender.id}/bids`} style={{ display: 'block' }}>
                  <Button variant="outline" fullWidth style={{ justifyContent: 'space-between' }}>
                    View Bids
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </Button>
                </Link>
                {tender.status === 'Under Evaluation' && (
                  <Link to={`/evaluation/${tender.id}`} style={{ display: 'block' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'space-between' }}>
                      Evaluation Panel
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          {canManage && tender.status !== 'Draft' && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ExportButtons
                  tenderId={tender.id}
                  tenderTitle={tender.title}
                />
                {['Under Evaluation', 'Evaluated', 'Awarded'].includes(tender.status) && (
                  <ComparativeStatementExport tenderId={tender.id} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        .tender-detail-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .tender-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .tender-detail-main {
          order: 2;
        }
        .tender-detail-sidebar {
          order: 1;
        }
        .detail-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .timeline-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .detail-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .timeline-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .tender-detail-header {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
          .tender-detail-grid {
            grid-template-columns: 2fr 1fr;
          }
          .tender-detail-main {
            order: 1;
          }
          .tender-detail-sidebar {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
};

export default TenderDetails;
