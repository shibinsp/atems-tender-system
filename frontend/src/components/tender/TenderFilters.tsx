import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import Input from '../ui/Input';
import type { Category, Department } from '../../types';

interface TenderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  categories: Category[];
  departments: Department[];
  onClear: () => void;
}

const TENDER_STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Under Evaluation', label: 'Under Evaluation' },
  { value: 'Evaluated', label: 'Evaluated' },
  { value: 'Awarded', label: 'Awarded' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Closed', label: 'Closed' }
];

const TenderFilters: React.FC<TenderFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  departmentId,
  onDepartmentChange,
  categories,
  departments,
  onClear
}) => {
  const hasFilters = search || status || categoryId || departmentId;

  return (
    <div className="bg-white rounded-lg shadow-govt p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-700">Filters</span>
        {hasFilters && (
          <button
            onClick={onClear}
            className="ml-auto text-sm text-primary hover:text-primary-dark flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search tenders..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            {TENDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={departmentId}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TenderFilters;
