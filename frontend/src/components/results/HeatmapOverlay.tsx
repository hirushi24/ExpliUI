// // src/components/results/HeatmapOverlay.tsx

// interface Props {
//   heatmapUrl: string;
//   zoom: number;
// }

// export function HeatmapOverlay({ heatmapUrl, zoom }: Props) {
//   return (
//     <div className="border rounded-lg overflow-hidden bg-slate-900">
//       <img
//         src={heatmapUrl}
//         alt="Difference Heatmap"
//         className="w-full h-auto"
//         style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
//       />
      
//       <div className="p-4 bg-slate-800 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-blue-500 rounded"></div>
//             <span className="text-sm text-white">No Difference</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-yellow-500 rounded"></div>
//             <span className="text-sm text-white">Minor Difference</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-red-500 rounded"></div>
//             <span className="text-sm text-white">Major Difference</span>
//           </div>
//         </div>
        
//         <span className="text-xs text-slate-400">
//           Red areas indicate the highest visual differences
//         </span>
//       </div>
//     </div>
//   );
// }

interface Props {
  heatmapUrl: string;
  zoom: number;
}

export function HeatmapOverlay({ heatmapUrl, zoom }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-slate-50 border-b p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500" />
              No Difference
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500" />
              Minor
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500" />
              Major
            </div>
          </div>

          <span className="text-xs text-slate-500">
            Red areas indicate the highest visual differences
          </span>
        </div>
      </div>

      <img
        src={heatmapUrl}
        alt="Difference Heatmap"
        className="w-full h-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
      />
    </div>
  );
}
