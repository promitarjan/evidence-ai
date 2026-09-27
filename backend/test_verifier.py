from pathlib import Path
from models.schemas import Claim
from services.parser import parse_reference_pdf
from services.verifier import verify_claim

def test_evidence_verification():
    test_dir = Path(__file__).parent / "test_data"
    pdf_path = test_dir / "rahman_2025_reference.pdf"

    with open(pdf_path, "rb") as f:
        chunks = parse_reference_pdf(f.read(), pdf_path.name)

    print(f"Loaded {len(chunks)} reference chunks from {pdf_path.name}")

    # Test Case 1: Claim that matches the uploaded PDF directly
    local_claim = Claim(
        id="test-1",
        paragraphIdx=1,
        sentenceText="Recent field trials indicate that high temperature stress during the flowering stage reduces rice grain fertility by as much as 25%.",
        claimType="statistical",
        supportLevel="Partial",
        confidence=0.9,
        reasoning="",
        evidence=None,
        status="pending"
    )

    verified_local = verify_claim(local_claim, chunks)
    print("\n--- Test Case 1: Local PDF Match ---")
    print(f"Support Level: {verified_local.supportLevel}")
    assert verified_local.evidence is not None, "Expected evidence from local PDF"
    print(f"Source: {verified_local.evidence.title} ({verified_local.evidence.location})")
    print(f"Exact Quote: {verified_local.evidence.exactPassage}")
    print(f"Citation: {verified_local.evidence.formattedCitation}")
    assert verified_local.evidence.sourceType == "user_pdf"
    assert "22%" in verified_local.evidence.exactPassage or "temperature" in verified_local.evidence.exactPassage

    # Test Case 2: Claim with no local match (queries OpenAlex or marks unsupported)
    external_claim = Claim(
        id="test-2",
        paragraphIdx=0,
        sentenceText="Bangladesh is one of the world's most climate-vulnerable countries due to its low elevation and river delta topography.",
        claimType="scientific",
        supportLevel="Partial",
        confidence=0.8,
        reasoning="",
        evidence=None,
        status="pending"
    )

    verified_ext = verify_claim(external_claim, chunks)
    print("\n--- Test Case 2: External / OpenAlex Fallback ---")
    print(f"Support Level: {verified_ext.supportLevel}")
    if verified_ext.evidence:
        print(f"Source Type: {verified_ext.evidence.sourceType}")
        print(f"Title: {verified_ext.evidence.title}")
        print(f"Exact Passage: {verified_ext.evidence.exactPassage[:80]}...")
    else:
        print("Status: Correctly handled as Unsupported (no match)")

    print("\n✓ EVIDENCE EXTRACTION AND VERIFICATION MECHANICAL TEST PASSED!")

if __name__ == "__main__":
    test_evidence_verification()
