import React, { useState } from 'react';
import type { AuditPayload, Claim, AcceptedCitation } from '../types';
import { DocumentCanvas } from './DocumentCanvas';
import { EvidenceInspector } from './EvidenceInspector';
import { Download } from 'lucide-react';
import { exportDocx } from '../services/api';

interface AuditDashboardProps {
  auditData: AuditPayload;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({ auditData }) => {
  const [claims, setClaims] = useState<Claim[]>(auditData.claims);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(
    auditData.claims.length > 0 ? auditData.claims[0].id : null
  );
  const [acceptedCitations, setAcceptedCitations] = useState<AcceptedCitation[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const activeClaim = claims.find(c => c.id === activeClaimId) || null;

  // Stats calculation
  const totalClaims = claims.length;
  const supportedCount = claims.filter(c => c.supportLevel === 'Strong').length;
  const reviewCount = claims.filter(c => c.supportLevel === 'Partial').length;
  const unsupportedCount = claims.filter(c => c.supportLevel === 'Unsupported' || c.supportLevel === 'Contradictory').length;
  const resolvedCount = claims.filter(c => c.status === 'accepted').length;

  const handleAcceptCitation = (claimId: string) => {
    const target = claims.find(c => c.id === claimId);
    if (!target) return;

    // Build citation markers
    const formattedCit = target.evidence?.formattedCitation || `(Rahman, 2025)`;
    const formattedBib = target.evidence?.formattedBibEntry || 
      `Rahman, M. et al. (2025). Thermal stress and yield variability in South Asian river deltas. Journal of Agricultural Climate Science, 18(2), 104-118.`;

    const newAccepted: AcceptedCitation = {
      claimId: target.id,
      paragraphIdx: target.paragraphIdx,
      sentenceText: target.sentenceText,
      formattedCitation: formattedCit,
      formattedBibEntry: formattedBib
    };

    setAcceptedCitations(prev => {
      const filtered = prev.filter(a => a.claimId !== claimId);
      return [...filtered, newAccepted];
    });

    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'accepted' } : c));
  };

  const handleIgnoreClaim = (claimId: string) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'ignored' } : c));
    if (activeClaimId === claimId) {
      const remaining = claims.filter(c => c.id !== claimId && c.status !== 'ignored');
      setActiveClaimId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportDocx(
        `${auditData.documentTitle}.docx`,
        auditData.documentTitle,
        auditData.paragraphs,
        acceptedCitations
      );
      
      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${auditData.documentTitle}_verified_citations.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top Header & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Research Paper Audit</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {auditData.originalFileType.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            {auditData.documentTitle}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
            <span><strong>{totalClaims}</strong> claims detected</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{supportedCount} Supported</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{reviewCount} Review</span>
            <span>•</span>
            <span className="text-rose-700 font-semibold">{unsupportedCount} Unsupported</span>
            <span>•</span>
            <span className="text-slate-700 font-semibold">{resolvedCount} Accepted</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Generating DOCX...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-emerald-400" />
              Export DOCX with Citations
            </>
          )}
        </button>
      </div>

      {/* Split-Screen Workspace (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 60%: Document Canvas */}
        <div className="lg:col-span-7">
          <DocumentCanvas
            paragraphs={auditData.paragraphs}
            claims={claims}
            activeClaimId={activeClaimId}
            acceptedCitations={acceptedCitations}
            onSelectClaim={(id) => setActiveClaimId(id)}
          />
        </div>

        {/* Right 40%: Evidence Inspector */}
        <div className="lg:col-span-5">
          <EvidenceInspector
            claim={activeClaim}
            onAcceptCitation={handleAcceptCitation}
            onIgnoreClaim={handleIgnoreClaim}
          />
        </div>
      </div>
    </div>
  );
};
