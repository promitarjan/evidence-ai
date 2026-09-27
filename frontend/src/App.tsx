import React, { useState } from 'react';
import { ProjectSetup } from './components/ProjectSetup';
import { AuditDashboard } from './components/AuditDashboard';
import { runEvidenceAudit } from './services/api';
import type { AuditPayload } from './types';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunAudit = async (draftFile: File, referenceFiles: File[]) => {
    setIsLoading(true);
    try {
      const result = await runEvidenceAudit(draftFile, referenceFiles);
      setAuditData(result);
    } catch (err: any) {
      alert(`Error running evidence audit: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
            E
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
              Evidence<span className="text-emerald-600">AI</span>
            </span>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200 ml-2">
            Audit Engine
          </span>
        </div>
        {auditData && (
          <button
            onClick={() => setAuditData(null)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Audit Another Paper
          </button>
        )}
      </header>

      <main className="flex-1">
        {!auditData ? (
          <ProjectSetup onRunAudit={handleRunAudit} isLoading={isLoading} />
        ) : (
          <AuditDashboard auditData={auditData} />
        )}
      </main>

      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
        EvidenceAI — “Don't just cite. Prove your claims.”
      </footer>
    </div>
  );
};

export default App;
