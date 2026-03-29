import { useState } from "react";
import { PairListPanel } from "../components/upload/PairListPanel";
import { PairUploadPanel } from "../components/upload/PairUploadPanel";
import type { ScreenshotPair, EnvironmentMetadata } from "../types";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { uploadApi } from "../api/clients";
import { fileToBase64 } from "../utils/fileUtils";
import AnalysisProgressScreen from "../components/upload/AnalysisProgressScreen";

const DEFAULT_META: EnvironmentMetadata = {
  // Default blank metadata keeps newly-added pairs valid before the user fills in environment details.
  deviceType: "desktop",
  browser: "",
  os: "",
  deviceModel: ""
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const postCompareRuleBasedWithRetry = async (payload: any, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await uploadApi.post("/predict/CompareRuleBased", payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const retryAfterHeader = error?.response?.headers?.["retry-after"];
      const retryAfterSeconds = Number(retryAfterHeader);
      const shouldRetry = status === 429 || status === 500;

      // Let temporary rate-limit or server-capacity spikes settle before failing the whole batch.
      if (attempt === retries) {
        throw error;
      }

      if (!shouldRetry) throw error;

      const backoffMs = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000
        : 700 * (attempt + 1);

      await delay(backoffMs);
    }
  }

  throw new Error("Failed to upload pair after retries");
};

export default function UploadTest() {
  const navigate = useNavigate();

  const [pairs, setPairs] = useState<ScreenshotPair[]>([
    {
      id: 1,
      fileA: null,
      fileB: null,
      previewA: null,
      previewB: null,
      status: "empty",
      metaA: { ...DEFAULT_META },
      metaB: { ...DEFAULT_META },
      comparisonMode: "",
      stage: "draft",
    },
  ]);

  const [activeId, setActiveId] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // The right-hand panel always edits the currently selected pair from the left sidebar.
  const activePair = pairs.find((p) => p.id === activeId)!;

  const handleAddPair = () => {
    const newId = Math.max(...pairs.map((p) => p.id)) + 1;
    setPairs([
      ...pairs,
      {
        id: newId,
        fileA: null,
        fileB: null,
        previewA: null,
        previewB: null,
        status: "empty",
        metaA: { ...DEFAULT_META },
        metaB: { ...DEFAULT_META },
        comparisonMode: "",
        stage: "draft",
      },
    ]);
    setActiveId(newId);
  };

  // Keep metadata aligned with the comparison mode so desktop/mobile requests stay internally consistent.
  const handleComparisonModeChange = (mode: ScreenshotPair["comparisonMode"]) => {
    const forcedDeviceType = mode === "mobile-mobile" ? "mobile" : "desktop";

    setPairs(
      pairs.map((p) =>
        p.id === activeId
          ? {
              ...p,
              comparisonMode: mode,
              stage: "draft",
              metaA: {
                ...p.metaA,
                deviceType: forcedDeviceType,
                deviceModel: forcedDeviceType === "mobile" ? p.metaA.deviceModel : "",
              },
              metaB: {
                ...p.metaB,
                deviceType: forcedDeviceType,
                deviceModel: forcedDeviceType === "mobile" ? p.metaB.deviceModel : "",
              },
            }
          : p
      )
    );
  };

  const handleConfirmPair = () => {
    setPairs(pairs.map((p) => (p.id === activeId ? { ...p, stage: "confirmed" } : p)));
  };

  const handleEditPair = () => {
    setPairs(pairs.map((p) => (p.id === activeId ? { ...p, stage: "draft" } : p)));
  };

  const handleUploadFile = (side: "A" | "B", file: File) => {
    const preview = URL.createObjectURL(file);

    setPairs(
      pairs.map((p) => {
        if (p.id === activeId) {
          // Update the chosen side in place and recalculate readiness once both files exist.
          const updated: any = {
            ...p,
            [`file${side}`]: file,
            [`preview${side}`]: preview,
            stage: "draft",
          };
          if (updated.fileA && updated.fileB) updated.status = "ready";
          return updated;
        }
        return p;
      })
    );
  };

  const handleMetaChange = (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => {
    setPairs(
      pairs.map((p) => {
        if (p.id === activeId) {
          const metaKey = side === "A" ? "metaA" : "metaB";
          return { ...p, [metaKey]: { ...p[metaKey], [key]: value }, stage: "draft" };
        }
        return p;
      })
    );
  };

  const handleRemove = (side: "A" | "B") => {
    setPairs(
      pairs.map((p) =>
        p.id === activeId
          ? { ...p, [`file${side}`]: null, [`preview${side}`]: null, status: "empty", stage: "draft" }
          : p
      )
    );
  };

  // Submission only includes pairs the user explicitly confirmed after both screenshots were provided.
  const confirmedReadyPairs = pairs.filter((p) => p.status === "ready" && p.stage === "confirmed");
  const hasInProgressPairs = pairs.some((p) => {
    const hasAnyUploads = Boolean(p.fileA || p.fileB || p.previewA || p.previewB);
    return hasAnyUploads && (p.status !== "ready" || p.stage !== "confirmed");
  });
  const canProceedToNextStep = confirmedReadyPairs.length > 0 && !hasInProgressPairs && !isUploading;


  const handleSubmit = async () => {
     if (confirmedReadyPairs.length === 0) {
      alert("Please upload at least one complete pair");
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(5);
    try {
      const userId = Number(localStorage.getItem("Id"));

      const results: any[] = [];

      for (let i = 0; i < confirmedReadyPairs.length; i++) {
        const pair = confirmedReadyPairs[i];
        if (!pair.fileA || !pair.fileB) continue;

        // The backend accepts screenshots as JSON payloads, so files are converted to base64 before upload.
        const base64A = await fileToBase64(pair.fileA);
        const base64B = await fileToBase64(pair.fileB);

        const payload = {
          user_id: userId,
          pair_id: pair.id ?? i,
          image_list: [
            {
              image_name: pair.fileA.name,
              image_base64: base64A,
              browser: pair.metaA.browser.toLowerCase(),
              os: pair.metaA.os.toLowerCase(),
              device_type: pair.metaA.deviceType,
            },
            {
              image_name: pair.fileB.name,
              image_base64: base64B,
              browser: pair.metaB.browser.toLowerCase(),
              os: pair.metaB.os.toLowerCase(),
              device_type: pair.metaB.deviceType,
            },
          ],
        };

        const response = await postCompareRuleBasedWithRetry(payload);
        results.push(response.data?.results);
        // Progress is tracked per confirmed pair because each request is processed sequentially.
        setUploadProgress(((i + 1) / confirmedReadyPairs.length) * 100);

        if (i < confirmedReadyPairs.length - 1) {
          await delay(250);
        }
      }

      const response = {
        data: {
          status: "success",
          results: results.filter(Boolean),
        },
      };
      

      navigate("/new-test/configure", {
        state: {
          pairs: confirmedReadyPairs,
          uploadResponse: response.data,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage("Resources insufficient please try again later");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <PairListPanel pairs={pairs} activePairId={activeId} onSelect={setActiveId} onAdd={handleAddPair} />

      {/* <Toaster /> */}
      {errorMessage ? (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex-1 flex flex-col">
        {isUploading ? (
          <AnalysisProgressScreen progress={uploadProgress} totalPairs={confirmedReadyPairs.length} isOpen={isUploading} />
        ) : (
          <PairUploadPanel
            pair={activePair}
            onUpload={handleUploadFile}
            onRemove={handleRemove}
            onMetaChange={handleMetaChange}
            onComparisonModeChange={handleComparisonModeChange}
            onConfirm={handleConfirmPair}
            onEdit={handleEditPair}
          />
        )}

        <div className="p-4 border-t bg-white flex justify-end gap-4">
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!canProceedToNextStep}
          >
            {isUploading ? "Uploading..." : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  );
}
