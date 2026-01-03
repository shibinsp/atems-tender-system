import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Upload,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  File,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useUIStore } from '../../store/uiStore';
import bidService from '../../services/bidService';
import tenderService from '../../services/tenderService';
import { colors } from '../../styles/constants';
import type { Tender, Bid, BidDocument, DocumentCategory } from '../../types';
import { formatCurrency, formatDate, formatFileSize } from '../../utils/formatters';

const STEPS = [
  { id: 1, title: 'Tender Info', icon: FileText },
  { id: 2, title: 'Documents', icon: Upload },
  { id: 3, title: 'Financial', icon: IndianRupee },
  { id: 4, title: 'Review', icon: CheckCircle }
];

// Inline select component with focus styles
const CategorySelect: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({ value, onChange, children }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="px-3 py-2 border border-gray-300 rounded-md"
      style={isFocused ? {
        outline: 'none',
        boxShadow: `0 0 0 2px ${colors.primary}`,
        borderColor: colors.primary,
      } : {}}
    >
      {children}
    </select>
  );
};

const financialSchema = z.object({
  financial_amount: z.number().min(0, 'Amount must be positive').optional()
});

type FinancialFormData = z.infer<typeof financialSchema>;

const BidSubmission: React.FC = () => {
  const { id: tenderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [tender, setTender] = React.useState<Tender | null>(null);
  const [bid, setBid] = React.useState<Bid | null>(null);
  const [documents, setDocuments] = React.useState<BidDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = React.useState<DocumentCategory>('Technical');
  const [uploadType, setUploadType] = React.useState('Proposal Document');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FinancialFormData>({
    resolver: zodResolver(financialSchema) as any,
    defaultValues: {
      financial_amount: bid?.financial_amount || undefined
    }
  });

  const financialAmount = watch('financial_amount');

  React.useEffect(() => {
    const fetchData = async () => {
      if (!tenderId) return;

      try {
        // Fetch tender
        const tenderData = await tenderService.getTender(parseInt(tenderId));
        setTender(tenderData);

        // Check if tender is accepting bids
        if (tenderData.status !== 'Published') {
          addToast({
            type: 'error',
            title: 'Error',
            message: 'This tender is not accepting bids'
          });
          navigate('/tenders');
          return;
        }

        // Try to get existing bid or create new one
        try {
          const bidsData = await bidService.getMyBids();
          const existingBid = bidsData.find(b => b.tender_id === parseInt(tenderId));

          if (existingBid) {
            setBid(existingBid);
            const docs = await bidService.getBidDocuments(existingBid.id);
            setDocuments(docs);
          } else {
            // Create new bid
            const newBid = await bidService.createBid(parseInt(tenderId));
            setBid(newBid);
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            // No bidder profile
            addToast({
              type: 'error',
              title: 'Profile Required',
              message: 'Please create a bidder profile first'
            });
            navigate('/bids/profile');
            return;
          }
          throw error;
        }
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.detail || 'Failed to load tender'
        });
        navigate('/tenders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenderId, navigate, addToast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bid) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Only PDF files are allowed'
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'File size must not exceed 25MB'
      });
      return;
    }

    setUploading(true);
    try {
      const doc = await bidService.uploadBidDocument(
        bid.id,
        uploadType,
        uploadCategory,
        file
      );
      setDocuments([...documents, doc]);
      addToast({
        type: 'success',
        title: 'Uploaded',
        message: 'Document uploaded successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: error.response?.data?.detail || 'Failed to upload document'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveFinancial = async (data: FinancialFormData) => {
    if (!bid) return;
    try {
      const updated = await bidService.updateBid(bid.id, {
        financial_amount: data.financial_amount
      });
      setBid(updated);
      addToast({
        type: 'success',
        title: 'Saved',
        message: 'Financial details saved'
      });
      setCurrentStep(4);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save'
      });
    }
  };

  const handleFinalSubmit = async () => {
    if (!bid) return;

    // Validate documents
    const technicalDocs = documents.filter(d => d.document_category === 'Technical');
    const financialDocs = documents.filter(d => d.document_category === 'Financial');

    if (technicalDocs.length === 0) {
      addToast({
        type: 'error',
        title: 'Missing Documents',
        message: 'Please upload at least one technical proposal document'
      });
      setCurrentStep(2);
      return;
    }

    if (financialDocs.length === 0) {
      addToast({
        type: 'error',
        title: 'Missing Documents',
        message: 'Please upload at least one financial proposal document'
      });
      setCurrentStep(2);
      return;
    }

    if (!confirm('Are you sure you want to submit this bid? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    try {
      await bidService.submitBid(bid.id);
      addToast({
        type: 'success',
        title: 'Bid Submitted',
        message: 'Your bid has been submitted successfully'
      });
      navigate('/bids');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.detail || 'Failed to submit bid'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading bid form..." />;
  }

  if (!tender || !bid) {
    return null;
  }

  const technicalDocs = documents.filter(d => d.document_category === 'Technical');
  const financialDocs = documents.filter(d => d.document_category === 'Financial');
  const prequalDocs = documents.filter(d => d.document_category === 'Pre-Qualification');

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Tender Information</h3>
        <p className="text-sm text-blue-700 mb-4">
          Review the tender details before proceeding with your bid.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Tender ID</p>
          <p className="font-medium">{tender.tender_id}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium">{tender.tender_type}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Estimated Value</p>
          <p className="font-medium">
            {tender.estimated_value
              ? formatCurrency(tender.estimated_value, tender.currency)
              : 'Not disclosed'}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Submission Deadline</p>
          <p className="font-medium">{formatDate(tender.submission_deadline)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">EMD Required</p>
          <p className="font-medium">
            {tender.emd_amount
              ? formatCurrency(tender.emd_amount, tender.currency)
              : 'Not required'}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Bid Validity</p>
          <p className="font-medium">{tender.bid_validity_days} days</p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Description</p>
        <p className="text-gray-700">{tender.description || 'No description provided'}</p>
      </div>

      <Link to={`/tenders/${tender.id}`} className="hover:underline text-sm" style={{ color: colors.primary }}>
        View full tender details →
      </Link>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Two-Envelope System</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Upload your technical and financial proposals separately.
              Only PDF files up to 25MB are allowed.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <CategorySelect
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
          >
            <option value="Pre-Qualification">Pre-Qualification</option>
            <option value="Technical">Technical Proposal</option>
            <option value="Financial">Financial Proposal</option>
          </CategorySelect>

          <Input
            placeholder="Document type (e.g., Company Profile)"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="flex-1"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload PDF
          </Button>
        </div>
      </div>

      {/* Pre-Qualification Documents */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
          Pre-Qualification Documents ({prequalDocs.length})
        </h4>
        {prequalDocs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No pre-qualification documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {prequalDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <File className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.document_type} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Documents */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
          Technical Proposal Documents ({technicalDocs.length})
          <span className="text-xs text-red-500 ml-2">* Required</span>
        </h4>
        {technicalDocs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No technical documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {technicalDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <File className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.document_type} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Documents */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Financial Proposal Documents ({financialDocs.length})
          <span className="text-xs text-red-500 ml-2">* Required</span>
        </h4>
        {financialDocs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No financial documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {financialDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <File className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.document_type} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <form onSubmit={handleSubmit(handleSaveFinancial)} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Financial Bid</h3>
        <p className="text-sm text-blue-700">
          Enter your total bid amount. Make sure this matches the amount in your financial proposal document.
        </p>
      </div>

      <div className="max-w-md">
        <Input
          label="Total Bid Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter your bid amount"
          icon={<IndianRupee className="w-4 h-4" />}
          error={errors.financial_amount?.message}
          {...register('financial_amount', { valueAsNumber: true })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Currency: {tender.currency}
        </p>
      </div>

      {tender.estimated_value && financialAmount && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Your bid is{' '}
            <span className={financialAmount < tender.estimated_value ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {((financialAmount / tender.estimated_value) * 100).toFixed(1)}%
            </span>{' '}
            of the estimated value
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">
          Save & Continue
        </Button>
      </div>
    </form>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Ready to Submit</h3>
            <p className="text-sm text-green-700 mt-1">
              Please review your bid details before final submission.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Bid Number</p>
          <p className="font-medium">{bid.bid_number}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Financial Amount</p>
          <p className="font-medium">
            {bid.financial_amount
              ? formatCurrency(bid.financial_amount, tender.currency)
              : 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Documents Uploaded</p>
          <p className="font-medium">
            Technical: {technicalDocs.length} | Financial: {financialDocs.length} | Pre-Qual: {prequalDocs.length}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <div className={`flex items-center p-3 rounded-lg ${technicalDocs.length > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          {technicalDocs.length > 0 ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          )}
          <span className={technicalDocs.length > 0 ? 'text-green-700' : 'text-red-700'}>
            Technical proposal document
          </span>
        </div>
        <div className={`flex items-center p-3 rounded-lg ${financialDocs.length > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          {financialDocs.length > 0 ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          )}
          <span className={financialDocs.length > 0 ? 'text-green-700' : 'text-red-700'}>
            Financial proposal document
          </span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Once submitted, you cannot modify your bid.
          You may withdraw it before the submission deadline if needed.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Tenders', path: '/tenders' },
          { label: tender.tender_id, path: `/tenders/${tender.id}` },
          { label: 'Submit Bid' }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit Bid</h1>
        <p className="mt-1 text-sm text-gray-500">{tender.title}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Steps Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  style={{
                    color: currentStep === step.id
                      ? colors.primary
                      : currentStep > step.id
                        ? '#16a34a'
                        : '#9ca3af'
                  }}
                  className="flex items-center"
                >
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-full border-2"
                    style={{
                      borderColor: currentStep === step.id
                        ? colors.primary
                        : currentStep > step.id
                          ? '#16a34a'
                          : '#d1d5db',
                      backgroundColor: currentStep === step.id
                        ? colors.primary
                        : currentStep > step.id
                          ? '#16a34a'
                          : 'white',
                      color: currentStep === step.id || currentStep > step.id
                        ? 'white'
                        : 'inherit'
                    }}
                  >
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
                  <div
                    className="flex-1 h-0.5 mx-4"
                    style={{
                      backgroundColor: currentStep > step.id ? '#16a34a' : '#e5e7eb'
                    }}
                  />
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
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            {currentStep !== 3 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                {currentStep === STEPS.length ? (
                  <Button
                    onClick={handleFinalSubmit}
                    loading={submitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Submit Bid
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BidSubmission;
