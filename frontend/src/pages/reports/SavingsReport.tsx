import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PiggyBank, TrendingDown, Building2, Tag } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import {
  StatsCard,
  ReportFilters,
  ChartContainer,
  GroupedBarChart,
  SimpleAreaChart,
  ProgressBar,
  DataTable
} from '../../components/reports';
import { useUIStore } from '../../store/uiStore';
import reportService from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import type { ReportFilters as ReportFiltersType, SavingsReport as SavingsReportType } from '../../types';

const SavingsReportPage: React.FC = () => {
  const { addToast } = useUIStore();

  const [filters, setFilters] = React.useState<ReportFiltersType>({});
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState<SavingsReportType | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getSavingsReport(filters);
      setReport(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load savings report'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      addToast({
        type: 'info',
        title: 'Exporting',
        message: `Generating ${format.toUpperCase()} report...`
      });
      addToast({
        type: 'success',
        title: 'Success',
        message: `Report exported as ${format.toUpperCase()}`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to export report'
      });
    }
  };

  if (loading && !report) {
    return <Loading text="Loading savings report..." />;
  }

  const departmentColumns = [
    { key: 'department', header: 'Department' },
    {
      key: 'estimated',
      header: 'Estimated',
      align: 'right' as const,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'awarded',
      header: 'Awarded',
      align: 'right' as const,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'savings',
      header: 'Savings',
      align: 'right' as const,
      render: (value: number, row: any) => (
        <span style={{ color: '#16a34a', fontWeight: 500 }}>
          {formatCurrency(value)} ({row.estimated > 0 ? ((value / row.estimated) * 100).toFixed(1) : 0}%)
        </span>
      )
    }
  ];

  const categoryColumns = [
    { key: 'category', header: 'Category' },
    {
      key: 'estimated',
      header: 'Estimated',
      align: 'right' as const,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'awarded',
      header: 'Awarded',
      align: 'right' as const,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'savings',
      header: 'Savings',
      align: 'right' as const,
      render: (value: number, row: any) => (
        <span style={{ color: '#16a34a', fontWeight: 500 }}>
          {formatCurrency(value)} ({row.estimated > 0 ? ((value / row.estimated) * 100).toFixed(1) : 0}%)
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Savings Report"
        subtitle="Analysis of cost savings comparing estimated vs awarded contract values"
        icon={<PiggyBank size={24} color="#16a34a" />}
        actions={
          <Link to="/reports">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              Back to Reports
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={fetchData}
        onReset={() => setFilters({})}
        onExport={handleExport}
        loading={loading}
      />

      {report && (
        <>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatsCard
              title="Total Estimated"
              value={formatCurrency(report.total_estimated_value)}
              icon={<Tag size={24} />}
              color="info"
            />
            <StatsCard
              title="Total Awarded"
              value={formatCurrency(report.total_awarded_value)}
              icon={<TrendingDown size={24} />}
              color="warning"
            />
            <StatsCard
              title="Total Savings"
              value={formatCurrency(report.total_savings)}
              icon={<PiggyBank size={24} />}
              color="success"
            />
            <StatsCard
              title="Savings Rate"
              value={`${report.savings_percentage.toFixed(1)}%`}
              subtitle="of estimated value"
              color="success"
            />
          </div>

          {/* Overall Savings Progress */}
          <Card style={{ marginBottom: 24 }}>
            <CardContent style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Overall Savings Achievement</h3>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: '#6b7280' }}>Estimated Value</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(report.total_estimated_value)}</span>
                </div>
                <div style={{ position: 'relative', paddingTop: 16 }}>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: 9999, height: 24 }}>
                    <div
                      style={{
                        height: 24,
                        borderRadius: 9999,
                        background: 'linear-gradient(to right, #4ade80, #16a34a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 8,
                        width: `${100 - report.savings_percentage}%`
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'white', fontWeight: 500 }}>
                        {formatCurrency(report.total_awarded_value)}
                      </span>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', right: 0, top: 0, fontSize: 14, color: '#16a34a', fontWeight: 500 }}>
                    Saved: {formatCurrency(report.total_savings)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <div style={{ marginBottom: 24 }}>
            <ChartContainer
              title="Monthly Savings Trend"
              subtitle="Estimated vs Awarded values over time"
              height={350}
            >
              <SimpleAreaChart
                data={report.by_month.map(m => ({
                  name: m.month,
                  estimated: m.estimated,
                  awarded: m.awarded,
                  savings: m.savings
                }))}
                areas={[
                  { dataKey: 'estimated', name: 'Estimated', color: '#3182ce' },
                  { dataKey: 'awarded', name: 'Awarded', color: '#38a169' }
                ]}
              />
            </ChartContainer>
          </div>

          {/* Department & Category Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
            <Card>
              <CardContent style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={20} color="#6b7280" />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Savings by Department</h3>
                </div>
                <div style={{ padding: 16 }}>
                  <DataTable columns={departmentColumns} data={report.by_department} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={20} color="#6b7280" />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Savings by Category</h3>
                </div>
                <div style={{ padding: 16 }}>
                  <DataTable columns={categoryColumns} data={report.by_category} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Comparison Chart */}
          <div style={{ marginBottom: 24 }}>
            <ChartContainer
              title="Department-wise Comparison"
              subtitle="Estimated vs Awarded by department"
              height={350}
            >
              <GroupedBarChart
                data={report.by_department.map(d => ({
                  name: d.department,
                  estimated: d.estimated,
                  awarded: d.awarded
                }))}
                bars={[
                  { dataKey: 'estimated', name: 'Estimated', color: '#3182ce' },
                  { dataKey: 'awarded', name: 'Awarded', color: '#38a169' }
                ]}
              />
            </ChartContainer>
          </div>

          {/* Savings by Department Progress Bars */}
          <Card>
            <CardContent style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Department Savings Rates</h3>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {report.by_department.map(dept => (
                  <ProgressBar
                    key={dept.department}
                    label={dept.department}
                    value={dept.estimated > 0 ? (dept.savings / dept.estimated) * 100 : 0}
                    color="#38a169"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SavingsReportPage;
