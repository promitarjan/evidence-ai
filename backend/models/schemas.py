from typing import List, Optional, Literal
from pydantic import BaseModel, Field

SupportLevel = Literal["Strong", "Partial", "Contradictory", "Unsupported"]
ClaimType = Literal["factual", "statistical", "scientific"]
SourceType = Literal["user_pdf", "scholarly_api"]

class SourceReference(BaseModel):
    id: str
    sourceType: SourceType
    title: str
    authors: List[str] = Field(default_factory=list)
    year: int = 2024
    location: Optional[str] = None  # e.g., "Page 8, Section 4.2"
    exactPassage: Optional[str] = None
    formattedCitation: str  # e.g., "(Rahman et al., 2025)"
    formattedBibEntry: str  # Full bibliographic entry

class Claim(BaseModel):
    id: str
    paragraphIdx: int
    sentenceText: str
    claimType: ClaimType
    supportLevel: SupportLevel
    confidence: float = 0.9
    reasoning: str
    evidence: Optional[SourceReference] = None
    status: Literal["pending", "accepted", "ignored"] = "pending"

class DocumentParagraph(BaseModel):
    index: int
    text: str

class AuditPayload(BaseModel):
    documentTitle: str
    originalFileType: Literal["docx", "pdf"]
    paragraphs: List[DocumentParagraph]
    claims: List[Claim]

class AcceptedCitation(BaseModel):
    claimId: str
    paragraphIdx: int
    sentenceText: str
    formattedCitation: str
    formattedBibEntry: str

class ExportDocxRequest(BaseModel):
    originalFileName: str
    documentTitle: str
    paragraphs: List[DocumentParagraph]
    acceptedCitations: List[AcceptedCitation]
