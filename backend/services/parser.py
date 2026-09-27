import io
from typing import List, Dict, Any
from pypdf import PdfReader
from docx import Document
from models.schemas import DocumentParagraph

def parse_draft_docx(file_bytes: bytes) -> List[DocumentParagraph]:
    """Extract non-empty paragraphs from a DOCX file with sequential zero-based indices."""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs: List[DocumentParagraph] = []
    idx = 0
    for p in doc.paragraphs:
        clean_text = p.text.strip()
        if clean_text:
            paragraphs.append(DocumentParagraph(index=idx, text=clean_text))
            idx += 1
    return paragraphs

def parse_draft_pdf(file_bytes: bytes) -> List[DocumentParagraph]:
    """Extract paragraphs from a PDF file with sequential zero-based indices."""
    reader = PdfReader(io.BytesIO(file_bytes))
    paragraphs: List[DocumentParagraph] = []
    idx = 0
    for page_idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        # Split on double newline or strong paragraph breaks
        blocks = page_text.split("\n\n")
        for block in blocks:
            # Clean internal excessive line breaks
            cleaned = " ".join(line.strip() for line in block.splitlines() if line.strip())
            if len(cleaned) > 20:  # avoid headers/page numbers
                paragraphs.append(DocumentParagraph(index=idx, text=cleaned))
                idx += 1
    return paragraphs

def parse_draft_document(file_bytes: bytes, filename: str) -> List[DocumentParagraph]:
    """Route document parsing based on file extension."""
    lower_name = filename.lower()
    if lower_name.endswith(".docx"):
        return parse_draft_docx(file_bytes)
    elif lower_name.endswith(".pdf"):
        return parse_draft_pdf(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {filename}. Please upload a .docx or .pdf file.")

def parse_reference_pdf(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Parse a reference PDF into traceable evidence chunks with page numbers.
    Each chunk retains document title and exact page coordinates.
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    chunks: List[Dict[str, Any]] = []
    
    for page_idx, page in enumerate(reader.pages):
        page_num = page_idx + 1
        page_text = page.extract_text() or ""
        lines = [line.strip() for line in page_text.splitlines() if line.strip()]
        if not lines:
            continue
            
        full_page = " ".join(lines)
        # Create sliding window or paragraph chunks (~100-250 words)
        words = full_page.split()
        if not words:
            continue
            
        chunk_size = 180
        overlap = 40
        i = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            chunks.append({
                "source_file": filename,
                "page": page_num,
                "text": chunk_text
            })
            if i + chunk_size >= len(words):
                break
            i += (chunk_size - overlap)
            
    return chunks
