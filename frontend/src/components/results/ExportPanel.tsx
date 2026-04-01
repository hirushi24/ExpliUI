import { FileJson, FileText } from "lucide-react";
import { useState } from "react";
import type { DetectedIssue, TestResults } from "../../types/Results";

interface PairPreview {
  pairId: string;
  imageA: string;
  imageB: string;
}

interface Props {
  // sessionId: string;
  results: TestResults;
  pairsWithIssues?: PairPreview[];
  pairsWithoutIssues?: PairPreview[];
}

// Export helpers support JSON download and a frontend-generated PDF fallback when the backend export route is absent.
const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN = 40;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;

const TEXT_LINE_HEIGHT = 15;
const SMALL_LINE_HEIGHT = 13;
const IMAGE_GAP = 10;
const SECTION_GAP = 20;

const escapePdfText = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]/g, " ");

const wrapText = (text: string, maxChars = 112) => {
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

const wrapLabeledText = (label: string, value: string, maxChars = 112) => {
  const normalizedValue = value.trim().replace(/\s+/g, " ");
  if (!normalizedValue) return [label.trim()];

  const labelText = label.trimEnd();
  const words = normalizedValue.split(" ");
  const lines: string[] = [];

  let current = `${labelText}${words[0] ? words[0].startsWith(" ") ? words[0] : ` ${words[0]}` : ""}`;

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (next.length <= maxChars) {
      current = next;
    } else {
      lines.push(current);
      current = `   ${words[i]}`;
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
    // Re-encode to JPEG so embedded images stay small enough for a browser-built PDF.
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
  // sessionId: string,
  pairsWithIssues: PairPreview[],
  pairsWithoutIssues: PairPreview[]
) => {
  // Build a lightweight PDF manually so exports still work without a PDF library dependency.
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
    // Group issues by pair so the report can present one concise section per screenshot pair.
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
    // Start a new PDF page whenever the next section would overflow the printable area.
    if (state.y - requiredHeight < PDF_MARGIN) {
      state = startPage();
    }
  };

  const addTextLine = (text: string, size = 11, lineHeight = TEXT_LINE_HEIGHT) => {
    ensureSpace(lineHeight + 2);
    state.page.contentParts.push(
      `BT /F1 ${size} Tf ${PDF_MARGIN} ${state.y} Td (${escapePdfText(text)}) Tj ET`
    );
    state.y -= lineHeight;
  };

  const addWrappedText = (text: string, size = 10, maxChars = 112, lineHeight = SMALL_LINE_HEIGHT) => {
    const lines = wrapText(text, maxChars);
    lines.forEach((line) => addTextLine(line, size, lineHeight));
  };

  const addWrappedLabeledText = (
    label: string,
    value: string,
    size = 10,
    maxChars = 112,
    lineHeight = SMALL_LINE_HEIGHT
  ) => {
    const lines = wrapLabeledText(label, value, maxChars);
    lines.forEach((line) => addTextLine(line, size, lineHeight));
  };

  const addSpacer = (height = 8) => {
    ensureSpace(height);
    state.y -= height;
  };

  const addDivider = () => {
    ensureSpace(10);
    const y = state.y;
    state.page.contentParts.push(
      `q 0.75 w ${PDF_MARGIN} ${y} m ${PDF_PAGE_WIDTH - PDF_MARGIN} ${y} l S Q`
    );
    state.y -= 10;
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
    state.page.contentParts.push(
      `q ${drawWidth} 0 0 ${drawHeight} ${drawX} ${drawYBottom} cm /${name} Do Q`
    );
  };

  const addSummaryRow = (label: string, value: string | number) => {
    addTextLine(`${label}: ${value}`, 11, 14);
  };

  const addPairSection = async (
    pair: PairPreview,
    includeHeatmap: boolean,
    displayPairNumber: number
  ) => {
    const pairIssues = issueByPair.get(pair.pairId) || [];

    ensureSpace(100);
    addSpacer(6);
    addTextLine(`Pair ${displayPairNumber}`, 13, 16);
    addTextLine(
      includeHeatmap ? `Status: Issues found (${pairIssues.length})` : "Status: No issues",
      10,
      14
    );
    addSpacer(4);

    if (includeHeatmap && pairIssues.length > 0) {
      pairIssues.slice(0, 5).forEach((issue, index, issues) => {
        addWrappedLabeledText(`Issue ${index + 1}: `, issue.description || "-", 9, 110, 13);
        addWrappedLabeledText("Severity: ", issue.severity?.toUpperCase?.() || "UNKNOWN", 9, 110, 13);

        if (issue.explanation?.trim()) {
          addWrappedLabeledText("Explanation: ", issue.explanation, 9, 110, 13);
        }

        if (issue.suggested_fix?.trim()) {
          addWrappedLabeledText("Suggestion: ", issue.suggested_fix, 9, 110, 13);
        }

        if (index < issues.length - 1) {
          addSpacer(10);
        }
      });

      addSpacer(8);
    }

    const heatmapUrls = includeHeatmap ? getHeatmapUrls(pairIssues).slice(0, 3) : [];

    const [imageA, imageB, ...heatmapImages] = await Promise.all([
      loadImageAsJpeg(pair.imageA),
      loadImageAsJpeg(pair.imageB),
      ...heatmapUrls.map((url) => loadImageAsJpeg(url)),
    ]);

    const cardWidth = (PDF_CONTENT_WIDTH - IMAGE_GAP) / 2;
    const imageRowHeight = 170;

    addTextLine("Baseline & Candidate", 10, 14);
    ensureSpace(imageRowHeight + SECTION_GAP);

    const imageYBottom = state.y - imageRowHeight;

    if (imageA) {
      addImage(imageA, PDF_MARGIN, imageYBottom, cardWidth, imageRowHeight);
    } else {
      addTextLine("Baseline image unavailable", 9, 13);
    }

    if (imageB) {
      addImage(imageB, PDF_MARGIN + cardWidth + IMAGE_GAP, imageYBottom, cardWidth, imageRowHeight);
    } else {
      addTextLine("Candidate image unavailable", 9, 13);
    }

    state.y = imageYBottom - 14;

    if (includeHeatmap) {
      if (heatmapImages.length === 0) {
        addTextLine("Heatmap unavailable for this pair.", 9, 13);
      } else {
        for (let index = 0; index < heatmapImages.length; index += 1) {
          const heatmap = heatmapImages[index];
          if (!heatmap) continue;

          addSpacer(2);
          addTextLine(`Heatmap ${index + 1}`, 10, 14);

          const heatmapHeight = 150;
          ensureSpace(heatmapHeight + SECTION_GAP);
          const heatmapYBottom = state.y - heatmapHeight;

          addImage(heatmap, PDF_MARGIN, heatmapYBottom, PDF_CONTENT_WIDTH, heatmapHeight);
          state.y = heatmapYBottom - 12;
        }
      }
    }

    addDivider();
  };

  addTextLine("EXPLIUI TEST REPORT", 17, 20);
  addTextLine(`Generated At: ${new Date().toLocaleString()}`, 11, 14);
  // addTextLine(`Session ID: ${sessionId}`, 10, 14);
  addSpacer(6);
  addDivider();

  addTextLine("Summary", 14, 18);
  addSummaryRow("Total Pairs", results.summary.total_pairs);
  addSummaryRow("Pairs With Issues", pairsWithIssues.length);
  addSummaryRow("Pairs Without Issues", pairsWithoutIssues.length);
  addSpacer(8);
  addDivider();

  addTextLine("Pairs With Issues", 14, 18);
  addSpacer(4);

  if (pairsWithIssues.length === 0) {
    addTextLine("No pairs with issues.", 10, 14);
    addSpacer(6);
  } else {
    for (const [index, pair] of pairsWithIssues.entries()) {
      await addPairSection(pair, true, index + 1);
    }
  }

  addSpacer(4);
  addTextLine("Pairs Without Issues", 14, 18);
  addSpacer(4);

  if (pairsWithoutIssues.length === 0) {
    addTextLine("No pairs without issues.", 10, 14);
  } else {
    for (const [index, pair] of pairsWithoutIssues.entries()) {
      await addPairSection(pair, false, index + 1);
    }
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

    const pageDict =
      `${pageObj} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontObj} 0 R >>${xObjectRefs ? ` /XObject << ${xObjectRefs} >>` : ""} >> ` +
      `/Contents ${contentObj} 0 R >>\nendobj\n`;

    const contentText = page.contentParts.join("\n");
    const content =
      `${contentObj} 0 obj\n` +
      `<< /Length ${contentText.length} >>\n` +
      `stream\n${contentText}\nendstream\nendobj\n`;

    objectBytes[pageObj] = stringToAsciiBytes(pageDict);
    objectBytes[contentObj] = stringToAsciiBytes(content);

    page.images.forEach((imgUsage) => {
      const objNum = imageObjByName.get(imgUsage.name)!;
      const imgHeader =
        `${objNum} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image /Width ${imgUsage.image.width} /Height ${imgUsage.image.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgUsage.image.bytes.length} >>\n` +
        `stream\n`;
      const imgFooter = "\nendstream\nendobj\n";

      objectBytes[objNum] = concatBytes([
        stringToAsciiBytes(imgHeader),
        imgUsage.image.bytes,
        stringToAsciiBytes(imgFooter),
      ]);
    });
  });

  const kids = pageObjectNumbers.map((n) => `${n} 0 R`).join(" ");
  objectBytes[2] = stringToAsciiBytes(
    `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectNumbers.length} >>\nendobj\n`
  );
  objectBytes[fontObj] = stringToAsciiBytes(
    `${fontObj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  );

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

export function ExportPanel({
  // sessionId,
  results,
  pairsWithIssues = [],
  pairsWithoutIssues = [],
}: Props) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setExporting("pdf");

    try {
      // Prefer a server-generated PDF when available, but silently fall back to the frontend builder.
      const response = await fetch(`/api/export/pdf`);
      if (!response.ok) throw new Error(`PDF export failed with status ${response.status}`);

      const blob = await response.blob();
      const validServerPdf = await isValidPdfBlob(blob);

      if (validServerPdf) {
        downloadBlob(blob, `expliui-report.pdf`);
        return;
      }

      const fallbackBlob = await buildPdfBlob(results, pairsWithIssues, pairsWithoutIssues);
      downloadBlob(fallbackBlob, `expliui-report.pdf`);
    } catch (error) {
      console.error("Export PDF failed, using frontend fallback:", error);
      const fallbackBlob = await buildPdfBlob(results, pairsWithIssues, pairsWithoutIssues);
      downloadBlob(fallbackBlob, `expliui-report.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = () => {
    // // JSON export preserves the raw structured result for debugging or later processing.
    // const dataStr = JSON.stringify(results, null, 2);
    
    // JSON export keeps full issue details while normalizing summary counts for pair-level reporting.
    const exportPayload = {
      ...results,
      summary: {
        total_pairs: results.summary.total_pairs,
        issues_detected: pairsWithIssues.length,
        no_issues: pairsWithoutIssues.length,
      },
    };

    const dataStr = JSON.stringify(exportPayload, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    downloadBlob(dataBlob, `expliui-data.json`);
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
