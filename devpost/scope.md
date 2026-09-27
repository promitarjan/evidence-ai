---
doc: scope
status: approved
---

# EvidenceAI

An AI-powered academic evidence auditor and citation assistant that verifies whether research claims are actually supported by source evidence and places citations with exact passage traceability.

## The Unique Kernel
EvidenceAI is not a citation generator; it is a claim-to-evidence verification system. It decomposes statements into verifiable claims, searches researcher-uploaded documents first before external scholarly sources (OpenAlex/Crossref), retrieves exact supporting passages (with section/page location), evaluates claim-evidence support strength (`Strong`, `Partial`, `Weak`, `Contradictory`), and prevents hallucinated citations by separating AI reasoning from ground-truth document text and bibliographic metadata.

## Who It's For
Academic researchers, thesis students, and graduate authors (e.g., a master's student writing a research thesis) who currently rely on manual literature cross-checking or basic reference finders that don't verify if cited texts actually substantiate the specific claims being made.

## The Core Loop
1. The researcher uploads their draft research paper (PDF or DOCX).
2. The researcher uploads their trusted source PDFs into the personal Evidence Library (with preference set to "prefer uploaded sources").
3. The system parses the document, detects claims requiring evidence, and flags existing citations needing audit.
4. For each claim, EvidenceAI searches uploaded source PDFs, falling back to OpenAlex/Crossref, and extracts exact candidate passages.
5. EvidenceAI evaluates the support relationship (`Strong`, `Partial`, `Weak`, `Contradictory`, `Unsupported`).
6. In the interactive Evidence Dashboard, the researcher clicks a claim, inspects the extracted passage and support badge, and accepts or rejects the citation.
7. The researcher exports the updated, citation-enhanced research document as a round-trip DOCX alongside the audit report.

## Inspiration & Identity
- **Inspiration:** Academic peer review standards, evidence-based medicine audit trails, and transparent research integrity.
- **Look & Feel:** Rigorous, clean, and academic. A calm, authoritative research workspace (split-screen: document canvas on the left, interactive evidence audit inspector on the right) inspired by professional tools like Overleaf, Notion, and academic PDF readers.
- **Key References:** [OpenAlex API](https://openalex.org/), [Crossref API](https://www.crossref.org/).

## Why This Matters to the Learner
Academic writing suffers from widespread citation ambiguity and unsubstantiated claims. Building EvidenceAI tackles this core integrity problem while allowing the learner to practice building a complex, multi-component AI architecture through an intentional, spec-driven workflow.

## What "Working" Looks Like
In a 1-minute demo video:
1. The user uploads a sample research paper in PDF or DOCX format containing several distinct claims (factual, statistical, and existing citations).
2. The user uploads a supporting research paper PDF to their personal Evidence Library.
3. The user triggers the analysis: EvidenceAI identifies claims needing evidence, extracts exact passages from the uploaded PDF for local claims, and queries OpenAlex for external claims.
4. The "Oh, that's cool" moment: The user clicks on a highlighted claim in the interactive dashboard, sees the exact matched excerpt with page/section coordinates and a clear support rating (`Strong Support` vs `Contradictory`), and clicks "Accept Citation".
5. The citation is placed at the exact sentence, and the user downloads the updated round-trip DOCX with citations and formatted bibliography intact.

## The POC Boundary (9-Feature MVP)
1. **Document Upload:** Ingestion of research paper in PDF and DOCX formats.
2. **User Evidence Library:** Upload and text/metadata extraction of researcher-provided source PDFs.
3. **Claim Detection:** LLM extraction of factual, statistical, and scientific claims requiring citations, plus existing citation identification.
4. **Source Search:** Dual-mode search across user-uploaded sources (primary) and OpenAlex/Crossref API fallback (secondary).
5. **Exact Evidence Extraction:** Retrieval of specific supporting text passages with document title, page, and section context.
6. **Claim-Evidence Verification:** Algorithmic/LLM verification scoring the relationship (`Strong`, `Partial`, `Weak`, `Contradictory`, `Unsupported`).
7. **Citation Recommendation & Placement:** Suggesting accurate in-text citations positioned at the precise claim location (supporting APA 7, MLA 9, IEEE).
8. **Interactive Evidence Dashboard:** Split-screen UI highlighting claims in the document, displaying matched passages, support badges, and accept/reject controls.
9. **Round-Trip DOCX Export:** Generating an updated DOCX document with inserted citations and synchronized bibliography, plus an Evidence Audit Summary.

## Later
- Real-time Google Docs / Word add-in extensions.
- LaTeX + BibTeX round-trip compilation and export.
- Retraction database checking (e.g., Retraction Watch API).
- Deep figure/table data verification.
- Additional citation styles (Chicago, Harvard, Vancouver).
- Institutional compliance and systematic literature review pipelines.

## Explicitly Cut
- **Live web scraping beyond OpenAlex/Crossref:** Cut to prevent unreliable unstructured HTML scraping, timeouts, and rate limits during live evaluation.
- **Multi-user team collaboration and cloud sharing:** Cut to keep focus on the single-researcher audit experience.
- **Native LaTeX round-trip parsing:** Cut from MVP in favor of DOCX round-trip, keeping document manipulation scoped to one robust format.
