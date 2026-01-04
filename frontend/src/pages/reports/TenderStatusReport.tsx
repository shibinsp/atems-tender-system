import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Building2, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import {
  StatsCard,
  ReportFilters,
  ChartContainer,
  SimplePieChart,
  SimpleBarChart,
  GroupedBarChart,
  DataTable
} from '../../components/reports';
import { useUIStore } from '../../store/uiStore';
import reportService from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import type { ReportFilters as ReportFiltersType, TenderStatusReport as TenderStatusReportType } from '../../types';

const TenderStatusReportPage: React.FC = () => {
  const { addToast } = useUIStore();

  const [filters, setFilters] = React.useState<ReportFiltersType>({});
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState<TenderStatusReportType | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getTenderStatusReport(filters);
      setReport(data);
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
    return <Loading text="Loading tender status report..." />;
  }

  const statusColumns = [
    { key: 'status', header: 'Status' },
    { key: 'count', header: 'Count', align: 'right' as const },
    {
      key: 'percentage',
      header: 'Percentage',
      align: 'right' as const,
      render: (value: number) => `${value.toFixed(1)}%`
    }
  ];

  const departmentColumns = [
    { key: 'department', header: 'Department' },
    { key: 'count', header: 'Tenders', align: 'right' as const },
    {
      key: 'value',
      header: 'Total Value',
      align: 'right' as const,
      render: (value: number) => formatCurrency(value)
    }
  ];

  return (
    <div>
      <PageHeader
        title="Tender Status Report"
        subtitle="Comprehensive overview of tender distribution by status, type, and department"
        icon={<FileText size={24} color="#1e3a5f" />}
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
        showStatus
        showTenderType
      />

      {report && (
        <>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatsCard
              title="Total Tenders"
              value={report.total_tenders}
              icon={<FileText size={24} />}
              color="primary"
            />
            <StatsCard
              title="Avg Cycle Time"
              value={`${report.avg_cycle_time_days} days`}
              icon={<Clock size={24} />}
              color="info"
            />
            <StatsCard
              title="Departments"
              value={report.by_department.length}
              icon={<Building2 size={24} />}
              color="warning"
            />
            <StatsCard
              title="Awarded"
              value={report.by_status.find(s => s.status === 'Awarded')?.count || 0}
              subtitle={`${report.by_status.find(s => s.status === 'Awarded')?.percentage.toFixed(1) || 0}% of total`}
              icon={<CheckCircle size={24} />}
              color="success"
            />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
            <ChartContainer title="Status Distribution" subtitle="Tenders by current status">
              <SimplePieChart
                data={report.by_status.map(s => ({ name: s.status, value: s.count }))}
              />
            </ChartContainer>

            <ChartContainer title="Tender Types" subtitle="Distribution by tender type">
              <SimpleBarChart
                data={report.by_type.map(t => ({ name: t.type, value: t.count }))}
                color="#805ad5"
              />
            </ChartContainer>
          </div>

          {/* Timeline Chart */}
          <div style={{ marginBottom: 24 }}>
            <ChartContainer title="Monthly Trend" subtitle="Tenders created vs awarded over time" height={350}>
              <GroupedBarChart
                data={report.timeline.map(t => ({
                  name: t.month,
                  created: t.created,
                  awarded: t.awarded
                }))}
                bars={[
                  { dataKey: 'created', name: 'Created', color: '#3182ce' },
                  { dataKey: 'awarded', name: 'Awarded', color: '#38a169' }
                ]}
              />
            </ChartContainer>
          </div>

          {/* Tables Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            <Card>
              <CardContent style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Status Breakdown</h3>
                </div>
                <div style={{ padding: 16 }}>
                  <DataTable columns={statusColumns} data={report.by_status} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Department-wise Distribution</h3>
                </div>
                <div style={{ padding: 16 }}>
                  <DataTable columns={departmentColumns} data={report.by_department} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TenderStatusReportPage;
