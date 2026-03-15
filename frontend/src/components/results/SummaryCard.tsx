// // src/components/results/SummaryCard.tsx

// import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
// import type { TestResults } from "../../types/Results";

// interface Props {
//   summary: TestResults['summary'];
//   metadata: TestResults['test_metadata'];
// }

// export function SummaryCard({ summary, metadata }: Props) {
//   const formatDuration = (seconds: number) => {
//     if (seconds < 60) return `${seconds}s`;
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}m ${secs}s`;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 mb-8 text-white shadow-lg">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-3xl font-bold mb-2">Test Completed</h2>
//           {metadata.url && (
//             <p className="text-blue-100">URL: {metadata.url}</p>
//           )}
//           <p className="text-blue-100 text-sm">
//             Completed {formatDate(metadata.completed_at)} • {formatDuration(metadata.processing_time_seconds)}
//           </p>
//         </div>
        
//         <div className="text-right flex gap-2">
//           <div className="text-2xl text-blue-100">Total Pairs: </div>
//           <div className="text-2xl font-bold">{summary.total_pairs}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pb-8">
//         {/* Total Issues */}
//         <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
//           <div className="flex items-center gap-2 mb-2">
//             <AlertTriangle className="w-7 h-7" />
//             <span className="text-md font-medium">Issues Found</span>
//           </div>
//           <div></div>
//           <div className="text-3xl font-bold">{summary.issues_detected}</div>
//         </div>

//         {/* No Issues */}
//         <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
//           <div className="flex items-center gap-2 mb-2">
//             <CheckCircle className="w-7 h-7" />
//             <span className="text-md font-medium">No Issues</span>
//           </div>
//           <div className="text-3xl font-bold">{summary.no_issues}</div>
//         </div>
//         </div>


//       <h4 className="text-2xl font-bold mb-2">Severity summary</h4>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         {/* High Severity */}
//         <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-red-500/100">
//           <div className="flex items-center gap-2 mb-2">
//             <XCircle className="w-7 h-7 text-red-500" />
//             <span className="text-md font-medium">High</span>
//           </div>
//           <div className="text-3xl font-bold">{summary.high_severity}</div>
//         </div>

//         {/* Medium Severity */}
//         <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-yellow-500/100">
//           <div className="flex items-center gap-2 mb-2">
//             <AlertTriangle className="w-7 h-7 text-yellow-500" />
//             <span className="text-md font-medium">Medium</span>
//           </div>
//           <div className="text-3xl font-bold">{summary.medium_severity}</div>
//         </div>

//         {/* Low Severity */}
//         <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-green-500/100">
//           <div className="flex items-center gap-2 mb-2">
//             <CheckCircle className="w-7 h-7 text-green-500" />
//             <span className="text-md font-medium">Low</span>
//           </div>
//           <div className="text-3xl font-bold">{summary.low_severity}</div>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
// import type { TestResults } from "../../types/Results";
// import { useLocation, useNavigate } from "react-router-dom";

// interface Props {
//   summary: TestResults["summary"];
//   metadata: TestResults["test_metadata"];
// }

// export function SummaryCard({ summary, metadata }: Props) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const state = location.state as any;
//   const pairs = state?.pairs || [];
//   const uploadResponse = state?.uploadResponse || null;

//   console.log("result page")

//   console.log(uploadResponse)
  
//   const formatDuration = (seconds: number) => {
//     if (seconds < 60) return `${seconds}s`;
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}m ${secs}s`;
//   };
  

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   return (
//     <div className="bg-white rounded-xl border border-blue-600 shadow-sm p-6 mb-6 bg-blue-100">
//       <div className="flex items-start justify-between gap-6 flex-wrap">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">Test Completed</h2>
//           {metadata.url && (
//             <p className="text-sm text-slate-600 mt-1">
//               URL: <span className="font-medium text-slate-800">{metadata.url}</span>
//             </p>
//           )}
//           <p className="text-sm text-slate-500 mt-1">
//             Completed {formatDate(metadata.completed_at)} •{" "}
//             {formatDuration(metadata.processing_time_seconds)}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="text-sm text-slate-500">Total Pairs</div>
//           <div className="text-2xl font-bold text-slate-800">{summary.total_pairs}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mt-6">
//         <div className="rounded-lg border bg-blue-50 p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <AlertTriangle className="w-5 h-5 text-amber-600" />
//             Issues Found
//           </div>
//           <div className="text-3xl font-bold text-slate-800 mt-2">{summary.issues_detected}</div>
//         </div>

//         <div className="rounded-lg border bg-blue-50 p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <CheckCircle className="w-5 h-5 text-green-600" />
//             No Issues
//           </div>
//           <div className="text-3xl font-bold text-slate-800 mt-2">{summary.no_issues}</div>
//         </div>
//       </div>

//       <h4 className="text-lg font-bold text-slate-800 mt-6 mb-3">Severity Summary</h4>

//       <div className="grid grid-cols-3 gap-4">
//         <div className="rounded-lg border bg-white p-4 border border-blue-600">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <XCircle className="w-5 h-5 text-red-600" />
//             High
//           </div>
//           <div className="text-2xl font-bold text-slate-800 mt-2">{summary.high_severity}</div>
//         </div>

//         <div className="rounded-lg border bg-white p-4 border border-blue-600">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <AlertTriangle className="w-5 h-5 text-amber-600" />
//             Medium
//           </div>
//           <div className="text-2xl font-bold text-slate-800 mt-2">{summary.medium_severity}</div>
//         </div>

//         <div className="rounded-lg border bg-white p-4 border border-blue-600">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <CheckCircle className="w-5 h-5 text-green-600" />
//             Low
//           </div>
//           <div className="text-2xl font-bold text-slate-800 mt-2">{summary.low_severity}</div>
//         </div>
//       </div>
//     </div>
//   );
// }




// import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
// import type { TestResults } from "../../types/Results";

// interface Props {
//   summary: TestResults["summary"];
//   metadata: TestResults["test_metadata"];
// }

// export function SummaryCard({ summary, metadata }: Props) {
//   const formatDuration = (seconds: number) => {
//     if (seconds < 60) return `${seconds}s`;
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}m ${secs}s`;
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   return (
//     <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
//       <div className="flex items-start justify-between gap-6 flex-wrap">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">Test Completed</h2>

//           {metadata.url && (
//             <p className="text-sm text-slate-600 mt-1">
//               URL: <span className="font-medium text-slate-800">{metadata.url}</span>
//             </p>
//           )}

//           <p className="text-sm text-slate-500 mt-1">
//             Completed {formatDate(metadata.completed_at)} •{" "}
//             {formatDuration(metadata.processing_time_seconds)}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="text-sm text-slate-500">Total Pairs</div>
//           <div className="text-2xl font-bold text-slate-800">{summary.total_pairs}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mt-6">
//         <div className="rounded-lg border bg-slate-50 p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <AlertTriangle className="w-5 h-5 text-amber-600" />
//             Issues Found
//           </div>
//           <div className="text-3xl font-bold text-slate-800 mt-2">
//             {summary.issues_detected}
//           </div>
//         </div>

//         <div className="rounded-lg border bg-slate-50 p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <CheckCircle className="w-5 h-5 text-green-600" />
//             No Issues
//           </div>
//           <div className="text-3xl font-bold text-slate-800 mt-2">{summary.no_issues}</div>
//         </div>
//       </div>

//       <h4 className="text-lg font-bold text-slate-800 mt-6 mb-3">Severity Summary</h4>

//       <div className="grid grid-cols-3 gap-4">
//         <div className="rounded-lg border bg-white p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <XCircle className="w-5 h-5 text-red-600" />
//             High
//           </div>
//           <div className="text-2xl font-bold text-slate-800 mt-2">{summary.high_severity}</div>
//         </div>

//         <div className="rounded-lg border bg-white p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <AlertTriangle className="w-5 h-5 text-amber-600" />
//             Medium
//           </div>
//           <div className="text-2xl font-bold text-slate-800 mt-2">{summary.medium_severity}</div>
//         </div>

//         <div className="rounded-lg border bg-white p-4">
//           <div className="flex items-center gap-2 text-slate-700 font-semibold">
//             <CheckCircle className="w-5 h-5 text-green-600" />
//             Low
//           </div>
//           <div className="text-2xl font-bold text-slate-800 mt-2">{summary.low_severity}</div>
//         </div>
//       </div>
//     </div>
//   );
// }




// import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
// import type { TestResults } from "../../types/Results";

// interface Props {
//   summary: TestResults["summary"];
//   metadata: TestResults["test_metadata"];
// }

// export function SummaryCard({ summary, metadata }: Props) {
//   const formatDuration = (seconds: number) => {
//     if (seconds < 60) return `${seconds}s`;
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}m ${secs}s`;
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   return (
//     <div className="rounded-2xl overflow-hidden border shadow-sm mb-6 bg-white">
//       {/* Top Banner */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5">
//         <div className="flex items-start justify-between gap-6 flex-wrap">
//           <div>
//             <h2 className="text-2xl font-bold">Test Completed</h2>

//             {metadata.url && (
//               <p className="text-sm text-blue-100 mt-1">
//                 URL: <span className="font-semibold text-white">{metadata.url}</span>
//               </p>
//             )}

//             <p className="text-sm text-blue-100 mt-1">
//               Completed {formatDate(metadata.completed_at)} •{" "}
//               {formatDuration(metadata.processing_time_seconds)}
//             </p>
//           </div>

//           <div className="text-right">
//             <div className="text-sm text-blue-100">Total Pairs</div>
//             <div className="text-3xl font-bold">{summary.total_pairs}</div>
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="p-6">
//         {/* Issues Row */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="rounded-xl border bg-slate-50 p-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 text-slate-700 font-semibold">
//                 <AlertTriangle className="w-5 h-5 text-amber-600" />
//                 Issues Found
//               </div>
//               <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
//                 Attention
//               </span>
//             </div>
//             <div className="text-4xl font-bold text-slate-800 mt-3">
//               {summary.issues_detected}
//             </div>
//             <p className="text-xs text-slate-500 mt-1">
//               UI differences detected across environments
//             </p>
//           </div>

//           <div className="rounded-xl border bg-slate-50 p-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 text-slate-700 font-semibold">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 No Issues
//               </div>
//               <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
//                 Passed
//               </span>
//             </div>
//             <div className="text-4xl font-bold text-slate-800 mt-3">
//               {summary.no_issues}
//             </div>
//             <p className="text-xs text-slate-500 mt-1">
//               Screenshots matched consistently
//             </p>
//           </div>
//         </div>

//         {/* Severity */}
//         {/* <div className="mt-7 flex items-center justify-between flex-wrap gap-3">
//           <h4 className="text-lg font-bold text-slate-800">Severity Summary</h4>
//           <p className="text-sm text-slate-500">
//             Breakdown of detected issues by severity
//           </p>
//         </div> */}

//         {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"> */}
//           {/* High */}
//           {/* <div className="rounded-xl border p-5 bg-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 font-semibold text-slate-700">
//                 <XCircle className="w-5 h-5 text-red-600" />
//                 High
//               </div>
//               <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
//             </div>
//             <div className="text-3xl font-bold text-slate-800 mt-3">
//               {summary.high_severity}
//             </div>
//             <p className="text-xs text-slate-500 mt-1">
//               Major UI impact / must-fix
//             </p>
//           </div>

//           {/* Medium */}
//           {/* <div className="rounded-xl border p-5 bg-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 font-semibold text-slate-700">
//                 <AlertTriangle className="w-5 h-5 text-amber-600" />
//                 Medium
//               </div>
//               <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
//             </div>
//             <div className="text-3xl font-bold text-slate-800 mt-3">
//               {summary.medium_severity}
//             </div>
//             <p className="text-xs text-slate-500 mt-1">
//               Noticeable differences
//             </p>
//           </div> */}

//           {/* Low */}
//           {/* <div className="rounded-xl border p-5 bg-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 font-semibold text-slate-700">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 Low
//               </div>
//               <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
//             </div>
//             <div className="text-3xl font-bold text-slate-800 mt-3">
//               {summary.low_severity}
//             </div>
//             <p className="text-xs text-slate-500 mt-1">
//               Minor UI differences
//             </p>
//           </div> */}
//         {/* </div> */} 
//       </div>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import type { TestResults } from "../../types/Results";

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

      {/* <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
        {pairs.map((pair) => (
          <div key={pair.pairId} className="rounded-lg border border-slate-200 bg-white p-2">
            <p className="mb-2 text-xs font-semibold text-slate-500">Pair {formatPairLabel(pair.pairId, useOneBasedLabels)}</p>
            <div className="grid grid-cols-2 gap-2">
              <img
                src={pair.imageA}
                alt={`Pair ${formatPairLabel(pair.pairId, useOneBasedLabels)} image A`}
                className="h-24 w-full rounded border object-cover"
              />
              <img
                src={pair.imageB}
                alt={`Pair ${formatPairLabel(pair.pairId, useOneBasedLabels)} image B`}
                className="h-24 w-full rounded border object-cover"
              />
            </div>
          </div>
        ))}
      </div> */}
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
                {/* <p className="mb-2 text-sm font-semibold text-slate-600">Pair {formatPairLabel(pair.pairId, useOneBasedLabels)}</p> */}
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














// // src/components/results/SummaryCard.tsx
// // import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
// import { CheckCircle, AlertTriangle } from "lucide-react";
// import type { TestResults } from "../../types/Results";

// interface PairPreview {
//   pairId: string;
//   imageA: string;
//   imageB: string;
// }

// interface Props {
//   summary: TestResults["summary"];
//   metadata: TestResults["test_metadata"];
//   pairsWithIssuesCount?: number;
//   //  pairsWithoutIssuesCount?: number; 
//   pairsWithoutIssuesCount?: number;
//   pairsWithIssues?: PairPreview[];
//   pairsWithoutIssues?: PairPreview[];
// }

// export function SummaryCard({
//   summary,
//   metadata,
//   pairsWithIssuesCount = 0,
//   pairsWithoutIssuesCount = 0,
//   pairsWithIssues = [],
//   pairsWithoutIssues = [],
// }: Props) {
//   // const formatDuration = (seconds: number) => {
//   //   if (seconds < 60) return `${seconds}s`;
//   //   const minutes = Math.floor(seconds / 60);
//   //   const secs = seconds % 60;
//   //   return `${minutes}m ${secs}s`;
//   // };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   return (
//     <div className="rounded-2xl overflow-hidden border shadow-sm mb-6 bg-white">
//       {/* Top Banner */}
//       <div className="bg-blue-950 text-white px-6 py-5">
//         <div className="flex items-start justify-between gap-6 flex-wrap">
//           <div>
//             <h2 className="text-2xl font-bold">Test Completed</h2>

//             {metadata.url && (
//               <p className="text-sm text-blue-100 mt-1">
//                 URL: <span className="font-semibold text-white">{metadata.url}</span>
//               </p>
//             )}

//             <p className="text-sm text-blue-100 mt-1">
//               Completed {formatDate(metadata.completed_at)} 
//             </p>
//           </div>

//           <div className="text-right">
//             <div className="text-sm text-blue-100">Total Pairs</div>
//             <div className="text-3xl font-bold">{summary.total_pairs}</div>
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="p-6">
//         {/* Issues Row */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="rounded-xl border bg-slate-50 p-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 text-slate-700 font-semibold">
//                 <AlertTriangle className="w-5 h-5 text-amber-600" />
//                 Issues Found
//               </div>
//               <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
//                 Attention
//               </span>
//             </div>
//             <p className="text-xs text-slate-500 mt-1">UI differences detected across environments</p>

//             <br />
//             <div className="mt-3 text-xl font-bold text-slate-800">
//              Pairs With Issues:{" "}
//               <span className="font-bold text-slate-800">{pairsWithIssuesCount}</span>
//             </div>

//             <div className="text-md text-slate-800 mt-3">Issues Count: {summary.issues_detected}</div>
//             {pairsWithIssues.length > 0 && (
//               <PairPreviewSection title="Affected Image Pairs" pairs={pairsWithIssues} />
//             )}
//           </div>

//           <div className="rounded-xl border bg-slate-50 p-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 text-slate-700 font-semibold">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 No Issues
//               </div>
//               <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
//                 Passed
//               </span>
//             </div>
//              <p className="text-xs text-slate-500 mt-1">Screenshots matched consistently</p>

//             <br />
//             <div className="mt-3 text-xl font-bold text-slate-800">
//               Pairs Without Issues:{" "}
//               <span className="font-bold text-slate-800">{pairsWithoutIssuesCount}</span>
//             </div>
//             {/* <div className="text-md text-slate-800 mt-3">{summary.no_issues}</div> */}
            
//             {pairsWithoutIssues.length > 0 && (
//               <PairPreviewSection title="Passing Image Pairs" pairs={pairsWithoutIssues} />
//             )}

           
//           </div>
//         </div>

//         {/* Severity summary unchanged */}
//         {/* <div className="mt-7 flex items-center justify-between flex-wrap gap-3">
//           <h4 className="text-lg font-bold text-slate-800">Severity Summary</h4>
//           <p className="text-sm text-slate-500">Breakdown of detected issues by severity</p>
//         </div> */}

//         {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">\
//           <div className="rounded-xl border p-5 bg-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 font-semibold text-slate-700">
//                 <XCircle className="w-5 h-5 text-red-600" />
//                 High
//               </div>
//               <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
//             </div>
//             <div className="text-3xl font-bold text-slate-800 mt-3">{summary.high_severity}</div>
//             <p className="text-xs text-slate-500 mt-1">Major UI impact / must-fix</p>
//           </div>

         
//           <div className="rounded-xl border p-5 bg-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 font-semibold text-slate-700">
//                 <AlertTriangle className="w-5 h-5 text-amber-600" />
//                 Medium
//               </div>
//               <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
//             </div>
//             <div className="text-3xl font-bold text-slate-800 mt-3">{summary.medium_severity}</div>
//             <p className="text-xs text-slate-500 mt-1">Noticeable differences</p>
//           </div>

          
//           <div className="rounded-xl border p-5 bg-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 font-semibold text-slate-700">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 Low
//               </div>
//               <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
//             </div>
//             <div className="text-3xl font-bold text-slate-800 mt-3">{summary.low_severity}</div>
//             <p className="text-xs text-slate-500 mt-1">Minor UI differences</p>
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// }

// function PairPreviewSection({ title, pairs }: { title: string; pairs: PairPreview[] }) {
//   return (
//     <div className="mt-4 border-t border-slate-200 pt-4">
//       <p className="text-sm font-semibold text-slate-700 mb-2">{title}</p>
//       <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
//         {pairs.map((pair) => (
//           <div key={pair.pairId} className="rounded-lg border border-slate-200 bg-white p-2">
//             <p className="text-xs font-semibold text-slate-500 mb-2">Pair {pair.pairId}</p>
//             <div className="grid grid-cols-2 gap-2">
//               <img src={pair.imageA} alt={`Pair ${pair.pairId} image A`} className="h-24 w-full rounded border object-cover" />
//               <img src={pair.imageB} alt={`Pair ${pair.pairId} image B`} className="h-24 w-full rounded border object-cover" />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }