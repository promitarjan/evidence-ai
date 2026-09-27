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
            "paragraphs": paragraphs[:5],  # Preview first 5 paragraphs
            "reference_sources": parsed_references
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
