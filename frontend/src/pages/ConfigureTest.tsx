import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { CheckCircle2, Clock, Layers, Play, ShieldCheck } from "lucide-react";

export default function ConfigureTest() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as any;
  const pairs = state?.pairs || [];
  const uploadResponse = state?.uploadResponse || null;

  const confirmedCount = pairs.filter((p: any) => p.stage === "confirmed").length;

  return (
    <div className="bg-slate-200 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Configure Comparison</h1>
              <p className="text-slate-500 mt-1">
                Review your uploaded pairs and confirm you're ready to run analysis.
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-slate-700">
                <Layers className="w-4 h-4 text-slate-500" />
                Review
              </span>
              <span className="text-slate-400">→</span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-50 text-blue-700 border-blue-200">
                <Play className="w-4 h-4" />
                Start Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl border shadow-sm overflow-hidden mb-8 bg-white">
          <div className="px-6 py-5 bg-blue-950 text-white">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold">Session Summary</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Confirm your pairs and start the analysis.
                </p>
              </div>

              {uploadResponse ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/20">
                  <ShieldCheck className="w-4 h-4" />
                  Data loaded
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  <Clock className="w-4 h-4" />
                  Not started
                </span>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Total Pairs</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{pairs.length}</div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Confirmed</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{confirmedCount}</div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Status</div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                {pairs.length > 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-slate-800">Ready for analysis</span>
                  </>
                ) : (
                  <span className="text-slate-600">No pairs found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pairs Preview */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-24">
          <div className="px-6 py-4 border-b px-6 py-5 bg-blue-950 text-white flex items-center justify-between">
            <h3 className="font-semibold text-white">Pairs Preview</h3>
            <span className="text-xs text-white">
              Showing up to {Math.min(5, pairs.length)} pairs
            </span>
          </div>

          {pairs.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No pairs were passed to this page. Go back and upload at least one pair.
            </div>
          ) : (
            <div className="divide-y">
              {pairs.slice(0, 5).map((p: any) => (
                <div key={p.id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-slate-800">Pair {p.id}</span>

                      <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                        {p.comparisonMode || "No mode"}
                      </span>

                      <span
                        className={[
                          "text-xs font-semibold px-3 py-1 rounded-full border",
                          p.stage === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        ].join(" ")}
                      >
                        {p.stage === "confirmed" ? "Confirmed" : "Draft"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Review mode and confirmation status before starting analysis.
                    </p>
                  </div>

                  <div className="shrink-0 text-sm font-medium text-slate-600">
                    #{String(p.id).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              {pairs.length === 0 ? (
                <span>Add at least one pair to continue.</span>
              ) : (
                <span>
                  Ready: <b className="text-slate-800">{pairs.length}</b> pair(s)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">

              <Button
                disabled={pairs.length === 0}
                onClick={() => {
                  console.log("Start Analysis clicked");
                  console.log("Sending state:", { pairs, uploadResponse });
                  navigate("/results/demo", {
                    state: { pairs, uploadResponse },
                  });
                }}
              >
                Start Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
