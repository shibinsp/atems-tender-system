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

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    backgroundColor: 'white'
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: 16,
      marginBottom: 24
    }}>
      {/* Quick Actions Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isExpanded || hasActiveFilters ? '#1e3a5f' : '#f3f4f6',
              color: isExpanded || hasActiveFilters ? 'white' : '#374151',
              transition: 'all 0.15s'
            }}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span style={{
                backgroundColor: 'white',
                color: '#1e3a5f',
                fontSize: 12,
                padding: '2px 6px',
                borderRadius: 9999
              }}>
                {Object.values(filters).filter(v => v !== undefined && v !== '').length}
              </span>
            )}
          </button>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderLeft: '1px solid #e5e7eb', paddingLeft: 8, marginLeft: 8 }}>
            {['week', 'month', 'quarter', 'year'].map(preset => (
              <button
                key={preset}
                onClick={() => setDatePreset(preset)}
                style={{
                  padding: '4px 8px',
                  fontSize: 12,
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {preset === 'week' ? 'Last 7 days' : `Last ${preset}`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onApply}
            loading={loading}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          {onExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
                icon={<Download size={16} />}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('excel')}
                icon={<Download size={16} />}
              >
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {/* Date Range */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                <Calendar size={16} />
                From Date
              </label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleChange('date_from', e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                <Calendar size={16} />
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
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Department
                </label>
                <select
                  value={filters.department_id || ''}
                  onChange={(e) => handleChange('department_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  style={selectStyle}
                >
                  <option value="">All Departments</option>
                  <option value="1">Ministry of Electronics & IT</option>
                  <option value="2">Ministry of Health</option>
                  <option value="3">Ministry of Road Transport</option>
                  <option value="4">Ministry of Defence</option>
                  <option value="5">Ministry of Finance</option>
                  <option value="6">Ministry of Education</option>
                  <option value="7">Public Works Department</option>
                  <option value="8">Municipal Corporation</option>
                </select>
              </div>
            )}

            {/* Category */}
            {showCategory && (
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) => handleChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  style={selectStyle}
                >
                  <option value="">All Categories</option>
                  <option value="1">IT Hardware & Equipment</option>
                  <option value="2">Software Development</option>
                  <option value="3">Civil Construction</option>
                  <option value="4">Medical Equipment</option>
                  <option value="5">Office Supplies</option>
                  <option value="6">Vehicles & Transport</option>
                  <option value="7">Electrical Works</option>
                  <option value="8">Consulting Services</option>
                </select>
              </div>
            )}

            {/* Status */}
            {showStatus && (
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleChange('status', e.target.value || undefined)}
                  style={selectStyle}
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
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Tender Type
                </label>
                <select
                  value={filters.tender_type || ''}
                  onChange={(e) => handleChange('tender_type', e.target.value || undefined)}
                  style={selectStyle}
                >
                  <option value="">All Types</option>
                  <option value="Open Tender">Open Tender</option>
                  <option value="Limited Tender">Limited Tender</option>
                  <option value="Single Source">Single Source</option>
                  <option value="Two-Stage">Two Stage</option>
                </select>
              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                icon={<X size={16} />}
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
