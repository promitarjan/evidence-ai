---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Project Scaffold & Document Ingestion**
  Becomes usable: Running FastAPI backend and React frontend. User can land on Project Setup, drop in a draft document (DOCX/PDF) and evidence library PDFs, and trigger the parser.
  Why now: Slices 2–5 depend on having a live backend and frontend pipeline that successfully parses text paragraphs and PDF chunks with spatial coordinates.
  PRD ref: `prd.md > Screens and Layout > Screen 1: Project Setup`, `prd.md > Features and Behavior > 1. Document & Evidence Ingestion`
  Spec ref: `spec.md > Stack`, `spec.md > Components > 1. Ingestion & Parser Service`, `spec.md > File Structure`
  Build: Initialize backend (FastAPI, uvicorn, pypdf, python-docx, google-genai) and frontend (React, Vite, TypeScript, Tailwind, Lucide). Implement `/api/parse` and `/api/health`. Create ProjectSetup view with dual dropzones and Run Audit trigger.
  Verify (mechanical): Start FastAPI server on port 8000 and Vite dev server on port 5173; execute curl/test script posting sample DOCX and PDF to verify paragraph and chunk extraction.
  Learner check: Open `http://localhost:5173`, see the clean Project Setup landing page, upload a sample draft and evidence PDF, and see the file names and sizes reflected.
  Commit: `Scaffold project and implement document ingestion`

- [x] **2. Gemini Claim Extraction & Color-Coded Document Canvas**
  Becomes usable: The audit executes: Gemini extracts verifiable claims using structured JSON schema, and the user is transitioned to the Audit Dashboard with claims highlighted in green, yellow, and red.
  Why now: The visual canvas with interactive claim highlights is the foundation of the audit dashboard.
  PRD ref: `prd.md > Screens and Layout > Screen 2: Audit Dashboard`, `prd.md > Features and Behavior > 2. Claim Identification & Canvas Highlighting`
  Spec ref: `spec.md > Components > 2. Claim Extraction Engine`, `spec.md > Components > 5. Frontend Document Canvas`
  Build: Implement `backend/services/claims.py` calling Gemini with Pydantic structured output (`ClaimList`). Connect `/api/audit` endpoint to return document paragraphs with identified claims. Build `DocumentCanvas.tsx` to render text with color-coded highlight spans.
  Verify (mechanical): Run backend test script calling claim extraction on a sample paper paragraph; assert returned JSON contains claims with paragraph indices and classification.
  Learner check: Click "Run Evidence Audit" and watch the interface transition to the Audit Dashboard with highlighted claims in the document.
  Commit: `Implement claim extraction and highlighted document canvas`

- [x] **3. Exact Evidence Extraction & Verification Inspector**
  Becomes usable: Clicking any highlighted claim in the left canvas opens the Evidence Inspector on the right, displaying the exact quoted passage, page coordinates, and support badge (`Strong`, `Partial`, `Contradictory`, `Unsupported`).
  Why now: Proves the core unique kernel—grounding claims in exact source passages with Gemini verification rather than ungrounded reference generation.
  PRD ref: `prd.md > Features and Behavior > 3. Exact Passage Retrieval & Support Verification`, `prd.md > States and Boundaries > No Evidence Found State`
  Spec ref: `spec.md > Components > 3. Evidence Matcher & Verifier`, `spec.md > Components > 6. Frontend Evidence Inspector`, `spec.md > External Services and Dependencies`
  Build: Implement local PDF chunk search and OpenAlex API fallback in `backend/services/verifier.py` and `backend/services/scholarly.py`. Wire Gemini verification prompt with structured schema. Build `EvidenceInspector.tsx` and `StatusBadge.tsx` displaying exact snippet, location, and rationale.
  Verify (mechanical): Run test script with a sample claim; verify backend extracts a supporting quote from a reference PDF or OpenAlex abstract and returns valid support level.
  Learner check: Click a claim in the left canvas; inspect the right panel to see the exact quoted passage, source location, and support status badge.
  Commit: `Implement exact evidence retrieval and verification inspector`

- [x] **4. Interactive Citation Acceptance & Live Bibliography**
  Becomes usable: Clicking "Accept Citation" dynamically inserts an inline citation marker (e.g. `(Rahman, 2025)`) into the document preview, turns the highlight grey (resolved), and appends the reference to the live bibliography at the bottom.
  Why now: Closes the user interaction loop on the screen before implementing file export.
  PRD ref: `prd.md > Features and Behavior > 4. Interactive Citation Placement & Live Bibliography`
  Spec ref: `spec.md > Components > 5. Frontend Document Canvas`, `spec.md > Data Model`
  Build: Update dashboard state in `AuditDashboard.tsx` to track accepted citations. Render inline marker spans adjacent to sentences in `DocumentCanvas.tsx`. Build collapsible live `References` section at the bottom of the canvas. Implement "Ignore" action to dismiss claims.
  Verify (mechanical): Automate or simulate claim acceptance in React state; verify inline citation marker renders in DOM and reference entry appears in bibliography list.
  Learner check: Click "Accept Citation" on a verified claim; see the highlight change to grey, the `(Author, Year)` citation appear inline, and the reference appear in the bibliography below.
  Commit: `Implement inline citation placement and live bibliography`

- [x] **5. Round-Trip DOCX Generation & Export**
  Becomes usable: Clicking "Export DOCX" in the top header downloads a modified Word document with all accepted citations embedded in their proper sentences and an academic References section appended.
  Why now: The final deliverable completing the full end-to-end journey.
  PRD ref: `prd.md > Features and Behavior > 5. Round-Trip DOCX Export`
  Spec ref: `spec.md > Components > 4. Round-Trip DOCX Service`, `spec.md > Important Failure Modes > 1. DOCX Formatting Corruption`
  Build: Implement `backend/services/docx_exporter.py` using `python-docx` run-level insertion. Add `/api/export-docx` endpoint. Connect `Export DOCX` button in frontend top header to trigger file download.
  Verify (mechanical): Run Python test sending an original sample DOCX with accepted citation offsets; assert generated DOCX opens cleanly, contains inline citation runs, and includes the References heading and entries.
  Learner check: Click "Export DOCX", open the downloaded file in Microsoft Word (or viewer), and confirm citations and bibliography are cleanly placed.
  Commit: `Implement round-trip DOCX export with embedded citations and bibliography`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2: Document canvas with interactive claim highlights live in browser
- [x] Final kick-the-tires exploration and feedback completed — Slice 5: Full loop from upload to DOCX export

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Connected the Claim → Evidence → Verification → Citation pipeline across backend and frontend; verified with sample paper DOCX and reference PDF.
Route and stops: 1. `backend/services/parser.py` (spatial parsing), 2. `backend/services/claims.py` & `backend/services/verifier.py` (structured extraction & grounding), 3. `frontend/src/components/AuditDashboard.tsx` & `backend/services/docx_exporter.py` (interactive placement & round-trip export).
Edit outcome: Not applicable (learner verified build and directed transition straight to shipping).
Reflection: Reusable practice documented in app-map: pairing structured AI output schemas with deterministic fallback parsers.
Activity mode: Brief evidence-based recap.

## Revisions


