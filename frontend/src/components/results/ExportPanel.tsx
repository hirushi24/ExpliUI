import { Download, FileJson, FileText, Save } from "lucide-react";
import { useState } from "react";
import type { TestResults } from "../../types/Results";

interface Props {
  sessionId: string;
  results: TestResults;
}

export function ExportPanel({ sessionId, results }: Props) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const response = await fetch(`/api/export/pdf/${sessionId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expliui-report-${sessionId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Export PDF failed:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expliui-data-${sessionId}.json`;
    link.click();
  };

  const handleSaveSession = async () => {
    setExporting('save');
    try {
      await fetch(`/api/sessions/${sessionId}/save`, { method: 'POST' });
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Save session failed:', error);
      alert('Failed to save session');
    } finally {
      setExporting(null);
    }
  };

  return (
  <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-4">Export Results</h3>

    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExportPDF}
        disabled={exporting === "pdf"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
                   bg-white text-slate-700 border-slate-200 hover:bg-slate-50
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText className="w-4 h-4 text-red-600" />
        {exporting === "pdf" ? "Generating..." : "Download PDF"}
      </button>

      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
                   bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      >
        <FileJson className="w-4 h-4 text-blue-600" />
        Export JSON
      </button>

      <button
        onClick={handleSaveSession}
        disabled={exporting === "save"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                   bg-blue-600 text-white hover:bg-blue-700
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        {exporting === "save" ? "Saving..." : "Save Session"}
      </button>
    </div>
  </div>
);
}
//   return (
//     <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
//       <h3 className="font-semibold text-slate-800 mb-4">Export Results</h3>
      
//       <div className="flex flex-wrap gap-3">
//         <button
//           onClick={handleExportPDF}
//           disabled={exporting === 'pdf'}
//           className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <FileText className="w-4 h-4" />
//           {exporting === 'pdf' ? 'Generating...' : 'Download PDF'}
//         </button>

//         <button
//           onClick={handleExportJSON}
//           className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <FileJson className="w-4 h-4" />
//           Export JSON
//         </button>

//         <button
//           onClick={handleSaveSession}
//           disabled={exporting === 'save'}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600 hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Save className="w-4 h-4" />
//           {exporting === 'save' ? 'Saving...' : 'Save Session'}
//         </button>
//       </div>
//     </div>
//   );
// }