import React from 'react';
import type { DocumentParagraph, Claim, AcceptedCitation } from '../types';
import { BookOpen, FileCheck } from 'lucide-react';

interface DocumentCanvasProps {
  paragraphs: DocumentParagraph[];
  claims: Claim[];
  activeClaimId: string | null;
  acceptedCitations: AcceptedCitation[];
  onSelectClaim: (claimId: string) => void;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  paragraphs,
  claims,
  activeClaimId,
  acceptedCitations,
  onSelectClaim,
}) => {
  // Render a paragraph with interactive claim highlights
  const renderParagraphContent = (para: DocumentParagraph) => {
    const paraClaims = claims.filter(c => c.paragraphIdx === para.index && c.status !== 'ignored');

    if (paraClaims.length === 0) {
      return <span>{para.text}</span>;
    }

    // Sort claims by their appearance in the text
    const sortedClaims = [...paraClaims].sort((a, b) => {
      const idxA = para.text.indexOf(a.sentenceText);
      const idxB = para.text.indexOf(b.sentenceText);
      return idxA - idxB;
    });

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedClaims.forEach((claim) => {
      let startIdx = para.text.indexOf(claim.sentenceText, lastIndex);
      let matchLen = claim.sentenceText.length;

      if (startIdx === -1) {
        // Fallback: match case-insensitively or trimmed
        const lowerPara = para.text.toLowerCase();
        const lowerSentence = claim.sentenceText.toLowerCase().trim();
        startIdx = lowerPara.indexOf(lowerSentence, lastIndex);
        if (startIdx !== -1) {
          matchLen = lowerSentence.length;
        }
      }

      if (startIdx === -1) {
        return; // sentence not found
      }

      // Add leading normal text
      if (startIdx > lastIndex) {
        elements.push(
          <span key={`text-${para.index}-${lastIndex}`}>
            {para.text.substring(lastIndex, startIdx)}
          </span>
        );
      }

      // Check if accepted
      const isAccepted = claim.status === 'accepted';
      const acceptedData = acceptedCitations.find(ac => ac.claimId === claim.id);
      const isActive = activeClaimId === claim.id;

      let colorClasses = 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200';
      if (isAccepted) {
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
      } else if (claim.supportLevel === 'Strong') {
        colorClasses = 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200';
      } else if (claim.supportLevel === 'Contradictory' || claim.supportLevel === 'Unsupported') {
        colorClasses = 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200';
      }

      elements.push(
        <span
          key={`claim-${claim.id}`}
          onClick={() => onSelectClaim(claim.id)}
          className={`cursor-pointer px-1 py-0.5 rounded border transition-all inline mx-0.5 ${colorClasses} ${
            isActive ? 'ring-2 ring-emerald-600 ring-offset-1 font-medium' : ''
          }`}
          title={`Click to inspect evidence (${claim.supportLevel} support)`}
        >
          {claim.sentenceText}
          {isAccepted && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded inline-flex items-center">
              {acceptedData?.formattedCitation || claim.evidence?.formattedCitation || '(Verified)'}
            </span>
          )}
        </span>
      );

      lastIndex = startIdx + matchLen;
    });

    // Add trailing normal text
    if (lastIndex < para.text.length) {
      elements.push(
        <span key={`text-${para.index}-${lastIndex}`}>
          {para.text.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-none">
      {/* Document Area */}
      <div className="prose prose-slate max-w-none font-serif text-slate-800 leading-relaxed text-base">
        {paragraphs.map((p) => (
          <p key={p.index} className="mb-6 leading-8">
            {renderParagraphContent(p)}
          </p>
        ))}
      </div>

      {/* Live References Section */}
      <div className="mt-12 pt-8 border-t-2 border-slate-200">
        <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          References & Bibliography ({acceptedCitations.length})
        </h3>

        {acceptedCitations.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 italic">
            No citations accepted yet. Click highlighted claims in the document and click "Accept Citation" to populate your live bibliography.
          </div>
        ) : (
          <div className="space-y-3">
            {acceptedCitations.map((cit, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans text-slate-800 flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">{cit.formattedBibEntry}</p>
                  <p className="text-slate-400 mt-0.5 text-[11px]">
                    Supporting claim: <span className="italic text-slate-600">"{cit.sentenceText.substring(0, 80)}..."</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
