import React from 'react';
import {
  Search,
  CheckSquare,
  Square,
  BookOpen,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Input from '../ui/Input';
import type { Clause, ClauseCategory } from '../../types';

interface ClauseLibraryProps {
  clauses: Clause[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  readOnly?: boolean;
}

const CLAUSE_CATEGORIES: ClauseCategory[] = [
  'General',
  'Eligibility',
  'Technical',
  'Financial',
  'Legal',
  'Compliance',
  'Payment',
  'Penalty',
  'Warranty',
  'Termination'
];

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    General: 'bg-gray-100 text-gray-700',
    Eligibility: 'bg-blue-100 text-blue-700',
    Technical: 'bg-purple-100 text-purple-700',
    Financial: 'bg-green-100 text-green-700',
    Legal: 'bg-red-100 text-red-700',
    Compliance: 'bg-yellow-100 text-yellow-700',
    Payment: 'bg-emerald-100 text-emerald-700',
    Penalty: 'bg-orange-100 text-orange-700',
    Warranty: 'bg-cyan-100 text-cyan-700',
    Termination: 'bg-rose-100 text-rose-700'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({
  clauses,
  selectedIds,
  onSelectionChange,
  readOnly = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<ClauseCategory | 'All'>('All');
  const [expandedClauses, setExpandedClauses] = React.useState<Set<number>>(new Set());
  const [showMandatoryOnly, setShowMandatoryOnly] = React.useState(false);

  const filteredClauses = React.useMemo(() => {
    return clauses.filter(clause => {
      if (!clause.is_active) return false;
      if (selectedCategory !== 'All' && clause.category !== selectedCategory) return false;
      if (showMandatoryOnly && !clause.is_mandatory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          clause.title.toLowerCase().includes(query) ||
          clause.content.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [clauses, searchQuery, selectedCategory, showMandatoryOnly]);

  const groupedClauses = React.useMemo(() => {
    const groups: Record<string, Clause[]> = {};
    filteredClauses.forEach(clause => {
      if (!groups[clause.category]) {
        groups[clause.category] = [];
      }
      groups[clause.category].push(clause);
    });
    return groups;
  }, [filteredClauses]);

  const toggleClause = (clauseId: number) => {
    if (readOnly) return;

    const clause = clauses.find(c => c.id === clauseId);
    if (clause?.is_mandatory) return; // Can't deselect mandatory clauses

    if (selectedIds.includes(clauseId)) {
      onSelectionChange(selectedIds.filter(id => id !== clauseId));
    } else {
      onSelectionChange([...selectedIds, clauseId]);
    }
  };

  const toggleExpand = (clauseId: number) => {
    setExpandedClauses(prev => {
      const next = new Set(prev);
      if (next.has(clauseId)) {
        next.delete(clauseId);
      } else {
        next.add(clauseId);
      }
      return next;
    });
  };

  const selectAllInCategory = (category: string) => {
    const categoryClauseIds = clauses
      .filter(c => c.category === category && c.is_active)
      .map(c => c.id);

    const allSelected = categoryClauseIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      // Deselect non-mandatory clauses
      const mandatoryIds = clauses
        .filter(c => c.category === category && c.is_mandatory)
        .map(c => c.id);
      onSelectionChange([
        ...selectedIds.filter(id => !categoryClauseIds.includes(id)),
        ...mandatoryIds
      ]);
    } else {
      // Select all
      onSelectionChange([...new Set([...selectedIds, ...categoryClauseIds])]);
    }
  };

  const mandatoryCount = clauses.filter(c => c.is_mandatory && c.is_active).length;
  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Clause Library</h3>
        </div>
        <div className="text-sm text-gray-500">
          {selectedCount} selected ({mandatoryCount} mandatory)
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses..."
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ClauseCategory | 'All')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="All">All Categories</option>
          {CLAUSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
          <input
            type="checkbox"
            checked={showMandatoryOnly}
            onChange={(e) => setShowMandatoryOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Mandatory only
        </label>
      </div>

      {/* Clause List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {Object.entries(groupedClauses).map(([category, categoryClauses]) => (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(category)}`}>
                  {category}
                </span>
                <span className="text-sm text-gray-500">
                  ({categoryClauses.length} clauses)
                </span>
              </div>
              {!readOnly && (
                <button
                  onClick={() => selectAllInCategory(category)}
                  className="text-xs text-primary hover:underline"
                >
                  {categoryClauses.every(c => selectedIds.includes(c.id))
                    ? 'Deselect all'
                    : 'Select all'}
                </button>
              )}
            </div>

            {/* Clauses */}
            <div className="divide-y divide-gray-100">
              {categoryClauses.map(clause => {
                const isSelected = selectedIds.includes(clause.id);
                const isExpanded = expandedClauses.has(clause.id);

                return (
                  <div
                    key={clause.id}
                    className={`${isSelected ? 'bg-primary/5' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-3 p-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleClause(clause.id)}
                        disabled={readOnly || clause.is_mandatory}
                        className={`mt-0.5 flex-shrink-0 ${
                          clause.is_mandatory
                            ? 'text-primary cursor-not-allowed'
                            : isSelected
                            ? 'text-primary'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {isSelected || clause.is_mandatory ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(clause.id)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            {clause.title}
                          </button>
                          {clause.is_mandatory && (
                            <span className="flex items-center text-xs text-amber-600">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Mandatory
                            </span>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                            {clause.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredClauses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No clauses found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClauseLibrary;
