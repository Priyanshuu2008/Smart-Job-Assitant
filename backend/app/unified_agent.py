import json, os
from groq import Groq
from app.state import AgentState, AnalysisResult

PROMPT_V2 = """You are a senior technical recruiter and ATS expert with 10+ years of experience.

Analyze the resume and job description below with extreme precision.

STRICT RULES:
1. extracted_skills — only skills EXPLICITLY mentioned in the resume
2. missing_skills — only skills in JD that are NOT in resume (be specific, not generic)
3. optimized_bullets — 5 powerful resume bullets, each must:
   - Start with a strong action verb (Built, Deployed, Engineered, Designed, Implemented)
   - Include SPECIFIC numbers, metrics, or scale (e.g., "100K+ records", "80% accuracy", "4 projects")
   - Mention specific technologies from BOTH resume AND JD
   - Be exactly 15-25 words, no more
   - NEVER be generic — must reference actual project or achievement from resume
4. cover_letter — STRICTLY 3 separate paragraphs separated by \\n\\n:
   - Para 1 (2 sentences): Opening with exact role name + 2 strongest matching skills
   - Para 2 (3 sentences): TWO specific projects with tech stack + measurable results
   - Para 3 (2 sentences): Enthusiasm for this role + strong call to action
5. ats_score — strict integer 0-100 based on:
   - Keyword match (40%)
   - Experience relevance (30%)
   - Project alignment (20%)
   - Missing critical skills penalty (10%)
6. ats_feedback — 2-3 sentences: what's strong, what's missing, one actionable tip

Return ONLY valid JSON, no markdown, no backticks, no explanation.

{
  "extracted_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "optimized_bullets": [
    "Action verb + specific tech + measurable result in 15-25 words",
    "Action verb + specific tech + measurable result in 15-25 words",
    "Action verb + specific tech + measurable result in 15-25 words",
    "Action verb + specific tech + measurable result in 15-25 words",
    "Action verb + specific tech + measurable result in 15-25 words"
  ],
  "cover_letter": "Para 1 sentence 1. Para 1 sentence 2.\\n\\nPara 2 sentence 1. Para 2 sentence 2. Para 2 sentence 3.\\n\\nPara 3 sentence 1. Para 3 sentence 2.",
  "ats_score": 85,
  "ats_feedback": "Strong match in X. Missing Y. Tip: add Z to resume."
}

RESUME:
__RESUME__

JOB DESCRIPTION:
__JD__
"""

def unified_agent(state: AgentState) -> AgentState:
    try:
        client = Groq(api_key=os.environ["GROQ_API_KEY"])
        prompt = PROMPT_V2.replace("__RESUME__", state.resume).replace("__JD__", state.job_description)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert ATS system and career coach. Always return valid JSON only. Never add markdown or explanation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=2000,
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
