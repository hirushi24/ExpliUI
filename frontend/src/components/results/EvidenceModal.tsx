import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { useState } from "react";
import type { DetectedIssue } from "../../types/Results";
import { HeatmapOverlay } from "./HeatmapOverlay";

// Side-by-side evidence viewer for one detected issue, including optional heatmap overlay and downloads.
interface Props {
  issue: DetectedIssue;
  onClose: () => void;
}

export function EvidenceModal({ issue, onClose }: Props) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [zoom, setZoom] = useState(1);

  const downloadImage = (url: string, filename: string) => {
    // Trigger a direct browser download so users can attach the raw evidence to bug reports.
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Visual Evidence
            </h2>
            {/* <p className="text-sm text-slate-600">
              {issue.description}
            </p> */}
          </div>
          
          <div className="flex items-center gap-2">
            {issue.evidence.heatmap_url && (
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showHeatmap
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {showHeatmap ? "Hide" : "Show"} Heatmap
              </button>
            )}
            
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="p-2 hover:bg-slate-100 rounded transition-colors"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-medium">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                className="p-2 hover:bg-slate-100 rounded transition-colors"
                disabled={zoom >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-2 gap-6">
            {/* Screenshot A */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-700">Environment A</h3>
                  <p className="text-sm text-slate-500">
                    {issue.detected_between.environment_a.browser} • {issue.detected_between.environment_a.os}
                  </p>
                </div>
                <button
                  onClick={() => downloadImage(issue.evidence.screenshot_a_url, 'screenshot_a.png')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative border rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={issue.evidence.screenshot_a_url}
                  alt="Screenshot A"
                  className="w-full h-auto"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                />
                
                {issue.evidence.bounding_box && (
                  <div
                    className="absolute border-4 border-red-500 bg-red-500/10 pointer-events-none"
                    style={{
                      left: `${issue.evidence.bounding_box.x * zoom}px`,
                      top: `${issue.evidence.bounding_box.y * zoom}px`,
                      width: `${issue.evidence.bounding_box.width * zoom}px`,
                      height: `${issue.evidence.bounding_box.height * zoom}px`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Screenshot B */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-700">Environment B</h3>
                  <p className="text-sm text-slate-500">
                    {issue.detected_between.environment_b.browser} • {issue.detected_between.environment_b.os}
                  </p>
                </div>
                <button
                  onClick={() => downloadImage(issue.evidence.screenshot_b_url, 'screenshot_b.png')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative border rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={issue.evidence.screenshot_b_url}
                  alt="Screenshot B"
                  className="w-full h-auto"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                />
                
                {issue.evidence.bounding_box && (
                  <div
                    className="absolute border-4 border-red-500 bg-red-500/10 pointer-events-none"
                    style={{
                      left: `${issue.evidence.bounding_box.x * zoom}px`,
                      top: `${issue.evidence.bounding_box.y * zoom}px`,
                      width: `${issue.evidence.bounding_box.width * zoom}px`,
                      height: `${issue.evidence.bounding_box.height * zoom}px`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          {showHeatmap && issue.evidence.heatmap_url && (
            <div className="mt-6">
              <div className="flex justify-between">
              <h3 className="font-semibold text-slate-700 mb-3">Difference Heatmap</h3>
              {issue.evidence.heatmap_url && (
                <button
                  onClick={() => downloadImage(issue.evidence.heatmap_url!, 'heatmap.png')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              </div>
              <HeatmapOverlay 
                heatmapUrl={issue.evidence.heatmap_url} 
                zoom={zoom}
              />
              {/* {issue.evidence.heatmap_url && (
                <button
                  onClick={() => downloadImage(issue.evidence.heatmap_url!, 'heatmap.png')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
