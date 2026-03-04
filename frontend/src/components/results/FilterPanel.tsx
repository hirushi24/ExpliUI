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
          {/* Severity Filter */}
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

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="layout">Layout</option>
              <option value="typography">Typography</option>
              <option value="visual">Visual</option>
              <option value="component">Component</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-slate-500" />
            <label className="text-sm font-medium text-slate-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "severity" | "category")}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="severity">By Severity</option>
              <option value="category">By Category</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}