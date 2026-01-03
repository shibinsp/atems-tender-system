import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import { useUIStore } from '../../store/uiStore';
import bidService from '../../services/bidService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Bid } from '../../types';

const MyBids: React.FC = () => {
  const { addToast } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bids, setBids] = React.useState<Bid[]>([]);
  const [loading, setLoading] = React.useState(true);

  const status = searchParams.get('status') || '';

  React.useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      try {
        const res = await bidService.getMyBids();
        const bidsArray = Array.isArray(res) ? res : (res as { items?: Bid[] }).items || [];
        setBids(status ? bidsArray.filter((b: Bid) => b.status === status) : bidsArray);
      } catch {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load bids' });
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [status, addToast]);

  const stats = {
    total: bids.length,
    submitted: bids.filter((b) => b.status === 'Submitted').length,
    awarded: bids.filter((b) => b.status === 'Awarded').length,
  };

  return (
    <div>
      <PageHeader title="My Bids" subtitle={`${bids.length} bid${bids.length !== 1 ? 's' : ''}`} icon={<Send size={24} color="#1e3a5f" />} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Bids', value: stats.total, color: '#1e3a5f' },
          { label: 'Submitted', value: stats.submitted, color: '#2563eb' },
          { label: 'Awarded', value: stats.awarded, color: '#16a34a' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent style={{ padding: 12 }}>
          <select
            value={status}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              e.target.value ? params.set('status', e.target.value) : params.delete('status');
              setSearchParams(params);
            }}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minWidth: 150 }}
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Awarded">Awarded</option>
            <option value="Rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      {/* Bids List */}
      {loading ? (
        <Loading text="Loading bids..." />
      ) : bids.length === 0 ? (
        <Card>
          <CardContent style={{ padding: 60, textAlign: 'center' }}>
            <Send size={48} style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, color: '#6b7280' }}>No bids found</p>
            <Link to="/tenders" style={{ marginTop: 16, display: 'inline-block', color: '#1e3a5f', fontWeight: 500 }}>
              Browse Tenders →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bids.map((bid) => (
            <Link key={bid.id} to={`/bids/${bid.id}`} style={{ textDecoration: 'none' }}>
              <Card className="bid-card" style={{ transition: 'box-shadow 0.2s' }}>
                <CardContent style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{bid.bid_number}</span>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '4px 0' }}>Tender #{bid.tender_id}</p>
                      {bid.financial_amount && (
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Bid Amount: {formatCurrency(Number(bid.financial_amount))}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={bid.status} />
                      {bid.submission_date && (
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          <Calendar size={12} /> {formatDate(bid.submission_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .bid-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default MyBids;
