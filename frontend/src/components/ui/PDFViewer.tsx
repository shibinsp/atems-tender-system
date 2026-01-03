import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';
import Button from './Button';

interface PDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  isModal?: boolean;
}

/**
 * PDF Viewer Component
 * Displays PDF documents with zoom, navigation, and download controls
 * Uses browser's native PDF rendering via iframe/embed
 */
const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  title = 'Document Preview',
  onClose,
  isModal = true
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    // Open PDF in new tab for download
    window.open(url, '_blank');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
    : 'w-full h-full';

  const viewerClass = isModal
    ? isFullscreen
      ? 'w-full h-full bg-white'
      : 'w-[90vw] h-[90vh] max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden'
    : 'w-full h-full bg-white rounded-lg shadow overflow-hidden';

  return (
    <div className={containerClass}>
      <div className={viewerClass}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
          <h3 className="text-lg font-semibold text-gray-800 truncate max-w-md">
            {title}
          </h3>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white rounded-md border px-2 py-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom Out"
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom In"
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-gray-200 rounded"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-200 rounded"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 text-red-600 rounded"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* PDF Content */}
        <div
          className="w-full overflow-auto bg-gray-200"
          style={{ height: 'calc(100% - 56px)' }}
        >
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${10000 / zoom}%`,
              height: `${10000 / zoom}%`
            }}
          >
            {/* Using embed for better PDF rendering */}
            <embed
              src={`${url}#toolbar=0&navpanes=0`}
              type="application/pdf"
              className="w-full h-full"
              style={{ minHeight: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * PDF Preview Button Component
 * A button that opens PDF in a modal viewer
 */
interface PDFPreviewButtonProps {
  url: string;
  title?: string;
  buttonText?: string;
  className?: string;
}

export const PDFPreviewButton: React.FC<PDFPreviewButtonProps> = ({
  url,
  title,
  buttonText = 'Preview',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {buttonText}
      </Button>

      {isOpen && (
        <PDFViewer
          url={url}
          title={title}
          onClose={() => setIsOpen(false)}
          isModal={true}
        />
      )}
    </>
  );
};

/**
 * Inline PDF Viewer Component
 * Embeds PDF directly in the page
 */
interface InlinePDFViewerProps {
  url: string;
  height?: string;
  className?: string;
}

export const InlinePDFViewer: React.FC<InlinePDFViewerProps> = ({
  url,
  height = '600px',
  className = ''
}) => {
  return (
    <div className={`w-full bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <embed
        src={`${url}#toolbar=1&navpanes=0`}
        type="application/pdf"
        className="w-full h-full"
      />
    </div>
  );
};

export default PDFViewer;
