// import { useLocation, useNavigate } from "react-router-dom";
// import { ArrowLeft, Play } from "lucide-react";
// import { Button } from "../components/common/Button";

// export default function UrlPreviewPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const state = location.state as any;
//   const url = state?.url || "";
//   const sessionId = state?.sessionId || "demo";
//   const comparisonMode = state?.comparisonMode || "desktop_vs_desktop";
//   const pairs = state?.pairs || [];

//   const firstPair = pairs[0];

//   const handleStartAnalysis = () => {
//     // Frontend-only: send what Results expects
//     const uploadResponse = {
//       status: "success",
//       message: "Demo URL capture complete.",
//       results: [
//         {
//           pair_id: 1,
//           image1: firstPair?.screenshotAUrl || "/mock/screenshot_a.png",
//           image2: firstPair?.screenshotBUrl || "/mock/screenshot_b.png",
//           prediction: {
//             bug_probability: 0.3,
//             is_bug: false,
//             bug_type: null,
//             confidence: null,
//           },
//         },
//       ],
//     };

//     navigate(`/results/demo`, {
//       state: {
//         pairs: [
//           {
//             id: 1,
//             metaA: firstPair?.envA,
//             metaB: firstPair?.envB,
//             comparisonMode: "desktop-desktop",
//             stage: "confirmed",
//           },
//         ],
//         uploadResponse,
//       },
//     });
//   };

//   return (
//     <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
//       <div className="max-w-6xl mx-auto p-8">
//         <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Captured Screenshots</h1>
//             <p className="text-slate-500 mt-1">
//               URL: <span className="font-medium text-slate-700">{url}</span>
//             </p>
//           </div>

//           <Button variant="secondary" onClick={() => navigate(-1)} className="flex items-center gap-2">
//             <ArrowLeft className="w-4 h-4" />
//             Back
//           </Button>
//         </div>

//         {/* Preview */}
//         <div className="bg-white border rounded-xl p-6 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h2 className="font-semibold text-slate-800">Desktop vs Desktop</h2>
//               <p className="text-sm text-slate-500">Session: {sessionId}</p>
//             </div>
//           </div>

//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <h3 className="font-semibold text-slate-700 mb-2">Environment A</h3>
//               <div className="rounded-lg border bg-slate-50 overflow-hidden">
//                 <img
//                   src={firstPair?.screenshotAUrl || "/mock/screenshot_a.png"}
//                   alt="Screenshot A"
//                   className="w-full h-auto"
//                 />
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 {firstPair?.envA?.browser} • {firstPair?.envA?.os}
//               </p>
//             </div>

//             <div>
//               <h3 className="font-semibold text-slate-700 mb-2">Environment B</h3>
//               <div className="rounded-lg border bg-slate-50 overflow-hidden">
//                 <img
//                   src={firstPair?.screenshotBUrl || "/mock/screenshot_b.png"}
//                   alt="Screenshot B"
//                   className="w-full h-auto"
//                 />
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 {firstPair?.envB?.browser} • {firstPair?.envB?.os}
//               </p>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end">
//             <Button onClick={handleStartAnalysis} className="flex items-center gap-2">
//               <Play className="w-5 h-5" />
//               Start Analysis
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "../components/common/Button";
import { uploadApi } from "../api/clients"; 

export default function UrlPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as any;

  const url = state?.url || "";
  const sessionId = state?.sessionId || "demo"; 
  const pairId = state?.pairId || 1;

  // from UrlEnterPage navigate()
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
  // const screenshotAPath = imgA?.image_path;
  // const screenshotBPath = imgB?.image_path;
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

//   const handleStartAnalysis = async () => {
//   try {
//     setIsAnalyzing(true);

//     const payload = {
//       // type:2,
//       user_id: Number(localStorage.getItem("Id")),
//       // pair_list: [
//        pair_id: pairId,
//       image_list: [
//         {
//           // pair_id: pairId,
//           // image_list: [
//           //   {
//           //     image_id: 1,
//           //     image_name: imgA?.image_url || "url_capture_A.png",
//           //     image_base64: screenshotAPath, 
//           //     device_type: "desktop",
//           //     browser: (envA?.browser || "").toLowerCase(),
//           //     os: (envA?.os || "").toLowerCase(),
//           //   },
//           //   {
//           //     image_id: 2,
//           //     image_name: imgB?.image_url || "url_capture_B.png",
//           //     image_base64: screenshotBPath, 
//           //     device_type: "desktop",
//           //     browser: (envB?.browser || "").toLowerCase(),
//           //     os: (envB?.os || "").toLowerCase(),
//           //   },
//           // ],
//           image_name: imgA?.image_name || "url_capture_A.png",
//           image_base64: screenshotAPath,
//         },
//         {
//           image_name: imgB?.image_name || "url_capture_B.png",
//           image_base64: screenshotBPath,
//         },
//       ],
//     };

//     // console.log("Sending GetPredictResult payload (URL flow):", payload);
//     console.log("Sending CompareRuleBased payload (URL flow):", payload);

//     // const response = await uploadApi.post("/predict/GetPredictResult", payload, {
//     const response = await uploadApi.post("/predict/CompareRuleBased", payload, {
//       headers: { "Content-Type": "application/json" },
//     });

//     console.log(response)

//     navigate("/results/demo", {
//       state: {
//         pairs: [
//           {
//             id: pairId,
//             metaA: envA,
//             metaB: envB,
//             comparisonMode: "desktop-desktop",
//             stage: "confirmed",
//           },
//         ],
//         // uploadResponse: response.data,
//         uploadResponse: {
//           ...response.data,
//           results: [response.data?.results],
//         },
//       },
//     });
//   } catch (err: any) {
//     console.error("Start analysis error:", err);
//     console.log("Backend detail:", err?.response?.data);
//     alert(JSON.stringify(err?.response?.data, null, 2));
//   } finally {
//     setIsAnalyzing(false);
//   }
// };


const handleStartAnalysis = async () => {
  try {
    setIsAnalyzing(true);

    let base64A = "";
    let base64B = "";

    // Optimization: If we have image_name, the backend already has the file.
    // We only need to convert to base64 if we DON'T have a server-side filename.
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
