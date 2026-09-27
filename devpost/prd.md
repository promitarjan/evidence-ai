---
doc: prd
status: approved
---

# EvidenceAI — Product Requirements Document

An AI-powered academic evidence auditor and citation assistant that verifies whether claims in research papers are supported by source evidence and inserts traceable citations into an exportable document.
*Source:* `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

---

## The Core Journey
*Source:* `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **Arrival & Setup:** The researcher lands on the **Project Setup** screen and sees two clear dropzones: one for their draft paper (PDF or DOCX) and one for their personal Evidence Library (PDFs).
2. **File Selection:** The researcher uploads their draft paper and one or more reference PDFs, then clicks the prominent **Run Evidence Audit** button.
3. **Audit Execution:** The system extracts document text, identifies claims requiring citations, searches uploaded PDFs (falling back to OpenAlex/Crossref metadata for external claims), extracts supporting passages, and scores claim-evidence support.
4. **Dashboard Inspection:** The researcher is transitioned to the **Audit Dashboard**. The left canvas displays the paper with claims highlighted by support status (Green = Supported, Yellow = Needs Review/Partial, Red = Contradictory/Unsupported).
5. **Evidence Review:** Clicking any highlighted claim immediately populates the right **Evidence Inspector** with the exact matched passage, source metadata (author, year, title, page/section), and support badge.
6. **Citation Acceptance:** For a supported claim, the researcher clicks **Accept Citation**. The highlight shifts to grey (resolved), the in-text citation marker (e.g., `(Rahman, 2025)`) appears inline in the document text, and the reference is added to the live bibliography at the bottom of the canvas.
7. **Unsupported Resolution:** For claims with no evidence found, the inspector presents an "Unsupported" state with an **Ignore** option to dismiss the highlight.
8. **Export:** In the top header, the researcher clicks **Export DOCX** to download an updated Word document with all accepted citations embedded in their proper sentences and a complete, formatted References section appended.

---

## Screens and Layout

### Screen 1: Project Setup
- **Header:** Clean branding with tagline (*"Don't just cite. Prove your claims."*).
- **Upload Zone A (Draft Paper):** Accepts a single `.docx` or `.pdf` file. Displays file name and size once selected.
- **Upload Zone B (Evidence Library):** Multi-file dropzone accepting `.pdf` source documents. Displays a list of added files with remove buttons.
- **Action Bar:** Prominent centered primary button: `Run Evidence Audit`, active once a draft paper is uploaded. Includes loading spinner and progress status during processing.

### Screen 2: Audit Dashboard
- **Top Header Bar:** 
  - Document title and audit status counter (e.g., *"14 Claims Detected: 8 Supported, 4 Review, 2 Unsupported"*).
  - Primary button: `Export DOCX` (with active download status).
- **Split-Screen Workspace:**
  - **Left 60% — Document Canvas:** Scrollable paper reader displaying document paragraphs. Contains color-coded clickable highlights over detected claims. Below the text is a collapsible **Live Bibliography (References)** section.
  - **Right 40% — Evidence Inspector Panel:** Sticky context panel showing details of the currently selected claim.
    - Claim text & classification (factual, statistical, scientific).
    - Source origin badge (`Uploaded PDF` or `OpenAlex / Scholarly`).
    - Exact supporting passage snippet with location coordinates (Page, Section).
    - Support verdict badge (`Strong Support`, `Partial Support`, `Contradictory`, `Unsupported`).
    - Action controls: `Accept Citation`, `Ignore / Dismiss`, and citation style selector (APA / MLA / IEEE preview).

---

## Look and Feel
- **Aesthetic:** Academic, scholarly, calm, and rigorous. Inspired by Overleaf, Notion, and academic journal reading interfaces.
- **Typography:** Crisp sans-serif for UI controls and metadata (Inter / System Sans) paired with a readable serif font (Merriweather / Georgia) for document body text.
- **Color Palette:**
  - Backgrounds: Clean warm white / light slate canvas (`#f8fafc`, `#ffffff`) with subtle cool borders (`#e2e8f0`).
  - Text: High-contrast slate charcoal (`#0f172a`, `#334155`).
  - Supported Claim: Emerald green highlight (`#d1fae5` bg, `#065f46` text, `#10b981` badge).
  - Needs Review / Partial: Amber yellow highlight (`#fef3c7` bg, `#92400e` text, `#f59e0b` badge).
  - Contradictory / Unsupported: Rose red highlight (`#fee2e2` bg, `#991b1b` text, `#ef4444` badge).
  - Resolved / Accepted: Muted slate grey (`#f1f5f9` bg, `#475569` text, `#64748b` marker).

---

## Features and Behavior

### 1. Document & Evidence Ingestion
*Source:* `scope.md > The POC Boundary (1, 2)`.
- As a researcher, I want to upload my draft paper (DOCX or PDF) and multiple reference PDFs so that the system has all source material to verify against.
  - [ ] Upload zone accepts `.docx` and `.pdf` draft files, validating file format.
  - [ ] Multi-file dropzone accepts multiple `.pdf` reference files and displays file count and names.
  - [ ] Primary button transitions the interface into an audit processing state with progress feedback.

### 2. Claim Identification & Canvas Highlighting
*Source:* `scope.md > The POC Boundary (3, 8)`.
- As a researcher, I want claims in my draft paper to be automatically highlighted and color-coded so that I immediately see which statements need citations and their verification status.
  - [ ] System detects factual, statistical, and scientific claims requiring external evidence.
  - [ ] Canvas highlights claims with specific colors: Green (Supported), Yellow (Needs Review/Partial), Red (Contradictory/Unsupported).
  - [ ] Clicking any highlighted claim sets it as the active selection and focuses the Evidence Inspector.

### 3. Exact Passage Retrieval & Support Verification
*Source:* `scope.md > The POC Boundary (4, 5, 6)`.
- As a researcher, I want to see the exact passage from the source document that supports my claim so that I can inspect the proof before citing.
  - [ ] System searches uploaded library PDFs first, extracting the most relevant passage with page/section metadata.
  - [ ] If uploaded PDFs lack supporting text, system queries external scholarly sources (OpenAlex/Crossref).
  - [ ] Evidence Inspector displays the exact quoted passage, author/year, publication title, and page/section coordinates.
  - [ ] A distinct badge displays support strength: `Strong Support`, `Partial Support`, `Contradictory`, or `Unsupported`.

### 4. Interactive Citation Placement & Live Bibliography
*Source:* `scope.md > The POC Boundary (7, 8)`.
- As a researcher, I want to accept a verified citation so that it is inserted into the text and added to my bibliography.
  - [ ] Clicking `Accept Citation` transitions the claim highlight to resolved grey.
  - [ ] An in-text citation marker (e.g., `(Rahman, 2025)`) is dynamically inserted adjacent to the supported statement in the canvas.
  - [ ] The reference entry is automatically formatted and appended to the live References section at the bottom of the document.
  - [ ] Clicking `Ignore` removes the highlight and closes the claim without inserting a citation.

### 5. Round-Trip DOCX Export
*Source:* `scope.md > The POC Boundary (9)`.
- As a researcher, I want to download an updated DOCX file containing all my accepted citations so that I can continue working in Word with my evidence verified.
  - [ ] Clicking `Export DOCX` compiles the active document text, incorporating all accepted inline citations at their exact sentence locations.
  - [ ] An academic `References` section is automatically appended at the end containing full bibliographic entries for accepted citations.
  - [ ] Triggers a browser file download of the `.docx` file.

---

## States and Boundaries

- **Empty Setup State:** Initial view before files are chosen. `Run Evidence Audit` button is disabled until at least a draft document is uploaded.
- **Processing State:** While analyzing, UI displays animated step indicators (*Extracting document text → Detecting claims → Searching sources → Verifying evidence*).
- **Default Dashboard State:** Dashboard loads with the first detected claim automatically selected in the Evidence Inspector.
- **No Evidence Found State:** When no supporting passage is found in local PDFs or external APIs, the inspector displays:
  - Header badge: `Unsupported / No Evidence Found`
  - Explanatory note: *"No verified supporting passage was found in your uploaded library or scholarly databases."*
  - Available actions: `Ignore / Dismiss Highlight`.
- **Contradictory Evidence State:** When source evidence contradicts the statement:
  - Header badge: `Contradictory Evidence Detected`
  - Inspector displays the conflicting passage highlighted in red and warns the author that the source argues the opposite.
- **All Resolved State:** When all claims have been either accepted or ignored, the document canvas displays a confirmation banner: *"All claims audited. Ready to export."*
- **Persistence:** In-session state (files, claims, decisions) persists in memory; reloading resets the audit session for the PoC.

---

## Product Decisions

- **Two-Screen Architecture:** Chose a clean Setup screen followed by a split-screen Dashboard rather than modal dialogs or a multi-tab wizard, keeping the interaction fast and focused on the document.
- **Exact Passage Traceability over Broad Relevance:** We require displaying the exact quoted sentence and page/section rather than just returning a paper link, cementing EvidenceAI's core differentiator.
- **Round-Trip DOCX Export:** Prioritizing DOCX export over PDF or LaTeX because Word compatibility directly serves the target student/researcher audience.
- **In-Memory Session for Hackathon PoC:** Audits run within the active session without requiring complex multi-user database synchronization for the initial demo.

---

## What We're Building
- Screen 1 (Project Setup) with dual dropzones and analysis trigger.
- Screen 2 (Audit Dashboard) with 60/40 split-screen layout.
- Highlighting system supporting Green, Yellow, Red, and Resolved Grey states.
- Evidence Inspector displaying exact quoted passages, source locations, and support badges.
- One-click `Accept Citation` inserting inline markers and updating the live bibliography.
- Round-trip DOCX file generator and exporter.

---

## Deferred From the POC
- **Live Collaborative Editing:** Multi-researcher concurrent document editing.
- **Native LaTeX / Overleaf Sync:** Round-trip `.tex` compilation and `.bib` synchronization.
- **Custom User Citation Style Engine:** Full CSL (Citation Style Language) customizable XML editor.

---

## Non-Goals
- **General Reference Finder:** EvidenceAI is not a generic keyword search engine for papers; it only searches in response to specific claims requiring proof.
- **Automated Text Rewriting:** EvidenceAI does not rewrite paper arguments; it verifies claims and places citations while keeping the author's voice intact.
- **Unverified Hallucinated Citations:** The system will never generate a citation without backing evidence from an uploaded PDF or structured API result.

---

## Open Questions
- None blocking specification. Ready to transition into technical blueprint in `4-spec`.
