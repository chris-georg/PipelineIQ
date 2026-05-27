import { useState, useEffect, useRef, useCallback } from "react";

interface LeadInput {
  budget: number;
  timeline: number;
  mortgage: boolean;
  hasPhone: boolean;
  urgency: number;
}

interface ScoreResult {
  score: number;
  status: "Hot Lead" | "Qualified" | "Not Qualified";
  breakdown: { label: string; points: number; max: number }[];
}

function calcScore(input: LeadInput): ScoreResult {
  const breakdown = [
    {
      label: "Budget size",
      points:
        input.budget >= 800000
          ? 25
          : input.budget >= 500000
            ? 18
            : input.budget >= 300000
              ? 12
              : 6,
      max: 25,
    },
    {
      label: "Purchase timeline",
      points:
        input.timeline <= 30
          ? 25
          : input.timeline <= 60
            ? 18
            : input.timeline <= 90
              ? 10
              : 4,
      max: 25,
    },
    { label: "Mortgage status", points: input.mortgage ? 25 : 5, max: 25 },
    { label: "Contact completeness", points: input.hasPhone ? 15 : 5, max: 15 },
    {
      label: "Inquiry urgency",
      points: Math.round((input.urgency / 10) * 10),
      max: 10,
    },
  ];
  const score = breakdown.reduce((sum, b) => sum + b.points, 0);
  const status: ScoreResult["status"] =
    score >= 80 ? "Hot Lead" : score >= 50 ? "Qualified" : "Not Qualified";
  return { score, status, breakdown };
}

function useCountUp(target: number, duration = 1200, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration, active]);
  return value;
}

function ScoreBar({
  label,
  points,
  max,
  delay,
  active,
}: {
  label: string;
  points: number;
  max: number;
  delay: number;
  active: boolean;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setWidth((points / max) * 100), delay);
    return () => clearTimeout(t);
  }, [active, points, max, delay]);

  const barColor =
    points / max >= 0.8
      ? "bg-cyan-400"
      : points / max >= 0.5
        ? "bg-amber-400"
        : "bg-gray-500";

  return (
    <div>
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">
          {points}
          <span className="text-gray-500">/{max}</span>
        </span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function LiveDemo() {
  const { ref, inView } = useInView();
  const [lead, setLead] = useState<LeadInput>({
    budget: 600000,
    timeline: 45,
    mortgage: true,
    hasPhone: true,
    urgency: 7,
  });
  const result = calcScore(lead);
  const statusColor =
    result.status === "Hot Lead"
      ? "text-cyan-400"
      : result.status === "Qualified"
        ? "text-amber-400"
        : "text-gray-500";
  const statusBg =
    result.status === "Hot Lead"
      ? "bg-cyan-400/10 text-cyan-400"
      : result.status === "Qualified"
        ? "bg-amber-400/10 text-amber-400"
        : "bg-white/5 text-gray-400";
  const update = useCallback(
    <K extends keyof LeadInput>(k: K, v: LeadInput[K]) =>
      setLead((prev) => ({ ...prev, [k]: v })),
    [],
  );
  const scoreVal = useCountUp(result.score, 600, true);

  return (
    <section
      id="live-demo"
      ref={ref}
      className="py-16 md:py-24 border-b border-white/10 bg-black"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div
          className={`text-center mb-8 md:mb-14 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Live Demo
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black">
            See the AI{" "}
            <span className="text-cyan-400">score leads in real time</span>
          </h2>
          <p className="mt-3 md:mt-4 text-gray-300 text-base md:text-lg">
            Example: For Real Estate
          </p>

          <p className="mt-2 md:mt-1 text-gray-300 text-base md:text-lg">
            Adjust the sliders — watch your lead score update instantly. 
          </p>
        </div>

        {/* Main Card - Mobile first column layout */}
        <div
          className={`flex flex-col lg:flex-row gap-px bg-white/10 rounded-2xl overflow-hidden transition-all duration-700 delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          {/* Lead Details Section */}
          <div className="bg-zinc-900 p-5 md:p-8 w-full lg:w-1/2">
            <p className="text-xs tracking-widest uppercase text-gray-500 mb-4 md:mb-5">
              Lead details
            </p>

            {/* Budget Slider */}
            <div className="mb-5 md:mb-6">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                <span className="text-sm md:text-base text-gray-400">
                  Budget
                </span>
                <span className="text-white font-semibold text-sm md:text-base">
                  ${(lead.budget / 1000).toFixed(0)}k
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={1500000}
                step={50000}
                value={lead.budget}
                onChange={(e) => update("budget", Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                style={{
                  WebkitAppearance: "none",
                }}
              />
            </div>

            {/* Timeline Slider */}
            <div className="mb-5 md:mb-6">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                <span className="text-sm md:text-base text-gray-400">
                  Timeline to buy
                </span>
                <span className="text-white font-semibold text-sm md:text-base">
                  {lead.timeline} days
                </span>
              </div>
              <input
                type="range"
                min={7}
                max={180}
                step={1}
                value={lead.timeline}
                onChange={(e) => update("timeline", Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                style={{
                  WebkitAppearance: "none",
                }}
              />
            </div>

            {/* Urgency Slider */}
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                <span className="text-sm md:text-base text-gray-400">
                  Inquiry urgency
                </span>
                <span className="text-white font-semibold text-sm md:text-base">
                  {lead.urgency}/10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={lead.urgency}
                onChange={(e) => update("urgency", Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                style={{
                  WebkitAppearance: "none",
                }}
              />
            </div>

            {/* Toggle Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => update("mortgage", !lead.mortgage)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                  lead.mortgage
                    ? "border-cyan-400 bg-cyan-400/5 text-cyan-400"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-150 ${
                    lead.mortgage
                      ? "bg-cyan-400 border-cyan-400"
                      : "bg-transparent border-2 border-white/20"
                  }`}
                >
                  {lead.mortgage && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-sm md:text-base">
                  Pre-approved for mortgage
                </span>
              </button>

              <button
                onClick={() => update("hasPhone", !lead.hasPhone)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                  lead.hasPhone
                    ? "border-cyan-400 bg-cyan-400/5 text-cyan-400"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-150 ${
                    lead.hasPhone
                      ? "bg-cyan-400 border-cyan-400"
                      : "bg-transparent border-2 border-white/20"
                  }`}
                >
                  {lead.hasPhone && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-sm md:text-base">
                  Phone number provided
                </span>
              </button>
            </div>
          </div>

          {/* AI Result Section */}
          <div className="bg-zinc-950 p-5 md:p-8 w-full lg:w-1/2">
            <p className="text-xs tracking-widest uppercase text-gray-500 mb-4 md:mb-5">
              AI Result
            </p>

            {/* Score and Status */}
            <div className="flex items-center gap-4 md:gap-6 flex-wrap mb-6 md:mb-8">
              <div
                className={`w-[70px] h-[70px] md:w-20 md:h-20 rounded-full bg-white/5 border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                  result.status === "Hot Lead"
                    ? "border-cyan-400" + statusColor
                    : result.status === "Qualified"
                      ? "border-amber-400"
                      : "border-gray-500"
                }`}
              >
                <span
                  className={`font-mono text-2xl md:text-3xl font-bold transition-all duration-300 ${
                    result.status === "Hot Lead"
                      ? "text-cyan-400"
                      : result.status === "Qualified"
                        ? "text-amber-400"
                        : "text-gray-500"
                  }`}
                >
                  {scoreVal}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 tracking-wide">
                  STATUS
                </p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${statusBg}`}
                >
                  {result.status === "Hot Lead" && "🔥 "}
                  {result.status}
                </span>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-4">
              {result.breakdown.map((b, i) => (
                <ScoreBar key={i} {...b} delay={i * 80} active={inView} />
              ))}
            </div>

            {/* Hot Lead Alert */}
            {result.status === "Hot Lead" && (
              <div className="mt-5 md:mt-6 bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-3 md:p-4 text-gray-300 text-xs md:text-sm leading-relaxed animate-fadeIn">
                <span className="inline mr-1.5 text-cyan-400">🔔</span>
                Alert would fire instantly for this lead
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        
        /* Custom range input styling for better mobile touch */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        
        input[type="range"]:focus {
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          margin-top: -6px;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-webkit-slider-runnable-track {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #fff;
        }
        
        input[type="range"]::-moz-range-track {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
        
        /* Touch-friendly button tap highlight removal */
        button {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Responsive adjustments */
        @media (min-width: 768px) {
          input[type="range"]::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
            margin-top: -8px;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </section>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function PipelineIQLandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const features = [
    {
      title: "Instant Lead Capture",
      description:
        "Capture and process website leads automatically the moment they submit a form.",
    },
    {
      title: "AI Lead Qualification",
      description:
        "Automatically analyze buyer intent, budget, urgency, and seriousness using AI.",
    },
    {
      title: "Smart Lead Scoring",
      description:
        "Prioritize high-value opportunities with intelligent scoring and hot lead detection.",
    },
    {
      title: "24/7 Automated Follow-Up",
      description:
        "Respond instantly to every lead with personalized AI-powered emails.",
    },
    {
      title: "Real-Time Alerts",
      description:
        "Get Notifications immediately when hot leads enter your pipeline.",
    },
    {
      title: "Pipeline Automation",
      description:
        "Automate qualification, routing, organization, and notifications end-to-end.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Lead Comes In",
      description:
        "A visitor submits a form and PipelineIQ instantly captures the lead.",
    },
    {
      step: "02",
      title: "AI Qualifies & Scores",
      description:
        "The system analyzes budget, urgency, and seriousness automatically.",
    },
    {
      step: "03",
      title: "Hot Leads Get Prioritized",
      description:
        "High-value prospects are identified and escalated instantly.",
    },
    {
      step: "04",
      title: "You Close More Deals",
      description: "Your team focuses only on leads most likely to convert.",
    },
  ];

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg"
            >
              ✕
            </button>

            <p className="text-cyan-400 font-semibold uppercase tracking-[0.2em] text-xs">
              Book a Free Demo Call
            </p>

            <h2 className="mt-3 text-2xl md:text-3xl font-black leading-tight">
              Close more deals with PipelineIQ
            </h2>

            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
              See how PipelineIQ helps you qualify, score, and convert leads
              automatically.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;

                // Show success message
                setSubmittedName(name);
                setShowSuccessMessage(true);

                // Reset form
                e.currentTarget.reset();

                // Hide success message after 5 seconds
                setTimeout(() => {
                  setShowSuccessMessage(false);
                }, 5000);

                // Optional: Send data to webhook without page reload
                fetch("https://workflow-ayuj.onrender.com/webhook/form", {
                  method: "POST",
                  body: formData,
                }).catch((err) => console.error("Webhook error:", err));
              }}
              className="mt-6 space-y-4"
            >
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="Full name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />

              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Work email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />

              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone number (optional)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />

              <input
                type="text"
                id="company"
                name="company"
                required
                placeholder="Company / Team name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />

              <textarea
                id="business"
                name="business"
                placeholder="Tell us a bit about your business"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400 resize-vertical"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 py-3 font-bold text-black hover:bg-cyan-300 transition-all"
              >
                Request Demo Call →
              </button>

              <p className="mt-3 text-gray-400 text-sm leading-relaxed text-center">
                Our team will reach out shortly.
              </p>
            </form>

            {/* Success Message Popup */}
            {showSuccessMessage && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6 animate-fadeIn">
                <div className="w-full max-w-md rounded-2xl border border-green-400/30 bg-linear-to-br from-green-500/10 to-emerald-500/5 bg-zinc-950 shadow-2xl p-6 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-white font-medium text-base leading-relaxed">
                    Awesome, {submittedName}! Your demo request has been
                    successfully received.
                  </p>
                  <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                    We've just sent a confirmation email to your inbox—please
                    check it. Get ready to close more deals with less effort. 🚀
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 via-transparent to-blue-500/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 mb-6">
                AI-Powered Lead Automation System
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">
                Close More Deals.
                <span className="block text-cyan-400">Automate the Rest.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg text-gray-300 leading-relaxed">
                PipelineIQ automatically captures, qualifies, scores, and
                prioritizes your leads so your team can focus on the prospects
                most likely to convert.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-black hover:bg-cyan-300 transition-all"
                >
                  Book Free Demo
                </button>

                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="rounded-2xl border border-white/20 px-8 py-4 font-semibold hover:border-cyan-400 hover:bg-white/5 transition-all"
                >
                  See How It Works
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-400">Hot Lead Detected</p>
                    <h3 className="text-2xl font-bold mt-1">Lead Score: 92</h3>
                  </div>

                  <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />
                </div>

                <div className="space-y-5">
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">John Doe</p>
                        <p className="text-gray-400 text-sm">
                          Budget: $750,000
                        </p>
                      </div>

                      <span className="bg-cyan-400/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Qualified
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
                      <div>
                        <p className="text-gray-500">Timeline</p>
                        <p>Within 30 Days</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Mortgage</p>
                        <p>Pre-Approved</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-2xl p-5">
                    <p className="text-sm text-cyan-300 mb-2">Alert</p>
                    <p className="font-semibold">🔥 New Hot Lead Detected</p>
                    <p className="text-gray-300 text-sm mt-2">
                      High-intent buyer identified and prioritized
                      automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="bg-zinc-950 py-24 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Why Businesses Use PipelineIQ
            </p>

            <h2 className="mt-4 text-4xl lg:text-5xl font-black">
              Stop Treating Every Lead The Same
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-cyan-400/30 transition-all"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl font-black text-cyan-400">
                  {index + 1}
                </div>

                <h3 className="mb-4 text-2xl font-bold">{feature.title}</h3>
                <p className="leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              How It Works
            </p>

            <h2 className="mt-4 text-4xl lg:text-5xl font-black">
              Your AI-Powered Lead Pipeline In 4 Steps
            </h2>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => (
              <div
                key={index}
                className="relative rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <p className="absolute top-5 right-5 text-6xl font-black text-cyan-400/20">
                  {item.step}
                </p>

                <div className="relative z-10">
                  <h3 className="mb-4 text-2xl font-bold">{item.title}</h3>
                  <p className="leading-relaxed text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LiveDemo />

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="overflow-hidden rounded-[40px] border border-cyan-400/20 bg-linear-to-br from-cyan-400/15 via-black to-blue-500/10 p-12 lg:p-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Ready To Scale Your Pipeline?
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl lg:text-6xl font-black leading-tight">
              Turn More Leads Into Revenue With PipelineIQ
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-300">
              Automate lead qualification, scoring, prioritization, and
              follow-up so your business can focus on closing more deals.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => setShowDemoModal(true)}
                className="rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-black hover:bg-cyan-300 transition-all"
              >
                Book Your Free Demo
              </button>

              <button
                onClick={() =>
                  (window.location.href = "mailto:hello.nexusflow@gmail.com")
                }
                className="rounded-2xl border border-white/20 px-8 py-4 font-semibold hover:border-cyan-400 hover:bg-white/5 transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="text-gray-500 text-xs text-center mb-4">
        © 2026 PipelineIQ — AI-powered lead automation for modern sales teams.
        Stop manual tracking, start closing.
      </div>
    </div>
  );
}
