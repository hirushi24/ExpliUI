// src/pages/Results.tsx

import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { SummaryCard } from "../components/results/SummaryCard";
import { IssueCard } from "../components/results/IssueCard";
import { EvidenceModal } from "../components/results/EvidenceModal";
import { ExportPanel } from "../components/results/ExportPanel";
import { FilterPanel } from "../components/results/FilterPanel";
import type { TestResults, DetectedIssue } from "../types/Results";
import { mockResults } from "../mocks/ResultsData.ts";
import { Loader2 } from "lucide-react";

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // const location = useLocation();
  // const state = location.state as any;

  // console.log("Results page mounted", location.state);

  // const pairsFromState = state?.pairs || [];
  // const uploadResponseFromState = state?.uploadResponse || [];
  
  const location = useLocation();
  const state = location.state as any;

  const pairsFromState = state?.pairs || [];
  const uploadResponseFromState = state?.uploadResponse || null;

  // predictions array:
  const predictionList = uploadResponseFromState?.results || [];
  
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIssue, setSelectedIssue] = useState<DetectedIssue | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"severity" | "category">("severity");

  // Fetch results
  // useEffect(() => {
  //   fetchResults();
  // }, [sessionId]);

  useEffect(() => {
  fetchResults();
}, [sessionId]);

  // const fetchResults = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`/api/results/${sessionId}`);
      
  //     if (!response.ok) throw new Error("Failed to fetch results");
      
  //     const data = await response.json();
  //     setResults(data);
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

//   const fetchResults = async () => {
//   try {
//     setLoading(true);

//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 800));

//     setResults(mockResults);

//   } catch (err: any) {
//     setError("Failed to load mock results");
//   } finally {
//     setLoading(false);
//   }
// };

const fetchResults = async () => {
  try {
    setLoading(true);
    setError(null);

    // If backend response in state, use it instead of mock
    if (predictionList.length > 0) {
      const totalPairs = predictionList.length;

      const bugItems = predictionList.filter((x: any) => x?.prediction?.is_bug === true);

      const issuesDetected = bugItems.length;
      const noIssues = totalPairs - issuesDetected;

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

    // Fallback to mock only if no state results
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
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      } else {
        return a.category.localeCompare(b.category);
      }
    }) || [];

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
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Test Results</h1>
            <p className="text-sm text-slate-500">Session ID: {sessionId}</p>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Card */}
        <SummaryCard summary={results.summary} metadata={results.test_metadata} />

        {/* Export Panel */}
        <ExportPanel sessionId={sessionId!} results={results} />

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
        {/* <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {results.issues.length === 0 
                  ? "No Issues Detected!" 
                  : "No Issues Match Filters"}
              </h3>
              <p className="text-slate-600">
                {results.issues.length === 0
                  ? "All screenshots are consistent across browsers."
                  : "Try adjusting your filters to see more results."}
              </p>
            </div>
          ) : (
            filteredIssues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={index}
                onViewEvidence={handleViewEvidence}
              />
            ))
          )}
        </div> */}
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