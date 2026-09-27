import React, { useState } from 'react';
import { ProjectSetup } from './components/ProjectSetup';
import { runEvidenceAudit, parseDocuments } from './services/api';
import type { AuditPayload } from './types';
import { FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseSummary, setParseSummary] = useState<any | null>(null);

  const handleRunAudit = async (draftFile: File, referenceFiles: File[]) => {
    setIsLoading(true);
    try {
      // In Slice 1, verify parsing pipeline
      const parseResult = await parseDocuments(draftFile, referenceFiles);
      setParseSummary(parseResult);
      
      // Attempt audit endpoint (if ready or fallback to parse preview)
      try {
        const result = await runEvidenceAudit(draftFile, referenceFiles);
        setAuditData(result);
      } catch {
        // Fallback for Slice 1 scaffold preview
        setAuditData({
          documentTitle: draftFile.name.replace(/\.[^/.]+$/, ""),
          originalFileType: draftFile.name.endsWith('.pdf') ? 'pdf' : 'docx',
          paragraphs: parseResult.paragraphs,
          claims: []
        });
      }
    } catch (err: any) {
      alert(`Error processing document: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
            Evidence<span className="text-emerald-600">AI</span>
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200">
            Proof of Concept
          </span>
        </div>
        {auditData && (
          <button
            onClick={() => { setAuditData(null); setParseSummary(null); }}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Document
          </button>
        )}
      </header>

      <main className="flex-1">
        {!auditData ? (
          <ProjectSetup onRunAudit={handleRunAudit} isLoading={isLoading} />
        ) : (
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Document Ingestion & Parsing Verified
                </h3>
                <p className="text-sm text-emerald-800 mt-1">
                  Draft paper <strong>{parseSummary?.draft_filename || auditData.documentTitle}</strong> was parsed into{' '}
                  <strong>{parseSummary?.paragraph_count || auditData.paragraphs.length} paragraphs</strong>.
                  {parseSummary?.reference_sources?.length > 0 && (
                    <span> Loaded {parseSummary.reference_sources.length} reference PDF(s) with {parseSummary.reference_sources.reduce((acc: number, r: any) => acc + r.chunk_count, 0)} text chunks.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold font-serif text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Parsed Draft Paragraphs
              </h2>
              <div className="space-y-4">
                {auditData.paragraphs.map((p) => (
                  <div key={p.index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-serif leading-relaxed text-slate-800 text-sm">
                    <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                      Paragraph #{p.index + 1}
                    </span>
                    {p.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-400">
        EvidenceAI — Academic Evidence and Citation Integrity Auditor
      </footer>
    </div>
  );
};

export default App;
