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
