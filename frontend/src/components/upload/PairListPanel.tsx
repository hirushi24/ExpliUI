import { Plus, CheckCircle, AlertCircle } from "lucide-react";
import type { ScreenshotPair } from "../../types";
import { clsx } from "clsx";

interface Props {
  pairs: ScreenshotPair[];
  activePairId: number;
  onSelect: (id: number) => void;
  onAdd: () => void;
}

export function PairListPanel({ pairs, activePairId, onSelect, onAdd }: Props) {
  return (
    <div className="w-64 border-r bg-white flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 bg-slate-800 text-white">
        <h2 className="font-semibold text-white">Test Pairs</h2>
        <p className="text-xs text-white">Add screenshots to compare</p>
      </div> 

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-800">
        {pairs.map((pair, index) => (
          <button
            key={pair.id}
            onClick={() => onSelect(pair.id)}
            className={clsx(
              "w-full p-3 rounded-lg flex items-center justify-between text-sm transition-all border",
              activePairId === pair.id
                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                : "bg-white border-transparent hover:bg-slate-50 text-slate-600"
            )}
          >
            <span className="font-medium">Pair {index + 1}</span>
            {pair.status === "uploaded" ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-300" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-800">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-blue-600 rounded-lg text-blue-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Pair
        </button>
      </div>
    </div>
  );
}