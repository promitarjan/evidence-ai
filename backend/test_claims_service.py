from pathlib import Path
from models.schemas import DocumentParagraph
from services.claims import extract_claims

def test_claims_extraction():
    paragraphs = [
        DocumentParagraph(
            index=0,
            text="Rice is an essential staple crop that sustains over two billion people across Asia. "
                 "Bangladesh is one of the world's most climate-vulnerable countries due to its low elevation and river delta topography."
        ),
        DocumentParagraph(
            index=1,
            text="Over the last three decades, extreme temperature variability has significantly disrupted national crop yields. "
                 "Recent field trials indicate that high temperature stress during the flowering stage reduces rice grain fertility by as much as 25%."
        ),
        DocumentParagraph(
            index=2,
            text="Rice accounts for approximately 70% of agricultural land use in Bangladesh. "
                 "Despite rapid technological modernization in irrigation systems, rural farmer adaptation remains constrained by seasonal flood risks."
        )
    ]

    claims = extract_claims(paragraphs)
    print(f"Extracted {len(claims)} claims:")
    for c in claims:
        print(f"  [{c.id}] Para #{c.paragraphIdx} ({c.claimType}, {c.supportLevel}): {c.sentenceText[:60]}...")

    assert len(claims) >= 2, "Expected at least 2 extracted claims"
    assert any(c.paragraphIdx == 1 for c in claims), "Expected claim in paragraph 1"
    assert all(c.claimType in ["factual", "statistical", "scientific"] for c in claims)
    print("\n✓ CLAIM EXTRACTION MECHANICAL VERIFICATION PASSED!")

if __name__ == "__main__":
    test_claims_extraction()
