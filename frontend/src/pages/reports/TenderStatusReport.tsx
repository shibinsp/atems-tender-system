import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Building2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
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
      // In a real implementation:
      // const blob = await reportService.exportReport('tender_status', format, filters);
      // downloadBlob(blob, `tender-status-report.${format}`);
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
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reports', path: '/reports' },
          { label: 'Tender Status Report' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-govt p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tender Status Report</h1>
              <p className="text-gray-600">
                Comprehensive overview of tender distribution by status, type, and department
              </p>
            </div>
          </div>
          <Link to="/reports">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Reports
            </Button>
          </Link>
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
        showStatus
        showTenderType
      />

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Tenders"
              value={report.total_tenders}
              icon={<FileText className="w-6 h-6" />}
              color="primary"
            />
            <StatsCard
              title="Avg Cycle Time"
              value={`${report.avg_cycle_time_days} days`}
              icon={<Clock className="w-6 h-6" />}
              color="info"
            />
            <StatsCard
              title="Departments"
              value={report.by_department.length}
              icon={<Building2 className="w-6 h-6" />}
              color="warning"
            />
            <StatsCard
              title="Awarded"
              value={report.by_status.find(s => s.status === 'Awarded')?.count || 0}
              subtitle={`${report.by_status.find(s => s.status === 'Awarded')?.percentage.toFixed(1) || 0}% of total`}
              color="success"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={statusColumns} data={report.by_status} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={departmentColumns} data={report.by_department} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TenderStatusReportPage;
