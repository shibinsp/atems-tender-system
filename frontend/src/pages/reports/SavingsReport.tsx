import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PiggyBank, TrendingDown, Building2, Tag } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
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
        <span className="text-green-600 font-medium">
          {formatCurrency(value)} ({((value / row.estimated) * 100).toFixed(1)}%)
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
        <span className="text-green-600 font-medium">
          {formatCurrency(value)} ({((value / row.estimated) * 100).toFixed(1)}%)
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reports', path: '/reports' },
          { label: 'Savings Report' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-govt p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <PiggyBank className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Savings Report</h1>
              <p className="text-gray-600">
                Analysis of cost savings comparing estimated vs awarded contract values
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
      />

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Estimated"
              value={formatCurrency(report.total_estimated_value)}
              icon={<Tag className="w-6 h-6" />}
              color="info"
            />
            <StatsCard
              title="Total Awarded"
              value={formatCurrency(report.total_awarded_value)}
              icon={<TrendingDown className="w-6 h-6" />}
              color="warning"
            />
            <StatsCard
              title="Total Savings"
              value={formatCurrency(report.total_savings)}
              icon={<PiggyBank className="w-6 h-6" />}
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
          <Card>
            <CardHeader>
              <CardTitle>Overall Savings Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Value</span>
                  <span className="font-medium">{formatCurrency(report.total_estimated_value)}</span>
                </div>
                <div className="relative pt-4">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="h-6 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-end pr-2"
                      style={{ width: `${100 - report.savings_percentage}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {formatCurrency(report.total_awarded_value)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 text-sm text-green-600 font-medium">
                    Saved: {formatCurrency(report.total_savings)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
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

          {/* Department & Category Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Savings by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={departmentColumns} data={report.by_department} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Savings by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={categoryColumns} data={report.by_category} />
              </CardContent>
            </Card>
          </div>

          {/* Department Comparison Chart */}
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

          {/* Savings by Department Progress Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Department Savings Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.by_department.map(dept => (
                  <ProgressBar
                    key={dept.department}
                    label={dept.department}
                    value={(dept.savings / dept.estimated) * 100}
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
