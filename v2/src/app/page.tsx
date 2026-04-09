'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const step = Math.ceil(target / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const formatted = target >= 1000 ? `${(count / 1000).toFixed(count >= target ? 0 : 0)}K` : count.toString();
  return <span ref={ref}>{formatted}{suffix}</span>;
}

/* ─── Hero animated simulation graph (Linear/Vercel style) ─── */
function HeroGraph() {
  return (
    <div className="hero-graph">
      <svg viewBox="0 0 720 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="edgePass" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3"/><stop offset="100%" stopColor="#6daa84" stopOpacity="0.6"/></linearGradient>
          <linearGradient id="edgeFail" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3"/><stop offset="100%" stopColor="#c87e7e" stopOpacity="0.5"/></linearGradient>
        </defs>

        {/* Edges — curved paths */}
        <path d="M145,140 C185,140 185,85 225,85" stroke="url(#edgePass)" strokeWidth="2" fill="none" className="edge-draw" />
        <path d="M145,140 C185,140 185,210 225,210" stroke="url(#edgePass)" strokeWidth="2" fill="none" className="edge-draw delay-1" />
        <path d="M340,85 C370,85 370,55 405,55" stroke="#6daa84" strokeWidth="2" strokeOpacity="0.5" fill="none" className="edge-draw delay-2" />
        <path d="M340,85 C370,85 370,125 405,125" stroke="#c87e7e" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 3" fill="none" className="edge-draw delay-2" />
        <path d="M340,210 C370,210 370,195 405,195" stroke="#6daa84" strokeWidth="2" strokeOpacity="0.5" fill="none" className="edge-draw delay-2" />
        <path d="M340,210 C370,210 370,265 405,265" stroke="#c87e7e" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 3" fill="none" className="edge-draw delay-2" />
        <path d="M520,55 C555,55 555,50 590,50" stroke="#6daa84" strokeWidth="2" strokeOpacity="0.4" fill="none" className="edge-draw delay-3" />
        <path d="M520,195 C555,195 555,195 590,195" stroke="#6daa84" strokeWidth="2" strokeOpacity="0.4" fill="none" className="edge-draw delay-3" />
        <path d="M520,125 C555,125 555,125 590,125" stroke="#c87e7e" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" fill="none" className="edge-draw delay-3" />
        <path d="M520,265 C555,265 555,270 590,270" stroke="#c87e7e" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" fill="none" className="edge-draw delay-3" />

        {/* Edge labels */}
        <text x="372" y="50" fontSize="7" fontWeight="600" fill="#6daa84" opacity="0.8" className="node-appear delay-2" fontFamily="var(--font-geist-mono)">PASS</text>
        <text x="372" y="132" fontSize="7" fontWeight="600" fill="#c87e7e" opacity="0.7" className="node-appear delay-2" fontFamily="var(--font-geist-mono)">FAIL</text>
        <text x="372" y="190" fontSize="7" fontWeight="600" fill="#6daa84" opacity="0.8" className="node-appear delay-2" fontFamily="var(--font-geist-mono)">PASS</text>
        <text x="372" y="272" fontSize="7" fontWeight="600" fill="#c87e7e" opacity="0.7" className="node-appear delay-2" fontFamily="var(--font-geist-mono)">FAIL</text>

        {/* Node 1: STATE — starting point */}
        <g className="node-appear">
          <rect x="30" y="108" width="115" height="64" rx="10" fill="var(--surface)" stroke="#5f7d63" strokeWidth="1.5" />
          <text x="40" y="100" fontSize="7" fontWeight="500" fill="#5f7d63" fontFamily="var(--font-geist-mono)" letterSpacing="0.06em">STATE</text>
          <text x="88" y="130" textAnchor="middle" fill="var(--foreground)" fontSize="10" fontWeight="700">29yo, $40K saved</text>
          <text x="88" y="144" textAnchor="middle" fill="var(--muted-foreground)" fontSize="8">Wants to quit &amp; launch</text>
          <text x="88" y="162" textAnchor="middle" fill="var(--muted)" fontSize="7" fontFamily="var(--font-geist-mono)">BLS 2024</text>
        </g>

        {/* Node 2: BOTTLENECK — Product-Market Fit */}
        <g className="node-appear delay-1">
          <rect x="225" y="55" width="115" height="60" rx="10" fill="var(--surface)" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="235" y="48" fontSize="7" fontWeight="600" fill="#f59e0b" fontFamily="var(--font-geist-mono)" letterSpacing="0.06em">BOTTLENECK</text>
          <text x="283" y="77" textAnchor="middle" fill="var(--foreground)" fontSize="10" fontWeight="700">Product-market fit?</text>
          <text x="283" y="91" textAnchor="middle" fill="var(--muted-foreground)" fontSize="8">Only 30% of startups find it</text>
          {/* Prob badge */}
          <circle cx="323" cy="72" r="13" fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="1" />
          <text x="323" y="76" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="700" fontFamily="var(--font-geist-mono)">30%</text>
        </g>

        {/* Node 3: GATE — Funding */}
        <g className="node-appear delay-1">
          <rect x="225" y="185" width="115" height="52" rx="10" fill="var(--surface)" stroke="#d97706" strokeWidth="1.5" />
          <text x="235" y="178" fontSize="7" fontWeight="600" fill="#d97706" fontFamily="var(--font-geist-mono)" letterSpacing="0.06em">GATE</text>
          <text x="283" y="207" textAnchor="middle" fill="var(--foreground)" fontSize="10" fontWeight="700">Raise seed round?</text>
          <text x="283" y="221" textAnchor="middle" fill="var(--muted-foreground)" fontSize="8">1% of pitches get funded</text>
          <circle cx="323" cy="202" r="13" fill="#d97706" fillOpacity="0.12" stroke="#d97706" strokeWidth="1" />
          <text x="323" y="206" textAnchor="middle" fill="#d97706" fontSize="8" fontWeight="700" fontFamily="var(--font-geist-mono)">12%</text>
        </g>

        {/* Node 4: STATE — Revenue */}
        <g className="node-appear delay-2">
          <rect x="405" y="32" width="115" height="48" rx="10" fill="var(--surface)" stroke="#5f7d63" strokeWidth="1.5" />
          <text x="463" y="53" textAnchor="middle" fill="var(--foreground)" fontSize="9" fontWeight="700">$10K MRR, growing</text>
          <text x="463" y="67" textAnchor="middle" fill="var(--muted)" fontSize="7" fontFamily="var(--font-geist-mono)">Startup Genome 2024</text>
        </g>

        {/* Node 5: OUTCOME BAD — Run out of money */}
        <g className="node-appear delay-2">
          <rect x="405" y="105" width="115" height="40" rx="20" fill="#fef2f2" stroke="#e8a0a0" strokeWidth="1.5" />
          <text x="463" y="122" textAnchor="middle" fill="#b45555" fontSize="8" fontWeight="600">Run out of runway</text>
          <text x="463" y="137" textAnchor="middle" fill="#c87e7e" fontSize="7" fontFamily="var(--font-geist-mono)">29% fail: no cash</text>
        </g>

        {/* Node 6: STATE — Funded */}
        <g className="node-appear delay-2">
          <rect x="405" y="175" width="115" height="42" rx="10" fill="var(--surface)" stroke="#5f7d63" strokeWidth="1.5" />
          <text x="463" y="195" textAnchor="middle" fill="var(--foreground)" fontSize="9" fontWeight="700">$1.5M raised, hiring</text>
          <text x="463" y="208" textAnchor="middle" fill="var(--muted)" fontSize="7" fontFamily="var(--font-geist-mono)">PitchBook 2024</text>
        </g>

        {/* Node 7: OUTCOME BAD — No traction */}
        <g className="node-appear delay-2">
          <rect x="405" y="248" width="115" height="36" rx="18" fill="#fef2f2" stroke="#e8a0a0" strokeWidth="1.5" />
          <text x="463" y="270" textAnchor="middle" fill="#b45555" fontSize="8" fontWeight="600">No traction, pivot</text>
        </g>

        {/* Final: OUTCOME GOOD — Scale */}
        <g className="node-appear delay-3">
          <rect x="590" y="30" width="100" height="42" rx="21" fill="#f0faf4" stroke="#8dc5a0" strokeWidth="1.5" />
          <text x="640" y="48" textAnchor="middle" fill="#4a8a64" fontSize="9" fontWeight="700">$1M ARR</text>
          <text x="640" y="62" textAnchor="middle" fill="#6daa84" fontSize="7" fontFamily="var(--font-geist-mono)">Top 4%</text>
        </g>

        {/* Final: OUTCOME GOOD — Exit */}
        <g className="node-appear delay-3">
          <rect x="590" y="178" width="100" height="36" rx="18" fill="#f0faf4" stroke="#8dc5a0" strokeWidth="1.5" />
          <text x="640" y="200" textAnchor="middle" fill="#4a8a64" fontSize="9" fontWeight="700">Series A exit</text>
        </g>

        {/* Final: OUTCOME BAD */}
        <g className="node-appear delay-3">
          <rect x="590" y="108" width="100" height="36" rx="18" fill="#fef2f2" stroke="#e8a0a0" strokeWidth="1" opacity="0.6" />
          <text x="640" y="130" textAnchor="middle" fill="#c87e7e" fontSize="8">Founder burnout</text>
        </g>
        <g className="node-appear delay-3">
          <rect x="590" y="254" width="100" height="36" rx="18" fill="#fef2f2" stroke="#e8a0a0" strokeWidth="1" opacity="0.6" />
          <text x="640" y="276" textAnchor="middle" fill="#c87e7e" fontSize="8">Shut down</text>
        </g>

        {/* Animated particles — success path */}
        <g filter="url(#glow)">
          <circle r="4" fill="var(--accent)" opacity="0.9">
            <animateMotion dur="4s" repeatCount="indefinite" path="M88,140 C145,140 185,85 283,85 C340,85 370,55 463,55 C520,55 555,50 640,50" />
          </circle>
          <circle r="3.5" fill="#6daa84" opacity="0.7">
            <animateMotion dur="4.5s" repeatCount="indefinite" begin="0.6s" path="M88,140 C145,140 185,210 283,210 C340,210 370,195 463,195 C520,195 555,195 640,195" />
          </circle>
          <circle r="3" fill="#8b5cf6" opacity="0.6">
            <animateMotion dur="5s" repeatCount="indefinite" begin="1.2s" path="M88,140 C145,140 185,85 283,85 C340,85 370,55 463,55 C520,55 555,50 640,50" />
          </circle>
        </g>

        {/* Animated particles — fail paths */}
        <circle r="3" fill="#c87e7e" opacity="0.4">
          <animateMotion dur="3s" repeatCount="indefinite" begin="0.3s" path="M88,140 C145,140 185,85 283,85 C340,85 370,125 463,125 C520,125 555,125 640,125" />
        </circle>
        <circle r="2.5" fill="#c87e7e" opacity="0.3">
          <animateMotion dur="3.5s" repeatCount="indefinite" begin="1.5s" path="M88,140 C145,140 185,210 283,210 C340,210 370,265 463,265 C520,265 555,270 640,270" />
        </circle>

        {/* Stats bar */}
        <rect x="200" y="308" width="320" height="24" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" className="node-appear delay-3" />
        <circle cx="230" cy="320" r="4" fill="var(--accent)" className="node-appear delay-3" />
        <text x="240" y="324" fontSize="8" fontWeight="700" fill="var(--foreground)" className="node-appear delay-3" fontFamily="var(--font-geist-mono)">100</text>
        <text x="262" y="324" fontSize="7" fill="var(--muted)" className="node-appear delay-3">people</text>
        <circle cx="310" cy="320" r="4" fill="#6daa84" className="node-appear delay-3" />
        <text x="320" y="324" fontSize="8" fontWeight="700" fill="#4a8a64" className="node-appear delay-3" fontFamily="var(--font-geist-mono)">4</text>
        <text x="330" y="324" fontSize="7" fill="var(--muted)" className="node-appear delay-3">made it</text>
        <circle cx="385" cy="320" r="4" fill="#c87e7e" className="node-appear delay-3" />
        <text x="395" y="324" fontSize="8" fontWeight="700" fill="#b45555" className="node-appear delay-3" fontFamily="var(--font-geist-mono)">96</text>
        <text x="413" y="324" fontSize="7" fill="var(--muted)" className="node-appear delay-3">stopped</text>
        <text x="470" y="324" fontSize="8" fontWeight="700" fill="var(--foreground)" className="node-appear delay-3" fontFamily="var(--font-geist-mono)">4%</text>
        <text x="490" y="324" fontSize="7" fill="var(--muted)" className="node-appear delay-3">rate</text>
      </svg>
    </div>
  );
}

/* ─── Feature card icon (inline SVG, no emoji) ─── */
function FeatureIcon({ type }: { type: 'data' | 'deterministic' | 'graph' | 'ai' | 'speed' | 'sacred' }) {
  const icons: Record<string, React.ReactNode> = {
    data: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    ),
    deterministic: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    graph: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><circle cx="19" cy="6" r="2" /><path d="M5 8v1a4 4 0 004 4h6a4 4 0 004-4V8" /><line x1="12" y1="13" x2="12" y2="16" />
      </svg>
    ),
    ai: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4z" /><path d="M16 14a4 4 0 014 4v2H4v-2a4 4 0 014-4h8z" />
      </svg>
    ),
    speed: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    sacred: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };
  return <div className="feature-icon">{icons[type]}</div>;
}

/* ─── Unified numbers bar (static + dynamic from localStorage) ─── */
function NumbersBar() {
  const [simCount, setSimCount] = useState(0);

  useEffect(() => {
    const count = localStorage.getItem('sim-total-count');
    setSimCount(count ? parseInt(count, 10) : 0);
  }, []);

  return (
    <section className="numbers-bar">
      <div className="number-item">
        <div className="number-value"><Counter target={400} suffix="K" /></div>
        <div className="number-label">Data points</div>
      </div>
      <div className="number-item">
        <div className="number-value"><Counter target={216} /></div>
        <div className="number-label">Source files</div>
      </div>
      <div className="number-item">
        <div className="number-value"><Counter target={7} /></div>
        <div className="number-label">Live APIs</div>
      </div>
      <div className="number-item">
        <div className="number-value"><Counter target={18} /></div>
        <div className="number-label">Scenario templates</div>
      </div>
      {simCount > 0 && (
        <div className="number-item">
          <div className="number-value"><Counter target={simCount} /></div>
          <div className="number-label">Simulations run</div>
        </div>
      )}
    </section>
  );
}

/* ─── Main landing page ─── */
export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const placeholders = [
    'What if I drop out and start a company?',
    'Should I move to Bali or stay in Berlin?',
    'What happens if I invest $50K in Bitcoin?',
    'Can I retire at 40 with $2M saved?',
    'What if I switch from law to tech?',
  ];

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="landing-page">
      {/* ─── Nav ─── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><circle cx="19" cy="6" r="2" />
              <path d="M5 8v1a4 4 0 004 4h6a4 4 0 004-4V8" /><line x1="12" y1="13" x2="12" y2="16" />
            </svg>
            <span>Foresight</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#data">Data</a>
            <Link href="/arbitrage">Reality Check</Link>
            <Link href="/sim" className="nav-cta">Open Foresight</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className={`hero ${isVisible ? 'visible' : ''}`}>
        <div className="hero-badge">400,000+ verified data points</div>

        <h1 className="hero-title">
          Live the life you're afraid to choose<br />
          <span className="hero-gradient">before it's too late.</span>
        </h1>

        <p className="hero-sub">
          That decision keeping you up at night — quitting your job, moving countries,
          starting over — what if you could see how it actually plays out?
          Not a guess. Not a vibe. The real outcome, backed by data.
        </p>

        {/* Search input → goes to /sim */}
        <form
          className="hero-search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (q) {
              window.location.href = `/sim?q=${encodeURIComponent(q)}`;
            } else {
              window.location.href = '/sim';
            }
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholders[placeholderIdx]}
            className="hero-input"
          />
          <button type="submit" className="hero-btn">
            Simulate
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <div className="hero-meta">
          <span>Free</span>
          <span className="hero-dot" />
          <span>No signup required</span>
          <span className="hero-dot" />
          <span>Instant results</span>
        </div>

        <HeroGraph />
      </section>

      {/* ─── Numbers ─── */}
      <NumbersBar />

      {/* ─── Emotional hook ─── */}
      <section className="section-emotion">
        <div className="emotion-inner">
          <p className="emotion-quote">
            "I spent 3 years wondering if I should leave my job.
            I finally did. It was the wrong choice.
            I wish I could have seen it coming."
          </p>
          <p className="emotion-attr">
            — The story of millions. Every single day.
          </p>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section className="section-problem">
        <h2 className="section-heading">You already know the feeling.</h2>
        <p className="section-sub">
          Lying awake at 2am. Running the same scenario in your head for the hundredth time.
          Asking people who have never been where you're going.
          The data to answer your question exists — you just can't see it.
        </p>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-label old">How people decide</div>
            <ul className="problem-list">
              <li>Ask friends (sample size: 3)</li>
              <li>Read Reddit threads at 3am</li>
              <li>Follow gut feeling and pray</li>
              <li>Postpone until life decides for them</li>
            </ul>
          </div>
          <div className="problem-card">
            <div className="problem-label new">How Foresight works</div>
            <ul className="problem-list">
              <li>400K verified data points</li>
              <li>Sacred texts + psychology + economics</li>
              <li>See 100 people run your exact scenario</li>
              <li>Know who makes it — and exactly why</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="section-how">
        <h2 className="section-heading">From doubt to clarity in 30 seconds.</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3 className="step-title">Tell us what's on your mind</h3>
            <p className="step-desc">
              "I'm 28, thinking of quitting my $80K job to start a company.
              I have $12K saved and no co-founder." Just talk to it.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3 className="step-title">See every path unfold</h3>
            <p className="step-desc">
              AI maps your exact situation into a decision tree — every bottleneck,
              every fork, every outcome — backed by real-world data.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3 className="step-title">Watch 100 lives play out</h3>
            <p className="step-desc">
              100 people walk your path. Some make it. Some don't.
              You see exactly where things break — and what the survivors did differently.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="section-features">
        <h2 className="section-heading">This isn't another AI toy.</h2>
        <p className="section-sub">
          Other tools guess. We calculate. Every number traces back to a real source.
          Every outcome is deterministic — same input, same result, every time.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <FeatureIcon type="deterministic" />
            <h3>Deterministic engine</h3>
            <p>Same scenario, same graph, same result. Every time. Temperature 0. No randomness except cosmetic particles.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="data" />
            <h3>400K+ data points</h3>
            <p>Sacred texts, WHO mortality, BLS labor stats, YC failure rates, World Bank — all verified, all 2023+.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="sacred" />
            <h3>Sacred roots taxonomy</h3>
            <p>36 root causes from Bible, Quran, Torah, Bhagavad Gita, Tao Te Ching — the original decision frameworks.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="graph" />
            <h3>Interactive decision graphs</h3>
            <p>Watch your life unfold on an interactive canvas. Zoom into any decision point. Filter by success or failure path.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="ai" />
            <h3>Every claim has a source</h3>
            <p>AI retrieves from 91K+ verified embeddings. Click any number and see the study, the dataset, the URL. No black boxes.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="speed" />
            <h3>Answers in seconds</h3>
            <p>Type what's on your mind. Get a full decision map in seconds. No signup. No paywall. Just clarity.</p>
          </div>
        </div>
      </section>

      {/* ─── Data sources ─── */}
      <section id="data" className="section-data">
        <h2 className="section-heading">We don't make things up.</h2>
        <p className="section-sub">
          Every probability in every node traces back to a verified source.
          If we can't prove it, we don't show it.
        </p>
        <div className="data-grid">
          {[
            { name: 'Sacred Texts', desc: 'Bible, Quran, Torah, Bhagavad Gita, Tao Te Ching', count: '36 roots' },
            { name: 'WHO', desc: 'Global mortality, disease burden, life expectancy', count: '50K+ dp' },
            { name: 'Bureau of Labor', desc: 'Employment, wages, occupational outlook', count: '40K+ dp' },
            { name: 'World Bank', desc: 'GDP, poverty, education, development indicators', count: '30K+ dp' },
            { name: 'YC / VC Data', desc: 'Startup failure rates, funding patterns, exits', count: '15K+ dp' },
            { name: 'Psychology', desc: 'Behavioral studies, cognitive biases, decision research', count: '20K+ dp' },
          ].map((s) => (
            <div key={s.name} className="data-card">
              <div className="data-card-header">
                <span className="data-name">{s.name}</span>
                <span className="data-count">{s.count}</span>
              </div>
              <p className="data-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── vs comparison ─── */}
      <section className="section-vs">
        <h2 className="section-heading">Foresight vs. the alternatives.</h2>
        <div className="vs-table-wrap">
          <table className="vs-table">
            <thead>
              <tr>
                <th></th>
                <th>Foresight</th>
                <th>ChatGPT</th>
                <th>Spreadsheets</th>
                <th>Gut feeling</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Deterministic output</td><td className="yes">Yes</td><td className="no">No</td><td className="partial">Partial</td><td className="no">No</td></tr>
              <tr><td>Source-backed data</td><td className="yes">400K+ dp</td><td className="no">Training data</td><td className="partial">Manual</td><td className="no">None</td></tr>
              <tr><td>Visual decision graph</td><td className="yes">Interactive</td><td className="no">Text only</td><td className="no">Charts</td><td className="no">None</td></tr>
              <tr><td>Sacred text integration</td><td className="yes">36 roots</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
              <tr><td>Simulation (100 people)</td><td className="yes">Real-time</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
              <tr><td>Free, no signup</td><td className="yes">Yes</td><td className="partial">Freemium</td><td className="yes">Yes</td><td className="yes">Yes</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="section-cta">
        <h2 className="cta-heading">Your next chapter<br />doesn't have to be a gamble.</h2>
        <p className="cta-sub">
          The decision you've been putting off — type it in. See what happens. Free, forever.
        </p>
        <Link href="/sim" className="cta-button">
          Open Foresight
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><circle cx="19" cy="6" r="2" />
              <path d="M5 8v1a4 4 0 004 4h6a4 4 0 004-4V8" /><line x1="12" y1="13" x2="12" y2="16" />
            </svg>
            <span>Foresight</span>
          </div>
          <p className="footer-copy">Deterministic decision engine. Built with real data.</p>
        </div>
      </footer>
    </main>
  );
}
