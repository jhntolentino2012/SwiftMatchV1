/**
 * Personality framework routing.
 *
 * Decides whether an applicant should take the DOPE Bird Test or the MBTI
 * test based on their industry, target role, and position tier.
 *
 * Rationale:
 *   • DOPE Bird = communication / interpersonal style. Best for
 *     customer-facing, collaborative, service, and creative roles.
 *   • MBTI = cognitive preferences and decision style. Best for
 *     analytical, strategic, technical roles and all leadership tiers.
 *
 * The decision pipeline:
 *   1. Leadership tier → always MBTI (strategic-cognitive insight wins).
 *   2. Strong role keyword → override industry default.
 *   3. Industry classification → fallback default.
 *   4. If industry+role unknown → fall back to tier (entry=DOPE, lead=MBTI).
 */

export type Framework = "DOPE" | "MBTI";
export type PositionTier = "entry" | "leadership";

export interface FrameworkRecommendation {
  framework: Framework;
  rationale: string;
  /** Which signal was decisive: "tier" | "role" | "industry" | "default". */
  source: "tier" | "role" | "industry" | "default";
}

/* ── Industry classification ─────────────────────────────────────────── */

const ANALYTICAL_INDUSTRIES = new Set<string>([
  "Technology / IT",
  "Finance / Banking",
  "Manufacturing & Engineering",
  "Legal & Compliance",
  "Architecture & Urban Planning",
  "Government & Public Sector",
  "Telecommunications",
]);

const PEOPLE_INDUSTRIES = new Set<string>([
  "BPO / Call Center",
  "Hospitality & Tourism",
  "Food & Beverage",
  "Retail & E-commerce",
  "Education & Training",
  "Human Resources",
  "Marketing / Advertising",
  "Creative Arts & Design",
  "Media & Entertainment",
  "Real Estate & Construction",
  "Logistics & Transportation",
  "Agriculture & Environment",
  "Healthcare / Medical",
]);

/* ── Role keyword overrides ─────────────────────────────────────────── */

// Keywords that strongly indicate analytical/strategic/technical work.
const MBTI_ROLE_KEYWORDS = [
  "engineer", "developer", "programmer", "architect", "analyst",
  "scientist", "researcher", "compliance", "auditor", "risk",
  "actuary", "treasury", "investment", "strategist", "consultant",
  "physician", "doctor", "radiologic", "pharmacist", "surveyor",
  "devops", "cybersecurity", "data", "qa", "test engineer",
];

// Keywords that strongly indicate people-facing / service work.
const DOPE_ROLE_KEYWORDS = [
  "sales", "agent", "representative", "teller", "nurse",
  "caregiver", "teacher", "instructor", "host", "server",
  "cashier", "stylist", "barista", "attendant", "coordinator",
  "customer service", "customer care", "service crew",
  "broker", "associate", "merchandiser", "trainer",
];

function matchesAny(text: string, keywords: string[]): string | null {
  for (const kw of keywords) if (text.includes(kw)) return kw;
  return null;
}

/* ── Public API ─────────────────────────────────────────────────────── */

export function recommendPersonalityFramework(input: {
  industry?: string | null;
  role?: string | null;
  tier: PositionTier;
}): FrameworkRecommendation {
  const { industry, role, tier } = input;

  // 1. Leadership always uses MBTI.
  if (tier === "leadership") {
    return {
      framework: "MBTI",
      rationale: "Leadership roles benefit from MBTI's cognitive-style depth across decision-making, strategy, and team dynamics.",
      source: "tier",
    };
  }

  const roleLC = (role ?? "").trim().toLowerCase();

  // 2. Strong role keyword wins (works even for entry tier).
  if (roleLC) {
    const mbtiKw = matchesAny(roleLC, MBTI_ROLE_KEYWORDS);
    if (mbtiKw) {
      return {
        framework: "MBTI",
        rationale: `Roles like ${role} reward analytical and structured thinking — MBTI maps your cognitive style more usefully here.`,
        source: "role",
      };
    }
    const dopeKw = matchesAny(roleLC, DOPE_ROLE_KEYWORDS);
    if (dopeKw) {
      return {
        framework: "DOPE",
        rationale: `${role} relies heavily on communication and team energy — the DOPE Bird Test surfaces those strengths directly.`,
        source: "role",
      };
    }
  }

  // 3. Industry-level fallback.
  if (industry) {
    if (ANALYTICAL_INDUSTRIES.has(industry)) {
      return {
        framework: "MBTI",
        rationale: `${industry} typically rewards analytical and strategic decision-making — MBTI is the better fit.`,
        source: "industry",
      };
    }
    if (PEOPLE_INDUSTRIES.has(industry)) {
      return {
        framework: "DOPE",
        rationale: `${industry} relies on interpersonal effectiveness and collaboration — the DOPE Bird Test is the better fit.`,
        source: "industry",
      };
    }
  }

  // 4. No industry/role context — default by tier (entry → DOPE).
  return {
    framework: "DOPE",
    rationale: "Showing the DOPE Bird Test by default — it's the right starting point for most individual-contributor roles.",
    source: "default",
  };
}
