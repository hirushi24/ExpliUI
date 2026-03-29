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
  // Accept bare domains in the input field by defaulting them to https.
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(normalizeHttpUrl(value));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UrlEnterPage() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");

  // URL capture currently supports desktop comparisons on one selected OS at a time.
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

  // Browser choices are constrained by OS to avoid impossible environment combinations.
  const availableBrowsers = useMemo(() => {
    if (selectedOS === "windows") return WINDOWS_BROWSERS;
    if (selectedOS === "macos") return MAC_BROWSERS;
    return [];
  }, [selectedOS]);

  // Reset browser selections when the OS changes so stale combinations are not submitted.
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

      // The backend captures both requested environments and stores the resulting screenshots on the server.
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

      const res = await uploadApi.post("/predict/CaptureByUrl", payload, {
        headers: { "Content-Type": "application/json" },
      });
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
