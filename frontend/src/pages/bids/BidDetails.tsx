import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  File,
  AlertTriangle,
  Award
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useUIStore } from '../../store/uiStore';
import bidService from '../../services/bidService';
import tenderService from '../../services/tenderService';
import { colors, shadows } from '../../styles/constants';
import type { Bid, BidDocument, Tender } from '../../types';
import { formatDate, formatCurrency, formatFileSize } from '../../utils/formatters';

// Hover-enabled title link
const TenderTitleLink: React.FC<{ title: string }> = ({ title }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <h1
      style={{
        fontSize: '24px',
        fontWeight: 700,
        color: isHovered ? colors.primary : '#111827',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title}
    </h1>
  );
};

// Hover-enabled download button
const DownloadButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      style={{
        padding: '8px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        color: isHovered ? colors.primary : '#6b7280',
        backgroundColor: isHovered ? '#f3f4f6' : 'transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Download style={{ width: '16px', height: '16px' }} />
    </button>
  );
};

const BidDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [bid, setBid] = React.useState<Bid | null>(null);
  const [tender, setTender] = React.useState<Tender | null>(null);
  const [documents, setDocuments] = React.useState<BidDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const bidData = await bidService.getBid(parseInt(id));
        setBid(bidData);

        const [tenderData, docsData] = await Promise.all([
          tenderService.getTender(bidData.tender_id),
          bidService.getBidDocuments(bidData.id)
        ]);
        setTender(tenderData);
        setDocuments(docsData);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.detail || 'Failed to load bid'
        });
        navigate('/bids');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, addToast]);

  const handleWithdraw = async () => {
    if (!bid) return;
    if (!confirm('Are you sure you want to withdraw this bid?')) return;

    setActionLoading(true);
    try {
      const updated = await bidService.withdrawBid(bid.id);
      setBid(updated);
      addToast({
        type: 'success',
        title: 'Withdrawn',
        message: 'Bid has been withdrawn'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to withdraw bid'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { width: '20px', height: '20px' };
    switch (status) {
      case 'Submitted': return <Clock style={{ ...iconStyle, color: '#2563eb' }} />;
      case 'Under Review': return <FileText style={{ ...iconStyle, color: '#ca8a04' }} />;
      case 'Qualified': return <CheckCircle style={{ ...iconStyle, color: '#16a34a' }} />;
      case 'Shortlisted': return <Award style={{ ...iconStyle, color: '#9333ea' }} />;
      case 'Awarded': return <Award style={{ ...iconStyle, color: '#16a34a' }} />;
      case 'Disqualified': return <XCircle style={{ ...iconStyle, color: '#dc2626' }} />;
      case 'Rejected': return <XCircle style={{ ...iconStyle, color: '#dc2626' }} />;
      case 'Withdrawn': return <XCircle style={{ ...iconStyle, color: '#6b7280' }} />;
      default: return <Clock style={{ ...iconStyle, color: '#6b7280' }} />;
    }
  };

  const getStatusStyles = (status: string): { bg: string; color: string } => {
    switch (status) {
      case 'Draft': return { bg: '#f3f4f6', color: '#374151' };
      case 'Submitted': return { bg: '#dbeafe', color: '#1e40af' };
      case 'Under Review': return { bg: '#fef3c7', color: '#92400e' };
      case 'Qualified': return { bg: '#dcfce7', color: '#166534' };
      case 'Shortlisted': return { bg: '#f3e8ff', color: '#6b21a8' };
      case 'Awarded': return { bg: '#dcfce7', color: '#166534' };
      case 'Disqualified': return { bg: '#fee2e2', color: '#991b1b' };
      case 'Rejected': return { bg: '#fee2e2', color: '#991b1b' };
      case 'Withdrawn': return { bg: '#f3f4f6', color: '#6b7280' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return <Loading text="Loading bid details..." />;
  }

  if (!bid || !tender) {
    return null;
  }

  const technicalDocs = documents.filter(d => d.document_category === 'Technical');
  const financialDocs = documents.filter(d => d.document_category === 'Financial');
  const prequalDocs = documents.filter(d => d.document_category === 'Pre-Qualification');
  const statusStyles = getStatusStyles(bid.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb
        items={[
          { label: 'My Bids', path: '/bids' },
          { label: bid.bid_number }
        ]}
      />

      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: shadows.govt }}>
        <div className="bid-detail-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {getStatusIcon(bid.status)}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '9999px',
                backgroundColor: statusStyles.bg,
                color: statusStyles.color
              }}>
                {bid.status}
              </span>
              <span style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>{bid.bid_number}</span>
            </div>
            <Link to={`/tenders/${tender.id}`} style={{ display: 'block', textDecoration: 'none' }}>
              <TenderTitleLink title={tender.title} />
            </Link>
            <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
              Tender ID: {tender.tender_id}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {bid.status === 'Draft' && (
              <Link to={`/tenders/${tender.id}/bid`}>
                <Button icon={<FileText style={{ width: '16px', height: '16px' }} />}>
                  Continue Editing
                </Button>
              </Link>
            )}
            {(bid.status === 'Draft' || bid.status === 'Submitted') && (
              <Button
                variant="outline"
                onClick={handleWithdraw}
                loading={actionLoading}
                icon={<XCircle style={{ width: '16px', height: '16px' }} />}
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Withdraw
              </Button>
            )}
          </div>
        </div>

        {/* Award notification */}
        {bid.status === 'Awarded' && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px'
          }}>
            <Award style={{ width: '24px', height: '24px', color: '#16a34a', marginRight: '12px' }} />
            <div>
              <p style={{ fontWeight: 500, color: '#166534' }}>Congratulations! Your bid has been awarded.</p>
              <p style={{ fontSize: '14px', color: '#15803d' }}>Please check your email for further instructions.</p>
            </div>
          </div>
        )}

        {/* Disqualification notice */}
        {(bid.status === 'Disqualified' || bid.status === 'Rejected') && bid.remarks && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px'
          }}>
            <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626', marginRight: '12px', marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 500, color: '#991b1b' }}>
                {bid.status === 'Disqualified' ? 'Bid Disqualified' : 'Bid Rejected'}
              </p>
              <p style={{ fontSize: '14px', color: '#b91c1c', marginTop: '4px' }}>{bid.remarks}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bid-detail-grid">
        {/* Main Content */}
        <div className="bid-detail-main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Bid Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bid Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bid-info-grid">
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Financial Amount</p>
                  <p style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                    {bid.financial_amount
                      ? formatCurrency(bid.financial_amount, tender.currency)
                      : 'Not specified'}
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Submission Date</p>
                  <p style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                    {bid.submission_date ? formatDate(bid.submission_date) : 'Not submitted'}
                  </p>
                </div>
                {bid.technical_score !== undefined && bid.technical_score !== null && (
                  <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Technical Score</p>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                      {bid.technical_score.toFixed(2)}
                    </p>
                  </div>
                )}
                {bid.rank && (
                  <div style={{ padding: '16px', backgroundColor: 'rgba(30, 58, 95, 0.1)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Ranking</p>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: colors.primary }}>
                      #{bid.rank}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
                <File style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Bid Documents
              </CardTitle>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Pre-Qualification Documents */}
              {prequalDocs.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 500, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#9333ea', borderRadius: '50%', marginRight: '8px' }} />
                    Pre-Qualification Documents
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prequalDocs.map((doc) => (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <File style={{ width: '20px', height: '20px', color: '#9333ea', marginRight: '12px' }} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 500 }}>{doc.file_name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>
                              {doc.document_type} • {formatFileSize(doc.file_size)}
                            </p>
                          </div>
                        </div>
                        <DownloadButton />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Documents */}
              <div>
                <h4 style={{ fontWeight: 500, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '8px' }} />
                  Technical Proposal Documents
                </h4>
                {technicalDocs.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No technical documents</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {technicalDocs.map((doc) => (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <File style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '12px' }} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 500 }}>{doc.file_name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>
                              {doc.document_type} • {formatFileSize(doc.file_size)}
                            </p>
                          </div>
                        </div>
                        <DownloadButton />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Documents */}
              <div>
                <h4 style={{ fontWeight: 500, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', marginRight: '8px' }} />
                  Financial Proposal Documents
                </h4>
                {financialDocs.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No financial documents</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {financialDocs.map((doc) => (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <File style={{ width: '20px', height: '20px', color: '#16a34a', marginRight: '12px' }} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 500 }}>{doc.file_name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>
                              {doc.document_type} • {formatFileSize(doc.file_size)}
                            </p>
                          </div>
                        </div>
                        <DownloadButton />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="bid-detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tender Info */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '14px' }}>Tender Information</CardTitle>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Tender ID</span>
                <span style={{ fontWeight: 500 }}>{tender.tender_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Type</span>
                <span style={{ fontWeight: 500 }}>{tender.tender_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Estimated Value</span>
                <span style={{ fontWeight: 500 }}>
                  {tender.estimated_value
                    ? formatCurrency(tender.estimated_value, tender.currency)
                    : '-'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Deadline</span>
                <span style={{ fontWeight: 500 }}>{formatDate(tender.submission_deadline)}</span>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <Link
                  to={`/tenders/${tender.id}`}
                  style={{ fontSize: '14px', color: colors.primary, textDecoration: 'none' }}
                >
                  View Tender Details →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '14px' }}>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                  </div>
                  <div style={{ marginLeft: '12px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>Bid Created</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(bid.created_at)}</p>
                  </div>
                </div>
                {bid.submission_date && (
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>Bid Submitted</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(bid.submission_date)}</p>
                    </div>
                  </div>
                )}
                {bid.status === 'Withdrawn' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <XCircle style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>Bid Withdrawn</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(bid.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        .bid-detail-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bid-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .bid-detail-main {
          order: 2;
        }
        .bid-detail-sidebar {
          order: 1;
        }
        .bid-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .bid-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .bid-detail-header {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
          .bid-detail-grid {
            grid-template-columns: 2fr 1fr;
          }
          .bid-detail-main {
            order: 1;
          }
          .bid-detail-sidebar {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
};

export default BidDetails;
