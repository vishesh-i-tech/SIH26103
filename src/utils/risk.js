import { tokens } from "../styles/tokens";

/**
 * Returns color hex for risk score threshold
 * @param {number} score - 0 to 100 risk score
 * @returns {string} color hex
 */
export function riskTone(score) {
  if (score >= 70) return tokens.bad;    // #A6402F
  if (score >= 45) return tokens.warn;   // #B07C22
  return tokens.good;                   // #3E7A52
}

/**
 * Returns light tint background for risk score
 * @param {number} score - 0 to 100 risk score
 * @returns {string} background tint hex
 */
export function riskBg(score) {
  if (score >= 70) return tokens.badBg;   // #F7E7E3
  if (score >= 45) return tokens.warnBg;  // #FBF1E0
  return tokens.goodBg;                  // #EAF2EC
}

/**
 * Returns risk category label
 * @param {number} score - 0 to 100 risk score
 * @returns {'Critical' | 'Watch' | 'Stable'}
 */
export function riskLabel(score) {
  if (score >= 70) return "Critical";
  if (score >= 45) return "Watch";
  return "Stable";
}

/**
 * Format currency in Indian Crore (₹X Cr)
 * @param {number} amount - in Crore
 * @returns {string}
 */
export function formatINR(amount) {
  if (amount == null) return "₹0 Cr";
  return `₹${Number(amount).toLocaleString("en-IN")} Cr`;
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 0) {
  if (value == null) return "0%";
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Calculate claimed vs expected billing variance
 * @param {number} claimed
 * @param {number} expected
 * @returns {{ percent: string, isAnomaly: boolean, sign: string }}
 */
export function calculateVariance(claimed, expected) {
  if (!expected || expected === 0) return { percent: "0.0", isAnomaly: false, sign: "+" };
  const variance = ((claimed - expected) / expected) * 100;
  return {
    percent: Math.abs(variance).toFixed(1),
    isAnomaly: variance > 10,
    sign: variance > 0 ? "+" : "-",
    raw: variance,
  };
}
