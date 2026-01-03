import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  CheckCircle,
  ArrowLeft,
  Wand2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import RFPBuilder from '../../components/rfp/RFPBuilder';
import ClauseLibrary from '../../components/rfp/ClauseLibrary';
import RFPPreview from '../../components/rfp/RFPPreview';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import rfpService from '../../services/rfpService';
import tenderService from '../../services/tenderService';
import { colors, shadows } from '../../styles/constants';
import type { RFPSection, Clause, Tender } from '../../types';

type Step = 'sections' | 'clauses' | 'preview';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'sections', label: 'Build Sections', icon: <FileText className="w-5 h-5" /> },
  { id: 'clauses', label: 'Select Clauses', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'preview', label: 'Preview & Export', icon: <Eye className="w-5 h-5" /> }
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
        // Load sections (use defaults)
        setSections(rfpService.getDefaultSections());

        // Load clauses
        const clausesData = await rfpService.getClauses();
        setClauses(clausesData);

        // Auto-select mandatory clauses
        const mandatoryIds = clausesData.filter(c => c.is_mandatory).map(c => c.id);
        setSelectedClauseIds(mandatoryIds);

        // Load tender if specified
        if (tenderId) {
          const tenderData = await tenderService.getTender(parseInt(tenderId));
          setTender(tenderData);

          // Pre-fill sections with tender data
          setSections(prev => prev.map(section => {
            if (section.id === 'introduction') {
              return {
                ...section,
                content: `This Request for Proposal (RFP) is issued for "${tenderData.title}". The purpose of this RFP is to invite qualified bidders to submit proposals for the requirements outlined herein.`,
                subsections: section.subsections?.map(sub => {
                  if (sub.id === 'intro-background') {
                    return { ...sub, content: tenderData.description || '' };
                  }
                  return sub;
                })
              };
            }
            if (section.id === 'submission' && tenderData.submission_deadline) {
              const deadline = tenderData.submission_deadline;
              return {
                ...section,
                subsections: section.subsections?.map(sub => {
                  if (sub.id === 'sub-deadline') {
                    return {
                      ...sub,
                      content: `Proposals must be submitted by ${new Date(deadline).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`
                    };
                  }
                  return sub;
                })
              };
            }
            return section;
          }));
        }
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to load data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenderId, addToast]);

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!tender) {
      addToast({
        type: 'info',
        title: 'Export',
        message: 'Export functionality requires a tender to be selected'
      });
      return;
    }

    try {
      addToast({
        type: 'info',
        title: 'Exporting',
        message: `Generating ${format.toUpperCase()} document...`
      });

      // In a real implementation, this would call the backend
      // const blob = await rfpService.exportRFP(tender.id, format);
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `RFP_${tender.tender_id}.${format}`;
      // a.click();

      addToast({
        type: 'success',
        title: 'Success',
        message: `RFP exported as ${format.toUpperCase()}`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to export RFP'
      });
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the backend
      addToast({
        type: 'success',
        title: 'Saved',
        message: 'RFP template saved successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to save template'
      });
    } finally {
      setSaving(false);
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const goPrev = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  if (loading) {
    return <Loading text="Loading RFP Generator..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'RFP Generator' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: shadows.govt }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryAlpha10 }}>
                <Wand2 className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RFP Generator</h1>
                <p className="text-gray-600">
                  {tender
                    ? `Creating RFP for: ${tender.title}`
                    : 'Build professional Request for Proposal documents'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tender && (
              <Link to={`/tenders/${tender.id}`}>
                <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Tender
                </Button>
              </Link>
            )}
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleSaveTemplate}
                loading={saving}
                icon={<Save className="w-4 h-4" />}
              >
                Save Template
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(step.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: currentStep === step.id
                      ? colors.primary
                      : index < currentStepIndex
                        ? '#dcfce7'
                        : '#f3f4f6',
                    color: currentStep === step.id
                      ? 'white'
                      : index < currentStepIndex
                        ? '#15803d'
                        : '#4b5563'
                  }}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                  <span className="font-medium">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-4 rounded"
                    style={{
                      backgroundColor: index < currentStepIndex ? '#86efac' : '#e5e7eb'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 'sections' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Build RFP Sections
                </h2>
                <p className="text-gray-600">
                  Customize the sections and content of your RFP document. Mandatory sections cannot be removed.
                </p>
              </div>
              <RFPBuilder
                sections={sections}
                onSectionsChange={setSections}
                readOnly={!canEdit}
              />
            </div>
          )}

          {currentStep === 'clauses' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Standard Clauses
                </h2>
                <p className="text-gray-600">
                  Choose the standard clauses to include in your RFP. Mandatory clauses are automatically included.
                </p>
              </div>
              <ClauseLibrary
                clauses={clauses}
                selectedIds={selectedClauseIds}
                onSelectionChange={setSelectedClauseIds}
                readOnly={!canEdit}
              />
            </div>
          )}

          {currentStep === 'preview' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Preview & Export
                </h2>
                <p className="text-gray-600">
                  Review your RFP document and export it in your preferred format.
                </p>
              </div>
              <RFPPreview
                tender={tender}
                sections={sections}
                clauses={clauses}
                selectedClauseIds={selectedClauseIds}
                onExport={handleExport}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          Step {currentStepIndex + 1} of {STEPS.length}
        </div>

        {currentStepIndex < STEPS.length - 1 ? (
          <Button
            onClick={goNext}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={() => handleExport('pdf')}
            icon={<Download className="w-4 h-4" />}
          >
            Export RFP
          </Button>
        )}
      </div>
    </div>
  );
};

export default RFPGenerator;
