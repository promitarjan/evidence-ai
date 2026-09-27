from pathlib import Path
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_audit_endpoint():
    test_dir = Path(__file__).parent / "test_data"
    docx_path = test_dir / "sample_paper.docx"

    with open(docx_path, "rb") as f_docx:
        files = {
            "draft_file": ("sample_paper.docx", f_docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        }
        res = client.post("/api/audit", files=files)
        assert res.status_code == 200, f"Audit failed: {res.text}"
        data = res.json()
        assert "documentTitle" in data
        assert len(data["paragraphs"]) >= 3
        assert len(data["claims"]) >= 2
        print(f"✓ /api/audit passed: extracted {len(data['claims'])} claims across {len(data['paragraphs'])} paragraphs for document '{data['documentTitle']}'")

if __name__ == "__main__":
    test_audit_endpoint()
