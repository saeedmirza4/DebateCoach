"use client";
import { useState, useEffect } from "react";

const STATS_KEY = "debatecoach_stats";

export default function Home() {
  const [currentView, setCurrentView] = useState("landing");
  const [topic, setTopic] = useState("");
  const [side, setSide] = useState("for");
  const [difficulty, setDifficulty] = useState("medium");
  const [stage, setStage] = useState("setup");
  const [aiArguments, setAiArguments] = useState("");
  const [aiCounter, setAiCounter] = useState("");
  const [userRebuttal, setUserRebuttal] = useState("");
  const [score, setScore] = useState("");
  const [tips, setTips] = useState("");
  const [tipsLoading, setTipsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalDebates: 0, scoredCount: 0, totalScore: 0 });

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const avgScore = stats.scoredCount > 0 ? (stats.totalScore / stats.scoredCount).toFixed(1) : null;

  const callAPI = async (payload: object) => {
    const res = await fetch("/api/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.result;
  };

  const handleGetArguments = async () => {
    if (!topic.trim()) { setError("Enter a debate topic to continue."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await callAPI({ stage: "arguments", topic, side });
      setAiArguments(result);
      setStage("arguments");
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  const handleGetCounter = async () => {
    setLoading(true);
    try {
      const result = await callAPI({ stage: "counter", topic, side, userArgument: aiArguments, difficulty });
      setAiCounter(result);
      setStage("counter");
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  const handleGetTips = async () => {
    setTipsLoading(true);
    try {
      const result = await callAPI({ stage: "tips", topic, side, userArgument: aiCounter });
      setTips(result);
    } catch { setError("Something went wrong. Try again."); }
    setTipsLoading(false);
  };

  const handleGetScore = async () => {
    if (!userRebuttal.trim()) { setError("Write your rebuttal before submitting."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await callAPI({ stage: "score", topic, side, userArgument: userRebuttal, aiCounterArgument: aiCounter });
      setScore(result);
      setStage("score");

      // Update persisted stats
      const match = result.match(/(\d{1,2})\s*\/\s*10/);
      setStats((prev) => {
        const updated = {
          totalDebates: prev.totalDebates + 1,
          scoredCount: match ? prev.scoredCount + 1 : prev.scoredCount,
          totalScore: match ? prev.totalScore + parseInt(match[1], 10) : prev.totalScore,
        };
        try { localStorage.setItem(STATS_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  const handleReset = () => {
    setTopic(""); setSide("for"); setDifficulty("medium"); setStage("setup");
    setAiArguments(""); setAiCounter(""); setUserRebuttal(""); setScore(""); setError("");
    setTips(""); setTipsLoading(false);
    setCurrentView("app");
  };

  const sampleTopics = [
    "Artificial intelligence will do more harm than good",
    "Social media should be regulated by governments",
    "University degrees are no longer worth the cost",
    "Remote work is better than office work",
  ];

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .playfair { font-family: 'Playfair Display', serif; }
    .amber { color: #E8A020; }
    .nav-link { color: #8892A4; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.02em; cursor: pointer; transition: color 0.2s; background: none; border: none; font-family: 'Inter', sans-serif; }
    .nav-link:hover { color: #F8F9FA; }
    .btn-primary { background: #E8A020; color: #0A0F1E; border: none; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 0.03em; transition: all 0.2s; font-family: 'Inter', sans-serif; }
    .btn-primary:hover { background: #F5B535; transform: translateY(-1px); }
    .btn-ghost { background: transparent; color: #F8F9FA; border: 1px solid #2A3244; padding: 14px 32px; font-size: 15px; font-weight: 500; cursor: pointer; letter-spacing: 0.03em; transition: all 0.2s; font-family: 'Inter', sans-serif; }
    .btn-ghost:hover { border-color: #E8A020; color: #E8A020; }
    .divider { width: 48px; height: 2px; background: #E8A020; }
    .topic-chip { background: #111827; border: 1px solid #1E2A3A; padding: 10px 16px; font-size: 13px; color: #8892A4; cursor: pointer; transition: all 0.2s; text-align: left; font-family: 'Inter', sans-serif; }
    .topic-chip:hover { border-color: #E8A020; color: #F8F9FA; }
  `;

  if (currentView === "landing") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#0A0F1E", minHeight: "100vh", color: "#F8F9FA" }}>
        <style>{sharedStyles}</style>

        {/* Nav */}
        <nav style={{ padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1E2A3A" }}>
          <div className="playfair" style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.01em" }}>
            Debate<span className="amber">Coach</span>
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <span className="nav-link" onClick={() => setCurrentView("how")}>How it works</span>
            <button className="btn-primary" onClick={() => setCurrentView("app")} style={{ padding: "8px 20px", fontSize: "13px" }}>
              Start Debating
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: "100px 48px 80px", maxWidth: "900px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div className="divider" />
            <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8892A4", fontWeight: "500" }}>AI-Powered Debate Training</span>
          </div>
          <h1 className="playfair" style={{ fontSize: "clamp(48px, 7vw, 80px)", fontWeight: "900", lineHeight: "1.05", letterSpacing: "-0.02em", marginBottom: "28px" }}>
            Argue better.<br />
            Think <span className="amber">sharper.</span><br />
            Win debates.
          </h1>
          <p style={{ fontSize: "18px", color: "#8892A4", lineHeight: "1.7", maxWidth: "520px", marginBottom: "40px", fontWeight: "300" }}>
            Pick a topic, build your case, face an AI opponent that tears it apart — then defend yourself and get scored like a real debate judge would.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => setCurrentView("app")}>Start a Debate</button>
            <button className="btn-ghost" onClick={() => setCurrentView("how")}>See how it works</button>
          </div>
        </section>

        {/* Sample topics */}
        <section style={{ padding: "0 48px 80px" }}>
          <p style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>Try these topics</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {sampleTopics.map((t) => (
              <button key={t} className="topic-chip" onClick={() => { setTopic(t); setCurrentView("app"); }}>
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: "60px 48px", borderTop: "1px solid #1E2A3A", borderBottom: stats.totalDebates > 0 ? "none" : "1px solid #1E2A3A", display: "flex", gap: "64px", flexWrap: "wrap" }}>
          {[["3", "AI-powered rounds"], ["Real-time", "argument scoring"], ["Any topic", "you can think of"], ["Free", "no signup needed"]].map(([val, label]) => (
            <div key={label}>
              <div className="playfair amber" style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>{val}</div>
              <div style={{ fontSize: "13px", color: "#8892A4", fontWeight: "400" }}>{label}</div>
            </div>
          ))}
        </section>

        {/* Your progress (only once the user has completed a debate) */}
        {stats.totalDebates > 0 && (
          <section style={{ padding: "48px 48px 60px", borderBottom: "1px solid #1E2A3A", display: "flex", gap: "64px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px", fontWeight: "500" }}>Your progress</p>
              <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
                <div>
                  <div className="playfair amber" style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>{stats.totalDebates}</div>
                  <div style={{ fontSize: "13px", color: "#8892A4", fontWeight: "400" }}>debates completed</div>
                </div>
                {avgScore && (
                  <div>
                    <div className="playfair amber" style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>{avgScore}/10</div>
                    <div style={{ fontSize: "13px", color: "#8892A4", fontWeight: "400" }}>average score</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="playfair" style={{ fontSize: "16px", fontWeight: "700" }}>Debate<span className="amber">Coach</span></div>
          <p style={{ fontSize: "12px", color: "#4A5568" }}>Built for DYLP Vibe Coding Hackathon 2026</p>
        </footer>
      </div>
    );
  }

  if (currentView === "how") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#0A0F1E", minHeight: "100vh", color: "#F8F9FA" }}>
        <style>{sharedStyles}</style>

        <nav style={{ padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1E2A3A" }}>
          <div className="playfair" style={{ fontSize: "20px", fontWeight: "700", cursor: "pointer" }} onClick={() => setCurrentView("landing")}>
            Debate<span className="amber">Coach</span>
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <span className="nav-link" onClick={() => setCurrentView("landing")}>Home</span>
            <button className="btn-primary" onClick={() => setCurrentView("app")} style={{ padding: "8px 20px", fontSize: "13px" }}>Start Debating</button>
          </div>
        </nav>

        <section style={{ padding: "80px 48px", maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#E8A020", marginBottom: "16px" }}>The Process</p>
          <h1 className="playfair" style={{ fontSize: "48px", fontWeight: "700", marginBottom: "16px", lineHeight: "1.1" }}>How DebateCoach works</h1>
          <p style={{ color: "#8892A4", fontSize: "16px", marginBottom: "64px", lineHeight: "1.7" }}>Four stages. One complete practice session. Real feedback that makes you better.</p>

          {[
            { n: "01", title: "Choose your position", desc: "Pick any debate topic — political, social, philosophical, or tech. Choose whether you're arguing for or against it, and set your difficulty level. The more specific the topic, the sharper the training." },
            { n: "02", title: "Build your case", desc: "The AI generates three strong, structured arguments for your chosen side. Study them. Understand the logic. These are the foundations you'll defend." },
            { n: "03", title: "Face the opposition", desc: "The AI switches sides and attacks your arguments with three counter-arguments designed to expose every weakness. Difficulty level determines how brutal the attack is." },
            { n: "04", title: "Defend and get scored", desc: "Write your rebuttal. An AI judge evaluates your response — scoring your logic, strength of argument, and areas for improvement — just like a real debate panel would." },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ display: "flex", gap: "32px", marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid #1E2A3A" }}>
              <div className="playfair amber" style={{ fontSize: "48px", fontWeight: "900", lineHeight: "1", minWidth: "60px", opacity: 0.4 }}>{n}</div>
              <div>
                <h3 className="playfair" style={{ fontSize: "22px", fontWeight: "600", marginBottom: "10px" }}>{title}</h3>
                <p style={{ color: "#8892A4", fontSize: "15px", lineHeight: "1.7" }}>{desc}</p>
              </div>
            </div>
          ))}

          <button className="btn-primary" onClick={() => setCurrentView("app")}>Start Your First Debate</button>
        </section>
      </div>
    );
  }

  // App view
  const stages = ["setup", "arguments", "counter", "score"];
  const stageIndex = stages.indexOf(stage);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0A0F1E", minHeight: "100vh", color: "#F8F9FA" }}>
      <style>{`
        ${sharedStyles}
        .btn-app-primary { background: #E8A020; color: #0A0F1E; border: none; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 0.02em; transition: all 0.2s; font-family: 'Inter', sans-serif; width: 100%; }
        .btn-app-primary:hover:not(:disabled) { background: #F5B535; }
        .btn-app-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline-amber { background: transparent; color: #E8A020; border: 1px solid #E8A020; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 0.02em; transition: all 0.2s; font-family: 'Inter', sans-serif; width: 100%; }
        .btn-outline-amber:hover:not(:disabled) { background: rgba(232, 160, 32, 0.1); }
        .btn-outline-amber:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-danger { background: #7F1D1D; color: #FCA5A5; border: none; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; width: 100%; }
        .btn-danger:hover:not(:disabled) { background: #991B1B; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-success { background: #14532D; color: #86EFAC; border: none; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; width: 100%; }
        .btn-success:hover:not(:disabled) { background: #166534; }
        .btn-success:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-reset { background: transparent; color: #8892A4; border: 1px solid #1E2A3A; padding: 14px 32px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; width: 100%; }
        .btn-reset:hover { border-color: #E8A020; color: #E8A020; }
        .input-field { width: 100%; background: #111827; border: 1px solid #1E2A3A; color: #F8F9FA; padding: 14px 16px; font-size: 15px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #E8A020; }
        .input-field::placeholder { color: #4A5568; }
        .textarea-field { width: 100%; background: #111827; border: 1px solid #1E2A3A; color: #F8F9FA; padding: 14px 16px; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; resize: none; line-height: 1.6; }
        .textarea-field:focus { border-color: #E8A020; }
        .textarea-field::placeholder { color: #4A5568; }
        .content-box { background: #111827; border: 1px solid #1E2A3A; padding: 24px; font-size: 14px; line-height: 1.8; color: #C4CDD8; white-space: pre-wrap; }
        .side-btn { flex: 1; padding: 12px; background: #111827; border: 1px solid #1E2A3A; color: #8892A4; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em; }
        .side-btn.for.active { background: #1A2E1A; border-color: #86EFAC; color: #86EFAC; }
        .side-btn.against.active { background: #2E1A1A; border-color: #FCA5A5; color: #FCA5A5; }
        .side-btn:hover { border-color: #4A5568; color: #F8F9FA; }
        .diff-btn { flex: 1; padding: 12px; background: #111827; border: 1px solid #1E2A3A; color: #8892A4; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-transform: capitalize; letter-spacing: 0.03em; }
        .diff-btn:hover { border-color: #4A5568; color: #F8F9FA; }
        .diff-btn.easy.active { background: #14532D; border-color: #86EFAC; color: #86EFAC; }
        .diff-btn.medium.active { background: #1A2E4A; border-color: #60A5FA; color: #60A5FA; }
        .diff-btn.hard.active { background: #2E1A1A; border-color: #FCA5A5; color: #FCA5A5; }
      `}</style>

      <nav style={{ padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1E2A3A" }}>
        <div className="playfair" style={{ fontSize: "20px", fontWeight: "700", cursor: "pointer" }} onClick={() => setCurrentView("landing")}>
          Debate<span className="amber">Coach</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {stats.totalDebates > 0 && (
            <span style={{ fontSize: "12px", color: "#8892A4", letterSpacing: "0.02em" }}>
              <span className="amber" style={{ fontWeight: "600" }}>{stats.totalDebates}</span> debates
              {avgScore && (
                <>
                  {" "}· <span className="amber" style={{ fontWeight: "600" }}>{avgScore}/10</span> avg
                </>
              )}
            </span>
          )}
          <button className="nav-link" onClick={() => setCurrentView("how")}>How it works</button>
          <button className="nav-link" onClick={handleReset}>New debate</button>
        </div>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Topic header when active */}
        {topic && stage !== "setup" && (
          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #1E2A3A" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8892A4", marginBottom: "8px" }}>Current topic</p>
            <h2 className="playfair" style={{ fontSize: "22px", fontWeight: "600", lineHeight: "1.3" }}>
              {topic}
              <span style={{ marginLeft: "12px", fontSize: "13px", padding: "3px 10px", border: `1px solid ${side === "for" ? "#86EFAC" : "#FCA5A5"}`, color: side === "for" ? "#86EFAC" : "#FCA5A5", fontFamily: "Inter, sans-serif", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase", verticalAlign: "middle" }}>
                {side}
              </span>
              <span style={{ marginLeft: "8px", fontSize: "13px", padding: "3px 10px", border: `1px solid ${difficulty === "easy" ? "#86EFAC" : difficulty === "hard" ? "#FCA5A5" : "#60A5FA"}`, color: difficulty === "easy" ? "#86EFAC" : difficulty === "hard" ? "#FCA5A5" : "#60A5FA", fontFamily: "Inter, sans-serif", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase", verticalAlign: "middle" }}>
                {difficulty}
              </span>
            </h2>
          </div>
        )}

        {/* Progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "40px" }}>
          {["Position", "Arguments", "Counter", "Score"].map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: "2px", background: i <= stageIndex ? "#E8A020" : "#1E2A3A", marginBottom: "6px", transition: "background 0.3s" }} />
              <p style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: i <= stageIndex ? "#E8A020" : "#4A5568", fontWeight: "500" }}>{s}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#2E1A1A", border: "1px solid #7F1D1D", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#FCA5A5" }}>
            {error}
          </div>
        )}

        {/* Stage 1 - Setup */}
        {stage === "setup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892A4", marginBottom: "10px", fontWeight: "500" }}>Debate topic</p>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGetArguments()}
                placeholder="e.g. Social media does more harm than good"
                className="input-field"
              />
            </div>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892A4", marginBottom: "10px", fontWeight: "500" }}>Your position</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className={`side-btn for ${side === "for" ? "active" : ""}`} onClick={() => setSide("for")}>For</button>
                <button className={`side-btn against ${side === "against" ? "active" : ""}`} onClick={() => setSide("against")}>Against</button>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892A4", marginBottom: "4px", fontWeight: "500" }}>Difficulty</p>
              <p style={{ fontSize: "12px", color: "#4A5568", marginBottom: "10px" }}>
                {difficulty === "easy" ? "Gentle counter-arguments — good for beginners." : difficulty === "hard" ? "Brutal attacks — maximum challenge." : "Balanced opposition — fair and competitive."}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {["easy", "medium", "hard"].map((d) => (
                  <button key={d} className={`diff-btn ${d} ${difficulty === d ? "active" : ""}`} onClick={() => setDifficulty(d)}>
                    {d === "easy" ? "Easy" : d === "medium" ? "Medium" : "Hard"}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-app-primary" onClick={handleGetArguments} disabled={loading}>
              {loading ? "Building your case..." : "Build My Arguments"}
            </button>
          </div>
        )}

        {/* Stage 2 - Arguments */}
        {stage === "arguments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#86EFAC", marginBottom: "6px", fontWeight: "500" }}>Your arguments</p>
              <p style={{ fontSize: "13px", color: "#8892A4", marginBottom: "16px" }}>Study these. The AI will attack them in the next round.</p>
              <div className="content-box">{aiArguments}</div>
            </div>
            <button className="btn-danger" onClick={handleGetCounter} disabled={loading}>
              {loading ? "AI is preparing its attack..." : "Face the Counter-Arguments"}
            </button>
          </div>
        )}

        {/* Stage 3 - Counter */}
        {stage === "counter" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FCA5A5", marginBottom: "6px", fontWeight: "500" }}>AI counter-arguments</p>
              <p style={{ fontSize: "13px", color: "#8892A4", marginBottom: "16px" }}>The opposition has attacked your position. Now defend it.</p>
              <div className="content-box" style={{ borderColor: "#7F1D1D" }}>{aiCounter}</div>
            </div>

            {/* Rebuttal tips */}
            <div>
              {!tips && (
                <button
                  className="btn-outline-amber"
                  onClick={handleGetTips}
                  disabled={tipsLoading}
                >
                  {tipsLoading ? "Thinking of tactics..." : "Get Rebuttal Tips"}
                </button>
              )}
              {tips && (
                <div>
                  <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8A020", marginBottom: "6px", fontWeight: "500" }}>Tactical tips</p>
                  <div className="content-box" style={{ borderColor: "#E8A020" }}>{tips}</div>
                </div>
              )}
            </div>

            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892A4", marginBottom: "10px", fontWeight: "500" }}>Your rebuttal</p>
              <textarea
                value={userRebuttal}
                onChange={(e) => setUserRebuttal(e.target.value)}
                placeholder="Defend your position. Address the counter-arguments directly and explain why your case still stands..."
                rows={6}
                className="textarea-field"
              />
            </div>
            <button className="btn-success" onClick={handleGetScore} disabled={loading}>
              {loading ? "Judge is evaluating..." : "Submit for Scoring"}
            </button>
          </div>
        )}

        {/* Stage 4 - Score */}
        {stage === "score" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8A020", marginBottom: "6px", fontWeight: "500" }}>Judge's verdict</p>
              <p style={{ fontSize: "13px", color: "#8892A4", marginBottom: "16px" }}>Your rebuttal has been evaluated.</p>
              <div className="content-box" style={{ borderColor: "#E8A020" }}>{score}</div>
            </div>
            <p style={{ fontSize: "11px", color: "#4A5568", textAlign: "center" }}>Arguments are AI-generated for practice purposes. Verify statistics before real use.</p>
            <button className="btn-reset" onClick={handleReset}>Start a New Debate</button>
          </div>
        )}
      </div>
    </div>
  );
}