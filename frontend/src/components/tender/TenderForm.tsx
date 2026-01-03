import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Calendar,
  IndianRupee,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Send
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useUIStore } from '../../store/uiStore';
import tenderService from '../../services/tenderService';
import type { Tender, TenderFormData, Category, Department } from '../../types';

const tenderSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().optional(),
  reference_number: z.string().optional(),
  category_id: z.number().optional(),
  department_id: z.number().optional(),
  tender_type: z.enum(['Open Tender', 'Limited Tender', 'Single Source', 'Two-Stage', 'Expression of Interest']),
  tender_stage: z.enum(['Single Stage', 'Two Stage', 'Three Stage']),
  estimated_value: z.number().min(0).optional(),
  currency: z.string().default('INR'),
  emd_amount: z.number().min(0).optional(),
  emd_type: z.string().optional(),
  bid_validity_days: z.number().min(1).default(90),
  publishing_date: z.string().optional(),
  document_download_start: z.string().optional(),
  document_download_end: z.string().optional(),
  submission_start: z.string().optional(),
  submission_deadline: z.string().optional(),
  technical_opening_date: z.string().optional(),
  financial_opening_date: z.string().optional()
});

type TenderFormValues = z.infer<typeof tenderSchema>;

interface TenderFormProps {
  tender?: Tender;
  mode: 'create' | 'edit';
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: FileText },
  { id: 2, title: 'Timeline', icon: Calendar },
  { id: 3, title: 'Financial', icon: IndianRupee },
  { id: 4, title: 'Review', icon: CheckCircle }
];

const TENDER_TYPES = [
  'Open Tender',
  'Limited Tender',
  'Single Source',
  'Two-Stage',
  'Expression of Interest'
] as const;

const TENDER_STAGES = ['Single Stage', 'Two Stage', 'Three Stage'] as const;

const EMD_TYPES = ['Fixed Amount', 'Percentage of Estimated Value', 'Bank Guarantee'];

const TenderForm: React.FC<TenderFormProps> = ({ tender, mode }) => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<TenderFormValues>({
    resolver: zodResolver(tenderSchema) as any,
    defaultValues: tender ? {
      title: tender.title,
      description: tender.description || '',
      reference_number: tender.reference_number || '',
      category_id: tender.category_id,
      department_id: tender.department_id,
      tender_type: tender.tender_type,
      tender_stage: tender.tender_stage,
      estimated_value: tender.estimated_value,
      currency: tender.currency || 'INR',
      emd_amount: tender.emd_amount,
      emd_type: tender.emd_type || '',
      bid_validity_days: tender.bid_validity_days || 90,
      publishing_date: tender.publishing_date?.split('T')[0] || '',
      document_download_start: tender.document_download_start?.split('T')[0] || '',
      document_download_end: tender.document_download_end?.split('T')[0] || '',
      submission_start: tender.submission_start?.split('T')[0] || '',
      submission_deadline: tender.submission_deadline?.split('T')[0] || '',
      technical_opening_date: tender.technical_opening_date?.split('T')[0] || '',
      financial_opening_date: tender.financial_opening_date?.split('T')[0] || ''
    } : {
      title: '',
      description: '',
      tender_type: 'Open Tender',
      tender_stage: 'Single Stage',
      currency: 'INR',
      bid_validity_days: 90
    }
  });

  const formValues = watch();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, depts] = await Promise.all([
          tenderService.getCategories().catch(() => []),
          tenderService.getDepartments().catch(() => [])
        ]);
        setCategories(cats);
        setDepartments(depts);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: TenderFormValues, publish: boolean = false) => {
    setIsSubmitting(true);
    try {
      let savedTender: Tender;

      const formData: TenderFormData = {
        ...data,
        estimated_value: data.estimated_value || undefined,
        emd_amount: data.emd_amount || undefined,
        category_id: data.category_id || undefined,
        department_id: data.department_id || undefined
      };

      if (mode === 'create') {
        savedTender = await tenderService.createTender(formData);
        addToast({
          type: 'success',
          title: 'Created',
          message: 'Tender created successfully'
        });
      } else {
        savedTender = await tenderService.updateTender(tender!.id, formData);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Tender updated successfully'
        });
      }

      if (publish) {
        await tenderService.publishTender(savedTender.id);
        addToast({
          type: 'success',
          title: 'Published',
          message: 'Tender published successfully'
        });
      }

      navigate(`/tenders/${savedTender.id}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save tender'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <Input
        label="Tender Title *"
        placeholder="Enter tender title"
        error={errors.title?.message}
        {...register('title')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
          placeholder="Enter detailed description..."
          {...register('description')}
        />
      </div>

      <Input
        label="Reference Number"
        placeholder="e.g., RFP/2024/001"
        {...register('reference_number')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tender Type *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            {...register('tender_type')}
          >
            {TENDER_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tender Stage *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            {...register('tender_stage')}
          >
            {TENDER_STAGES.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            {...register('category_id', { valueAsNumber: true })}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            {...register('department_id', { valueAsNumber: true })}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Publishing Date"
          type="date"
          {...register('publishing_date')}
        />

        <Input
          label="Document Download Start"
          type="date"
          {...register('document_download_start')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Document Download End"
          type="date"
          {...register('document_download_end')}
        />

        <Input
          label="Submission Start Date"
          type="date"
          {...register('submission_start')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Submission Deadline *"
          type="date"
          error={errors.submission_deadline?.message}
          {...register('submission_deadline')}
        />

        <Input
          label="Bid Validity (Days)"
          type="number"
          min="1"
          {...register('bid_validity_days', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Technical Opening Date"
          type="date"
          {...register('technical_opening_date')}
        />

        <Input
          label="Financial Opening Date"
          type="date"
          {...register('financial_opening_date')}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Estimated Value"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter estimated value"
          {...register('estimated_value', { valueAsNumber: true })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            {...register('currency')}
          >
            <option value="INR">INR - Indian Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="EMD Amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter EMD amount"
          {...register('emd_amount', { valueAsNumber: true })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EMD Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            {...register('emd_type')}
          >
            <option value="">Select EMD Type</option>
            {EMD_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Title</dt>
            <dd className="font-medium">{formValues.title || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Type</dt>
            <dd className="font-medium">{formValues.tender_type}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Stage</dt>
            <dd className="font-medium">{formValues.tender_stage}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Reference</dt>
            <dd className="font-medium">{formValues.reference_number || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Publishing Date</dt>
            <dd className="font-medium">{formValues.publishing_date || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Submission Deadline</dt>
            <dd className="font-medium">{formValues.submission_deadline || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Technical Opening</dt>
            <dd className="font-medium">{formValues.technical_opening_date || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Financial Opening</dt>
            <dd className="font-medium">{formValues.financial_opening_date || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Financial Details</h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Estimated Value</dt>
            <dd className="font-medium">
              {formValues.estimated_value
                ? `${formValues.currency} ${formValues.estimated_value.toLocaleString()}`
                : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">EMD Amount</dt>
            <dd className="font-medium">
              {formValues.emd_amount
                ? `${formValues.currency} ${formValues.emd_amount.toLocaleString()}`
                : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">EMD Type</dt>
            <dd className="font-medium">{formValues.emd_type || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Bid Validity</dt>
            <dd className="font-medium">{formValues.bid_validity_days} days</dd>
          </div>
        </dl>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center ${
                  currentStep === step.id
                    ? 'text-primary'
                    : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                }`}
              >
                <span className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step.id
                    ? 'border-primary bg-primary text-white'
                    : currentStep > step.id
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </span>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {currentStep === STEPS.length ? (
                  <>
                    <Button
                      type="submit"
                      variant="outline"
                      loading={isSubmitting}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      loading={isSubmitting}
                      onClick={handleSubmit((data) => onSubmit(data, true))}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Save & Publish
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenderForm;
