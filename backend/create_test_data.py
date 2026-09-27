import os
from pathlib import Path
from docx import Document
from pypdf import PdfWriter

test_dir = Path(__file__).parent / "test_data"
test_dir.mkdir(exist_ok=True)

# 1. Create sample_paper.docx
doc = Document()
doc.add_heading("Climate Impacts on Rice Agriculture in South Asia", 0)

doc.add_paragraph(
    "Rice is an essential staple crop that sustains over two billion people across Asia. "
    "Bangladesh is one of the world's most climate-vulnerable countries due to its low elevation and river delta topography."
)

doc.add_paragraph(
    "Over the last three decades, extreme temperature variability has significantly disrupted national crop yields. "
    "Recent field trials indicate that high temperature stress during the flowering stage reduces rice grain fertility by as much as 25%."
)

doc.add_paragraph(
    "Rice accounts for approximately 70% of agricultural land use in Bangladesh. "
    "Despite rapid technological modernization in irrigation systems, rural farmer adaptation remains constrained by seasonal flood risks."
)

docx_path = test_dir / "sample_paper.docx"
doc.save(docx_path)
print(f"Created DOCX: {docx_path}")

# 2. Create rahman_2025_reference.pdf with valid text
# A minimal valid PDF structure with text stream
pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 285 >>
stream
BT
/F1 12 Tf
72 700 Td
(Rahman et al. 2025 - Empirical Climate Assessment in South Asian River Deltas) Tj
0 -30 Td
(Section 4.2 - Results on Thermal Stress) Tj
0 -25 Td
(Our field measurements demonstrate that increasing temperature variability was associated) Tj
0 -20 Td
(with declining rice yields, reducing grain fertility by approximately 22% to 26% during heat spells.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000580 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
649
%%EOF
"""

pdf_path = test_dir / "rahman_2025_reference.pdf"
with open(pdf_path, "wb") as f:
    f.write(pdf_content)
print(f"Created PDF: {pdf_path}")
