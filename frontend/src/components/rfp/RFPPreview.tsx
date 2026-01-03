import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle,
  Building2
} from 'lucide-react';
import Button from '../ui/Button';
import type { RFPSection, Clause, Tender } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RFPPreviewProps {
  tender?: Tender | null;
  sections: RFPSection[];
  clauses: Clause[];
  selectedClauseIds: number[];
  onExport?: (format: 'pdf' | 'docx') => void;
}

const RFPPreview: React.FC<RFPPreviewProps> = ({
  tender,
  sections,
  clauses,
  selectedClauseIds,
  onExport
}) => {
  const [copied, setCopied] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const selectedClauses = clauses.filter(c => selectedClauseIds.includes(c.id));

  const handleCopy = async () => {
    if (previewRef.current) {
      try {
        await navigator.clipboard.writeText(previewRef.current.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to copy');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          RFP Preview
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>
          {onExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
                icon={<Download className="w-4 h-4" />}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('docx')}
                icon={<Download className="w-4 h-4" />}
              >
                Word
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview Container */}
      <div
        ref={previewRef}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-h-[600px] overflow-y-auto print:max-h-none print:overflow-visible"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            REQUEST FOR PROPOSAL (RFP)
          </h1>
          {tender && (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {tender.title}
              </h2>
              <div className="flex justify-center gap-8 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Tender ID:</span> {tender.tender_id}
                </div>
                {tender.estimated_value && (
                  <div>
                    <span className="font-medium">Estimated Value:</span>{' '}
                    {formatCurrency(tender.estimated_value)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Table of Contents */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Table of Contents</h3>
          <div className="space-y-1">
            {sections.map(section => (
              <div key={section.id} className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-8">{section.order}.</span>
                <span className="text-gray-600">{section.title}</span>
                <span className="flex-1 border-b border-dotted border-gray-300 mx-2" />
                <span className="text-gray-400">Page {section.order}</span>
              </div>
            ))}
            {selectedClauses.length > 0 && (
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-8">{sections.length + 1}.</span>
                <span className="text-gray-600">Standard Clauses</span>
                <span className="flex-1 border-b border-dotted border-gray-300 mx-2" />
                <span className="text-gray-400">Page {sections.length + 1}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        {sections.map(section => (
          <div key={section.id} className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {section.order}. {section.title}
              {section.is_mandatory && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Mandatory
                </span>
              )}
            </h3>

            {section.content ? (
              <div className="text-gray-700 whitespace-pre-wrap mb-4">
                {section.content}
              </div>
            ) : (
              <p className="text-gray-400 italic mb-4">
                [Section content to be added]
              </p>
            )}

            {section.subsections && section.subsections.length > 0 && (
              <div className="space-y-4 ml-4">
                {section.subsections.map(sub => (
                  <div key={sub.id}>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {section.order}.{sub.order} {sub.title}
                    </h4>
                    {sub.content ? (
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {sub.content}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">
                        [Subsection content to be added]
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Selected Clauses */}
        {selectedClauses.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {sections.length + 1}. Standard Clauses
            </h3>

            {/* Group clauses by category */}
            {Object.entries(
              selectedClauses.reduce((acc, clause) => {
                if (!acc[clause.category]) acc[clause.category] = [];
                acc[clause.category].push(clause);
                return acc;
              }, {} as Record<string, Clause[]>)
            ).map(([category, categoryClauses], categoryIndex) => (
              <div key={category} className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  {sections.length + 1}.{categoryIndex + 1} {category} Clauses
                </h4>
                <div className="space-y-4 ml-4">
                  {categoryClauses.map((clause, clauseIndex) => (
                    <div key={clause.id}>
                      <h5 className="font-medium text-gray-700 mb-1">
                        {sections.length + 1}.{categoryIndex + 1}.{clauseIndex + 1} {clause.title}
                        {clause.is_mandatory && (
                          <span className="ml-2 text-xs text-amber-600">(Mandatory)</span>
                        )}
                      </h5>
                      <p className="text-gray-700 whitespace-pre-wrap">{clause.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            This RFP document is generated by ATEMS - AI-Based Tender Evaluation & Management System
          </p>
          <p>
            Generated on: {new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RFPPreview;
