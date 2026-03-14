// // import { useState } from "react";
// // import { PairListPanel } from "../components/upload/PairListPanel";
// // import { PairUploadPanel } from "../components/upload/PairUploadPanel";
// // import type { ScreenshotPair, EnvironmentMetadata } from "../types";
// // import { useNavigate } from "react-router-dom";
// // import { Button } from "../components/common/Button";
// // import { useSession } from "../context/SessionContext";
// // import { uploadApi } from "../api/clients";
// // import { fileToBase64 } from "../utils/fileUtils";
// // import type { UploadPairsPayload, PairPayload, ImagePayload } from "../types";

// // const DEFAULT_META: EnvironmentMetadata = {
// //   deviceType: "desktop",
// //   browser: "",
// //   os: "",
// //   deviceModel: ""
// // }; 

// // export default function UploadTest() {
// //   const navigate = useNavigate();
// //   const { sessionId } = useSession();
  
// //   const [pairs, setPairs] = useState<ScreenshotPair[]>([
// //     { id: 1, fileA: null, fileB: null, previewA: null, previewB: null, status: "empty", metaA: { ...DEFAULT_META }, metaB: { ...DEFAULT_META }, comparisonMode: "", stage: "draft" }
// //   ]);
// //   const [activeId, setActiveId] = useState(1);
// //   const [isUploading, setIsUploading] = useState(false);

// //   const activePair = pairs.find((p) => p.id === activeId)!;

// //   const handleAddPair = () => {
// //     const newId = Math.max(...pairs.map((p) => p.id)) + 1;
// //     setPairs([...pairs, { id: newId, fileA: null, fileB: null, previewA: null, previewB: null, status: "empty", metaA: { ...DEFAULT_META }, metaB: { ...DEFAULT_META }, comparisonMode: "", stage: "draft" }]);
// //     setActiveId(newId);
// //   };

// //   const handleComparisonModeChange = (mode: ScreenshotPair["comparisonMode"]) => {
// //   setPairs(pairs.map(p => (p.id === activeId ? { ...p, comparisonMode: mode, stage: "draft"} : p)));
// // };


// // const handleConfirmPair = () => {
// //     setPairs(pairs.map((p) => (p.id === activeId ? { ...p, stage: "confirmed" } : p)));
// //   };

// //   const handleEditPair = () => {
// //     // When user edits, unlock + require confirm again
// //     setPairs(pairs.map((p) => (p.id === activeId ? { ...p, stage: "draft" } : p)));
// //   };

// //   const handleUploadFile = (side: "A" | "B", file: File) => {
// //     const preview = URL.createObjectURL(file);
// //     setPairs(pairs.map(p => {
// //       if (p.id === activeId) {
// //         const updated = { ...p, [`file${side}`]: file, [`preview${side}`]: preview, stage: "draft" };
// //         if (updated.fileA && updated.fileB) updated.status = "ready";
// //         return updated;
// //       }
// //       return p;
// //     }));
// //   };

// //   const handleMetaChange = (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => {
// //     setPairs(pairs.map(p => {
// //       if (p.id === activeId) {
// //         const metaKey = side === "A" ? "metaA" : "metaB";
// //         return { ...p, [metaKey]: { ...p[metaKey], [key]: value }, stage: "draft" };
// //       }
// //       return p;
// //     }));
// //   };

// //   const handleRemove = (side: "A" | "B") => {
// //     setPairs(pairs.map(p => 
// //       p.id === activeId ? { ...p, [`file${side}`]: null, [`preview${side}`]: null, status: "empty", stage: "draft"} : p
// //     ));
// //   };

// //   // const handleSubmit = async () => {
// //   //   if (!sessionId) return alert("Session not initialized");

// //   //   setIsUploading(true);
// //   //   try {
// //   //     // 1. Upload Images
// //   //     const formData = new FormData();
// //   //     formData.append("session_id", sessionId);
      
// //   //     pairs.forEach((pair) => {
// //   //       if (pair.fileA && pair.fileB) {
// //   //         formData.append("images_a", pair.fileA);
// //   //         formData.append("images_b", pair.fileB);
// //   //       }
// //   //     });

// //   //     await uploadApi.post("/upload/pairs", formData);

// //   //     // 2. Save Metadata
// //   //     // (We will implement this in the next step, for now just navigate)
// //   //     navigate("/new-test/configure", { state: { pairs } });

// //   //   } catch (error) {
// //   //     console.error(error);
// //   //     alert("Upload failed. Check backend.");
// //   //   } finally {
// //   //     setIsUploading(false);
// //   //   }
// //   // };

// //   const generateFiveDigitId = () => {
// //   return Math.floor(10000 + Math.random() * 90000);
// // };

// //   const handleSubmit = async () => {
// //     // if (!sessionId) return alert("Session not initialized");

// //     // Validate that all pairs are ready
// //     // const readyPairs = pairs.filter(p => p.status === "ready");
// //     const readyPairs = pairs.filter(p => p.status === "ready" && p.stage === "confirmed");
// //     if (readyPairs.length === 0) {
// //       alert("Please upload at least one complete pair");
// //       return;
// //     }

// //     setIsUploading(true);
// //     try {
// //       // Build the payload
// //       const payload: UploadPairsPayload = {
// //         user_id: generateFiveDigitId(), 
// //         pair_list: []
// //       };

// //       // Process each pair
// //       let imageIdCounter = 1;
// //       for (const pair of readyPairs) {
// //         if (!pair.fileA || !pair.fileB) continue;

// //         // Convert files to base64
// //         const base64A = await fileToBase64(pair.fileA);
// //         const base64B = await fileToBase64(pair.fileB);

// //         // Create image objects
// //         const imageA: ImagePayload = {
// //           image_id: imageIdCounter++,
// //           image_name: pair.fileA.name, 
// //           image_base64: base64A,
// //           device_type: pair.metaA.deviceType,
// //           browser: pair.metaA.browser.toLowerCase(),
// //           os: pair.metaA.os.toLowerCase()
// //         };

// //         const imageB: ImagePayload = {
// //           image_id: imageIdCounter++,
// //           image_name: pair.fileB.name,
// //           image_base64: base64B,
// //           device_type: pair.metaB.deviceType,
// //           browser: pair.metaB.browser.toLowerCase(),
// //           os: pair.metaB.os.toLowerCase()
// //         };

// //         // Create pair object
// //         const pairPayload: PairPayload = {
// //           pair_id: pair.id,
// //           image_list: [imageA, imageB]
// //         };

// //         payload.pair_list.push(pairPayload);
// //       }

// //       console.log("Sending payload:", payload); 

// //       // Send to backend
// //       const response = await uploadApi.post("/predict/GetPredictResult", payload, {
// //         headers: {
// //           'Content-Type': 'application/json'
// //         }
// //       });


// //       // Navigate to next step
// //       navigate("/new-test/configure", { 
// //         state: {  
// //           pairs: readyPairs,
// //           uploadResponse: response.data
// //         } 
// //       });

// //     } catch (error: any) {
// //       console.error("Upload error:", error);
// //       alert(`Upload failed: ${error.response?.data?.message || error.message}`);
// //     } finally {
// //       setIsUploading(false);
// //     }
// //   };

// //   return (
// //     <div className="flex h-[calc(100vh-64px)]">
// //       <PairListPanel pairs={pairs} activePairId={activeId} onSelect={setActiveId} onAdd={handleAddPair} />

// //       <div className="flex-1 flex flex-col">
// //         <PairUploadPanel
// //           pair={activePair}
// //           onUpload={handleUploadFile}
// //           onRemove={handleRemove}
// //           onMetaChange={handleMetaChange}
// //           onComparisonModeChange={handleComparisonModeChange}
// //           onConfirm={handleConfirmPair}
// //           onEdit={handleEditPair}
// //         />

// //         <div className="p-4 border-t bg-white flex justify-end gap-4">
// //           <Button variant="secondary" onClick={() => navigate("/")}>
// //             Cancel
// //           </Button>
// //           <Button
// //             onClick={handleSubmit}
// //             disabled={pairs.some((p) => p.status !== "ready" || p.stage !== "confirmed") || isUploading}
// //           >
// //             {isUploading ? "Uploading..." : "Next Step"}
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // //   return (
// // //     <div className="flex h-[calc(100vh-64px)]">
// // //       <PairListPanel 
// // //         pairs={pairs} 
// // //         activePairId={activeId} 
// // //         onSelect={setActiveId} 
// // //         onAdd={handleAddPair} 
// // //       />
      
// // //       <div className="flex-1 flex flex-col">
// // //         <PairUploadPanel 
// // //           pair={activePair} 
// // //           onUpload={handleUploadFile} 
// // //           onRemove={handleRemove}
// // //           onMetaChange={handleMetaChange}
// // //           onComparisonModeChange={handleComparisonModeChange}
// // //         />
        
// // //         <div className="p-4 border-t bg-white flex justify-end gap-4">
// // //           <Button variant="secondary" onClick={() => navigate("/")}>Cancel</Button>
// // //           {/* <Button onClick={handleSubmit} disabled={pairs.some(p => p.status !== "ready") || isUploading}> */}
// // //             <Button
// // //               onClick={handleSubmit}
// // //               disabled={pairs.some(p => p.status !== "ready" || !p.comparisonMode) || isUploading}
// // //             >

// // //             {isUploading ? "Uploading..." : "Next Step"}
// // //           </Button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// import { useState } from "react";
// import { PairListPanel } from "../components/upload/PairListPanel";
// import { PairUploadPanel } from "../components/upload/PairUploadPanel";
// import type { ScreenshotPair, EnvironmentMetadata } from "../types";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/common/Button";
// import { uploadApi } from "../api/clients";
// import { fileToBase64 } from "../utils/fileUtils";
// // import type { UploadPairsPayload, PairPayload, ImagePayload } from "../types";

// const DEFAULT_META: EnvironmentMetadata = {
//   deviceType: "desktop",
//   browser: "",
//   os: "",
//   deviceModel: ""
// };

// export default function UploadTest() {
//   const navigate = useNavigate();

//   const [pairs, setPairs] = useState<ScreenshotPair[]>([
//     {
//       id: 1,
//       fileA: null,
//       fileB: null,
//       previewA: null,
//       previewB: null,
//       status: "empty",
//       metaA: { ...DEFAULT_META },
//       metaB: { ...DEFAULT_META },
//       comparisonMode: "",
//       stage: "draft",
//     },
//   ]);

//   const [activeId, setActiveId] = useState(1);
//   const [isUploading, setIsUploading] = useState(false);

//   const activePair = pairs.find((p) => p.id === activeId)!;

//   const handleAddPair = () => {
//     const newId = Math.max(...pairs.map((p) => p.id)) + 1;
//     setPairs([
//       ...pairs,
//       {
//         id: newId,
//         fileA: null,
//         fileB: null,
//         previewA: null,
//         previewB: null,
//         status: "empty",
//         metaA: { ...DEFAULT_META },
//         metaB: { ...DEFAULT_META },
//         comparisonMode: "",
//         stage: "draft",
//       },
//     ]);
//     setActiveId(newId);
//   };

//   // force deviceType based on selected comparison mode
//   const handleComparisonModeChange = (mode: ScreenshotPair["comparisonMode"]) => {
//     const forcedDeviceType = mode === "mobile-mobile" ? "mobile" : "desktop";

//     setPairs(
//       pairs.map((p) =>
//         p.id === activeId
//           ? {
//               ...p,
//               comparisonMode: mode,
//               stage: "draft",
//               metaA: {
//                 ...p.metaA,
//                 deviceType: forcedDeviceType,
//                 deviceModel: forcedDeviceType === "mobile" ? p.metaA.deviceModel : "",
//               },
//               metaB: {
//                 ...p.metaB,
//                 deviceType: forcedDeviceType,
//                 deviceModel: forcedDeviceType === "mobile" ? p.metaB.deviceModel : "",
//               },
//             }
//           : p
//       )
//     );
//   };

//   const handleConfirmPair = () => {
//     setPairs(pairs.map((p) => (p.id === activeId ? { ...p, stage: "confirmed" } : p)));
//   };

//   const handleEditPair = () => {
//     setPairs(pairs.map((p) => (p.id === activeId ? { ...p, stage: "draft" } : p)));
//   };

//   const handleUploadFile = (side: "A" | "B", file: File) => {
//     const preview = URL.createObjectURL(file);

//     setPairs(
//       pairs.map((p) => {
//         if (p.id === activeId) {
//           const updated: any = {
//             ...p,
//             [`file${side}`]: file,
//             [`preview${side}`]: preview,
//             stage: "draft",
//           };
//           if (updated.fileA && updated.fileB) updated.status = "ready";
//           return updated;
//         }
//         return p;
//       })
//     );
//   };

//   const handleMetaChange = (side: "A" | "B", key: keyof EnvironmentMetadata, value: string) => {
//     setPairs(
//       pairs.map((p) => {
//         if (p.id === activeId) {
//           const metaKey = side === "A" ? "metaA" : "metaB";
//           return { ...p, [metaKey]: { ...p[metaKey], [key]: value }, stage: "draft" };
//         }
//         return p;
//       })
//     );
//   };

//   const handleRemove = (side: "A" | "B") => {
//     setPairs(
//       pairs.map((p) =>
//         p.id === activeId
//           ? { ...p, [`file${side}`]: null, [`preview${side}`]: null, status: "empty", stage: "draft" }
//           : p
//       )
//     );
//   };


//   const handleSubmit = async () => {
//     const readyPairs = pairs.filter((p) => p.status === "ready" && p.stage === "confirmed");
//     if (readyPairs.length === 0) {
//       alert("Please upload at least one complete pair");
//       return;
//     }

//     setIsUploading(true);
//     try {
//       // const payload: UploadPairsPayload = {
//       //   type:1,
//       //   user_id: Number(localStorage.getItem("Id")),
//       //   pair_list: [],
//       // };
//       const userId = Number(localStorage.getItem("Id"));

//       const results = await Promise.all(
//         readyPairs.map(async (pair, i) => {
//           if (!pair.fileA || !pair.fileB) return null;

//           const base64A = await fileToBase64(pair.fileA);
//           const base64B = await fileToBase64(pair.fileB);

//           const payload = {
//             user_id: userId,
//             pair_id: pair.id ?? i,
//             image_list: [
//               {
//                 image_name: pair.fileA.name,
//                 image_base64: base64A,
//                 browser: pair.metaA.browser.toLowerCase(),
//                 os: pair.metaA.os.toLowerCase(),
//                 device_type: pair.metaA.deviceType,
//               },
//               {
//                 image_name: pair.fileB.name,
//                 image_base64: base64B,
//                 browser: pair.metaB.browser.toLowerCase(),
//                 os: pair.metaB.os.toLowerCase(),
//                 device_type: pair.metaB.deviceType,
//               },
//             ],
//           };


//       // let imageIdCounter = 1;
//       // for (const pair of readyPairs) {
//       //   if (!pair.fileA || !pair.fileB) continue;

//       //   const base64A = await fileToBase64(pair.fileA);
//       //   const base64B = await fileToBase64(pair.fileB);

//       //   const imageA: ImagePayload = {
//       //     image_id: imageIdCounter++,
//       //     image_name: pair.fileA.name,
//       //     image_base64: base64A,
//       //     device_type: pair.metaA.deviceType,
//       //     browser: pair.metaA.browser.toLowerCase(),
//       //     os: pair.metaA.os.toLowerCase(),
//       //   };

//       //   const imageB: ImagePayload = {
//       //     image_id: imageIdCounter++,
//       //     image_name: pair.fileB.name,
//       //     image_base64: base64B,
//       //     device_type: pair.metaB.deviceType,
//       //     browser: pair.metaB.browser.toLowerCase(),
//       //     os: pair.metaB.os.toLowerCase(),
//       //   };

//       //   const pairPayload: PairPayload = {
//       //     pair_id: pair.id,
//       //     image_list: [imageA, imageB],
//       //   };

//       //   payload.pair_list.push(pairPayload);
//       // }

//       // console.log("Sending payload:", payload);

//       // const response = await uploadApi.post("/predict/GetPredictResult", payload, {
//       //   headers: { "Content-Type": "application/json" },
//       // });
//       const response = await uploadApi.post("/predict/CompareRuleBased", payload, {
//             headers: { "Content-Type": "application/json" },
//           });

//           return response.data?.results;
//         })
//       );

//       const response = {
//         data: {
//           status: "success",
//           results: results.filter(Boolean),
//         },
//       };
      

//       navigate("/new-test/configure", {
//         state: {
//           pairs: readyPairs,
//           uploadResponse: response.data,
//         },
//       });
//     } catch (error: any) {
//       console.error("Upload error:", error);
//       alert(`Upload failed: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="flex h-[calc(100vh-64px)]">
//       <PairListPanel pairs={pairs} activePairId={activeId} onSelect={setActiveId} onAdd={handleAddPair} />

//       <div className="flex-1 flex flex-col">
//         <PairUploadPanel
//           pair={activePair}
//           onUpload={handleUploadFile}
//           onRemove={handleRemove}
//           onMetaChange={handleMetaChange}
//           onComparisonModeChange={handleComparisonModeChange}
//           onConfirm={handleConfirmPair}
//           onEdit={handleEditPair}
//         />

//         <div className="p-4 border-t bg-white flex justify-end gap-4">
//           <Button variant="secondary" onClick={() => navigate("/")}>
//             Cancel
//           </Button>

//           <Button
//             onClick={handleSubmit}
//             disabled={pairs.some((p) => p.status !== "ready" || p.stage !== "confirmed") || isUploading}
//           >
//             {isUploading ? "Uploading..." : "Next Step"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { PairListPanel } from "../components/upload/PairListPanel";
import { PairUploadPanel } from "../components/upload/PairUploadPanel";
import type { ScreenshotPair, EnvironmentMetadata } from "../types";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { uploadApi } from "../api/clients";
import { fileToBase64 } from "../utils/fileUtils";
// import type { UploadPairsPayload, PairPayload, ImagePayload } from "../types";

const DEFAULT_META: EnvironmentMetadata = {
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

      if (!shouldRetry || attempt === retries) throw error;

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

  // force deviceType based on selected comparison mode
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


  const handleSubmit = async () => {
    const readyPairs = pairs.filter((p) => p.status === "ready" && p.stage === "confirmed");
    if (readyPairs.length === 0) {
      alert("Please upload at least one complete pair");
      return;
    }

    setIsUploading(true);
    try {
      // const payload: UploadPairsPayload = {
      //   type:1,
      //   user_id: Number(localStorage.getItem("Id")),
      //   pair_list: [],
      // };
      const userId = Number(localStorage.getItem("Id"));

      const results: any[] = [];

      for (let i = 0; i < readyPairs.length; i++) {
        const pair = readyPairs[i];
        if (!pair.fileA || !pair.fileB) continue;

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

        if (i < readyPairs.length - 1) {
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
          pairs: readyPairs,
          uploadResponse: response.data,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      const status = error?.response?.status;
      const details = error?.response?.data?.detail || error?.response?.data?.message || error.message;
      const hint = status === 429
        ? "Server is rate-limiting requests. Please retry in a few seconds."
        : "If this keeps happening, check backend logs/CORS config.";
      alert(`Upload failed (${status || "network"}): ${details}. ${hint}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <PairListPanel pairs={pairs} activePairId={activeId} onSelect={setActiveId} onAdd={handleAddPair} />

      <div className="flex-1 flex flex-col">
        <PairUploadPanel
          pair={activePair}
          onUpload={handleUploadFile}
          onRemove={handleRemove}
          onMetaChange={handleMetaChange}
          onComparisonModeChange={handleComparisonModeChange}
          onConfirm={handleConfirmPair}
          onEdit={handleEditPair}
        />

        <div className="p-4 border-t bg-white flex justify-end gap-4">
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={pairs.some((p) => p.status !== "ready" || p.stage !== "confirmed") || isUploading}
          >
            {isUploading ? "Uploading..." : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  );
}