import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { RFPSection, RFPSubsection } from '../../types';

interface RFPBuilderProps {
  sections: RFPSection[];
  onSectionsChange: (sections: RFPSection[]) => void;
  readOnly?: boolean;
}

const RFPBuilder: React.FC<RFPBuilderProps> = ({
  sections,
  onSectionsChange,
  readOnly = false
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  const [editingSubsection, setEditingSubsection] = React.useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId ? { ...s, content } : s
      )
    );
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId ? { ...s, title } : s
      )
    );
    setEditingSection(null);
  };

  const updateSubsectionContent = (sectionId: string, subsectionId: string, content: string) => {
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              subsections: s.subsections?.map(sub =>
                sub.id === subsectionId ? { ...sub, content } : sub
              )
            }
          : s
      )
    );
  };

  const updateSubsectionTitle = (sectionId: string, subsectionId: string, title: string) => {
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              subsections: s.subsections?.map(sub =>
                sub.id === subsectionId ? { ...sub, title } : sub
              )
            }
          : s
      )
    );
    setEditingSubsection(null);
  };

  const addSection = () => {
    const newSection: RFPSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      order: sections.length + 1,
      content: '',
      is_mandatory: false,
      subsections: []
    };
    onSectionsChange([...sections, newSection]);
    setExpandedSections(prev => new Set([...prev, newSection.id]));
    setEditingSection(newSection.id);
  };

  const removeSection = (sectionId: string) => {
    if (!confirm('Are you sure you want to remove this section?')) return;
    onSectionsChange(sections.filter(s => s.id !== sectionId));
  };

  const addSubsection = (sectionId: string) => {
    onSectionsChange(
      sections.map(s => {
        if (s.id !== sectionId) return s;
        const newSubsection: RFPSubsection = {
          id: `subsection-${Date.now()}`,
          title: 'New Subsection',
          order: (s.subsections?.length || 0) + 1,
          content: ''
        };
        return {
          ...s,
          subsections: [...(s.subsections || []), newSubsection]
        };
      })
    );
  };

  const removeSubsection = (sectionId: string, subsectionId: string) => {
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              subsections: s.subsections?.filter(sub => sub.id !== subsectionId)
            }
          : s
      )
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    newSections.forEach((s, i) => (s.order = i + 1));
    onSectionsChange(newSections);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={`border rounded-lg ${
            section.is_mandatory ? 'border-primary bg-primary/5' : 'border-gray-200'
          }`}
        >
          {/* Section Header */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg border-b">
            {!readOnly && (
              <div className="flex flex-col">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3 rotate-180" />
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={() => toggleSection(section.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {expandedSections.has(section.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            <div className="flex-1 flex items-center gap-2">
              {editingSection === section.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    defaultValue={section.title}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateSectionTitle(section.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setEditingSection(null);
                      }
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input) updateSectionTitle(section.id, input.value);
                    }}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-500">
                    {section.order}.
                  </span>
                  <span className="font-semibold text-gray-900">{section.title}</span>
                  {section.is_mandatory && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Mandatory
                    </span>
                  )}
                </>
              )}
            </div>

            {!readOnly && editingSection !== section.id && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingSection(section.id)}
                  className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"
                  title="Edit title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {!section.is_mandatory && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Remove section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section Content */}
          {expandedSections.has(section.id) && (
            <div className="p-4 space-y-4">
              {/* Main content textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Content
                </label>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSectionContent(section.id, e.target.value)}
                  placeholder="Enter section content..."
                  rows={4}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50"
                />
              </div>

              {/* Subsections */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  {section.subsections.map((subsection) => (
                    <div key={subsection.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {editingSubsection === subsection.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              defaultValue={subsection.title}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateSubsectionTitle(section.id, subsection.id, e.currentTarget.value);
                                } else if (e.key === 'Escape') {
                                  setEditingSubsection(null);
                                }
                              }}
                              autoFocus
                              className="h-7 text-sm"
                            />
                            <button
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector('input');
                                if (input) updateSubsectionTitle(section.id, subsection.id, input.value);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingSubsection(null)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-600">
                              {section.order}.{subsection.order} {subsection.title}
                            </span>
                            {!readOnly && (
                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={() => setEditingSubsection(subsection.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeSubsection(section.id, subsection.id)}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <textarea
                        value={subsection.content}
                        onChange={(e) => updateSubsectionContent(section.id, subsection.id, e.target.value)}
                        placeholder={`Enter content for ${subsection.title}...`}
                        rows={3}
                        disabled={readOnly}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Add subsection button */}
              {!readOnly && (
                <button
                  onClick={() => addSubsection(section.id)}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
                >
                  <Plus className="w-4 h-4" />
                  Add Subsection
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add section button */}
      {!readOnly && (
        <Button
          variant="outline"
          onClick={addSection}
          icon={<Plus className="w-4 h-4" />}
          className="w-full"
        >
          Add New Section
        </Button>
      )}
    </div>
  );
};

export default RFPBuilder;
