import re
import urllib.parse
from typing import Optional, Dict, Any, List
import httpx
from config import OPENALEX_MAILTO

def reconstruct_openalex_abstract(inverted_index: Optional[Dict[str, List[int]]]) -> str:
    """
    OpenAlex stores abstracts as an inverted index: { "word": [pos1, pos2] }.
    Reconstruct the chronological abstract text.
    """
    if not inverted_index:
        return ""
    
    positions: Dict[int, str] = {}
    for word, pos_list in inverted_index.items():
        for pos in pos_list:
            positions[pos] = word
            
    sorted_words = [positions[i] for i in sorted(positions.keys())]
    return " ".join(sorted_words)

def clean_query_keywords(claim_text: str) -> str:
    """Extract substantive nouns and verbs from claim text for academic API search."""
    # Remove common filler words
    stopwords = {
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 
        'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'are', 'was', 'were',
        'have', 'has', 'had', 'been', 'be', 'due', 'its', 'their', 'our', 'more', 'most'
    }
    words = re.findall(r'\b[a-zA-Z]{3,}\b', claim_text.lower())
    meaningful = [w for w in words if w not in stopwords]
    return " ".join(meaningful[:6])

def search_openalex(claim_text: str) -> Optional[Dict[str, Any]]:
    """
    Search OpenAlex public API for scholarly literature matching the claim.
    Returns metadata and abstract if found.
    """
    query = clean_query_keywords(claim_text)
    if not query:
        return None
        
    encoded_query = urllib.parse.quote(query)
    url = f"https://api.openalex.org/works?search={encoded_query}&per_page=3"
    headers = {
        "User-Agent": f"EvidenceAI-Hackathon (mailto:{OPENALEX_MAILTO})"
    }
    
    try:
        with httpx.Client(timeout=6.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code != 200:
                return None
                
            data = resp.json()
            results = data.get("results", [])
            if not results:
                return None
                
            # Find first result with an abstract
            for work in results:
                title = work.get("display_name") or work.get("title") or "Scholarly Work"
                pub_year = work.get("publication_year") or 2024
                
                # Extract author surnames
                authors: List[str] = []
                for authorship in work.get("authorships", []):
                    author_name = authorship.get("author", {}).get("display_name", "")
                    if author_name:
                        # Get surname
                        parts = author_name.split()
                        authors.append(parts[-1] if parts else author_name)
                        
                if not authors:
                    authors = ["Anonymous"]
                    
                abstract_inv = work.get("abstract_inverted_index")
                abstract_text = reconstruct_openalex_abstract(abstract_inv)
                
                if abstract_text:
                    doi = work.get("doi") or ""
                    venue = work.get("primary_location", {}).get("source", {}).get("display_name", "Academic Journal")
                    
                    # Build citation strings
                    if len(authors) == 1:
                        short_cit = f"({authors[0]}, {pub_year})"
                    elif len(authors) == 2:
                        short_cit = f"({authors[0]} & {authors[1]}, {pub_year})"
                    else:
                        short_cit = f"({authors[0]} et al., {pub_year})"
                        
                    authors_str = ", ".join(authors[:3]) + (" et al." if len(authors) > 3 else "")
                    full_bib = f"{authors_str} ({pub_year}). {title}. {venue}. {doi}".strip()
                    
                    return {
                        "title": title,
                        "authors": authors,
                        "year": pub_year,
                        "abstract": abstract_text,
                        "formattedCitation": short_cit,
                        "formattedBibEntry": full_bib,
                        "sourceType": "scholarly_api"
                    }
                    
            return None
    except Exception as e:
        print(f"OpenAlex query error: {e}")
        return None
