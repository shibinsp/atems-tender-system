import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface Stats {
  active_tenders: number;
  pending_evaluations?: number;
  total_bids?: number;
  my_bids?: number;
  upcoming_deadlines: number;
}

interface Deadline {
  id: number;
  tender_id: string;
  title: string;
  submission_deadline: string;
  days_remaining: number;
}

interface Analytics {
  total_tenders: number;
  total_bids: number;
  awarded_tenders: number;
  total_savings: number;
  savings_percentage: number;
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  link?: string;
}> = ({ title, value, icon, color, bg, link }) => {
  const content = (
    <Card style={{ height: '100%', cursor: link ? 'pointer' : 'default' }}>
      <CardContent style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', margin: 0 }}>{title}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '8px 0 0' }}>{value}</p>
          </div>
          <div style={{ padding: 12, backgroundColor: bg, borderRadius: 10 }}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string }>, { size: 24, color })}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
};

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [deadlines, setDeadlines] = React.useState<Deadline[]>([]);
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [loading, setLoading] = React.useState(true);

  const isStaff = ['Admin', 'Tender Officer', 'Evaluator'].includes(user?.role || '');
  const isBidder = user?.role === 'Bidder';

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, deadlinesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/upcoming-deadlines'),
        ]);
        setStats(statsRes.data);
        setDeadlines(deadlinesRes.data);

        if (isStaff) {
          const analyticsRes = await api.get('/dashboard/analytics').catch(() => ({ data: null }));
          setAnalytics(analyticsRes.data);
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isStaff]);

  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name?.split(' ')[0] || 'User'}!`}
        subtitle={`${user?.role} Dashboard • ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          isStaff ? (
            <Link to="/tenders/create">
              <Button icon={<Plus size={16} />}>New Tender</Button>
            </Link>
          ) : null
        }
      />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          title="Active Tenders"
          value={stats?.active_tenders || 0}
          icon={<FileText />}
          color="#2563eb"
          bg="#eff6ff"
          link="/tenders?status=Published"
        />
        {isStaff && (
          <StatCard
            title="Pending Evaluations"
            value={stats?.pending_evaluations || 0}
            icon={<Clock />}
            color="#ca8a04"
            bg="#fefce8"
            link="/evaluation"
          />
        )}
        <StatCard
          title={isBidder ? 'My Bids' : 'Total Bids'}
          value={stats?.my_bids || stats?.total_bids || 0}
          icon={<CheckCircle />}
          color="#16a34a"
          bg="#f0fdf4"
          link={isBidder ? '/bids' : '/tenders'}
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats?.upcoming_deadlines || 0}
          icon={<AlertTriangle />}
          color="#dc2626"
          bg="#fef2f2"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="dashboard-grid">
        {/* Upcoming Deadlines */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Upcoming Deadlines</h3>
            </div>
            {deadlines.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                <Clock size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              <div>
                {deadlines.slice(0, 5).map((d) => (
                  <Link
                    key={d.id}
                    to={`/tenders/${d.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{d.title}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{d.tender_id}</p>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 20,
                        backgroundColor: d.days_remaining <= 2 ? '#fef2f2' : d.days_remaining <= 7 ? '#fefce8' : '#f0fdf4',
                        color: d.days_remaining <= 2 ? '#dc2626' : d.days_remaining <= 7 ? '#ca8a04' : '#16a34a',
                      }}
                    >
                      {d.days_remaining} days left
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics for Staff */}
        {isStaff && analytics && (
          <Card>
            <CardContent style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Analytics Overview</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, backgroundColor: '#e5e7eb' }}>
                {[
                  { label: 'Total Tenders', value: analytics.total_tenders },
                  { label: 'Total Bids', value: analytics.total_bids },
                  { label: 'Awarded', value: analytics.awarded_tenders },
                  { label: 'Savings', value: `${analytics.savings_percentage.toFixed(1)}%` },
                ].map((item) => (
                  <div key={item.label} style={{ padding: 16, backgroundColor: '#fff', textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{item.value}</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
