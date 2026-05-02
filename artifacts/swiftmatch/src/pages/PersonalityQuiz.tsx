import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CheckCircle,
  RotateCcw, Loader2, Heart, Star, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════
   POSITION LEVEL TIERS
══════════════════════════════════════════════════════ */
export type PositionTier = "entry" | "leadership";
const POSITION_OPTIONS: { label: string; sublabel: string; tier: PositionTier }[] = [
  { label: "Entry Level / Fresh Graduate",   sublabel: "0–2 years of experience, individual contributor",                      tier: "entry" },
  { label: "Associate / Junior Professional", sublabel: "2–4 years, still developing specialist skills",                       tier: "entry" },
  { label: "Senior / Experienced Specialist", sublabel: "5+ years, deep expertise, may mentor others",                         tier: "entry" },
  { label: "Team Leader / Supervisor",        sublabel: "Leads a small team, accountable for team output",                     tier: "leadership" },
  { label: "Manager / Department Head",       sublabel: "Manages multiple functions or a department",                          tier: "leadership" },
  { label: "Director / Executive / C-Suite",  sublabel: "Senior leadership, strategic scope",                                  tier: "leadership" },
];

/* ══════════════════════════════════════════════════════
   DOPE BIRD TEST  (Entry Level)
══════════════════════════════════════════════════════ */
type Bird = "Eagle" | "Peacock" | "Dove" | "Owl";

interface DopeQuestion {
  id: string;
  prompt: string;
  options: { text: string; bird: Bird }[];
}

const DOPE_QUESTIONS: DopeQuestion[] = [
  {
    id: "d01", prompt: "In a team meeting, you prefer to:",
    options: [
      { text: "Lead the discussion and make quick decisions", bird: "Eagle" },
      { text: "Energise the group and generate fresh ideas",  bird: "Peacock" },
      { text: "Listen carefully and ensure everyone is heard", bird: "Dove" },
      { text: "Analyse the data before offering a recommendation", bird: "Owl" },
    ],
  },
  {
    id: "d02", prompt: "When facing a challenge at work, you:",
    options: [
      { text: "Address it head-on immediately with a direct fix", bird: "Eagle" },
      { text: "Look for a creative, out-of-the-box approach",      bird: "Peacock" },
      { text: "Seek consensus with your team before acting",        bird: "Dove" },
      { text: "Research thoroughly before deciding",                bird: "Owl" },
    ],
  },
  {
    id: "d03", prompt: "Your manager would most likely describe you as:",
    options: [
      { text: "Results-driven and decisive",     bird: "Eagle" },
      { text: "Enthusiastic and inspiring",       bird: "Peacock" },
      { text: "Supportive and dependable",        bird: "Dove" },
      { text: "Careful and thorough",             bird: "Owl" },
    ],
  },
  {
    id: "d04", prompt: "When you receive a brand-new task, you:",
    options: [
      { text: "Prioritise it by impact and start right away",        bird: "Eagle" },
      { text: "Get excited and share your ideas with the team",       bird: "Peacock" },
      { text: "Check in with colleagues to align before beginning",   bird: "Dove" },
      { text: "Read all documentation first",                         bird: "Owl" },
    ],
  },
  {
    id: "d05", prompt: "Your ideal work environment is:",
    options: [
      { text: "Fast-paced with clear authority and measurable goals", bird: "Eagle" },
      { text: "Social, creative, and full of variety",                bird: "Peacock" },
      { text: "Stable, friendly, and collaborative",                  bird: "Dove" },
      { text: "Quiet, structured, and detail-focused",                bird: "Owl" },
    ],
  },
  {
    id: "d06", prompt: "When there is a conflict in the team, you:",
    options: [
      { text: "Address it directly and drive toward a resolution",   bird: "Eagle" },
      { text: "Use humour and creativity to ease the tension",        bird: "Peacock" },
      { text: "Act as the peacemaker and prioritise relationships",   bird: "Dove" },
      { text: "Identify the root cause and propose a logical fix",    bird: "Owl" },
    ],
  },
  {
    id: "d07", prompt: "The compliment that means most to you:",
    options: [
      { text: '"You always deliver results."',             bird: "Eagle" },
      { text: '"You make the whole team so energetic."',   bird: "Peacock" },
      { text: '"You are so kind and easy to work with."',  bird: "Dove" },
      { text: '"Your work is always accurate and well-researched."', bird: "Owl" },
    ],
  },
  {
    id: "d08", prompt: "Under pressure, you:",
    options: [
      { text: "Stay focused on the goal and push through",            bird: "Eagle" },
      { text: "Stay optimistic and rally the team",                    bird: "Peacock" },
      { text: "Seek support and reassurance from people you trust",    bird: "Dove" },
      { text: "Make a checklist and work through it methodically",     bird: "Owl" },
    ],
  },
  {
    id: "d09", prompt: "The role you naturally fall into on a project team:",
    options: [
      { text: "Project lead and decision-maker",   bird: "Eagle" },
      { text: "Ideas generator and spokesperson",  bird: "Peacock" },
      { text: "Supporter and team coordinator",    bird: "Dove" },
      { text: "Researcher and quality checker",    bird: "Owl" },
    ],
  },
  {
    id: "d10", prompt: "You feel most productive when:",
    options: [
      { text: "You have clear targets and full ownership",               bird: "Eagle" },
      { text: "You are collaborating and brainstorming with others",      bird: "Peacock" },
      { text: "The team is in harmony and everyone is aligned",           bird: "Dove" },
      { text: "You have time to plan carefully and execute precisely",    bird: "Owl" },
    ],
  },
  {
    id: "d11", prompt: "When learning a new skill or process, you prefer to:",
    options: [
      { text: "Jump in and learn by doing",                bird: "Eagle" },
      { text: "Attend a workshop and discuss with others", bird: "Peacock" },
      { text: "Shadow a colleague and learn together",     bird: "Dove" },
      { text: "Read the manual or documentation first",    bird: "Owl" },
    ],
  },
  {
    id: "d12", prompt: "Your biggest professional strength is:",
    options: [
      { text: "Getting things done under pressure",        bird: "Eagle" },
      { text: "Communicating and inspiring others",        bird: "Peacock" },
      { text: "Creating a positive, inclusive atmosphere", bird: "Dove" },
      { text: "Ensuring accuracy and high standards",      bird: "Owl" },
    ],
  },
];

const BIRD_META: Record<Bird, {
  emoji: string; tagline: string; color: string; bg: string; border: string;
  strengths: string[]; blind_spots: string[]; ideal_roles: string;
}> = {
  Eagle: {
    emoji: "🦅", tagline: "The Eagle — Dominant & Results-Driven",
    color: "text-red-700", bg: "bg-red-50", border: "border-red-200",
    strengths: ["Decisive under pressure", "Natural leader and delegator", "Highly goal-oriented", "Thrives in competitive environments"],
    blind_spots: ["May come across as too blunt or controlling", "Can overlook team morale in pursuit of results"],
    ideal_roles: "Operations, Sales Leadership, Project Management, Entrepreneurship",
  },
  Peacock: {
    emoji: "🦚", tagline: "The Peacock — Enthusiastic & Expressive",
    color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",
    strengths: ["Excellent communicator and presenter", "Motivates and inspires others", "Creative and idea-rich", "Builds relationships easily"],
    blind_spots: ["May struggle with follow-through on details", "Can be overly optimistic about timelines"],
    ideal_roles: "Marketing, PR, Sales, Training, Events, People Management",
  },
  Dove: {
    emoji: "🕊️", tagline: "The Dove — Caring & Harmonious",
    color: "text-green-700", bg: "bg-green-50", border: "border-green-200",
    strengths: ["Builds trust and loyalty in teams", "Patient and empathetic listener", "Consistent and reliable", "Excellent collaborator"],
    blind_spots: ["May avoid necessary conflict", "Can struggle to say no or push back assertively"],
    ideal_roles: "HR, Customer Care, Healthcare Support, Social Work, Team Coordination",
  },
  Owl: {
    emoji: "🦉", tagline: "The Owl — Analytical & Precise",
    color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
    strengths: ["Systematic thinker with attention to detail", "High standards for accuracy", "Thorough researcher and planner", "Risk-aware decision-maker"],
    blind_spots: ["Can get stuck in analysis paralysis", "May seem distant or overly critical"],
    ideal_roles: "Finance, Data Analytics, Engineering, Compliance, Research, IT",
  },
};

/* ══════════════════════════════════════════════════════
   MBTI TEST  (Leadership)
══════════════════════════════════════════════════════ */
type MBTIDim = "EI" | "SN" | "TF" | "JP";
interface MBTIQuestion {
  id: string;
  dim: MBTIDim;
  optionA: { text: string; letter: "E"|"S"|"T"|"J" };
  optionB: { text: string; letter: "I"|"N"|"F"|"P" };
}

const MBTI_QUESTIONS: MBTIQuestion[] = [
  // E / I
  { id:"ei1", dim:"EI", optionA:{text:"After a busy day of meetings, you recharge by catching up with colleagues or attending a social event.", letter:"E"}, optionB:{text:"After a busy day of meetings, you recharge by spending quiet time on your own.",letter:"I"} },
  { id:"ei2", dim:"EI", optionA:{text:"You do your best thinking when you talk ideas through out loud with others.",letter:"E"},               optionB:{text:"You do your best thinking when you first reflect quietly on your own.",letter:"I"} },
  { id:"ei3", dim:"EI", optionA:{text:"In group settings, you tend to speak up readily and enjoy being in the conversation.",letter:"E"},       optionB:{text:"In group settings, you observe first and contribute once you have something well-formed to say.",letter:"I"} },
  { id:"ei4", dim:"EI", optionA:{text:"You find it energising to engage with many different people throughout the workday.",letter:"E"},          optionB:{text:"You find deep, focused one-on-one conversations more energising than group interaction.",letter:"I"} },
  { id:"ei5", dim:"EI", optionA:{text:"When something is on your mind at work, you talk it through with a colleague right away.",letter:"E"},   optionB:{text:"When something is on your mind at work, you reflect privately before raising it with anyone.",letter:"I"} },
  // S / N
  { id:"sn1", dim:"SN", optionA:{text:"When solving a problem, you start with the concrete facts and details of the current situation.",letter:"S"}, optionB:{text:"When solving a problem, you start with patterns, trends, and what the situation implies for the future.",letter:"N"} },
  { id:"sn2", dim:"SN", optionA:{text:"Your team would say you focus most on what is practical and achievable right now.",letter:"S"},              optionB:{text:"Your team would say you focus most on what is possible and innovative over the long term.",letter:"N"} },
  { id:"sn3", dim:"SN", optionA:{text:"You trust more in your direct experience and proven processes than in untested ideas.",letter:"S"},          optionB:{text:"You trust more in your instincts and your ability to spot new opportunities and possibilities.",letter:"N"} },
  { id:"sn4", dim:"SN", optionA:{text:"When reviewing a business report, you focus primarily on specific numbers, facts, and outcomes.",letter:"S"}, optionB:{text:"When reviewing a business report, you focus primarily on the overall story, implications, and strategy.",letter:"N"} },
  { id:"sn5", dim:"SN", optionA:{text:"In planning sessions, you prefer to build on approaches that have already proven to work.",letter:"S"},       optionB:{text:"In planning sessions, you prefer to challenge assumptions and explore entirely new approaches.",letter:"N"} },
  // T / F
  { id:"tf1", dim:"TF", optionA:{text:"When a colleague is struggling, your first instinct is to help them think through the problem logically.",letter:"T"}, optionB:{text:"When a colleague is struggling, your first instinct is to acknowledge their feelings and offer emotional support.",letter:"F"} },
  { id:"tf2", dim:"TF", optionA:{text:"You make leadership decisions primarily on objective data and logical reasoning.",letter:"T"},                optionB:{text:"You make leadership decisions primarily by considering how each option will affect the people involved.",letter:"F"} },
  { id:"tf3", dim:"TF", optionA:{text:"When giving feedback, you tend to be direct and straightforward even if it is hard to hear.",letter:"T"},  optionB:{text:"When giving feedback, you carefully consider the person's feelings and frame it gently.",letter:"F"} },
  { id:"tf4", dim:"TF", optionA:{text:"In a disagreement, you are most persuaded by a well-reasoned, evidence-based argument.",letter:"T"},       optionB:{text:"In a disagreement, you are most persuaded by an appeal to shared values and human impact.",letter:"F"} },
  { id:"tf5", dim:"TF", optionA:{text:"You believe a good leader sets clear expectations and holds people accountable to results above all.",letter:"T"}, optionB:{text:"You believe a good leader builds genuine trust and deeply cares about each team member's wellbeing.",letter:"F"} },
  // J / P
  { id:"jp1", dim:"JP", optionA:{text:"When starting a project, you prefer a clear timeline, defined deliverables, and a structured plan from day one.",letter:"J"}, optionB:{text:"When starting a project, you prefer flexibility to adapt your approach as you learn more along the way.",letter:"P"} },
  { id:"jp2", dim:"JP", optionA:{text:"Your task list and workspace are typically well-organised, with priorities clearly defined.",letter:"J"},    optionB:{text:"Your task list adapts dynamically to whatever needs attention most at any given moment.",letter:"P"} },
  { id:"jp3", dim:"JP", optionA:{text:"You feel more comfortable once decisions are finalised and the plan is locked in.",letter:"J"},             optionB:{text:"You feel more comfortable when options are still open and the team can respond to new information.",letter:"P"} },
  { id:"jp4", dim:"JP", optionA:{text:"When managing multiple tasks, you stick to a schedule and complete one thing before moving to the next.",letter:"J"}, optionB:{text:"When managing multiple tasks, you juggle them fluidly and shift focus as the situation changes.",letter:"P"} },
  { id:"jp5", dim:"JP", optionA:{text:"You prefer to complete work well ahead of a deadline so you have time to review and refine.",letter:"J"},   optionB:{text:"You tend to work right up to the deadline, doing some of your best thinking under that final pressure.",letter:"P"} },
];

type MBTIType = string; // e.g. "INTJ"
const MBTI_META: Record<MBTIType, { tagline: string; summary: string; strengths: string[]; growth: string }> = {
  ISTJ:{ tagline:"The Inspector — Reliable & Systematic",         summary:"Methodical, loyal, and thorough. Excellent at upholding standards and delivering consistent, high-quality work.", strengths:["Detail-oriented","Dependable","Organised","Duty-driven"], growth:"Embrace flexibility and new approaches when the situation evolves." },
  ISFJ:{ tagline:"The Protector — Caring & Diligent",            summary:"Warm, responsible, and conscientious. Dedicated to supporting others and maintaining harmony while meeting high standards.", strengths:["Empathetic","Supportive","Precise","Loyal"], growth:"Assert your own needs and ideas more confidently in leadership settings." },
  INFJ:{ tagline:"The Counsellor — Visionary & Empathetic",      summary:"Idealistic and insightful, with a rare blend of vision and compassion. Excellent at inspiring teams toward a meaningful mission.", strengths:["Empathetic","Strategic","Principled","Inspiring"], growth:"Balance long-term vision with the practical realities of execution." },
  INTJ:{ tagline:"The Architect — Strategic & Independent",      summary:"Highly analytical, confident, and visionary. Builds innovative systems and long-term strategies with precision and independence.", strengths:["Strategic thinker","Independent","Decisive","High standards"], growth:"Involve your team more and remain open to perspectives that challenge your framework." },
  ISTP:{ tagline:"The Craftsman — Calm & Resourceful",           summary:"Practical, observant, and excels at solving complex problems efficiently. Thrives in hands-on, technical environments.", strengths:["Problem-solver","Adaptable","Logical","Efficient"], growth:"Communicate your reasoning more openly and invest in relationship-building." },
  ISFP:{ tagline:"The Composer — Gentle & Authentic",            summary:"Quiet, creative, and deeply values-driven. Leads through inspiration and genuine care rather than authority.", strengths:["Creative","Empathetic","Flexible","Authentic"], growth:"Build confidence in direct communication and long-range strategic planning." },
  INFP:{ tagline:"The Mediator — Idealistic & Compassionate",    summary:"Deeply values-aligned, creative, and caring. Seeks meaning in work and inspires others through authentic commitment to a cause.", strengths:["Empathetic","Creative","Open-minded","Principled"], growth:"Develop resilience in conflict and translate ideals into actionable plans." },
  INTP:{ tagline:"The Thinker — Logical & Inventive",            summary:"Analytical, curious, and constantly refining ideas. Excellent at identifying inefficiencies and designing innovative solutions.", strengths:["Analytical","Inventive","Objective","Intellectually rigorous"], growth:"Follow through on execution and develop stronger interpersonal communication skills." },
  ESTP:{ tagline:"The Dynamo — Bold & Pragmatic",                summary:"Energetic, action-oriented, and thrives in fast-moving, high-pressure environments. Excellent at reading people and closing deals.", strengths:["Decisive","Adaptable","Persuasive","Resourceful"], growth:"Develop patience for planning and consider the long-term impact of quick decisions." },
  ESFP:{ tagline:"The Performer — Enthusiastic & Spontaneous",   summary:"Warm, sociable, and fun-loving. Brings energy and enthusiasm to every team and creates environments where people feel valued.", strengths:["Energetic","Collaborative","Empathetic","Adaptable"], growth:"Build structure and long-term planning into your natural spontaneity." },
  ENFP:{ tagline:"The Champion — Creative & Inspiring",          summary:"Optimistic, enthusiastic, and full of ideas. An exceptional motivator who connects deeply with people and drives transformative change.", strengths:["Creative","Inspiring","Empathetic","Visionary"], growth:"Channel your energy into sustained follow-through and detailed execution." },
  ENTP:{ tagline:"The Debater — Innovative & Analytical",        summary:"Sharp, inventive, and challenges the status quo. Loves solving problems no one else has thought of and thrives in debate.", strengths:["Innovative","Strategic","Adaptable","Persuasive"], growth:"Develop follow-through discipline and sensitivity to how debates land emotionally with others." },
  ESTJ:{ tagline:"The Director — Organised & Decisive",          summary:"Practical, decisive, and dependable. An excellent executor who brings order, clarity, and efficiency to any organisation.", strengths:["Organised","Decisive","Reliable","Results-focused"], growth:"Allow more flexibility and create space for creative, unconventional input from your team." },
  ESFJ:{ tagline:"The Provider — Warm & Structured",             summary:"Caring, responsible, and highly attuned to people's needs. Creates cohesive, supportive teams with clear expectations and strong morale.", strengths:["Empathetic","Loyal","Organised","Team-oriented"], growth:"Handle criticism more objectively and stand firm on decisions that serve the greater good." },
  ENFJ:{ tagline:"The Teacher — Charismatic & Principled",       summary:"Warm, inspirational, and mission-driven. A natural people-developer who creates loyalty and draws out the best in every team member.", strengths:["Inspiring","Empathetic","Visionary","Organised"], growth:"Set healthy boundaries and ensure strategic goals don't get lost in people management." },
  ENTJ:{ tagline:"The Commander — Strategic & Bold",             summary:"Natural leader with a commanding vision and a drive for excellence. Strategically sharp, decisive, and exceptional at mobilising people toward ambitious goals.", strengths:["Strategic","Decisive","Confident","High-performer"], growth:"Cultivate patience, active listening, and emotional attunement as equally important leadership strengths." },
};

const DIM_LABELS: Record<MBTIDim, [string, string]> = {
  EI: ["Extraversion (E)", "Introversion (I)"],
  SN: ["Sensing (S)", "Intuition (N)"],
  TF: ["Thinking (T)", "Feeling (F)"],
  JP: ["Judging (J)", "Perceiving (P)"],
};

/* ══════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════ */
type Phase = "select-level" | "quiz" | "result";

interface Props {
  applicantId?: number | null;
  onComplete?: (result: string) => void;
  onBack?: () => void;
}

export default function PersonalityQuiz({ applicantId, onComplete, onBack }: Props) {
  const [phase, setPhase]               = useState<Phase>("select-level");
  const [tier, setTier]                 = useState<PositionTier | null>(null);
  const [positionLabel, setPositionLabel] = useState<string>("");
  const [current, setCurrent]           = useState(0);
  const [dopeAnswers, setDopeAnswers]   = useState<Record<string, Bird>>({});
  const [mbtiAnswers, setMbtiAnswers]   = useState<Record<string, "A" | "B">>({});
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [dopeResult, setDopeResult]     = useState<{ primary: Bird; secondary: Bird; scores: Record<Bird, number> } | null>(null);
  const [mbtiResult, setMbtiResult]     = useState<{ type: MBTIType; scores: Record<MBTIDim, { A: number; B: number }> } | null>(null);

  const savedLevel = localStorage.getItem(`sm_personality_level_${applicantId ?? "guest"}`);

  function startQuiz(option: typeof POSITION_OPTIONS[0]) {
    setTier(option.tier);
    setPositionLabel(option.label);
    localStorage.setItem(`sm_personality_level_${applicantId ?? "guest"}`, option.label);
    setCurrent(0);
    setDopeAnswers({});
    setMbtiAnswers({});
    setPhase("quiz");
  }

  const questions = tier === "entry" ? DOPE_QUESTIONS : MBTI_QUESTIONS;
  const totalQ    = questions.length;

  function answerDope(qId: string, bird: Bird) {
    setDopeAnswers(prev => ({ ...prev, [qId]: bird }));
  }

  function answerMbti(qId: string, choice: "A" | "B") {
    setMbtiAnswers(prev => ({ ...prev, [qId]: choice }));
  }

  async function submitQuiz() {
    setSubmitting(true);
    let resultLabel = "";

    if (tier === "entry") {
      const scores: Record<Bird, number> = { Eagle: 0, Peacock: 0, Dove: 0, Owl: 0 };
      for (const q of DOPE_QUESTIONS) {
        const ans = dopeAnswers[q.id];
        if (ans) scores[ans]++;
      }
      const sorted = (Object.entries(scores) as [Bird, number][]).sort((a, b) => b[1] - a[1]);
      setDopeResult({ primary: sorted[0][0], secondary: sorted[1][0], scores });
      resultLabel = `${sorted[0][0]} (DOPE)`;
    } else {
      const dimScores: Record<MBTIDim, { A: number; B: number }> = {
        EI: { A: 0, B: 0 }, SN: { A: 0, B: 0 }, TF: { A: 0, B: 0 }, JP: { A: 0, B: 0 },
      };
      for (const q of MBTI_QUESTIONS) {
        const ans = mbtiAnswers[q.id];
        if (ans) dimScores[q.dim][ans]++;
      }
      const E = dimScores.EI.A >= dimScores.EI.B ? "E" : "I";
      const S = dimScores.SN.A >= dimScores.SN.B ? "S" : "N";
      const T = dimScores.TF.A >= dimScores.TF.B ? "T" : "F";
      const J = dimScores.JP.A >= dimScores.JP.B ? "J" : "P";
      const mbtiType = `${E}${S}${T}${J}`;
      setMbtiResult({ type: mbtiType, scores: dimScores });
      resultLabel = `${mbtiType} (MBTI)`;
    }

    // Persist to API
    if (applicantId) {
      try {
        const resp = await fetch("/api/assessments/personality/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicantId, positionLabel, tier, result: resultLabel, answers: tier === "entry" ? dopeAnswers : mbtiAnswers }),
        });
        if (resp.status === 429) {
          const body = await resp.json().catch(() => ({}));
          const availDate = body.retakeAvailableAt
            ? new Date(body.retakeAvailableAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
            : "in 1 month";
          setSubmitError(`Retake cooldown active — available from ${availDate}.`);
          setSubmitting(false);
          return;
        }
      } catch {}
    }
    setSubmitError(null);
    setPhase("result");
    setSubmitting(false);
    onComplete?.(resultLabel);
  }

  /* ── LEVEL SELECTOR ── */
  if (phase === "select-level") {
    return (
      <div className="space-y-6">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Evaluations
          </button>
        )}
        <div>
          <h2 className="text-xl font-display font-bold text-primary mb-1">Personality & Work Style</h2>
          <p className="text-sm text-muted-foreground">
            Select the level that best describes your current or target position. This determines which personality framework is used.
          </p>
        </div>

        {savedLevel && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Last: <strong>{savedLevel}</strong></span>
          </div>
        )}

        <div className="space-y-3">
          {POSITION_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => startQuiz(opt)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-2xl border text-sm transition-all group",
                "border-slate-200 hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary group-hover:text-primary">{opt.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.sublabel}</p>
                </div>
                <div className="shrink-0">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                    opt.tier === "entry"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {opt.tier === "entry" ? "DOPE Test" : "MBTI Test"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs font-bold text-amber-700 mb-1">🐦 DOPE Bird Test (Entry–Senior)</p>
            <p className="text-xs text-amber-800">12 questions. Identifies your primary bird personality — Eagle, Peacock, Dove, or Owl — and what it means for your work style.</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-xs font-bold text-blue-700 mb-1">🔬 Myers-Briggs MBTI (Leadership)</p>
            <p className="text-xs text-blue-800">20 questions. Determines your 4-letter MBTI type across 4 dimensions — used by Fortune 500 companies for leadership development.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT SCREEN ── */
  if (phase === "result") {
    if (tier === "entry" && dopeResult) {
      const meta = BIRD_META[dopeResult.primary];
      const secMeta = BIRD_META[dopeResult.secondary];
      const totalAnswered = Object.keys(dopeAnswers).length;
      return (
        <div className="space-y-6 max-w-xl mx-auto">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Evaluations
            </button>
          )}

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={cn("rounded-2xl border p-6 text-center", meta.bg, meta.border)}>
            <div className="text-6xl mb-3">{meta.emoji}</div>
            <div className={cn("text-xl font-display font-bold", meta.color)}>{meta.tagline}</div>
            <div className="text-sm text-slate-500 mt-1">{positionLabel}</div>
          </motion.div>

          <div className="grid grid-cols-4 gap-2">
            {(["Eagle","Peacock","Dove","Owl"] as Bird[]).map(bird => {
              const bm = BIRD_META[bird];
              const score = dopeResult.scores[bird];
              const pct = Math.round((score / totalAnswered) * 100);
              return (
                <div key={bird} className={cn("rounded-xl p-3 text-center border", bm.bg, bm.border)}>
                  <div className="text-2xl mb-1">{bm.emoji}</div>
                  <div className={cn("text-xs font-bold", bm.color)}>{bird}</div>
                  <div className={cn("text-lg font-display font-bold", bm.color)}>{pct}%</div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Core Strengths</p>
              <div className="flex flex-wrap gap-2">
                {meta.strengths.map(s => (
                  <span key={s} className={cn("text-xs font-semibold px-2 py-1 rounded-full", meta.bg, meta.color)}>{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Growth Areas</p>
              <ul className="space-y-1">
                {meta.blind_spots.map(b => (
                  <li key={b} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Ideal Role Environments</p>
              <p className="text-xs text-slate-600">{meta.ideal_roles}</p>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Secondary Type: {dopeResult.secondary} {secMeta.emoji}</p>
              <p className="text-xs text-slate-500">{secMeta.tagline}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => { setPhase("select-level"); setDopeResult(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors">
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
            {onBack && (
              <button onClick={onBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                <CheckCircle className="w-4 h-4" /> Done
              </button>
            )}
          </div>
        </div>
      );
    }

    if (tier === "leadership" && mbtiResult) {
      const meta = MBTI_META[mbtiResult.type] ?? {
        tagline: `${mbtiResult.type} — Unique Leadership Profile`,
        summary: "A distinctive blend of leadership traits.",
        strengths: ["Strategic", "Adaptable", "Insightful", "Results-oriented"],
        growth: "Continue developing self-awareness and team empathy.",
      };
      const totalPerDim = 5;
      return (
        <div className="space-y-6 max-w-xl mx-auto">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Evaluations
            </button>
          )}

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
            <div className="text-5xl font-display font-bold text-blue-700 tracking-widest mb-2">{mbtiResult.type}</div>
            <div className="text-lg font-display font-bold text-blue-800">{meta.tagline}</div>
            <div className="text-sm text-slate-500 mt-1">{positionLabel}</div>
          </motion.div>

          <p className="text-sm text-slate-600 leading-relaxed">{meta.summary}</p>

          <div className="space-y-3">
            {(["EI","SN","TF","JP"] as MBTIDim[]).map(dim => {
              const sc = mbtiResult.scores[dim];
              const [labelA, labelB] = DIM_LABELS[dim];
              const dominantA = sc.A >= sc.B;
              const pctA = Math.round((sc.A / totalPerDim) * 100);
              const pctB = 100 - pctA;
              return (
                <div key={dim} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                    <span className={dominantA ? "text-blue-700 font-bold" : ""}>{labelA}</span>
                    <span className={!dominantA ? "text-blue-700 font-bold" : ""}>{labelB}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pctA}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{pctA}%</span>
                    <span>{pctB}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Leadership Strengths</p>
              <div className="flex flex-wrap gap-2">
                {meta.strengths.map(s => (
                  <span key={s} className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Growth Focus</p>
              <p className="text-xs text-slate-600">{meta.growth}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => { setPhase("select-level"); setMbtiResult(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors">
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
            {onBack && (
              <button onClick={onBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                <CheckCircle className="w-4 h-4" /> Done
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  /* ── QUIZ ── */
  const answered = tier === "entry"
    ? Object.keys(dopeAnswers).length
    : Object.keys(mbtiAnswers).length;
  const allAnswered = answered === totalQ;
  const progress    = ((current + 1) / totalQ) * 100;

  if (tier === "entry") {
    const dq = DOPE_QUESTIONS[current];
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-amber-600">DOPE Bird Test · {positionLabel}</span>
              <span className="text-xs text-muted-foreground">{current + 1} / {totalQ}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-amber-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={dq.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4">
              <p className="text-xs text-slate-400 mb-1">Question {current + 1} of {totalQ}</p>
              <p className="text-base font-semibold text-primary">{dq.prompt}</p>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {dq.options.map((opt, i) => {
                const selected = dopeAnswers[dq.id] === opt.bird;
                return (
                  <button key={i} onClick={() => answerDope(dq.id, opt.bird)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all",
                      selected ? "border-amber-400 bg-amber-50 text-amber-800 font-semibold" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                    )}>
                    <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-30 hover:border-primary/40 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {DOPE_QUESTIONS.map((q2, i) => (
              <button key={q2.id} onClick={() => setCurrent(i)}
                className={cn("w-2 h-2 rounded-full transition-all",
                  i === current ? "bg-amber-500 scale-125" : dopeAnswers[q2.id] ? "bg-amber-400/70" : "bg-slate-300")} />
            ))}
          </div>

          {current < totalQ - 1 ? (
            <button onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submitQuiz} disabled={submitting || !allAnswered}
              className={cn("flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-colors",
                allAnswered && !submitting ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {submitting ? "Scoring…" : "See My Result"}
            </button>
          )}
        </div>
        {current === totalQ - 1 && !allAnswered && (
          <p className="text-center text-xs text-amber-600">
            {totalQ - answered} question{totalQ - answered !== 1 ? "s" : ""} remaining
          </p>
        )}
        {submitError && (
          <p className="text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {submitError}
          </p>
        )}
      </div>
    );
  }

  // MBTI quiz
  const mq = MBTI_QUESTIONS[current];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-semibold text-blue-600">Myers-Briggs MBTI · {positionLabel}</span>
            <span className="text-xs text-muted-foreground">{current + 1} / {totalQ}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mq.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-3">
              <Heart className="w-3 h-3" /> {DIM_LABELS[mq.dim][0].split(" ")[0]} vs {DIM_LABELS[mq.dim][1].split(" ")[0]}
            </div>
            <p className="text-sm text-slate-500 font-medium mb-3">Which statement resonates more with you?</p>
          </div>
          <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
            {([
              { key: "A", text: mq.optionA.text, letter: mq.optionA.letter },
              { key: "B", text: mq.optionB.text, letter: mq.optionB.letter },
            ] as const).map(opt => {
              const selected = mbtiAnswers[mq.id] === opt.key;
              return (
                <button key={opt.key} onClick={() => answerMbti(mq.id, opt.key)}
                  className={cn(
                    "text-left px-4 py-4 rounded-xl border text-sm transition-all leading-relaxed h-full",
                    selected ? "border-blue-400 bg-blue-50 text-blue-800 font-semibold" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                  )}>
                  <span className={cn("block text-[10px] font-bold uppercase tracking-widest mb-2", selected ? "text-blue-500" : "text-slate-400")}>
                    Option {opt.key} · {opt.letter}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-30 hover:border-primary/40 hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-1 flex-wrap justify-center max-w-[240px]">
          {MBTI_QUESTIONS.map((q2, i) => (
            <button key={q2.id} onClick={() => setCurrent(i)}
              className={cn("w-1.5 h-1.5 rounded-full transition-all",
                i === current ? "bg-blue-600 scale-150" : mbtiAnswers[q2.id] ? "bg-blue-400" : "bg-slate-300")} />
          ))}
        </div>

        {current < totalQ - 1 ? (
          <button onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submitQuiz} disabled={submitting || !allAnswered}
            className={cn("flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-colors",
              allAnswered && !submitting ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {submitting ? "Scoring…" : "See My MBTI Type"}
          </button>
        )}
      </div>
      {current === totalQ - 1 && !allAnswered && (
        <p className="text-center text-xs text-blue-600">
          {totalQ - answered} question{totalQ - answered !== 1 ? "s" : ""} remaining
        </p>
      )}
      {submitError && (
        <p className="text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {submitError}
        </p>
      )}
    </div>
  );
}
