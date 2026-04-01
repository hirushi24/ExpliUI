import { Plus, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import type { ScreenshotPair } from "../../types";
import { clsx } from "clsx";

interface Props {
  pairs: ScreenshotPair[];
  activePairId: number;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onRemovePair: (id: number) => void;
}

// export function PairListPanel({ pairs, activePairId, onSelect, onAdd }: Props) {
export function PairListPanel({ pairs, activePairId, onSelect, onAdd, onRemovePair }: Props) {
  return (
    <div className="w-64 border-r bg-white flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 bg-slate-800 text-white">
        <h2 className="font-semibold text-white">Test Pairs</h2>
        <p className="text-xs text-white">Add screenshots to compare</p>
      </div> 

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-800">
        {pairs.map((pair, index) => (
          // The sidebar doubles as both navigation and a quick status view for each pair.
          // <button
          <div
            key={pair.id}
            // onClick={() => onSelect(pair.id)}
            className={clsx(
              // "w-full p-3 rounded-lg flex items-center justify-between text-sm transition-all border",
               "w-full p-3 rounded-lg flex items-center justify-between text-sm transition-all border gap-2",
              activePairId === pair.id
                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                : "bg-blue-50 border-transparent hover:bg-slate-50 text-slate-600"
            )}
          >
            {/* <span className="font-medium">Pair {index + 1}</span>
            {pair.status === "uploaded" ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-50" />
            )}
          </button> */}
          {/* The sidebar doubles as both navigation and a quick status view for each pair. */}
            <button className="flex-1 text-left flex items-center justify-between" onClick={() => onSelect(pair.id)}>
              <span className="font-medium">Pair {index + 1}</span>
              {pair.status === "uploaded" ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-blue-50" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onRemovePair(pair.id)}
              disabled={pairs.length === 1}
              aria-label={`Remove pair ${index + 1}`}
              title={pairs.length === 1 ? "At least one pair is required" : `Remove Pair ${index + 1}`}
              className={clsx(
                "p-1 rounded transition-colors",
                pairs.length === 1
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50"
              )}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
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
