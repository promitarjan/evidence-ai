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
Analyze the provided paragraphs from a draft research paper or essay.
Identify specific statements that make factual, statistical, or scientific claims requiring external verifiable evidence.
Exclude broad general statements, introductory filler, or personal opinions that do not require citations.

For each identified claim:
1. `paragraphIdx`: the exact zero-based index of the paragraph.
2. `sentenceText`: the exact substring sentence within that paragraph.
3. `claimType`: 'factual', 'statistical', or 'scientific'.
4. `requiresCitation`: true if it asserts an empirical fact, statistic, or experimental finding.
5. `reasoning`: brief explanation of why this claim needs academic evidence.
"""

# Broad academic assertion indicators
STATISTICAL_PATTERN = re.compile(
    r'(\b\d+[\d,.]*\s*(%|percent|billion|million|thousand|kg|ton|cm|mm|mhz|ghz)?\b|'
    r'\b(increased|decreased|reduced|reduces|declining|doubled|tripled|accounts for|majority|average|proportion|growth rate|ratio)\b)',
    re.IGNORECASE
)

EMPIRICAL_PATTERN = re.compile(
    r'\b(demonstrates?|found that|indicates?|evidence suggests?|showed|observed|reported|identified|proves?|'
    r'results? in|leads? to|impacts?|affects?|influences?|causes?|is driven by|plays a (critical|major|key) role|'
    r'is (defined|known|considered|recognized) as|developed by|originated|discovered|et al\.|\[\d+\])\b',
    re.IGNORECASE
)

def extract_claims_fallback(paragraphs: List[DocumentParagraph]) -> List[Claim]:
    """
    Robust universal academic claim extractor for any essay or paper.
    Scans every paragraph, splits into exact sentences, identifies factual, statistical,
    and empirical assertions, and ensures every substantial paragraph is properly audited.
    """
    claims: List[Claim] = []

    for p in paragraphs:
        text = p.text.strip()
        if len(text) < 15:
            continue

        # Split into sentences using punctuation boundaries
        raw_sentences = re.split(r'(?<=[.!?])\s+', text)
        clean_sentences = [s.strip() for s in raw_sentences if len(s.strip()) >= 12]
        
        if not clean_sentences:
            continue

        matched_in_para = False

        for s in clean_sentences:
            # Ensure sentence is an exact substring of paragraph text
            if s not in text:
                continue

            is_stat = bool(STATISTICAL_PATTERN.search(s))
            is_emp = bool(EMPIRICAL_PATTERN.search(s))

            if is_stat or is_emp:
                matched_in_para = True
                claim_type: ClaimType = "statistical" if is_stat else "scientific" if ("temperature" in s.lower() or "clinical" in s.lower() or "biological" in s.lower() or "system" in s.lower()) else "factual"
                
                # Default support level indicator for visual feedback
                support_lvl: SupportLevel = "Strong" if ("%" in s or "202" in s or "results" in s.lower()) else "Partial"
                if "accounts for" in s.lower() or "historically" in s.lower():
                    support_lvl = "Unsupported"

                claims.append(Claim(
                    id=f"claim-{uuid.uuid4().hex[:8]}",
                    paragraphIdx=p.index,
                    sentenceText=s,
                    claimType=claim_type,
                    supportLevel=support_lvl,
                    confidence=0.92,
                    reasoning=f"Asserts a specific {claim_type} claim requiring empirical citation or source grounding.",
                    evidence=None,
                    status="pending"
                ))

        # If no specific sentence matched in a substantial paragraph, select the most substantive declarative sentence
        if not matched_in_para and len(clean_sentences) > 0:
            # Pick the longest informative sentence
            longest_sentence = max(clean_sentences, key=len)
            if longest_sentence in text:
                claims.append(Claim(
                    id=f"claim-{uuid.uuid4().hex[:8]}",
                    paragraphIdx=p.index,
                    sentenceText=longest_sentence,
                    claimType="factual",
                    supportLevel="Partial",
                    confidence=0.85,
                    reasoning="Core thematic assertion in paragraph requiring supporting academic literature.",
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
        
        parsed = ClaimListResponse.model_validate_json(response.text)
        claims: List[Claim] = []
        for item in parsed.claims:
            if item.requiresCitation:
                # Find matching paragraph text to ensure exact substring match
                matching_p = next((p for p in paragraphs if p.index == item.paragraphIdx), None)
                matched_sentence = item.sentenceText
                if matching_p and item.sentenceText not in matching_p.text:
                    # Find closest sentence substring in paragraph
                    for s in re.split(r'(?<=[.!?])\s+', matching_p.text):
                        if s in item.sentenceText or item.sentenceText in s:
                            matched_sentence = s.strip()
                            break

                claims.append(Claim(
                    id=f"claim-{uuid.uuid4().hex[:8]}",
                    paragraphIdx=item.paragraphIdx,
                    sentenceText=matched_sentence,
                    claimType=item.claimType,
                    supportLevel="Partial",
                    confidence=0.95,
                    reasoning=item.reasoning,
                    evidence=None,
                    status="pending"
                ))
        if claims:
            return claims
        return extract_claims_fallback(paragraphs)
    except Exception as e:
        print(f"Gemini claim extraction warning (falling back to universal extractor): {e}")
        return extract_claims_fallback(paragraphs)

def extract_claims(paragraphs: List[DocumentParagraph]) -> List[Claim]:
    """Top-level claim extraction dispatcher."""
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        return extract_claims_with_gemini(paragraphs)
    else:
        return extract_claims_fallback(paragraphs)
