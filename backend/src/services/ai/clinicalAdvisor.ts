import { Tooth } from "../../types/dentalChart.js";

/**
 * Clinical Advisor Service
 * Analyzes dental chart data and provides proactive clinical suggestions.
 */
export function analyzeDentalChart(teeth: Tooth[]) {
  const issues = teeth.filter(t => t.condition !== "HEALTHY" && t.condition !== "MISSING");
  
  const suggestions = [];

  // 1. Identify multiple decays in the same quadrant
  const decayTeeth = issues.filter(t => t.condition === "DECAY");
  if (decayTeeth.length > 3) {
    suggestions.push({
      type: "URGENT",
      message: "Multiple active caries detected. Prioritize comprehensive prophylaxis and fluoride application."
    });
  }

  // 2. Identify missing teeth for potential implants
  const missingTeeth = teeth.filter(t => t.condition === "MISSING" || t.condition === "EXTRACTED");
  if (missingTeeth.length > 0) {
    suggestions.push({
      type: "OPPORTUNITY",
      message: `${missingTeeth.length} missing units identified. Suggest dental implant consultation or bridge planning.`
    });
  }

  // 3. Identify Root Canal teeth without Crowns
  const rctTeeth = issues.filter(t => t.condition === "ROOT_CANAL");
  // Simple heuristic: if it has RCT but no CROWN condition (this is simplified as a tooth has 1 condition in current schema)
  // In a real app, we'd check if a crown was ever placed.
  if (rctTeeth.length > 0) {
    suggestions.push({
      type: "PREVENTIVE",
      message: "Post-endodontic teeth detected. Recommend porcelain crowns to prevent fracture."
    });
  }

  return suggestions;
}
