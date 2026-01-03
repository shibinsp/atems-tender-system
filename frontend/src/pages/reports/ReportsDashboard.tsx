import React from 'react';
import { BarChart3, FileText, PiggyBank, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const reports = [
  { title: 'Tender Status', desc: 'Overview of all tenders by status', icon: FileText, path: '/reports/tender-status', color: '#2563eb', bg: '#eff6ff' },
  { title: 'Savings Report', desc: 'Cost savings analysis', icon: PiggyBank, path: '/reports/savings', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'Audit Trail', desc: 'System activity logs', icon: ClipboardList, path: '/reports/audit-trail', color: '#7c3aed', bg: '#f5f3ff' },
];

const ReportsDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Analytics and insights" icon={<BarChart3 size={24} color="#1e3a5f" />} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {reports.map((r) => (
          <Link key={r.path} to={r.path} style={{ textDecoration: 'none' }}>
            <Card className="report-card" style={{ height: '100%', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
              <CardContent style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ padding: 12, backgroundColor: r.bg, borderRadius: 10 }}>
                    <r.icon size={24} color={r.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{r.title}</h3>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>{r.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <style>{`
        .report-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default ReportsDashboard;
