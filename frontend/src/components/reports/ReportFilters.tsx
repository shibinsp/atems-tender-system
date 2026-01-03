import React from 'react';
import { Filter, X, Calendar, Download, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { ReportFilters as ReportFiltersType } from '../../types';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  onApply: () => void;
  onReset: () => void;
  onExport?: (format: 'pdf' | 'excel') => void;
  loading?: boolean;
  showDepartment?: boolean;
  showCategory?: boolean;
  showStatus?: boolean;
  showTenderType?: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  onExport,
  loading = false,
  showDepartment = true,
  showCategory = true,
  showStatus = false,
  showTenderType = false
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleChange = (key: keyof ReportFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  // Quick date presets
  const setDatePreset = (preset: string) => {
    const now = new Date();
    let from: Date;

    switch (preset) {
      case 'today':
        from = new Date(now);
        break;
      case 'week':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        break;
      case 'month':
        from = new Date(now);
        from.setMonth(from.getMonth() - 1);
        break;
      case 'quarter':
        from = new Date(now);
        from.setMonth(from.getMonth() - 3);
        break;
      case 'year':
        from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        return;
    }

    onFiltersChange({
      ...filters,
      date_from: from.toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-govt p-4 mb-6">
      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isExpanded || hasActiveFilters
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-primary text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length}
              </span>
            )}
          </button>

          {/* Quick Date Presets */}
          <div className="hidden sm:flex items-center gap-1 border-l pl-2 ml-2">
            {['week', 'month', 'quarter', 'year'].map(preset => (
              <button
                key={preset}
                onClick={() => setDatePreset(preset)}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded capitalize"
              >
                {preset === 'week' ? 'Last 7 days' : `Last ${preset}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onApply}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          {onExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
                icon={<Download className="w-4 h-4" />}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('excel')}
                icon={<Download className="w-4 h-4" />}
              >
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                From Date
              </label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleChange('date_from', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                To Date
              </label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleChange('date_to', e.target.value)}
              />
            </div>

            {/* Department */}
            {showDepartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={filters.department_id || ''}
                  onChange={(e) => handleChange('department_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Departments</option>
                  <option value="1">IT Department</option>
                  <option value="2">Public Works</option>
                  <option value="3">Health Services</option>
                  <option value="4">Education</option>
                  <option value="5">Transport</option>
                </select>
              </div>
            )}

            {/* Category */}
            {showCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) => handleChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Categories</option>
                  <option value="1">Construction</option>
                  <option value="2">IT Services</option>
                  <option value="3">Medical Supplies</option>
                  <option value="4">Furniture</option>
                  <option value="5">Vehicles</option>
                </select>
              </div>
            )}

            {/* Status */}
            {showStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Under Evaluation">Under Evaluation</option>
                  <option value="Evaluated">Evaluated</option>
                  <option value="Awarded">Awarded</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {/* Tender Type */}
            {showTenderType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tender Type
                </label>
                <select
                  value={filters.tender_type || ''}
                  onChange={(e) => handleChange('tender_type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Types</option>
                  <option value="Open">Open</option>
                  <option value="Limited">Limited</option>
                  <option value="Single Source">Single Source</option>
                  <option value="Two Stage">Two Stage</option>
                </select>
              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-end gap-2 mt-4">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                icon={<X className="w-4 h-4" />}
              >
                Clear Filters
              </Button>
            )}
            <Button size="sm" onClick={onApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
