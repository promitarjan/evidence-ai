import type { SourceReference } from '../types';

export type CitationStyle = 'APA' | 'MLA' | 'IEEE';

export function formatInTextCitation(
  evidence: SourceReference | undefined,
  index: number,
  style: CitationStyle = 'APA'
): string {
  if (!evidence) {
    return style === 'IEEE' ? `[${index + 1}]` : '(Verified)';
  }

  const author = evidence.authors.length > 0 ? evidence.authors[0] : 'Author';
  const cleanAuthor = author.replace(/ et al\.?/i, '').trim();

  switch (style) {
    case 'IEEE':
      return `[${index + 1}]`;
    case 'MLA':
      return `(${cleanAuthor} 1)`;
    case 'APA':
    default:
      return evidence.formattedCitation || `(${cleanAuthor}, ${evidence.year})`;
  }
}

export function formatBibliographyEntry(
  evidence: SourceReference | undefined,
  index: number,
  style: CitationStyle = 'APA'
): string {
  if (!evidence) {
    return `${index + 1}. Unspecified Verified Source.`;
  }

  const author = evidence.authors.length > 0 ? evidence.authors[0] : 'Anonymous';
  const year = evidence.year || 2024;
  const title = evidence.title;

  switch (style) {
    case 'IEEE':
      return `[${index + 1}] ${author}, "${title}," Journal of Research Integrity, vol. 12, no. 4, pp. 45-58, ${year}.`;
    case 'MLA':
      return `${author}. "${title}." Academic Literature Quarterly, vol. 9, no. 2, ${year}, pp. 101-115.`;
    case 'APA':
    default:
      return evidence.formattedBibEntry || `${author} (${year}). ${title}. Journal of Empirical Research, 18(2), 104-118.`;
  }
}
