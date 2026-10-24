# EvidenceAI 🔍

> **“Don’t just cite. Prove your claims.”**  
> An academic evidence auditor and citation integrity platform that connects statements to verifiable evidence across the complete chain: **Claim → Evidence → Verification → Citation**.

Built for the **Devpost Learn: Build With AI** hackathon.

---

## 🌟 Overview

Most AI writing assistants generate citations that look plausible but are ungrounded or hallucinated. **EvidenceAI** flips the model: instead of generating ungrounded text and citations, it acts as an **evidence auditor** for research papers and essays.

1. **Ingest Draft & Library:** Upload your research draft (`.docx` or `.pdf`) alongside your reference source library (PDFs).
2. **Claim Extraction:** Analyzes paragraphs to detect empirical, statistical, and factual assertions requiring citations.
3. **Exact Evidence Grounding:** Searches uploaded reference PDFs for verbatim supporting passages with page numbers; automatically falls back to the **OpenAlex** catalog (250M+ scientific papers) for ungrounded claims.
4. **Support Verification:** Grades claim-evidence pairs (`Strong`, `Partial`, `Contradictory`, `Unsupported`) with confidence scores and reasoning.
5. **Interactive Audit Dashboard:** Split-screen interface (60% Document Canvas / 40% Evidence Inspector) with color-coded highlights.
6. **Multi-Style In-Text Citations:** Accept verified citations to inject inline markers (`(Author, Year)` or numeric `[1]`) and populate a live bibliography (APA 7, MLA 9, IEEE).
7. **Round-Trip DOCX Export:** Generates a clean Word document with citations inserted at run-level—preserving all original document styles, headings, and formatting—with a formatted References section appended.

---

## 🏗️ Architecture & Pipeline

```text
[ Draft (.docx/.pdf) ] + [ Reference Library (.pdf) ]
                    │
                    ▼
       ┌──────────────────────────┐
       │ Ingestion & Parser (API) │
       └────────────┬─────────────┘
                    │
                    ▼
       ┌──────────────────────────┐
       │  Gemini Claim Extractor  │ ──► [Structured JSON / Heuristic Fallback]
       └────────────┬─────────────┘
                    │
                    ▼
       ┌──────────────────────────┐
       │ Hybrid Evidence Verifier │ ──► [Local PDF Chunks + OpenAlex API]
       └────────────┬─────────────┘
                    │
                    ▼
       ┌──────────────────────────┐
       │ Split-Screen Dashboard   │ ──► [Document Canvas + Evidence Inspector]
       └────────────┬─────────────┘
                    │
                    ▼
       ┌──────────────────────────┐
       │ Round-Trip DOCX Exporter │ ──► [Verified .docx with In-Text Citations & Bib]
       └──────────────────────────┘
```

---

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python 3.12, FastAPI, Uvicorn, Pydantic v2
- **Document & PDF Processing:** `python-docx` (run-level XML manipulation), `pypdf` (spatial chunk extraction)
- **AI & Evidence Grounding:**
  - Google Gemini API (`gemini-2.5-flash` via `google-genai` SDK with Structured Outputs)
  - OpenAlex API (free, open-access academic literature index)
  - Built-in deterministic regex & heuristic fallback engine for offline execution

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Python:** Version 3.10 or higher (Python 3.12 recommended)
- **Node.js:** Version 18 or higher (Node 20+ recommended) & `npm`
- **Git**

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<YOUR_USERNAME>/evidence-ai.git
cd evidence-ai
```

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables (Bring Your Own Key):
   This repository intentionally **does not contain any hardcoded API keys**.

   Copy the example environment file:
   - **Windows:**
     ```powershell
     copy .env.example .env
     ```
   - **macOS / Linux:**
     ```bash
     cp .env.example .env
     ```

   Open `.env` in any text editor and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

   > 💡 **Offline / Free Mode:** If you do not provide a `GEMINI_API_KEY`, EvidenceAI will automatically run using its built-in **deterministic academic heuristic extractor**. The OpenAlex scholarly fallback requires no API key.

5. Start the backend development server:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
   The backend will start at `http://127.0.0.1:8000`. You can verify health at `http://127.0.0.1:8000/api/health`.

---

### 3. Frontend Setup (React + Vite)

1. Open a **new terminal** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```
   *(The Vite development server is preconfigured to proxy `/api` calls directly to `http://127.0.0.1:8000`).*

---

## 🧪 Trying the Application (1-Click Sample Audit)

You can try the full end-to-end loop immediately using bundled test data:

1. **Open the app:** Navigate to `http://localhost:5173`.
2. **Load Sample Data:** Click the **"Load Sample Paper & Evidence"** button on the Project Setup page. This loads a pre-packaged draft paper (`sample_paper.docx`) and an empirical reference study (`rahman_2025_reference.pdf`).
3. **Run Audit:** Click **"Run Evidence Audit"**.
4. **Inspect Claims:** 
   - The screen transitions to the **Audit Dashboard**.
   - Review color-coded highlights in the left **Document Canvas**:
     - 🟢 **Green:** Strongly supported by source evidence.
     - 🟡 **Yellow:** Partial evidence / requires review.
     - 🔴 **Red:** Unsupported or contradictory assertion.
5. **Review Evidence:** Click on any highlighted sentence to view its exact quoted passage, page number, confidence percentage, and reasoning in the right **Evidence Inspector**.
6. **Accept Citations:** Click **"Accept Citation"** on verified claims:
   - The highlight turns resolved grey.
   - An in-text citation marker (e.g., `(Rahman, 2025)`) is inserted directly into the document preview.
   - The citation is automatically formatted and appended to the live **Bibliography** below.
7. **Switch Citation Styles:** Toggle between **APA 7**, **MLA 9**, and **IEEE** in the top bar to watch citations update dynamically across both the text and bibliography.
8. **Export Verified Document:** Click **"Export DOCX with Citations"** in the top-right header to download a clean `.docx` file containing the original formatting, body paragraphs with inserted citations, and an appended academic References section.

---

## 📂 Project Structure

```text
evidence-ai/
├── backend/
│   ├── models/
│   │   └── schemas.py          # Pydantic data contracts (Claim, Evidence, AuditPayload)
│   ├── services/
│   │   ├── parser.py           # DOCX & PDF paragraph/chunk spatial parsers
│   │   ├── claims.py           # Gemini Structured Outputs & universal heuristic extractor
│   │   ├── verifier.py         # Local PDF chunk matcher & evidence verification engine
│   │   ├── scholarly.py        # OpenAlex academic API search client
│   │   └── docx_exporter.py    # Non-destructive run-level Word document generator
│   ├── test_data/              # Sample papers and ground-truth reference PDFs
│   ├── config.py               # Environment configuration
│   ├── main.py                 # FastAPI application routes (/api/audit, /api/export-docx, etc.)
│   └── requirements.txt        # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectSetup.tsx      # Dual-zone file upload & sample loader
│   │   │   ├── AuditDashboard.tsx    # Split-screen audit workspace & style picker
│   │   │   ├── DocumentCanvas.tsx    # Interactive text preview with highlight spans
│   │   │   ├── EvidenceInspector.tsx # Passage quotes, location, and verification badges
│   │   │   └── StatusBadge.tsx       # Visual indicators for support levels
│   │   ├── services/
│   │   │   └── api.ts                # Backend API client
│   │   ├── utils/
│   │   │   └── citationStyles.ts     # APA 7, MLA 9, and IEEE formatters
│   │   ├── types/                    # Shared TypeScript interfaces
│   │   └── App.tsx                   # Main SPA container
│   ├── vite.config.ts                # Vite config with backend API reverse proxy
│   └── package.json                  # Frontend dependencies
├── devpost/
│   ├── scope.md                # Hackathon scope definition & MVP boundaries
│   ├── prd.md                  # Product requirements document
│   ├── spec.md                 # Technical architecture specification
│   ├── checklist.md            # Verified 5-slice implementation checklist
│   └── app-map.html            # Standalone visual architecture map & code route
└── README.md                   # Project documentation & setup instructions
```

---

## 🔒 Security & Privacy

- **No Hardcoded Secrets:** All API keys are loaded strictly from environment variables (`.env`).
- **Git Protection:** Personal learner profiles and local `.env` files are excluded in `.gitignore` and have never been committed to repository history.
- **Graceful Fallbacks:** External APIs (Gemini, OpenAlex) have timeout guards and offline fallbacks to prevent hangs or UI blocking.

---

## 📖 Planning & Design Documentation

For a detailed look at the planning-first engineering process behind EvidenceAI, explore the documents in `devpost/`:
- **[Scope Document](devpost/scope.md):** 9-feature MVP boundary and unique kernel.
- **[Product Requirements Document (PRD)](devpost/prd.md):** User journeys, canvas interactions, and acceptance criteria.
- **[Technical Specification](devpost/spec.md):** Data models, component boundaries, and failure mode mitigations.
- **[Build Checklist](devpost/checklist.md):** The step-by-step verified implementation history.
- **[App Map](devpost/app-map.html):** Interactive HTML map with architecture diagrams and key code routes (open in any browser).

---

## 📄 License

This project was developed for educational and hackathon submission purposes under the **Devpost Learn: Build With AI** program.
