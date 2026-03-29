// Archived draft for a future settings page; preserved as commented reference code for now.
// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Save, RotateCcw, Link2, Sliders } from "lucide-react";
// import { Button } from "../components/common/Button";

// // type SettingsState = {
// //   apiBaseUrl: string;
// //   defaultComparisonMode: "desktop-desktop" | "mobile-mobile" | "desktop-mobile";
// //   defaultDeviceType: "desktop" | "mobile";
// //   showHeatmapByDefault: boolean;
// // };

// type SettingsState = {
//   apiBaseUrl: string;
//   defaultComparisonMode: "desktop-desktop" | "mobile-mobile";
//   defaultDeviceType: "desktop" | "mobile";
//   showHeatmapByDefault: boolean;

//   // NEW (important)
//   bugDecisionThreshold: number; // 0..1
//   severityThresholds: {
//     high: number;   // e.g., >=0.75
//     medium: number; // e.g., >=0.45
//   };

//   // NEW (useful for UI consistency)
//   defaultResultsSort: "severity" | "category";
// };

// const STORAGE_KEY = "expliui_settings_v1";

// // const DEFAULTS: SettingsState = {
// //   apiBaseUrl: "http://localhost:8000",
// //   defaultComparisonMode: "desktop-desktop",
// //   defaultDeviceType: "desktop",
// //   showHeatmapByDefault: true,
// // };

// const DEFAULTS: SettingsState = {
//   apiBaseUrl: "/api",
//   defaultComparisonMode: "desktop-desktop",
//   defaultDeviceType: "desktop",
//   showHeatmapByDefault: true,

//   bugDecisionThreshold: 0.5,
//   severityThresholds: { high: 0.75, medium: 0.45 },
//   defaultResultsSort: "severity",
// };


// function loadSettings(): SettingsState {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return DEFAULTS;
//     const parsed = JSON.parse(raw);
//     return { ...DEFAULTS, ...parsed };
//   } catch {
//     return DEFAULTS;
//   }
// }

// export default function SettingsPage() {
//   const navigate = useNavigate();
//   const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
//   const [savedToast, setSavedToast] = useState(false);

//   useEffect(() => {
//     setSettings(loadSettings());
//   }, []);

//   const canSave = useMemo(() => {
//     // very light validation
//     return settings.apiBaseUrl.trim().length > 0;
//   }, [settings.apiBaseUrl]);

//   const save = () => {
//     if (!canSave) return;
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
//     setSavedToast(true);
//     setTimeout(() => setSavedToast(false), 1500);
//   };

//   const reset = () => {
//     setSettings(DEFAULTS);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
//     setSavedToast(true);
//     setTimeout(() => setSavedToast(false), 1500);
//   };

//   return (
//     <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
//       <div className="max-w-5xl mx-auto p-8">
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
//             <p className="text-slate-500 mt-1">Configure defaults for tests and results.</p>
//           </div>

//           <div className="flex items-center gap-3">
//             {savedToast && (
//               <span className="text-sm font-medium px-3 py-2 rounded-lg border bg-green-50 text-green-700 border-green-200">
//                 Saved ✓
//               </span>
//             )}
//             <Button variant="secondary" onClick={() => navigate("/")}>
//               Back to Dashboard
//             </Button>
//           </div>
//         </div>

//         {/* Cards */}
//         <div className="space-y-6">
//           {/* API */}
//           <div className="bg-white border rounded-xl shadow-sm">
//             <div className="px-6 py-4 border-b bg-slate-50 rounded-t-xl flex items-center gap-2">
//               <Link2 className="w-5 h-5 text-slate-500" />
//               <h2 className="font-semibold text-slate-800">API Configuration</h2>
//             </div>

//             <div className="p-6">
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 API Base URL
//               </label>
//               <input
//                 value={settings.apiBaseUrl}
//                 onChange={(e) => setSettings((s) => ({ ...s, apiBaseUrl: e.target.value }))}
//                 placeholder="http://localhost:8000"
//                 className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//               <p className="text-xs text-slate-500 mt-2">
//                 Used for local development. Example: http://localhost:8000
//               </p>
//             </div>
//           </div>

//           {/* Defaults */}
//           <div className="bg-white border rounded-xl shadow-sm">
//             <div className="px-6 py-4 border-b bg-slate-50 rounded-t-xl flex items-center gap-2">
//               <Sliders className="w-5 h-5 text-slate-500" />
//               <h2 className="font-semibold text-slate-800">Default Test Settings</h2>
//             </div>

//             <div className="p-6 grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Default Comparison Mode
//                 </label>
//                 <select
//                   value={settings.defaultComparisonMode}
//                   onChange={(e) =>
//                     setSettings((s) => ({
//                       ...s,
//                       defaultComparisonMode: e.target.value as any,
//                     }))
//                   }
//                   className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="desktop-desktop">Desktop vs Desktop</option>
//                   <option value="mobile-mobile">Mobile vs Mobile</option>
//                   <option value="desktop-mobile">Desktop vs Mobile</option>
//                 </select>
//                 <p className="text-xs text-slate-500 mt-2">
//                   Used as the default selection when starting a new test.
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Default Device Type (metadata)
//                 </label>
//                 <select
//                   value={settings.defaultDeviceType}
//                   onChange={(e) =>
//                     setSettings((s) => ({
//                       ...s,
//                       defaultDeviceType: e.target.value as any,
//                     }))
//                   }
//                   className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="desktop">Desktop</option>
//                   <option value="mobile">Mobile</option>
//                 </select>
//                 <p className="text-xs text-slate-500 mt-2">
//                   Pre-fills metadata dropdowns for new upload pairs.
//                 </p>
//               </div>

//               <div className="md:col-span-2">
//                 <label className="inline-flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={settings.showHeatmapByDefault}
//                     onChange={(e) =>
//                       setSettings((s) => ({ ...s, showHeatmapByDefault: e.target.checked }))
//                     }
//                     className="w-4 h-4"
//                   />
//                   <span className="text-sm font-medium text-slate-700">
//                     Show heatmap by default in Evidence modal
//                   </span>
//                 </label>
//                 <p className="text-xs text-slate-500 mt-2">
//                   If enabled, the Evidence modal opens with heatmap overlay visible.
//                 </p>
//               </div>
//             </div>

//             <div className="px-6 pb-6 flex justify-end gap-3">
//               <button
//                 onClick={reset}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
//               >
//                 <RotateCcw className="w-4 h-4" />
//                 Reset
//               </button>

//               <button
//                 onClick={save}
//                 disabled={!canSave}
//                 className={[
//                   "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
//                   canSave
//                     ? "bg-blue-600 text-white hover:bg-blue-700"
//                     : "bg-slate-200 text-slate-500 cursor-not-allowed",
//                 ].join(" ")}
//               >
//                 <Save className="w-4 h-4" />
//                 Save Settings
//               </button>
//             </div>
//           </div>

//           {/* Results Behavior */}
// <div className="bg-white border rounded-xl shadow-sm">
//   <div className="px-6 py-4 border-b bg-slate-50 rounded-t-xl flex items-center gap-2">
//     <Sliders className="w-5 h-5 text-slate-500" />
//     <h2 className="font-semibold text-slate-800">Results Behavior</h2>
//   </div>

//   <div className="p-6 grid md:grid-cols-2 gap-6">
//     {/* Bug threshold */}
//     <div>
//       <label className="block text-sm font-medium text-slate-700 mb-2">
//         Bug Decision Threshold
//       </label>

//       <div className="flex items-center gap-3">
//         <input
//           type="range"
//           min={0.05}
//           max={0.95}
//           step={0.05}
//           value={settings.bugDecisionThreshold}
//           onChange={(e) =>
//             setSettings((s) => ({
//               ...s,
//               bugDecisionThreshold: Number(e.target.value),
//             }))
//           }
//           className="w-full"
//         />
//         <span className="w-14 text-right text-sm font-semibold text-slate-800">
//           {settings.bugDecisionThreshold.toFixed(2)}
//         </span>
//       </div>

//       <p className="text-xs text-slate-500 mt-2">
//         If model probability ≥ threshold, mark as Bug. Increase to reduce false positives.
//       </p>
//     </div>

//     {/* Default sort */}
//     <div>
//       <label className="block text-sm font-medium text-slate-700 mb-2">
//         Default Results Sort
//       </label>

//       <select
//         value={settings.defaultResultsSort}
//         onChange={(e) =>
//           setSettings((s) => ({
//             ...s,
//             defaultResultsSort: e.target.value as any,
//           }))
//         }
//         className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//       >
//         <option value="severity">Sort by Severity</option>
//         <option value="category">Sort by Category</option>
//       </select>

//       <p className="text-xs text-slate-500 mt-2">
//         Applied when opening a results session.
//       </p>
//     </div>

//     {/* Severity thresholds */}
//     <div className="md:col-span-2">
//       <label className="block text-sm font-medium text-slate-700 mb-2">
//         Severity Thresholds (if backend doesn’t send severity)
//       </label>

//       <div className="grid md:grid-cols-2 gap-4">
//         <div className="border rounded-lg p-4 bg-slate-50">
//           <div className="text-sm font-semibold text-slate-800 mb-2">High severity</div>
//           <div className="flex items-center gap-3">
//             <input
//               type="range"
//               min={0.1}
//               max={0.95}
//               step={0.05}
//               value={settings.severityThresholds.high}
//               onChange={(e) => {
//                 const high = Number(e.target.value);
//                 setSettings((s) => ({
//                   ...s,
//                   severityThresholds: {
//                     ...s.severityThresholds,
//                     high,
//                   },
//                 }));
//               }}
//               className="w-full"
//             />
//             <span className="w-14 text-right text-sm font-semibold text-slate-800">
//               {settings.severityThresholds.high.toFixed(2)}
//             </span>
//           </div>
//           <p className="text-xs text-slate-500 mt-2">
//             prob ≥ high → High
//           </p>
//         </div>

//         <div className="border rounded-lg p-4 bg-slate-50">
//           <div className="text-sm font-semibold text-slate-800 mb-2">Medium severity</div>
//           <div className="flex items-center gap-3">
//             <input
//               type="range"
//               min={0.05}
//               max={0.9}
//               step={0.05}
//               value={settings.severityThresholds.medium}
//               onChange={(e) => {
//                 const medium = Number(e.target.value);
//                 setSettings((s) => ({
//                   ...s,
//                   severityThresholds: {
//                     ...s.severityThresholds,
//                     medium,
//                   },
//                 }));
//               }}
//               className="w-full"
//             />
//             <span className="w-14 text-right text-sm font-semibold text-slate-800">
//               {settings.severityThresholds.medium.toFixed(2)}
//             </span>
//           </div>
//           <p className="text-xs text-slate-500 mt-2">
//             prob ≥ medium → Medium, else Low
//           </p>
//         </div>
//       </div>

//       <p className="text-xs text-slate-500 mt-3">
//         Recommended: keep <span className="font-medium">high &gt; medium</span>.  
//         Example: High 0.75, Medium 0.45.
//       </p>
//     </div>
//   </div>
// </div>

// {/* Danger Zone */}
// <div className="bg-white border rounded-xl shadow-sm">
//   {/* <div className="px-6 py-4 border-b bg-slate-50 rounded-t-xl">
//     <h2 className="font-semibold text-slate-800">Danger Zone</h2>
//     <p className="text-xs text-slate-500 mt-1">
//       These actions are useful during development/testing.
//     </p>
//   </div> */}

//   <div className="p-6 flex flex-wrap items-center justify-between gap-4">
//     <div>
//       <div className="font-medium text-slate-800">Reset settings to defaults</div>
//       <div className="text-sm text-slate-500">
//         Clears custom values and restores default settings.
//       </div>
//     </div>

//     <button
//       onClick={reset}
//       className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
//                  bg-white text-red-600 border-red-200 hover:bg-red-50"
//     >
//       <RotateCcw className="w-4 h-4" />
//       Reset Settings
//     </button>
//   </div>
// </div>

//         </div>
//       </div>
//     </div>
//   );
// }
