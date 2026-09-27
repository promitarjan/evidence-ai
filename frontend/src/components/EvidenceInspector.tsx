import React from 'react';
import type { Claim } from '../types';
import { StatusBadge } from './StatusBadge';
import { Check, X, BookOpen, Quote, MapPin, AlertCircle } from 'lucide-react';

interface EvidenceInspectorProps {
  claim: Claim | null;
  onAcceptCitation: (claimId: string) => void;
  onIgnoreClaim: (claimId: string) => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  claim,
  onAcceptCitation,
  onIgnoreClaim,
}) => {
  if (!claim) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
        <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="text-base font-semibold text-slate-800">Select a Claim to Inspect</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Click on any color-coded highlight in the document canvas to view extracted evidence and verification details.
        </p>
      </div>
    );
  }

  const isAccepted = claim.status === 'accepted';
  const hasEvidence = Boolean(claim.evidence && claim.evidence.exactPassage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
      {/* Header & Status */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Claim #{claim.id.replace('claim-', '')}
        </span>
        <StatusBadge level={claim.supportLevel} isAccepted={isAccepted} />
      </div>

      {/* Target Statement */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Target Statement in Paper
        </label>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-serif italic text-slate-800 leading-relaxed">
          "{claim.sentenceText}"
        </div>
      </div>

      {/* Claim Type & Reasoning */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
          <span className="text-slate-400 block mb-0.5">Classification</span>
          <span className="font-semibold text-slate-800 capitalize">{claim.claimType} Claim</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
          <span className="text-slate-400 block mb-0.5">Verification Confidence</span>
          <span className="font-semibold text-slate-800">{(claim.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Verification Rationale
        </label>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-100">
          {claim.reasoning}
        </p>
      </div>

      {/* Exact Supporting Passage */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-1">
          <span>Ground-Truth Source Evidence</span>
          {claim.evidence && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {claim.evidence.sourceType === 'user_pdf' ? 'Uploaded Library PDF' : 'Scholarly Database'}
            </span>
          )}
        </label>

        {hasEvidence ? (
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-start gap-2 text-xs text-emerald-950 font-serif leading-relaxed">
              <Quote className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>"{claim.evidence?.exactPassage}"</span>
            </div>

            <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[200px]">{claim.evidence?.title}</span>
              </div>
              {claim.evidence?.location && (
                <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{claim.evidence.location}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No verifiable supporting passage found</p>
              <p className="text-rose-600 mt-0.5">
                Neither your uploaded reference PDFs nor external scholarly searches contain a direct empirical match.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        {!isAccepted ? (
          <button
            type="button"
            disabled={!hasEvidence}
            onClick={() => onAcceptCitation(claim.id)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              hasEvidence
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Accept Citation
          </button>
        ) : (
          <div className="flex-1 p-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2 border border-slate-200">
            <Check className="w-4 h-4 text-emerald-600" />
            Citation Placed in Document
          </div>
        )}

        <button
          type="button"
          onClick={() => onIgnoreClaim(claim.id)}
          className="px-3 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition"
          title="Dismiss this claim highlight"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
