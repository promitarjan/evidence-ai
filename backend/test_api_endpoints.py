import os
from pathlib import Path
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    data = response.json()
    assert data["status"] == "ok"
    print("✓ /api/health passed")

def test_sample_files():
    res1 = client.get("/api/sample/draft")
    assert res1.status_code == 200
    assert len(res1.content) > 100
    print("✓ /api/sample/draft passed")

    res2 = client.get("/api/sample/reference")
    assert res2.status_code == 200
    assert len(res2.content) > 100
    print("✓ /api/sample/reference passed")

def test_parse_documents():
    test_dir = Path(__file__).parent / "test_data"
    docx_path = test_dir / "sample_paper.docx"
    pdf_path = test_dir / "rahman_2025_reference.pdf"

    with open(docx_path, "rb") as f_docx, open(pdf_path, "rb") as f_pdf:
        files = [
            ("draft_file", ("sample_paper.docx", f_docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            ("reference_files", ("rahman_2025_reference.pdf", f_pdf, "application/pdf"))
        ]
        response = client.post("/api/parse", files=files)
        assert response.status_code == 200, f"Parse failed: {response.text}"
        data = response.json()
        assert data["status"] == "success"
        assert data["paragraph_count"] >= 3
        assert len(data["reference_sources"]) >= 1
        assert data["reference_sources"][0]["chunk_count"] >= 1
        print(f"✓ /api/parse passed ({data['paragraph_count']} paragraphs, {data['reference_sources'][0]['chunk_count']} reference chunks)")

if __name__ == "__main__":
    print("Running mechanical verification for Slice 1...")
    test_health()
    test_sample_files()
    test_parse_documents()
    print("\nALL MECHANICAL VERIFICATIONS FOR SLICE 1 PASSED!")
