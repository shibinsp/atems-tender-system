import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, IndianRupee, Building, FileText, Clock, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import type { Tender } from '../../types';
import { formatDate, formatCurrency, getDaysRemaining, getDeadlineStatus } from '../../utils/formatters';

interface TenderCardProps {
  tender: Tender;
  onPublish?: (id: number) => void;
  onClone?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const TenderCard: React.FC<TenderCardProps> = ({
  tender,
  onPublish,
  onClone,
  onDelete,
  showActions = true
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const daysRemaining = tender.submission_deadline
    ? getDaysRemaining(tender.submission_deadline)
    : null;
  const deadlineStatus = tender.submission_deadline
    ? getDeadlineStatus(tender.submission_deadline)
    : 'normal';

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <StatusBadge status={tender.status} />
              <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                {tender.tender_id}
              </span>
            </div>

            <Link to={`/tenders/${tender.id}`} style={{ display: 'block', textDecoration: 'none' }}>
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
                {tender.title}
              </h3>
            </Link>

            {tender.description && (
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {tender.description}
              </p>
            )}
          </div>

          {showActions && (
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
                    to={`/tenders/${tender.id}`}
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
                  {tender.status === 'Draft' && (
                    <>
                      <Link
                        to={`/tenders/${tender.id}/edit`}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          fontSize: '14px',
                          color: '#374151',
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </Link>
                      {onPublish && (
                        <button
                          onClick={() => { onPublish(tender.id); setShowMenu(false); }}
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
                          Publish
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => { onDelete(tender.id); setShowMenu(false); }}
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
                          Delete
                        </button>
                      )}
                    </>
                  )}
                  {onClone && (
                    <button
                      onClick={() => { onClone(tender.id); setShowMenu(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#374151',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Clone Tender
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
          <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
            <FileText style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
            <span>{tender.tender_type}</span>
          </div>

          {tender.estimated_value && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
              <IndianRupee style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
              <span>{formatCurrency(tender.estimated_value, tender.currency)}</span>
            </div>
          )}

          {tender.submission_deadline && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
              <Calendar style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
              <span>{formatDate(tender.submission_deadline)}</span>
            </div>
          )}

          {tender.department_id && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563' }}>
              <Building style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af' }} />
              <span>Dept. #{tender.department_id}</span>
            </div>
          )}
        </div>

        {tender.status === 'Published' && daysRemaining !== null && (
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
                  ? `${daysRemaining} days remaining`
                  : daysRemaining === 0
                    ? 'Deadline today!'
                    : 'Deadline passed'}
              </span>
            </div>
            <Link to={`/tenders/${tender.id}/bid`}>
              <Button size="sm" variant="primary">
                Submit Bid
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TenderCard;
