// import React from "react";
// import { Upload, X, Lock, CheckCircle2, Pencil } from "lucide-react";
// import { Monitor, Smartphone, CheckCircle } from "lucide-react";
// import type { ScreenshotPair, EnvironmentMetadata, ComparisonMode } from "../../types";
// import { EnvironmentSelector } from "./EnvironmentSelector";

// interface Props {
//   pair: ScreenshotPair;
//   onUpload: (side: "A" | "B", file: File) => void;
//   onRemove: (side: "A" | "B") => void;
//   onMetaChange: (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => void;
//   onComparisonModeChange: (mode: ComparisonMode) => void;

//   onConfirm: () => void;
//   onEdit: () => void;
// }

// function isMetaComplete(m: EnvironmentMetadata) {
//   if (!m.deviceType) return false;
//   if (!m.os) return false;
//   if (!m.browser) return false;
//   if (m.deviceType === "mobile" && !m.deviceModel) return false;
//   return true;
// }

// export function PairUploadPanel({
//   pair,
//   onUpload,
//   onRemove,
//   onMetaChange,
//   onComparisonModeChange,
//   onConfirm,
//   onEdit,
// }: Props) {
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
//     if (e.target.files && e.target.files[0]) onUpload(side, e.target.files[0]);
//   };

//   // Existing gating: must choose comparison mode first
//   const modeLocked = !pair.comparisonMode;

//   // Confirm/Edit workflow lock
//   const confirmed = pair.stage === "confirmed";
//   const uploadLocked = modeLocked || confirmed;

//   const lockDeviceType =
//   pair.comparisonMode === "desktop-desktop" ||
//   pair.comparisonMode === "mobile-mobile";

//   const metaReady =
//     !!pair.previewA &&
//     !!pair.previewB &&
//     !!pair.comparisonMode &&
//     isMetaComplete(pair.metaA) &&
//     isMetaComplete(pair.metaB);

//   // Button rules
//   const confirmDisabled = confirmed || !metaReady; // confirm only when ready + not confirmed
//   const editDisabled = !confirmed;                // edit only after confirmed

//   return (
//     <div className="flex-1 p-8 bg-slate-50 h-[calc(100vh-64px)] overflow-y-auto">
//       <div className="max-w-5xl mx-auto">
//         <div className="flex items-start justify-between gap-4 mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">Upload Screenshots & Define Environment</h2>
//             <p className="text-sm text-slate-500 mt-1">
//             </p>
//           </div>

//           {/* Confirm/Edit buttons (top-right) */}
//           <div className="flex gap-2">
//             <button
//               type="button"
//               onClick={onEdit}
//               disabled={editDisabled}
//               className={[
//                 "inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition",
//                 editDisabled
//                   ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                   : "bg-white text-blue-600 border-blue-600 hover:bg-slate-50",
//               ].join(" ")}
//             >
//               <Pencil className="w-4 h-4" />
//               Edit
//             </button>

//             <button
//               type="button"
//               onClick={onConfirm}
//               disabled={confirmDisabled}
//               className={[
//                 "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
//                 confirmDisabled
//                   ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700",
//               ].join(" ")}
//             >
//               <CheckCircle2 className="w-4 h-4" />
//               Confirm
//             </button>
//           </div>
//         </div>

//         {/* Comparison Mode (always visible first) */}
//         {/* <div className="bg-white border rounded-lg p-6">
//           <h3 className="font-semibold text-slate-800 mb-2">Comparison Mode</h3>
//           <p className="text-sm text-slate-500 mb-4">
//             Upload will unlock after selecting a comparison mode.
//           </p>

//           <div className="grid md:grid-cols-3 gap-4">
//             <button
//               type="button"
//               onClick={() => onComparisonModeChange("desktop-desktop")}
//               disabled={confirmed}
//               className={[
//                 "w-full text-left p-4 rounded-lg border transition",
//                 confirmed ? "opacity-60 cursor-not-allowed" : "",
//                 pair.comparisonMode === "desktop-desktop"
//                   ? "bg-blue-50 border-blue-200 text-blue-700"
//                   : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700",
//               ].join(" ")}
//             >
//               <div className="font-semibold">Desktop vs Desktop</div>
//               <div className="text-sm text-slate-500 mt-1">Compare two desktop environments.</div>
//             </button>

//             <button
//               type="button"
//               onClick={() => onComparisonModeChange("mobile-mobile")}
//               disabled={confirmed}
//               className={[
//                 "w-full text-left p-4 rounded-lg border transition",
//                 confirmed ? "opacity-60 cursor-not-allowed" : "",
//                 pair.comparisonMode === "mobile-mobile"
//                   ? "bg-blue-50 border-blue-200 text-blue-700"
//                   : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700",
//               ].join(" ")}
//             >
//               <div className="font-semibold">Mobile vs Mobile</div>
//               <div className="text-sm text-slate-500 mt-1">Compare two mobile environments.</div>
//             </button>
//           </div>

//           {!pair.comparisonMode && (
//             <div className="mt-4 flex items-center gap-2 text-amber-700 font-medium">
//               <Lock className="w-4 h-4" />
//               Please select a comparison mode to continue.
//             </div>
//           )}
//         </div> */}

// <div className="bg-white border rounded-xl p-6">
//   <h3 className="font-semibold text-slate-800 mb-1">Comparison Mode</h3>
//   <p className="text-sm text-slate-500 mb-6">
//     Choose how screenshots will be compared.
//   </p>

//   <div className="grid md:grid-cols-2 gap-5">
//     {/* Desktop vs Desktop */}
//     <button
//       type="button"
//       onClick={() => onComparisonModeChange("desktop-desktop")}
//       disabled={confirmed}
//       className={[
//         "relative group w-full text-left p-5 rounded-xl border transition-all",
//         confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
//         pair.comparisonMode === "desktop-desktop"
//           ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
//           : "border-slate-200 bg-white hover:bg-slate-50",
//       ].join(" ")}
//     >
//       <div className="flex items-start gap-4">
//         <div
//           className={[
//             "w-12 h-12 rounded-lg flex items-center justify-center",
//             pair.comparisonMode === "desktop-desktop"
//               ? "bg-blue-100 text-blue-600"
//               : "bg-slate-100 text-slate-500",
//           ].join(" ")}
//         >
//           <Monitor className="w-6 h-6" />
//         </div>

//         <div className="flex-1">
//           <div className="font-semibold text-slate-800">
//             Desktop vs Desktop
//           </div>
//           <div className="text-sm text-slate-500 mt-1">
//             Compare UI across two desktop browsers or OS environments.
//           </div>
//         </div>

//         {pair.comparisonMode === "desktop-desktop" && (
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
//         )}
//       </div>
//     </button>


//     {/* Mobile vs Mobile */}
//     <button
//       type="button"
//       onClick={() => onComparisonModeChange("mobile-mobile")}
//       disabled={confirmed}
//       className={[
//         "relative group w-full text-left p-5 rounded-xl border transition-all",
//         confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
//         pair.comparisonMode === "mobile-mobile"
//           ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
//           : "border-slate-200 bg-white hover:bg-slate-50",
//       ].join(" ")}
//     >
//       <div className="flex items-start gap-4">
//         <div
//           className={[
//             "w-12 h-12 rounded-lg flex items-center justify-center",
//             pair.comparisonMode === "mobile-mobile"
//               ? "bg-blue-100 text-blue-600"
//               : "bg-slate-100 text-slate-500",
//           ].join(" ")}
//         >
//           <Smartphone className="w-6 h-6" />
//         </div>

//         <div className="flex-1">
//           <div className="font-semibold text-slate-800">
//             Mobile vs Mobile
//           </div>
//           <div className="text-sm text-slate-500 mt-1">
//             Compare UI across mobile devices and mobile browsers.
//           </div>
//         </div>

//         {pair.comparisonMode === "mobile-mobile" && (
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
//         )}
//       </div>
//     </button>
//   </div>

//   {!pair.comparisonMode && (
//     <div className="mt-6 flex items-center gap-2 text-amber-700 font-medium">
//       <Lock className="w-4 h-4" />
//       Select a comparison mode to unlock uploads.
//     </div>
//   )}
// </div>


//         {/* Upload + Metadata (locked if no mode OR confirmed) */}
//         <div className={uploadLocked ? "mt-8 opacity-50 pointer-events-none select-none" : "mt-8"}>
//           <div className="grid md:grid-cols-2 gap-8">
//             {/* A */}
//             <div className="flex flex-col gap-4">
//               <UploadBox
//                 label="Reference (Baseline)"
//                 preview={pair.previewA}
//                 onChange={(e: any) => handleFileChange(e, "A")}
//                 onRemove={() => onRemove("A")}
//                 disabled={uploadLocked}
//               />
//               {pair.previewA && (
//                 // <EnvironmentSelector
//                 //   metadata={pair.metaA}
//                 //   onChange={(k, v) => onMetaChange("A", k, v)}
//                 //   disabled={uploadLocked}
//                 // />

//                 <EnvironmentSelector
//                   metadata={pair.metaA}
//                   onChange={(k, v) => onMetaChange("A", k, v)}
//                   disabled={uploadLocked}
//                   lockDeviceType={lockDeviceType}
//                 />
//               )}
//             </div>

//             {/* B */}
//             <div className="flex flex-col gap-4">
//               <UploadBox
//                 label="Target (Test)"
//                 preview={pair.previewB}
//                 onChange={(e: any) => handleFileChange(e, "B")}
//                 onRemove={() => onRemove("B")}
//                 disabled={uploadLocked}
//               />
//               {pair.previewB && (
//                 // <EnvironmentSelector
//                 //   metadata={pair.metaB}
//                 //   onChange={(k, v) => onMetaChange("B", k, v)}
//                 //   disabled={uploadLocked}
//                 // />
//                 <EnvironmentSelector
//                   metadata={pair.metaB}
//                   onChange={(k, v) => onMetaChange("B", k, v)}
//                   disabled={uploadLocked}
//                   lockDeviceType={lockDeviceType}
//                 />

//               )}
//             </div>
//           </div>

//           {!metaReady && pair.comparisonMode && !confirmed && (
//             <div className="mt-2 text-sm text-amber-700">
//               {/* Upload both screenshots and select all metadata fields to enable Confirm. */}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function UploadBox({ label, preview, onChange, onRemove, disabled }: any) {
//   return (
//     <div className="flex flex-col gap-2">
//       <span className="text-sm font-semibold text-slate-600">{label}</span>

//       {preview ? (
//         <div className="relative group aspect-video bg-white rounded-lg border shadow-sm overflow-hidden">
//           <img src={preview} alt="Preview" className="w-full h-full object-contain" />
//           <button
//             onClick={onRemove}
//             disabled={disabled}
//             className={[
//               "absolute top-2 right-2 p-1 rounded-full transition-opacity",
//               disabled
//                 ? "bg-slate-300 text-white opacity-100 cursor-not-allowed"
//                 : "bg-red-500 text-white opacity-0 group-hover:opacity-100",
//             ].join(" ")}
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       ) : (
//         <label
//           className={[
//             "flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg bg-white transition-all",
//             disabled
//               ? "border-slate-200 bg-slate-100 cursor-not-allowed"
//               : "border-slate-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50",
//           ].join(" ")}
//         >
//           <Upload className="w-8 h-8 text-slate-400 mb-2" />
//           <span className="text-sm text-slate-500">
//             {disabled ? "Locked" : "Click to upload"}
//           </span>
//           <input
//             type="file"
//             className="hidden"
//             accept="image/png, image/jpeg"
//             onChange={onChange}
//             disabled={disabled}
//           />
//         </label>
//       )}
//     </div>
//   );
// }







// import React from "react";
// import { Upload, X, Lock, CheckCircle2, Pencil } from "lucide-react";
// import { Monitor, Smartphone, CheckCircle } from "lucide-react";
// import type { ScreenshotPair, EnvironmentMetadata, ComparisonMode } from "../../types";
// import { EnvironmentSelector } from "./EnvironmentSelector";

// interface Props {
//   pair: ScreenshotPair;
//   onUpload: (side: "A" | "B", file: File) => void;
//   onRemove: (side: "A" | "B") => void;
//   onMetaChange: (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => void;
//   onComparisonModeChange: (mode: ComparisonMode) => void;

//   onConfirm: () => void;
//   onEdit: () => void;
// }

// function isMetaComplete(m: EnvironmentMetadata) {
//   if (!m.deviceType) return false;
//   if (!m.os) return false;
//   if (!m.browser) return false;
//   if (m.deviceType === "mobile" && !m.deviceModel) return false;
//   return true;
// }

// export function PairUploadPanel({
//   pair,
//   onUpload,
//   onRemove,
//   onMetaChange,
//   onComparisonModeChange,
//   onConfirm,
//   onEdit,
// }: Props) {
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
//     if (e.target.files && e.target.files[0]) onUpload(side, e.target.files[0]);
//   };

//   const modeLocked = !pair.comparisonMode;

//   const confirmed = pair.stage === "confirmed";
//   const uploadLocked = modeLocked || confirmed;

//   const lockDeviceType =
//     pair.comparisonMode === "desktop-desktop" || pair.comparisonMode === "mobile-mobile";

//   const metaReady =
//     !!pair.previewA &&
//     !!pair.previewB &&
//     !!pair.comparisonMode &&
//     isMetaComplete(pair.metaA) &&
//     isMetaComplete(pair.metaB);

//   const confirmDisabled = confirmed || !metaReady;
//   const editDisabled = !confirmed;

//   return (
//     <div className="flex-1 p-8 bg-slate-50 h-[calc(100vh-64px)] overflow-y-auto">
//       <div className="max-w-5xl mx-auto">
//         {/* Top Header */}
//         <div className="flex items-start justify-between gap-4 mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">
//               Upload Screenshots & Define Environment
//             </h2>
//           </div>
//         </div>

//         {/* Comparison Mode Card */}
//         <div className="bg-white border rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold text-slate-800 mb-1">Comparison Mode</h3>
//           <p className="text-sm text-slate-500 mb-6">
//             Choose how screenshots will be compared.
//           </p>

//           <div className="grid md:grid-cols-2 gap-5">
//             {/* Desktop */}
//             <button
//               type="button"
//               onClick={() => onComparisonModeChange("desktop-desktop")}
//               disabled={confirmed}
//               className={[
//                 "relative w-full text-left p-5 rounded-xl border transition-all",
//                 confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
//                 pair.comparisonMode === "desktop-desktop"
//                   ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
//                   : "border-slate-200 bg-white hover:bg-slate-50",
//               ].join(" ")}
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={[
//                     "w-12 h-12 rounded-xl flex items-center justify-center",
//                     pair.comparisonMode === "desktop-desktop"
//                       ? "bg-blue-100 text-blue-600"
//                       : "bg-slate-100 text-slate-500",
//                   ].join(" ")}
//                 >
//                   <Monitor className="w-6 h-6" />
//                 </div>

//                 <div className="flex-1">
//                   <div className="font-semibold text-slate-800">Desktop vs Desktop</div>
//                   <div className="text-sm text-slate-500 mt-1">
//                     Compare UI across desktop browsers or OS.
//                   </div>
//                 </div>

//                 {pair.comparisonMode === "desktop-desktop" && (
//                   <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
//                 )}
//               </div>
//             </button>

//             {/* Mobile */}
//             <button
//               type="button"
//               onClick={() => onComparisonModeChange("mobile-mobile")}
//               disabled={confirmed}
//               className={[
//                 "relative w-full text-left p-5 rounded-xl border transition-all",
//                 confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
//                 pair.comparisonMode === "mobile-mobile"
//                   ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
//                   : "border-slate-200 bg-white hover:bg-slate-50",
//               ].join(" ")}
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={[
//                     "w-12 h-12 rounded-xl flex items-center justify-center",
//                     pair.comparisonMode === "mobile-mobile"
//                       ? "bg-blue-100 text-blue-600"
//                       : "bg-slate-100 text-slate-500",
//                   ].join(" ")}
//                 >
//                   <Smartphone className="w-6 h-6" />
//                 </div>

//                 <div className="flex-1">
//                   <div className="font-semibold text-slate-800">Mobile vs Mobile</div>
//                   <div className="text-sm text-slate-500 mt-1">
//                     Compare UI across mobile devices and browsers.
//                   </div>
//                 </div>

//                 {pair.comparisonMode === "mobile-mobile" && (
//                   <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
//                 )}
//               </div>
//             </button>
//           </div>

//           {!pair.comparisonMode && (
//             <div className="mt-6 flex items-center gap-2 text-amber-700 font-medium">
//               <Lock className="w-4 h-4" />
//               Select a comparison mode to unlock uploads.
//             </div>
//           )}
//         </div>

//         {/* Upload + Metadata Card */}
//         <div className="mt-8">
//           <div className="bg-white border rounded-xl p-6 shadow-sm">
//             <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
//               <div>
//                 <h3 className="font-semibold text-slate-800">Screenshots & Metadata</h3>
//                 <p className="text-sm text-slate-500">
//                   Upload A and B screenshots, then complete environment metadata.
//                 </p>
//               </div>

//               {uploadLocked && (
//                 <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
//                   <Lock className="w-3 h-3" /> Locked
//                 </span>
//               )}
//             </div>

//             <div className={uploadLocked ? "opacity-50 pointer-events-none select-none" : ""}>
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* A */}
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="font-semibold text-slate-700">Environment A</div>
//                     <span className="text-xs text-slate-500">Baseline</span>
//                   </div>

//                   <UploadBox
//                     label="Reference Screenshot"
//                     preview={pair.previewA}
//                     onChange={(e: any) => handleFileChange(e, "A")}
//                     onRemove={() => onRemove("A")}
//                     disabled={uploadLocked}
//                   />

//                   {pair.previewA && (
//                     <EnvironmentSelector
//                       metadata={pair.metaA}
//                       onChange={(k, v) => onMetaChange("A", k, v)}
//                       disabled={uploadLocked}
//                       lockDeviceType={lockDeviceType}
//                     />
//                   )}
//                 </div>

//                 {/* B */}
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="font-semibold text-slate-700">Environment B</div>
//                     <span className="text-xs text-slate-500">Test</span>
//                   </div>

//                   <UploadBox
//                     label="Target Screenshot"
//                     preview={pair.previewB}
//                     onChange={(e: any) => handleFileChange(e, "B")}
//                     onRemove={() => onRemove("B")}
//                     disabled={uploadLocked}
//                   />

//                   {pair.previewB && (
//                     <EnvironmentSelector
//                       metadata={pair.metaB}
//                       onChange={(k, v) => onMetaChange("B", k, v)}
//                       disabled={uploadLocked}
//                       lockDeviceType={lockDeviceType}
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Small helper text */}
//             {!metaReady && pair.comparisonMode && !confirmed && (
//               <div className="mt-4 text-sm text-amber-700">
//                 Upload both screenshots and complete all metadata to enable <b>Confirm</b>.
//               </div>
//             )}

//             {/* Confirm/Edit Buttons */}
//           <div className="flex justify-end gap-2 pt-6">
//             <button
//               type="button"
//               onClick={onEdit}
//               disabled={editDisabled}
//               className={[
//                 "inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition",
//                 editDisabled
//                   ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                   : "bg-white text-blue-600 border-blue-600 hover:bg-slate-50",
//               ].join(" ")}
//             >
//               <Pencil className="w-4 h-4" />
//               Edit
//             </button>

//             <button
//               type="button"
//               onClick={onConfirm}
//               disabled={confirmDisabled}
//               className={[
//                 "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
//                 confirmDisabled
//                   ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700",
//               ].join(" ")}
//             >
//               <CheckCircle2 className="w-4 h-4" />
//               Confirm
//             </button>
//           </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function UploadBox({ label, preview, onChange, onRemove, disabled }: any) {
//   return (
//     <div className="flex flex-col gap-2">
//       <span className="text-sm font-semibold text-slate-600">{label}</span>

//       {preview ? (
//         <div className="relative group aspect-video bg-white rounded-xl border shadow-sm overflow-hidden">
//           <img src={preview} alt="Preview" className="w-full h-full object-contain" />

//           <button
//             onClick={onRemove}
//             disabled={disabled}
//             className={[
//               "absolute top-3 right-3 p-2 rounded-full transition",
//               disabled
//                 ? "bg-slate-300 text-white cursor-not-allowed"
//                 : "bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600",
//             ].join(" ")}
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       ) : (
//         <label
//           className={[
//             "flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed transition-all",
//             disabled
//               ? "border-slate-200 bg-slate-100 cursor-not-allowed"
//               : "border-slate-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50",
//           ].join(" ")}
//         >
//           <Upload className="w-8 h-8 text-slate-400 mb-2" />
//           <span className="text-sm font-medium text-slate-600">
//             {disabled ? "Locked" : "Click to upload"}
//           </span>
//           <span className="text-xs text-slate-500 mt-1">PNG or JPG</span>

//           <input
//             type="file"
//             className="hidden"
//             accept="image/png, image/jpeg"
//             onChange={onChange}
//             disabled={disabled}
//           />
//         </label>
//       )}
//     </div>
//   );
// }





// import React, { useEffect } from "react";
// import { Upload, X, Lock, CheckCircle2, Pencil } from "lucide-react";
// import { Monitor, Smartphone, CheckCircle } from "lucide-react";
// import type { ScreenshotPair, EnvironmentMetadata, ComparisonMode } from "../../types";
// import { EnvironmentSelector } from "./EnvironmentSelector";

// interface Props {
//   pair: ScreenshotPair;
//   onUpload: (side: "A" | "B", file: File) => void;
//   onRemove: (side: "A" | "B") => void;
//   onMetaChange: (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => void;
//   onComparisonModeChange: (mode: ComparisonMode) => void;

//   onConfirm: () => void;
//   onEdit: () => void;
// }

// function isMetaComplete(m: EnvironmentMetadata) {
//   if (!m.deviceType) return false;
//   if (!m.os) return false;
//   if (!m.browser) return false;
//   if (m.deviceType === "mobile" && !m.deviceModel) return false;
//   return true;
// }

// function normalize(v?: string) {
//   return (v || "").trim().toLowerCase();
// }

// export function PairUploadPanel({
//   pair,
//   onUpload,
//   onRemove,
//   onMetaChange,
//   onComparisonModeChange,
//   onConfirm,
//   onEdit,
// }: Props) {
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
//     if (e.target.files && e.target.files[0]) onUpload(side, e.target.files[0]);
//   };

//   const modeLocked = !pair.comparisonMode;

//   const confirmed = pair.stage === "confirmed";
//   const uploadLocked = modeLocked || confirmed;

//   const lockDeviceType =
//     pair.comparisonMode === "desktop-desktop" || pair.comparisonMode === "mobile-mobile";

//   // 1) When mode changes, force deviceType in both sides
//   useEffect(() => {
//     if (!pair.comparisonMode) return;

//     if (pair.comparisonMode === "desktop-desktop") {
//       if (pair.metaA.deviceType !== "desktop") onMetaChange("A", "deviceType", "desktop");
//       if (pair.metaB.deviceType !== "desktop") onMetaChange("B", "deviceType", "desktop");
//     }

//     if (pair.comparisonMode === "mobile-mobile") {
//       if (pair.metaA.deviceType !== "mobile") onMetaChange("A", "deviceType", "mobile");
//       if (pair.metaB.deviceType !== "mobile") onMetaChange("B", "deviceType", "mobile");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pair.comparisonMode]);

//   // 2) Always sync Test(B) fields from Baseline(A) for same-os comparisons
//   useEffect(() => {
//     if (!pair.comparisonMode) return;

//     const aType = pair.metaA.deviceType || "";
//     const aOs = pair.metaA.os || "";
//     const aModel = pair.metaA.deviceModel || "";

//     // B must match A (deviceType + os always)
//     if (pair.metaB.deviceType !== aType) onMetaChange("B", "deviceType", aType);
//     if (pair.metaB.os !== aOs) onMetaChange("B", "os", aOs);

//     // If mobile mode, deviceModel must match too
//     if (pair.comparisonMode === "mobile-mobile") {
//       if ((pair.metaB.deviceModel || "") !== aModel) onMetaChange("B", "deviceModel", aModel);
//     }

//     // Optional: If user changes OS in A, browser selections in both should reset
//     // because browser options change. We only reset B browser (keep A browser user-selected).
//     // If you also want to reset A browser when OS changes, tell me and I'll add it.
//     const bBrowser = normalize(pair.metaB.browser);
//     const aOsN = normalize(aOs);

//     // If OS changed and B browser isn't valid anymore, clear it
//     // (simpler: just clear whenever OS changes)
//     if (bBrowser) {
//       onMetaChange("B", "browser", "");
//     }

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pair.comparisonMode, pair.metaA.deviceType, pair.metaA.os, pair.metaA.deviceModel]);

//   const metaReady =
//     !!pair.previewA &&
//     !!pair.previewB &&
//     !!pair.comparisonMode &&
//     isMetaComplete(pair.metaA) &&
//     isMetaComplete(pair.metaB);

//   const confirmDisabled = confirmed || !metaReady;
//   const editDisabled = !confirmed;

//   return (
//     <div className="flex-1 p-8 bg-slate-50 h-[calc(100vh-64px)] overflow-y-auto">
//       <div className="max-w-5xl mx-auto">
//         {/* Top Header */}
//         <div className="flex items-start justify-between gap-4 mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">
//               Upload Screenshots & Define Environment
//             </h2>
//           </div>
//         </div>

//         {/* Comparison Mode Card */}
//         <div className="bg-white border rounded-xl p-6 shadow-sm">
//           <h3 className="font-semibold text-slate-800 mb-1">Comparison Mode</h3>
//           <p className="text-sm text-slate-500 mb-6">Choose how screenshots will be compared.</p>

//           <div className="grid md:grid-cols-2 gap-5">
//             {/* Desktop */}
//             <button
//               type="button"
//               onClick={() => onComparisonModeChange("desktop-desktop")}
//               disabled={confirmed}
//               className={[
//                 "relative w-full text-left p-5 rounded-xl border transition-all",
//                 confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
//                 pair.comparisonMode === "desktop-desktop"
//                   ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
//                   : "border-slate-200 bg-white hover:bg-slate-50",
//               ].join(" ")}
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={[
//                     "w-12 h-12 rounded-xl flex items-center justify-center",
//                     pair.comparisonMode === "desktop-desktop"
//                       ? "bg-blue-100 text-blue-600"
//                       : "bg-slate-100 text-slate-500",
//                   ].join(" ")}
//                 >
//                   <Monitor className="w-6 h-6" />
//                 </div>

//                 <div className="flex-1">
//                   <div className="font-semibold text-slate-800">Desktop vs Desktop</div>
//                   <div className="text-sm text-slate-500 mt-1">
//                     Windows vs Windows / macOS vs macOS.
//                   </div>
//                 </div>

//                 {pair.comparisonMode === "desktop-desktop" && (
//                   <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
//                 )}
//               </div>
//             </button>

//             {/* Mobile */}
//             <button
//               type="button"
//               onClick={() => onComparisonModeChange("mobile-mobile")}
//               disabled={confirmed}
//               className={[
//                 "relative w-full text-left p-5 rounded-xl border transition-all",
//                 confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
//                 pair.comparisonMode === "mobile-mobile"
//                   ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
//                   : "border-slate-200 bg-white hover:bg-slate-50",
//               ].join(" ")}
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={[
//                     "w-12 h-12 rounded-xl flex items-center justify-center",
//                     pair.comparisonMode === "mobile-mobile"
//                       ? "bg-blue-100 text-blue-600"
//                       : "bg-slate-100 text-slate-500",
//                   ].join(" ")}
//                 >
//                   <Smartphone className="w-6 h-6" />
//                 </div>

//                 <div className="flex-1">
//                   <div className="font-semibold text-slate-800">Mobile vs Mobile</div>
//                   <div className="text-sm text-slate-500 mt-1">Android vs Android / iOS vs iOS.</div>
//                 </div>

//                 {pair.comparisonMode === "mobile-mobile" && (
//                   <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
//                 )}
//               </div>
//             </button>
//           </div>

//           {!pair.comparisonMode && (
//             <div className="mt-6 flex items-center gap-2 text-amber-700 font-medium">
//               <Lock className="w-4 h-4" />
//               Select a comparison mode to unlock uploads.
//             </div>
//           )}
//         </div>

//         {/* Upload + Metadata Card */}
//         <div className="mt-8">
//           <div className="bg-white border rounded-xl p-6 shadow-sm">
//             <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
//               <div>
//                 <h3 className="font-semibold text-slate-800">Screenshots & Metadata</h3>
//                 <p className="text-sm text-slate-500">
//                   Baseline (A) sets OS/device. Test (B) auto-fills from Baseline.
//                 </p>
//               </div>

//               {uploadLocked && (
//                 <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
//                   <Lock className="w-3 h-3" /> Locked
//                 </span>
//               )}
//             </div>

//             <div className={uploadLocked ? "opacity-50 pointer-events-none select-none" : ""}>
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* A */}
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="font-semibold text-slate-700">Environment A</div>
//                     <span className="text-xs text-slate-500">Baseline</span>
//                   </div>

//                   <UploadBox
//                     label="Reference Screenshot"
//                     preview={pair.previewA}
//                     onChange={(e: any) => handleFileChange(e, "A")}
//                     onRemove={() => onRemove("A")}
//                     disabled={uploadLocked}
//                   />

//                   {pair.previewA && (
//                     <EnvironmentSelector
//                       metadata={pair.metaA}
//                       onChange={(k, v) => onMetaChange("A", k, v)}
//                       disabled={uploadLocked}
//                       lockDeviceType={lockDeviceType}
//                       role="baseline"
//                       comparisonMode={pair.comparisonMode}
//                     />
//                   )}
//                 </div>

//                 {/* B */}
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="font-semibold text-slate-700">Environment B</div>
//                     <span className="text-xs text-slate-500">Test</span>
//                   </div>

//                   <UploadBox
//                     label="Target Screenshot"
//                     preview={pair.previewB}
//                     onChange={(e: any) => handleFileChange(e, "B")}
//                     onRemove={() => onRemove("B")}
//                     disabled={uploadLocked}
//                   />

//                   {pair.previewB && (
//                     <EnvironmentSelector
//                       metadata={pair.metaB}
//                       onChange={(k, v) => onMetaChange("B", k, v)}
//                       disabled={uploadLocked}
//                       lockDeviceType={lockDeviceType}
//                       role="test"
//                       comparisonMode={pair.comparisonMode}
//                       baselineMeta={pair.metaA}
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>

//             {!metaReady && pair.comparisonMode && !confirmed && (
//               <div className="mt-4 text-sm text-amber-700">
//                 Upload both screenshots and complete all required fields to enable <b>Confirm</b>.
//               </div>
//             )}

//             {/* Confirm/Edit Buttons */}
//             <div className="flex justify-end gap-2 pt-6">
//               <button
//                 type="button"
//                 onClick={onEdit}
//                 disabled={editDisabled}
//                 className={[
//                   "inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition",
//                   editDisabled
//                     ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                     : "bg-white text-blue-600 border-blue-600 hover:bg-slate-50",
//                 ].join(" ")}
//               >
//                 <Pencil className="w-4 h-4" />
//                 Edit
//               </button>

//               <button
//                 type="button"
//                 onClick={onConfirm}
//                 disabled={confirmDisabled}
//                 className={[
//                   "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
//                   confirmDisabled
//                     ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//                     : "bg-blue-600 text-white hover:bg-blue-700",
//                 ].join(" ")}
//               >
//                 <CheckCircle2 className="w-4 h-4" />
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function UploadBox({ label, preview, onChange, onRemove, disabled }: any) {
//   return (
//     <div className="flex flex-col gap-2">
//       <span className="text-sm font-semibold text-slate-600">{label}</span>

//       {preview ? (
//         <div className="relative group aspect-video bg-white rounded-xl border shadow-sm overflow-hidden">
//           <img src={preview} alt="Preview" className="w-full h-full object-contain" />

//           <button
//             onClick={onRemove}
//             disabled={disabled}
//             className={[
//               "absolute top-3 right-3 p-2 rounded-full transition",
//               disabled
//                 ? "bg-slate-300 text-white cursor-not-allowed"
//                 : "bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600",
//             ].join(" ")}
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       ) : (
//         <label
//           className={[
//             "flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed transition-all",
//             disabled
//               ? "border-slate-200 bg-slate-100 cursor-not-allowed"
//               : "border-slate-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50",
//           ].join(" ")}
//         >
//           <Upload className="w-8 h-8 text-slate-400 mb-2" />
//           <span className="text-sm font-medium text-slate-600">
//             {disabled ? "Locked" : "Click to upload"}
//           </span>
//           <span className="text-xs text-slate-500 mt-1">PNG or JPG</span>

//           <input
//             type="file"
//             className="hidden"
//             accept="image/png, image/jpeg"
//             onChange={onChange}
//             disabled={disabled}
//           />
//         </label>
//       )}
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { Upload, X, Lock, CheckCircle2, Pencil } from "lucide-react";
import { Monitor, Smartphone, CheckCircle } from "lucide-react";
import type { ScreenshotPair, EnvironmentMetadata, ComparisonMode } from "../../types";
import { EnvironmentSelector } from "./EnvironmentSelector";

interface Props {
  pair: ScreenshotPair;
  onUpload: (side: "A" | "B", file: File) => void;
  onRemove: (side: "A" | "B") => void;
  onMetaChange: (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => void;
  onComparisonModeChange: (mode: ComparisonMode) => void;

  onConfirm: () => void;
  onEdit: () => void;
}

function isMetaComplete(m: EnvironmentMetadata) {
  if (!m.deviceType) return false;
  if (!m.os) return false;
  if (!m.browser) return false;
  if (m.deviceType === "mobile" && !m.deviceModel) return false;
  return true;
}

function normalize(v?: string) {
  return (v || "").trim().toLowerCase();
}

/** Read image dimensions */
function getImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };

    img.src = url;
  });
}

/** Simple toast UI */
function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 max-w-sm">
        <div className="font-semibold">Error</div>
        <div className="text-sm flex-1">{message}</div>
        <button onClick={onClose} className="text-white/90 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
}

export function PairUploadPanel({
  pair,
  onUpload,
  onRemove,
  onMetaChange,
  onComparisonModeChange,
  onConfirm,
  onEdit,
}: Props) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 3500);
  };

  /** validate upload based on selected comparison mode */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Must pick mode first
    if (!pair.comparisonMode) {
      showToast("Please select a comparison mode first.");
      e.target.value = "";
      return;
    }

    try {
      const { width, height } = await getImageSize(file);
      const isLandscape = width >= height; // typical desktop
      const isPortrait = height > width;   // typical mobile

      // desktop-desktop should NOT accept portrait
      if (pair.comparisonMode === "desktop-desktop" && !isLandscape) {
        showToast(
          "Desktop vs Desktop only allows DESKTOP screenshots. Please upload a desktop screenshot."
        );
        e.target.value = "";
        return;
      }

      // mobile-mobile should NOT accept landscape
      if (pair.comparisonMode === "mobile-mobile" && !isPortrait) {
        showToast(
          "Mobile vs Mobile only allows MOBILE screenshots. Please upload a mobile screenshot."
        );
        e.target.value = "";
        return;
      }

      onUpload(side, file);
    } catch {
      showToast("Could not read this image. Please upload a valid PNG/JPG screenshot.");
      e.target.value = "";
    }
  };

  const modeLocked = !pair.comparisonMode;

  const confirmed = pair.stage === "confirmed";
  const uploadLocked = modeLocked || confirmed;

  const lockDeviceType =
    pair.comparisonMode === "desktop-desktop" || pair.comparisonMode === "mobile-mobile";

  // 1) When mode changes, force deviceType in both sides
  useEffect(() => {
    if (!pair.comparisonMode) return;

    if (pair.comparisonMode === "desktop-desktop") {
      if (pair.metaA.deviceType !== "desktop") onMetaChange("A", "deviceType", "desktop");
      if (pair.metaB.deviceType !== "desktop") onMetaChange("B", "deviceType", "desktop");
    }

    if (pair.comparisonMode === "mobile-mobile") {
      if (pair.metaA.deviceType !== "mobile") onMetaChange("A", "deviceType", "mobile");
      if (pair.metaB.deviceType !== "mobile") onMetaChange("B", "deviceType", "mobile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair.comparisonMode]);

  // 2) Always sync Test(B) fields from Baseline(A) for same-os comparisons
  useEffect(() => {
    if (!pair.comparisonMode) return;

    const aType = pair.metaA.deviceType || "";
    const aOs = pair.metaA.os || "";
    const aModel = pair.metaA.deviceModel || "";

    // B must match A (deviceType + os always)
    if (pair.metaB.deviceType !== aType) onMetaChange("B", "deviceType", aType);
    if (pair.metaB.os !== aOs) onMetaChange("B", "os", aOs);

    // If mobile mode, deviceModel must match too
    if (pair.comparisonMode === "mobile-mobile") {
      if ((pair.metaB.deviceModel || "") !== aModel) onMetaChange("B", "deviceModel", aModel);
    }

    // Reset B browser when OS changes (browser options change)
    const bBrowser = normalize(pair.metaB.browser);
    if (bBrowser) {
      onMetaChange("B", "browser", "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair.comparisonMode, pair.metaA.deviceType, pair.metaA.os, pair.metaA.deviceModel]);

  const metaReady =
    !!pair.previewA &&
    !!pair.previewB &&
    !!pair.comparisonMode &&
    isMetaComplete(pair.metaA) &&
    isMetaComplete(pair.metaB);

  const confirmDisabled = confirmed || !metaReady;
  const editDisabled = !confirmed;

  return (
    <div className="flex-1 p-8 bg-slate-50 h-[calc(100vh-64px)] overflow-y-auto">
      {/* Toast */}
      <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />

      <div className="max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Upload Screenshots & Define Environment
            </h2>
          </div>
        </div>

        {/* Comparison Mode Card */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-1">Comparison Mode</h3>
          <p className="text-sm text-slate-500 mb-6">Choose how screenshots will be compared.</p>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Desktop */}
            <button
              type="button"
              onClick={() => onComparisonModeChange("desktop-desktop")}
              disabled={confirmed}
              className={[
                "relative w-full text-left p-5 rounded-xl border transition-all",
                confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
                pair.comparisonMode === "desktop-desktop"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    pair.comparisonMode === "desktop-desktop"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Monitor className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-slate-800">Desktop vs Desktop</div>
                  <div className="text-sm text-slate-500 mt-1">
                    Windows vs Windows / macOS vs macOS.
                  </div>
                </div>

                {pair.comparisonMode === "desktop-desktop" && (
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                )}
              </div>
            </button>

            {/* Mobile */}
            <button
              type="button"
              onClick={() => onComparisonModeChange("mobile-mobile")}
              disabled={confirmed}
              className={[
                "relative w-full text-left p-5 rounded-xl border transition-all",
                confirmed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
                pair.comparisonMode === "mobile-mobile"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    pair.comparisonMode === "mobile-mobile"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Smartphone className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-slate-800">Mobile vs Mobile</div>
                  <div className="text-sm text-slate-500 mt-1">Android vs Android / iOS vs iOS.</div>
                </div>

                {pair.comparisonMode === "mobile-mobile" && (
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                )}
              </div>
            </button>
          </div>

          {!pair.comparisonMode && (
            <div className="mt-6 flex items-center gap-2 text-amber-700 font-medium">
              <Lock className="w-4 h-4" />
              Select a comparison mode to unlock uploads.
            </div>
          )}
        </div>

        {/* Upload + Metadata Card */}
        <div className="mt-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Screenshots & Metadata</h3>
                <p className="text-sm text-slate-500">
                  Baseline (A) sets OS/device. Test (B) auto-fills from Baseline.
                </p>
              </div>

              {uploadLocked && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>

            <div className={uploadLocked ? "opacity-50 pointer-events-none select-none" : ""}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* A */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-slate-700">Environment A</div>
                    <span className="text-xs text-slate-500">Baseline</span>
                  </div>

                  <UploadBox
                    label="Reference Screenshot"
                    preview={pair.previewA}
                    onChange={(e: any) => handleFileChange(e, "A")}
                    onRemove={() => onRemove("A")}
                    disabled={uploadLocked}
                  />

                  {pair.previewA && (
                    <EnvironmentSelector
                      metadata={pair.metaA}
                      onChange={(k, v) => onMetaChange("A", k, v)}
                      disabled={uploadLocked}
                      lockDeviceType={lockDeviceType}
                      role="baseline"
                      comparisonMode={pair.comparisonMode}
                    />
                  )}
                </div>

                {/* B */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-slate-700">Environment B</div>
                    <span className="text-xs text-slate-500">Test</span>
                  </div>

                  <UploadBox
                    label="Target Screenshot"
                    preview={pair.previewB}
                    onChange={(e: any) => handleFileChange(e, "B")}
                    onRemove={() => onRemove("B")}
                    disabled={uploadLocked}
                  />

                  {pair.previewB && (
                    <EnvironmentSelector
                      metadata={pair.metaB}
                      onChange={(k, v) => onMetaChange("B", k, v)}
                      disabled={uploadLocked}
                      lockDeviceType={lockDeviceType}
                      role="test"
                      comparisonMode={pair.comparisonMode}
                      baselineMeta={pair.metaA}
                    />
                  )}
                </div>
              </div>
            </div>

            {!metaReady && pair.comparisonMode && !confirmed && (
              <div className="mt-4 text-sm text-amber-700">
                Upload both screenshots and complete all required fields to enable <b>Confirm</b>.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
              <button
                type="button"
                onClick={onEdit}
                disabled={editDisabled}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition",
                  editDisabled
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-blue-600 border-blue-600 hover:bg-slate-50",
                ].join(" ")}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                  confirmDisabled
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700",
                ].join(" ")}
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadBox({ label, preview, onChange, onRemove, disabled }: any) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-600">{label}</span>

      {preview ? (
        <div className="relative group aspect-video bg-white rounded-xl border shadow-sm overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />

          <button
            onClick={onRemove}
            disabled={disabled}
            className={[
              "absolute top-3 right-3 p-2 rounded-full transition",
              disabled
                ? "bg-slate-300 text-white cursor-not-allowed"
                : "bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600",
            ].join(" ")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className={[
            "flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed transition-all",
            disabled
              ? "border-slate-200 bg-slate-100 cursor-not-allowed"
              : "border-slate-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50",
          ].join(" ")}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm font-medium text-slate-600">
            {disabled ? "Locked" : "Click to upload"}
          </span>
          <span className="text-xs text-slate-500 mt-1">PNG or JPG</span>

          <input
            type="file"
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={onChange}
            disabled={disabled}
          />
        </label>
      )}
    </div>
  );
}
