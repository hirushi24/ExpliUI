import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { SummaryCard } from "../components/results/SummaryCard";
import { EvidenceModal } from "../components/results/EvidenceModal";
import { ExportPanel } from "../components/results/ExportPanel";
import { FilterPanel } from "../components/results/FilterPanel";
import type { TestResults, DetectedIssue } from "../types/Results";
import { mockResults } from "../mocks/ResultsData.ts";
import { ChevronDown, ChevronRight, Eye, Loader2, ArrowLeft } from "lucide-react";

// Results page that normalizes multiple backend response shapes into one UI-friendly issue model.

const RULE_BASED_SEVERITIES = ["critical", "high", "medium", "low"] as const;

const severityBadgeClasses: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const severityRank: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const toIssueType = (value?: string) => {
  if (!value) return "visual";
  if (value.includes("layout")) return "layout";
  if (value.includes("content") || value.includes("font") || value.includes("text")) return "typography";
  if (value.includes("component")) return "component";
  return "visual";
};

interface PairPreview {
  pairId: string;
  imageA: string;
  imageB: string;
}

const BACKEND_STATIC_ORIGIN = import.meta.env.VITE_UPLOAD_SERVER_ORIGIN || "";

const toAbsoluteMediaUrl = (rawUrl?: string) => {
  if (!rawUrl) return rawUrl;

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  const normalized = rawUrl.replaceAll("\\", "/");

  // The backend sometimes returns filesystem-style paths, so convert them into static asset URLs.
  if (normalized.startsWith("upload_image/")) {
    const staticPath = normalized.replace(/^upload_image\//, "/static/");
    return BACKEND_STATIC_ORIGIN ? `${BACKEND_STATIC_ORIGIN}${staticPath}` : staticPath;
  }

  if (normalized.startsWith("/static/")) {
    return BACKEND_STATIC_ORIGIN ? `${BACKEND_STATIC_ORIGIN}${normalized}` : normalized;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  return `${BACKEND_STATIC_ORIGIN}/${normalized}`;
};

const resolveHeatmapUrl = (pair: any, issueObject: any) => {
  const heatmapPath = (
    issueObject?.heatmap_url ||
    issueObject?.heatmapUrl ||
    pair?.heatmap_url ||
    pair?.heatmapUrl ||
    pair?.images?.heatmap ||
    pair?.images?.diff ||
    pair?.images?.difference ||
    undefined
  );

  return toAbsoluteMediaUrl(heatmapPath);
};

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const location = useLocation();
  const state = location.state as any;

  const pairsFromState = state?.pairs || [];
  const uploadResponseFromState = state?.uploadResponse || null;

  // Batched uploads can produce nested result arrays, so flatten them before building the final summary.
  const predictionList = useMemo(() => {
    const rawResults = uploadResponseFromState?.results;

    if (!Array.isArray(rawResults)) return [];

    return rawResults.flatMap((entry: any) => {
      if (Array.isArray(entry)) return entry;
      if (Array.isArray(entry?.results)) return entry.results;
      return entry ? [entry] : [];
    });
  }, [uploadResponseFromState]);
  
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIssue, setSelectedIssue] = useState<DetectedIssue | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"severity" | "category">("severity");

  const [collapsedPairs, setCollapsedPairs] = useState<Record<string, boolean>>({});

  const togglePair = (pairKey: string) => {
  setCollapsedPairs((prev) => ({
    ...prev,
    [pairKey]: !prev[pairKey],
  }));
};


  useEffect(() => {
  fetchResults();
}, [sessionId]);


// Normalize any backend pair identifier shape into a stable string key for grouping.
const normalizePairId = (raw: any) => {
  if (raw === null || raw === undefined) return "unknown";
  if (typeof raw === "number") return String(raw);
  if (typeof raw === "string") {
    const numericMatch = raw.match(/\d+/);
    return numericMatch ? numericMatch[0] : raw;
  }
  // Support multiple backend field names because pair ids are not yet fully standardized.
  if (typeof raw === "object") {
    const objectId = raw.pair_id ?? raw.pairId ?? raw.id ?? raw.pair;
    if (objectId !== null && objectId !== undefined) {
      return normalizePairId(objectId);
    }
    return "unknown";
  }
  return String(raw);
};

const normalizePairIdWithIndexFallback = (raw: any, index: number) => {
  const normalized = normalizePairId(raw);
  // Keep fallback numeric so it matches issues built with `pair_id: pairIndex` in fetchResults.
  return normalized === "unknown" ? String(index) : normalized;
};

// Build the full known pair set from the most reliable source available so "no issues" counts stay accurate.
/**
 * Build canonicalAllPairs: a Set of unique pair ids for all pairs we know about.
 * Sources (in preference):
 *  1) If results.summary.total_pairs exists AND we have a reliable listing (e.g. predictionList or pairsFromState),
 *     prefer deriving ids from predictionList or pairsFromState so IDs are accurate (not just a count).
 *  2) predictionList (uploadResponseFromState?.results) — often contains pair_id and images
 *  3) pairsFromState (navigation state) — if you passed pair objects when navigating
 *  4) fallback: if none of the above provide explicit IDs, create synthetic ids based on index up to summary.total_pairs
 */
const canonicalAllPairs = useMemo(() => {
  const set = new Set<string>();

  // 1) If we have a predictionList (uploadResponseFromState.results), extract pair ids
  if (Array.isArray(predictionList) && predictionList.length > 0) {
    for (let i = 0; i < predictionList.length; i++) {
      const p = predictionList[i];
      // many shapes: pair_id, pairId, id
      const candidate = p?.pair_id ?? p?.pairId ?? p?.id ?? p;
      // set.add(normalizePairId(candidate ?? i));
      set.add(normalizePairIdWithIndexFallback(candidate, i));
    }
    return set;
  }

  // 2) If pairsFromState (navigation) exists and is an array of pair objects or ids
  if (Array.isArray(pairsFromState) && pairsFromState.length > 0) {
    for (let i = 0; i < pairsFromState.length; i++) {
      const p = pairsFromState[i];
      const candidate = p?.pair_id ?? p?.pairId ?? p?.id ?? p;
      // set.add(normalizePairId(candidate ?? i));
      set.add(normalizePairIdWithIndexFallback(candidate, i));
    }
    return set;
  }

  // 3) If results.summary.total_pairs exists, but we don't have explicit ids,
  // create synthetic ids as "pair_0", "pair_1", ... up to total.
  const totalFromSummary = results?.summary?.total_pairs;
  if (typeof totalFromSummary === "number" && totalFromSummary > 0) {
    for (let i = 0; i < totalFromSummary; i++) {
      set.add(`synthetic_${i}`); // synthetic keys, deterministic
    }
    return set;
  }

  // 4) Nothing found => return empty set
  return set;
}, [predictionList, pairsFromState, results?.summary?.total_pairs]);

// Track which of the known pairs produced at least one issue in the normalized results.
const pairsWithIssuesSet = useMemo(() => {
  const s = new Set<string>();
  if (!Array.isArray(results?.issues) || results.issues.length === 0) return s;

  for (const it of results.issues) {
    // issue object may contain pair_id, pairId, pair etc.
    const pid = (it as any).pair_id ?? (it as any).pairId ?? (it as any).pair ?? (it as any).pairIdBaseline ?? (it as any).pair_id_baseline ?? null;
    // If issue doesn't include a pair id, try to infer from evidence URLs (less reliable)
    if (pid == null) {
      // nothing to do — we skip unknown
      continue;
    }
    s.add(normalizePairId(pid));
  }
  return s;
}, [results?.issues]);

// Derive pair counts from the normalized sets instead of trusting every backend summary field directly.
const allPairsCount = canonicalAllPairs.size;
const pairsWithIssuesCount = pairsWithIssuesSet.size;

// Pairs without issues are pairs that exist in canonicalAllPairs but are not present in pairsWithIssuesSet.
// This handles the case where some pairs are present in allPairs but have no issues.
const pairsWithoutIssuesCount = Math.max(
  0,
  allPairsCount - pairsWithIssuesCount
);

// Fallback: if canonicalAllPairs is empty but server provided summary.no_issues, fall back to that value
const finalPairsWithoutIssuesCount = useMemo(() => {
  if (allPairsCount > 0) return pairsWithoutIssuesCount;
  const backendNoIssues = results?.summary?.no_issues;
  if (typeof backendNoIssues === "number" && !Number.isNaN(backendNoIssues)) return backendNoIssues;
  // fallback to 0
  return 0;
}, [allPairsCount, pairsWithoutIssuesCount, results?.summary?.no_issues]);

const pairPreviewsById = useMemo(() => {
  const map = new Map<string, PairPreview>();

  const addPairPreview = (pairSource: any, index: number) => {
    const candidateId = pairSource?.pair_id ?? pairSource?.pairId ?? pairSource?.id ?? pairSource;
    const pairId = normalizePairIdWithIndexFallback(candidateId, index);

    const imageA =
      toAbsoluteMediaUrl(pairSource?.images?.baseline) ||
      toAbsoluteMediaUrl(pairSource?.image_a) ||
      toAbsoluteMediaUrl(pairSource?.imageA) ||
      toAbsoluteMediaUrl(pairSource?.baseline) ||
      undefined;

    const imageB =
      toAbsoluteMediaUrl(pairSource?.images?.candidate) ||
      toAbsoluteMediaUrl(pairSource?.image_b) ||
      toAbsoluteMediaUrl(pairSource?.imageB) ||
      toAbsoluteMediaUrl(pairSource?.candidate) ||
      undefined;

    if (!imageA || !imageB || map.has(pairId)) return;

    map.set(pairId, { pairId, imageA, imageB });
  };

  if (Array.isArray(predictionList) && predictionList.length > 0) {
    predictionList.forEach((pair: any, index: number) => addPairPreview(pair, index));
  }

  if (Array.isArray(pairsFromState) && pairsFromState.length > 0) {
    pairsFromState.forEach((pair: any, index: number) => addPairPreview(pair, index));
  }

  return map;
}, [predictionList, pairsFromState]);

const pairsWithIssuesPreviews = useMemo(
  () => Array.from(pairsWithIssuesSet).map((pairId) => pairPreviewsById.get(pairId)).filter(Boolean) as PairPreview[],
  [pairsWithIssuesSet, pairPreviewsById]
);

const pairsWithoutIssuesPreviews = useMemo(
  () => Array.from(canonicalAllPairs)
    .filter((pairId) => !pairsWithIssuesSet.has(pairId))
    .map((pairId) => pairPreviewsById.get(pairId))
    .filter(Boolean) as PairPreview[],
  [canonicalAllPairs, pairsWithIssuesSet, pairPreviewsById]
);

// Debug (temporary — remove when confirmed)
console.debug("pair-counts-debug:", {
  allPairsCount,
  pairsWithIssuesCount,
  pairsWithoutIssuesCount,
  finalPairsWithoutIssuesCount,
  canonicalAllPairsSample: Array.from(canonicalAllPairs).slice(0, 6),
  pairsWithIssuesSample: Array.from(pairsWithIssuesSet).slice(0, 6),
});

const fetchResults = async () => {
  try {
    setLoading(true);
    setError(null);

    // Prefer navigation state from the live workflow before falling back to static mock data.
    if (predictionList.length > 0) {
      const hasRuleBasedOutput = predictionList.some(
        (x: any) => x?.issues !== undefined || x?.matching || x?.summary || x?.affected_css_properties
      );

      if (hasRuleBasedOutput) {
        // Rule-based output is already close to the final UI shape, but still needs pair-level normalization.
        const issues = predictionList.flatMap((pair: any, pairIndex: number) => {
          // const toDetectedIssue = (issue: any, index: number): DetectedIssue => {
          //   const bbox = issue?.bbox_baseline || [0, 0, 0, 0];
          const pairExplanations = Array.isArray(pair?.explanations) ? pair.explanations : [];

          const toDetectedIssue = (issueEntry: any, index: number): DetectedIssue => {
            const issueObject = issueEntry && typeof issueEntry === "object" ? issueEntry : {};
            const bbox = issueObject?.bbox_baseline || [0, 0, 0, 0];
            const x1 = Number(bbox[0] || 0);
            const y1 = Number(bbox[1] || 0);
            const x2 = Number(bbox[2] || 0);
            const y2 = Number(bbox[3] || 0);

            const severityCandidate = issueObject?.severity || pair?.summary?.highest_severity;
            const severity = RULE_BASED_SEVERITIES.includes(severityCandidate)
              ? severityCandidate
              : "low";

            const issueType = toIssueType(issueObject?.issue_type);
            const issueDescriptionFromList = typeof issueEntry === "string" ? issueEntry : "";
            const fallbackDescription =
              issueDescriptionFromList ||
              (typeof pair?.issues === "string" ? pair.issues : `${issueObject?.class || "element"} changed between screenshots`);

            const explanationFromPairList = typeof pairExplanations[index] === "string" ? pairExplanations[index] : "";

            return {
               id: `${pair?.pair_id ?? pairIndex}_${issueObject?.element_id_baseline ?? index}`,
              pair_id: pair?.pair_id ?? pairIndex,
              issue_type: issueType,
              severity,
              category: issueObject?.issue_type || "visual_regression",
              detected_between: {
                environment_a: { browser: "Baseline", os: "Captured", device_type: "desktop" },
                environment_b: { browser: "Candidate", os: "Captured", device_type: "desktop" },
              },
              description: issueObject?.description || fallbackDescription,
              explanation:
                issueObject?.explanation ||
                explanationFromPairList ||
                `Detected a visual difference between baseline and candidate screenshots for pair ${pair?.pair_id ?? pairIndex}.`,
              root_cause: issueObject?.issue_type || "visual_regression",
              css_properties: issueObject?.affected_css_properties || pair?.affected_css_properties || ["pixel-diff"],
              suggested_fix:
                issueObject?.suggested_fix ||
                pair?.suggested_fix ||
                "Inspect the matched element in both screenshots and align layout/content/styles for parity.",
              evidence: {
                screenshot_a_url: toAbsoluteMediaUrl(pair?.images?.baseline) || "/mock/screenshot_a.png",
                screenshot_b_url: toAbsoluteMediaUrl(pair?.images?.candidate) || "/mock/screenshot_b.png",
                heatmap_url: resolveHeatmapUrl(pair, issueObject),
                bounding_box: {
                  x: x1,
                  y: y1,
                  width: Math.max(0, x2 - x1),
                  height: Math.max(0, y2 - y1),
                },
              },
              visual_impact: issueObject?.class || "ui_element",
              occurrence_frequency: "common",
            };
          };

          const rawIssues = pair?.issues;

          if (Array.isArray(rawIssues)) {
            return rawIssues
              .filter((issue: any) => {
                if (typeof issue === "string") return issue.trim().length > 0;
                return Boolean(issue);
              })
              .map((issue: any, index: number) => toDetectedIssue(issue, index));
          }

          if (typeof rawIssues === "string" && rawIssues.trim()) {
            return [toDetectedIssue(rawIssues, 0)];
          }

          if (rawIssues && typeof rawIssues === "object") {
            return [toDetectedIssue(rawIssues, 0)];
          }

          return [];
        });

        const severityCount = {
          critical: issues.filter((x: any) => x.severity === "critical").length,
          high: issues.filter((x: any) => x.severity === "high").length,
          medium: issues.filter((x: any) => x.severity === "medium").length,
          low: issues.filter((x: any) => x.severity === "low").length,
        };

        const now = new Date().toISOString();
        const totalPairs = predictionList.length;
        const pairsWithIssues = predictionList.filter((pair: any) => {
          if (Array.isArray(pair?.issues)) return pair.issues.length > 0;
          if (typeof pair?.issues === "string") return pair.issues.trim().length > 0;
          return Boolean(pair?.issues && typeof pair?.issues === "object");
        }).length;

        const builtResults: TestResults = {
          session_id: sessionId || "demo",
          test_type: "upload",
          comparison_mode: "desktop_vs_desktop",
          summary: {
            total_pairs: totalPairs,
            issues_detected: issues.length,
            no_issues: Math.max(0, totalPairs - pairsWithIssues),
            high_severity: severityCount.critical + severityCount.high,
            medium_severity: severityCount.medium,
            low_severity: severityCount.low,
          },
          issues,
          test_metadata: {
            url: "",
            created_at: now,
            completed_at: now,
            processing_time_seconds: 0,
          },
        };

        setResults(builtResults);
        return;
      }

      const totalPairs = predictionList.length;

      const bugItems = predictionList.filter((x: any) => x?.prediction?.is_bug === true);

      const issuesDetected = bugItems.length;
      const noIssues = totalPairs - issuesDetected;

      // Older ML-only responses infer severity from probability because they do not return explicit severity.
      const severityFromProb = (p: number) => {
        if (p >= 0.75) return "high";
        if (p >= 0.45) return "medium";
        return "low";
      };

      const high = bugItems.filter((x: any) => severityFromProb(x?.prediction?.bug_probability ?? 0) === "high").length;
      const medium = bugItems.filter((x: any) => severityFromProb(x?.prediction?.bug_probability ?? 0) === "medium").length;
      const low = bugItems.filter((x: any) => severityFromProb(x?.prediction?.bug_probability ?? 0) === "low").length;

      const now = new Date().toISOString();

      const builtResults: TestResults = {
        session_id: sessionId || "demo",
        test_type: "upload",

        // STRING based on union type
        comparison_mode: "desktop_vs_desktop" as any,

        summary: {
          total_pairs: totalPairs,
          issues_detected: issuesDetected,
          no_issues: noIssues,
          high_severity: high,
          medium_severity: medium,
          low_severity: low,
        },

        issues: [],

        test_metadata: {
          url: "",
          created_at: now,
          completed_at: now,
          processing_time_seconds: 0,
        },
      };

      setResults(builtResults);
      return; 
    }

    // Mock data keeps the page previewable when opened directly without navigation state.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResults(mockResults);

  } catch (err: any) {
    setError("Failed to load results");
  } finally {
    setLoading(false);
  }
};

  const handleViewEvidence = (issue: DetectedIssue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };

  // Filter and sort issues
  const filteredIssues = results?.issues
    .filter(issue => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && issue.issue_type !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "severity") {
        // const severityOrder = { high: 0, medium: 1, low: 2 };
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      } else {
        return a.category.localeCompare(b.category);
      }
    }) || [];
  const groupedIssues = filteredIssues.reduce<Record<string, DetectedIssue[]>>((acc, issue) => {
  const pid = (issue as any).pair_id ?? "unknown";
  const key = `pair_${pid}`;
  if (!acc[key]) acc[key] = [];
  acc[key].push(issue);
  return acc;
}, {});

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading test results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Failed to Load Results</h2>
          <p className="text-slate-600 mb-6">{error || "Results not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto">
        <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-black-600 rounded-lg flex flex-wrap items-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          </div>
        
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Test Results</h1>
          </div>
        </div>
<SummaryCard
  summary={results.summary}
  metadata={results.test_metadata}
  pairsWithIssuesCount={pairsWithIssuesCount}
  pairsWithoutIssuesCount={finalPairsWithoutIssuesCount}
  pairsWithIssues={pairsWithIssuesPreviews}
  pairsWithoutIssues={pairsWithoutIssuesPreviews}
/>

        {/* Export Panel */}
        <ExportPanel
          results={results}
          pairsWithIssues={pairsWithIssuesPreviews}
          pairsWithoutIssues={pairsWithoutIssuesPreviews}
        />

        {/* Filter Panel */}
        <FilterPanel
          severityFilter={severityFilter}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          onSeverityChange={setSeverityFilter}
          onCategoryChange={setCategoryFilter}
          onSortChange={setSortBy}
          totalIssues={results.issues.length}
          filteredCount={filteredIssues.length}
        />

        {/* Issues List */}
<div className="space-y-4">
  {filteredIssues.length === 0 ? (
    <div className="bg-white rounded-xl p-12 text-center border">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {results.issues.length === 0 ? "No Issues Detected!" : "No Issues Match Filters"}
      </h3>
      <p className="text-slate-600">
        {results.issues.length === 0
          ? "All screenshots are consistent across browsers."
          : "Try adjusting your filters to see more results."}
      </p>
    </div>
  ) : (
    Object.entries(groupedIssues).map(([pairKey, pairIssueList]) => {
  const pairNumber = Number(pairKey.replace("pair_", ""));
  const pairLabel = Number.isFinite(pairNumber) ? pairNumber + 1 : pairKey.replace("pair_", "");
  const isCollapsed = !!collapsedPairs[pairKey];
   const pairSeverity = pairIssueList.reduce<string>((highest, issue) => {
    if ((severityRank[issue.severity] || 0) > (severityRank[highest] || 0)) {
      return issue.severity;
    }
    return highest;
  }, "low");
  const evidenceIssue = pairIssueList[0];
  const pairCssProperties =
    pairIssueList.find((issue) => Array.isArray(issue.css_properties) && issue.css_properties.length > 0)
      ?.css_properties || [];
   const suggestedFixes = Array.from(
    new Set(
      pairIssueList
        .map((issue) => issue.suggested_fix?.trim())
        .filter((fix): fix is string => Boolean(fix))
    )
  );

  return (
    <section key={pairKey} className="bg-white border rounded-xl">
      <button
        type="button"
        onClick={() => togglePair(pairKey)}
        className="w-full px-8 py-4 flex items-center justify-between border-b"
      >
        <div className="">
          <h3 className="flex text-lg font-bold text-slate-800">Pair {pairLabel}</h3>
          <span className="flex text-sm text-slate-500">
          {pairIssueList.length} issue{pairIssueList.length > 1 ? "s" : ""}
        </span>
        </div>
        {isCollapsed ? (
            <ChevronRight className="w-6 h-6 text-slate-700" />
          ) : (
            <ChevronDown className="w-6 h-6 text-slate-700" />
          )}
      </button>

      {!isCollapsed && (

        <div className="p-4 space-y-6">
          <div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 mb-3">
            <div className="gap-2"> 
                <div className="flex flex-wrap items-center gap-2 mt-5">
                <span className="text-sm font-medium text-slate-700">Severity Level : </span>
                <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${severityBadgeClasses[pairSeverity] || severityBadgeClasses.low}`}>
                  {pairSeverity.toUpperCase()}
                </span>
                 {evidenceIssue && (
                  <button
                    type="button"
                    onClick={() => handleViewEvidence(evidenceIssue)}
                    className="ml-auto shrink-0 px-2 py-1 rounded-md text-s font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
                  >
                    <Eye className="w-5 h-5" />
                    View Evidence
                  </button>
                )}
              </div>
                <br></br>

                <div className="flex flex-wrap px-3 py-4 bg-blue-50 border rounded-md border-blue-200 gap-2">
                  <div className="text-sm font-medium text-slate-700">Affected CSS Properties : </div>
                  <div className="flex flex-wrap gap-2">
                {pairCssProperties.length > 0 ? (
                  pairCssProperties.map((property, propertyIndex) => (
                    <code
                      key={`${pairKey}-css-${propertyIndex}`}
                      className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[12px]"
                    >
                      {property}
                    </code>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No affected CSS properties</span>
                )}
                </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 mb-3">
            <h4 className="text-md font-semibold text-slate-700 mb-2">Issues</h4>
            <ol className="space-y-2">
              {pairIssueList.map((issue, index) => (
                <li
                  key={`${issue.id}-description`}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2"
                >
                    <div className="flex items-start gap-3">
                    <div>
                      <p className="text-slate-700 text-sm">
                        <span className="font-semibold">Issue {index + 1} - </span>
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 mb-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Issue Explanations</h4>
            <ol className="space-y-2">
              {pairIssueList.map((issue, index) => (
                <li
                  key={`${issue.id}-explanation`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 text-sm"
                >
                  <span className="font-semibold">Explanation for Issue {index + 1} - </span>
                  {issue.explanation}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 mb-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Suggested Fixes</h4>
            <ol className="space-y-2">
              {suggestedFixes.map((fix, index) => (
                <li
                  key={`${pairKey}-suggested-fix-${index}`}
                  className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-900 text-sm"
                >
                  <span className="font-semibold">Suggestion {index + 1} - </span>
                  {fix}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
})
  )}
</div>
      </div>

      {/* Evidence Modal */}
      {showModal && selectedIssue && (
        <EvidenceModal
          issue={selectedIssue}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}









