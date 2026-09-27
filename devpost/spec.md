---
doc: spec
status: approved
---

# EvidenceAI — Technical Specification

An AI-powered academic evidence auditor and citation assistant that verifies claims in research papers against user-provided PDFs and scholarly literature, inserting verified citations and exporting a clean, formatted DOCX.

---

## How This Works, In Plain Language

EvidenceAI is built as a client-server web application with a clear separation of concerns:

1. **User Interface (React + Vite + TypeScript + Tailwind CSS):** A responsive SPA providing two clear views: a **Project Setup** view for file uploads and a 60/40 split-screen **Audit Dashboard**. The left pane renders the document with color-coded interactive claim highlights and a live bibliography; the right pane displays the active claim's evidence, quoted passages, and verification badges.
2. **Backend Server (FastAPI / Python):** Exposes REST endpoints for document ingestion, claim detection, passage retrieval, verification, and round-trip DOCX generation.
3. **Document Ingestion Engine (`python-docx` & `pypdf`):** Extracts text from uploaded draft documents and library PDFs, tracking paragraph indices and page numbers so every extracted piece of text remains spatially grounded.
4. **AI Reasoning Engine (`google-genai` SDK):** Uses Gemini models with structured Pydantic schemas to:
   - Parse draft paragraphs and extract verifiable claims (factual, statistical, scientific).
   - Evaluate claim-evidence relationships to assign support strength (`Strong`, `Partial`, `Weak`, `Contradictory`, `Unsupported`).
5. **Hybrid Evidence Retriever:** Chunks user-uploaded PDFs and uses lexical/semantic matching to find candidate passages first. If no supporting text is found locally, it queries the OpenAlex REST API for relevant academic literature and abstracts.
6. **Round-Trip DOCX Generator:** Modifies the original DOCX file's underlying XML/run structure using `python-docx` to insert citation markers at the exact sentence locations while preserving fonts and document styling, appending an academic References section at the end.

---

## The Core Journey Through the System
*PRD ref:* `prd.md > The Core Journey`

1. **Upload & Ingestion:** The user selects a draft file (`.docx` or `.pdf`) and reference PDFs in the React UI. On clicking "Run Evidence Audit", files are sent via `multipart/form-data` to FastAPI's `/api/audit` endpoint.
2. **Parsing & Chunking:** FastAPI extracts text paragraphs with indices from the draft paper. Reference PDFs are parsed into chunked passages with document title, page number, and section context.
3. **Claim Detection:** The draft paragraphs are passed to Gemini via `google-genai` using a strict Pydantic `ClaimList` response schema. Gemini extracts discrete claims, their paragraph index, sentence text, and citation need.
4. **Evidence Retrieval & Scoring:** For each claim:
   - System scans the user's uploaded library chunks.
   - If a candidate passage is identified, Gemini evaluates the claim against the passage using a structured `VerificationResult` schema (`support_level`, `confidence`, `reasoning`, `exact_passage`).
   - If no local passage meets support threshold, system calls OpenAlex API (`https://api.openalex.org/works?search={claim_keywords}`) to fetch candidate abstracts and verifies those.
5. **Dashboard Rendering:** The backend returns an `AuditPayload` JSON object. The React frontend renders the Audit Dashboard: claims are highlighted in the document canvas with color-coded badges (Green, Yellow, Red).
6. **Inspection & Acceptance:** The user clicks a claim in the left canvas. The right inspector displays the extracted snippet, page location, source citation, and support badge. Clicking "Accept Citation" updates the local state: the claim turns grey (resolved), the in-text citation marker is displayed inline, and the reference entry appears in the live bibliography.
7. **DOCX Export:** Clicking "Export DOCX" sends the accepted citation list to FastAPI `/api/export-docx`. The server loads the original document, locates target paragraphs, safely appends citation runs, adds the References section, and streams back the downloadable `.docx` file.

---

## Stack

- **Frontend Framework:** React 18, Vite 5, TypeScript 5.
  - *Rationale:* Fast development loop, strong typing for complex claim/evidence payloads, and clean state management for split-screen navigation.
  - *Docs:* [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Frontend Styling & UI:** Tailwind CSS 3, Lucide React (icons).
  - *Rationale:* Rapid utility-first styling adhering to the calm, academic Overleaf-inspired aesthetic.
  - *Docs:* [Tailwind CSS](https://tailwindcss.com/docs)
- **Backend Framework:** Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
  - *Rationale:* High-performance async REST API, native Pydantic validation for structured LLM inputs/outputs.
  - *Docs:* [FastAPI](https://fastapi.tiangolo.com/), [Pydantic](https://docs.pydantic.dev/)
- **AI / LLM SDK:** Google GenAI SDK (`google-genai`).
  - *Model:* `gemini-2.5-flash` (or `gemini-1.5-flash`).
  - *Rationale:* First-class support for Structured Outputs (`response_schema`) ensuring type-safe JSON without parser crashes.
  - *Docs:* [Google GenAI Python SDK](https://github.com/google-gemini/generative-ai-python)
- **Document Processing:** `python-docx` (DOCX parsing and XML run manipulation), `pypdf` (PDF text and page extraction).
  - *Rationale:* Industry standard Python libraries for reliable file parsing without heavyweight native dependencies.
  - *Docs:* [python-docx](https://python-docx.readthedocs.io/), [pypdf](https://pypdf.readthedocs.io/)
- **External Literature API:** OpenAlex API.
  - *Rationale:* Fully open, free, unauthenticated academic catalog of 250M+ works with fast keyword search.
  - *Docs:* [OpenAlex API Docs](https://docs.openalex.org/)

---

## Where It Runs and How Someone Tries It

- **Runtime:** Local processes.
  - Backend: Python virtual environment running FastAPI on `http://localhost:8000`.
  - Frontend: Node.js running Vite dev server on `http://localhost:5173`.
- **Environment Requirements:**
  - Node.js 18+ and Python 3.11+.
  - `GEMINI_API_KEY`: Defined in local `.env` (ignored by git).
- **Exact Start Commands:**
  1. Backend:
     ```bash
     cd backend
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     pip install -r requirements.txt
     uvicorn main:app --reload --port 8000
     ```
  2. Frontend:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
  3. Open browser to `http://localhost:5173`.
- **Submission Recording:** The local application will be recorded running on screen demonstrating the full flow: file upload, audit processing, split-screen inspection, citation acceptance, and DOCX download.

---

## Look and Feel
*PRD ref:* `prd.md > Look and Feel`

- **Typography:** Inter / sans-serif for UI chrome, controls, and badges; Merriweather / serif typography for the document canvas to simulate an authentic academic paper.
- **Palette:**
  - Background: Neutral warm white (`#f8fafc` / `#ffffff`) with slate border accents (`#e2e8f0`).
  - Supported Status: Emerald green (`#d1fae5` bg, `#10b981` border/badge, `#065f46` text).
  - Needs Review: Amber yellow (`#fef3c7` bg, `#f59e0b` border/badge, `#92400e` text).
  - Contradictory / Unsupported: Rose red (`#fee2e2` bg, `#ef4444` border/badge, `#991b1b` text).
  - Resolved Citation: Slate grey (`#f1f5f9` bg, `#64748b` text).
- **Tone:** Academic, clear, objective, and clutter-free.

---

## Components

### 1. Ingestion & Parser Service (`backend/services/parser.py`)
- *PRD ref:* `prd.md > Features and Behavior > 1. Document & Evidence Ingestion`
- Extracts ordered paragraphs and assigns stable zero-based indices from DOCX/PDF files.
- Extracts text chunks from uploaded reference PDFs, attaching document metadata (filename, page number, approximate section header).

### 2. Claim Extraction Engine (`backend/services/claims.py`)
- *PRD ref:* `prd.md > Features and Behavior > 2. Claim Identification & Canvas Highlighting`
- Sends paragraph text to Gemini with a Pydantic schema (`ClaimItem`: `claim_id`, `paragraph_idx`, `sentence_text`, `claim_type`, `requires_citation`).
- Filters out common knowledge and focuses on factual, empirical, statistical, and scientific claims.

### 3. Evidence Matcher & Verifier (`backend/services/verifier.py`)
- *PRD ref:* `prd.md > Features and Behavior > 3. Exact Passage Retrieval & Support Verification`
- First performs keyword/BM25 matching against the reference PDF text chunks.
- If a candidate chunk is found, prompts Gemini via `google-genai` with `VerificationResponse` schema to grade support strength (`Strong`, `Partial`, `Contradictory`, `Unsupported`), extract the exact supporting quote, and articulate rationale.
- If no local chunk qualifies, calls OpenAlex search API, extracts top work abstract and metadata, and performs verification against the abstract.

### 4. Round-Trip DOCX Service (`backend/services/docx_exporter.py`)
- *PRD ref:* `prd.md > Features and Behavior > 5. Round-Trip DOCX Export`
- Deeply inspects paragraph runs in the original `.docx`.
- Finds the target sentence boundary in the specified paragraph.
- Appends or inserts a new run with formatted in-text citation text (e.g., ` (Rahman, 2025)`) inheriting the paragraph's base font family and size.
- Adds a page break or spacing, creates a `Heading 1` "References" element, and appends formatted alphabetical bibliographic entries.

### 5. Frontend Document Canvas (`frontend/src/components/DocumentCanvas.tsx`)
- *PRD ref:* `prd.md > Screens and Layout > Screen 2: Audit Dashboard`
- Renders the paragraphs of the draft paper.
- Splices claim highlights into paragraph text using start/end offsets or sentence matching.
- Renders inline citation tags once accepted.
- Houses the bottom "References" view.

### 6. Frontend Evidence Inspector (`frontend/src/components/EvidenceInspector.tsx`)
- *PRD ref:* `prd.md > Screens and Layout > Screen 2: Audit Dashboard`
- Displays active claim details: status badge, source origin (User PDF vs OpenAlex), exact quoted passage, page coordinate, and verification rationale.
- Action buttons: `Accept Citation` and `Ignore`.

---

## Data Model

```typescript
// Shared TypeScript / Pydantic schema
export type SupportLevel = 'Strong' | 'Partial' | 'Contradictory' | 'Unsupported';

export interface SourceReference {
  id: string;
  sourceType: 'user_pdf' | 'scholarly_api';
  title: string;
  authors: string[];
  year: number;
  location?: string; // e.g., "Page 8, Section 4.2"
  exactPassage?: string;
  formattedCitation: string; // e.g. "(Rahman et al., 2025)"
  formattedBibEntry: string; // Full APA reference entry
}

export interface Claim {
  id: string;
  paragraphIdx: number;
  sentenceText: string;
  claimType: 'factual' | 'statistical' | 'scientific';
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
```

---

## File Structure

```
evidence-ai/
├── .gitignore
├── devpost/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── backend/
│   ├── main.py                     # FastAPI application entrypoint & API routes
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, google-genai, python-docx, pypdf)
│   ├── config.py                   # Environment config (API keys, CORS)
│   ├── models/
│   │   └── schemas.py              # Pydantic schemas for claims, evidence, verification
│   └── services/
│       ├── parser.py               # PDF and DOCX text & paragraph extraction
│       ├── claims.py               # Gemini claim detection service
│       ├── verifier.py             # Hybrid PDF search & Gemini claim-evidence verification
│       ├── scholarly.py            # OpenAlex API search client
│       └── docx_exporter.py        # Round-trip python-docx citation & bibliography insertion
└── frontend/
    ├── package.json                # React, Vite, Tailwind, Lucide dependencies
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx                 # View switcher (Setup vs Dashboard)
        ├── main.tsx
        ├── types/
        │   └── index.ts            # TypeScript interfaces for claims, evidence, audit state
        ├── components/
        │   ├── ProjectSetup.tsx    # Screen 1: Dual dropzones & Run Audit button
        │   ├── AuditDashboard.tsx  # Screen 2: Split-screen container & top header
        │   ├── DocumentCanvas.tsx  # Left 60%: Highlighted text & live references
        │   ├── EvidenceInspector.tsx # Right 40%: Claim details, quote snippet, accept/reject
        │   └── StatusBadge.tsx     # Color-coded support pill badge
        └── services/
            └── api.ts              # Fetch client communicating with FastAPI
```

---

## External Services and Dependencies

1. **Google Gemini API (`google-genai` SDK):**
   - *Endpoint:* Gemini Generate Content API via official SDK.
   - *Usage:* Claim extraction from paragraphs, passage verification scoring.
   - *Key:* `GEMINI_API_KEY` in `backend/.env`.
   - *Cost:* Free tier / standard pay-as-you-go.
2. **OpenAlex API:**
   - *Endpoint:* `GET https://api.openalex.org/works?search={query}&per_page=3`
   - *Key:* No API key required (public). Politeness header: `mailto:your-email@domain.com`.
   - *Rate Limit:* 10 requests per second.

---

## Important Failure Modes

1. **DOCX Formatting Corruption during Run Insertion:**
   - *Failure:* Splicing citations into complex XML runs damages table, font, or list styles.
   - *Fallback:* Safe Run Appending. We locate the target paragraph and append the citation as a dedicated text run with identical character properties, rather than rebuilding the entire XML document tree from scratch.
2. **OpenAlex Rate Limit / Empty Result:**
   - *Failure:* Network outage or no matching external scholarly work found.
   - *Fallback:* Gracefully falls back to an "Unsupported" state in the UI, prompting the user to inspect the claim or upload a specific reference PDF to their Evidence Library.
3. **LLM Output Formatting / Schema Deviation:**
   - *Failure:* LLM returns unparseable JSON for claims or verification scores.
   - *Fallback:* Gemini's native `response_schema` enforcement via Pydantic models guarantees 100% compliant JSON responses.

---

## What Was Simplified and Why

- **In-Memory Session Audit:** Kept data in session memory instead of setting up a PostgreSQL/Firestore database to avoid external infrastructure friction during the hackathon build.
- **Local Lexical/Semantic PDF Retrieval:** Used chunk-based sliding window retrieval with Gemini verification rather than spinning up an external vector database (Pinecone/Milvus), keeping the PoC self-contained and fast to spin up locally.
- **OpenAlex Abstracts as External Evidence:** Relied on OpenAlex work titles and indexed abstracts for external verification rather than full-text PDF crawling of arbitrary paywalled papers.

---

## Decisions and Open Issues

### Decisions Made:
- **FastAPI + React SPA:** Selected to give the strongest foundation for high-fidelity split-screen interactions while retaining Python's rich document manipulation capabilities.
- **Pydantic Structured Outputs:** Enforced across all LLM calls to prevent JSON parsing bugs.
- **Round-Trip DOCX Integrity:** Focused attention on clean run insertion in `python-docx` to avoid document corruption.

### One Useful Unknown Clarified:
- **Round-Trip DOCX Precision:** Inserting citations into existing Word documents can easily break formatting if done via raw XML regex. Using `python-docx` run-level manipulation (`paragraph.add_run(" (Rahman, 2025)")`) preserves existing run styles, maintains paragraph numbering, and cleanly isolates added text.

### Open Questions:
- None blocking build. Ready to transition into ordered working steps in `5-build`.
