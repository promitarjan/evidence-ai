import { formatInTextCitation, formatBibliographyEntry } from './src/utils/citationStyles.ts';

const mockEvidence = {
  id: 'src-1',
  sourceType: 'user_pdf',
  title: 'Thermal stress and yield variability in South Asian river deltas',
  authors: ['Rahman et al.'],
  year: 2025,
  location: 'Page 8',
  exactPassage: 'Reducing grain fertility by 22% to 26%',
  formattedCitation: '(Rahman, 2025)',
  formattedBibEntry: 'Rahman, M. (2025). Thermal stress and yield variability.'
};

console.log('--- Testing Citation Styling ---');

// APA
const citApa = formatInTextCitation(mockEvidence, 0, 'APA');
const bibApa = formatBibliographyEntry(mockEvidence, 0, 'APA');
console.log('APA In-Text:', citApa);
console.log('APA Bib:', bibApa);
if (!citApa.includes('Rahman') || !citApa.includes('2025')) throw new Error('APA citation failed');

// MLA
const citMla = formatInTextCitation(mockEvidence, 0, 'MLA');
const bibMla = formatBibliographyEntry(mockEvidence, 0, 'MLA');
console.log('MLA In-Text:', citMla);
console.log('MLA Bib:', bibMla);
if (!citMla.includes('Rahman') || !citMla.includes('1')) throw new Error('MLA citation failed');

// IEEE
const citIeee = formatInTextCitation(mockEvidence, 0, 'IEEE');
const bibIeee = formatBibliographyEntry(mockEvidence, 0, 'IEEE');
console.log('IEEE In-Text:', citIeee);
console.log('IEEE Bib:', bibIeee);
if (citIeee !== '[1]' || !bibIeee.startsWith('[1]')) throw new Error('IEEE citation failed');

console.log('\n✓ SLICE 4 INTERACTIVE CITATION AND BIBLIOGRAPHY VERIFICATION PASSED!');
