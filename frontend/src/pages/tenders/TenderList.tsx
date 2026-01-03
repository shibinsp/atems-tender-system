import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import tenderService from '../../services/tenderService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Tender } from '../../types';

const TenderList: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tenders, setTenders] = React.useState<Tender[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const canCreate = user?.role === 'Admin' || user?.role === 'Tender Officer';

  const fetchTenders = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await tenderService.getTenders({ page, size: 12, search: search || undefined, status: status || undefined });
      setTenders(res.items);
      setTotal(res.total);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load tenders' });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, addToast]);

  React.useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    value ? params.set(key, value) : params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div>
      <PageHeader
        title="Tenders"
        subtitle={`${total} tender${total !== 1 ? 's' : ''} found`}
        icon={<FileText size={24} color="#1e3a5f" />}
        actions={
          canCreate && (
            <Link to="/tenders/create">
              <Button icon={<Plus size={16} />}>Create Tender</Button>
            </Link>
          )
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <Input
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search tenders..."
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select
              value={status}
              onChange={(e) => updateFilter('status', e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minWidth: 150 }}
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Under Evaluation">Under Evaluation</option>
              <option value="Awarded">Awarded</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tender List */}
      {loading ? (
        <Loading text="Loading tenders..." />
      ) : tenders.length === 0 ? (
        <Card>
          <CardContent style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, color: '#6b7280' }}>No tenders found</p>
            {canCreate && (
              <Link to="/tenders/create" style={{ marginTop: 16, display: 'inline-block' }}>
                <Button>Create First Tender</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {tenders.map((tender) => (
            <Link key={tender.id} to={`/tenders/${tender.id}`} style={{ textDecoration: 'none' }}>
              <Card style={{ height: '100%', transition: 'box-shadow 0.2s' }} className="tender-card">
                <CardContent style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{tender.tender_id}</span>
                    <StatusBadge status={tender.status} size="sm" />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 12px', lineHeight: 1.4 }}>
                    {tender.title.length > 80 ? tender.title.slice(0, 80) + '...' : tender.title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#6b7280' }}>
                    {tender.estimated_value && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{formatCurrency(Number(tender.estimated_value))}</span>
                      </div>
                    )}
                    {tender.submission_deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} />
                        <span>Due: {formatDate(tender.submission_deadline)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => updateFilter('page', String(page - 1))}
          >
            Previous
          </Button>
          <span style={{ padding: '8px 16px', fontSize: 14, color: '#6b7280' }}>
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => updateFilter('page', String(page + 1))}
          >
            Next
          </Button>
        </div>
      )}

      <style>{`
        .tender-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default TenderList;
