import React from 'react';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import Button from '../ui/Button';
import { API_BASE_URL } from '../../utils/constants';

interface ExportButtonsProps {
  tenderId: number;
  tenderTitle?: string;
  showPDF?: boolean;
  showExcel?: boolean;
  showCSV?: boolean;
  className?: string;
}

/**
 * Export Buttons Component
 * Provides buttons to export tender data in various formats
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({
  tenderId,
  tenderTitle: _tenderTitle = 'Tender',
  showPDF = true,
  showExcel = true,
  showCSV = true,
  className = ''
}) => {
  // tenderTitle available for future use in filenames
  void _tenderTitle;
  const [isExporting, setIsExporting] = React.useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv', endpoint: string) => {
    setIsExporting(format);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export_${tenderId}_${new Date().toISOString().split('T')[0]}`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1].replace(/"/g, '');
        }
      } else {
        // Add extension based on format
        const extensions = { pdf: '.pdf', excel: '.xlsx', csv: '.csv' };
        filename += extensions[format];
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showPDF && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf', `/exports/tender/${tenderId}/summary/pdf`)}
          disabled={isExporting !== null}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-red-600" />
          {isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </Button>
      )}

      {showExcel && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('excel', `/exports/tender/${tenderId}/bids/excel`)}
          disabled={isExporting !== null}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          {isExporting === 'excel' ? 'Exporting...' : 'Export Excel'}
        </Button>
      )}

      {showCSV && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv', `/exports/tender/${tenderId}/bids/csv`)}
          disabled={isExporting !== null}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-blue-600" />
          {isExporting === 'csv' ? 'Exporting...' : 'Export CSV'}
        </Button>
      )}
    </div>
  );
};

/**
 * Comparative Statement Export Button
 */
interface ComparativeExportProps {
  tenderId: number;
  className?: string;
}

export const ComparativeStatementExport: React.FC<ComparativeExportProps> = ({
  tenderId,
  className = ''
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/exports/tender/${tenderId}/comparative-statement/pdf`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparative_statement_${tenderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export comparative statement');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 ${className}`}
    >
      <FileText className="w-4 h-4" />
      {isExporting ? 'Generating...' : 'Export Comparative Statement'}
    </Button>
  );
};

export default ExportButtons;
