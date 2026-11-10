// lib/categories.js
//
// Single source of truth for the High Handicap category cutoff.
// Players with hcp >= HIGH_HCP_THRESHOLD fall into "Men High Handicap" /
// "Women High Handicap"; everyone below it is "Men" / "Women".
//
// History: the cutoff was 20 until Nov 2026, when it moved to 15 to match
// the /longest-drive-high-handicap page and the player profile pages.
//
// Plain ES module with no dependencies, so it works in both the Next.js
// pages and the edge-runtime OG image routes.

export const HIGH_HCP_THRESHOLD = 15;
