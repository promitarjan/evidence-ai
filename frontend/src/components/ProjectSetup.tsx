import React, { useState } from 'react';
import { Upload, FileText, BookOpen, Trash2, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ProjectSetupProps {
  onRunAudit: (draftFile: File, referenceFiles: File[]) => Promise<void>;
  isLoading: boolean;
}

export const ProjectSetup: React.FC<ProjectSetupProps> = ({ onRunAudit, isLoading }) => {
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [dragOverDraft, setDragOverDraft] = useState(false);
  const [dragOverRef, setDragOverRef] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDraftSelect = (file: File) => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.docx') && !ext.endsWith('.pdf')) {
      setErrorMsg('Please upload a valid .docx or .pdf research paper draft.');
      return;
    }
    setErrorMsg(null);
    setDraftFile(file);
  };

  const handleRefAdd = (files: FileList | null) => {
    if (!files) return;
    const validPdfs: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.toLowerCase().endsWith('.pdf')) {
        validPdfs.push(files[i]);
      }
    }
    if (validPdfs.length === 0) {
      setErrorMsg('Please upload .pdf files for your evidence library.');
      return;
    }
    setErrorMsg(null);
    setReferenceFiles(prev => [...prev, ...validPdfs]);
  };

  const removeReferenceFile = (index: number) => {
    setReferenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const loadSampleFiles = async () => {
    try {
      setErrorMsg(null);
      // Fetch sample files from backend test_data if available
      const docxRes = await fetch('/api/sample/draft');
      const pdfRes = await fetch('/api/sample/reference');
      
      if (docxRes.ok && pdfRes.ok) {
        const docxBlob = await docxRes.blob();
        const pdfBlob = await pdfRes.blob();
        const sampleDraft = new File([docxBlob], 'sample_paper.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const sampleRef = new File([pdfBlob], 'rahman_2025_reference.pdf', { type: 'application/pdf' });
        setDraftFile(sampleDraft);
        setReferenceFiles([sampleRef]);
      } else {
        // Fallback: create mock local blobs
        const draftBlob = new Blob(
          ["Climate Impacts on Rice Agriculture in South Asia\n\nRice is an essential staple crop in Asia. Bangladesh is one of the world's most climate-vulnerable countries. Recent field trials indicate that high temperature stress reduces rice grain fertility by as much as 25%."],
          { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
        );
        const refBlob = new Blob(["Rahman et al. 2025: Temperature variability reduces rice fertility by 22% to 26%."], { type: 'application/pdf' });
        setDraftFile(new File([draftBlob], 'sample_climate_paper.docx'));
        setReferenceFiles([new File([refBlob], 'rahman_2025_study.pdf')]);
      }
    } catch {
      setErrorMsg('Could not auto-load sample files; please upload your files manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftFile) {
      setErrorMsg('Please upload a draft research paper first.');
      return;
    }
    setErrorMsg(null);
    await onRunAudit(draftFile, referenceFiles);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Brand Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Evidence Integrity Auditor
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl font-sans">
          Evidence<span className="text-emerald-600">AI</span>
        </h1>
        <p className="mt-3 text-xl text-slate-600 max-w-2xl mx-auto italic font-serif">
          “Don’t just cite. Prove your claims.”
        </p>
        <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
          Audit your draft research paper, extract verifiable claims, ground them in exact source passages, and insert traceable citations.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zone A: Draft Paper */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Required</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Upload Draft Paper
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Supported formats: <strong>.docx</strong> or <strong>.pdf</strong>
              </p>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverDraft(true); }}
                onDragLeave={() => setDragOverDraft(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDraft(false);
                  if (e.dataTransfer.files?.[0]) handleDraftSelect(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragOverDraft ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('draft-upload-input')?.click()}
              >
                <input
                  id="draft-upload-input"
                  type="file"
                  accept=".docx,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleDraftSelect(e.target.files[0])}
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Click or drag & drop draft</p>
                <p className="text-xs text-slate-400 mt-1">DOCX, PDF up to 25MB</p>
              </div>
            </div>

            {draftFile && (
              <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-900 truncate">{draftFile.name}</span>
                </div>
                <span className="text-xs text-emerald-700 whitespace-nowrap ml-2">
                  {(draftFile.size / 1024).toFixed(0)} KB
                </span>
              </div>
            )}
          </div>

          {/* Zone B: Evidence Library */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Evidence Library (PDFs)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Upload your research sources to prioritize for evidence matching.
              </p>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverRef(true); }}
                onDragLeave={() => setDragOverRef(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverRef(false);
                  handleRefAdd(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragOverRef ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('ref-upload-input')?.click()}
              >
                <input
                  id="ref-upload-input"
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleRefAdd(e.target.files)}
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Add reference PDFs</p>
                <p className="text-xs text-slate-400 mt-1">Multi-file PDF support</p>
              </div>
            </div>

            {referenceFiles.length > 0 && (
              <div className="mt-4 max-h-36 overflow-y-auto space-y-2 pr-1">
                {referenceFiles.map((file, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                    <span className="truncate max-w-[200px] text-slate-800 font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeReferenceFile(idx)}
                      className="text-slate-400 hover:text-rose-600 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={loadSampleFiles}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-lg transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Load Sample Paper & Evidence
          </button>

          <button
            type="submit"
            disabled={!draftFile || isLoading}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-base font-semibold text-white shadow-sm transition-all ${
              !draftFile || isLoading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Auditing Claims & Evidence...
              </>
            ) : (
              <>
                Run Evidence Audit
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
