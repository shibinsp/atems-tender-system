import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import BidCard from '../../components/bid/BidCard';
import { Card, CardContent } from '../../components/ui/Card';
import { useUIStore } from '../../store/uiStore';
import bidService from '../../services/bidService';
import tenderService from '../../services/tenderService';
import { colors, shadows } from '../../styles/constants';
import type { Bid, Tender, BidStatus } from '../../types';

// Inline select component with focus styles
const FilterSelect: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        boxShadow: isFocused ? `0 0 0 2px ${colors.primary}` : 'none',
        borderColor: isFocused ? colors.primary : '#d1d5db',
      }}
    >
      {options.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
};

const BID_STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'All Bids' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Awarded', label: 'Awarded' },
  { value: 'Disqualified', label: 'Disqualified' },
  { value: 'Withdrawn', label: 'Withdrawn' }
];

const MyBids: React.FC = () => {
  const { addToast } = useUIStore();
  const [bids, setBids] = React.useState<Bid[]>([]);
  const [tenders, setTenders] = React.useState<Record<number, Tender>>({});
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [hasProfile, setHasProfile] = React.useState(true);

  const fetchBids = React.useCallback(async () => {
    setLoading(true);
    try {
      const bidsData = await bidService.getMyBids(statusFilter as BidStatus || undefined);
      setBids(bidsData);

      // Fetch tender details for each bid
      const tenderIds = [...new Set(bidsData.map(b => b.tender_id))];
      const tenderPromises = tenderIds.map(id =>
        tenderService.getTender(id).catch(() => null)
      );
      const tendersData = await Promise.all(tenderPromises);
      const tenderMap: Record<number, Tender> = {};
      tendersData.forEach(t => {
        if (t) tenderMap[t.id] = t;
      });
      setTenders(tenderMap);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasProfile(false);
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load bids'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, addToast]);

  React.useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleSubmit = async (bidId: number) => {
    try {
      await bidService.submitBid(bidId);
      addToast({
        type: 'success',
        title: 'Submitted',
        message: 'Bid has been submitted successfully'
      });
      fetchBids();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to submit bid'
      });
    }
  };

  const handleWithdraw = async (bidId: number) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;
    try {
      await bidService.withdrawBid(bidId);
      addToast({
        type: 'success',
        title: 'Withdrawn',
        message: 'Bid has been withdrawn'
      });
      fetchBids();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to withdraw bid'
      });
    }
  };

  if (loading) {
    return <Loading text="Loading your bids..." />;
  }

  // Show profile creation prompt if no profile exists
  if (!hasProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Breadcrumb items={[{ label: 'My Bids' }]} />

        <Card>
          <CardContent style={{ padding: '48px 24px', textAlign: 'center' }}>
            <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#eab308' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Bidder Profile Required
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', maxWidth: '448px', margin: '0 auto 24px' }}>
              You need to create a bidder profile before you can submit bids.
              This includes your company information and credentials.
            </p>
            <Link to="/bids/profile">
              <Button>Create Bidder Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const draftBids = bids.filter(b => b.status === 'Draft');
  const submittedBids = bids.filter(b => b.status !== 'Draft');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb items={[{ label: 'My Bids' }]} />

      {/* Header */}
      <div className="bids-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>My Bids</h1>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
            {bids.length} bid{bids.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBids}
            icon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
          >
            Refresh
          </Button>
          <Link to="/tenders">
            <Button icon={<FileText style={{ width: '16px', height: '16px' }} />}>
              Browse Tenders
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: shadows.govt }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Filter style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={BID_STATUSES}
          />
        </div>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FileText style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>No bids found</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {statusFilter
                ? 'No bids match the selected filter'
                : 'You haven\'t submitted any bids yet'}
            </p>
            <Link to="/tenders?status=Published">
              <Button>Browse Active Tenders</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Draft Bids Section */}
          {draftBids.length > 0 && !statusFilter && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#eab308', borderRadius: '50%', marginRight: '8px' }} />
                Draft Bids ({draftBids.length})
              </h2>
              <div className="bids-grid">
                {draftBids.map((bid) => {
                  const tender = tenders[bid.tender_id];
                  return (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      tenderTitle={tender?.title}
                      tenderDeadline={tender?.submission_deadline}
                      onSubmit={handleSubmit}
                      onWithdraw={handleWithdraw}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Submitted Bids Section */}
          {(submittedBids.length > 0 || statusFilter) && (
            <div>
              {!statusFilter && draftBids.length > 0 && (
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '8px' }} />
                  Submitted Bids ({submittedBids.length})
                </h2>
              )}
              <div className="bids-grid">
                {(statusFilter ? bids : submittedBids).map((bid) => {
                  const tender = tenders[bid.tender_id];
                  return (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      tenderTitle={tender?.title}
                      tenderDeadline={tender?.submission_deadline}
                      onWithdraw={bid.status === 'Submitted' ? handleWithdraw : undefined}
                      showActions={bid.status === 'Draft'}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .bids-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bids-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .bids-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        @media (min-width: 768px) {
          .bids-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .bids-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default MyBids;
