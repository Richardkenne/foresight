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

/* ─── Node graph animation (hero) ─── */
function HeroGraph() {
  return (
    <div className="hero-graph">
      <svg viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Edges */}
        <line x1="100" y1="150" x2="220" y2="80" stroke="var(--border)" strokeWidth="1.5" className="edge-draw" />
        <line x1="100" y1="150" x2="220" y2="220" stroke="var(--border)" strokeWidth="1.5" className="edge-draw delay-1" />
        <line x1="220" y1="80" x2="380" y2="50" stroke="var(--success)" strokeWidth="1.5" strokeOpacity="0.6" className="edge-draw delay-2" />
        <line x1="220" y1="80" x2="380" y2="110" stroke="var(--danger)" strokeWidth="1.5" strokeOpacity="0.6" className="edge-draw delay-2" />
        <line x1="220" y1="220" x2="380" y2="190" stroke="var(--success)" strokeWidth="1.5" strokeOpacity="0.6" className="edge-draw delay-2" />
        <line x1="220" y1="220" x2="380" y2="250" stroke="var(--danger)" strokeWidth="1.5" strokeOpacity="0.6" className="edge-draw delay-2" />
        <line x1="380" y1="50" x2="500" y2="50" stroke="var(--success)" strokeWidth="1.5" strokeOpacity="0.4" className="edge-draw delay-3" />
        <line x1="380" y1="190" x2="500" y2="190" stroke="var(--success)" strokeWidth="1.5" strokeOpacity="0.4" className="edge-draw delay-3" />
        <line x1="380" y1="110" x2="500" y2="110" stroke="var(--danger)" strokeWidth="1.5" strokeOpacity="0.4" className="edge-draw delay-3" />
        <line x1="380" y1="250" x2="500" y2="250" stroke="var(--danger)" strokeWidth="1.5" strokeOpacity="0.4" className="edge-draw delay-3" />

        {/* Start node */}
        <rect x="70" y="130" width="60" height="40" rx="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" className="node-appear" />
        <text x="100" y="155" textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="600" className="node-appear">YOU</text>

        {/* Decision nodes (diamonds) */}
        <g className="node-appear delay-1">
          <rect x="200" y="60" width="40" height="40" rx="4" fill="var(--surface)" stroke="var(--purple)" strokeWidth="1.5" transform="rotate(45 220 80)" />
          <text x="220" y="84" textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" fontWeight="500">Path A</text>
        </g>
        <g className="node-appear delay-1">
          <rect x="200" y="200" width="40" height="40" rx="4" fill="var(--surface)" stroke="var(--purple)" strokeWidth="1.5" transform="rotate(45 220 220)" />
          <text x="220" y="224" textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" fontWeight="500">Path B</text>
        </g>

        {/* Outcome nodes */}
        <rect x="360" y="35" width="40" height="30" rx="6" fill="var(--success)" fillOpacity="0.15" stroke="var(--success)" strokeWidth="1" className="node-appear delay-2" />
        <text x="380" y="54" textAnchor="middle" fill="var(--success)" fontSize="8" fontWeight="600" className="node-appear delay-2">72%</text>

        <rect x="360" y="95" width="40" height="30" rx="6" fill="var(--danger)" fillOpacity="0.15" stroke="var(--danger)" strokeWidth="1" className="node-appear delay-2" />
        <text x="380" y="114" textAnchor="middle" fill="var(--danger)" fontSize="8" fontWeight="600" className="node-appear delay-2">28%</text>

        <rect x="360" y="175" width="40" height="30" rx="6" fill="var(--success)" fillOpacity="0.15" stroke="var(--success)" strokeWidth="1" className="node-appear delay-2" />
        <text x="380" y="194" textAnchor="middle" fill="var(--success)" fontSize="8" fontWeight="600" className="node-appear delay-2">45%</text>

        <rect x="360" y="235" width="40" height="30" rx="6" fill="var(--danger)" fillOpacity="0.15" stroke="var(--danger)" strokeWidth="1" className="node-appear delay-2" />
        <text x="380" y="254" textAnchor="middle" fill="var(--danger)" fontSize="8" fontWeight="600" className="node-appear delay-2">55%</text>

        {/* Final outcomes */}
        <circle cx="500" cy="50" r="14" fill="var(--success)" fillOpacity="0.2" stroke="var(--success)" strokeWidth="1" className="node-appear delay-3" />
        <text x="500" y="54" textAnchor="middle" fill="var(--success)" fontSize="8" className="node-appear delay-3">Win</text>

        <circle cx="500" cy="110" r="14" fill="var(--danger)" fillOpacity="0.2" stroke="var(--danger)" strokeWidth="1" className="node-appear delay-3" />
        <text x="500" y="114" textAnchor="middle" fill="var(--danger)" fontSize="8" className="node-appear delay-3">Fail</text>

        <circle cx="500" cy="190" r="14" fill="var(--success)" fillOpacity="0.2" stroke="var(--success)" strokeWidth="1" className="node-appear delay-3" />
        <text x="500" y="194" textAnchor="middle" fill="var(--success)" fontSize="8" className="node-appear delay-3">Win</text>

        <circle cx="500" cy="250" r="14" fill="var(--danger)" fillOpacity="0.2" stroke="var(--danger)" strokeWidth="1" className="node-appear delay-3" />
        <text x="500" y="254" textAnchor="middle" fill="var(--danger)" fontSize="8" className="node-appear delay-3">Fail</text>

        {/* Animated particle on success path */}
        <circle r="3" fill="var(--accent)" opacity="0.8">
          <animateMotion dur="3s" repeatCount="indefinite" path="M100,150 L220,80 L380,50 L500,50" />
        </circle>
        <circle r="3" fill="var(--purple)" opacity="0.6">
          <animateMotion dur="3.5s" repeatCount="indefinite" begin="0.8s" path="M100,150 L220,220 L380,250 L500,250" />
        </circle>
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
            <span>Simulator</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#data">Data</a>
            <Link href="/sim" className="nav-cta">Open Simulator</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className={`hero ${isVisible ? 'visible' : ''}`}>
        <div className="hero-badge">350,000+ verified data points</div>

        <h1 className="hero-title">
          See the outcome<br />
          <span className="hero-gradient">before you decide.</span>
        </h1>

        <p className="hero-sub">
          The first deterministic life simulator. No guessing, no vibes —
          real data from sacred texts, psychology, and economics mapped into
          decision graphs that show exactly who makes it and who doesn't.
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
      <section className="numbers-bar">
        <div className="number-item">
          <div className="number-value"><Counter target={350} suffix="K" /></div>
          <div className="number-label">Data points</div>
        </div>
        <div className="number-item">
          <div className="number-value"><Counter target={114} /></div>
          <div className="number-label">Source datasets</div>
        </div>
        <div className="number-item">
          <div className="number-value"><Counter target={7} /></div>
          <div className="number-label">Live APIs</div>
        </div>
        <div className="number-item">
          <div className="number-value"><Counter target={18} /></div>
          <div className="number-label">Scenario templates</div>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section className="section-problem">
        <h2 className="section-heading">The world runs on guesswork.</h2>
        <p className="section-sub">
          People agonize over decisions — career, money, relationships, faith — then pick
          based on feelings. The data exists to know what actually happens. Nobody uses it.
        </p>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-label old">How people decide</div>
            <ul className="problem-list">
              <li>Ask friends (sample size: 3)</li>
              <li>Read Reddit threads</li>
              <li>Follow gut feeling</li>
              <li>Hope for the best</li>
            </ul>
          </div>
          <div className="problem-card">
            <div className="problem-label new">How Simulator works</div>
            <ul className="problem-list">
              <li>350K verified data points</li>
              <li>Sacred text + psychology + economics</li>
              <li>Deterministic decision graphs</li>
              <li>Exact probabilities, zero randomness</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="section-how">
        <h2 className="section-heading">Three steps to clarity.</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3 className="step-title">Describe your scenario</h3>
            <p className="step-desc">
              Type any life or business decision in plain language.
              "I'm 28, want to quit my $80K job and start a SaaS."
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3 className="step-title">AI builds the graph</h3>
            <p className="step-desc">
              Claude AI maps your scenario into nodes — states, actions, bottlenecks,
              trajectories — backed by real data and sacred root causes.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3 className="step-title">Watch the simulation</h3>
            <p className="step-desc">
              100 people run your exact scenario. See who passes each bottleneck,
              who fails, and why. Every probability is a fact, not a guess.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="section-features">
        <h2 className="section-heading">Not another AI toy.</h2>
        <p className="section-sub">
          Built on verified data, deterministic logic, and source triangulation — not vibes.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <FeatureIcon type="deterministic" />
            <h3>Deterministic engine</h3>
            <p>Same scenario, same graph, same result. Every time. Temperature 0. No randomness except cosmetic particles.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="data" />
            <h3>350K+ data points</h3>
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
            <p>React Flow canvas with 11 node types, auto-layout, path filtering, step-by-step mode, and particle simulation.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="ai" />
            <h3>RAG-powered AI</h3>
            <p>Claude Haiku + Supabase pgvector with 62K embeddings. Every claim traced to a source with URL.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon type="speed" />
            <h3>Instant simulation</h3>
            <p>Type a scenario, get a full decision graph in seconds. No signup, no paywall, no friction.</p>
          </div>
        </div>
      </section>

      {/* ─── Data sources ─── */}
      <section id="data" className="section-data">
        <h2 className="section-heading">Backed by real data.</h2>
        <p className="section-sub">
          Every probability in every node traces back to a verified source.
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
        <h2 className="section-heading">Simulator vs. the alternatives.</h2>
        <div className="vs-table-wrap">
          <table className="vs-table">
            <thead>
              <tr>
                <th></th>
                <th>Simulator</th>
                <th>ChatGPT</th>
                <th>Spreadsheets</th>
                <th>Gut feeling</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Deterministic output</td><td className="yes">Yes</td><td className="no">No</td><td className="partial">Partial</td><td className="no">No</td></tr>
              <tr><td>Source-backed data</td><td className="yes">350K+ dp</td><td className="no">Training data</td><td className="partial">Manual</td><td className="no">None</td></tr>
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
        <h2 className="cta-heading">Stop guessing.<br />Start simulating.</h2>
        <p className="cta-sub">
          Type any life or business scenario. See the outcome in seconds. Free, forever.
        </p>
        <Link href="/sim" className="cta-button">
          Open Simulator
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
            <span>Simulator</span>
          </div>
          <p className="footer-copy">Deterministic life simulation. Built with real data.</p>
        </div>
      </footer>
    </main>
  );
}
