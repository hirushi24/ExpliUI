import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import type { TestResults } from "../../types/Results";

// Results summary card with modal drill-downs for the affected and passing pair previews.
interface PairPreview {
  pairId: string;
  imageA: string;
  imageB: string;
}

interface Props {
  summary: TestResults["summary"];
  metadata: TestResults["test_metadata"];
  pairsWithIssuesCount?: number;
  pairsWithoutIssuesCount?: number;
  pairsWithIssues?: PairPreview[];
  pairsWithoutIssues?: PairPreview[];
}

export function SummaryCard({
  summary,
  metadata,
  pairsWithIssuesCount = 0,
  pairsWithoutIssuesCount = 0,
  pairsWithIssues = [],
  pairsWithoutIssues = [],
}: Props) {
  // The modal reuses the pair preview data already assembled by the results page.
  const [modalState, setModalState] = useState<{
    open: boolean;
    title: string;
    pairs: PairPreview[];
  }>({
    open: false,
    title: "",
    pairs: [],
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const openPairsModal = (title: string, pairs: PairPreview[]) => {
    setModalState({
      open: true,
      title,
      pairs,
    });
  };

  const closePairsModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="bg-blue-950 px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Test Completed</h2>

            {metadata.url && (
              <p className="mt-1 text-sm text-blue-100">
                URL: <span className="font-semibold text-white">{metadata.url}</span>
              </p>
            )}

            <p className="mt-1 text-sm text-blue-100">Completed {formatDate(metadata.completed_at)}</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-blue-100">Total Pairs</div>
            <div className="text-3xl font-bold">{summary.total_pairs}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Issues Found
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Attention
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">UI differences detected across environments</p>

            <div className="mt-6 text-xl font-bold text-slate-800">
              Pairs With Issues: <span className="font-bold text-slate-800">{pairsWithIssuesCount}</span>
            </div>

            <div className="mt-3 text-md text-slate-800">Issues Count: {summary.issues_detected}</div>

            {pairsWithIssues.length > 0 && (
              <PairPreviewSection
                title="Affected Image Pairs"
                pairs={pairsWithIssues}
                onViewInModal={() => openPairsModal("Affected Image Pairs", pairsWithIssues)}
              />
            )}
          </div>

          <div className="rounded-xl border bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CheckCircle className="h-5 w-5 text-green-600" />
                No Issues
              </div>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Passed
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">Screenshots matched consistently</p>

            <div className="mt-6 text-xl font-bold text-slate-800">
              Pairs Without Issues: <span className="font-bold text-slate-800">{pairsWithoutIssuesCount}</span>
            </div>

            {pairsWithoutIssues.length > 0 && (
              <PairPreviewSection
                title="Passing Image Pairs"
                pairs={pairsWithoutIssues}
                onViewInModal={() => openPairsModal("Passing Image Pairs", pairsWithoutIssues)}
              />
            )}
          </div>
        </div>
      </div>

      <PairListModal
        open={modalState.open}
        title={modalState.title}
        pairs={modalState.pairs}
        onClose={closePairsModal}
      />
    </div>
  );
}


function isNumericPairId(value: string) {
  return /^\d+$/.test(value);
}

function shouldUseOneBasedLabels(pairs: PairPreview[]) {
  // Some flows store pair ids starting at zero, but the UI should usually label them starting at 1.
  if (pairs.length === 0) return false;
  const numericIds = pairs.map((pair) => pair.pairId).filter(isNumericPairId).map(Number);
  return numericIds.length > 0 && Math.min(...numericIds) === 0;
}

function formatPairLabel(pairId: string, useOneBasedLabels: boolean) {
  if (!useOneBasedLabels || !isNumericPairId(pairId)) return pairId;
  return String(Number(pairId) + 1);
}

function PairPreviewSection({
  title,
  pairs,
  onViewInModal,
}: {
  title: string;
  pairs: PairPreview[];
  onViewInModal: () => void;
}) {
  const useOneBasedLabels = shouldUseOneBasedLabels(pairs);

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700">{title}</p>

        <button
          type="button"
          onClick={onViewInModal}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          View all in modal
        </button>
      </div>
    </div>
  );
}

function PairListModal({
  open,
  title,
  pairs,
  onClose,
}: {
  open: boolean;
  title: string;
  pairs: PairPreview[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    // Allow keyboard dismissal so large preview lists feel like a real modal, not a static overlay.
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!open) return null;

  const useOneBasedLabels = shouldUseOneBasedLabels(pairs);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[80vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Image pairs"}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-800">
            {title} ({pairs.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[calc(80vh-64px)] grid-cols-1 gap-4 overflow-y-auto p-4">
          {pairs.length === 0 ? (
            <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No image pairs to display.
            </div>
          ) : (
            pairs.map((pair) => (
              <div key={`${title}-${pair.pairId}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={pair.imageA}
                    alt={`Pair ${formatPairLabel(pair.pairId, useOneBasedLabels)} image A`}
                    className="h-full w-full rounded border object-cover"
                  />
                  <img
                    src={pair.imageB}
                    alt={`Pair ${formatPairLabel(pair.pairId, useOneBasedLabels)} image B`}
                    className="h-full w-full rounded border object-cover"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
