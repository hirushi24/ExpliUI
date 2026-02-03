// import type { EnvironmentMetadata } from "../../types";

// interface Props {
//   metadata: EnvironmentMetadata;
//   onChange: (key: keyof EnvironmentMetadata, value: string) => void;
//   disabled?: boolean;
// }

// export function EnvironmentSelector({ metadata, onChange, disabled }: Props) {
//   return (
//     <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border mt-4">
//       <div>
//         <label className="text-xs font-semibold text-slate-500 block mb-1">Device Type</label>
//         <select
//           className="w-full p-2 border rounded text-sm"
//           value={metadata.deviceType}
//           onChange={(e) => onChange("deviceType", e.target.value as any)}
//           disabled={disabled}
//         >
//           <option value="desktop">Desktop</option>
//           <option value="mobile">Mobile</option>
//         </select>
//       </div>

//       <div>
//         <label className="text-xs font-semibold text-slate-500 block mb-1">OS</label>
//         <select
//           className="w-full p-2 border rounded text-sm"
//           value={metadata.os}
//           onChange={(e) => onChange("os", e.target.value)}
//           disabled={disabled}
//         >
//           <option value="">Select OS</option>
//           {metadata.deviceType === "desktop" ? (
//             <>
//               <option value="Windows">Windows</option>
//               <option value="MacOS">MacOS</option>
//               <option value="Linux">Linux</option>
//             </>
//           ) : (
//             <>
//               <option value="Android">Android</option>
//               <option value="iOS">iOS</option>
//             </>
//           )}
//         </select>
//       </div>

//       <div>
//         <label className="text-xs font-semibold text-slate-500 block mb-1">Browser</label>
//         <select
//           className="w-full p-2 border rounded text-sm"
//           value={metadata.browser}
//           onChange={(e) => onChange("browser", e.target.value)}
//           disabled={disabled}
//         >
//           <option value="">Select Browser</option>
//           {metadata.deviceType === "desktop" ? (
//             <>
//               <option value="Chrome">Chrome</option>
//               <option value="Firefox">Firefox</option>
//               <option value="Edge">Edge</option>
//               <option value="Safari">Safari</option>
//             </>
//           ) : (
//             <>
//               <option value="Chrome Mobile">Chrome Mobile</option>
//               <option value="Safari Mobile">Safari Mobile</option>
//               <option value="Samsung Internet">Samsung Internet</option>
//             </>
//           )}
//         </select>
//       </div>

//       {metadata.deviceType === "mobile" && (
//         <div>
//           <label className="text-xs font-semibold text-slate-500 block mb-1">Device Model</label>
//           <select
//             className="w-full p-2 border rounded text-sm"
//             value={metadata.deviceModel || ""}
//             onChange={(e) => onChange("deviceModel", e.target.value)}
//             disabled={disabled}
//           >
//             <option value="">Select device model</option>
//             <option value="Samsung S24">Samsung S24</option>
//             <option value="Pixel 8">Pixel 8</option>
//             <option value="iPhone 15 Pro">iPhone 15 Pro</option>
//             <option value="iPhone 14">iPhone 14</option>
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }




// import type { EnvironmentMetadata } from "../../types";

// interface Props {
//   metadata: EnvironmentMetadata;
//   onChange: (key: keyof EnvironmentMetadata, value: string) => void;
//   disabled?: boolean;

//   // NEW (only for locking device type)
//   lockDeviceType?: boolean;
// }

// export function EnvironmentSelector({ metadata, onChange, disabled, lockDeviceType }: Props) {
//   return (
//     <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border mt-4">
//       <div>
//         <label className="text-xs font-semibold text-slate-500 block mb-1">Device Type</label>
//         <select
//           className="w-full p-2 border rounded text-sm"
//           value={metadata.deviceType}
//           onChange={(e) => onChange("deviceType", e.target.value as any)}
//           disabled={disabled || lockDeviceType}
//         >
//           <option value="desktop">Desktop</option>
//           <option value="mobile">Mobile</option>
//         </select>
//       </div>

//       <div>
//         <label className="text-xs font-semibold text-slate-500 block mb-1">OS</label>
//         <select
//           className="w-full p-2 border rounded text-sm"
//           value={metadata.os}
//           onChange={(e) => onChange("os", e.target.value)}
//           disabled={disabled}
//         >
//           <option value="">Select OS</option>
//           {metadata.deviceType === "desktop" ? (
//             <>
//               <option value="Windows">Windows</option>
//               <option value="MacOS">MacOS</option>
//               <option value="Linux">Linux</option>
//             </>
//           ) : (
//             <>
//               <option value="Android">Android</option>
//               <option value="iOS">iOS</option>
//             </>
//           )}
//         </select>
//       </div>

//       <div>
//         <label className="text-xs font-semibold text-slate-500 block mb-1">Browser</label>
//         <select
//           className="w-full p-2 border rounded text-sm"
//           value={metadata.browser}
//           onChange={(e) => onChange("browser", e.target.value)}
//           disabled={disabled}
//         >
//           <option value="">Select Browser</option>
//           {metadata.deviceType === "desktop" ? (
//             <>
//               <option value="Chrome">Chrome</option>
//               <option value="Firefox">Firefox</option>
//               <option value="Edge">Edge</option>
//               <option value="Safari">Safari</option>
//             </>
//           ) : (
//             <>
//               <option value="Chrome Mobile">Chrome Mobile</option>
//               <option value="Safari Mobile">Safari Mobile</option>
//               <option value="Samsung Internet">Samsung Internet</option>
//             </>
//           )}
//         </select>
//       </div>

//       {metadata.deviceType === "mobile" && (
//         <div>
//           <label className="text-xs font-semibold text-slate-500 block mb-1">Device Model</label>
//           <select
//             className="w-full p-2 border rounded text-sm"
//             value={metadata.deviceModel || ""}
//             onChange={(e) => onChange("deviceModel", e.target.value)}
//             disabled={disabled}
//           >
//             <option value="">Select device model</option>
//             <option value="Samsung S24">Samsung S24</option>
//             <option value="Pixel 8">Pixel 8</option>
//             <option value="iPhone 15 Pro">iPhone 15 Pro</option>
//             <option value="iPhone 14">iPhone 14</option>
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }







// import type { EnvironmentMetadata } from "../../types";
// import { Lock } from "lucide-react";

// interface Props {
//   metadata: EnvironmentMetadata;
//   onChange: (key: keyof EnvironmentMetadata, value: string) => void;
//   disabled?: boolean;
//   lockDeviceType?: boolean;
// }

// export function EnvironmentSelector({ metadata, onChange, disabled, lockDeviceType }: Props) {
//   const locked = disabled || lockDeviceType;

//   return (
//     <div className="mt-4 bg-white rounded-xl border p-4">
//       <div className="flex items-center justify-between mb-4">
//         <div className="text-sm font-semibold text-slate-700">Environment Metadata</div>

//         {lockDeviceType && (
//           <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
//             <Lock className="w-3 h-3" /> Device type locked
//           </span>
//         )}
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         {/* Device Type */}
//         <div>
//           <label className="text-xs font-semibold text-slate-500 block mb-1">Device Type</label>
//           <select
//             className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
//             value={metadata.deviceType}
//             onChange={(e) => onChange("deviceType", e.target.value as any)}
//             disabled={locked}
//           >
//             <option value="desktop">Desktop</option>
//             <option value="mobile">Mobile</option>
//           </select>
//         </div>

//         {/* OS */}
//         <div>
//           <label className="text-xs font-semibold text-slate-500 block mb-1">OS</label>
//           <select
//             className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
//             value={metadata.os}
//             onChange={(e) => onChange("os", e.target.value)}
//             disabled={disabled}
//           >
//             <option value="">Select OS</option>
//             {metadata.deviceType === "desktop" ? (
//               <>
//                 <option value="Windows">Windows</option>
//                 <option value="MacOS">MacOS</option>
//               </>
//             ) : (
//               <>
//                 <option value="Android">Android</option>
//                 <option value="iOS">iOS</option>
//               </>
//             )}
//           </select>
//         </div>

//         {/* Browser */}
//         <div>
//           <label className="text-xs font-semibold text-slate-500 block mb-1">Browser</label>
//           <select
//             className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
//             value={metadata.browser}
//             onChange={(e) => onChange("browser", e.target.value)}
//             disabled={disabled}
//           >
//             <option value="">Select Browser</option>
//             {metadata.deviceType === "desktop" ? (
//               <>
//                 <option value="Chrome">Chrome</option>
//                 <option value="Firefox">Firefox</option>
//                 <option value="Edge">Edge</option>
//                 <option value="Safari">Safari</option>
//               </>
//             ) : (
//               <>
//                 <option value="Chrome Mobile">Chrome Mobile</option>
//                 <option value="Safari Mobile">Safari Mobile</option>
//                 <option value="Samsung Internet">Samsung Internet</option>
//               </>
//             )}
//           </select>
//         </div>

//         {/* Device Model (only for mobile) */}
//         {metadata.deviceType === "mobile" && (
//           <div>
//             <label className="text-xs font-semibold text-slate-500 block mb-1">Device Model</label>
//             <select
//               className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
//               value={metadata.deviceModel || ""}
//               onChange={(e) => onChange("deviceModel", e.target.value)}
//               disabled={disabled}
//             >
//               <option value="">Select device model</option>
//               <option value="Samsung S24">Samsung S24</option>
//               <option value="Pixel 8">Pixel 8</option>
//               <option value="iPhone 15 Pro">iPhone 15 Pro</option>
//               <option value="iPhone 14">iPhone 14</option>
//             </select>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import type { EnvironmentMetadata, ComparisonMode } from "../../types";
import { Lock } from "lucide-react";

type Role = "baseline" | "test";

interface Props {
  metadata: EnvironmentMetadata;
  onChange: (key: keyof EnvironmentMetadata, value: string) => void;
  disabled?: boolean;
  lockDeviceType?: boolean;

  /** NEW (optional but used by PairUploadPanel) */
  role?: Role;
  comparisonMode?: ComparisonMode;
  baselineMeta?: EnvironmentMetadata;
}

const DESKTOP_OS = [
  { value: "windows", label: "Windows" },
  { value: "macos", label: "macOS" },
];

const MOBILE_OS = [
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
];

const DESKTOP_BROWSERS_BY_OS: Record<string, { value: string; label: string }[]> = {
  windows: [
    { value: "chrome", label: "Chrome" },
    { value: "edge", label: "Microsoft Edge" },
    { value: "firefox", label: "Firefox" },
  ],
  macos: [
    { value: "safari", label: "Safari" },
    { value: "chrome", label: "Chrome" },
    { value: "firefox", label: "Firefox" },
  ],
};

const MOBILE_BROWSERS_BY_OS: Record<string, { value: string; label: string }[]> = {
  android: [
    { value: "chrome", label: "Chrome" },
    { value: "samsung_internet", label: "Samsung Internet" },
    { value: "firefox", label: "Firefox" },
  ],
  ios: [
    { value: "safari", label: "Safari" },
    { value: "chrome", label: "Chrome" },
    { value: "firefox", label: "Firefox" },
  ],
};

const ANDROID_DEVICES = [
  { value: "samsung_s24", label: "Samsung S24" },
  { value: "pixel_8", label: "Pixel 8" },
  { value: "redmi_note_13", label: "Redmi Note 13" },
];

const IOS_DEVICES = [
  { value: "iphone_13", label: "iPhone 13" },
  { value: "iphone_14", label: "iPhone 14" },
  { value: "iphone_15_pro", label: "iPhone 15 Pro" },
];

function normalize(v?: string) {
  return (v || "").trim().toLowerCase();
}

export function EnvironmentSelector({
  metadata,
  onChange,
  disabled,
  lockDeviceType,
  role = "baseline",
  comparisonMode,
  baselineMeta,
}: Props) {
  const isTest = role === "test";

  const deviceTypeValue = normalize(metadata.deviceType);
  const osValue = normalize(metadata.os);
  const baselineOs = normalize(baselineMeta?.os);

  // deviceType locked:
  // - locked by mode OR
  // - always locked in Test(B) since it must follow Baseline(A)
  const deviceTypeLocked = !!disabled || !!lockDeviceType || isTest;

  // OS locked:
  // - disabled overall OR
  // - always locked in Test(B) (auto-fill)
  const osLocked = !!disabled || isTest;

  // OS options depend on comparisonMode (desktop-desktop => windows/macos, mobile-mobile => android/ios)
  const osOptions =
    comparisonMode === "mobile-mobile"
      ? MOBILE_OS
      : comparisonMode === "desktop-desktop"
      ? DESKTOP_OS
      : deviceTypeValue === "mobile"
      ? MOBILE_OS
      : DESKTOP_OS;

  // For browser options, in Test(B) we use baseline OS (because B is locked to A)
  const effectiveOsForBrowser = isTest ? baselineOs : osValue;

  const browserOptions =
    deviceTypeValue === "mobile"
      ? MOBILE_BROWSERS_BY_OS[effectiveOsForBrowser] || []
      : DESKTOP_BROWSERS_BY_OS[effectiveOsForBrowser] || [];

  // Browser disabled until OS chosen:
  // - baseline: needs its own OS
  // - test: needs baseline OS
  const browserDisabled =
    !!disabled || (isTest ? !baselineOs : !osValue);

  // Device model options only for mobile + filtered by OS (baseline OS for test too)
  const effectiveOsForDevice = isTest ? baselineOs : osValue;

  const deviceModelOptions =
    effectiveOsForDevice === "android"
      ? ANDROID_DEVICES
      : effectiveOsForDevice === "ios"
      ? IOS_DEVICES
      : [];

  const deviceModelDisabled =
    !!disabled ||
    isTest || // must follow baseline
    !effectiveOsForDevice; // until OS chosen

  return (
    <div className="mt-4 bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-slate-700">Environment Metadata</div>

        {(lockDeviceType || isTest) && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
            <Lock className="w-3 h-3" />
            {isTest ? "Synced from baseline" : "Device type locked"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Device Type */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Device Type</label>
          <select
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
            value={metadata.deviceType || ""}
            onChange={(e) => onChange("deviceType", e.target.value)}
            disabled={deviceTypeLocked}
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>

        {/* OS */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">OS</label>
          <select
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
            value={metadata.os || ""}
            onChange={(e) => onChange("os", e.target.value)}
            disabled={osLocked}
          >
            <option value="">Select OS</option>
            {osOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Browser */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Browser</label>
          <select
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
            value={metadata.browser || ""}
            onChange={(e) => onChange("browser", e.target.value)}
            disabled={browserDisabled}
          >
            <option value="">
              {browserDisabled ? "Select OS first" : "Select browser"}
            </option>

            {browserOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Device Model (mobile only) */}
        {normalize(metadata.deviceType) === "mobile" && (
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Device Model</label>
            <select
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
              value={metadata.deviceModel || ""}
              onChange={(e) => onChange("deviceModel", e.target.value)}
              disabled={deviceModelDisabled}
            >
              <option value="">
                {deviceModelDisabled ? "Select OS first" : "Select device model"}
              </option>

              {deviceModelOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
