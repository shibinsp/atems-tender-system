import React from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';
import Button from '../ui/Button';
import type { RFPSection } from '../../types';

interface RFPBuilderProps {
  sections: RFPSection[];
  onSectionsChange: (sections: RFPSection[]) => void;
  readOnly?: boolean;
}

const RFPBuilder: React.FC<RFPBuilderProps> = ({ sections, onSectionsChange, readOnly = false }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(sections.map((s) => s.id)));

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    onSectionsChange(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    onSectionsChange([
      ...sections,
      { id: newId, title: 'New Section', order: sections.length + 1, content: '', is_mandatory: false },
    ]);
    setExpanded((prev) => new Set(prev).add(newId));
  };

  const removeSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                backgroundColor: '#f9fafb',
                borderBottom: expanded.has(section.id) ? '1px solid #e5e7eb' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => toggleExpand(section.id)}
            >
              <GripVertical size={16} style={{ color: '#9ca3af' }} />
              {expanded.has(section.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <span style={{ fontSize: 13, color: '#6b7280', minWidth: 24 }}>{index + 1}.</span>
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  e.stopPropagation();
                  updateSection(section.id, 'title', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={readOnly}
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#111827',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
              {section.is_mandatory && (
                <span style={{ fontSize: 11, padding: '2px 8px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 4 }}>
                  Required
                </span>
              )}
              {!readOnly && !section.is_mandatory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(section.id);
                  }}
                  style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Section Content */}
            {expanded.has(section.id) && (
              <div style={{ padding: 16 }}>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  disabled={readOnly}
                  placeholder="Enter section content..."
                  style={{
                    width: '100%',
                    minHeight: 120,
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>Subsections</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16, borderLeft: '2px solid #e5e7eb' }}>
                      {section.subsections.map((sub, subIndex) => (
                        <div key={sub.id}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                            {index + 1}.{subIndex + 1} {sub.title}
                          </p>
                          <textarea
                            value={sub.content}
                            onChange={(e) => {
                              onSectionsChange(
                                sections.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        subsections: s.subsections?.map((ss) =>
                                          ss.id === sub.id ? { ...ss, content: e.target.value } : ss
                                        ),
                                      }
                                    : s
                                )
                              );
                            }}
                            disabled={readOnly}
                            placeholder="Enter subsection content..."
                            style={{
                              width: '100%',
                              minHeight: 80,
                              padding: 10,
                              border: '1px solid #e5e7eb',
                              borderRadius: 6,
                              fontSize: 13,
                              lineHeight: 1.5,
                              resize: 'vertical',
                              fontFamily: 'inherit',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div style={{ marginTop: 16 }}>
          <Button variant="outline" onClick={addSection} icon={<Plus size={16} />}>
            Add Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default RFPBuilder;
