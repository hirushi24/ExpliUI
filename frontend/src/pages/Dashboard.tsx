import { ArrowRight, CheckCircle2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const generateFiveDigitId = () => Math.floor(10000 + Math.random() * 90000);

  const handleStart = (path: string) => {
    const userId = generateFiveDigitId();
    const sessionId = generateFiveDigitId();

    localStorage.setItem("Id", userId.toString());
    localStorage.setItem("SessionId", sessionId.toString());

    navigate(path);
  };

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <div className="absolute -top-20 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm mb-6">
            Test Workspace
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Start a New UI Validation Session.
          </h1>
          <p className="mt-5 text-slate-200 text-lg leading-relaxed max-w-2xl">
            Launch your next comparison with a guided flow designed for speed and clarity.
            Upload screenshots, capture metadata, and move confidently to analysis.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6 items-stretch">
          <button
            type="button"
            onClick={() => handleStart("/new-test/upload")}
            className="lg:col-span-2 text-left group rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-7 transition-all hover:border-blue-300 hover:bg-white/15 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-200 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-semibold text-white">Upload Screenshots</h2>
            <p className="mt-3 text-slate-200 leading-relaxed max-w-2xl">
              Upload screenshot pairs (for example, Chrome vs Firefox) and compare layouts,
              spacing, alignment, and visual consistency in a structured workflow.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 text-blue-200 font-semibold group-hover:text-blue-100">
              Start upload flow
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Why this flow works</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" />
                <span>Guided steps reduce setup mistakes.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" />
                <span>Consistent metadata gives cleaner comparison output.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" />
                <span>Fast handoff from upload to issue analysis.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}