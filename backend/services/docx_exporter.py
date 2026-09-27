import io
import os
from typing import List, Optional
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from models.schemas import ExportDocxRequest, AcceptedCitation

def generate_citation_docx(
    request: ExportDocxRequest,
    original_docx_bytes: Optional[bytes] = None
) -> io.BytesIO:
    """
    Safely insert accepted in-text citations into paragraph runs and append
    a formatted academic References section.
    
    Preserves original document styling and structure.
    """
    if original_docx_bytes:
        try:
            doc = Document(io.BytesIO(original_docx_bytes))
        except Exception as e:
            print(f"Warning: could not open original DOCX bytes ({e}), creating formatted document from paragraphs.")
            doc = Document()
            doc.add_heading(request.documentTitle, 0)
            for p in request.paragraphs:
                doc.add_paragraph(p.text)
    else:
        doc = Document()
        doc.add_heading(request.documentTitle, 0)
        for p in request.paragraphs:
            doc.add_paragraph(p.text)

    # 1. Map non-empty paragraphs
    non_empty_paras = [p for p in doc.paragraphs if p.text.strip()]

    # 2. Insert in-text citation runs using sentence-aware targeting
    for cit in request.acceptedCitations:
        target_p = None
        
        # Primary strategy: find the exact paragraph containing the sentence
        for p in doc.paragraphs:
            if cit.sentenceText in p.text:
                target_p = p
                break
                
        # Secondary fallback: use paragraph index
        if not target_p and cit.paragraphIdx < len(non_empty_paras):
            target_p = non_empty_paras[cit.paragraphIdx]

        if target_p:
            marker = f" {cit.formattedCitation}"
            # Check if sentence exists in paragraph text
            if cit.sentenceText in target_p.text:
                # Add formatted citation run
                run = target_p.add_run(marker)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)  # slate-700
            else:
                run = target_p.add_run(marker)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # 3. Append academic References section
    if request.acceptedCitations:
        doc.add_paragraph()  # spacing
        ref_heading = doc.add_heading("References", level=1)
        ref_heading.paragraph_format.space_before = Pt(18)
        ref_heading.paragraph_format.space_after = Pt(12)

        # Deduplicate and sort alphabetically
        unique_bibs = sorted(list({ac.formattedBibEntry for ac in request.acceptedCitations}))

        for bib in unique_bibs:
            ref_para = doc.add_paragraph()
            ref_para.paragraph_format.left_indent = Inches(0.5)
            ref_para.paragraph_format.first_line_indent = Inches(-0.5)  # Hanging indent
            ref_para.paragraph_format.space_after = Pt(6)
            
            run = ref_para.add_run(bib)
            run.font.size = Pt(10)
            run.font.name = "Calibri"

    output_stream = io.BytesIO()
    doc.save(output_stream)
    output_stream.seek(0)
    return output_stream
