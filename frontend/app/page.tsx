"use client";
import { useState, useRef } from "react";

interface AnalysisResult {
  extracted_skills: string[];
  missing_skills: string[];
  optimized_bullets: string[];
  cover_letter: string;
  ats_score: number;
  ats_feedback: string;
}

interface ResearchResult {
  summary: string;
  sources: { title: string; url: string; content: string }[];
}

type Tab = "skills" | "bullets" | "cover";
type MainTab = "analyze" | "company" | "jobrole";

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("skills");
  const [copied, setCopied] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [mainTab, setMainTab] = useState<MainTab>("analyze");

  // Company Research
  const [companyName, setCompanyName] = useState("");
  const [companyResult, setCompanyResult] = useState<ResearchResult | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Job Role Research
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobRoleResult, setJobRoleResult] = useState<ResearchResult | null>(null);
  const [jobRoleLoading, setJobRoleLoading] = useState(false);

  const handlePdf = async (file: File) => {
    setPdfName(file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      setResume(data.text);
    } catch { setError("PDF extract failed"); }
  };

  const analyze = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, job_description: jobDescription }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
      setActiveTab("skills");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const researchCompany = async () => {
    setCompanyLoading(true); setCompanyResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/research/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      setCompanyResult(await res.json());
    } catch { } finally { setCompanyLoading(false); }
  };

  const researchJobRole = async () => {
    setJobRoleLoading(true); setJobRoleResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/research/job-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle, company_name: jobCompany }),
      });
      setJobRoleResult(await res.json());
    } catch { } finally { setJobRoleLoading(false); }
  };

  const circumference = 2 * Math.PI * 54;
  const offset = result ? circumference - (result.ats_score / 100) * circumference : circumference;
  const scoreGrad = !result ? ["#333", "#222"] : result.ats_score >= 70 ? ["#00c6ff", "#0072ff"] : result.ats_score >= 50 ? ["#f7971e", "#ffd200"] : ["#f953c6", "#b91d73"];
  const scoreLabel = !result ? "" : result.ats_score >= 70 ? "Strong Match" : result.ats_score >= 50 ? "Moderate" : "Weak Match";

  const mainTabs: [MainTab, string, string][] = [
    ["analyze", "✦", "Resume Analyzer"],
    ["company", "🏢", "Company Research"],
    ["jobrole", "💼", "Job Role Research"],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0e12; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .card { background: #16161e; border: 1px solid #1f1f2e; border-radius: 20px; }
        textarea::placeholder { color: #2a2a3a !important; }
        textarea:focus { outline: none !important; border-color: #6366f144 !important; }
        input::placeholder { color: #2a2a3a !important; }
        input:focus { outline: none !important; border-color: #6366f144 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
        .skill-tag:hover { transform: translateY(-2px); transition: transform 0.15s; }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(99,102,241,0.4) !important; }
        .analyze-btn { transition: all 0.2s; }
        .src-card:hover { border-color: #6366f130 !important; }
        .src-card { transition: border-color 0.15s; }
        .main-tab:hover { color: #a0a0d0 !important; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#0e0e12", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#e0e0f0", position: "relative", overflow: "hidden" }}>

        {/* Background blobs */}
        <div style={{ position: "fixed", top: -300, left: -200, width: 700, height: 700, background: "radial-gradient(circle, #6366f120 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -200, right: -150, width: 600, height: 600, background: "radial-gradient(circle, #8b5cf620 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Nav */}
        <nav style={{ position: "relative", zIndex: 10, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a28" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 16px #6366f140" }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #e0e0f0, #a0a0c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>JobAssist</span>
          </div>

          {/* Main Tab Navigation */}
          <div style={{ display: "flex", gap: 4, background: "#16161e", border: "1px solid #1f1f2e", borderRadius: 12, padding: 4 }}>
            {mainTabs.map(([tab, icon, label]) => (
              <button key={tab} className="main-tab" onClick={() => setMainTab(tab)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s", background: mainTab === tab ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: mainTab === tab ? "#fff" : "#40406a", boxShadow: mainTab === tab ? "0 2px 12px #6366f140" : "none" }}>
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#16161e", border: "1px solid #1f1f2e", borderRadius: 20, padding: "6px 14px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            <span style={{ fontSize: 11, color: "#40406a", fontWeight: 500 }}>Groq · LLaMA 3.3 70B</span>
          </div>
        </nav>

        {/* ===== ANALYZE TAB ===== */}
        {mainTab === "analyze" && (
          <>
            <section style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "60px 24px 48px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #6366f115, #8b5cf615)", border: "1px solid #6366f130", borderRadius: 24, padding: "6px 16px", marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: "#8b8bcc", fontWeight: 600, letterSpacing: "0.3px" }}>✦ AI-Powered Resume Analyzer</span>
              </div>
              <h1 style={{ fontSize: "clamp(40px, 5vw, 68px)", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 16 }}>
                <span style={{ background: "linear-gradient(135deg, #f0f0ff 0%, #a0a0d0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Beat the ATS.</span>
                <br />
                <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Land the role.</span>
              </h1>
              <p style={{ fontSize: 15, color: "#40406a", maxWidth: 400, margin: "0 auto", lineHeight: 1.7 }}>
                Upload resume · paste JD · get ATS score, skill gaps, bullets & cover letter
              </p>
            </section>

            <section style={{ position: "relative", zIndex: 10, maxWidth: 980, margin: "0 auto", padding: "0 24px 60px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase" }}>Your Resume</label>
                  <div onClick={() => fileRef.current?.click()}
                    style={{ height: 168, background: "#16161e", border: `1.5px dashed ${pdfName ? "#6366f166" : "#1f1f2e"}`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
                    {pdfName && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #6366f108, transparent)", pointerEvents: "none" }} />}
                    <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])} />
                    {pdfName ? (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                        <div style={{ fontSize: 13, color: "#8b8bef", fontWeight: 600 }}>{pdfName}</div>
                        <div style={{ fontSize: 11, color: "#30304a", marginTop: 4 }}>click to replace</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #6366f120, #8b5cf620)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: "1px solid #6366f130" }}>
                          <span style={{ fontSize: 20 }}>⬆</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#50507a", fontWeight: 500 }}>Drop PDF or click to upload</div>
                        <div style={{ fontSize: 11, color: "#30304a", marginTop: 4 }}>or paste text below</div>
                      </div>
                    )}
                  </div>
                  <textarea style={{ width: "100%", height: 88, background: "#16161e", border: "1.5px solid #1f1f2e", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#a0a0c0", resize: "none", fontFamily: "inherit", lineHeight: 1.6 }}
                    placeholder="Or paste resume text..." value={resume} onChange={(e) => setResume(e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase" }}>Job Description</label>
                  <textarea style={{ flex: 1, width: "100%", height: 274, background: "#16161e", border: "1.5px solid #1f1f2e", borderRadius: 16, padding: "16px 18px", fontSize: 13, color: "#a0a0c0", resize: "none", fontFamily: "inherit", lineHeight: 1.7 }}
                    placeholder="Paste job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                </div>
              </div>

              <button className="analyze-btn" onClick={analyze} disabled={loading || !resume || !jobDescription}
                style={{ width: "100%", padding: "15px", background: !resume || !jobDescription || loading ? "#16161e" : "linear-gradient(135deg, #6366f1, #8b5cf6)", border: `1.5px solid ${!resume || !jobDescription || loading ? "#1f1f2e" : "transparent"}`, borderRadius: 14, fontSize: 14, fontWeight: 700, color: !resume || !jobDescription || loading ? "#30304a" : "#fff", cursor: !resume || !jobDescription || loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: resume && jobDescription && !loading ? "0 4px 20px #6366f130" : "none" }}>
                {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={{ width: 15, height: 15, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Analyzing...</span> : "Analyze Resume →"}
              </button>

              {error && <div style={{ marginTop: 12, padding: "12px 16px", background: "#1a0020", border: "1px solid #f953c630", borderRadius: 10, color: "#f953c6", fontSize: 13 }}>{error}</div>}

              {loading && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[100, 180].map((h, i) => (
                    <div key={i} style={{ height: h, background: "linear-gradient(90deg, #16161e 25%, #1f1f2e 50%, #16161e 75%)", backgroundSize: "400px 100%", borderRadius: 16, animation: "shimmer 1.5s infinite", border: "1px solid #1f1f2e" }} />
                  ))}
                </div>
              )}

              {result && !loading && (
                <div className="fade-up" style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="card" style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 28, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${scoreGrad[0]}, ${scoreGrad[1]}, transparent)` }} />
                    <svg width="124" height="124" viewBox="0 0 124 124" style={{ flexShrink: 0 }}>
                      <circle cx="62" cy="62" r="54" fill="none" stroke="#1f1f2e" strokeWidth="8" />
                      <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={scoreGrad[0]} /><stop offset="100%" stopColor={scoreGrad[1]} /></linearGradient></defs>
                      <circle cx="62" cy="62" r="54" fill="none" stroke="url(#sg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 62 62)" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 10px ${scoreGrad[0]}88)` }} />
                      <text x="62" y="56" textAnchor="middle" fill="#f0f0ff" fontSize="24" fontWeight="800" dominantBaseline="middle">{result.ats_score}</text>
                      <text x="62" y="74" textAnchor="middle" fill="#40406a" fontSize="11" dominantBaseline="middle">/ 100</text>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px" }}>ATS Score</span>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 700, background: `${scoreGrad[0]}20`, color: scoreGrad[0], border: `1px solid ${scoreGrad[0]}40` }}>{scoreLabel}</span>
                      </div>
                      <p style={{ color: "#50507a", fontSize: 14, lineHeight: 1.7 }}>{result.ats_feedback}</p>
                    </div>
                  </div>

                  <div className="card" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #1f1f2e", padding: "0 4px" }}>
                      {([["skills", "Skills Gap"], ["bullets", "Resume Bullets"], ["cover", "Cover Letter"]] as [Tab, string][]).map(([t, label]) => (
                        <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "14px 8px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: "transparent", color: activeTab === t ? "#e0e0f0" : "#30304a", borderBottom: `2px solid ${activeTab === t ? "#6366f1" : "transparent"}`, transition: "all 0.2s" }}>{label}</button>
                      ))}
                    </div>
                    <div style={{ padding: "24px 28px" }}>
                      {activeTab === "skills" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14 }}>✓ You Have</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                              {result.extracted_skills.map((s, i) => <span key={i} className="skill-tag" style={{ padding: "5px 12px", background: "#16261a", color: "#4ade80", border: "1px solid #22c55e30", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>{s}</span>)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#f953c6", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14 }}>✗ Missing</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                              {result.missing_skills.map((s, i) => <span key={i} className="skill-tag" style={{ padding: "5px 12px", background: "#260a1e", color: "#f953c6", border: "1px solid #f953c630", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>{s}</span>)}
                            </div>
                          </div>
                        </div>
                      )}
                      {activeTab === "bullets" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {result.optimized_bullets.map((b, i) => (
                            <div key={i} style={{ display: "flex", gap: 16, padding: "14px 18px", background: "#111118", border: "1px solid #1f1f2e", borderRadius: 12, alignItems: "flex-start" }}>
                              <span style={{ fontSize: 11, fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", minWidth: 24, paddingTop: 2 }}>0{i + 1}</span>
                              <span style={{ fontSize: 13, color: "#8080a0", lineHeight: 1.65 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeTab === "cover" && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                            <button onClick={() => { navigator.clipboard.writeText(result.cover_letter); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                              style={{ padding: "7px 16px", background: copied ? "#16261a" : "#111118", border: `1px solid ${copied ? "#22c55e40" : "#1f1f2e"}`, borderRadius: 8, fontSize: 12, color: copied ? "#4ade80" : "#50507a", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s" }}>
                              {copied ? "✓ Copied!" : "Copy"}
                            </button>
                          </div>
                          <div style={{ fontSize: 14, color: "#60608a", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{result.cover_letter}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ===== COMPANY RESEARCH TAB ===== */}
        {mainTab === "company" && (
          <section style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-2px", background: "linear-gradient(135deg, #f0f0ff, #a0a0d0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10 }}>Company Research</h2>
              <p style={{ color: "#40406a", fontSize: 14 }}>Get company overview, culture, tech stack & hiring insights</p>
            </div>

            <div className="card" style={{ padding: "28px" }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Company Name</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ flex: 1, height: 46, background: "#111118", border: "1.5px solid #1f1f2e", borderRadius: 10, padding: "0 16px", fontSize: 14, color: "#e0e0f0", fontFamily: "inherit" }}
                  placeholder="e.g. Google, Anthropic, Zepto..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && companyName && researchCompany()}
                />
                <button onClick={researchCompany} disabled={!companyName || companyLoading}
                  style={{ padding: "0 24px", background: !companyName || companyLoading ? "#16161e" : "linear-gradient(135deg, #6366f1, #8b5cf6)", border: `1.5px solid ${!companyName || companyLoading ? "#1f1f2e" : "transparent"}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: !companyName || companyLoading ? "#30304a" : "#fff", cursor: !companyName || companyLoading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  {companyLoading ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 13, height: 13, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Searching...</span> : "Research →"}
                </button>
              </div>

              {companyResult && (
                <div className="fade-up" style={{ marginTop: 24 }}>
                  {companyResult.summary && (
                    <div style={{ padding: "20px", background: "#111118", borderRadius: 12, border: "1px solid #1f1f2e", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
                      <p style={{ fontSize: 14, color: "#8080a0", lineHeight: 1.8 }}>{companyResult.summary}</p>
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Sources</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {companyResult.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="src-card"
                        style={{ display: "block", padding: "14px 16px", background: "#111118", border: "1px solid #1f1f2e", borderRadius: 10, textDecoration: "none" }}>
                        <div style={{ fontSize: 13, color: "#8b8bef", fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: "#40406a", lineHeight: 1.6 }}>{s.content}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== JOB ROLE RESEARCH TAB ===== */}
        {mainTab === "jobrole" && (
          <section style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-2px", background: "linear-gradient(135deg, #f0f0ff, #a0a0d0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10 }}>Job Role Research</h2>
              <p style={{ color: "#40406a", fontSize: 14 }}>Understand role expectations, required skills & salary range</p>
            </div>

            <div className="card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Job Title</label>
                  <input
                    style={{ width: "100%", height: 46, background: "#111118", border: "1.5px solid #1f1f2e", borderRadius: 10, padding: "0 16px", fontSize: 14, color: "#e0e0f0", fontFamily: "inherit" }}
                    placeholder="e.g. ML Engineer Intern, Data Scientist..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Company (optional)</label>
                  <input
                    style={{ width: "100%", height: 46, background: "#111118", border: "1.5px solid #1f1f2e", borderRadius: 10, padding: "0 16px", fontSize: 14, color: "#e0e0f0", fontFamily: "inherit" }}
                    placeholder="e.g. Google, Zepto..."
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                  />
                </div>
              </div>

              <button onClick={researchJobRole} disabled={!jobTitle || jobRoleLoading}
                style={{ width: "100%", padding: "13px", background: !jobTitle || jobRoleLoading ? "#16161e" : "linear-gradient(135deg, #06b6d4, #8b5cf6)", border: `1.5px solid ${!jobTitle || jobRoleLoading ? "#1f1f2e" : "transparent"}`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: !jobTitle || jobRoleLoading ? "#30304a" : "#fff", cursor: !jobTitle || jobRoleLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {jobRoleLoading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={{ width: 13, height: 13, border: "2px solid #06b6d4", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Searching...</span> : "Research Role →"}
              </button>

              {jobRoleResult && (
                <div className="fade-up" style={{ marginTop: 24 }}>
                  {jobRoleResult.summary && (
                    <div style={{ padding: "20px", background: "#111118", borderRadius: 12, border: "1px solid #1f1f2e", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
                      <p style={{ fontSize: 14, color: "#8080a0", lineHeight: 1.8 }}>{jobRoleResult.summary}</p>
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#40406a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Sources</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {jobRoleResult.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="src-card"
                        style={{ display: "block", padding: "14px 16px", background: "#111118", border: "1px solid #1f1f2e", borderRadius: 10, textDecoration: "none" }}>
                        <div style={{ fontSize: 13, color: "#06b6d4", fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: "#40406a", lineHeight: 1.6 }}>{s.content}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
