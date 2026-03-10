// // import { useState } from "react";
// // import { Globe, Play } from "lucide-react";
// // import { useNavigate } from "react-router-dom";

// // export default function UrlTest() {
// //   const navigate = useNavigate();

// //   const [url, setUrl] = useState("");
// //   const [browsers, setBrowsers] = useState<string[]>(["chrome"]);
// //   const [devices, setDevices] = useState<string[]>(["desktop"]);
// //   const [error, setError] = useState("");

// //   const toggleOption = (
// //     value: string,
// //     list: string[],
// //     setter: (v: string[]) => void
// //   ) => {
// //     if (list.includes(value)) {
// //       setter(list.filter((item) => item !== value));
// //     } else {
// //       setter([...list, value]);
// //     }
// //   };

// //   const handleStart = () => {
// //     if (!url) {
// //       setError("Please enter a valid URL");
// //       return;
// //     }

// //     if (browsers.length === 0 || devices.length === 0) {
// //       setError("Select at least one browser and one device");
// //       return;
// //     }

// //     console.log("URL Test Config:", {
// //       url,
// //       browsers,
// //       devices
// //     });

// //     // Later → trigger backend
// //   //   navigate("/results/demo");
// //   // };

// //   navigate("/new-test/configure", {
// //   state: {
// //     url,
// //     browsers,
// //     devices
// //   }
// // })
// // };

// //   return (
// //     <div className="max-w-4xl mx-auto p-8">
// //       <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
// //         <Globe className="w-6 h-6 text-primary" />
// //         Test Using URL
// //       </h2>

// //       <p className="text-slate-500 mb-8">
// //         Automatically capture screenshots across devices and browsers.
// //       </p>

// //       {/* URL Input */}
// //       <div className="mb-6">
// //         <label className="block font-medium mb-2">Website URL</label>
// //         <input
// //           type="url"
// //           placeholder="https://example.com"
// //           value={url}
// //           onChange={(e) => setUrl(e.target.value)}
// //           className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
// //         />
// //       </div>

// //       {/* Browser Selection */}
// //       <div className="mb-6">
// //         <h3 className="font-semibold mb-3">Browsers</h3>
// //         <div className="flex gap-4">
// //           {["chrome", "firefox"].map((browser) => (
// //             <button
// //               key={browser}
// //               onClick={() => toggleOption(browser, browsers, setBrowsers)}
// //               className={`px-4 py-2 rounded-lg border transition ${
// //                 browsers.includes(browser)
// //                   ? "bg-primary text-white border-primary"
// //                   : "bg-white border-slate-300"
// //               }`}
// //             >
// //               {browser.toUpperCase()}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Device Selection */}
// //       <div className="mb-6">
// //         <h3 className="font-semibold mb-3">Devices</h3>
// //         <div className="flex gap-4">
// //           {["desktop", "mobile"].map((device) => (
// //             <button
// //               key={device}
// //               onClick={() => toggleOption(device, devices, setDevices)}
// //               className={`px-4 py-2 rounded-lg border transition ${
// //                 devices.includes(device)
// //                   ? "bg-primary text-white border-primary"
// //                   : "bg-white border-slate-300"
// //               }`}
// //             >
// //               {device.toUpperCase()}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Error Message */}
// //       {error && (
// //         <div className="mb-4 text-red-600 font-medium">{error}</div>
// //       )}

// //       {/* Start Button */}
// //       <button
// //         onClick={handleStart}
// //         className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
// //       >
// //         <Play className="w-5 h-5" />
// //         Start URL Test
// //       </button>

// //       {/* Status Placeholder */}
// //       <div className="mt-8 p-4 bg-slate-50 rounded-lg border">
// //         <p className="text-slate-600">
// //           Status: Ready to start capture
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// import { useMemo, useState } from "react";
// import { Globe, Camera, ArrowRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/common/Button";

// type ComparisonMode = "desktop-desktop" |"";

// const DESKTOP_BROWSERS = [
//   { value: "chrome", label: "Chrome" },
//   { value: "firefox", label: "Firefox" },
//   { value: "edge", label: "Edge" },
//   { value: "safari", label: "Safari" },
// ];

// const DESKTOP_OS = [
//   { value: "windows", label: "Windows" },
//   { value: "macos", label: "MacOS" },
// ];

// const MOBILE_DEVICES = [
//   { value: "samsung_s24", label: "Samsung S24 (Android)" },
//   { value: "pixel_8", label: "Pixel 8 (Android)" },
//   { value: "redmi_note_13", label: "Redmi Note 13 (Android)" },
//   { value: "iphone_13", label: "iPhone 13 (iOS)" },
//   { value: "iphone_14_pro", label: "iPhone 14 Pro (iOS)" },
//   { value: "iphone_15_pro_max", label: "iPhone 15 Pro Max (iOS)" },
// ];

// const MOBILE_BROWSERS = [
//   { value: "chrome_mobile", label: "Chrome Mobile" },
//   { value: "safari_mobile", label: "Safari Mobile" },
//   { value: "samsung_internet", label: "Samsung Internet" },
//   { value: "firefox_mobile", label: "Firefox Mobile" },
// ];

// function isValidHttpUrl(value: string) {
//   try {
//     const u = new URL(value);
//     return u.protocol === "http:" || u.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// const ModeCard = ({
//   title,
//   desc,
//   selected,
//   onClick,
//   disabled,
// }: {
//   title: string;
//   desc: string;
//   selected: boolean;
//   onClick: () => void;
//   disabled: boolean;
// }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     disabled={disabled}
//     className={[
//       "w-full text-left p-4 rounded-lg border transition",
//       selected ? "border-primary bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
//       disabled ? "opacity-60 cursor-not-allowed" : "",
//     ].join(" ")}
//   >
//     <div className="font-semibold text-slate-800">{title}</div>
//     <div className="text-sm text-slate-500 mt-1">{desc}</div>
//   </button>
// );

// const Select = ({
//   label,
//   value,
//   onChange,
//   disabled,
//   children,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   disabled: boolean;
//   children: React.ReactNode;
// }) => (
//   <div>
//     <label className="block font-medium mb-2 text-slate-700">{label}</label>
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       disabled={disabled}
//       className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
//     >
//       {children}
//     </select>
//   </div>
// );

// export default function UrlEnterPage() {
//   const navigate = useNavigate();

//   const [url, setUrl] = useState("");
//   const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("");

//   // Desktop meta
//   const [desktopBrowserA, setDesktopBrowserA] = useState("");
//   const [desktopBrowserB, setDesktopBrowserB] = useState("");
//   const [desktopOsA, setDesktopOsA] = useState("");
//   const [desktopOsB, setDesktopOsB] = useState("");

//   // // Mobile meta
//   // const [mobileDeviceA, setMobileDeviceA] = useState("");
//   // const [mobileDeviceB, setMobileDeviceB] = useState("");
//   // const [mobileBrowserA, setMobileBrowserA] = useState("");
//   // const [mobileBrowserB, setMobileBrowserB] = useState("");

//   // Capture state
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureError, setCaptureError] = useState<string | null>(null);
//   const [captureResult, setCaptureResult] = useState<null | {
//     sessionId: string;
//     pairs: Array<{
//       screenshotAUrl: string;
//       screenshotBUrl: string;
//       envA: any;
//       envB: any;
//     }>;
//   }>(null);

//   const resetCapture = () => {
//     setCaptureError(null);
//     setCaptureResult(null);
//   };

//   const handleModeChange = (m: ComparisonMode) => {
//     setComparisonMode(m);
//     resetCapture();

//     // reset dropdowns for both modes
//     setDesktopBrowserA("");
//     setDesktopBrowserB("");
//     setDesktopOsA("");
//     setDesktopOsB("");
//     // setMobileDeviceA("");
//     // setMobileDeviceB("");
//     // setMobileBrowserA("");
//     // setMobileBrowserB("");
//   };

//   const urlOk = isValidHttpUrl(url);

//   const metaOk = useMemo(() => {
//     if (!comparisonMode) return false;

//     if (comparisonMode === "desktop-desktop") {
//       return !!desktopBrowserA && !!desktopBrowserB && !!desktopOsA && !!desktopOsB;
//     }

//     // if (comparisonMode === "mobile-mobile") {
//     //   return !!mobileDeviceA && !!mobileDeviceB && !!mobileBrowserA && !!mobileBrowserB;
//     // }

//     return false;
//   }, [
//     comparisonMode,
//     desktopBrowserA,
//     desktopBrowserB,
//     desktopOsA,
//     desktopOsB,
//     // mobileDeviceA,
//     // mobileDeviceB,
//     // mobileBrowserA,
//     // mobileBrowserB,
//   ]);

//   const canCapture = urlOk && metaOk && !isCapturing;
//   const canNext = !!captureResult && !isCapturing;

//   const buildPayload = () => {
//     if (comparisonMode === "desktop-desktop") {
//       return {
//         mode: "url",
//         url,
//         comparisonMode,
//         envA: { deviceType: "desktop", browser: desktopBrowserA, os: desktopOsA },
//         envB: { deviceType: "desktop", browser: desktopBrowserB, os: desktopOsB },
//       };
//     }

//     // return {
//     //   mode: "url",
//     //   url,
//     //   comparisonMode,
//     //   envA: { deviceType: "mobile", deviceModel: mobileDeviceA, browser: mobileBrowserA },
//     //   envB: { deviceType: "mobile", deviceModel: mobileDeviceB, browser: mobileBrowserB },
//     // };
//   };

//   const handleCaptureNow = async () => {
//     setIsCapturing(true);
//     setCaptureError(null);
//     setCaptureResult(null);

//     try {
//       const res = await fetch("http://localhost:8000/api/capture-url", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(buildPayload()),
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Capture failed");
//       }

//       const data = await res.json();
//       setCaptureResult(data);
//     } catch (e: any) {
//       setCaptureError(e?.message || "Capture failed");
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const handleNext = () => {
//     if (!captureResult) return;
//     navigate("/new-test/url/preview", {
//       state: {
//         url,
//         comparisonMode,
//         sessionId: captureResult.sessionId,
//         pairs: captureResult.pairs,
//       },
//     });
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-800">
//         <Globe className="w-6 h-6 text-primary" />
//         Test Using URL
//       </h1>
//       <p className="text-slate-500 mb-8">
//         Enter a URL, choose environments, then capture screenshots.
//       </p>

//       {/* URL */}
//       <div className="bg-white border rounded-xl p-6 mb-6">
//         <h2 className="font-semibold text-slate-800 mb-3">1) Website URL</h2>

//         <input
//           value={url}
//           onChange={(e) => {
//             setUrl(e.target.value);
//             resetCapture();
//           }}
//           placeholder="https://example.com"
//           className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
//           disabled={isCapturing}
//         />

//         {!urlOk && url.length > 0 && (
//           <div className="mt-3 text-red-600 font-medium">
//             URL must start with http:// or https://
//           </div>
//         )}
//       </div>

//       {/* Mode */}
//       <div className="bg-white border rounded-xl p-6 mb-6">
//         <h2 className="font-semibold text-slate-800 mb-3">2) Comparison Mode</h2>

//         <div className="grid md:grid-cols-2 gap-4">
//           <ModeCard
//             title="Desktop vs Desktop"
//             desc="Compare UI between two desktop environments."
//             selected={comparisonMode === "desktop-desktop"}
//             onClick={() => handleModeChange("desktop-desktop")}
//             disabled={isCapturing}
//           />
//           {/* <ModeCard
//             title="Mobile vs Mobile"
//             desc="Compare UI between two mobile device environments."
//             selected={comparisonMode === "mobile-mobile"}
//             onClick={() => handleModeChange("mobile-mobile")}
//             disabled={isCapturing}
//           /> */}
//         </div>
//       </div>

//       {/* Environments */}
//       <div className="bg-white border rounded-xl p-6">
//         <h2 className="font-semibold text-slate-800 mb-3">3) Environments</h2>

//         {!comparisonMode && (
//           <div className="text-slate-500">
//             Select a comparison mode to show environment dropdowns.
//           </div>
//         )}

//         {comparisonMode === "desktop-desktop" && (
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
//               <h3 className="font-semibold text-slate-700 mb-4">Screenshot A</h3>
//               <div className="space-y-4">
//                 <Select
//                   label="Browser"
//                   value={desktopBrowserA}
//                   onChange={(v) => {
//                     setDesktopBrowserA(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select browser</option>
//                   {DESKTOP_BROWSERS.map((b) => (
//                     <option key={b.value} value={b.value}>
//                       {b.label}
//                     </option>
//                   ))}
//                 </Select>

//                 <Select
//                   label="OS"
//                   value={desktopOsA}
//                   onChange={(v) => {
//                     setDesktopOsA(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select OS</option>
//                   {DESKTOP_OS.map((o) => (
//                     <option key={o.value} value={o.value}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             </div>

//             <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
//               <h3 className="font-semibold text-slate-700 mb-4">Screenshot B</h3>
//               <div className="space-y-4">
//                 <Select
//                   label="Browser"
//                   value={desktopBrowserB}
//                   onChange={(v) => {
//                     setDesktopBrowserB(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select browser</option>
//                   {DESKTOP_BROWSERS.map((b) => (
//                     <option key={b.value} value={b.value}>
//                       {b.label}
//                     </option>
//                   ))}
//                 </Select>

//                 <Select
//                   label="OS"
//                   value={desktopOsB}
//                   onChange={(v) => {
//                     setDesktopOsB(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select OS</option>
//                   {DESKTOP_OS.map((o) => (
//                     <option key={o.value} value={o.value}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* {comparisonMode === "mobile-mobile" && (
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
//               <h3 className="font-semibold text-slate-700 mb-4">Screenshot A</h3>
//               <div className="space-y-4">
//                 <Select
//                   label="Device Model"
//                   value={mobileDeviceA}
//                   onChange={(v) => {
//                     setMobileDeviceA(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select device model</option>
//                   {MOBILE_DEVICES.map((d) => (
//                     <option key={d.value} value={d.value}>
//                       {d.label}
//                     </option>
//                   ))}
//                 </Select>

//                 <Select
//                   label="Browser"
//                   value={mobileBrowserA}
//                   onChange={(v) => {
//                     setMobileBrowserA(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select browser</option>
//                   {MOBILE_BROWSERS.map((b) => (
//                     <option key={b.value} value={b.value}>
//                       {b.label}
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             </div>

//             <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
//               <h3 className="font-semibold text-slate-700 mb-4">Screenshot B</h3>
//               <div className="space-y-4">
//                 <Select
//                   label="Device Model"
//                   value={mobileDeviceB}
//                   onChange={(v) => {
//                     setMobileDeviceB(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select device model</option>
//                   {MOBILE_DEVICES.map((d) => (
//                     <option key={d.value} value={d.value}>
//                       {d.label}
//                     </option>
//                   ))}
//                 </Select>

//                 <Select
//                   label="Browser"
//                   value={mobileBrowserB}
//                   onChange={(v) => {
//                     setMobileBrowserB(v);
//                     resetCapture();
//                   }}
//                   disabled={isCapturing}
//                 >
//                   <option value="">Select browser</option>
//                   {MOBILE_BROWSERS.map((b) => (
//                     <option key={b.value} value={b.value}>
//                       {b.label}
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             </div>
//           </div>
//         )} */}

//         {!metaOk && comparisonMode && (
//           <div className="mt-4 text-amber-700 font-medium">
//             Please complete all selections to enable capture.
//           </div>
//         )}
//       </div>

//       {/* Actions + Summary */}
//       <div className="mt-8 p-4 bg-slate-50 rounded-lg border">
//         <div className="flex flex-wrap gap-3 items-center">
//           <Button
//             onClick={handleCaptureNow}
//             disabled={!canCapture}
//             className="flex items-center gap-2"
//           >
//             <Camera className="w-5 h-5" />
//             {isCapturing ? "Capturing..." : "Capture Now"}
//           </Button>

//           <Button
//             variant="secondary"
//             onClick={handleNext}
//             disabled={!canNext}
//             className="flex items-center gap-2"
//           >
//             Next
//             <ArrowRight className="w-5 h-5" />
//           </Button>
//         </div>

//         {captureError && (
//           <div className="mt-4 text-red-600 font-medium">{captureError}</div>
//         )}

//         {captureResult && (
//           <div className="mt-4 text-green-700 font-medium">
//             Capture completed. Session ID: <span className="font-semibold">{captureResult.sessionId}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }






// import { useMemo, useState } from "react";
// import { Globe, Camera, ArrowRight, Monitor } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/common/Button";

// const DESKTOP_BROWSERS = [
//   { value: "chrome", label: "Chrome" },
//   { value: "firefox", label: "Firefox" },
//   { value: "edge", label: "Edge" },
//   { value: "safari", label: "Safari" },
// ];

// const DESKTOP_OS = [
//   { value: "windows", label: "Windows" },
//   { value: "macos", label: "macOS" },
// ];

// function isValidHttpUrl(value: string) {
//   try {
//     const u = new URL(value);
//     return u.protocol === "http:" || u.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// export default function UrlEnterPage() {
//   const navigate = useNavigate();

//   const [url, setUrl] = useState("");

//   // Desktop meta (A & B)
//   const [browserA, setBrowserA] = useState("");
//   const [browserB, setBrowserB] = useState("");
//   const [osA, setOsA] = useState("");
//   const [osB, setOsB] = useState("");

//   const urlOk = isValidHttpUrl(url);
//   const envEnabled = urlOk;

//   const metaOk = useMemo(() => {
//     return !!browserA && !!browserB && !!osA && !!osB;
//   }, [browserA, browserB, osA, osB]);

//   const canCapture = urlOk && metaOk;

//   const generateFiveDigitId = () => Math.floor(10000 + Math.random() * 90000);
//   const generatePairId = () => Math.floor(10 + Math.random() * 90000); 

//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureError, setCaptureError] = useState<string | null>(null);


//   const handleCaptureNow = async () => {
//   if (!canCapture) return;

//   try {
//     setIsCapturing(true);
//     setCaptureError(null);

//     const userId = generateFiveDigitId();
//     const pairId = generatePairId();

//     const payload = {
//       user_id: userId,
//       pair_id: pairId,
//       image_url: url,
//       image_list: [
//         { browser: browserA, os: osA },
//         { browser: browserB, os: osB },
//       ],
//     };

//     console.log("CaptureByUrl payload:", payload);

//     const res = await fetch("http://127.0.0.1:8080/api/predict/CaptureByUrl", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(text || "CaptureByUrl failed");
//     }

//     const data = await res.json();
//     console.log("CaptureByUrl response:", data);

//     // expected shape: { results: [{...}, {...}] }
//     if (!data?.results || data.results.length < 2) {
//       throw new Error("CaptureByUrl response missing results");
//     }

//     // Convert response into preview state
//     const imgA = data.results[0];
//     const imgB = data.results[1];

//     navigate("/new-test/url/preview", {
//       state: {
//         url,
//         sessionId: String(userId),
//         pairId: pairId,
//         comparisonMode: "desktop_vs_desktop",
//         captured: data, // store raw response
//         pairs: [
//           {
//             screenshotAUrl: imgA.image_url,
//             screenshotBUrl: imgB.image_url,
//             envA: { deviceType: "desktop", browser: imgA.browser, os: imgA.os },
//             envB: { deviceType: "desktop", browser: imgB.browser, os: imgB.os },
//           },
//         ],
//       },
//     });
//   } catch (e: any) {
//     console.error(e);
//     setCaptureError(e?.message || "Capture failed");
//   } finally {
//     setIsCapturing(false);
//   }
// };


//   return (
//     <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
//       <div className="max-w-5xl mx-auto p-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <Globe className="w-6 h-6 text-primary" />
//             Test Using URL
//           </h1>
//           <p className="text-slate-500 mt-1">
//             Desktop vs Desktop URL capture (frontend demo flow).
//           </p>
//         </div>

//         {/* Fixed Comparison Mode */}
//         <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
//           <div className="flex items-start justify-between gap-4 flex-wrap">
//             <div>
//               <h2 className="font-semibold text-slate-800">Comparison Mode</h2>
//             </div>

//             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 font-medium">
//               <Monitor className="w-4 h-4" />
//               Desktop vs Desktop
//             </span>
//           </div>
//         </div>

//         {/* URL */}
//         <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
//           <h2 className="font-semibold text-slate-800 mb-3">Website URL</h2>

//           <input
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             placeholder="https://example.com"
//             className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
//           />

//           {!urlOk && url.length > 0 && (
//             <div className="mt-3 text-red-600 font-medium">
//               Invalid URL type (URL must start with http:// or https://)
//             </div>
//           )}

//           {urlOk && (
//             <div className="mt-3 text-green-700 font-medium">
//               URL is valid 
//             </div>
//           )}
//         </div>

//         {/* Environments (disabled until URL valid) */}
//         <div className="bg-white border rounded-xl p-6 shadow-sm">
//           <h2 className="font-semibold text-slate-800 mb-3">Desktop Environments</h2>

//           <div className={envEnabled ? "" : "opacity-60 pointer-events-none"}>
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* A */}
//               <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
//                 <h3 className="font-semibold text-slate-700 mb-4">Screenshot A</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Browser</label>
//                     <select
//                       value={browserA}
//                       onChange={(e) => setBrowserA(e.target.value)}
//                       className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select browser</option>
//                       {DESKTOP_BROWSERS.map((b) => (
//                         <option key={b.value} value={b.value}>{b.label}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">OS</label>
//                     <select
//                       value={osA}
//                       onChange={(e) => setOsA(e.target.value)}
//                       className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select OS</option>
//                       {DESKTOP_OS.map((o) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* B */}
//               <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
//                 <h3 className="font-semibold text-slate-700 mb-4">Screenshot B</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Browser</label>
//                     <select
//                       value={browserB}
//                       onChange={(e) => setBrowserB(e.target.value)}
//                       className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select browser</option>
//                       {DESKTOP_BROWSERS.map((b) => (
//                         <option key={b.value} value={b.value}>{b.label}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">OS</label>
//                     <select
//                       value={osB}
//                       onChange={(e) => setOsB(e.target.value)}
//                       className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select OS</option>
//                       {DESKTOP_OS.map((o) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>

            
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="mt-6 flex justify-end">
//           <Button
//             onClick={handleCaptureNow}
//             disabled={!canCapture || isCapturing}
//             className="flex items-center gap-2" 
//           >
//             <Camera className="w-5 h-5" />
//             {isCapturing ? "Capturing..." : "Capture Now"}
//             <ArrowRight className="w-5 h-5" />
//           </Button>

//         </div>
//       </div>
//     </div>
//   );
// }

import { useMemo, useState, useEffect } from "react";
import { Globe, Camera, ArrowRight, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { uploadApi } from "../api/clients";

type SelectedOS = "" | "windows" | "macos";

const WINDOWS_BROWSERS = [
  { value: "chrome", label: "Chrome" },
  { value: "edge", label: "Microsoft Edge" },
  { value: "firefox", label: "Firefox" },
];

const MAC_BROWSERS = [
  { value: "safari", label: "Safari" },
  { value: "chrome", label: "Chrome" },
  { value: "firefox", label: "Firefox" },
];

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidHttpUrl(value: string) {
  try {
    // const u = new URL(value);
    const u = new URL(normalizeHttpUrl(value));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UrlEnterPage() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");

  // user OS selection
  const [selectedOS, setSelectedOS] = useState<SelectedOS>("");

  // Desktop meta (A & B)
  const [browserA, setBrowserA] = useState("");
  const [browserB, setBrowserB] = useState("");

  // OS for A/B comes from selectedOS (fixed)
  const osA = selectedOS;
  const osB = selectedOS;

  const normalizedUrl = normalizeHttpUrl(url);
  const urlOk = isValidHttpUrl(url);

  // Environments enabled only when URL valid + OS selected
  const envEnabled = urlOk && !!selectedOS;

  // browsers depend on OS
  const availableBrowsers = useMemo(() => {
    if (selectedOS === "windows") return WINDOWS_BROWSERS;
    if (selectedOS === "macos") return MAC_BROWSERS;
    return [];
  }, [selectedOS]);

  // when OS changes, reset browsers (important)
  useEffect(() => {
    setBrowserA("");
    setBrowserB("");
  }, [selectedOS]);

  const metaOk = useMemo(() => {
    return !!browserA && !!browserB && !!osA && !!osB;
  }, [browserA, browserB, osA, osB]);

  const canCapture = urlOk && metaOk;

  // const generateFiveDigitId = () => Math.floor(10000 + Math.random() * 90000);
  const generatePairId = () => Math.floor(10 + Math.random() * 90000);

  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const handleCaptureNow = async () => {
    if (!canCapture) return;

    try {
      setIsCapturing(true);
      setCaptureError(null);

      const pairId = generatePairId();

      const payload = {
        user_id: Number(localStorage.getItem("Id")),
        pair_id: pairId,
        // image_url: url,
        image_url: normalizedUrl,
        image_list: [
          { browser: browserA, os: osA },
          { browser: browserB, os: osB },
        ],
      };

      console.log("CaptureByUrl payload:", payload);

      // const res = await fetch("http://127.0.0.1:8080/api/predict/CaptureByUrl", {
      //   method: "POST",
      const res = await uploadApi.post("/predict/CaptureByUrl", payload, {
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(payload),
      });

      // if (!res.ok) {
      //   const text = await res.text();
      //   throw new Error(text || "CaptureByUrl failed");
      // }

      // const data = await res.json();
      const data = res.data;
      console.log("CaptureByUrl response:", data);

      if (!data?.results || data.results.length < 2) {
        throw new Error("CaptureByUrl response missing results");
      }

      const imgA = data.results[0];
      const imgB = data.results[1];

      navigate("/new-test/url/preview", {
        state: {
          // url,
          url: normalizedUrl,
          sessionId: Number(localStorage.getItem("SessionId")),
          pairId: pairId,
          comparisonMode: "desktop_vs_desktop",
          captured: data,
          pairs: [
            {
              screenshotAUrl: imgA.image_url,
              screenshotBUrl: imgB.image_url,
              envA: { deviceType: "desktop", browser: imgA.browser, os: imgA.os },
              envB: { deviceType: "desktop", browser: imgB.browser, os: imgB.os },
            },
          ],
        },
      });
    } catch (e: any) {
      console.error(e);
      setCaptureError(e?.message || "Capture failed");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Test Using URL
          </h1>
          <p className="text-slate-500 mt-1">
            Desktop vs Desktop URL capture
          </p>
        </div>

        {/* Fixed Comparison Mode */}
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-semibold text-slate-800">Comparison Mode</h2>
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 font-medium">
              <Monitor className="w-4 h-4" />
              Desktop vs Desktop
            </span>
          </div>
        </div>

        {/* OS selection card */}
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Select your OS</h2>
          <p className="text-slate-500 text-sm mb-4">
            Browser options will change based on OS.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedOS("windows")}
              className={[
                "p-4 rounded-xl border text-left transition",
                selectedOS === "windows"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="font-semibold text-slate-800">Windows</div>
              <div className="text-sm text-slate-500 mt-1">
                Chrome • Edge • Firefox
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOS("macos")}
              className={[
                "p-4 rounded-xl border text-left transition",
                selectedOS === "macos"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="font-semibold text-slate-800">macOS</div>
              <div className="text-sm text-slate-500 mt-1">
                Safari • Chrome • Firefox
              </div>
            </button>
          </div>

          {!selectedOS && (
            <div className="mt-4 text-amber-700 font-medium">
              Please select OS to continue.
            </div>
          )}
        </div>

        {/* URL */}
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Website URL</h2>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {!urlOk && url.length > 0 && (
            <div className="mt-3 text-red-600 font-medium">
              Invalid URL type (URL must start with http:// or https://)
            </div>
          )}

          {urlOk && (
            <div className="mt-3 text-green-700 font-medium">
              URL is valid
            </div>
          )}
        </div>

        {/* Environments */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Desktop Environments</h2>

          <div className={envEnabled ? "" : "opacity-60 pointer-events-none"}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* A */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <h3 className="font-semibold text-slate-700 mb-4">Screenshot A</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Browser
                    </label>
                    <select
                      value={browserA}
                      onChange={(e) => setBrowserA(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select browser</option>
                      {availableBrowsers.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      OS (Fixed)
                    </label>
                    <input
                      value={selectedOS}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-slate-100 text-sm text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* B */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <h3 className="font-semibold text-slate-700 mb-4">Screenshot B</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Browser
                    </label>
                    <select
                      value={browserB}
                      onChange={(e) => setBrowserB(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select browser</option>
                      {availableBrowsers.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      OS (Fixed)
                    </label>
                    <input
                      value={selectedOS}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-slate-100 text-sm text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!envEnabled && (
            <div className="mt-4 text-amber-700 font-medium">
              Enter a valid URL and select OS to unlock environments.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6">
          {captureError && (
            <div className="mb-4 text-red-600 font-medium">{captureError}</div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleCaptureNow}
              disabled={!canCapture || isCapturing}
              className="flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {isCapturing ? "Capturing..." : "Capture Now"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
