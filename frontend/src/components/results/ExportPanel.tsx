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

import { FileJson, FileText } from "lucide-react";
import { useState } from "react";
import type { DetectedIssue, TestResults } from "../../types/Results";

interface PairPreview {
  pairId: string;
  imageA: string;
  imageB: string;
}

interface Props {
  sessionId: string;
  results: TestResults;
  pairsWithIssues?: PairPreview[];
  pairsWithoutIssues?: PairPreview[];
}

const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN = 40;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
const TEXT_LINE_HEIGHT = 15;
const IMAGE_GAP = 10;
const SECTION_GAP = 20;

const escapePdfText = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]/g, " ");

const wrapText = (text: string, maxChars = 90) => {
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

const getPairIdFromIssue = (issue: Partial<DetectedIssue> & Record<string, unknown>) => {
  const value = issue?.pair_id ?? issue?.pairId ?? issue?.pair;
  if (value === null || value === undefined) return "unknown";
  return String(value);
};

const readBlobAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const dataUrlToBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

type EmbeddedImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const loadImageAsJpeg = async (url?: string): Promise<EmbeddedImage | null> => {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const dataUrl = await readBlobAsDataUrl(blob);

    const image = new Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to decode image"));
      image.src = dataUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(image, 0, 0);
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.85);

    return {
      bytes: dataUrlToBytes(jpegDataUrl),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.warn("Could not load image for PDF:", url, error);
    return null;
  }
};

const stringToAsciiBytes = (text: string) => {
  const arr = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) arr[i] = text.charCodeAt(i) & 0xff;
  return arr;
};

const concatBytes = (chunks: Uint8Array[]) => {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }

  return out;
};

const getHeatmapUrls = (pairIssues: DetectedIssue[]) => {
  const urls = new Set<string>();

  pairIssues.forEach((issue) => {
    const url = issue?.evidence?.heatmap_url;
    if (url && url.trim()) urls.add(url);
  });

  return Array.from(urls);
};

const buildPdfBlob = async (
  results: TestResults,
  sessionId: string,
  pairsWithIssues: PairPreview[],
  pairsWithoutIssues: PairPreview[]
) => {
  type ImageUsage = {
    name: string;
    image: EmbeddedImage;
  };

  type Page = {
    contentParts: string[];
    images: ImageUsage[];
  };

  const pages: Page[] = [];
  const issueByPair = new Map<string, DetectedIssue[]>();

  results.issues.forEach((issue) => {
    const pairId = getPairIdFromIssue(issue as any);
    const existing = issueByPair.get(pairId) || [];
    existing.push(issue);
    issueByPair.set(pairId, existing);
  });

  const startPage = () => {
    const page: Page = { contentParts: [], images: [] };
    pages.push(page);
    return {
      page,
      y: PDF_PAGE_HEIGHT - PDF_MARGIN,
    };
  };

  let state = startPage();

  const ensureSpace = (requiredHeight: number) => {
    if (state.y - requiredHeight < PDF_MARGIN) state = startPage();
  };

  const addTextLine = (text: string, size = 11) => {
    ensureSpace(TEXT_LINE_HEIGHT + 2);
    state.page.contentParts.push(`BT /F1 ${size} Tf ${PDF_MARGIN} ${state.y} Td (${escapePdfText(text)}) Tj ET`);
    state.y -= TEXT_LINE_HEIGHT;
  };

  const addWrappedText = (label: string, value: string, size = 10) => {
    const lines = wrapText(`${label}${value}`);
    lines.forEach((line) => addTextLine(line, size));
  };

  const addImage = (image: EmbeddedImage, x: number, yBottom: number, width: number, height: number) => {

    const imageAspect = image.width / image.height;
    const boxAspect = width / height;

    const drawWidth = imageAspect > boxAspect ? width : height * imageAspect;
    const drawHeight = imageAspect > boxAspect ? width / imageAspect : height;
    const drawX = x + (width - drawWidth) / 2;
    const drawYBottom = yBottom + (height - drawHeight) / 2;

    const name = `Im${state.page.images.length + 1}`;
    state.page.images.push({ name, image });
    // state.page.contentParts.push(`q ${width} 0 0 ${height} ${x} ${yBottom} cm /${name} Do Q`);
    state.page.contentParts.push(`q ${drawWidth} 0 0 ${drawHeight} ${drawX} ${drawYBottom} cm /${name} Do Q`);
  };

  const addPairSection = async (pair: PairPreview, includeHeatmap: boolean) => {
    const pairIssues = issueByPair.get(pair.pairId) || [];

    addTextLine(`Pair ${pair.pairId}`, 13);
    addTextLine(includeHeatmap ? `Status: Issues found (${pairIssues.length})` : "Status: No issues", 10);

    if (includeHeatmap && pairIssues.length > 0) {
      pairIssues.slice(0, 5).forEach((issue, index) => {
        addWrappedText(`Issue ${index + 1}: `, issue.description, 9);
      });
    }

    const heatmapUrls = includeHeatmap ? getHeatmapUrls(pairIssues).slice(0, 3) : [];

    const [imageA, imageB, ...heatmapImages] = await Promise.all([
      loadImageAsJpeg(pair.imageA),
      loadImageAsJpeg(pair.imageB),
      ...heatmapUrls.map((url) => loadImageAsJpeg(url)),
    ]);

    const cardWidth = (PDF_CONTENT_WIDTH - IMAGE_GAP) / 2;
    const imageRowHeight = 170;

    addTextLine("Baseline & Candidate", 10);
    ensureSpace(imageRowHeight + SECTION_GAP);
    const imageYBottom = state.y - imageRowHeight;

    if (imageA) addImage(imageA, PDF_MARGIN, imageYBottom, cardWidth, imageRowHeight);
    else addTextLine("Baseline image unavailable", 9);

    if (imageB) addImage(imageB, PDF_MARGIN + cardWidth + IMAGE_GAP, imageYBottom, cardWidth, imageRowHeight);
    else addTextLine("Candidate image unavailable", 9);

    state.y = imageYBottom - 12;

    if (includeHeatmap) {
      if (heatmapImages.length === 0) {
        addTextLine("Heatmap unavailable for this pair.", 9);
      } else {
        for (let index = 0; index < heatmapImages.length; index += 1) {
          const heatmap = heatmapImages[index];
          if (!heatmap) continue;

          addTextLine(`Heatmap ${index + 1}`, 10);
          const heatmapHeight = 150;
          ensureSpace(heatmapHeight + SECTION_GAP);
          const heatmapYBottom = state.y - heatmapHeight;

          addImage(heatmap, PDF_MARGIN, heatmapYBottom, PDF_CONTENT_WIDTH, heatmapHeight);
          state.y = heatmapYBottom - 10;
        }
      }
    }

    addTextLine("--------------------------------------------------", 9);
    state.y -= 4;
  };

  addTextLine("EXPLIUI TEST REPORT", 16);
  addTextLine(`Session ID: ${sessionId}`, 11);
  addTextLine(`Generated At: ${new Date().toLocaleString()}`, 11);
  addTextLine(`Total Pairs: ${results.summary.total_pairs}`, 11);
  addTextLine(`Pairs With Issues: ${pairsWithIssues.length}`, 11);
  addTextLine(`Pairs Without Issues: ${pairsWithoutIssues.length}`, 11);
  state.y -= 8;

  addTextLine("PAIRS WITH ISSUES", 14);
  if (pairsWithIssues.length === 0) addTextLine("No pairs with issues.", 10);
  for (const pair of pairsWithIssues) {
    await addPairSection(pair, true);
  }

  addTextLine("PAIRS WITHOUT ISSUES", 14);
  if (pairsWithoutIssues.length === 0) addTextLine("No pairs without issues.", 10);
  for (const pair of pairsWithoutIssues) {
    await addPairSection(pair, false);
  }

  const pageCount = pages.length;
  const totalImageCount = pages.reduce((sum, p) => sum + p.images.length, 0);
  const fontObj = 3 + pageCount * 2 + 1;
  const maxObjectNum = fontObj + totalImageCount;
  const objectBytes: Array<Uint8Array | null> = Array.from({ length: maxObjectNum + 1 }, () => null);

  objectBytes[1] = stringToAsciiBytes("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const pageObjectNumbers: number[] = [];
  let nextImageObj = fontObj + 1;

  pages.forEach((page, index) => {
    const pageObj = 3 + index * 2;
    const contentObj = 4 + index * 2;
    pageObjectNumbers.push(pageObj);

    const imageObjByName = new Map<string, number>();
    page.images.forEach((img) => {
      imageObjByName.set(img.name, nextImageObj);
      nextImageObj += 1;
    });

    const xObjectRefs = page.images
      .map((img) => `/${img.name} ${imageObjByName.get(img.name)} 0 R`)
      .join(" ");

    const pageDict = `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObj} 0 R >>${xObjectRefs ? ` /XObject << ${xObjectRefs} >>` : ""} >> /Contents ${contentObj} 0 R >>\nendobj\n`;

    const contentText = page.contentParts.join("\n");
    const content = `${contentObj} 0 obj\n<< /Length ${contentText.length} >>\nstream\n${contentText}\nendstream\nendobj\n`;

    objectBytes[pageObj] = stringToAsciiBytes(pageDict);
    objectBytes[contentObj] = stringToAsciiBytes(content);

    page.images.forEach((imgUsage) => {
      const objNum = imageObjByName.get(imgUsage.name)!;
      const imgHeader = `${objNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgUsage.image.width} /Height ${imgUsage.image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgUsage.image.bytes.length} >>\nstream\n`;
      const imgFooter = "\nendstream\nendobj\n";

      objectBytes[objNum] = concatBytes([
        stringToAsciiBytes(imgHeader),
        imgUsage.image.bytes,
        stringToAsciiBytes(imgFooter),
      ]);
    });
  });

  const kids = pageObjectNumbers.map((n) => `${n} 0 R`).join(" ");
  objectBytes[2] = stringToAsciiBytes(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectNumbers.length} >>\nendobj\n`);
  objectBytes[fontObj] = stringToAsciiBytes(`${fontObj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  const chunks: Uint8Array[] = [stringToAsciiBytes("%PDF-1.4\n")];
  const offsets: number[] = new Array(maxObjectNum + 1).fill(0);

  let cursor = chunks[0].length;
  for (let objNum = 1; objNum <= maxObjectNum; objNum += 1) {
    const obj = objectBytes[objNum];
    if (!obj) continue;
    offsets[objNum] = cursor;
    chunks.push(obj);
    cursor += obj.length;
  }

  const xrefStart = cursor;
  let xref = `xref\n0 ${maxObjectNum + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i <= maxObjectNum; i += 1) {
    xref += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${maxObjectNum + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  chunks.push(stringToAsciiBytes(xref));
  chunks.push(stringToAsciiBytes(trailer));

  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
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

export function ExportPanel({ sessionId, results, pairsWithIssues = [], pairsWithoutIssues = [] }: Props) {
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

      const fallbackBlob = await buildPdfBlob(results, sessionId, pairsWithIssues, pairsWithoutIssues);
      downloadBlob(fallbackBlob, `expliui-report-${sessionId}.pdf`);
    } catch (error) {
      console.error("Export PDF failed, using frontend fallback:", error);
      const fallbackBlob = await buildPdfBlob(results, sessionId, pairsWithIssues, pairsWithoutIssues);
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

  return (
    <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">Export Results</h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPDF}
          disabled={exporting === "pdf"}
          className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText className="h-4 w-4 text-blue-600" />
          {exporting === "pdf" ? "Generating..." : "Download PDF"}
        </button>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-50"
        >
          <FileJson className="h-4 w-4 text-blue-600" />
          Export JSON
        </button>
      </div>
    </div>
  );
}


// import { FileJson, FileText, Save } from "lucide-react";
// import { useState } from "react";
// import type { TestResults } from "../../types/Results";

// interface Props {
//   sessionId: string;
//   results: TestResults;
// }

// const MAX_ISSUES_IN_PDF = 50;
// const PDF_PAGE_WIDTH = 595;
// const PDF_PAGE_HEIGHT = 842;
// const PDF_MARGIN_X = 50;
// const PDF_TOP_Y = 800;
// const PDF_BOTTOM_Y = 60;
// const PDF_LINE_HEIGHT = 16;
// const PDF_MAX_TEXT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_X * 2;
// const PDF_AVG_CHAR_WIDTH = 6.1;
// const PDF_MAX_CHARS_PER_LINE = Math.max(20, Math.floor(PDF_MAX_TEXT_WIDTH / PDF_AVG_CHAR_WIDTH));

// const escapePdfText = (text: string) =>
//   text
//     .replace(/\\/g, "\\\\")
//     .replace(/\(/g, "\\(")
//     .replace(/\)/g, "\\)")
//     .replace(/\r\n/g, " ")
//     .replace(/[\r\n]/g, " ");

// const wrapText = (text: string, maxChars = PDF_MAX_CHARS_PER_LINE) => {
//   const normalized = text.trim().replace(/\s+/g, " ");
//   if (!normalized) return [""];

//   const words = normalized.split(" ");
//   const lines: string[] = [];
//   let current = "";

//   for (const word of words) {
//     if (!current) {
//       current = word;
//       continue;
//     }

//     const next = `${current} ${word}`;
//     if (next.length <= maxChars) {
//       current = next;
//     } else {
//       lines.push(current);
//       current = word;
//     }
//   }

//   if (current) lines.push(current);
//   return lines;
// };

// const appendWrapped = (lines: string[], text: string, prefix = "") => {
//   const wrapped = wrapText(text);
//   wrapped.forEach((line, index) => {
//     lines.push(index === 0 ? `${prefix}${line}` : `${" ".repeat(prefix.length)}${line}`);
//   });
// };

// const paginateLines = (lines: string[]) => {
//   const maxLinesPerPage = Math.floor((PDF_TOP_Y - PDF_BOTTOM_Y) / PDF_LINE_HEIGHT);
//   const pages: string[][] = [];

//   for (let i = 0; i < lines.length; i += maxLinesPerPage) {
//     pages.push(lines.slice(i, i + maxLinesPerPage));
//   }

//   return pages.length > 0 ? pages : [["ExpliUI Report"]];
// };

// const buildPdfBlob = (lines: string[]) => {
//   const pages = paginateLines(lines);

//   const objects: string[] = [];

//   const catalogObj = 1;
//   const pagesObj = 2;
//   const fontObj = 3;

//   objects[catalogObj] = `${catalogObj} 0 obj\n<< /Type /Catalog /Pages ${pagesObj} 0 R >>\nendobj\n`;

//   const pageObjectNumbers: number[] = [];
//   const contentObjectNumbers: number[] = [];

//   pages.forEach((pageLines, index) => {
//     const pageObjNum = 4 + index * 2;
//     const contentObjNum = 5 + index * 2;
//     pageObjectNumbers.push(pageObjNum);
//     contentObjectNumbers.push(contentObjNum);

//     const streamContent = [
//       "BT",
//       "/F1 12 Tf",
//       `${PDF_MARGIN_X} ${PDF_TOP_Y} Td`,
//       ...pageLines.flatMap((line, lineIndex) => {
//         if (lineIndex === 0) return [`(${escapePdfText(line)}) Tj`];
//         return [`0 -${PDF_LINE_HEIGHT} Td`, `(${escapePdfText(line)}) Tj`];
//       }),
//       "ET",
//     ].join("\n");

//     objects[contentObjNum] = `${contentObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
//     objects[pageObjNum] = `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`;
//   });

//   objects[pagesObj] = `${pagesObj} 0 obj\n<< /Type /Pages /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>\nendobj\n`;
//   objects[fontObj] = `${fontObj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

//   let pdf = "%PDF-1.4\n";
//   const offsets: number[] = [0];
//   const maxObjectNumber = Math.max(...Object.keys(objects).map(Number));

//   for (let objNum = 1; objNum <= maxObjectNumber; objNum += 1) {
//     const objectText = objects[objNum];
//     if (!objectText) continue;
//     offsets[objNum] = pdf.length;
//     pdf += objectText;
//   }

//   const xrefStart = pdf.length;
//   pdf += `xref\n0 ${maxObjectNumber + 1}\n`;
//   pdf += "0000000000 65535 f \n";

//   for (let i = 1; i <= maxObjectNumber; i += 1) {
//     const offset = offsets[i] ?? 0;
//     pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
//   }

//   pdf += `trailer\n<< /Size ${maxObjectNumber + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

//   return new Blob([pdf], { type: "application/pdf" });
// };

// const buildPdfLines = (results: TestResults, sessionId: string) => {
//   const generatedAt = new Date().toLocaleString();
//   const lines: string[] = [];

//   lines.push("EXPLIUI TEST REPORT");
//   lines.push("==============================================");
//   lines.push("");
//   lines.push(`Session ID: ${sessionId}`);
//   lines.push(`Generated At: ${generatedAt}`);
//   lines.push(`Test Type: ${results.test_type}`);
//   lines.push(`Comparison Mode: ${results.comparison_mode}`);
//   lines.push("");

//   lines.push("SUMMARY");
//   lines.push("----------------------------------------------");
//   lines.push(`Total Pairs: ${results.summary.total_pairs}`);
//   lines.push(`Issues Detected: ${results.summary.issues_detected}`);
//   lines.push(`High Severity: ${results.summary.high_severity}`);
//   lines.push(`Medium Severity: ${results.summary.medium_severity}`);
//   lines.push(`Low Severity: ${results.summary.low_severity}`);
//   lines.push("");

//   lines.push("ISSUE DETAILS");
//   lines.push("----------------------------------------------");

//   const selectedIssues = results.issues.slice(0, MAX_ISSUES_IN_PDF);
//   if (selectedIssues.length === 0) {
//     lines.push("No issues detected.");
//     return lines;
//   }

//   selectedIssues.forEach((issue, index) => {
//     const envA = issue.detected_between.environment_a.browser;
//     const envB = issue.detected_between.environment_b.browser;

//     lines.push(`Issue ${index + 1}`);
//     lines.push(`Severity: ${issue.severity.toUpperCase()}`);
//     lines.push(`Type: ${issue.issue_type}`);
//     lines.push(`Category: ${issue.category}`);
//     lines.push(`Environments: ${envA} vs ${envB}`);
//     appendWrapped(lines, issue.description, "Description: ");
//     appendWrapped(lines, issue.suggested_fix, "Suggested Fix: ");
//     lines.push("----------------------------------------------");
//   });

//   if (results.issues.length > MAX_ISSUES_IN_PDF) {
//     lines.push(`Note: ${results.issues.length - MAX_ISSUES_IN_PDF} additional issues were omitted.`);
//   }

//   return lines;
// };

// const downloadBlob = (blob: Blob, filename: string) => {
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   link.click();
//   window.URL.revokeObjectURL(url);
// };

// const isValidPdfBlob = async (blob: Blob) => {
//   if (blob.size < 5) return false;
//   const header = await blob.slice(0, 5).text();
//   return header === "%PDF-";
// };

// export function ExportPanel({ sessionId, results }: Props) {
//   const [exporting, setExporting] = useState<string | null>(null);

//   const handleExportPDF = async () => {
//     setExporting("pdf");
//     try {
//       const response = await fetch(`/api/export/pdf/${sessionId}`);
//       if (!response.ok) throw new Error(`PDF export failed with status ${response.status}`);

//       const blob = await response.blob();
//       const validServerPdf = await isValidPdfBlob(blob);

//       if (validServerPdf) {
//         downloadBlob(blob, `expliui-report-${sessionId}.pdf`);
//         return;
//       }

//       console.warn("Server PDF response is not a valid PDF. Using frontend PDF fallback.");
//       const fallbackBlob = buildPdfBlob(buildPdfLines(results, sessionId));
//       downloadBlob(fallbackBlob, `expliui-report-${sessionId}.pdf`);
//     } catch (error) {
//       console.error("Export PDF failed, using frontend fallback:", error);
//       const fallbackBlob = buildPdfBlob(buildPdfLines(results, sessionId));
//       downloadBlob(fallbackBlob, `expliui-report-${sessionId}.pdf`);
//     } finally {
//       setExporting(null);
//     }
//   };

//   const handleExportJSON = () => {
//     const dataStr = JSON.stringify(results, null, 2);
//     const dataBlob = new Blob([dataStr], { type: "application/json" });
//     downloadBlob(dataBlob, `expliui-data-${sessionId}.json`);
//   };

//   const handleSaveSession = async () => {
//     setExporting("save");
//     try {
//       await fetch(`/api/sessions/${sessionId}/save`, { method: "POST" });
//       alert("Session saved successfully!");
//     } catch (error) {
//       console.error("Save session failed:", error);
//       alert("Failed to save session");
//     } finally {
//       setExporting(null);
//     }
//   };

//   return (
//     <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
//       <h3 className="mb-4 font-semibold text-slate-800">Export Results</h3>

//       <div className="flex flex-wrap gap-3">
//         <button
//           onClick={handleExportPDF}
//           disabled={exporting === "pdf"}
//           className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           <FileText className="h-4 w-4 text-blue-600" />
//           {exporting === "pdf" ? "Generating..." : "Download PDF"}
//         </button>

//         <button
//           onClick={handleExportJSON}
//           className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-50"
//         >
//           <FileJson className="h-4 w-4 text-blue-600" />
//           Export JSON
//         </button>

//         {/* <button
//           onClick={handleSaveSession}
//           disabled={exporting === "save"}
//           className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           <Save className="h-4 w-4" />
//           {exporting === "save" ? "Saving..." : "Save Session"}
//         </button> */}
//       </div>
//     </div>
//   );
// }






// //   return (
// //     <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
// //       <h3 className="font-semibold text-slate-800 mb-4">Export Results</h3>
      
// //       <div className="flex flex-wrap gap-3">
// //         <button
// //           onClick={handleExportPDF}
// //           disabled={exporting === 'pdf'}
// //           className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //         >
// //           <FileText className="w-4 h-4" />
// //           {exporting === 'pdf' ? 'Generating...' : 'Download PDF'}
// //         </button>

// //         <button
// //           onClick={handleExportJSON}
// //           className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg hover:bg-blue-700 transition-colors"
// //         >
// //           <FileJson className="w-4 h-4" />
// //           Export JSON
// //         </button>

// //         <button
// //           onClick={handleSaveSession}
// //           disabled={exporting === 'save'}
// //           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600 hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //         >
// //           <Save className="w-4 h-4" />
// //           {exporting === 'save' ? 'Saving...' : 'Save Session'}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }