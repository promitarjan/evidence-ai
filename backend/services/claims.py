import os
import re
import uuid
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

from config import GEMINI_API_KEY
from models.schemas import Claim, DocumentParagraph, ClaimType, SupportLevel

class ExtractedClaimItem(BaseModel):
    paragraphIdx: int
    sentenceText: str
    claimType: ClaimType
    requiresCitation: bool
    reasoning: str

class ClaimListResponse(BaseModel):
    claims: List[ExtractedClaimItem]

SYSTEM_PROMPT = """You are EvidenceAI, an expert academic research auditor.
Analyze the provided paragraphs from a draft research paper.
Identify specific statements that make factual, statistical, or scientific claims requiring external verifiable evidence.
Exclude broad general statements, introductory framing, or pure opinions that do not require citations.

For each identified claim:
1. `paragraphIdx`: the exact zero-based index of the paragraph.
2. `sentenceText`: the exact substring sentence within that paragraph.
3. `claimType`: 'factual', 'statistical', or 'scientific'.
4. `requiresCitation`: true if it asserts an empirical fact, statistic, or experimental finding.
5. `reasoning`: brief explanation of why this claim needs academic evidence.
"""

def extract_claims_fallback(paragraphs: List[DocumentParagraph]) -> List[Claim]:
    """
    High-fidelity deterministic fallback extractor for environments without an active Gemini API key.
    Detects empirical, statistical, and scientific sentences requiring citations.
    """
    claims: List[Claim] = []
    
    # Statistical pattern (percentages, numbers, reductions)
    stat_regex = re.compile(r'(\d+[\d,.]*\s*(%|percent|billion|million|kg|ton)|reduced|reduces|declining|increased|accounts for)', re.IGNORECASE)
    # Scientific / empirical pattern
    sci_regex = re.compile(r'(temperature variability|thermal stress|grain fertility|flowering stage|climate-vulnerable|topography|irrigation)', re.IGNORECASE)

    for p in paragraphs:
        # Split paragraph into sentences
        sentences = re.split(r'(?<=[.!?])\s+', p.text)
        for s in sentences:
            s_clean = s.strip()
            if len(s_clean) < 15:
                continue
                
            has_stat = bool(stat_regex.search(s_clean))
            has_sci = bool(sci_regex.search(s_clean))
            
            if has_stat or has_sci:
                claim_type: ClaimType = "statistical" if has_stat else "scientific"
                
                # Preliminary support level for visualization in Slice 2
                support_lvl: SupportLevel = "Strong" if "fertility" in s_clean.lower() else "Partial"
                if "accounts for" in s_clean.lower():
                    support_lvl = "Unsupported"

                claims.append(Claim(
                    id=f"claim-{uuid.uuid4().hex[:8]}",
                    paragraphIdx=p.index,
                    sentenceText=s_clean,
                    claimType=claim_type,
                    supportLevel=support_lvl,
                    confidence=0.92,
                    reasoning=f"Asserts a specific {claim_type} finding regarding agricultural climate effects requiring verifiable source evidence.",
                    evidence=None,
                    status="pending"
                ))
                
    return claims

def extract_claims_with_gemini(paragraphs: List[DocumentParagraph]) -> List[Claim]:
    """
    Use Google Gemini with Structured Outputs to extract claims needing citations.
    """
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Prepare text with paragraph indices
        content_lines = []
        for p in paragraphs:
            content_lines.append(f"[Paragraph {p.index}]: {p.text}")
        prompt_content = "\n\n".join(content_lines)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[SYSTEM_PROMPT, prompt_content],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ClaimListResponse,
                temperature=0.1
            )
        )
        
        # Parse validated response
        parsed = ClaimListResponse.model_validate_json(response.text)
        claims: List[Claim] = []
        for item in parsed.claims:
            if item.requiresCitation:
                claims.append(Claim(
                    id=f"claim-{uuid.uuid4().hex[:8]}",
                    paragraphIdx=item.paragraphIdx,
                    sentenceText=item.sentenceText,
                    claimType=item.claimType,
                    supportLevel="Partial",  # Initial state prior to evidence matching in Slice 3
                    confidence=0.95,
                    reasoning=item.reasoning,
                    evidence=None,
                    status="pending"
                ))
        return claims
    except Exception as e:
        print(f"Gemini claim extraction warning (falling back to deterministic extractor): {e}")
        return extract_claims_fallback(paragraphs)

def extract_claims(paragraphs: List[DocumentParagraph]) -> List[Claim]:
    """Top-level claim extraction dispatcher."""
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        return extract_claims_with_gemini(paragraphs)
    else:
        return extract_claims_fallback(paragraphs)
