import React from 'react';
import { Search, Check, Lock } from 'lucide-react';
import Input from '../ui/Input';
import type { Clause } from '../../types';

interface ClauseLibraryProps {
  clauses: Clause[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  readOnly?: boolean;
}

const CATEGORIES = ['General', 'Eligibility', 'Technical', 'Financial', 'Legal', 'Compliance', 'Payment', 'Penalty', 'Warranty', 'Termination'];

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({ clauses, selectedIds, onSelectionChange, readOnly = false }) => {
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filteredClauses = clauses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory && c.category !== activeCategory) return false;
    return true;
  });

  const toggleClause = (id: number, isMandatory: boolean) => {
    if (readOnly || isMandatory) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const categoryCount = (cat: string) => clauses.filter((c) => c.category === cat).length;

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clauses..." style={{ paddingLeft: 36 }} />
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeCategory === null ? '#1e3a5f' : '#f3f4f6',
            color: activeCategory === null ? '#fff' : '#4b5563',
          }}
        >
          All ({clauses.length})
        </button>
        {CATEGORIES.filter((cat) => categoryCount(cat) > 0).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeCategory === cat ? '#1e3a5f' : '#f3f4f6',
              color: activeCategory === cat ? '#fff' : '#4b5563',
            }}
          >
            {cat} ({categoryCount(cat)})
          </button>
        ))}
      </div>

      {/* Selected Count */}
      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Check size={18} color="#16a34a" />
        <span style={{ fontSize: 14, color: '#15803d', fontWeight: 500 }}>{selectedIds.length} clauses selected</span>
      </div>

      {/* Clauses List */}
      {filteredClauses.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No clauses found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredClauses.map((clause) => {
            const isSelected = selectedIds.includes(clause.id);
            return (
              <div
                key={clause.id}
                onClick={() => toggleClause(clause.id, clause.is_mandatory)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 16,
                  border: `2px solid ${isSelected ? '#1e3a5f' : '#e5e7eb'}`,
                  borderRadius: 8,
                  backgroundColor: isSelected ? 'rgba(30,58,95,0.03)' : '#fff',
                  cursor: clause.is_mandatory || readOnly ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `2px solid ${isSelected ? '#1e3a5f' : '#d1d5db'}`,
                    backgroundColor: isSelected ? '#1e3a5f' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {isSelected && <Check size={14} color="#fff" />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{clause.title}</span>
                    {clause.is_mandatory && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 6px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 4 }}>
                        <Lock size={10} /> Mandatory
                      </span>
                    )}
                    <span style={{ fontSize: 11, padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: 4 }}>{clause.category}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                    {clause.content.length > 200 ? clause.content.slice(0, 200) + '...' : clause.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClauseLibrary;
