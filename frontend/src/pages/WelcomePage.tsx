import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <div className="absolute -top-20 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm mb-6">
            UI Quality Guidance
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Build Confidence in Every Pixel.
          </h1>
          <p className="mt-5 text-slate-200 text-lg leading-relaxed max-w-xl">
            ExpliUI helps you detect UI issues with a guided, professional workflow.
            Upload your screenshots, review evidence, and act on clear insights with speed.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            Start Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">What you get</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
              <span className="text-slate-100">Step-by-step guidance from upload to final report.</span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-300 mt-0.5" />
              <span className="text-slate-100">Reliable issue evidence for faster debugging decisions.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
              <span className="text-slate-100">Clear dashboard actions to launch and manage each test session.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}