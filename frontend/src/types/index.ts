// export interface ScreenshotPair {
//   id: number;
//   fileA: File | null;
//   fileB: File | null;
//   previewA: string | null;
//   previewB: string | null;
//   status: "empty" | "ready" | "uploaded";
// }

// // Define what metadata looks like
// export interface EnvironmentMetadata {
//   deviceType: "desktop" | "mobile";
//   browser: string;
//   os: string;
//   deviceModel?: string; // only for mobile
// }

// // Add metadata fields to ScreenshotPair
// export interface ScreenshotPair {
//   id: number;
  
//   // File data 
//   fileA: File | null;
//   fileB: File | null;
  
//   // Preview URLs
//   previewA: string | null;
//   previewB: string | null;
  
//   // Environment Metadata (This fixes the error)
//   metaA: EnvironmentMetadata;
//   metaB: EnvironmentMetadata;
  
//   status: "empty" | "ready" | "uploaded";
// }


// export type ComparisonMode = "desktop-desktop" | "mobile-mobile" | "desktop-mobile" | "";

// export interface ScreenshotPair {
//   id: number;
//   fileA: File | null;
//   fileB: File | null;
//   previewA: string | null;
//   previewB: string | null;

//   metaA: EnvironmentMetadata;
//   metaB: EnvironmentMetadata;

//   comparisonMode: ComparisonMode;

//   status: "empty" | "ready" | "uploaded";
// }


export interface EnvironmentMetadata {
  deviceType: "desktop" | "mobile";
  browser: string;
  os: string;
  deviceModel?: string;
}

export type ComparisonMode = "desktop-desktop" | "mobile-mobile" | "";

export interface ScreenshotPair {
  id: number;

  fileA: File | null;
  fileB: File | null;

  previewA: string | null;
  previewB: string | null;

  metaA: EnvironmentMetadata;
  metaB: EnvironmentMetadata;

  comparisonMode: ComparisonMode;

  stage: string | null;

  status: "empty" | "ready" | "uploaded";
}
