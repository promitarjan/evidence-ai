import type { ParseResult, AuditPayload, AcceptedCitation } from '../types';

const API_BASE_URL = '/api';

export async function checkBackendHealth(): Promise<{ status: string; gemini_configured: boolean }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Backend health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function parseDocuments(
  draftFile: File,
  referenceFiles: File[]
): Promise<ParseResult> {
  const formData = new FormData();
  formData.append('draft_file', draftFile);
  for (const ref of referenceFiles) {
    formData.append('reference_files', ref);
  }

  const res = await fetch(`${API_BASE_URL}/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Failed to parse documents');
  }

  return res.json();
}

export async function runEvidenceAudit(
  draftFile: File,
  referenceFiles: File[]
): Promise<AuditPayload> {
  const formData = new FormData();
  formData.append('draft_file', draftFile);
  for (const ref of referenceFiles) {
    formData.append('reference_files', ref);
  }

  const res = await fetch(`${API_BASE_URL}/audit`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Audit execution failed');
  }

  return res.json();
}

export async function exportDocx(
  originalFileName: string,
  documentTitle: string,
  paragraphs: { index: number; text: string }[],
  acceptedCitations: AcceptedCitation[]
): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/export-docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originalFileName,
      documentTitle,
      paragraphs,
      acceptedCitations,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to export DOCX');
  }

  return res.blob();
}
