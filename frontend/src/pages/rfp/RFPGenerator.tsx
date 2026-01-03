import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileText, BookOpen, Eye, ChevronLeft, ChevronRight, Save, Download, CheckCircle, ArrowLeft, Wand2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import RFPBuilder from '../../components/rfp/RFPBuilder';
import ClauseLibrary from '../../components/rfp/ClauseLibrary';
import RFPPreview from '../../components/rfp/RFPPreview';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import rfpService from '../../services/rfpService';
import tenderService from '../../services/tenderService';
import type { RFPSection, Clause, Tender } from '../../types';

type Step = 'sections' | 'clauses' | 'preview';

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'sections', label: 'Build Sections', icon: FileText },
  { id: 'clauses', label: 'Select Clauses', icon: BookOpen },
  { id: 'preview', label: 'Preview & Export', icon: Eye },
];

const RFPGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tenderId = searchParams.get('tender_id');
  const { addToast } = useUIStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = React.useState<Step>('sections');
  const [tender, setTender] = React.useState<Tender | null>(null);
  const [sections, setSections] = React.useState<RFPSection[]>([]);
  const [clauses, setClauses] = React.useState<Clause[]>([]);
  const [selectedClauseIds, setSelectedClauseIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const canEdit = user?.role === 'Admin' || user?.role === 'Tender Officer';

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setSections(rfpService.getDefaultSections());
        const clausesData = await rfpService.getClauses();
        setClauses(clausesData);
        setSelectedClauseIds(clausesData.filter((c) => c.is_mandatory).map((c) => c.id));

        if (tenderId) {
          const tenderData = await tenderService.getTender(parseInt(tenderId));
          setTender(tenderData);
          setSections((prev) =>
            prev.map((section) => {
              if (section.id === 'introduction') {
                return {
                  ...section,
                  content: `This RFP is issued for "${tenderData.title}".`,
                  subsections: section.subsections?.map((sub) =>
                    sub.id === 'intro-background' ? { ...sub, content: tenderData.description || '' } : sub
                  ),
                };
              }
              return section;
            })
          );
        }
      } catch (e) {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenderId, addToast]);

  const handleExport = async (format: 'pdf' | 'docx') => {
    addToast({ type: 'success', title: 'Export', message: `RFP exported as ${format.toUpperCase()}` });
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    setTimeout(() => {
      addToast({ type: 'success', title: 'Saved', message: 'Template saved' });
      setSaving(false);
    }, 500);
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const goNext = () => currentStepIndex < STEPS.length - 1 && setCurrentStep(STEPS[currentStepIndex + 1].id);
  const goPrev = () => currentStepIndex > 0 && setCurrentStep(STEPS[currentStepIndex - 1].id);

  if (loading) return <Loading text="Loading RFP Generator..." />;

  return (
    <div>
      <PageHeader
        title="RFP Generator"
        subtitle={tender ? `Creating RFP for: ${tender.title}` : 'Build professional RFP documents'}
        icon={<Wand2 size={24} color="#1e3a5f" />}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {tender && (
              <Link to={`/tenders/${tender.id}`}>
                <Button variant="outline" icon={<ArrowLeft size={16} />}>Back to Tender</Button>
              </Link>
            )}
            {canEdit && (
              <Button variant="outline" onClick={handleSaveTemplate} loading={saving} icon={<Save size={16} />}>
                Save Template
              </Button>
            )}
          </div>
        }
      />

      {/* Step Indicator */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = index < currentStepIndex;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#1e3a5f' : isCompleted ? '#dcfce7' : '#f3f4f6',
                      color: isActive ? '#fff' : isCompleted ? '#15803d' : '#4b5563',
                      fontWeight: 500,
                      fontSize: 14,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                    <span className="step-label">{step.label}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 3,
                        margin: '0 12px',
                        borderRadius: 2,
                        backgroundColor: isCompleted ? '#86efac' : '#e5e7eb',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent style={{ padding: 24 }}>
          {currentStep === 'sections' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Build RFP Sections</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
                Customize the sections and content of your RFP document.
              </p>
              <RFPBuilder sections={sections} onSectionsChange={setSections} readOnly={!canEdit} />
            </div>
          )}

          {currentStep === 'clauses' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Select Standard Clauses</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
                Choose the standard clauses to include. Mandatory clauses are pre-selected.
              </p>
              <ClauseLibrary clauses={clauses} selectedIds={selectedClauseIds} onSelectionChange={setSelectedClauseIds} readOnly={!canEdit} />
            </div>
          )}

          {currentStep === 'preview' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Preview & Export</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
                Review your RFP document and export it.
              </p>
              <RFPPreview tender={tender} sections={sections} clauses={clauses} selectedClauseIds={selectedClauseIds} onExport={handleExport} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="outline" onClick={goPrev} disabled={currentStepIndex === 0} icon={<ChevronLeft size={16} />}>
          Previous
        </Button>
        <span style={{ fontSize: 14, color: '#6b7280' }}>Step {currentStepIndex + 1} of {STEPS.length}</span>
        {currentStepIndex < STEPS.length - 1 ? (
          <Button onClick={goNext} icon={<ChevronRight size={16} />} iconPosition="right">
            Next
          </Button>
        ) : (
          <Button onClick={() => handleExport('pdf')} icon={<Download size={16} />}>
            Export RFP
          </Button>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .step-label { display: none; }
        }
      `}</style>
    </div>
  );
};

export default RFPGenerator;
