// import { Download, FileJson, FileText, Save } from "lucide-react";
// import { useState } from "react";
// import type { TestResults } from "../../types/Results";

// interface Props {
//   sessionId: string;
//   results: TestResults;
// }

// export function ExportPanel({ sessionId, results }: Props) {
//   const [exporting, setExporting] = useState<string | null>(null);

//   const handleExportPDF = async () => {
//     setExporting('pdf');
//     try {
//       const response = await fetch(`/api/export/pdf/${sessionId}`);
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `expliuireport.pdf`;
//       link.click();
//     } catch (error) {
//       console.error('Export PDF failed:', error);
//       alert('Failed to export PDF');
//     } finally {
//       setExporting(null);
//     }
//   };

//   const handleExportJSON = () => {
//     const dataStr = JSON.stringify(results, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
//     const url = window.URL.createObjectURL(dataBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `expliui-data-${sessionId}.json`;
//     link.click();
//   };

//   const handleSaveSession = async () => {
//     setExporting('save');
//     try {
//       await fetch(`/api/sessions/${sessionId}/save`, { method: 'POST' });
//       alert('Session saved successfully!');
//     } catch (error) {
//       console.error('Save session failed:', error);
//       alert('Failed to save session');
//     } finally {
//       setExporting(null);
//     }
//   };

//   return (
//   <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
//     <h3 className="font-semibold text-slate-800 mb-4">Export Results</h3>

//     <div className="flex flex-wrap gap-3">
//       <button
//         onClick={handleExportPDF}
//         disabled={exporting === "pdf"}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
//                    bg-white text-slate-700 border-slate-200 hover:bg-slate-50
//                    disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <FileText className="w-4 h-4 text-red-600" />
//         {exporting === "pdf" ? "Generating..." : "Download PDF"}
//       </button>

//       <button
//         onClick={handleExportJSON}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
//                    bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
//       >
//         <FileJson className="w-4 h-4 text-blue-600" />
//         Export JSON
//       </button>

//       <button
//         onClick={handleSaveSession}
//         disabled={exporting === "save"}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
//                    bg-blue-600 text-white hover:bg-blue-700
//                    disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <Save className="w-4 h-4" />
//         {exporting === "save" ? "Saving..." : "Save Session"}
//       </button>
//     </div>
//   </div>
// );
// }


import { FileJson, FileText, Save } from "lucide-react";
import { useState } from "react";
import type { TestResults } from "../../types/Results";

interface Props {
  sessionId: string;
  results: TestResults;
}

const MAX_ISSUES_IN_PDF = 50;
const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN_X = 50;
const PDF_TOP_Y = 800;
const PDF_BOTTOM_Y = 60;
const PDF_LINE_HEIGHT = 16;
const PDF_MAX_TEXT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_X * 2;
const PDF_AVG_CHAR_WIDTH = 6.1;
const PDF_MAX_CHARS_PER_LINE = Math.max(20, Math.floor(PDF_MAX_TEXT_WIDTH / PDF_AVG_CHAR_WIDTH));

const escapePdfText = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]/g, " ");

const wrapText = (text: string, maxChars = PDF_MAX_CHARS_PER_LINE) => {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    const next = `${current} ${word}`;
    if (next.length <= maxChars) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
};

const appendWrapped = (lines: string[], text: string, prefix = "") => {
  const wrapped = wrapText(text);
  wrapped.forEach((line, index) => {
    lines.push(index === 0 ? `${prefix}${line}` : `${" ".repeat(prefix.length)}${line}`);
  });
};

const paginateLines = (lines: string[]) => {
  const maxLinesPerPage = Math.floor((PDF_TOP_Y - PDF_BOTTOM_Y) / PDF_LINE_HEIGHT);
  const pages: string[][] = [];

  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }

  return pages.length > 0 ? pages : [["ExpliUI Report"]];
};

const buildPdfBlob = (lines: string[]) => {
  const pages = paginateLines(lines);

  const objects: string[] = [];

  const catalogObj = 1;
  const pagesObj = 2;
  const fontObj = 3;

  objects[catalogObj] = `${catalogObj} 0 obj\n<< /Type /Catalog /Pages ${pagesObj} 0 R >>\nendobj\n`;

  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];

  pages.forEach((pageLines, index) => {
    const pageObjNum = 4 + index * 2;
    const contentObjNum = 5 + index * 2;
    pageObjectNumbers.push(pageObjNum);
    contentObjectNumbers.push(contentObjNum);

    const streamContent = [
      "BT",
      "/F1 12 Tf",
      `${PDF_MARGIN_X} ${PDF_TOP_Y} Td`,
      ...pageLines.flatMap((line, lineIndex) => {
        if (lineIndex === 0) return [`(${escapePdfText(line)}) Tj`];
        return [`0 -${PDF_LINE_HEIGHT} Td`, `(${escapePdfText(line)}) Tj`];
      }),
      "ET",
    ].join("\n");

    objects[contentObjNum] = `${contentObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
    objects[pageObjNum] = `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`;
  });

  objects[pagesObj] = `${pagesObj} 0 obj\n<< /Type /Pages /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>\nendobj\n`;
  objects[fontObj] = `${fontObj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  const maxObjectNumber = Math.max(...Object.keys(objects).map(Number));

  for (let objNum = 1; objNum <= maxObjectNumber; objNum += 1) {
    const objectText = objects[objNum];
    if (!objectText) continue;
    offsets[objNum] = pdf.length;
    pdf += objectText;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${maxObjectNumber + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= maxObjectNumber; i += 1) {
    const offset = offsets[i] ?? 0;
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObjectNumber + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const buildPdfLines = (results: TestResults, sessionId: string) => {
  const generatedAt = new Date().toLocaleString();
  const lines: string[] = [];

  lines.push("EXPLIUI TEST REPORT");
  lines.push("==============================================");
  lines.push("");
  lines.push(`Session ID: ${sessionId}`);
  lines.push(`Generated At: ${generatedAt}`);
  lines.push(`Test Type: ${results.test_type}`);
  lines.push(`Comparison Mode: ${results.comparison_mode}`);
  lines.push("");

  lines.push("SUMMARY");
  lines.push("----------------------------------------------");
  lines.push(`Total Pairs: ${results.summary.total_pairs}`);
  lines.push(`Issues Detected: ${results.summary.issues_detected}`);
  lines.push(`High Severity: ${results.summary.high_severity}`);
  lines.push(`Medium Severity: ${results.summary.medium_severity}`);
  lines.push(`Low Severity: ${results.summary.low_severity}`);
  lines.push("");

  lines.push("ISSUE DETAILS");
  lines.push("----------------------------------------------");

  const selectedIssues = results.issues.slice(0, MAX_ISSUES_IN_PDF);
  if (selectedIssues.length === 0) {
    lines.push("No issues detected.");
    return lines;
  }

  selectedIssues.forEach((issue, index) => {
    const envA = issue.detected_between.environment_a.browser;
    const envB = issue.detected_between.environment_b.browser;

    lines.push(`Issue ${index + 1}`);
    lines.push(`Severity: ${issue.severity.toUpperCase()}`);
    lines.push(`Type: ${issue.issue_type}`);
    lines.push(`Category: ${issue.category}`);
    lines.push(`Environments: ${envA} vs ${envB}`);
    appendWrapped(lines, issue.description, "Description: ");
    appendWrapped(lines, issue.suggested_fix, "Suggested Fix: ");
    lines.push("----------------------------------------------");
  });

  if (results.issues.length > MAX_ISSUES_IN_PDF) {
    lines.push(`Note: ${results.issues.length - MAX_ISSUES_IN_PDF} additional issues were omitted.`);
  }

  return lines;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const isValidPdfBlob = async (blob: Blob) => {
  if (blob.size < 5) return false;
  const header = await blob.slice(0, 5).text();
  return header === "%PDF-";
};

export function ExportPanel({ sessionId, results }: Props) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setExporting("pdf");
    try {
      const response = await fetch(`/api/export/pdf/${sessionId}`);
      if (!response.ok) throw new Error(`PDF export failed with status ${response.status}`);

      const blob = await response.blob();
      const validServerPdf = await isValidPdfBlob(blob);

      if (validServerPdf) {
        downloadBlob(blob, `expliui-report-${sessionId}.pdf`);
        return;
      }

      console.warn("Server PDF response is not a valid PDF. Using frontend PDF fallback.");
      const fallbackBlob = buildPdfBlob(buildPdfLines(results, sessionId));
      downloadBlob(fallbackBlob, `expliui-report-${sessionId}.pdf`);
    } catch (error) {
      console.error("Export PDF failed, using frontend fallback:", error);
      const fallbackBlob = buildPdfBlob(buildPdfLines(results, sessionId));
      downloadBlob(fallbackBlob, `expliui-report-${sessionId}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    downloadBlob(dataBlob, `expliui-data-${sessionId}.json`);
  };

  const handleSaveSession = async () => {
    setExporting("save");
    try {
      await fetch(`/api/sessions/${sessionId}/save`, { method: "POST" });
      alert("Session saved successfully!");
    } catch (error) {
      console.error("Save session failed:", error);
      alert("Failed to save session");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">Export Results</h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPDF}
          disabled={exporting === "pdf"}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText className="h-4 w-4 text-red-600" />
          {exporting === "pdf" ? "Generating..." : "Download PDF"}
        </button>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FileJson className="h-4 w-4 text-blue-600" />
          Export JSON
        </button>

        <button
          onClick={handleSaveSession}
          disabled={exporting === "save"}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
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