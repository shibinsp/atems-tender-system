import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Building2,
  PiggyBank,
  Clock,
  ArrowRight,
  IndianRupee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import {
  StatsCard,
  ReportFilters,
  ChartContainer,
  SimplePieChart,
  SimpleLineChart,
  SimpleBarChart
} from '../../components/reports';
import { useUIStore } from '../../store/uiStore';
import reportService from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { colors, shadows } from '../../styles/constants';
import type {
  ReportFilters as ReportFiltersType,
  TenderStatusReport,
  SavingsReport
} from '../../types';

const REPORT_CARDS = [
  {
    id: 'tender_status',
    title: 'Tender Status Report',
    description: 'Overview of all tenders by status, type, and department',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-blue-500',
    path: '/reports/tender-status'
  },
  {
    id: 'bid_summary',
    title: 'Bid Summary Report',
    description: 'Analysis of bid submissions, qualification rates, and MSME participation',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-green-500',
    path: '/reports/bid-summary'
  },
  {
    id: 'evaluation_summary',
    title: 'Evaluation Summary',
    description: 'Evaluation metrics, score distributions, and processing times',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-purple-500',
    path: '/reports/evaluation-summary'
  },
  {
    id: 'department_analysis',
    title: 'Department Analysis',
    description: 'Department-wise tender performance and category breakdown',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-orange-500',
    path: '/reports/department-analysis'
  },
  {
    id: 'savings_report',
    title: 'Savings Report',
    description: 'Cost savings analysis comparing estimated vs awarded values',
    icon: <PiggyBank className="w-6 h-6" />,
    color: 'bg-emerald-500',
    path: '/reports/savings'
  },
  {
    id: 'audit_trail',
    title: 'Audit Trail',
    description: 'Complete audit log of all system activities',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-gray-500',
    path: '/reports/audit-trail'
  }
];

const ReportsDashboard: React.FC = () => {
  const { addToast } = useUIStore();

  const [filters, setFilters] = React.useState<ReportFiltersType>({});
  const [loading, setLoading] = React.useState(true);
  const [tenderReport, setTenderReport] = React.useState<TenderStatusReport | null>(null);
  const [savingsReport, setSavingsReport] = React.useState<SavingsReport | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [tenderData, savingsData] = await Promise.all([
        reportService.getTenderStatusReport(filters),
        reportService.getSavingsReport(filters)
      ]);
      setTenderReport(tenderData);
      setSavingsReport(savingsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load report data'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = (format: 'pdf' | 'excel') => {
    addToast({
      type: 'info',
      title: 'Export',
      message: `Generating ${format.toUpperCase()} report...`
    });
  };

  if (loading && !tenderReport) {
    return <Loading text="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reports & Analytics' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: shadows.govt }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryAlpha10 }}>
            <BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">
              Comprehensive insights and analytics for tender management
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={fetchData}
        onReset={() => setFilters({})}
        onExport={handleExport}
        loading={loading}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tenders"
          value={tenderReport?.total_tenders || 0}
          subtitle="All time"
          icon={<FileText className="w-6 h-6" />}
          color="primary"
          trend={{ value: 12.5, label: 'vs last period' }}
        />
        <StatsCard
          title="Total Savings"
          value={savingsReport ? formatCurrency(savingsReport.total_savings) : '-'}
          subtitle={`${savingsReport?.savings_percentage.toFixed(1) || 0}% of estimated`}
          icon={<PiggyBank className="w-6 h-6" />}
          color="success"
          trend={{ value: 8.3, label: 'vs last period' }}
        />
        <StatsCard
          title="Avg Cycle Time"
          value={`${tenderReport?.avg_cycle_time_days || 0} days`}
          subtitle="Tender to Award"
          icon={<Clock className="w-6 h-6" />}
          color="info"
          trend={{ value: -5.2, label: 'improvement' }}
        />
        <StatsCard
          title="Awarded Value"
          value={savingsReport ? formatCurrency(savingsReport.total_awarded_value) : '-'}
          subtitle="Total contract value"
          icon={<IndianRupee className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tender Status Distribution */}
        <ChartContainer title="Tender Status Distribution" subtitle="Current status breakdown">
          {tenderReport && (
            <SimplePieChart
              data={tenderReport.by_status.map(s => ({ name: s.status, value: s.count }))}
              innerRadius={50}
            />
          )}
        </ChartContainer>

        {/* Monthly Trend */}
        <ChartContainer title="Monthly Tender Activity" subtitle="Created vs Awarded">
          {tenderReport && (
            <SimpleLineChart
              data={tenderReport.timeline.map(t => ({
                name: t.month,
                created: t.created,
                awarded: t.awarded
              }))}
              lines={[
                { dataKey: 'created', name: 'Created', color: '#3182ce' },
                { dataKey: 'awarded', name: 'Awarded', color: '#38a169' }
              ]}
            />
          )}
        </ChartContainer>
      </div>

      {/* Savings Chart */}
      <ChartContainer title="Monthly Savings Analysis" subtitle="Estimated vs Awarded values" height={350}>
        {savingsReport && (
          <SimpleBarChart
            data={savingsReport.by_month.map(m => ({
              name: m.month,
              value: m.savings
            }))}
            color="#38a169"
          />
        )}
      </ChartContainer>

      {/* Report Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_CARDS.map(report => (
            <Link key={report.id} to={report.path}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${report.color} text-white`}>
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Department Quick View */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Department</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">Tenders</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">Value</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">Savings</th>
                </tr>
              </thead>
              <tbody>
                {tenderReport?.by_department.map((dept, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                    <td className="py-3 px-4 text-right">{dept.count}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(dept.value)}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {savingsReport?.by_department.find(d => d.department === dept.department)
                        ? formatCurrency(savingsReport.by_department.find(d => d.department === dept.department)!.savings)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;
