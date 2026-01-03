import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  Building2,
  PiggyBank,
  Users,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Breadcrumb from '../components/layout/Breadcrumb';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { formatDate, getDeadlineStatus, formatCurrency } from '../utils/formatters';
import { colors, shadows } from '../styles/constants';
import type { DashboardStats, UpcomingDeadline } from '../types';

interface Analytics {
  total_tenders: number;
  total_bids: number;
  awarded_tenders: number;
  total_estimated_value: number;
  total_awarded_value: number;
  total_savings: number;
  savings_percentage: number;
  average_bids_per_tender: number;
  msme_participation: number;
}

interface DepartmentAnalysis {
  department_id: number;
  department_name: string;
  total_tenders: number;
  awarded_tenders: number;
  total_value: number;
  completion_rate: number;
}

interface TrendData {
  period: string;
  tender_trend: Array<{ date: string; count: number }>;
  bid_trend: Array<{ date: string; count: number }>;
}

// Stat Card component with proper hover handling
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  link: string;
}> = ({ title, value, icon: Icon, color, bgColor, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <Card
        style={{
          boxShadow: isHovered ? shadows.govtLg : shadows.govt,
          transition: 'box-shadow 0.2s ease-in-out',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>{title}</p>
              <p style={{ marginTop: '8px', fontSize: '30px', fontWeight: 700, color: '#111827' }}>{value}</p>
            </div>
            <div style={{ backgroundColor: bgColor, padding: '12px', borderRadius: '8px' }}>
              <Icon style={{ color, width: '24px', height: '24px' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [deadlines, setDeadlines] = React.useState<UpcomingDeadline[]>([]);
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [departments, setDepartments] = React.useState<DepartmentAnalysis[]>([]);
  const [trends, setTrends] = React.useState<TrendData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const isStaff = user?.role === 'Admin' || user?.role === 'Tender Officer' || user?.role === 'Evaluator';

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const requests = [
        api.get('/dashboard/stats'),
        api.get('/dashboard/upcoming-deadlines')
      ];

      // Fetch additional analytics for staff users
      if (isStaff) {
        requests.push(
          api.get('/dashboard/analytics'),
          api.get('/dashboard/department-analysis'),
          api.get('/dashboard/trends?period=6m')
        );
      }

      const responses = await Promise.all(requests);
      setStats(responses[0].data);
      setDeadlines(responses[1].data);

      if (isStaff && responses.length > 2) {
        setAnalytics(responses[2].data);
        setDepartments(responses[3].data);
        setTrends(responses[4].data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Active Tenders',
      value: stats?.active_tenders || 0,
      icon: FileText,
      color: '#2563eb',
      bgColor: '#eff6ff',
      link: '/tenders?status=Published'
    },
    {
      title: 'Pending Evaluations',
      value: stats?.pending_evaluations || 0,
      icon: Clock,
      color: '#ca8a04',
      bgColor: '#fefce8',
      link: '/evaluation'
    },
    {
      title: 'Total Bids',
      value: stats?.total_bids || stats?.my_bids || 0,
      icon: CheckCircle,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      link: user?.role === 'Bidder' ? '/bids' : '/tenders'
    },
    {
      title: 'Upcoming Deadlines',
      value: stats?.upcoming_deadlines || 0,
      icon: AlertTriangle,
      color: '#dc2626',
      bgColor: '#fef2f2',
      link: '/tenders?status=Published'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
            Here's what's happening with your tenders today.
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Tender Officer') && (
          <Link to="/tenders/create" className="create-tender-link">
            <Button icon={<Plus style={{ width: '16px', height: '16px' }} />}>
              Create Tender
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Analytics Section for Staff */}
      {isStaff && analytics && (
        <div className="stats-grid">
          <Card>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Total Savings</p>
                  <p style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>
                    {formatCurrency(analytics.total_savings)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>{analytics.savings_percentage}% saved</p>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
                  <PiggyBank style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Avg Bids/Tender</p>
                  <p style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>
                    {analytics.average_bids_per_tender}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>competition level</p>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
                  <BarChart3 style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>MSME Participation</p>
                  <p style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700, color: '#9333ea' }}>
                    {analytics.msme_participation}%
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>of total bids</p>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#faf5ff' }}>
                  <Users style={{ width: '20px', height: '20px', color: '#9333ea' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Awarded Tenders</p>
                  <p style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700, color: '#ea580c' }}>
                    {analytics.awarded_tenders}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>of {analytics.total_tenders} total</p>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fff7ed' }}>
                  <CheckCircle style={{ width: '20px', height: '20px', color: '#ea580c' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <Clock style={{ color: colors.primary, width: '20px', height: '20px', marginRight: '8px' }} />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>
                No upcoming deadlines
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {deadlines.slice(0, 5).map((deadline) => {
                  const status = getDeadlineStatus(deadline.submission_deadline);
                  return (
                    <Link
                      key={deadline.id}
                      to={`/tenders/${deadline.id}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div className="deadline-item" style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#111827',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {deadline.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {deadline.tender_id}
                          </p>
                        </div>
                        <div style={{ marginLeft: '16px', textAlign: 'right' }}>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                            {formatDate(deadline.submission_deadline)}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            marginTop: '4px',
                            color: status === 'urgent' ? '#dc2626' :
                                   status === 'warning' ? '#ca8a04' : '#6b7280'
                          }}>
                            {deadline.days_remaining} days left
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp style={{ color: colors.primary, width: '20px', height: '20px', marginRight: '8px' }} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {user?.role === 'Bidder' ? (
                <>
                  <Link to="/tenders" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start' }}>
                      <FileText style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Browse Tenders
                    </Button>
                  </Link>
                  <Link to="/bids" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start' }}>
                      <CheckCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      My Bids
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/tenders/create" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start' }}>
                      <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      New Tender
                    </Button>
                  </Link>
                  <Link to="/evaluation" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start' }}>
                      <CheckCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Evaluations
                    </Button>
                  </Link>
                  <Link to="/reports" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start' }}>
                      <TrendingUp style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Reports
                    </Button>
                  </Link>
                  <Link to="/rfp" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth style={{ justifyContent: 'flex-start' }}>
                      <FileText style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      RFP Generator
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis for Staff */}
      {isStaff && departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <Building2 style={{ color: colors.primary, width: '20px', height: '20px', marginRight: '8px' }} />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Department</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Total Tenders</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Awarded</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Total Value</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 500, color: '#374151' }}>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, index) => (
                    <tr key={dept.department_id} className="dept-row" style={{
                      borderBottom: index === departments.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>{dept.department_name}</td>
                      <td style={{ textAlign: 'center', padding: '12px 0' }}>{dept.total_tenders}</td>
                      <td style={{ textAlign: 'center', padding: '12px 0' }}>{dept.awarded_tenders}</td>
                      <td style={{ textAlign: 'right', padding: '12px 0' }}>{formatCurrency(dept.total_value)}</td>
                      <td style={{ textAlign: 'center', padding: '12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            width: '64px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '9999px',
                            height: '8px',
                            marginRight: '8px'
                          }}>
                            <div style={{
                              backgroundColor: colors.primary,
                              width: `${dept.completion_rate}%`,
                              height: '8px',
                              borderRadius: '9999px'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#4b5563' }}>{dept.completion_rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends Section for Staff */}
      {isStaff && trends && (trends.tender_trend.length > 0 || trends.bid_trend.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp style={{ color: colors.primary, width: '20px', height: '20px', marginRight: '8px' }} />
              Activity Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="trends-grid">
              {/* Tender Trend */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Tenders Created</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {trends.tender_trend.slice(-7).map((item) => (
                    <div key={item.date} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', width: '80px' }}>{item.date}</span>
                      <div style={{ flex: 1, margin: '0 8px' }}>
                        <div style={{
                          backgroundColor: '#3b82f6',
                          height: '16px',
                          borderRadius: '4px',
                          width: `${Math.min(item.count * 20, 100)}%`
                        }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, width: '32px', textAlign: 'right' }}>{item.count}</span>
                    </div>
                  ))}
                  {trends.tender_trend.length === 0 && (
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>No data available</p>
                  )}
                </div>
              </div>

              {/* Bid Trend */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Bids Submitted</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {trends.bid_trend.slice(-7).map((item) => (
                    <div key={item.date} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', width: '80px' }}>{item.date}</span>
                      <div style={{ flex: 1, margin: '0 8px' }}>
                        <div style={{
                          backgroundColor: '#22c55e',
                          height: '16px',
                          borderRadius: '4px',
                          width: `${Math.min(item.count * 20, 100)}%`
                        }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, width: '32px', textAlign: 'right' }}>{item.count}</span>
                    </div>
                  ))}
                  {trends.bid_trend.length === 0 && (
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>No data available</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <style>{`
        .dashboard-welcome {
          display: flex;
          flex-direction: column;
        }
        .create-tender-link {
          margin-top: 16px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .trends-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .deadline-item:hover {
          background-color: #f9fafb;
        }
        .dept-row:hover {
          background-color: #f9fafb;
        }
        @media (min-width: 640px) {
          .dashboard-welcome {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .create-tender-link {
            margin-top: 0;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 768px) {
          .trends-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .content-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
