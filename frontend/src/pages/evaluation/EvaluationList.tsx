import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Search, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import { useUIStore } from '../../store/uiStore';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Tender } from '../../types';

const EvaluationList: React.FC = () => {
  const { addToast } = useUIStore();
  const [tenders, setTenders] = React.useState<Tender[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await api.get('/tenders', { params: { status: 'Under Evaluation' } });
        const data = res.data;
        setTenders(Array.isArray(data) ? data : data.items || []);
      } catch {
        // Also fetch published tenders that can be evaluated
        try {
          const res = await api.get('/tenders');
          const data = res.data;
          const all = Array.isArray(data) ? data : data.items || [];
          setTenders(all.filter((t: Tender) => ['Published', 'Under Evaluation', 'Evaluated'].includes(t.status)));
        } catch {
          addToast({ type: 'error', title: 'Error', message: 'Failed to load tenders' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, [addToast]);

  const filteredTenders = tenders.filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.tender_id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: tenders.length,
    pending: tenders.filter((t) => t.status === 'Under Evaluation').length,
    completed: tenders.filter((t) => t.status === 'Evaluated' || t.status === 'Awarded').length,
  };

  if (loading) return <Loading text="Loading evaluations..." />;

  return (
    <div>
      <PageHeader
        title="Evaluation"
        subtitle="Evaluate and score tender bids"
        icon={<ClipboardCheck size={24} color="#1e3a5f" />}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Tenders', value: stats.total, color: '#1e3a5f' },
          { label: 'Pending Evaluation', value: stats.pending, color: '#ca8a04' },
          { label: 'Completed', value: stats.completed, color: '#16a34a' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent style={{ padding: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenders..." style={{ paddingLeft: 36 }} />
          </div>
        </CardContent>
      </Card>

      {/* Tender List */}
      {filteredTenders.length === 0 ? (
        <Card>
          <CardContent style={{ padding: 60, textAlign: 'center' }}>
            <ClipboardCheck size={48} style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>No tenders available for evaluation</p>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '8px 0 0' }}>Tenders will appear here once published</p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTenders.map((tender) => (
            <Link key={tender.id} to={`/evaluation/${tender.id}`} style={{ textDecoration: 'none' }}>
              <Card className="eval-card" style={{ transition: 'box-shadow 0.2s' }}>
                <CardContent style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{tender.tender_id}</span>
                        <StatusBadge status={tender.status} size="sm" />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
                        {tender.title.length > 100 ? tender.title.slice(0, 100) + '...' : tender.title}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#6b7280' }}>
                        {tender.estimated_value && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FileText size={14} />
                            {formatCurrency(Number(tender.estimated_value))}
                          </span>
                        )}
                        {tender.submission_deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={14} />
                            Deadline: {formatDate(tender.submission_deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          backgroundColor: '#1e3a5f',
                          color: '#fff',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Evaluate →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .eval-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default EvaluationList;
