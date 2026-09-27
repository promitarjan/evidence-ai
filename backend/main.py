import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import GEMINI_API_KEY
from models.schemas import DocumentParagraph
from services.parser import parse_draft_document, parse_reference_pdf

app = FastAPI(title="EvidenceAI API", version="1.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "EvidenceAI API",
        "gemini_configured": bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here")
    }

@app.get("/api/sample/draft")
def get_sample_draft():
    sample_path = os.path.join(os.path.dirname(__file__), "test_data", "sample_paper.docx")
    if os.path.exists(sample_path):
        from fastapi.responses import FileResponse
        return FileResponse(sample_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename="sample_paper.docx")
    raise HTTPException(status_code=404, detail="Sample draft not found")

@app.get("/api/sample/reference")
def get_sample_reference():
    sample_path = os.path.join(os.path.dirname(__file__), "test_data", "rahman_2025_reference.pdf")
    if os.path.exists(sample_path):
        from fastapi.responses import FileResponse
        return FileResponse(sample_path, media_type="application/pdf", filename="rahman_2025_reference.pdf")
    raise HTTPException(status_code=404, detail="Sample reference PDF not found")

from services.claims import extract_claims
from services.verifier import verify_claim

@app.post("/api/audit", response_model=None)
async def audit_document(
    draft_file: UploadFile = File(...),
    reference_files: Optional[List[UploadFile]] = File(None)
):
    """
    Execute full claim audit pipeline:
    1. Parse draft document into paragraphs.
    2. Extract verifiable claims with citations needed.
    3. Parse reference PDFs into chunked passages.
    4. Verify each claim against reference chunks + OpenAlex fallback.
    5. Return full AuditPayload with exact passages and support levels.
    """
    try:
        draft_bytes = await draft_file.read()
        filename = draft_file.filename or "draft.docx"
        file_type = "pdf" if filename.lower().endswith(".pdf") else "docx"
        
        paragraphs = parse_draft_document(draft_bytes, filename)
        raw_claims = extract_claims(paragraphs)
        
        # Parse reference PDFs if provided
        all_reference_chunks = []
        if reference_files:
            for ref in reference_files:
                if ref.filename and ref.filename.lower().endswith(".pdf"):
                    ref_bytes = await ref.read()
                    chunks = parse_reference_pdf(ref_bytes, ref.filename)
                    all_reference_chunks.extend(chunks)

        # Run hybrid verification for each claim
        verified_claims = []
        for c in raw_claims:
            verified = verify_claim(c, all_reference_chunks)
            verified_claims.append(verified)
            
        doc_title = os.path.splitext(filename)[0].replace("_", " ").title()
        
        return {
            "documentTitle": doc_title,
            "originalFileType": file_type,
            "paragraphs": paragraphs,
            "claims": verified_claims
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/parse")
async def parse_documents(
    draft_file: UploadFile = File(...),
    reference_files: Optional[List[UploadFile]] = File(None)
):
    """
    Ingest and parse draft document and evidence library PDFs.
    Returns parsed paragraphs and chunk counts.
    """
    try:
        draft_bytes = await draft_file.read()
        paragraphs = parse_draft_document(draft_bytes, draft_file.filename or "draft.docx")
        
        parsed_references = []
        if reference_files:
            for ref in reference_files:
                if ref.filename and ref.filename.lower().endswith(".pdf"):
                    ref_bytes = await ref.read()
                    chunks = parse_reference_pdf(ref_bytes, ref.filename)
                    parsed_references.append({
                        "filename": ref.filename,
                        "chunk_count": len(chunks)
                    })

        return {
            "status": "success",
            "draft_filename": draft_file.filename,
            "paragraph_count": len(paragraphs),
            "paragraphs": paragraphs[:5],
            "reference_sources": parsed_references
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from models.schemas import ExportDocxRequest
from services.docx_exporter import generate_citation_docx
from fastapi.responses import StreamingResponse

@app.post("/api/export-docx")
async def export_document(request: ExportDocxRequest):
    """
    Generate and stream updated DOCX with inserted citations and bibliography.
    """
    try:
        # Check if original DOCX exists in test_data or storage
        original_bytes = None
        test_file = os.path.join(os.path.dirname(__file__), "test_data", "sample_paper.docx")
        if os.path.exists(test_file) and "sample_paper" in request.originalFileName.lower():
            with open(test_file, "rb") as f:
                original_bytes = f.read()

        docx_stream = generate_citation_docx(request, original_bytes)
        
        safe_title = "".join(c for c in request.documentTitle if c.isalnum() or c in (' ', '_', '-')).strip()
        filename = f"{safe_title}_verified.docx"
        
        return StreamingResponse(
            docx_stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
