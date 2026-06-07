import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pdfminer.high_level import extract_text
import io

from app.state import AnalyzeRequest, AnalysisResult
from app.graph import job_graph

app = FastAPI(title="Smart Job Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text(io.BytesIO(contents))
    return {"text": text.strip()}

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
