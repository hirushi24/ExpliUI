import { Filter, SortAsc } from "lucide-react";

interface Props {
  severityFilter: string;
  categoryFilter: string;
  sortBy: "severity" | "category";
  onSeverityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: "severity" | "category") => void;
  totalIssues: number;
  filteredCount: number;
}

export function FilterPanel({
  severityFilter,
  categoryFilter,
  sortBy,
  onSeverityChange,
  onCategoryChange,
  onSortChange,
  totalIssues,
  filteredCount
}: Props) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 border shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Filter & Sort</h3>
          <span className="text-sm text-slate-500">
            Showing {filteredCount} of {totalIssues} issues
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtering is currently severity-first even though the props still expose category/sort hooks. */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Severity:</label>
            <select
              value={severityFilter}
              onChange={(e) => onSeverityChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
               <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
