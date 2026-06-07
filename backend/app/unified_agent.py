import json, os
from groq import Groq
from app.state import AgentState, AnalysisResult

PROMPT = """You are an expert career coach and ATS specialist.
Analyze the resume and job description below.
Return ONLY a valid JSON object, no markdown, no backticks, no explanation.

{
  "extracted_skills": ["skill1"],
  "missing_skills": ["skill1"],
  "optimized_bullets": ["bullet1","bullet2","bullet3","bullet4","bullet5"],
  "cover_letter": "cover letter text",
  "ats_score": 75,
  "ats_feedback": "explanation"
}

RESUME:
__RESUME__

JOB DESCRIPTION:
__JD__
"""

def unified_agent(state: AgentState) -> AgentState:
    try:
        client = Groq(api_key=os.environ["GROQ_API_KEY"])
        prompt = PROMPT.replace("__RESUME__", state.resume).replace("__JD__", state.job_description)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        state.result = AnalysisResult(
            extracted_skills=data["extracted_skills"],
            missing_skills=data["missing_skills"],
            optimized_bullets=data["optimized_bullets"],
            cover_letter=data["cover_letter"],
            ats_score=int(data["ats_score"]),
            ats_feedback=data["ats_feedback"]
        )
    except Exception as e:
        state.error = str(e)
    return state