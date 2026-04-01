import { useEffect } from "react";
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

function normalize(v?: string) {
  // Normalize dropdown values so comparisons stay stable even if labels vary in casing.
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
  const baselineBrowser = normalize(baselineMeta?.browser);
  const deviceTypeLocked = !!disabled || !!lockDeviceType || isTest;
  const osLocked = !!disabled || isTest;
  const osOptions =
    comparisonMode === "mobile-mobile"
      ? MOBILE_OS
      : comparisonMode === "desktop-desktop"
      ? DESKTOP_OS
      : deviceTypeValue === "mobile"
      ? MOBILE_OS
      : DESKTOP_OS;

  // The test-side browser list is derived from the baseline OS because the two screenshots must stay comparable.
  const effectiveOsForBrowser = isTest ? baselineOs : osValue;

  const browserOptions =
    deviceTypeValue === "mobile"
      ? MOBILE_BROWSERS_BY_OS[effectiveOsForBrowser] || []
      : DESKTOP_BROWSERS_BY_OS[effectiveOsForBrowser] || [];

  // In test mode, hide the baseline browser so users must choose a different target browser.
  const filteredBrowserOptions = isTest
    ? browserOptions.filter((option) => normalize(option.value) !== baselineBrowser)
    : browserOptions;

  // Browser choice stays disabled until the relevant OS is known.
  const browserDisabled =
    !!disabled || (isTest ? !baselineOs : !osValue);

    useEffect(() => {
    if (isTest && normalize(metadata.browser) === baselineBrowser) {
      onChange("browser", "");
    }
  }, [isTest, metadata.browser, baselineBrowser, onChange]);

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
            {/* <option value="">Select OS</option> */}
            <option value="" disabled hidden>
              Select OS
            </option>
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
            {/* <option value=""> */}
             <option value="" disabled hidden>
              {browserDisabled ? "Select OS first" : "Select browser"}
            </option>

            {/* {browserOptions.map((b) => ( */}
            {filteredBrowserOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
