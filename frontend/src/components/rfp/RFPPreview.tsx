import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import type { Tender, RFPSection, Clause } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface RFPPreviewProps {
  tender: Tender | null;
  sections: RFPSection[];
  clauses: Clause[];
  selectedClauseIds: number[];
  onExport: (format: 'pdf' | 'docx') => void;
}

const RFPPreview: React.FC<RFPPreviewProps> = ({ tender, sections, clauses, selectedClauseIds, onExport }) => {
  const selectedClauses = clauses.filter((c) => selectedClauseIds.includes(c.id));

  return (
    <div>
      {/* Export Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Button onClick={() => onExport('pdf')} icon={<Download size={16} />}>
          Export PDF
        </Button>
        <Button variant="outline" onClick={() => onExport('docx')} icon={<FileText size={16} />}>
          Export Word
        </Button>
        <Button variant="outline" onClick={() => window.print()} icon={<Printer size={16} />}>
          Print
        </Button>
      </div>

      {/* Preview Document */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          <div
            style={{
              maxHeight: 600,
              overflowY: 'auto',
              padding: 40,
              backgroundColor: '#fff',
              fontFamily: 'Georgia, serif',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40, paddingBottom: 20, borderBottom: '2px solid #1e3a5f' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: '0 0 8px', textTransform: 'uppercase' }}>
                Request for Proposal
              </h1>
              {tender && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>{tender.title}</h2>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                    Reference: {tender.tender_id} | Date: {formatDate(new Date().toISOString())}
                  </p>
                </>
              )}
            </div>

            {/* Tender Details */}
            {tender && (
              <div style={{ marginBottom: 32, padding: 20, backgroundColor: '#f9fafb', borderRadius: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', margin: '0 0 12px', textTransform: 'uppercase' }}>
                  Tender Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Type:</span>{' '}
                    <span style={{ color: '#111827', fontWeight: 500 }}>{tender.tender_type}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Stage:</span>{' '}
                    <span style={{ color: '#111827', fontWeight: 500 }}>{tender.tender_stage}</span>
                  </div>
                  {tender.estimated_value && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Estimated Value:</span>{' '}
                      <span style={{ color: '#111827', fontWeight: 500 }}>{formatCurrency(Number(tender.estimated_value))}</span>
                    </div>
                  )}
                  {tender.submission_deadline && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Submission Deadline:</span>{' '}
                      <span style={{ color: '#111827', fontWeight: 500 }}>{formatDate(tender.submission_deadline)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sections */}
            {sections.map((section, index) => (
              <div key={section.id} style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: '0 0 12px' }}>
                  {index + 1}. {section.title}
                </h3>
                {section.content && (
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
                    {section.content}
                  </p>
                )}
                {section.subsections?.map((sub, subIndex) => (
                  <div key={sub.id} style={{ marginLeft: 20, marginBottom: 12 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>
                      {index + 1}.{subIndex + 1} {sub.title}
                    </h4>
                    {sub.content && (
                      <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{sub.content}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Selected Clauses */}
            {selectedClauses.length > 0 && (
              <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: '0 0 16px' }}>
                  {sections.length + 1}. Terms and Conditions
                </h3>
                {selectedClauses.map((clause, index) => (
                  <div key={clause.id} style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>
                      {sections.length + 1}.{index + 1} {clause.title}
                    </h4>
                    <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{clause.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: '2px solid #1e3a5f', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                Generated by ATEMS - AI Tender Evaluation & Management System
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RFPPreview;
