from pathlib import Path
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_audit_with_evidence():
    test_dir = Path(__file__).parent / "test_data"
    docx_path = test_dir / "sample_paper.docx"
    pdf_path = test_dir / "rahman_2025_reference.pdf"

    with open(docx_path, "rb") as f_docx, open(pdf_path, "rb") as f_pdf:
        files = [
            ("draft_file", ("sample_paper.docx", f_docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            ("reference_files", ("rahman_2025_reference.pdf", f_pdf, "application/pdf"))
        ]
        res = client.post("/api/audit", files=files)
        assert res.status_code == 200, f"Audit failed: {res.text}"
        data = res.json()
        
        claims = data["claims"]
        print(f"Audited {len(claims)} claims:")
        
        has_local_evidence = False
        for c in claims:
            ev = c.get("evidence")
            ev_title = ev["title"] if ev else "None"
            ev_type = ev["sourceType"] if ev else "none"
            print(f"  [{c['id']}] Level: {c['supportLevel']} | Source: {ev_title} ({ev_type})")
            if ev and ev_type == "user_pdf":
                has_local_evidence = True

        assert has_local_evidence, "Expected at least one claim supported by user-uploaded reference PDF"
        print("\n✓ FULL END-TO-END AUDIT ENDPOINT VERIFIED WITH HYBRID EVIDENCE RETRIEVAL!")

if __name__ == "__main__":
    test_full_audit_with_evidence()
