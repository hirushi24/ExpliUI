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




// src/components/results/SummaryCard.tsx
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { TestResults } from "../../types/Results";

interface Props {
  summary: TestResults["summary"];
  metadata: TestResults["test_metadata"];
  pairsWithIssuesCount?: number;
   pairsWithoutIssuesCount?: number; 
}

export function SummaryCard({
  summary,
  metadata,
  pairsWithIssuesCount = 0,
  pairsWithoutIssuesCount = 0,
}: Props) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="rounded-2xl overflow-hidden border shadow-sm mb-6 bg-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">Test Completed</h2>

            {metadata.url && (
              <p className="text-sm text-blue-100 mt-1">
                URL: <span className="font-semibold text-white">{metadata.url}</span>
              </p>
            )}

            <p className="text-sm text-blue-100 mt-1">
              Completed {formatDate(metadata.completed_at)} • {formatDuration(metadata.processing_time_seconds)}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-blue-100">Total Pairs</div>
            <div className="text-3xl font-bold">{summary.total_pairs}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Issues Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Issues Found
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Attention
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">UI differences detected across environments</p>

            <br></br>
            <div className="mt-3 text-xl font-bold text-slate-800">
              Pairs With Issues: {" "} 
              <span className="font-bold text-slate-800">{pairsWithIssuesCount}</span>
            </div>

            <div className="text-md text-slate-800 mt-3">Issues Count: {summary.issues_detected}</div>
          </div>

          <div className="rounded-xl border bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle className="w-5 h-5 text-green-600" />
                No Issues
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                Passed
              </span>
            </div>
             <p className="text-xs text-slate-500 mt-1">Screenshots matched consistently</p>

            <br></br>
             <div className="mt-3 text-xl font-bold text-slate-800">
              Pairs Without Issues:{" "}
              <span className="font-bold text-slate-800">{pairsWithoutIssuesCount}</span>
            </div>
            {/* <div className="text-md text-slate-800 mt-3">{summary.no_issues}</div> */}

           
          </div>
        </div>

        {/* Severity summary unchanged */}
        {/* <div className="mt-7 flex items-center justify-between flex-wrap gap-3">
          <h4 className="text-lg font-bold text-slate-800">Severity Summary</h4>
          <p className="text-sm text-slate-500">Breakdown of detected issues by severity</p>
        </div> */}

        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">\
          <div className="rounded-xl border p-5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <XCircle className="w-5 h-5 text-red-600" />
                High
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="text-3xl font-bold text-slate-800 mt-3">{summary.high_severity}</div>
            <p className="text-xs text-slate-500 mt-1">Major UI impact / must-fix</p>
          </div>

         
          <div className="rounded-xl border p-5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Medium
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-3xl font-bold text-slate-800 mt-3">{summary.medium_severity}</div>
            <p className="text-xs text-slate-500 mt-1">Noticeable differences</p>
          </div>

          
          <div className="rounded-xl border p-5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Low
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className="text-3xl font-bold text-slate-800 mt-3">{summary.low_severity}</div>
            <p className="text-xs text-slate-500 mt-1">Minor UI differences</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}