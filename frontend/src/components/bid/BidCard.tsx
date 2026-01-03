import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, IndianRupee, FileText, Clock, ExternalLink, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import type { Bid } from '../../types';
import { formatDate, formatCurrency, getDaysRemaining, getDeadlineStatus } from '../../utils/formatters';
import { colors } from '../../styles/constants';

interface BidCardProps {
  bid: Bid;
  tenderTitle?: string;
  tenderDeadline?: string;
  onWithdraw?: (id: number) => void;
  onSubmit?: (id: number) => void;
  showActions?: boolean;
}

const BidCard: React.FC<BidCardProps> = ({
  bid,
  tenderTitle,
  tenderDeadline,
  onWithdraw,
  onSubmit,
  showActions = true
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const daysRemaining = tenderDeadline ? getDaysRemaining(tenderDeadline) : null;
  const deadlineStatus = tenderDeadline ? getDeadlineStatus(tenderDeadline) : 'normal';

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusStyle = (status: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: 500,
      borderRadius: '9999px',
    };

    switch (status) {
      case 'Draft': return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
      case 'Submitted': return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Under Review': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Qualified': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'Shortlisted': return { ...baseStyle, backgroundColor: '#f3e8ff', color: '#6b21a8' };
      case 'Awarded': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'Disqualified': return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Rejected': return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Withdrawn': return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280' };
      default: return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getDeadlineBg = () => {
    if (deadlineStatus === 'urgent') return '#fef2f2';
    if (deadlineStatus === 'warning') return '#fefce8';
    return '#f9fafb';
  };

  const getDeadlineColor = () => {
    if (deadlineStatus === 'urgent') return '#b91c1c';
    if (deadlineStatus === 'warning') return '#a16207';
    return '#374151';
  };

  const getDeadlineIconColor = () => {
    if (deadlineStatus === 'urgent') return '#ef4444';
    if (deadlineStatus === 'warning') return '#eab308';
    return '#6b7280';
  };

  return (
    <Card
      style={{
        transition: 'box-shadow 0.2s',
        boxShadow: isHovered
          ? '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)'
          : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={getStatusStyle(bid.status)}>{bid.status}</span>
              <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                {bid.bid_number}
              </span>
            </div>

            {tenderTitle && (
              <Link to={`/tenders/${bid.tender_id}`} style={{ display: 'block', textDecoration: 'none' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tenderTitle}
                </h3>
              </Link>
            )}
          </div>

          {showActions && bid.status === 'Draft' && (
            <div style={{ position: 'relative', marginLeft: '16px' }} ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <MoreVertical style={{ width: '20px', height: '20px' }} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '4px',
                    width: '192px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '4px 0',
                    zIndex: 10,
                  }}
                >
                  <Link
                    to={`/bids/${bid.id}`}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                    }}
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/bids/${bid.id}/edit`}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                    }}
                  >
                    Edit Bid
                  </Link>
                  {onSubmit && (
                    <button
                      onClick={() => { onSubmit(bid.id); setShowMenu(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#16a34a',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Submit Bid
                    </button>
                  )}
                  {onWithdraw && (
                    <button
                      onClick={() => { onWithdraw(bid.id); setShowMenu(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            fontSize: '14px',
          }}
        >
          {bid.financial_amount && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
              <IndianRupee style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
              <span>{formatCurrency(bid.financial_amount)}</span>
            </div>
          )}

          {bid.submission_date && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
              <Calendar style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
              <span>Submitted: {formatDate(bid.submission_date)}</span>
            </div>
          )}

          {bid.technical_score !== undefined && bid.technical_score !== null && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
              <FileText style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
              <span>Tech Score: {bid.technical_score.toFixed(2)}</span>
            </div>
          )}

          {bid.rank && (
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: colors.primary }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginRight: '8px',
                }}
              >
                {bid.rank}
              </span>
              <span>Rank #{bid.rank}</span>
            </div>
          )}
        </div>

        {/* Deadline warning for draft bids */}
        {bid.status === 'Draft' && tenderDeadline && daysRemaining !== null && (
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: getDeadlineBg(),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Clock
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  color: getDeadlineIconColor(),
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: getDeadlineColor(),
                }}
              >
                {daysRemaining > 0
                  ? `${daysRemaining} days to submit`
                  : daysRemaining === 0
                    ? 'Submit today!'
                    : 'Deadline passed'}
              </span>
            </div>
            {daysRemaining >= 0 && onSubmit && (
              <Button size="sm" onClick={() => onSubmit(bid.id)}>
                Submit Now
              </Button>
            )}
          </div>
        )}

        {/* View details link for submitted bids */}
        {bid.status !== 'Draft' && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            <Link
              to={`/bids/${bid.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: colors.primary,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              View Bid Details
              <ExternalLink style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidCard;
