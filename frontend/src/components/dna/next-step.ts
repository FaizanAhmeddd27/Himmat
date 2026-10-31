import type { Recommendation, ReviewItem } from "@/lib/types";

/** Where a recommendation leads. */
export function recommendationHref(rec: Recommendation): string {
  if (rec.kind === "recovery" || rec.target?.startsWith("recovery_")) return `/recovery/${rec.target}`;
  if (rec.kind === "mastery") return `/simulations/${rec.target}?mode=mastery`;
  return `/simulations/${rec.target}`;
}

export function reviewHref(review: ReviewItem): string {
  return `/simulations/${review.scenario_id}${review.kind === "mastery" ? "?mode=mastery" : ""}`;
}
