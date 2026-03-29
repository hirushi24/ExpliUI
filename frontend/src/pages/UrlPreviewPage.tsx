import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "../components/common/Button";
import { uploadApi } from "../api/clients"; 

// Preview step for URL-captured screenshots before they are sent into the comparison pipeline.
export default function UrlPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as any;

  const url = state?.url || "";
  const sessionId = state?.sessionId || "demo"; 
  const pairId = state?.pairId || 1;

  // State is passed from the URL capture step, but fallbacks keep the screen usable after refreshes.
  const captured = state?.captured || null;
  const results = captured?.results || [];

  // two images from CaptureByUrl response
  const imgA = results?.[0] || null;
  const imgB = results?.[1] || null;

  // fallback (older flow)
  const pairs = state?.pairs || [];
  const firstPair = pairs?.[0] || null;

  // final URLs for screenshots
  const screenshotAUrl =
    imgA?.image_url || firstPair?.screenshotAUrl || "/mock/screenshot_a.png";
  const screenshotBUrl =
    imgB?.image_url || firstPair?.screenshotBUrl || "/mock/screenshot_b.png";
  const envA = imgA
    ? { deviceType: "desktop", browser: imgA.browser, os: imgA.os }
    : firstPair?.envA;

  const envB = imgB
    ? { deviceType: "desktop", browser: imgB.browser, os: imgB.os }
    : firstPair?.envB;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image for base64 conversion: ${url}`);
  }

  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result)); // data:image/png;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


const handleStartAnalysis = async () => {
  try {
    setIsAnalyzing(true);

    let base64A = "";
    let base64B = "";

    // Reuse server-side files when possible to avoid fetching and re-encoding captured screenshots in the browser.
    if (!imgA?.image_name || !imgB?.image_name) {
      const [b64A, b64B] = await Promise.all([
        imageUrlToBase64(screenshotAUrl),
        imageUrlToBase64(screenshotBUrl),
      ]);
      base64A = b64A;
      base64B = b64B;
    }

    const payload = {
      user_id: Number(localStorage.getItem("Id")),
      pair_id: pairId,
      image_list: [
        {
          image_name: imgA?.image_name || "url_capture_A.png",
          image_base64: base64A || null,
          browser: (imgA?.browser || "").toLowerCase(),
          os: (imgA?.os || "").toLowerCase(),
          device_type: "desktop",
        },
        {
          image_name: imgB?.image_name || "url_capture_B.png",
          image_base64: base64B || null,
          browser: (imgB?.browser || "").toLowerCase(),
          os: (imgB?.os || "").toLowerCase(),
          device_type: "desktop",
        },
      ],
    };

    console.log("Sending CompareRuleBased payload (URL flow):", {
      ...payload,
      image_list: payload.image_list.map((img) => ({
        ...img,
        image_base64: img.image_base64 ? `${img.image_base64.slice(0, 30)}...` : "SKIPPED (already on server)",
      })),
    });

    const response = await uploadApi.post("/predict/CompareRuleBased", payload, {
      headers: { "Content-Type": "application/json" },
    });

    navigate("/results/demo", {
      // Wrap the single pair in an array so the results page can reuse the same normalization path as uploads.
      state: {
        pairs: [
          {
            id: pairId,
            metaA: envA,
            metaB: envB,
            comparisonMode: "desktop-desktop",
            stage: "confirmed",
          },
        ],
        uploadResponse: {
          ...response.data,
          results: [response.data?.results],
        },
      },
    });
  } catch (err: any) {
    console.error("Start analysis error:", err);
    console.log("Backend detail:", err?.response?.data);
    alert(JSON.stringify(err?.response?.data, null, 2));
  } finally {
    setIsAnalyzing(false);
  }
};


  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Captured Screenshots</h1>
            <p className="text-slate-500 mt-1">
              URL: <span className="font-medium text-slate-700">{url}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Session: {sessionId}</p>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm"> 
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Environment A</h3>
              <div className="rounded-lg border bg-slate-50 overflow-hidden">
                <img src={screenshotAUrl} alt="Screenshot A" className="w-full h-auto" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {envA?.browser} • {envA?.os}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Environment B</h3>
              <div className="rounded-lg border bg-slate-50 overflow-hidden">
                <img src={screenshotBUrl} alt="Screenshot B" className="w-full h-auto" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {envB?.browser} • {envB?.os}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {isAnalyzing ? "Analyzing..." : "Start Analysis"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
