import { AlertCircle, Code, Lightbulb, ExternalLink, Eye } from "lucide-react";
import type { DetectedIssue } from "../../types/Results";
import { clsx } from "clsx";

interface Props {
  issue: DetectedIssue;
  index: number;
  onViewEvidence: (issue: DetectedIssue) => void;
}

export function IssueCard({ issue, index, onViewEvidence }: Props) {
  const severityColors = {
    critical: "bg-red-100 border-red-300 text-red-900",
    high: "bg-red-50 border-red-200 text-red-700",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
    low: "bg-green-50 border-green-200 text-green-700"
  };

  const severityBadgeColors = {
    critical: "bg-red-200 text-red-900 border-red-400",
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300"
  };

  const categoryIcons = {
    layout: "",
    typography: "",
    visual: "",
    component: ""
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b bg-slate-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-3xl">{categoryIcons[issue.issue_type as keyof typeof categoryIcons]}</div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-500">Issue: {index + 1}</span>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-xs font-semibold border",
                  severityBadgeColors[issue.severity]
                )}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {issue.issue_type.replace("_", " ").toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {issue.description}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>
                  <strong>Detected Between:</strong>
                </span>
                <span className="px-2 py-1 bg-blue-50 rounded border border-blue-200 text-blue-700 font-medium">
                  {issue.detected_between.environment_a.browser} ({issue.detected_between.environment_a.os})
                </span>
                <span>↔</span>
                <span className="px-2 py-1 bg-purple-50 rounded border border-purple-200 text-purple-700 font-medium">
                  {issue.detected_between.environment_b.browser} ({issue.detected_between.environment_b.os})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewEvidence(issue)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            View Evidence
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Explanation */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            <h4 className="font-semibold text-slate-700">Explanation</h4>
          </div>
          <p className="text-slate-600 leading-relaxed pl-6">
            {issue.explanation}
          </p>
        </div>

        {/* Root Cause */}
        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-slate-500" />
            <h4 className="font-semibold text-slate-700">Root Cause</h4>
          </div>
          <p className="text-slate-600 pl-6">
            <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
              {issue.root_cause}
            </code>
          </p>
        </div>

        {/* CSS Properties */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-slate-500" />
            <h4 className="font-semibold text-slate-700">Affected CSS Properties</h4>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {issue.css_properties.map((prop, idx) => (
              <code
                key={idx}
                className="px-3 py-1 bg-slate-800 text-white rounded text-sm font-mono"
              >
                {prop}
              </code>
            ))}
          </div>
        </div>

        {/* Suggested Fix */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-800">Suggested Fix</h4>
          </div>
          <p className="text-green-900 pl-6">
            {issue.suggested_fix}
          </p>
        </div>

        {/* Can I Use Link */}
        {issue.caniuse_reference && (
          <div>
            <a
              href={issue.caniuse_reference}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Browser Compatibility on Can I Use
            </a>
          </div>
        )}

      </div>
    </div>
  );
}