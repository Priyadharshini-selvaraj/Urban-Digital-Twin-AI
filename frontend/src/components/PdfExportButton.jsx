import React, { useState } from 'react';
import { FileText, Download, Check } from 'lucide-react';
import { generatePdfReport } from '../utils/pdfGenerator';

export default function PdfExportButton({ user, startNode, endNode, vehicleType, algorithm, activeProfileKey, profiles }) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExportPdf = () => {
    setDownloading(true);
    setSuccess(false);

    try {
      generatePdfReport({
        userName: user ? user.username : 'Smart City Analyst',
        startNode,
        endNode,
        vehicleType,
        algorithm,
        activeProfileKey,
        profiles
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF report:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      className="glow-btn"
      onClick={handleExportPdf}
      disabled={downloading}
      style={{
        padding: '10px 18px',
        fontSize: '0.85rem',
        background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        boxShadow: success ? '0 0 15px rgba(16,185,129,0.4)' : '0 0 15px rgba(139,92,246,0.4)',
        color: '#fff'
      }}
    >
      {success ? (
        <>
          <Check size={16} /> PDF Downloaded!
        </>
      ) : (
        <>
          <FileText size={16} /> {downloading ? 'Generating PDF...' : 'Download PDF Executive Report'}
        </>
      )}
    </button>
  );
}
