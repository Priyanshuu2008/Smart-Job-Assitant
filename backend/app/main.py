import os, io
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pdfminer.high_level import extract_text
from pydantic import BaseModel
from tavily import TavilyClient

from app.state import AnalyzeRequest, AnalysisResult
from app.graph import job_graph

app = FastAPI(title="Smart Job Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

class CompanyRequest(BaseModel):
    company_name: str

class JobRoleRequest(BaseModel):
    job_title: str
    company_name: str = ""

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text(io.BytesIO(contents))
    return {"text": text.strip()}

@app.post("/research/company")
def research_company(payload: CompanyRequest):
    try:
        result = tavily.search(
            query=f"{payload.company_name} company overview culture tech stack hiring 2024 2025",
            search_depth="advanced",
            max_results=5,
            include_answer=True
        )
        return {
            "company": payload.company_name,
            "summary": result.get("answer", ""),
            "sources": [{"title": r["title"], "url": r["url"], "content": r["content"][:300]} for r in result.get("results", [])]
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/research/job-role")
def research_job_role(payload: JobRoleRequest):
    try:
        query = f"{payload.job_title} role responsibilities skills required salary 2025"
        if payload.company_name:
            query += f" at {payload.company_name}"
        result = tavily.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_answer=True
        )
        return {
            "role": payload.job_title,
            "company": payload.company_name,
            "summary": result.get("answer", ""),
            "sources": [{"title": r["title"], "url": r["url"], "content": r["content"][:300]} for r in result.get("results", [])]
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/analyze", response_model=AnalysisResult)
def analyze(payload: AnalyzeRequest):
    if not payload.resume.strip():
        raise HTTPException(400, "resume empty")
    if not payload.job_description.strip():
        raise HTTPException(400, "jd empty")
    result = job_graph.invoke({
        "resume": payload.resume,
        "job_description": payload.job_description,
        "result": None,
        "error": None
    })
    if result.get("error"):
        raise HTTPException(500, result["error"])
    return result["result"]
