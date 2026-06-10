# 🎯 Smart Job Assistant

An AI-powered job application assistant that analyzes your resume against job descriptions — delivering ATS score, skill gap analysis, optimized resume bullets, personalized cover letter, company research, and job role insights in seconds.

![Python](https://img.shields.io/badge/Python-3.12+-blue?style=flat&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=flat&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-purple?style=flat)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange?style=flat)
![Tavily](https://img.shields.io/badge/Tavily-Search_API-blue?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | [smart-job-assitant.vercel.app](https://smart-job-assitant.vercel.app) |
| Backend API | [smart-job-assitant.up.railway.app](https://smart-job-assitant.up.railway.app) |
| API Docs | [smart-job-assitant.up.railway.app/docs](https://smart-job-assitant.up.railway.app/docs) |

## 🧠 About the Project

This project is a full-stack AI-powered job application tool built with a focus on **Generative AI** and **agentic workflows** for intelligent resume analysis.

> 💡 Built with Python, FastAPI, LangGraph & Groq LLaMA 3.3 70B

The app combines a **single unified LLM call** via Groq to simultaneously return ATS score, skill gap, optimized bullets, and a personalized cover letter — while **Tavily Search** powers real-time company and job role research.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 PDF Resume Upload | Upload resume as PDF — text auto-extracted via pdfminer.six |
| 🎯 ATS Score (0-100) | Strict ATS scoring based on keyword match, experience & project alignment |
| 🔍 Skill Gap Analysis | Exact skills you have vs what the JD requires |
| ✨ Optimized Resume Bullets | 5 AI-generated bullets with action verbs, real numbers & specific tech |
| 📝 Cover Letter | 3-paragraph personalized cover letter tailored to the JD |
| 🏢 Company Research | Real-time company overview, culture & hiring insights via Tavily |
| 💼 Job Role Research | Role expectations, required skills & salary insights via live web search |
| ⚡ Blazing Fast | Single Groq LLM call returns all 6 resume outputs simultaneously |

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Python 3.12 | Core language |
| FastAPI | Backend REST API |
| LangGraph | Agentic workflow orchestration |
| Groq API (LLaMA 3.3 70B) | Unified LLM call for all resume outputs |
| Tavily Search API | Real-time company & job role research |
| pdfminer.six | PDF text extraction |
| Next.js 16 + TypeScript | Frontend framework |
| Tailwind CSS | UI styling |
| Vercel | Frontend deployment |
| Railway | Backend deployment |

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Groq API key — [Get it here](https://console.groq.com)
- Tavily API key — [Get it here](https://app.tavily.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Priyanshuu2008/Smart-Job-Assitant.git
cd Smart-Job-Assitant

# 2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt

# 3. Add environment variables
echo GROQ_API_KEY=your_groq_key > .env
echo TAVILY_API_KEY=your_tavily_key >> .env

# 4. Run backend
uvicorn app.main:app --reload --port 8000
```

```bash
# 5. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

App will open at `http://localhost:3000`  
API Docs at `http://localhost:8000/docs`

## 📁 Project Structure

```
Smart-Job-Assitant/
├── backend/
│   ├── app/
│   │   ├── state.py           # Pydantic models (AgentState, AnalysisResult)
│   │   ├── unified_agent.py   # Single Groq LLM call — all 6 outputs
│   │   ├── graph.py           # LangGraph agentic workflow
│   │   └── main.py            # FastAPI endpoints + PDF + research
│   └── requirements.txt
└── frontend/
    └── app/
        └── page.tsx           # Full UI — analyzer + research tools
```

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

For Railway deployment, add these under **Variables** tab in your service settings.

## 📊 Architecture

```
User → Next.js → POST /analyze            → FastAPI → LangGraph → Groq LLaMA 3.3 70B → JSON → UI
               → POST /extract-pdf        → pdfminer.six → resume text
               → POST /research/company   → Tavily Search → company insights
               → POST /research/job-role  → Tavily Search → role insights
```

**Single unified LLM call** returns all 6 outputs simultaneously:
- `extracted_skills` — skills found in resume
- `missing_skills` — skills in JD but not in resume
- `optimized_bullets` — 5 bullets with action verbs + metrics
- `cover_letter` — 3-paragraph personalized letter
- `ats_score` — integer 0-100
- `ats_feedback` — actionable improvement tip

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/analyze` | Full resume analysis |
| POST | `/extract-pdf` | Extract text from PDF |
| POST | `/research/company` | Company research via Tavily |
| POST | `/research/job-role` | Job role insights via Tavily |
| GET | `/docs` | Swagger API documentation |

## 📌 Key Highlights

- 🤖 **Generative AI** — LLaMA 3.3 70B via Groq for ultra-fast inference
- 🔗 **Agentic Workflow** — LangGraph orchestrates the analysis pipeline
- 🔎 **Real-time Search** — Tavily powers live company & role research
- 📄 **PDF Parsing** — pdfminer.six extracts clean text from any PDF resume
- ☁️ **Cloud Deployed** — Live on Vercel + Railway, accessible anywhere
- 🔐 **Secure** — API keys never committed to version control

## 🙋‍♂️ Author

**Priyanshu Tiwari**  
GitHub: [@Priyanshuu2008](https://github.com/Priyanshuu2008)  
LinkedIn: [priyanshuu20](https://linkedin.com/in/priyanshuu20)  
Live App: [smart-job-assitant.vercel.app](https://smart-job-assitant.vercel.app)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
