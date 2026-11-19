/**
 * Business Enquiry Assistant — policy-first MVP core.
 *
 * This module deliberately does not call an LLM, send messages, or access
 * customer systems. It selects only owner-approved knowledge entries and
 * produces a reviewable draft. Unknown or sensitive requests are escalated.
 */

export interface ApprovedKnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  approved: boolean;
  updatedAt: string;
}

export interface EnquiryRequest {
  customerMessage: string;
  knowledge: ApprovedKnowledgeEntry[];
}

export type EscalationReason =
  | "no_reliable_approved_answer"
  | "sensitive_or_high_impact_request"
  | "possible_prompt_injection";

export interface EnquiryDraft {
  status: "draft_ready" | "needs_human";
  reply: string;
  sourceIds: string[];
  escalationReasons: EscalationReason[];
  autoSendAllowed: false;
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for",
  "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or",
  "our", "please", "the", "to", "we", "what", "when", "where", "which",
  "who", "with", "you", "your",
]);

function tokens(value: string): Set<string> {
  return new Set(
    value.toLowerCase().match(/[a-z0-9]+/g)?.filter(
      (word) => word.length > 1 && !STOP_WORDS.has(word),
    ) ?? [],
  );
}

function overlapScore(message: string, entry: ApprovedKnowledgeEntry): number {
  const queryTokens = tokens(message);
  const entryTokens = tokens(entry.question);
  if (queryTokens.size === 0 || entryTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of queryTokens) {
    if (entryTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(queryTokens.size, entryTokens.size);
}

function detectSensitiveRequest(message: string): boolean {
  return /\b(refund|chargeback|lawsuit|legal action|lawyer|medical advice|diagnos|emergency|password|credit card number|bank account|ssn|sin number|threat|harass|discriminat|cancel my contract)\b/i.test(message);
}

function detectPromptInjection(message: string): boolean {
  return /\b(ignore (all )?(previous|prior) instructions|reveal (the )?(system prompt|hidden instructions)|developer message|show me your secrets|override your rules|act as system)\b/i.test(message);
}

export function draftEnquiryReply(request: EnquiryRequest): EnquiryDraft {
  const message = request.customerMessage.trim();
  const escalationReasons: EscalationReason[] = [];

  if (!message) {
    return {
      status: "needs_human",
      reply: "A team member needs to review this enquiry before responding.",
      sourceIds: [],
      escalationReasons: ["no_reliable_approved_answer"],
      autoSendAllowed: false,
    };
  }

  if (detectSensitiveRequest(message)) {
    escalationReasons.push("sensitive_or_high_impact_request");
  }
  if (detectPromptInjection(message)) {
    escalationReasons.push("possible_prompt_injection");
  }

  const approved = request.knowledge.filter(
    (entry) =>
      entry.approved &&
      entry.id.trim().length > 0 &&
      entry.answer.trim().length > 0 &&
      entry.question.trim().length > 0,
  );

  const ranked = approved
    .map((entry) => ({ entry, score: overlapScore(message, entry) }))
    .filter((item) => item.score >= 0.25)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const ambiguous = best && ranked[1] && best.score - ranked[1].score < 0.08;

  if (!best || ambiguous) {
    escalationReasons.push("no_reliable_approved_answer");
  }

  if (escalationReasons.length > 0 || !best) {
    return {
      status: "needs_human",
      reply: "Thank you for contacting us. A team member will review your enquiry and get back to you.",
      sourceIds: [],
      escalationReasons: [...new Set(escalationReasons)],
      autoSendAllowed: false,
    };
  }

  return {
    status: "draft_ready",
    reply: best.entry.answer,
    sourceIds: [best.entry.id],
    escalationReasons: [],
    autoSendAllowed: false,
  };
}
