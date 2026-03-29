// Archived draft for an older pair-image modal; kept commented out as a design reference.
// import React from "react";
// import { X } from "lucide-react";
// import type { DetectedIssue } from "../../types/Results";

// interface PairImages {
//   pairId: string | number;
//   screenshotA: string;
//   screenshotB: string;
// }

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   pairs: PairImages[]; // list of unique pairs to show
//   onOpenPair?: (pair: PairImages) => void;
// }

// export function PairImagesModal({ open, onClose, pairs, onOpenPair }: Props) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//       <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <h3 className="text-lg font-semibold">Pairs with Issues ({pairs.length})</h3>
//           <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-auto">
//           {pairs.length === 0 ? (
//             <div className="col-span-full text-center text-slate-600 py-10">
//               No pairs to display.
//             </div>
//           ) : (
//             pairs.map((p) => (
//               <div key={String(p.pairId)} className="border rounded-lg overflow-hidden bg-slate-50">
//                 <div className="p-3 flex items-center justify-between">
//                   <div className="font-medium">Pair {p.pairId}</div>
//                   <div className="text-sm text-slate-500">click images to open</div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2 p-3">
//                   <button
//                     onClick={() => onOpenPair?.(p)}
//                     className="rounded border overflow-hidden"
//                     title="Open baseline image"
//                   >
//                     <img src={p.screenshotA} alt={`pair-${p.pairId}-a`} className="w-full h-36 object-cover" />
//                     <div className="text-xs text-center p-1">Baseline</div>
//                   </button>

//                   <button
//                     onClick={() => onOpenPair?.(p)}
//                     className="rounded border overflow-hidden"
//                     title="Open candidate image"
//                   >
//                     <img src={p.screenshotB} alt={`pair-${p.pairId}-b`} className="w-full h-36 object-cover" />
//                     <div className="text-xs text-center p-1">Candidate</div>
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         <div className="px-4 py-3 border-t flex justify-end gap-2">
//           <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
