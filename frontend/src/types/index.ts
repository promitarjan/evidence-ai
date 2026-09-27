export type SupportLevel = 'Strong' | 'Partial' | 'Contradictory' | 'Unsupported';

export type ClaimType = 'factual' | 'statistical' | 'scientific';

export type SourceType = 'user_pdf' | 'scholarly_api';

export interface SourceReference {
  id: string;
  sourceType: SourceType;
  title: string;
  authors: string[];
  year: number;
  location?: string; // e.g. "Page 8, Section 4.2"
  exactPassage?: string;
  formattedCitation: string; // e.g. "(Rahman et al., 2025)"
  formattedBibEntry: string; // Full APA reference entry
}

export interface Claim {
  id: string;
  paragraphIdx: number;
  sentenceText: string;
  claimType: ClaimType;
  supportLevel: SupportLevel;
  confidence: number;
  reasoning: string;
  evidence?: SourceReference;
  status: 'pending' | 'accepted' | 'ignored';
}

export interface DocumentParagraph {
  index: number;
  text: string;
}

export interface AuditPayload {
  documentTitle: string;
  originalFileType: 'docx' | 'pdf';
  paragraphs: DocumentParagraph[];
  claims: Claim[];
}

export interface AcceptedCitation {
  claimId: string;
  paragraphIdx: number;
  sentenceText: string;
  formattedCitation: string;
  formattedBibEntry: string;
}

export interface ParseResult {
  status: string;
  draft_filename: string;
  paragraph_count: number;
  paragraphs: DocumentParagraph[];
  reference_sources: { filename: string; chunk_count: number }[];
}
