// type AnalysisProgressScreenProps = {
//   progress: number;
//   totalPairs: number;
// };

// export function AnalysisProgressScreen({ progress, totalPairs }: AnalysisProgressScreenProps) {
//   const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

//   return (
//     <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
//       <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
//         <p className="text-sm font-semibold text-blue-600">Analysing Screens</p>
//         <h2 className="mt-2 text-2xl font-bold text-slate-900">Please wait while process your upload</h2>
//         <p className="mt-2 text-sm text-slate-600">
//           System processing {totalPairs} pair{totalPairs === 1 ? "" : "s"} and analysing differences.
//         </p>

//         <div className="mt-8">
//           <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
//             <span>Progress</span>
//             <span>{clampedProgress}%</span>
//           </div>
//           <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
//             <div
//               className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
//               style={{ width: `${clampedProgress}%` }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React from 'react';

type AnalysisModalProps = {
  isOpen: boolean;
  progress: number;
  totalPairs: number;
};

export default function AnalysisProgressScreen({ isOpen, progress, totalPairs }: AnalysisModalProps) {
  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  // Ensure progress stays between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
      
      {/* Modal Card (Using your exact styling) */}
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold text-blue-600">Analysing Screens</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Please wait while we process your upload</h2>
        <p className="mt-2 text-sm text-slate-600">
          System processing {totalPairs} pair{totalPairs === 1 ? "" : "s"} and analysing differences.
        </p>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
            <span>Progress</span>
            <span>{clampedProgress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}