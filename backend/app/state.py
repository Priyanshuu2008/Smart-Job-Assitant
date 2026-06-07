from typing import Optional
from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    resume: str
    job_description: str

class AnalysisResult(BaseModel):
    extracted_skills: list[str]
    missing_skills: list[str]
    optimized_bullets: list[str]
    cover_letter: str
    ats_score: int
    ats_feedback: str

class AgentState(BaseModel):
    resume: str
    job_description: str
    result: Optional[AnalysisResult] = None
    error: Optional[str] = None
    