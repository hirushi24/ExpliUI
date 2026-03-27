export interface DetectedIssue {
  id: string;
  pair_id?: number;
  issue_type: string; // "layout", "typography", "visual", "component"
   severity: "critical" | "high" | "medium" | "low";
  category: string; // "flexbox_gap", "font_weight_rendering", etc.
  
  detected_between: {
    environment_a: {
      browser: string;
      os: string;
      device_type: string;
    };
    environment_b: {
      browser: string;
      os: string;
      device_type: string;
    };
  };
  
  description: string;
  explanation: string;
  root_cause: string;
  
  css_properties: string[];
  suggested_fix: string;
  caniuse_reference?: string;
  
  evidence: {
    screenshot_a_url: string;
    screenshot_b_url: string;
    heatmap_url?: string;
    bounding_box?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  
  visual_impact: string;
  occurrence_frequency: string;
}

export interface TestResults {
  session_id: string;
  test_type: "upload" | "url";
  comparison_mode: "desktop_vs_desktop" | "mobile_vs_mobile" | "desktop_vs_mobile";
  
  summary: {
    total_pairs: number;
    issues_detected: number;
    no_issues: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
  };
  
  issues: DetectedIssue[];
  
  test_metadata: {
    url?: string;
    created_at: string;
    completed_at: string;
    processing_time_seconds: number;
  };
}
