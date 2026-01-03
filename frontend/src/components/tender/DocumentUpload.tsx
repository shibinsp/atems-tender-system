import React from 'react';
import { Upload, File, Download, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import tenderService from '../../services/tenderService';
import { useUIStore } from '../../store/uiStore';
import type { TenderDocument } from '../../types';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface DocumentUploadProps {
  tenderId: number;
  documents: TenderDocument[];
  onDocumentsChange: (documents: TenderDocument[]) => void;
  readOnly?: boolean;
}

const DOCUMENT_TYPES = [
  'RFP Document',
  'Terms and Conditions',
  'Technical Specifications',
  'Scope of Work',
  'Eligibility Criteria',
  'Bill of Quantities',
  'Draft Agreement',
  'Annexure',
  'Corrigendum',
  'Other'
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  tenderId,
  documents,
  onDocumentsChange,
  readOnly = false
}) => {
  const { addToast } = useUIStore();
  const [uploading, setUploading] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState(DOCUMENT_TYPES[0]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Only PDF files are allowed'
      });
      return;
    }

    // Validate file size (25MB)
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
      const newDoc = await tenderService.uploadDocument(tenderId, selectedType, file);
      onDocumentsChange([...documents, newDoc]);
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

  const handleDownload = (doc: TenderDocument) => {
    // In a real app, this would download from the server
    window.open(`/api/v1/documents/${doc.id}/download`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <File className="w-5 h-5 mr-2" />
          Tender Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!readOnly && (
          <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
                icon={<Upload className="w-4 h-4" />}
              >
                Upload PDF
              </Button>
            </div>

            <div className="mt-2 flex items-center text-xs text-gray-500">
              <AlertCircle className="w-4 h-4 mr-1" />
              Only PDF files up to 25MB are allowed
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center min-w-0">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <File className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.file_name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-2">
                      <span>{doc.document_type}</span>
                      {doc.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 text-gray-500 hover:text-primary rounded-md hover:bg-gray-100"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
