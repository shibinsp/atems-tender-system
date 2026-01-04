import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, DollarSign, PieChart, Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import { analyticsService } from '../../services/featureServices';

interface KPIs {
  total_tenders: number;
  active_tenders: number;
  total_bids: number;
  total_savings: number;
  savings_percentage: number;
}

interface StatusDist {
  status: string;
  count: number;
}

interface MonthlyTrend {
  month: string;
  count: number;
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  subtitle?: string;
}> = ({ title, value, icon, color, bg, subtitle }) => (
  <Card style={{ height: '100%' }}>
    <CardContent style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '8px 0 0' }}>{value}</p>
          {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        <div style={{ padding: 12, backgroundColor: bg, borderRadius: 10 }}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string }>, { size: 24, color })}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard() {
  const [kpis, setKpis] = React.useState<KPIs | null>(null);
  const [statusDist, setStatusDist] = React.useState<StatusDist[]>([]);
  const [monthlyTrend, setMonthlyTrend] = React.useState<MonthlyTrend[]>([]);
  const [topBidders, setTopBidders] = React.useState<Array<{ company_name: string; total_bids: number; win_rate: number }>>([]);
  const [categories, setCategories] = React.useState<Array<{ category: string; tender_count: number; total_value: number }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, vendorRes, catRes] = await Promise.all([
        analyticsService.getExecutiveDashboard(),
        analyticsService.getVendorParticipation(),
        analyticsService.getCategorySpend()
      ]);
      
      setKpis(dashRes.data.kpis);
      setStatusDist(dashRes.data.status_distribution || []);
      setMonthlyTrend(dashRes.data.monthly_trend || []);
      setTopBidders(vendorRes.data.top_bidders || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': '#9CA3AF', 'Published': '#3B82F6', 'Under Evaluation': '#F59E0B',
      'Evaluated': '#8B5CF6', 'Awarded': '#10B981', 'Cancelled': '#EF4444', 'Closed': '#6B7280'
    };
    return colors[status] || '#9CA3AF';
  };

  if (loading) return <Loading text="Loading analytics..." />;

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Executive overview and insights"
        icon={<PieChart size={24} color="#1e3a5f" />}
        actions={
          <Link to="/reports" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              View Reports <ArrowRight size={16} />
            </button>
          </Link>
        }
      />

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Tenders" value={kpis?.total_tenders || 0} icon={<BarChart3 />} color="#2563eb" bg="#eff6ff" />
        <StatCard title="Active Tenders" value={kpis?.active_tenders || 0} icon={<Activity />} color="#16a34a" bg="#f0fdf4" />
        <StatCard title="Total Bids" value={kpis?.total_bids || 0} icon={<Users />} color="#7c3aed" bg="#f5f3ff" />
        <StatCard title="Total Savings" value={formatCurrency(kpis?.total_savings || 0)} icon={<DollarSign />} color="#ca8a04" bg="#fefce8" />
        <StatCard title="Savings %" value={`${kpis?.savings_percentage?.toFixed(1) || 0}%`} icon={<TrendingUp />} color="#dc2626" bg="#fef2f2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="analytics-grid">
        {/* Status Distribution */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={18} color="#3b82f6" /> Tender Status Distribution
              </h3>
            </div>
            <div style={{ padding: 20 }}>
              {statusDist.map((item) => (
                <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getStatusColor(item.status) }} />
                  <span style={{ flex: 1, fontSize: 14, color: '#374151' }}>{item.status}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', minWidth: 30 }}>{item.count}</span>
                  <div style={{ width: 100, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.count / (kpis?.total_tenders || 1)) * 100}%`, height: '100%', backgroundColor: getStatusColor(item.status), borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} color="#16a34a" /> Monthly Tender Trend
              </h3>
            </div>
            <div style={{ padding: 20, display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
              {monthlyTrend.slice(-6).map((item) => {
                const maxCount = Math.max(...monthlyTrend.map(t => t.count), 1);
                const height = (item.count / maxCount) * 150;
                return (
                  <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.count}</span>
                    <div style={{ width: '100%', height: Math.max(height, 20), background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '4px 4px 0 0' }} />
                    <span style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>{item.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Bidders */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="#7c3aed" /> Top Bidders
              </h3>
            </div>
            {topBidders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No bidder data available</div>
            ) : (
              <div>
                {topBidders.slice(0, 5).map((bidder, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{idx + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{bidder.company_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{bidder.total_bids} bids</span>
                      <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 20, backgroundColor: bidder.win_rate >= 50 ? '#f0fdf4' : bidder.win_rate >= 25 ? '#fefce8' : '#f3f4f6', color: bidder.win_rate >= 50 ? '#16a34a' : bidder.win_rate >= 25 ? '#ca8a04' : '#6b7280' }}>
                        {bidder.win_rate}% win
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Spend */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={18} color="#ca8a04" /> Category-wise Tenders
              </h3>
            </div>
            {categories.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No category data available</div>
            ) : (
              <div>
                {categories.slice(0, 5).map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{cat.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{cat.tender_count} tenders</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{formatCurrency(cat.total_value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .analytics-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
