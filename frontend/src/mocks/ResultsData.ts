import type { TestResults } from "../types/Results";

export const mockResults: TestResults = {
  session_id: "sess_abc123",
  test_type: "upload",

  comparison_mode: "desktop_vs_desktop",

  summary: {
    total_pairs: 6,
    issues_detected: 9,
    no_issues: 3,
    high_severity: 3,
    medium_severity: 4,
    low_severity: 2,
  },

  issues: [
    {
      id: "issue_001",

      // issue_type should be one of: layout / typography / visual / component
      issue_type: "layout",
      severity: "high",

      // fine-grained category (your taxonomy hint)
      category: "flexbox_gap",

      detected_between: {
        environment_a: {
          browser: "Chrome",
          os: "Windows",
          device_type: "desktop",
        },
        environment_b: {
          browser: "Safari",
          os: "macOS",
          device_type: "desktop",
        },
      },

      description: "Flex items have inconsistent spacing between them",
      explanation:
        "The CSS 'gap' property in flexbox is not supported in older Safari versions. Chrome renders the gap correctly, but Safari may fall back to no spacing.",
      root_cause: "flexbox_gap_property_support",

      css_properties: ["gap", "display: flex"],
      suggested_fix:
        "Use margins as a fallback: .flex-item { margin-right: 20px; } .flex-item:last-child { margin-right: 0; }",
      caniuse_reference: "https://caniuse.com/flexbox-gap",

      evidence: {
        screenshot_a_url: "/mock/screenshot_a.png",
        screenshot_b_url: "/mock/screenshot_b.png",
        heatmap_url: "/mock/heatmap.png",
        bounding_box: {
          x: 100,
          y: 200,
          width: 400,
          height: 60,
        },
      },

      visual_impact: "spacing_difference",
      occurrence_frequency: "very_common",
    },

    {
      id: "issue_002",
      issue_type: "visual",
      severity: "medium",
      category: "box_shadow",

      detected_between: {
        environment_a: {
          browser: "Firefox",
          os: "Windows",
          device_type: "desktop",
        },
        environment_b: {
          browser: "Chrome",
          os: "Windows",
          device_type: "desktop",
        },
      },

      description: "Button shadow appears darker and more spread out",
      explanation:
        "Different shadow blur/spread rendering between browsers can cause a heavier shadow appearance.",
      root_cause: "box_shadow_rendering_difference",

      css_properties: ["box-shadow"],
      suggested_fix:
        "Reduce shadow spread or provide browser-tested shadow presets for consistent appearance.",
      caniuse_reference: "https://caniuse.com/css-boxshadow",

      evidence: {
        screenshot_a_url: "/mock/screenshot_a.png",
        screenshot_b_url: "/mock/screenshot_b.png",
        heatmap_url: "/mock/heatmap.png",
      },

      visual_impact: "shadow_difference",
      occurrence_frequency: "common",
    },
  ],

  test_metadata: {
    url: "https://example.com",
    created_at: "2026-01-29T10:00:00Z",
    completed_at: "2026-01-29T10:05:30Z",
    processing_time_seconds: 330,
  },
};
