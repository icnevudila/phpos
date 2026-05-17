/**
 * AI Vision Service (Mock for Phase 1.1)
 * Simulates Gemini Vision analysis for dental X-rays.
 */

export interface AiVisionFinding {
  label: string;
  confidence: number;
  description: string;
  type: "CARIES" | "BONE_LOSS" | "IMPACTED" | "NORMAL";
}

export interface AiVisionResponse {
  findings: AiVisionFinding[];
  summary: string;
}

export async function analyzeXray(mediaId: string): Promise<AiVisionResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Randomized mock response for demonstration
  return {
    summary: "AI analysis suggests localized interproximal caries and moderate bone loss in the upper right quadrant.",
    findings: [
      {
        label: "Interproximal Caries",
        confidence: 0.94,
        description: "Potential decay detected between #14 and #15.",
        type: "CARIES"
      },
      {
        label: "Alveolar Bone Loss",
        confidence: 0.88,
        description: "Localized 2mm bone loss observed around #16.",
        type: "BONE_LOSS"
      },
      {
        label: "Impacted Third Molar",
        confidence: 0.99,
        description: "#32 is mesio-angularly impacted.",
        type: "IMPACTED"
      }
    ]
  };
}
