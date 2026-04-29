import { toSnakeCase } from "./utils/to-snake-case";

export type FindingType = "success" | "warning" | "error";

export interface Finding {
  type: FindingType;
  message: string;
  param?: string;
}

export interface HealthReport {
  score: number;
  status: "healthy" | "warning" | "error";
  findings: Finding[];
  fixedUrl: string;
}

const REQUIRED_PARAMS = ["utm_source", "utm_medium", "utm_campaign"];
const OPTIONAL_PARAMS = ["utm_term", "utm_content"];

// Regex for common dynamic platform macros (e.g. {{ad_id}}, {campaignid}, [timestamp])
const DYNAMIC_MACRO_REGEX = /^(\{\{.*\}\}|\{.*\}|\[.*\])$/;

/**
 * Analyzes a URL for UTM tracking best practices.
 */
export function analyzeUrl(url: string): HealthReport {
  const findings: Finding[] = [];
  let score = 100;
  let fixedUrl = url;

  if (!url) {
    return {
      score: 0,
      status: "error",
      findings: [{ type: "error", message: "No URL provided" }],
      fixedUrl: "",
    };
  }

  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;

    // 1. Check Required Params
    const missing = REQUIRED_PARAMS.filter((p) => !params.has(p));
    if (missing.length > 0) {
      missing.forEach((p) => {
        findings.push({ type: "error", message: `Missing required parameter: ${p}`, param: p });
        score -= 25;
      });
    }

    // 2. Analyze individual parameters
    const allParams = [...REQUIRED_PARAMS, ...OPTIONAL_PARAMS];
    let hasAnyUtm = false;

    allParams.forEach((p) => {
      const val = params.get(p);
      if (val === null) return;
      hasAnyUtm = true;

      // Skip dynamic macros
      if (DYNAMIC_MACRO_REGEX.test(val)) {
        findings.push({ type: "success", message: `Valid dynamic macro for ${p}`, param: p });
        return;
      }

      // Check for spaces
      if (val.includes(" ")) {
        findings.push({ type: "warning", message: `${p} contains spaces`, param: p });
        score -= 10;
      } else if (val !== toSnakeCase(val)) {
        // Check for snake_case / lowercase
        findings.push({ type: "warning", message: `${p} is not in clean snake_case`, param: p });
        score -= 10; // Increased penalty to trigger status change
      } else {
        findings.push({ type: "success", message: `${p} looks good`, param: p });
      }
    });

    // 3. Overall checks
    if (!hasAnyUtm) {
      // Overwrite findings if no UTMs at all
      return {
        score: 0,
        status: "error",
        findings: [{ type: "error", message: "No UTM parameters found" }],
        fixedUrl: url,
      };
    }

    // Fix the URL
    const fixedParams = new URL(url).searchParams;
    allParams.forEach((p) => {
      const val = fixedParams.get(p);
      if (val && !DYNAMIC_MACRO_REGEX.test(val)) {
        fixedParams.set(p, toSnakeCase(val));
      }
    });
    
    parsed.search = fixedParams.toString();
    fixedUrl = parsed.toString().replace(/\?$/, ""); // Clean up trailing ?

    // Final score clamping
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      status: score === 100 ? "healthy" : score >= 60 ? "warning" : "error",
      findings,
      fixedUrl,
    };
  } catch {
    return {
      score: 0,
      status: "error",
      findings: [{ type: "error", message: "Invalid URL format" }],
      fixedUrl: url,
    };
  }
}
