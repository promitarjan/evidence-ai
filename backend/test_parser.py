from pathlib import Path
from services.parser import parse_draft_document, parse_reference_pdf

test_dir = Path(__file__).parent / "test_data"
docx_file = test_dir / "sample_paper.docx"
pdf_file = test_dir / "rahman_2025_reference.pdf"

print("--- Testing DOCX Parsing ---")
with open(docx_file, "rb") as f:
    paras = parse_draft_document(f.read(), docx_file.name)
print(f"Parsed {len(paras)} paragraphs from DOCX:")
for p in paras:
    print(f"  [{p.index}] {p.text[:70]}...")

assert len(paras) >= 3, "Expected at least 3 paragraphs from sample DOCX"

print("\n--- Testing Reference PDF Chunking ---")
with open(pdf_file, "rb") as f:
    chunks = parse_reference_pdf(f.read(), pdf_file.name)
print(f"Parsed {len(chunks)} chunks from PDF:")
for c in chunks:
    print(f"  [Page {c['page']}] {c['text'][:70]}...")

assert len(chunks) >= 1, "Expected at least 1 chunk from sample PDF"
print("\nPARSER VERIFICATION SUCCESSFUL!")
